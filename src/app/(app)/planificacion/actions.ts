'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { setAppointmentNote } from '@/server/appointments'
import { requireUser } from '@/server/auth'
import { createGoal } from '@/server/goals'
import { createOwnActivity } from '@/server/materials'
import { getPractitioner } from '@/server/practitioners'
import {
  addActivityToPlan,
  addGoalToPlan,
  addMaterialToPlan,
  clearPlan,
  removePlanItem,
  setPlanItemDuration,
} from '@/server/session-plans'

/**
 * Every write on the planner.
 *
 * All of them take the patient id from the form and pass it straight through:
 * the functions in `src/server/session-plans.ts` scope every query by
 * `practitioner_id`, so a tampered field can only ever address rows that are
 * already this practitioner's. That is the same reason `practitionerId` is an
 * explicit argument everywhere in `src/server/` rather than read from a cookie.
 * The session id gets the same treatment one level down: the composite foreign
 * key refuses a session that is not this patient's.
 */

/**
 * The session the plan on screen is for. Empty for a patient with nothing
 * scheduled, which the server reads as "their next one, whenever it is".
 */
function sessionOf(formData: FormData) {
  const value = formData.get('appointmentId')
  return typeof value === 'string' && value ? value : undefined
}

/**
 * The Agenda's "Plan de la semana" and Inicio read the same rows (P14), so a
 * change here is a change there.
 */
function refresh() {
  revalidatePath('/planificacion')
  revalidatePath('/agenda')
  revalidatePath('/inicio')
}

export async function addGoalToPlanAction(formData: FormData) {
  const user = await requireUser()

  // The goal goes in on its own now — nothing on this screen offers a material
  // alongside it, and `addGoalToPlan` no longer picks one when none is sent.
  await addGoalToPlan(
    user.id,
    String(formData.get('patientId')),
    String(formData.get('goalId')),
    null,
    sessionOf(formData),
  )
  refresh()
}

/**
 * An activity the practitioner typed, that is neither a goal nor a material.
 *
 * Va a dos lugares: al plan de esta sesión, y a la biblioteca personal como
 * material privado. Lo segundo es lo que la hace reutilizable — la misma
 * dinámica sirve con otro paciente el mes que viene, y hasta ahora se perdía
 * adentro del plan donde se escribió.
 *
 * El plan sigue guardando el texto y no el id del material: el ítem es "lo que
 * voy a hacer en esta sesión", y si mañana borra el material de la biblioteca,
 * el plan de esta sesión tiene que seguir diciendo lo mismo.
 */
export async function addActivityToPlanAction(formData: FormData) {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)
  const activity = String(formData.get('activity') ?? '')

  await addActivityToPlan(
    user.id,
    String(formData.get('patientId')),
    activity,
    sessionOf(formData),
    formData.get('durationMinutes'),
  )

  // Después del plan, que es lo que la persona pidió. Que la biblioteca falle no
  // puede hacer que la actividad no entre a la sesión.
  if (practitioner) await createOwnActivity(user.id, practitioner.discipline, activity)

  refresh()
  revalidatePath('/materiales')
}

/**
 * Un objetivo de los sugeridos, creado de una.
 *
 * Los títulos salen de la taxonomía de la profesión (`AREAS_BY_DISCIPLINE`), no
 * de una lista inventada acá: son las mismas áreas con las que está organizada
 * la biblioteca. Lo que se crea es un objetivo común y corriente, editable desde
 * la ficha como cualquier otro — esto sólo ahorra el viaje de ida y vuelta.
 */
export async function addSuggestedGoalAction(formData: FormData) {
  const user = await requireUser()

  await createGoal(user.id, String(formData.get('patientId')), {
    title: String(formData.get('title') ?? ''),
  })

  refresh()
  revalidatePath(`/pacientes/${String(formData.get('patientId'))}`)
}

/** Cuánto dura una fila del plan. Se elige en la lista, mirando el total. */
export async function setPlanItemDurationAction(formData: FormData) {
  const user = await requireUser()

  await setPlanItemDuration(
    user.id,
    String(formData.get('itemId')),
    formData.get('durationMinutes'),
  )
  refresh()
}

/**
 * La nota previa de la sesión.
 *
 * Escribe `appointments.note`, que es la nota que se pone al agendar: ver
 * `setAppointmentNote`. Sin sesión agendada no hay dónde guardarla, y la
 * pantalla no la ofrece.
 */
export async function savePlanNoteAction(formData: FormData) {
  const user = await requireUser()
  const appointmentId = sessionOf(formData)
  if (!appointmentId) return

  await setAppointmentNote(user.id, appointmentId, formData.get('note'))
  refresh()
}

export async function addMaterialToPlanAction(formData: FormData) {
  const user = await requireUser()

  await addMaterialToPlan(
    user.id,
    String(formData.get('patientId')),
    String(formData.get('materialId')),
    sessionOf(formData),
  )
  refresh()
}

/**
 * The same add, from an open material rather than from the planner's own search.
 *
 * A second action rather than a flag on the first, because it does a second
 * thing: it takes you to the planner, with that patient chosen. That is v1's
 * behaviour (`matAPlan` closed the modal and switched to the planner tab) and it
 * is the right one — you are somewhere else, and adding to a list you cannot see
 * gives no sign that anything happened. It goes to the patient's next session,
 * and the planner opens on that same one.
 */
export async function addMaterialFromLibraryAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await addMaterialToPlan(user.id, patientId, String(formData.get('materialId')))
  refresh()
  redirect(`/planificacion?paciente=${patientId}`)
}

export async function removePlanItemAction(formData: FormData) {
  const user = await requireUser()

  await removePlanItem(user.id, String(formData.get('itemId')))
  refresh()
}

export async function clearPlanAction(formData: FormData) {
  const user = await requireUser()

  await clearPlan(user.id, String(formData.get('patientId')), sessionOf(formData))
  refresh()
}
