'use client'

import { useUrlState } from '@/components/use-url-state'

/**
 * The control on the planner that changes what the server queries: which
 * session is being prepared.
 *
 * It lives in the URL, for the same reasons as the patient list — the page
 * stays a Server Component, a half-built plan can be reloaded without losing
 * where you were, and the back button works.
 *
 * It used to pick a patient, and the page opened on whichever came first
 * alphabetically. A plan is for a session now (P14), so this picks the session:
 * the coming ones first, with their day and time, and underneath the patients
 * with nothing scheduled in the next four weeks, who can still be prepared for.
 */

const SELECT_CLASSES =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

type Option = { id: string; label: string }

export function PlanSessionPicker({
  sessions,
  unscheduled,
  selected,
}: {
  sessions: Option[]
  unscheduled: Option[]
  /** `s:<appointment id>` or `p:<patient id>`, as the server resolved it. */
  selected: string
}) {
  const { params, set } = useUrlState()

  // Lo que se está por mostrar, no lo que se está mostrando. Sin esto el
  // desplegable volvía solo a la opción anterior mientras el servidor
  // contestaba, que se lee como "no me tomó el cambio". Sólo se acepta lo de la
  // dirección si está en la lista; si no, lo que resolvió el servidor.
  const askedSession = params.get('sesion') ?? ''
  const askedPatient = params.get('paciente') ?? ''
  const shown = sessions.some((option) => option.id === askedSession)
    ? `s:${askedSession}`
    : !askedSession && unscheduled.some((option) => option.id === askedPatient)
      ? `p:${askedPatient}`
      : selected

  return (
    <select
      id="plan-session"
      value={shown}
      // Changing session must also drop the library search: the results carry
      // "Agregar" buttons that would otherwise still be pointing at the previous
      // session's plan for as long as the URL kept the old query.
      onChange={(event) => {
        const [kind, id = ''] = event.target.value.split(':')
        set(
          kind === 's'
            ? { sesion: id, paciente: '', q: '' }
            : { paciente: id, sesion: '', q: '' },
        )
      }}
      className={SELECT_CLASSES}
    >
      {sessions.length > 0 ? (
        <optgroup label="Próximas sesiones">
          {sessions.map((option) => (
            <option key={option.id} value={`s:${option.id}`}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ) : null}
      {unscheduled.length > 0 ? (
        <optgroup label="Sin sesión en las próximas cuatro semanas">
          {unscheduled.map((option) => (
            <option key={option.id} value={`p:${option.id}`}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ) : null}
    </select>
  )
}
