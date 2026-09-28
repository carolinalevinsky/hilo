import { readFileSync, readdirSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { AGE_RANGES, AREAS_BY_DISCIPLINE, MATERIAL_KIND_LABELS } from './material-areas'
import { isHeading } from '@/components/documents/clinical-document'

/**
 * The shared library, checked against the standard in `docs/materiales.md`.
 *
 * Every practitioner of a discipline sees the same rows, so a thin material is
 * not one person's problem: it is what the product looks like to everybody who
 * signed up for that profession. The first library had 45 materials transcribed
 * from v1 that were a third the length of the rest, 23 of them filed under a
 * focus the app does not even offer — and nothing failed, because nothing was
 * looking. This is what looks.
 *
 * It reads the seed SQL as text on purpose. Loading it into Postgres would test
 * the same rows a `db:reset` already loads, and would need the stack running to
 * say anything about content; the content is right there in the file.
 */

const DIR = 'supabase/seeds'

type Material = {
  file: string
  owner: string | null
  discipline: string
  area: string
  focus: string | null
  title: string
  kind: string
  objective: string | null
  age: string | null
  content: string
}

const COLUMNS = [
  'practitioner_id',
  'discipline',
  'area',
  'focus',
  'title',
  'kind',
  'objective',
  'age_range',
  'content',
] as const

/**
 * Splits a file into its `insert into materials … values … ;` statements, and
 * into the text that sits between them.
 *
 * Hand-rolled because the alternative is a regex, and a regex cannot tell a
 * semicolon inside a material from the one that ends the statement. The only
 * escape SQL has inside a quoted string is `''`, so a two-state reader is the
 * whole grammar.
 *
 * What is between statements matters as much as what is inside: a block of rows
 * that starts after the semicolon of the previous statement is not SQL, and
 * Postgres answers with "syntax error at or near null" and drops the whole
 * seeding. That happened, with 41 rows across five files, and this file did not
 * notice because it used to read from `values` to the end of the file.
 */
function statements(sql: string) {
  const clean = sql.replace(/^[ \t]*--.*$/gm, '')
  const lower = clean.toLowerCase()
  const bodies: string[] = []
  const between: string[] = []

  let cursor = 0
  for (;;) {
    const start = lower.indexOf('insert into materials', cursor)
    if (start === -1) {
      between.push(clean.slice(cursor))
      break
    }
    between.push(clean.slice(cursor, start))

    let i = lower.indexOf('values', start) + 'values'.length
    const from = i
    let quoted = false

    while (i < clean.length) {
      const char = clean[i]
      if (quoted) {
        if (char === "'") {
          if (clean[i + 1] === "'") {
            i += 2
            continue
          }
          quoted = false
        }
        i += 1
        continue
      }
      if (char === "'") {
        quoted = true
        i += 1
        continue
      }
      // The terminating semicolon of the statement, outside any string.
      if (char === ';') break
      i += 1
    }

    // Everything after `on conflict` is the upsert clause, and its `(title)`
    // would read as one more row.
    bodies.push(clean.slice(from, i).split(/\non conflict\b/i)[0] ?? '')
    cursor = i + 1
  }

  return { bodies, between }
}

function parse(file: string, sql: string): Material[] {
  return statements(sql).bodies.flatMap((body) => tuples(file, body))
}

/**
 * The rows of one statement.
 */
function tuples(file: string, body: string): Material[] {
  const rows: Material[] = []

  let i = 0
  while (i < body.length) {
    if (body[i] !== '(') {
      i += 1
      continue
    }

    const fields: (string | null)[] = []
    let current = ''
    let quoted = false
    let isText = false // told apart from the literal `null` by having been quoted
    i += 1

    while (i < body.length) {
      const char = body[i]

      if (quoted) {
        if (char === "'") {
          if (body[i + 1] === "'") {
            current += "'"
            i += 2
            continue
          }
          quoted = false
          i += 1
          continue
        }
        current += char
        i += 1
        continue
      }

      if (char === "'") {
        quoted = true
        isText = true
        current = '' // the blank between the comma and the quote is not content
        i += 1
        continue
      }
      if (char === ',' || char === ')') {
        fields.push(isText ? current : current.trim() === 'null' ? null : current.trim())
        current = ''
        isText = false
        i += 1
        if (char === ')') break
        continue
      }

      current += char
      i += 1
    }

    expect(fields, `${file}: una fila con ${fields.length} columnas`).toHaveLength(COLUMNS.length)

    rows.push({
      file,
      owner: fields[0] ?? null,
      discipline: fields[1] ?? '',
      area: fields[2] ?? '',
      focus: fields[3] ?? null,
      title: fields[4] ?? '',
      kind: fields[5] ?? '',
      objective: fields[6] ?? null,
      age: fields[7] ?? null,
      content: fields[8] ?? '',
    })
  }

  return rows
}

const files = readdirSync(DIR)
  .filter((name) => name.endsWith('.sql'))
  .sort()

const materials = files.flatMap((name) => parse(name, readFileSync(`${DIR}/${name}`, 'utf8')))

const ownerOf = (material: Material) => material.owner

/** Where a failure is, in the terms the person fixing it works in. */
function where(material: Material) {
  return `${material.file} › ${material.title}`
}

const headingsOf = (material: Material) =>
  material.content.split('\n').map((line) => line.trim()).filter(isHeading)

/**
 * The skeleton of `docs/materiales.md`, as regexes over the subtitle lines.
 *
 * Synonyms, not one fixed wording: the parts have to be there, and the voice of
 * each material is in how it names them. What is not negotiable is that none of
 * them is missing, because each one answers a question a practitioner has in
 * front of a patient and cannot ask anybody.
 */
const SECTIONS: { part: string; re: RegExp }[] = [
  { part: 'para qué sirve', re: /^(Para qué sirve|Para qué es|Por qué|Qué entrena|Qué trabaja)/ },
  { part: 'qué necesitás', re: /^Qué necesitás:/ },
  {
    part: 'cómo se presenta',
    re: /^(Cómo se presenta|Cómo se hace|Cómo se juega|Cómo arranca|Cómo se explica|Cómo se propone)/,
  },
  { part: 'progresión', re: /^(Progresión|Si sale fácil|Si no sale|Cómo se gradúa)/ },
  { part: 'qué mirar', re: /^(Qué mirar|Para observar|Qué observar|Lo que hay que mirar)/ },
  { part: 'dosis', re: /^(Cuánto|Dosis|Cada cuánto)/ },
  { part: 'para casa', re: /^(Para casa|Para la familia|En casa|Para el aula|Para la escuela)/ },
]

/** A numbered block of actual exercises, which is what v1's materials lacked. */
const EXERCISE = /^(Ejercicio|Ronda|Bloque|Serie|Nivel) \d/

/**
 * Age bands each discipline must cover.
 *
 * Not decoration: the first library had all 50 physiotherapy materials at "15+
 * años", so a kinesiólogo who treats children opened the library and found
 * nothing of his own, and occupational therapy and psychomotricity stopped at 9
 * years, which leaves adolescence — where autonomy and daily living are the
 * whole point — empty. Psychomotricity above 15 is a different practice and is
 * deliberately not required.
 */
const AGES_BY_DISCIPLINE: Record<string, readonly string[]> = {
  psychopedagogy: AGE_RANGES,
  speech_therapy: AGE_RANGES,
  occupational_therapy: AGE_RANGES,
  psychology: AGE_RANGES,
  physiotherapy: AGE_RANGES,
  psychomotricity: AGE_RANGES.filter((age) => age !== '15+ años'),
}

describe('la biblioteca compartida', () => {
  it('se pudo leer entera', () => {
    expect(files.length).toBeGreaterThan(0)
    expect(materials.length).toBeGreaterThan(200)
  })

  it('está archivada con el vocabulario que la app ofrece', () => {
    const wrong: string[] = []

    for (const material of materials) {
      const taxonomy = AREAS_BY_DISCIPLINE[material.discipline as keyof typeof AREAS_BY_DISCIPLINE]
      if (!taxonomy) {
        wrong.push(`${where(material)}: disciplina "${material.discipline}"`)
        continue
      }
      const focuses = taxonomy[material.area]
      if (!focuses) {
        wrong.push(`${where(material)}: área "${material.area}"`)
        continue
      }
      if (!material.focus || !focuses.includes(material.focus)) {
        wrong.push(`${where(material)}: foco "${material.focus}" en "${material.area}"`)
      }
    }

    expect(wrong).toEqual([])
  })

  it('usa los tipos y las franjas de edad del filtro', () => {
    const wrong = materials
      .filter(
        (material) =>
          !(material.kind in MATERIAL_KIND_LABELS) ||
          !material.age ||
          !AGE_RANGES.includes(material.age as (typeof AGE_RANGES)[number]),
      )
      .map((material) => `${where(material)}: ${material.kind} / ${material.age}`)

    expect(wrong).toEqual([])
  })

  it('tiene todas sus filas adentro de un insert', () => {
    // Los archivos se escribieron por partes, y una parte que arranca con una
    // fila después del punto y coma de la anterior es SQL que no corre: Postgres
    // devuelve "syntax error at or near null" y el seeding entero se cae. CI lo
    // agarró con 41 filas huérfanas repartidas en cinco archivos.
    const orphans: string[] = []

    for (const name of files) {
      const { between } = statements(readFileSync(`${DIR}/${name}`, 'utf8'))
      for (const gap of between) {
        if (/^\s*\(null,/m.test(gap)) orphans.push(name)
      }
    }

    expect(orphans).toEqual([])
  })

  it('no repite títulos', () => {
    const seen = new Map<string, string>()
    const repeated: string[] = []

    for (const material of materials) {
      const first = seen.get(material.title)
      if (first) repeated.push(`"${material.title}": ${first} y ${material.file}`)
      else seen.set(material.title, material.file)
    }

    expect(repeated).toEqual([])
  })

  it('es contenido compartido, sin dueño', () => {
    // A seeded row with a practitioner_id would be a material sitting inside
    // somebody's private library, and nobody could say whose. Read from the
    // parsed tuple, not from the file: the column list is also a line that
    // starts with a parenthesis.
    const owned = materials.filter((material) => ownerOf(material) !== null).map(where)
    expect(owned).toEqual([])
  })

  it('dice para qué sirve, qué hace falta, cómo se gradúa, qué mirar, cuánto y qué va a casa', () => {
    const missing: string[] = []

    for (const material of materials) {
      const headings = headingsOf(material)
      for (const section of SECTIONS) {
        if (!headings.some((heading) => section.re.test(heading))) {
          missing.push(`${where(material)}: falta ${section.part}`)
        }
      }
    }

    expect(missing).toEqual([])
  })

  it('trae más de un ejercicio, escrito', () => {
    const thin = materials
      .filter((material) => headingsOf(material).filter((h) => EXERCISE.test(h)).length < 2)
      .map((material) => where(material))

    expect(thin).toEqual([])
  })

  it('alcanza para una sesión sin ser una pared de texto', () => {
    const short = materials
      .filter((material) => material.content.length < 1200)
      .map((material) => `${where(material)}: ${material.content.length} caracteres`)
    const long = materials
      .filter((material) => material.content.length > 4000)
      .map((material) => `${where(material)}: ${material.content.length} caracteres`)

    expect(short).toEqual([])
    expect(long).toEqual([])
  })

  it('tiene un objetivo propio, que no es el título de nuevo', () => {
    const wrong = materials
      .filter(
        (material) =>
          !material.objective ||
          material.objective.length < 25 ||
          material.objective.length > 140 ||
          material.objective.toLowerCase() === material.title.toLowerCase(),
      )
      .map((material) => `${where(material)}: ${material.objective}`)

    expect(wrong).toEqual([])
  })

  it('se va a dibujar como está escrito', () => {
    const broken: string[] = []

    for (const material of materials) {
      for (const line of material.content.split('\n')) {
        const text = line.trim()
        if (!text) continue

        // A long line ending in a colon is not a heading (see `isHeading`), so
        // it renders as a paragraph that reads like a broken one.
        if (text.endsWith(':') && text.length > 60) {
          broken.push(`${where(material)}: subtítulo de ${text.length} caracteres: "${text}"`)
        }
        // v1 wrote lists with hyphens and middle dots; the renderer draws `•`.
        if (/^[-*·]\s/.test(text)) broken.push(`${where(material)}: viñeta "${text.slice(0, 30)}"`)
        if (text === '•') broken.push(`${where(material)}: una viñeta vacía`)
      }
    }

    expect(broken).toEqual([])
  })

  it('está escrito con lo que se imprime igual en cualquier máquina', () => {
    // Emoji and geometric symbols as content: v1 asked a six year old to match
    // "⬠" with "pentágono", and on half the devices that is an empty box. Rayas
    // are the house convention, everywhere in the product.
    const wrong: string[] = []

    for (const material of materials) {
      const text = `${material.title} ${material.objective ?? ''} ${material.content}`
      const exotic = [...text].filter((char) => char.codePointAt(0)! > 0x00ff && char !== '•')
      if (exotic.length > 0) {
        wrong.push(`${where(material)}: ${[...new Set(exotic)].join(' ')}`)
      }
      if (/[—–]/.test(text)) wrong.push(`${where(material)}: una raya`)
    }

    expect(wrong).toEqual([])
  })

  it('no deja vacío ningún filtro de la app', () => {
    const empty: string[] = []

    for (const [discipline, areas] of Object.entries(AREAS_BY_DISCIPLINE)) {
      for (const [area, focuses] of Object.entries(areas)) {
        for (const focus of focuses) {
          const count = materials.filter(
            (material) =>
              material.discipline === discipline &&
              material.area === area &&
              material.focus === focus,
          ).length
          if (count === 0) empty.push(`${discipline} › ${area} › ${focus}`)
        }
      }
    }

    expect(empty).toEqual([])
  })

  it('cubre las edades que cada profesión atiende', () => {
    const empty: string[] = []

    for (const [discipline, ages] of Object.entries(AGES_BY_DISCIPLINE)) {
      for (const age of ages) {
        const count = materials.filter(
          (material) => material.discipline === discipline && material.age === age,
        ).length
        if (count === 0) empty.push(`${discipline}: nada para ${age}`)
      }
    }

    expect(empty).toEqual([])
  })
})
