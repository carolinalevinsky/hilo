import { z } from 'zod'

/**
 * Lo que corre una vez, cuando arranca el servidor.
 *
 * Los mensajes de validación en castellano. Casi todos los esquemas traen su
 * propia frase ("Elegí un paciente."), pero unos cuarenta campos no —un
 * `.max(200)`, un número— y ésos le contestaban a la profesional en inglés
 * ("Too big: expected string to have <=200 characters"). Esto es la red de
 * abajo: la frase propia de cada esquema sigue ganando.
 */
export function register() {
  z.config(z.locales.es())
}
