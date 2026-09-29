/**
 * Los largos que se le pueden dar a una actividad del plan, en minutos.
 *
 * Acá y no en `src/server/session-plans.ts` aunque sea el servidor quien los
 * valida: el selector es una isla de cliente, y una constante importada desde
 * ahí arrastraría el módulo del servidor entero —con su cliente de base— al
 * bundle que descarga el navegador.
 *
 * De cinco en cinco hasta media hora y después de a saltos: nadie planifica una
 * actividad de 37 minutos, y una lista larga es una decisión que no hace falta
 * tomar.
 */
export const PLAN_DURATIONS = [5, 10, 15, 20, 30, 45, 60] as const

/** Lo que dura una actividad cuando no se elige nada. El de la migración. */
export const DEFAULT_PLAN_DURATION = 15

/** Un largo válido, o el de siempre. Lo que no está en la lista no entra. */
export function planDuration(value: unknown): number {
  const minutes = Number(value)
  return PLAN_DURATIONS.includes(minutes as (typeof PLAN_DURATIONS)[number])
    ? minutes
    : DEFAULT_PLAN_DURATION
}

/** El total de un plan, para compararlo con lo que dura la sesión. */
export function totalDuration(items: { durationMinutes: number }[]): number {
  return items.reduce((sum, item) => sum + item.durationMinutes, 0)
}
