/**
 * The address of a Hilo video room.
 *
 * One function so the service is named in exactly one place. It is `meet.jit.si`
 * today because it needs no account and no install from a family on a phone —
 * and the room id it is given is random, which is the whole reason this is safe
 * to use at all. See `supabase/migrations/…_add_patient_video_room.sql`.
 *
 * The prefix is Hilo's and carries nothing about anybody: it exists so a room
 * created here does not collide with the short words people type into that
 * service by hand.
 */
export function videoRoomUrl(roomId: string): string {
  return `https://meet.jit.si/hilo-${roomId}`
}
