import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Que ninguna escritura pise el texto de un documento clínico sin dejar copia.
 *
 * Contra Postgres de verdad y a través de las funciones reales, como
 * `patients.archive.test.ts`, y por la misma razón: lo que se prueba acá es una
 * promesa sobre filas —que la anterior queda, que la cascada se la lleva cuando
 * corresponde, que la de al lado no se ve— y eso no se puede probar contra un
 * doble, porque un doble no tiene ni claves foráneas ni RLS.
 *
 * Necesita el stack local levantado (`npm run db:start`).
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

const { listVersions, restoreVersion } = await import('./document-versions')
const { updateReportContent } = await import('./reports')
const { updateAssessmentAnalysis } = await import('./assessments')

const service = serviceClient()
const email = testEmail('versiones')
const otherEmail = testEmail('versiones-ajena')

let practitionerId = ''
let otherId = ''
let patientId = ''

async function newReport(content: string) {
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

async function newAssessment(analysis: string) {
  const { data, error } = await service
    .from('assessments')
    .insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      instrument: 'Instrumento de prueba',
      analysis,
    })
    .select()
    .single()
  if (error) throw error
  return data.id
}

async function reportContent(reportId: string) {
  const { data } = await service.from('reports').select('content').eq('id', reportId).single()
  return data?.content ?? null
}

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Versiones Prueba')
  otherId = await createTestPractitioner(otherEmail, 'Ajena Prueba')
  holder.db = await signedInAs(email)
  holder.service = service

  const { data, error } = await service
    .from('patients')
    .insert({ practitioner_id: practitionerId, full_name: 'Martina Prueba' })
    .select()
    .single()
  if (error) throw error
  patientId = data.id
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
  await deleteTestPractitioner(otherId)
})

describe('el historial de un documento', () => {
  it('guarda lo que decía antes, no lo que dice ahora', async () => {
    // El caso de P19: había un informe escrito y algo lo reemplaza. Sin el
    // arreglo, `updateReportContent` hacía el `update` a secas y el texto viejo
    // no quedaba en ningún lado.
    const escrito = 'Antecedentes:\nLlega derivada del colegio. Asiste desde marzo.'
    const reportId = await newReport(escrito)

    await updateReportContent(practitionerId, reportId, 'Otra cosa completamente distinta.', 'ai')

    const versions = await listVersions(practitionerId, 'report', reportId)
    expect(versions).toHaveLength(1)
    expect(versions[0]?.body).toBe(escrito)
    expect(versions[0]?.replaced_by).toBe('ai')
    expect(await reportContent(reportId)).toBe('Otra cosa completamente distinta.')
  })

  it('distingue quién reemplazó: la IA o la mano', async () => {
    const reportId = await newReport('Primera versión.')

    await updateReportContent(practitionerId, reportId, 'Segunda.', 'ai')
    await updateReportContent(practitionerId, reportId, 'Tercera.', 'edit')

    const versions = await listVersions(practitionerId, 'report', reportId)
    expect(versions.map((version) => version.replaced_by)).toEqual(['edit', 'ai'])
    // La más nueva primero: la lista se lee de arriba hacia atrás en el tiempo.
    expect(versions[0]?.body).toBe('Segunda.')
    expect(versions[1]?.body).toBe('Primera versión.')
  })

  it('no guarda una versión cuando el texto no cambió', async () => {
    // Pasa seguido: el editor guarda al salir del modo edición aunque no se haya
    // tocado una letra. Una lista llena de versiones idénticas es una lista que
    // no se usa.
    // Con un cambio real adelante, así el test no pasa por no haber historial
    // en absoluto: lo que tiene que quedar es una versión, no cero y no dos.
    const reportId = await newReport('Primera.')
    await updateReportContent(practitionerId, reportId, 'Segunda.', 'edit')

    await updateReportContent(practitionerId, reportId, 'Segunda.', 'edit')

    expect(await listVersions(practitionerId, 'report', reportId)).toHaveLength(1)
  })

  it('no guarda una versión de un documento vacío', async () => {
    const reportId = await newReport('')

    await updateReportContent(practitionerId, reportId, 'Lo primero que se escribe.', 'ai')
    expect(await listVersions(practitionerId, 'report', reportId)).toHaveLength(0)

    // Y a partir de ahí sí: lo que sigue ya reemplaza algo escrito.
    await updateReportContent(practitionerId, reportId, 'Lo segundo.', 'ai')
    expect(await listVersions(practitionerId, 'report', reportId)).toHaveLength(1)
  })

  it('lo mismo para el análisis de una evaluación', async () => {
    const escrito = 'Interpretación:\nLos puntajes se ubican en el rango esperado.'
    const assessmentId = await newAssessment(escrito)

    await updateAssessmentAnalysis(practitionerId, assessmentId, 'Reescrito.', 'ai')

    const versions = await listVersions(practitionerId, 'assessment', assessmentId)
    expect(versions).toHaveLength(1)
    expect(versions[0]?.body).toBe(escrito)
    // Y no se cruzan: la versión es de la evaluación, no de un informe.
    expect(versions[0]?.report_id).toBeNull()
  })
})

describe('restaurar', () => {
  it('vuelve al texto anterior', async () => {
    const escrito = 'La versión que valía.'
    const reportId = await newReport(escrito)
    await updateReportContent(practitionerId, reportId, 'La que la pisó.', 'ai')

    const [version] = await listVersions(practitionerId, 'report', reportId)
    const restored = await restoreVersion(practitionerId, version!.id)

    expect(restored?.body).toBe(escrito)
    expect(await reportContent(reportId)).toBe(escrito)
  })

  it('también se puede deshacer: guarda lo que había antes de restaurar', async () => {
    // La propiedad que hace que restaurar no sea otra forma de perder texto. Si
    // alguien restaura la versión equivocada, lo que estaba escrito hace un
    // segundo sigue estando, arriba de todo en la lista.
    const reportId = await newReport('Vieja.')
    await updateReportContent(practitionerId, reportId, 'Nueva, y buena.', 'ai')

    const [version] = await listVersions(practitionerId, 'report', reportId)
    await restoreVersion(practitionerId, version!.id)

    const versions = await listVersions(practitionerId, 'report', reportId)
    expect(versions[0]?.replaced_by).toBe('restore')
    expect(versions[0]?.body).toBe('Nueva, y buena.')
  })

  it('no restaura la versión de otra profesional', async () => {
    const reportId = await newReport('Texto de la primera.')
    await updateReportContent(practitionerId, reportId, 'Reemplazado.', 'ai')
    const [version] = await listVersions(practitionerId, 'report', reportId)

    // La misma llamada, con la sesión de la otra.
    const mine = holder.db
    holder.db = await signedInAs(otherEmail)
    try {
      expect(await restoreVersion(otherId, version!.id)).toBeNull()
      expect(await listVersions(otherId, 'report', reportId)).toEqual([])
    } finally {
      holder.db = mine
    }

    expect(await reportContent(reportId)).toBe('Reemplazado.')
  })
})

describe('borrar el documento', () => {
  it('se lleva sus versiones', async () => {
    // Es una promesa de privacidad, no una prolijidad: el botón dice "Borrar" y
    // texto clínico que sobrevive a ese botón es exactamente lo que no puede
    // pasar. La clave foránea es lo que lo garantiza; por eso la tabla tiene dos
    // columnas anulables en vez de un `document_id` suelto.
    const reportId = await newReport('Algo escrito.')
    await updateReportContent(practitionerId, reportId, 'Reemplazado.', 'ai')
    expect(await listVersions(practitionerId, 'report', reportId)).toHaveLength(1)

    await service.from('reports').delete().eq('id', reportId)

    const { count } = await service
      .from('document_versions')
      .select('id', { count: 'exact', head: true })
      .eq('report_id', reportId)
    expect(count).toBe(0)
  })
})
