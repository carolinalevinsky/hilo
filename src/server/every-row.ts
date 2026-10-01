/**
 * Todas las filas de una consulta, página por página.
 *
 * PostgREST corta cada respuesta en `max_rows` (1000, en `supabase/config.toml`
 * y en producción) **y no lo dice**: la respuesta llega con 1000 filas y nada
 * distingue "hay 1000" de "hay 40.000 y te mando las primeras". Un `.limit()`
 * más alto no lo arregla, porque el tope es del servidor. Lo único que trae
 * todo es pedir de a páginas.
 *
 * `page(from, to)` arma la consulta con su `.range(from, to)` y un orden
 * estable — con `id` de desempate, o dos filas con el mismo valor pueden
 * cambiar de página entre una pedida y la otra y aparecer dos veces o ninguna.
 * Esto la repite hasta que una página vuelve incompleta.
 */
export async function everyRow<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const all: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1)
    if (error) throw error
    all.push(...(data ?? []))
    if (!data || data.length < PAGE) return all
  }
}

/** Cuántas filas se piden por vez. Debajo del `max_rows` de PostgREST. */
export const PAGE = 500
