import { readFileSync, writeFileSync } from 'node:fs'

const html = readFileSync('legacy/index.html', 'utf8')
const start = html.indexOf('const materialData=[')
const end = html.indexOf('\n];', start)
const src = html.slice(start + 'const materialData='.length, end + 2)

// The array is plain JS object literals; evaluating it is safe here because the
// file is v1's frozen source, read once, at build-the-seed time.
const materials = new Function(`return ${src}`)()

// Areas in v1 were generic across disciplines; map them onto the per-discipline
// taxonomy in src/lib/material-areas.ts.
const DISCIPLINE_BY_AREA = {
  Lectura: 'psychopedagogy',
  Escritura: 'psychopedagogy',
  'Matemática': 'psychopedagogy',
  'Atención': 'psychopedagogy',
  Lenguaje: 'speech_therapy',
  Motricidad: 'occupational_therapy',
  Socioemocional: 'psychology',
}

const AREA_MAP = {
  psychopedagogy: { Lectura: 'Lectura', Escritura: 'Escritura', 'Matemática': 'Matemática', 'Atención': 'Atención' },
  speech_therapy: { Lenguaje: 'Articulación' },
  occupational_therapy: { Motricidad: 'Motricidad fina' },
  psychology: { Socioemocional: 'Emociones' },
}

const KIND = { Juego: 'game', Texto: 'text', Ficha: 'worksheet', Pauta: 'guide' }

const GRADE_AGE = {
  Inicial: '3-5 años', '1º': '6-7 años', '2º': '6-7 años', '3º': '8-9 años',
  '4º': '8-9 años', '5º': '10-11 años', '6º': '10-11 años',
}

/** HTML → the plain-text convention: "Heading:" lines and paragraphs. */
function toText(html) {
  let out = html
    // A table becomes its cells, comma separated, on one line.
    .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/g, (_, row) => {
      const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((m) =>
        m[1].replace(/<[^>]+>/g, '').trim(),
      )
      return `\n${cells.join(' · ')}\n`
    })
    .replace(/<\/(p|div|h[1-6]|table)>/g, '\n')
    .replace(/<li[^>]*>/g, '\n• ')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<b>([\s\S]*?)<\/b>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

  // "Cómo se juega: se dice..." → a heading line plus its paragraph, which is
  // what v1's <b>label:</b> markup meant all along.
  out = out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const match = line.match(/^([A-ZÁÉÍÓÚÑ¿][^:]{2,40}):\s*(.*)$/)
      if (!match) return [line]
      const [, label, rest] = match
      // v1 wrote `<b>Cómo se juega:</b> se dice una palabra…`, so the sentence
      // after the label started lowercase. On its own line it needs a capital.
      const sentence = rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : ''
      return sentence ? [`${label}:`, sentence] : [`${label}:`]
    })
  return out.join('\n')
}

const rows = []
for (const m of materials) {
  const discipline = DISCIPLINE_BY_AREA[m.area]
  if (!discipline) continue

  const area = AREA_MAP[discipline]?.[m.area] ?? m.area
  const ages = [...new Set((m.g ?? []).map((g) => GRADE_AGE[g]).filter(Boolean))]

  rows.push({
    discipline,
    area,
    focus: m.sub ?? null,
    title: m.t,
    kind: KIND[m.tipo] ?? 'activity',
    objective: m.obj ?? null,
    ageRange: ages[0] ?? null,
    content: toText(m.c ?? ''),
  })
}

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`)

const sql = rows
  .map(
    (r) =>
      `  (null, ${q(r.discipline)}, ${q(r.area)}, ${q(r.focus)}, ${q(r.title)}, ${q(r.kind)}, ${q(r.objective)}, ${q(r.ageRange)}, ${q(r.content)})`,
  )
  .join(',\n')

writeFileSync(
  'supabase/seeds/materials.generated.sql',
  `-- Generated from legacy/index.html by scripts/extract-materials.mjs.\n` +
    `-- ${rows.length} curated materials, transcribed from v1's HTML into the\n` +
    `-- plain-text convention the app renders. Do not edit by hand: re-run the\n` +
    `-- script instead.\n\n` +
    `insert into materials\n  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)\nvalues\n${sql};\n`,
)

console.log(`${rows.length} materials`)
