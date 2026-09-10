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
  scheduleCount,
}: {
  patientId: string
  fullName: string
  archived: boolean
  /** Cuántos horarios fijos activos tiene. Cero significa no preguntar nada. */
  scheduleCount: number
}) {
  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState('')
  const [choosing, setChoosing] = useState(false)

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

      {/* Archivar a alguien con horario fijo son dos decisiones, no una, y hasta
          ahora la segunda se tomaba sola: la regla quedaba activa y le seguía
          creando sesiones a un paciente archivado.

          La elección viaja en el propio formulario —dos botones de submit con
          el mismo `name`— así que no hay estado que sincronizar ni una petición
          aparte que pueda quedar a medias. Sin horario fijo no hay nada que
          preguntar y el botón archiva de una. */}
      <form action={setArchivedAction}>
        <input type="hidden" name="patientId" value={patientId} />
        <input type="hidden" name="archived" value={archived ? 'false' : 'true'} />

        {archived ? (
          <>
            <Button type="submit" variant="outline" size="sm">
              <ArchiveRestore className="size-4" />
              Reactivar paciente
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Vuelve a aparecer en tu lista de pacientes activos, con su horario fijo si lo
              conservaste.
            </p>
          </>
        ) : choosing ? (
          <div className="space-y-2.5 rounded-xl bg-muted p-3.5">
            <p className="text-[12.5px] leading-relaxed">
              {expected} tiene{' '}
              {scheduleCount === 1 ? 'un horario fijo' : `${scheduleCount} horarios fijos`}. Las
              sesiones de hoy en adelante salen de la agenda en los dos casos. Lo que cambia
              es qué pasa con la regla.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" name="schedules" value="keep" size="sm">
                <Archive className="size-4" />
                Archivar y conservar el horario
              </Button>
              <Button
                type="submit"
                name="schedules"
                value="deactivate"
                variant="outline"
                size="sm"
              >
                Archivar y darlo de baja
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setChoosing(false)}>
                Cancelar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Conservarlo es lo reversible: si reactivás a {expected}, el horario vuelve solo.
              Darlo de baja no se deshace — hay que cargarlo de nuevo.
            </p>
          </div>
        ) : (
          <>
            <Button
              type={scheduleCount > 0 ? 'button' : 'submit'}
              variant="outline"
              size="sm"
              onClick={scheduleCount > 0 ? () => setChoosing(true) : undefined}
            >
              <Archive className="size-4" />
              Archivar paciente
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Sale de tu lista del día a día. No se borra nada y podés reactivarlo cuando
              quieras.
            </p>
          </>
        )}
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
