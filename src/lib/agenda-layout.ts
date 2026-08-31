/**
 * Dónde va cada cosa en la columna de un día de la Agenda.
 *
 * Vive acá y no adentro del componente para poder probarlo. Lo que resuelve son
 * dos errores que no avisan y que se ven feo recién en pantalla: una hora
 * dibujada en el lugar equivocado, y un nombre tapado por otro.
 *
 * No sabe nada de sesiones ni de Google. Recibe tramos con principio y fin en
 * minutos y devuelve geometría; quién es cada uno lo decide `week-calendar.tsx`.
 */

/** Alto de una hora, en píxeles. Es la escala de todo lo demás. */
export const HOUR_HEIGHT = 56

/** Lo mínimo que puede medir algo y todavía leerse. */
export const MIN_HEIGHT = 22

/** Cuánto se angosta cada cosa que cae encima de otra, en %. */
const STEP = 16

/** Hasta cuántos escalones. Más que esto y la de adelante deja de leerse. */
const MAX_DEPTH = 3

/**
 * Un tramo empieza "a la misma altura" que otro si arranca dentro de estos
 * minutos. Diez y no cero: dos cosas a las 9:00 y a las 9:05 se tapan igual, y
 * pedir coincidencia exacta dejaría el título de la de atrás abajo de la otra.
 */
const HEAD_MINUTES = 10

export type Span = {
  key: string
  /** Minutos desde el principio de la grilla. */
  from: number
  to: number
}

export type Placed<T extends Span> = {
  span: T
  z: number
  top: number
  height: number
  /**
   * Porcentaje del ancho de la columna. Todo arranca pegado a la izquierda: lo
   * que se angosta deja ver la punta derecha de lo que tiene detrás.
   */
  width: number
  /** Cuánto baja el título para no quedar tapado, en píxeles. */
  labelTop: number
}

const overlap = (a: Span, b: Span) => a.from < b.to && b.from < a.to

/**
 * La regla, en una línea: **lo más largo va atrás y ancho; lo más corto va
 * adelante y angosto.**
 *
 * Una reunión de nueve a cinco con un paciente adentro no son dos cosas
 * compitiendo — es una franja larga y algo puntual que pasa dentro. Dibujarlas
 * como dos columnas iguales diría que son lo mismo. Achicar la corta deja ver el
 * borde de la larga por detrás, que es lo que hace entender de un vistazo cuál
 * contiene a cuál.
 *
 * Las dos quedan alineadas a la izquierda. Los principios de hora se leen
 * bajando por un mismo borde: mover el de adelante a la derecha obliga a buscarlo
 * en otra columna, y lo que se gana en ver el de atrás se pierde en eso.
 *
 * Y a la de atrás se le baja el título hasta pasar lo que la tapa. Un nombre que
 * no se lee es lo mismo que no haberlo escrito.
 */
export function placeSpans<T extends Span>(spans: T[]): Placed<T>[] {
  // Más larga primero: queda atrás y el resto se apila encima. El desempate por
  // hora de inicio es lo que hace que el resultado no dependa del orden en que
  // vinieron de la base.
  const order = [...spans].sort(
    (a, b) => b.to - b.from - (a.to - a.from) || a.from - b.from || a.key.localeCompare(b.key),
  )

  return order.map((span, index) => {
    // Cuántas cosas más largas la pisan. Cada una la corre un escalón a la
    // derecha, así ninguna queda escondida detrás de otra del todo.
    const behind = order.slice(0, index).filter((other) => overlap(span, other))
    const depth = Math.min(behind.length, MAX_DEPTH)

    // Lo que se dibuja encima de ésta y le tapa el título.
    const coveringHead = order
      .slice(index + 1)
      .filter((other) => overlap(span, other) && other.from <= span.from + HEAD_MINUTES)

    const clearedAt = coveringHead.reduce(
      (lowest, other) => Math.max(lowest, other.to),
      span.from,
    )

    const height = Math.max(MIN_HEIGHT, ((span.to - span.from) / 60) * HOUR_HEIGHT)

    return {
      span,
      z: index + 1,
      top: (span.from / 60) * HOUR_HEIGHT,
      height,
      width: 100 - depth * STEP,
      // El título no se baja más allá del cuerpo: en una cosa corta, bajarlo lo
      // dejaría afuera y sería peor el remedio.
      labelTop: Math.min(
        ((clearedAt - span.from) / 60) * HOUR_HEIGHT,
        Math.max(0, height - MIN_HEIGHT),
      ),
    }
  })
}
