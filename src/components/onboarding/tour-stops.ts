import type { SceneName } from '@/components/onboarding/tour-scenes'

/**
 * What the tour says at each stop, what it points at, and what it draws.
 *
 * The order is the navigation's, which is the working day: quiénes son, cuándo
 * los veo, qué preparo, qué tengo que escribir, quién me debe. Following a
 * different order here would teach a map of the app that does not match the one
 * on screen.
 *
 * Inicio is not a stop. The tour opens on it, and it is the one screen that
 * explains itself: "Primeros pasos" is right there.
 */

export type TourStop = {
  /**
   * The nav item to ring, as its `href` — what `data-tour` carries in the
   * sidebar and the bottom bar. `null` rings nothing and centres the card.
   */
  target: string | null
  /**
   * The short animated drawing at the top of the card: what happens on that
   * screen, played rather than described — and on the greeting, the five
   * screens the tour is about to visit. See `tour-scenes.tsx`.
   */
  scene?: SceneName
  title: string
  body: string
}

export const TOUR_STOPS: TourStop[] = [
  {
    // El saludo. Sin él, el recorrido empieza señalando un botón sin haber
    // dicho qué es esto ni por qué apareció, que es la forma más rápida de que
    // alguien lo cierre sin leer.
    target: null,
    scene: 'bienvenida',
    // «Bienvenida» o «Bienvenido»: lo completa `AppTour` con la concordancia
    // de quien lo ve.
    title: '¡Hola! {bienvenida} a Ombúa',
    body: 'Te mostramos rápidamente cómo funciona la app y todo lo que podés hacer dentro de ella. ¡Esperamos que te guste!',
  },
  {
    target: '/pacientes',
    scene: 'pacientes',
    title: 'Pacientes',
    body: 'En esta pantalla se centralizan todos tus pacientes, y la ficha de cada uno: los datos, los objetivos con su avance, cada sesión registrada y los informes.',
  },
  {
    target: '/agenda',
    scene: 'agenda',
    title: 'Agenda',
    body: 'Esta es tu semana por hora. Acá podés ver las sesiones programadas, marcar asistencia y documentar cómo estuvo la sesión.',
  },
  {
    // El `href` de la entrada de la sidebar, que es lo que busca `app-tour.tsx`.
    // Si no coincide, la parada no resalta nada y cae en la tarjeta centrada.
    target: '/planificacion',
    scene: 'planificacion',
    title: 'Planificación y materiales',
    body: 'Ombúa tiene una biblioteca con más de 100 materiales para que uses, o cargues los tuyos propios. Según los objetivos del paciente, Ombúa IA te sugiere actividades para la sesión. Usalos o planificá desde cero.',
  },
  {
    target: '/informes',
    scene: 'informes',
    title: 'Informes y evaluaciones',
    body: 'Ombúa IA escribe informes con la información cargada en las sesiones y analiza resultados de evaluaciones. Vos los revisás, los corregís y los firmás. Nunca inventa un resultado que no le hayas dado.',
  },
  {
    target: '/cobros',
    scene: 'pagos',
    title: 'Pagos',
    body: 'En esta pantalla podés cargar quién pagó y quién debe, mes a mes. Anotás cada pago cuando llega y el mes se cuenta solo. No pierdas nada de vista.',
  },
]
