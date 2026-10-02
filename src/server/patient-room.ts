import { z } from 'zod'

import { FEATURES } from '@/lib/features'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * Where a session happens when it happens online.
 *
 * Two ways, and the practitioner's own wins. See the migration for why v1's
 * version — the patient's name in a public `meet.jit.si` URL — is not ported.
 */

/** Prefix, then a random id. Never anything derived from the patient. */
function newRoomId(): string {
  // 16 hex characters: enough that guessing one is not a thing anybody does,
  // short enough to read out over the phone if it comes to that.
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * A link is only safe to render if it is one.
 *
 * `javascript:alert(1)` is a perfectly valid string and an `href` will run it
 * with the practitioner's session attached. The allowed protocols are the two
 * that mean "a web address", and everything else is rejected rather than
 * cleaned — there is no correct reading of a `data:` video call.
 */
export const VideoUrlInput = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        return url.protocol === 'https:' || url.protocol === 'http:'
      } catch {
        return false
      }
    },
    { message: 'Pegá un link que empiece con https://' },
  )
  .transform((value) => (value ? value : null))

export async function setPatientVideoUrl(
  practitionerId: string,
  patientId: string,
  input: unknown,
) {
  const videoUrl = VideoUrlInput.parse(input ?? '')
  const db = await getDb()

  const { error } = await db
    .from('patients')
    .update({ video_url: videoUrl })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  return videoUrl
}

/**
 * The room for this patient, made once and kept.
 *
 * Kept rather than regenerated because a family saves the link: v1 rebuilt it
 * on every reload, so a link already sent stopped working.
 */
export async function ensurePatientRoom(
  practitionerId: string,
  patientId: string,
): Promise<string | null> {
  // Apagado para la v1. La sala de `meet.jit.si` es pública: cualquiera con la
  // dirección entra, sin sala de espera ni autenticación, y no hay acuerdo de
  // tratamiento de datos con el proveedor. Ver `src/lib/features.ts`.
  //
  // Devuelve `null`, que es lo que ya devuelve para un paciente que no existe,
  // así que quien llama no necesita un camino nuevo. Y no crea la sala: apagado
  // no puede seguir escribiendo `room_id` en las fichas.
  if (!FEATURES.videoCalls) return null

  const db = await getDb()

  const { data: patient, error } = await db
    .from('patients')
    .select('room_id')
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  if (!patient) return null
  if (patient.room_id) return patient.room_id

  const roomId = newRoomId()
  const { error: writeError } = await db
    .from('patients')
    .update({ room_id: roomId })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)

  if (writeError) throw writeError
  return roomId
}

/**
 * Cambia la sala por una nueva, y con eso deja afuera a quien tenga la vieja.
 *
 * ─── Por qué hace falta ────────────────────────────────────────────────────
 *
 * La sala es por paciente y no vence: ésa es la propiedad que la hace útil —la
 * familia guarda el link y lo usa todas las semanas— y es también la única
 * forma que tiene de fallar. Una sala de `meet.jit.si` la abre cualquiera que
 * tenga la URL, así que quien la recibió una vez puede entrar a **todas** las
 * sesiones siguientes: un familiar, alguien a quien se la reenviaron por
 * WhatsApp, alguien de quien esa familia se separó. Y no hay nada de eso que
 * Ombúa pueda ver.
 *
 * La migración de `room_id` resolvió bien la mitad de v1 —el nombre del niño ya
 * no está en la URL— y dejó esta mitad sin tratar. Esto es la otra mitad, y es
 * lo mínimo: no evita que el link circule, pero convierte "circuló" en algo que
 * se puede cortar. Sin esto, la única forma de sacar a alguien de las sesiones
 * de un paciente era no usar más la consulta online.
 *
 * ─── Lo que cuesta, dicho acá para que se pueda decir en la pantalla ───────
 *
 * El link viejo deja de funcionar para todos, incluida la familia. Después de
 * esto hay que mandarles el nuevo. Por eso no pasa solo, ni en cada carga como
 * hacía v1: lo pide una persona que decidió que la sala anterior ya no sirve.
 */
export async function rotatePatientRoom(
  practitionerId: string,
  patientId: string,
): Promise<string | null> {
  if (!FEATURES.videoCalls) return null

  const db = await getDb()
  const roomId = newRoomId()

  const { data, error } = await db
    .from('patients')
    .update({ room_id: roomId })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)
    .select('room_id')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  // Va al registro de auditoría y no es ceremonia: es el mismo tipo de acto que
  // conectar o desconectar Google — no cambia un dato clínico, cambia a quién
  // más se le está dando acceso. Si alguna vez hay que reconstruir desde cuándo
  // una sala dejó de estar al alcance de alguien, es lo único que lo cuenta.
  await logAction(practitionerId, 'update', 'patient', patientId)

  return data.room_id
}
