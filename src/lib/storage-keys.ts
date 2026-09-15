/**
 * Los nombres que dicen "hilo" y que no se pueden cambiar.
 *
 * No son marca. Son claves de datos que ya están escritos afuera de este código
 * —en el Google Calendar de cada profesional y en el navegador de cada una— y
 * renombrarlas no las renombra allá: las deja huérfanas.
 *
 * Están juntas acá para que se vean como una decisión y no como algo que se
 * pasó por alto. Si alguien grepea "hilo" después del cambio de marca, esto es
 * lo que va a encontrar, con el motivo al lado.
 *
 * Cambiar cualquiera de éstas es una migración, no un reemplazo de texto. Lo que
 * haría falta: leer las dos claves durante un tiempo, escribir sólo la nueva, y
 * recién sacar la vieja cuando no queden datos con ella. Para `hilo_appointment_id`
 * eso además significa recorrer los eventos ya creados en Google.
 */

/**
 * La marca que Ombúa deja adentro de cada evento que crea en Google Calendar,
 * en `extendedProperties.private`.
 *
 * Es lo que hace que una sesión agendada desde acá no aparezca dos veces en la
 * grilla —una como sesión, otra como bloque gris de "ocupado"— y es también lo
 * que permite encontrar el evento para modificarlo o borrarlo.
 *
 * Todos los eventos creados antes del cambio de marca ya tienen esta clave
 * escrita en el calendario real de cada profesional. Si el código empezara a
 * buscar otra, esos eventos dejarían de reconocerse: se duplicarían en la grilla
 * y una sesión movida acá ya no se movería allá.
 */
export const GOOGLE_EVENT_MARKER = 'hilo_appointment_id'

/**
 * Presente significa "cerrame la sesión cuando cierre el navegador". La escribe
 * `signInAction` cuando la casilla queda destildada, y se borra al entrar con la
 * casilla tildada o al salir. No lleva ningún secreto — sólo la elección.
 *
 * Renombrarla haría que a quien ya eligió "no recordarme" se le deje de
 * respetar la elección: el navegador seguiría mandando la cookie vieja, el
 * código leería la nueva y no la encontraría, y la sesión pasaría a quedar
 * guardada. Es exactamente al revés de lo que la persona pidió.
 */
export const SESSION_ONLY_COOKIE = 'hilo_sesion_temporal'

/**
 * El `state` de OAuth con Google, contra CSRF. Vive un minuto, entre que se
 * manda a autorizar y que Google devuelve.
 *
 * Ésta sí se podría renombrar sin costo real —lo único que rompe es una
 * autorización a mitad de camino justo en el momento del deploy— pero queda
 * acá con las otras: una sola regla para las claves de almacenamiento se
 * explica y se recuerda, cuatro excepciones con criterios distintos no.
 */
export const GOOGLE_STATE_COOKIE = 'hilo_google_state'

/**
 * Que ya se mostró el aviso de Google en la agenda.
 *
 * Vive en la página y no en `ConnectGoogle` porque ese archivo es `'use client'`:
 * una constante exportada desde un módulo de cliente llega a un componente de
 * servidor como una referencia, no como su texto, y `cookies().get()` devuelve
 * `undefined` en silencio. Este módulo no es de cliente, así que las dos puntas
 * pueden leer el mismo nombre.
 */
export const GOOGLE_NOTICE_COOKIE = 'hilo_agenda_google'

/**
 * El mail con el que se entró la última vez, para dejarlo puesto en el formulario.
 *
 * La dirección y nada más — nunca la contraseña, ni nada que pueda hacer de
 * contraseña. Es el mail de la profesional en su propia máquina, lo mismo que ya
 * guarda el autocompletado del navegador.
 *
 * Renombrarla le vacía el campo a todo el mundo a la vez. No es grave, pero es
 * una molestia para cada persona que entra, a cambio de nada.
 */
export const REMEMBERED_EMAIL = 'hilo_email'

/**
 * La marca que dice "esta sesión vino de un link de recuperación".
 *
 * `/confirmar` la escribe al consumir el link, `/nueva-contrasena` se niega a
 * renderizar o a actuar sin ella, y la acción la borra apenas cambia la
 * contraseña. Es lo único que separa "probó que lee el mail de la cuenta" de
 * "encontró una laptop abierta en un consultorio".
 *
 * Vive pocos minutos, así que renombrarla sólo rompe una recuperación que esté
 * a mitad de camino justo en el momento del deploy. Queda igual por la misma
 * razón que `GOOGLE_STATE_COOKIE`: una sola regla para todas.
 */
export const RECOVERY_COOKIE = 'hilo-recovery'
