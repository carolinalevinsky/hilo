/**
 * Lo que está construido, funcionando, y apagado para la v1.
 *
 * No son banderas de despliegue ni experimentos: es una funcionalidad completa
 * que se decidió no ofrecer todavía. Por eso son constantes y no
 * variables de entorno. Prenderlas es una línea acá, revisada, y no algo que
 * cambie solo entre entornos según qué esté configurado — que es la forma en que
 * `legacy/api/aviso-reserva.js:22` terminó con un endpoint abierto.
 *
 * **El código se queda.** Sacarlo significaría escribirlo de nuevo el día que
 * vuelva, y volver es el plan.
 *
 * Mercado Pago también estuvo acá, apagado. El 2026-09-29 se decidió que la
 * v1 no lo tiene y se sacó del código entero, en vez de dejarlo apagado: si
 * vuelve, vuelve desde el historial de git.
 *
 * `videoCalls` — la sesión por videollamada. La sala de `meet.jit.si` es
 * pública: cualquiera con la dirección entra, no hay sala de espera ni
 * autenticación. Para una sesión clínica con un menor eso es un problema real, y
 * además no hay acuerdo de tratamiento de datos con el proveedor.
 *
 * Apagar acá no alcanza por sí solo, y ése es el punto: cada bandera se chequea
 * en `src/server/`, antes de hacer nada. Esconder el botón no cierra nada —
 * cualquiera puede editar el código del navegador, que es exactamente lo que
 * `legacy/index.html:2775` hacía mal.
 */
export const FEATURES = {
  videoCalls: false,
} as const

/** Lo que se le dice a quien llegue igual. */
export const FEATURE_OFF_MESSAGE = 'Esto no está disponible por ahora.'
