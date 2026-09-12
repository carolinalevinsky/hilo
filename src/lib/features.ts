/**
 * Lo que está construido, funcionando, y apagado para la v1.
 *
 * No son banderas de despliegue ni experimentos: son dos funcionalidades
 * completas que se decidió no ofrecer todavía. Por eso son constantes y no
 * variables de entorno. Prenderlas es una línea acá, revisada, y no algo que
 * cambie solo entre entornos según qué esté configurado — que es la forma en que
 * `legacy/api/aviso-reserva.js:22` terminó con un endpoint abierto.
 *
 * **El código se queda.** Sacarlo significaría escribirlo de nuevo el día que
 * vuelva, y volver es el plan.
 *
 * `mercadoPago` — cobrar por Mercado Pago desde Hilo. Que los pagos de una
 * profesional dependan de que Hilo funcione es un compromiso grande para asumir
 * en una v1. Lo que sigue prendido es todo el registro: anotar pagos a mano,
 * subir comprobantes y el libro mensual de Cobros. Eso no toca plata.
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
  mercadoPago: false,
  videoCalls: false,
} as const

/** Lo que se le dice a quien llegue igual a una de las dos. */
export const FEATURE_OFF_MESSAGE = 'Esto no está disponible por ahora.'
