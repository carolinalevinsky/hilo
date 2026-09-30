/**
 * Hasta cuánto texto libre viaja a la IA en un pedido.
 *
 * El "¿Querés ajustar algo?" de un informe o una evaluación no tenía tope: un
 * pedido armado a mano podía mandar megabytes por vez, contra el modelo más
 * caro, en una ruta que además no descuenta cuota al regenerar. Mil caracteres
 * son unas quince líneas, más de lo que alguien escribe para pedir un cambio.
 *
 * Vive en `src/lib/` porque lo leen la ruta, que lo hace cumplir, y el campo de
 * texto, que no deja escribir más.
 */
export const MAX_ADJUSTMENT = 1000

export const ADJUSTMENT_TOO_LONG = `El ajuste puede tener hasta ${MAX_ADJUSTMENT} caracteres.`
