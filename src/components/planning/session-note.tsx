'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import { savePlanNoteAction } from '@/app/(app)/planificacion/actions'
import { CircleCheck, FileText } from '@/components/icons'
import type { PlanTarget } from '@/components/planning/plan-fields'

/**
 * La nota previa de la sesión, que se guarda sola.
 *
 * Tenía un botón "Guardar nota" y era lo único de esta pantalla que no se
 * guardaba al escribirlo: todo lo demás entra a la base en el momento en que lo
 * sumás, y el pie de esta misma tarjeta lo promete —"se va guardando a medida
 * que agregás"—. Quien escribía la nota, se iba a mirar un material de la
 * biblioteca y volvía, encontraba el renglón vacío. Lo reportó Carolina y se
 * reprodujo tal cual.
 *
 * Se guarda en dos momentos, y los dos hacen falta:
 *
 *   - **Mientras escribís**, 800ms después de la última tecla. Es lo que salva
 *     el caso de arriba: para cuando tocás el enlace del material, la nota ya
 *     está guardada hace rato.
 *   - **Al salir del campo**, por si te vas antes de ese segundo — con Tab, o
 *     tocando cualquier otra cosa.
 *
 * `saved.current` es lo último que confirmó el servidor: sin eso, cada
 * revalidación dispara otro guardado igual al anterior. Se adelanta al `await`
 * para que dos disparos del mismo texto —el del rato y el de salir del campo—
 * no sean dos escrituras, y **se vuelve atrás si el guardado falla**: dejarlo
 * adelantado haría que el próximo intento se cancelara solo por creer que ese
 * texto ya está guardado, y la nota se perdería en silencio, que es justo el
 * problema que este componente existe para no tener.
 */
export function SessionNote({ target, note }: { target: PlanTarget; note: string | null }) {
  const [value, setValue] = useState(note ?? '')
  const [pending, startTransition] = useTransition()
  const [justSaved, setJustSaved] = useState(false)
  const saved = useRef(note ?? '')

  function save(text: string) {
    if (text === saved.current) return
    const previous = saved.current
    saved.current = text

    const data = new FormData()
    data.set('patientId', target.patientId)
    data.set('appointmentId', target.appointmentId ?? '')
    data.set('note', text)

    startTransition(async () => {
      try {
        await savePlanNoteAction(data)
        setJustSaved(true)
      } catch (error) {
        saved.current = previous
        throw error
      }
    })
  }

  // El rato de gracia mientras se escribe. Se reinicia con cada tecla, así que
  // una frase entera es un guardado y no veinte.
  useEffect(() => {
    if (value === saved.current) return
    const timer = setTimeout(() => save(value), 800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <details open={Boolean(note) || Boolean(value)} className="rounded-xl bg-muted/60 p-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-meta font-bold">
          <FileText className="size-4 text-muted-foreground" />
          Nota previa para la sesión
        </span>
        <Status pending={pending} saved={justSaved} empty={!value} />
      </summary>

      <textarea
        name="note"
        rows={3}
        maxLength={2000}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          // Lo primero que hay que hacer al escribir es dejar de decir
          // "Guardada": lo que está en pantalla ya no es lo que está guardado.
          setJustSaved(false)
        }}
        onBlur={() => save(value)}
        placeholder="Lo que quieras tener presente al empezar: cómo venía de la vez pasada, qué traer, qué avisarle a la familia."
        aria-label="Nota previa para la sesión"
        className="mt-2.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-body leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </details>
  )
}

/** Lo que pasa con lo que escribiste, dicho en el renglón del título. */
function Status({
  pending,
  saved,
  empty,
}: {
  pending: boolean
  saved: boolean
  empty: boolean
}) {
  if (pending) return <span className="text-meta text-muted-foreground">Guardando…</span>

  if (saved) {
    return (
      <span className="flex items-center gap-1 text-meta font-semibold text-green">
        <CircleCheck className="size-3.5" />
        Guardada
      </span>
    )
  }

  // Cerrado y sin nota: la invitación a escribir una. Con nota escrita no dice
  // nada — el texto está a la vista y no hace falta anunciarlo.
  return empty ? <span className="text-meta font-semibold text-violet">+ Añadir</span> : null
}
