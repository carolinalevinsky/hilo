/**
 * Qué cambió entre dos versiones de un texto, por líneas.
 *
 * Existe para una sola pantalla: la propuesta de la IA sobre un informe que ya
 * tiene texto escrito. La regla del producto es que **la IA no pisa lo
 * escrito**, y para que eso sea usable hay que poder ver de un vistazo qué
 * propone cambiar. Sin eso, "aplicar o descartar" es apostar.
 *
 * ─── Por qué por líneas y no por palabras ─────────────────────────────────
 *
 * Un informe clínico son títulos y párrafos, y se lee entero antes de firmarlo.
 * Un diff por palabras dentro de un párrafo reescrito produce un tejido de
 * fragmentos tachados y sin tachar que no se puede leer como texto — y lo que
 * hay que juzgar acá es si el párrafo nuevo dice bien lo que hay que decir, no
 * cuántas palabras se movieron.
 *
 * Cuando la IA reescribe todo, esto muestra todo cambiado. Es la respuesta
 * correcta: reescribió todo.
 *
 * ─── Por qué hay un tope ──────────────────────────────────────────────────
 *
 * El algoritmo es una subsecuencia común más larga, que cuesta n×m. Un informe
 * son cuarenta líneas y eso es instantáneo, pero esto corre en el navegador de
 * alguien y el largo del texto lo decide el modelo, no nosotros. Arriba del tope
 * devuelve un solo bloque —"esto de acá por esto otro"—, que es menos útil y
 * llega. Una pantalla que tarda diez segundos en pintar es peor que una que
 * muestra menos detalle.
 */

/** Un tramo que cambió: `added` es lo nuevo, `removed` lo que reemplaza. */
export type ChangedBlock = { type: 'changed'; added: string[]; removed: string[] }

export type DiffBlock = { type: 'same'; lines: string[] } | ChangedBlock

const MAX_LINES = 600

function toLines(text: string): string[] {
  return text.replace(/\r\n/g, '\n').split('\n')
}

export function diffLines(before: string, after: string): DiffBlock[] {
  const a = toLines(before)
  const b = toLines(after)

  if (before === after) return [{ type: 'same', lines: a }]

  if (a.length > MAX_LINES || b.length > MAX_LINES) {
    return [{ type: 'changed', added: b, removed: a }]
  }

  const n = a.length
  const m = b.length

  // `at` en vez de `a[i]`: con `noUncheckedIndexedAccess` prendido, indexar un
  // arreglo da `string | undefined`, y acá los índices no se salen del rango
  // nunca — los tres recorridos de abajo están acotados por `n` y por `m`. La
  // alternativa era sembrar el algoritmo de comprobaciones que no pueden fallar,
  // que hace más difícil ver si está bien.
  const at = (lines: string[], index: number) => lines[index] as string

  // dp[i][j] = largo de la subsecuencia común más larga entre a[i:] y b[j:],
  // en un solo arreglo plano de (n+1)×(m+1) para no alocar una fila por línea.
  const width = m + 1
  const dp = new Int32Array((n + 1) * width)
  const cell = (i: number, j: number) => dp[i * width + j] as number
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * width + j] =
        at(a, i) === at(b, j)
          ? cell(i + 1, j + 1) + 1
          : Math.max(cell(i + 1, j), cell(i, j + 1))
    }
  }

  const blocks: DiffBlock[] = []

  // Se camina la tabla hacia adelante y se va juntando cada tramo con el
  // anterior si es del mismo tipo, así el resultado ya viene en bloques y no en
  // una línea por operación.
  function pushSame(line: string) {
    const last = blocks[blocks.length - 1]
    if (last?.type === 'same') last.lines.push(line)
    else blocks.push({ type: 'same', lines: [line] })
  }

  function pushChanged(line: string, side: 'added' | 'removed') {
    const last = blocks[blocks.length - 1]
    if (last?.type === 'changed') {
      last[side].push(line)
      return
    }
    const block: ChangedBlock = { type: 'changed', added: [], removed: [] }
    block[side].push(line)
    blocks.push(block)
  }

  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (at(a, i) === at(b, j)) {
      pushSame(at(a, i))
      i++
      j++
    } else if (cell(i + 1, j) >= cell(i, j + 1)) {
      pushChanged(at(a, i), 'removed')
      i++
    } else {
      pushChanged(at(b, j), 'added')
      j++
    }
  }
  while (i < n) pushChanged(at(a, i++), 'removed')
  while (j < m) pushChanged(at(b, j++), 'added')

  return blocks
}

/** Si hay algo que aplicar. Un texto idéntico no se propone. */
export function hasChanges(blocks: DiffBlock[]): boolean {
  return blocks.some((block) => block.type === 'changed')
}
