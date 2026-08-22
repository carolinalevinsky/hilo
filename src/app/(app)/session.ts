import { cache } from 'react'

import { requireUser } from '@/server/auth'
import { getPractitioner } from '@/server/practitioners'

/**
 * Quién está mirando la pantalla, preguntado una sola vez por carga.
 *
 * ─── Por qué existe ────────────────────────────────────────────────────────
 *
 * El layout de `(app)` resuelve el usuario y el perfil, y después cada página
 * los vuelve a resolver por su cuenta: en App Router una página no recibe lo que
 * el layout ya averiguó. Son 22 pantallas pidiendo el usuario y 15 pidiendo el
 * perfil, todas encima de lo que el layout ya pidió.
 *
 * Con la base al lado no se notaba. Con el código corriendo en Washington y la
 * base en Oregon, cada una de esas repeticiones es un viaje de ida y vuelta
 * completo, y `requireUser` además valida el token contra el servidor de auth,
 * que es otro viaje más.
 *
 * ─── Por qué acá y no adentro de src/server ────────────────────────────────
 *
 * `cache` es de React. `src/server/` es TypeScript liso a propósito, para que
 * pueda levantarse como servicio aparte sin reescribir nada, y meterle una
 * dependencia de React rompería eso por ahorrar veintidós líneas de import.
 *
 * `cache` memoriza por render, no entre pedidos: dos personas distintas nunca
 * comparten resultado, y la segunda carga de la misma persona vuelve a preguntar.
 * No es un caché de datos, es dejar de preguntar dos veces lo mismo en la misma
 * respuesta.
 */

/** El usuario de la sesión. Tira si no hay, igual que `requireUser`. */
export const currentUser = cache(requireUser)

/** El perfil profesional. La clave del memo es el id, como corresponde. */
export const currentPractitioner = cache(async (practitionerId: string) =>
  getPractitioner(practitionerId),
)

/** Los dos de una, que es como los pide casi toda pantalla. */
export const currentSession = cache(async () => {
  const user = await currentUser()
  const practitioner = await currentPractitioner(user.id)
  return { user, practitioner }
})
