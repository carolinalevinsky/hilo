'use client'

import { Archive, ArchiveRestore, Download, Trash2 } from '@/components/icons'
import Link from 'next/link'
import { useState } from 'react'

import { deletePatientAction, setArchivedAction } from '@/app/(app)/pacientes/actions'
import { Button } from '@/components/ui/button'
import { firstName } from '@/lib/whatsapp'

/**
 * Archiving and deleting.
 *
 * Two different things, and the interface says so rather than hiding both behind
 * one word:
 *
 *   **Archive** is for a patient who finished treatment. Out of the daily list,
 *   every record intact, one click back.
 *
 *   **Delete** is the family exercising their right to erasure under Ley
 *   N.º 18.331. It asks the practitioner to type the patient's first name,
 *   because a misfire here is not something a Vercel rollback can undo.
 *
 * Even "delete" is a `deleted_at` timestamp, not a DELETE. A professional has
 * record-keeping obligations that outlast a mis-click.
 */
export function PatientDangerZone({
  patientId,
  fullName,
  archived,
}: {
  patientId: string
  fullName: string
  archived: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState('')

  const expected = firstName(fullName)
  const matches = typed.trim().toLowerCase() === expected.toLowerCase()

  return (
    <div className="space-y-3 border-t border-border pt-4">
      {/* Beside deletion, as in v1 (`legacy/index.html:1211`), because they are
          the two halves of the same right: the family can ask to see everything
          held about them, and can ask for it to go. Putting access next to
          erasure is what makes the pair obvious. */}
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/pacientes/${patientId}/datos`}>
            <Download className="size-4" />
            Exportar datos
          </Link>
        </Button>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Todo lo que Hilo guarda sobre {expected}, para leer, imprimir o descargar. La
          familia tiene derecho a pedirlo (Ley N.º 18.331).
        </p>
      </div>

      <form action={setArchivedAction}>
        <input type="hidden" name="patientId" value={patientId} />
        <input type="hidden" name="archived" value={archived ? 'false' : 'true'} />
        <Button type="submit" variant="outline" size="sm">
          {archived ? (
            <>
              <ArchiveRestore className="size-4" />
              Reactivar paciente
            </>
          ) : (
            <>
              <Archive className="size-4" />
              Archivar paciente
            </>
          )}
        </Button>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {archived
            ? 'Vuelve a aparecer en tu lista de pacientes activos.'
            : 'Sale de tu lista del día a día. No se borra nada y podés reactivarlo cuando quieras.'}
        </p>
      </form>

      {confirming ? (
        <form action={deletePatientAction} className="space-y-2 rounded-xl bg-coral-soft p-3.5">
          <input type="hidden" name="patientId" value={patientId} />
          <p className="text-[12.5px] leading-relaxed text-[#c0392b]">
            Se borran la ficha, las sesiones, los objetivos y los informes de{' '}
            <b>{fullName}</b>. Esto no se puede deshacer desde la app. Escribí{' '}
            <b>{expected}</b> para confirmar.
          </p>
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            aria-label={`Escribí ${expected} para confirmar`}
            className="h-9 w-full rounded-lg border border-[#f3b4b4] bg-card px-3 text-sm outline-none"
          />
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" disabled={!matches}>
              Borrar definitivamente
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setConfirming(false)
                setTyped('')
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setConfirming(true)}
          >
            <Trash2 className="size-4" />
            Borrar paciente y sus datos
          </Button>
          <p className="mt-1.5 text-xs text-muted-foreground">
            La familia puede pedir que se supriman los datos (Ley N.º 18.331).
          </p>
        </div>
      )}
    </div>
  )
}
