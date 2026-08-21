/**
 * What the tour says about each screen, and in what order.
 *
 * The order is the navigation's, which is the working day: quiénes son, cuándo
 * los veo, qué preparo, qué tengo que escribir, quién me debe. Following a
 * different order here would teach a map of the app that does not match the one
 * on screen.
 *
 * Inicio is not a stop. It is where the tour runs, so pointing at it would be
 * pointing at the floor.
 *
 * Five stops. Each one answers "para qué entro acá", not "qué botones tiene":
 * the buttons are discoverable once you know why you would open the screen, and
 * a tour that lists controls is a tour nobody finishes.
 */

export type TourStop = {
  /** Matches `data-tour` on the nav item, which is the item's href. */
  target: string
  title: string
  body: string
}

export const TOUR_STOPS: TourStop[] = [
  {
    target: '/pacientes',
    title: 'Pacientes',
    body: 'La ficha de cada uno, con los datos, los objetivos, todas las sesiones y los informes. Es el lugar donde vas a estar la mayor parte del tiempo.',
  },
  {
    target: '/agenda',
    title: 'Agenda',
    body: 'Tu semana por hora. Desde acá registrás la sesión del día, y el día anterior podés mandar los recordatorios por WhatsApp de una sola vez.',
  },
  {
    target: '/materiales',
    title: 'Planificación',
    body: 'Trescientos materiales, cincuenta de tu profesión, buscables por área y por edad. Y el planificador, para dejar armada la sesión que viene.',
  },
  {
    target: '/informes',
    title: 'Informes y evaluaciones',
    body: 'Hilo los escribe con lo que ya cargaste en las sesiones. Vos los revisás, los corregís y los firmás. Nunca inventa un resultado que no le hayas dado.',
  },
  {
    target: '/cobros',
    title: 'Cobros',
    body: 'Quién pagó y quién debe, mes a mes. Si conectás Mercado Pago, armás el link de pago desde acá y te avisa solo cuando entra la plata.',
  },
]
