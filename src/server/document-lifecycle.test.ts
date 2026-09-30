import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
  type Db,
} from '@/test/supabase'

/**
 * Que lo firmado quede firmado, y que lo clínico no se pueda borrar.
 *
 * Contra Postgres de verdad, como `document-versions.test.ts`: las reglas viven
 * en un trigger, en las políticas y en los permisos (migración
 * `20260930020950`), y un doble no tiene ninguna de las tres. Muchos casos van
 * directo por PostgREST con la sesión de la profesional y no por las funciones
 * de `src/server/`, a propósito: lo que se prueba es que ni siquiera saltearse
 * la aplicación alcanza.
 *
 * Necesita el stack local levantado (`npm run db:start`).
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

const { signDocument, reopenDocument, voidDocument, wasEverSigned, DocumentLifecycleError } =
  await import('./document-lifecycle')
const { listVersions } = await import('./document-versions')
const { updateReportContent } = await import('./reports')
const { trashRecord, restoreRecord, listTrash } = await import('./trash')

const service = serviceClient()
const email = testEmail('firma')
const otherEmail = testEmail('firma-ajena')

let practitionerId = ''
let otherId = ''
let patientId = ''
let asMe: Db
let asOther: Db

async function newReport(content = 'Antecedentes:\nLlega derivada del colegio.') {
  const { data, error } = await service
    .from('reports')
    .insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      recipient: 'school',
      title: 'Informe de prueba',
      content,
    })
    .select()
    .single()
  if (error) throw error
  return data.id
}

async function reportRow(reportId: string) {
  const { data } = await service.from('reports').select('*').eq('id', reportId).single()
  return data!
}

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Firma Prueba')
  otherId = await createTestPractitioner(otherEmail, 'Ajena Prueba')
  asMe = await signedInAs(email)
  asOther = await signedInAs(otherEmail)
  holder.db = asMe
  holder.service = service

  const { data, error } = await service
    .from('patients')
    .insert({ practitioner_id: practitionerId, full_name: 'Lola Prueba' })
    .select()
    .single()
  if (error) throw error
  patientId = data.id
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
  await deleteTestPractitioner(otherId)
})

describe('firmar', () => {
  it('congela el texto con la hora de la base y deja una copia firmada', async () => {
    const reportId = await newReport()
    const before = Date.now()

    const signedAt = await signDocument(practitionerId, 'report', reportId)

    expect(signedAt).not.toBeNull()
    expect(new Date(signedAt!).getTime()).toBeGreaterThanOrEqual(before - 5_000)

    const versions = await listVersions(practitionerId, 'report', reportId)
    expect(versions[0]?.replaced_by).toBe('signed')
    expect(versions[0]?.body).toBe('Antecedentes:\nLlega derivada del colegio.')
    expect(versions[0]?.signed_at).toBe(signedAt)
    expect(await wasEverSigned(practitionerId, 'report', reportId)).toBe(true)
  })

  it('no deja cambiar el texto de un documento firmado, por ningún camino', async () => {
    const reportId = await newReport()
    await signDocument(practitionerId, 'report', reportId)

    await expect(
      updateReportContent(practitionerId, reportId, 'Otra cosa.', 'edit'),
    ).rejects.toThrow()

    const { error } = await asMe.from('reports').update({ content: 'Otra cosa.' }).eq('id', reportId)
    expect(error?.hint).toBe('document_signed')
    expect((await reportRow(reportId)).content).toBe('Antecedentes:\nLlega derivada del colegio.')
  })

  it('no deja fechar una firma en el pasado', async () => {
    const reportId = await newReport()

    await asMe.from('reports').update({ signed_at: '2020-01-01T00:00:00Z' }).eq('id', reportId)
    const signed = (await reportRow(reportId)).signed_at!
    expect(new Date(signed).getFullYear()).toBeGreaterThan(2020)

    await asMe.from('reports').update({ signed_at: '2020-01-01T00:00:00Z' }).eq('id', reportId)
    expect((await reportRow(reportId)).signed_at).toBe(signed)
  })

  it('un documento nace borrador aunque lo inserten firmado', async () => {
    const { data } = await asMe
      .from('reports')
      .insert({
        practitioner_id: practitionerId,
        patient_id: patientId,
        recipient: 'school',
        title: 'Colado',
        content: 'Algo.',
        signed_at: '2020-01-01T00:00:00Z',
      })
      .select()
      .single()

    expect(data?.signed_at).toBeNull()
  })

  it('no firma un borrador que todavía dice [A completar]', async () => {
    const reportId = await newReport('Recomendaciones:\n[A completar]')

    await expect(signDocument(practitionerId, 'report', reportId)).rejects.toBeInstanceOf(
      DocumentLifecycleError,
    )
    expect((await reportRow(reportId)).signed_at).toBeNull()
  })

  it('nadie fabrica una versión firmada a mano', async () => {
    const reportId = await newReport()

    const { error } = await asMe.from('document_versions').insert({
      practitioner_id: practitionerId,
      report_id: reportId,
      body: 'Lo que nunca se firmó.',
      replaced_by: 'signed',
      signed_at: '2020-01-01T00:00:00Z',
    })

    expect(error).not.toBeNull()
    expect(await wasEverSigned(practitionerId, 'report', reportId)).toBe(false)
  })
})

describe('corregir', () => {
  it('vuelve a borrador y lo firmado queda en el historial', async () => {
    const reportId = await newReport('Primera entrega.')
    await signDocument(practitionerId, 'report', reportId)

    await reopenDocument(practitionerId, 'report', reportId)
    await updateReportContent(practitionerId, reportId, 'Corregido.', 'edit')
    await signDocument(practitionerId, 'report', reportId)

    const signed = (await listVersions(practitionerId, 'report', reportId)).filter(
      (version) => version.replaced_by === 'signed',
    )
    expect(signed.map((version) => version.body)).toEqual(['Corregido.', 'Primera entrega.'])
  })
})

describe('anular', () => {
  it('sólo lo que se firmó, y con motivo', async () => {
    const draftId = await newReport()
    await expect(
      voidDocument(practitionerId, 'report', draftId, 'Me equivoqué'),
    ).rejects.toBeInstanceOf(DocumentLifecycleError)

    const reportId = await newReport()
    await signDocument(practitionerId, 'report', reportId)
    await expect(voidDocument(practitionerId, 'report', reportId, '')).rejects.toThrow()

    await voidDocument(practitionerId, 'report', reportId, 'Se emitió con datos de otro período')
    const row = await reportRow(reportId)
    expect(row.voided_at).not.toBeNull()
    expect(row.void_reason).toBe('Se emitió con datos de otro período')
  })

  it('es definitivo: no se corrige, no se refirma, no cambia el motivo', async () => {
    const reportId = await newReport()
    await signDocument(practitionerId, 'report', reportId)
    await voidDocument(practitionerId, 'report', reportId, 'Duplicado')

    await expect(reopenDocument(practitionerId, 'report', reportId)).rejects.toBeInstanceOf(
      DocumentLifecycleError,
    )
    const { error } = await asMe
      .from('reports')
      .update({ void_reason: 'Otro motivo', voided_at: null })
      .eq('id', reportId)
    expect(error?.hint).toBe('document_voided')
  })
})

describe('la papelera', () => {
  it('esconde un borrador de todas las lecturas y lo devuelve al recuperarlo', async () => {
    const reportId = await newReport()

    expect(await trashRecord(practitionerId, 'report', reportId)).toBe(true)

    const { data: hidden } = await asMe.from('reports').select('id').eq('id', reportId)
    expect(hidden).toEqual([])

    const trash = await listTrash(practitionerId, patientId)
    expect(trash.some((item) => item.id === reportId && item.kind === 'report')).toBe(true)

    expect(await restoreRecord(practitionerId, 'report', reportId)).toBe(true)
    const { data: back } = await asMe.from('reports').select('id').eq('id', reportId)
    expect(back).toHaveLength(1)
  })

  it('no acepta algo que se firmó alguna vez', async () => {
    const reportId = await newReport()
    await signDocument(practitionerId, 'report', reportId)
    await reopenDocument(practitionerId, 'report', reportId)

    await expect(trashRecord(practitionerId, 'report', reportId)).rejects.toBeInstanceOf(
      DocumentLifecycleError,
    )
  })

  it('no deja actualizar lo que está en la papelera por la puerta de atrás', async () => {
    const reportId = await newReport()
    await trashRecord(practitionerId, 'report', reportId)

    const { data } = await asMe
      .from('reports')
      .update({ content: 'Editado a escondidas.' })
      .eq('id', reportId)
      .select()
    expect(data ?? []).toEqual([])
  })

  it('no toca lo de otra profesional', async () => {
    const reportId = await newReport()

    holder.db = asOther
    try {
      expect(await trashRecord(otherId, 'report', reportId)).toBe(false)
      expect(await listTrash(otherId, patientId)).toEqual([])
    } finally {
      holder.db = asMe
    }

    await trashRecord(practitionerId, 'report', reportId)
    holder.db = asOther
    try {
      expect(await restoreRecord(otherId, 'report', reportId)).toBe(false)
    } finally {
      holder.db = asMe
    }
  })

  it('una sesión en la papelera libera su cita, y al volver no pisa la nueva', async () => {
    const { data: appointment, error } = await service
      .from('appointments')
      .insert({
        practitioner_id: practitionerId,
        patient_id: patientId,
        scheduled_on: '2026-09-01',
        start_time: '10:00',
        duration_minutes: 45,
      })
      .select()
      .single()
    if (error) throw error

    const newSession = async () => {
      const { data, error } = await service
        .from('sessions')
        .insert({
          practitioner_id: practitionerId,
          patient_id: patientId,
          appointment_id: appointment!.id,
          held_on: '2026-09-01',
          progress_note: 'Trabajamos /r/.',
        })
        .select()
        .single()
      if (error) throw error
      return data.id
    }

    const first = await newSession()
    await trashRecord(practitionerId, 'session', first)
    const second = await newSession()

    await restoreRecord(practitionerId, 'session', first)

    const { data: rows } = await service
      .from('sessions')
      .select('id, appointment_id, deleted_at')
      .in('id', [first, second])
    const byId = Object.fromEntries((rows ?? []).map((row) => [row.id, row]))
    expect(byId[first]?.deleted_at).toBeNull()
    expect(byId[first]?.appointment_id).toBeNull()
    expect(byId[second]?.appointment_id).toBe(appointment!.id)
  })
})

describe('la base no deja borrar historia clínica', () => {
  it.each(['patients', 'reports', 'sessions', 'payments', 'consents', 'document_versions'] as const)(
    '%s no se borra con la sesión de la profesional',
    async (table) => {
      const { error } = await asMe.from(table).delete().eq('practitioner_id', practitionerId)
      expect(error).not.toBeNull()
    },
  )

  it('las versiones no se editan', async () => {
    const reportId = await newReport()
    await updateReportContent(practitionerId, reportId, 'Nuevo.', 'edit')

    const { error } = await asMe
      .from('document_versions')
      .update({ body: 'Reescrito.' })
      .eq('report_id', reportId)
    expect(error).not.toBeNull()
  })
})
