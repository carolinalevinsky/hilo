import { z } from 'zod'

import { today } from '@/lib/dates'
import { type ImportField } from '@/lib/patient-labels'

import { getDb } from './db'
import {
  csvRows,
  decodeText,
  OfficeFileError,
  spreadsheetKind,
  xlsxRows,
} from './office-files'
import { createPatient, GUARDIAN_RELATIONSHIPS, PatientInput } from './patients'

/**
 * Bringing a practitioner's patients in from the spreadsheet they already have.
 *
 * **No AI here, on purpose.** A list of patients is names, birth dates and
 * phone numbers of children, and Ombúa promises that a patient's name does not
 * reach the AI provider. A spreadsheet has columns with titles, and recognising
 * "F. nac." as a date of birth is a lookup, not a judgement — so it is done
 * here, and the file never leaves the server.
 *
 * Two steps, and nothing is written in the first: `previewPatientImport` reads
 * the file and says what it understood, row by row; the practitioner unticks
 * whatever is wrong; `importPatients` creates exactly the rows that came back.
 */

/** A file that took longer than this to type is not a list of one person's patients. */
export const MAX_IMPORT_ROWS = 500

type Column = ImportField | 'lastName' | 'age'

/**
 * The titles people actually give these columns, folded (lowercase, no
 * accents, no punctuation). A title matches a field when it *is* one of these,
 * or contains one; the longest match wins, which is what keeps "nombre del
 * responsable" out of the patient's name.
 */
const HEADERS: Record<Column, string[]> = {
  fullName: [
    'nombre y apellido',
    'nombre y apellidos',
    'apellido y nombre',
    'nombre completo',
    'nombre del paciente',
    'paciente',
    'nombre',
    'nombres',
  ],
  lastName: ['apellido', 'apellidos'],
  dateOfBirth: [
    'fecha de nacimiento',
    'fecha nacimiento',
    'nacimiento',
    'f nac',
    'fnac',
    'fecha nac',
    'fecha de nac',
    'cumpleanos',
  ],
  age: ['edad'],
  school: [
    'centro educativo',
    'colegio',
    'escuela',
    'liceo',
    'institucion',
    'institucion educativa',
    'jardin',
    'utu',
  ],
  schoolLevel: ['clase', 'grado', 'curso', 'nivel', 'ano escolar', 'ano'],
  healthInsurer: [
    'mutualista',
    'mutual',
    'prestador',
    'prestador de salud',
    'sociedad medica',
    'cobertura',
    'obra social',
    'seguro',
  ],
  phone: [
    'telefono',
    'telefonos',
    'tel',
    'celular',
    'cel',
    'movil',
    'whatsapp',
    'contacto',
    'telefono del responsable',
  ],
  guardianName: [
    'responsable',
    'nombre del responsable',
    'adulto responsable',
    'referente',
    'madre',
    'padre',
    'tutor',
    'tutora',
    'familia',
    'mama',
    'papa',
  ],
  guardianEmail: ['mail', 'email', 'e mail', 'correo', 'correo electronico'],
  referralReason: [
    'motivo de consulta',
    'motivo',
    'motivo de derivacion',
    'derivacion',
    'derivado por',
  ],
  startDate: ['fecha de inicio', 'inicio', 'ingreso', 'fecha de ingreso', 'inicio del tratamiento'],
}

export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9@]+/g, ' ')
    .trim()
}

/** Which field a column title means, or `null` when it is none of ours. */
export function columnFor(title: string): Column | null {
  const folded = fold(title)
  if (!folded) return null

  let best: { column: Column; score: number } | null = null
  for (const [column, names] of Object.entries(HEADERS) as [Column, string[]][]) {
    for (const name of names) {
      const score =
        folded === name
          ? 1000 + name.length
          : name.length >= 4 && ` ${folded} `.includes(` ${name} `)
            ? name.length
            : 0
      if (score > (best?.score ?? 0)) best = { column, score }
    }
  }
  return best?.column ?? null
}

/** A guardian column titled "Madre" says who the guardian is. */
function relationshipFor(title: string): (typeof GUARDIAN_RELATIONSHIPS)[number] | null {
  const folded = fold(title)
  if (/\b(madre|mama)\b/.test(folded)) return 'mother'
  if (/\b(padre|papa)\b/.test(folded)) return 'father'
  if (/\btutora?\b/.test(folded)) return 'guardian'
  return null
}

// ─── Dates ──────────────────────────────────────────────────────────────────

function isoDate(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return date.toISOString().slice(0, 10)
}

/**
 * A date as it appears in a Uruguayan spreadsheet, to `YYYY-MM-DD`.
 *
 * Day first, always: `03/04/2018` is the 3rd of April here. Two-digit years are
 * read as the most recent past year that ends that way, because these are
 * birth dates and treatment starts, not appointments. A bare number between 1
 * and 80000 is Excel's day count, which is what a date cell holds in an `.xlsx`.
 */
export function parseDate(value: string, todayIso = today()): string | null {
  const text = value.trim()
  if (!text) return null

  if (/^\d{1,5}(\.\d+)?$/.test(text)) {
    const serial = Math.floor(Number(text))
    if (serial < 1 || serial > 80_000) return null
    // Excel's day 1 is 1900-01-01, and it counts a 29 February 1900 that never
    // existed; day 0 of the count below is therefore 1899-12-30.
    return new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000).toISOString().slice(0, 10)
  }

  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))

  const local = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/)
  if (local) {
    let year = Number(local[3])
    if (local[3]!.length === 2) {
      const century = Number(todayIso.slice(0, 2)) * 100
      const thisYear = Number(todayIso.slice(0, 4))
      year = century + year > thisYear ? century - 100 + year : century + year
    }
    return isoDate(year, Number(local[2]), Number(local[1]))
  }

  return null
}

/** Whole years between a birth date and today. */
function yearsOld(dateOfBirth: string, todayIso: string): number {
  const [by, bm, bd] = dateOfBirth.split('-').map(Number) as [number, number, number]
  const [ty, tm, td] = todayIso.split('-').map(Number) as [number, number, number]
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0)
}

function ageGroupFor(years: number | null): 'children' | 'adolescents' | 'adults' {
  if (years === null) return 'children'
  if (years >= 18) return 'adults'
  if (years >= 13) return 'adolescents'
  return 'children'
}

// ─── Preview ────────────────────────────────────────────────────────────────

export type ImportRow = {
  /** The spreadsheet's own row number, so "fila 14" means the same in both places. */
  line: number
  values: Partial<Record<ImportField, string>>
  ageGroup: 'children' | 'adolescents' | 'adults'
  guardianRelationship: (typeof GUARDIAN_RELATIONSHIPS)[number] | null
  /** Things that will not be imported as written, in Spanish. Empty is good. */
  notes: string[]
  /** Somebody with this name is already in Ombúa. */
  duplicate: boolean
}

export type ImportPreview = {
  /** What each recognised column became, for the line above the table. */
  recognised: { title: string; field: ImportField }[]
  /** Column titles nothing was done with. Said out loud, so nobody expects them. */
  ignored: string[]
  rows: ImportRow[]
}

export class PatientImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PatientImportError'
  }
}

/**
 * Reads a spreadsheet and says what would be imported. Writes nothing.
 *
 * The header row is the first of the top five with a column we recognise, so a
 * sheet with a title and a blank line above the table still works.
 */
export async function previewPatientImport(
  practitionerId: string,
  file: { name: string; type: string; bytes: Uint8Array },
  todayIso = today(),
): Promise<ImportPreview> {
  const kind = spreadsheetKind(file.name, file.type)
  if (!kind) {
    throw new PatientImportError(
      file.name.toLowerCase().endsWith('.xls')
        ? 'Ese es el formato viejo de Excel (.xls). Abrilo y guardalo como .xlsx, o como CSV.'
        : 'Subí una planilla de Excel (.xlsx) o un CSV. Desde Google Sheets: Archivo → Descargar → Microsoft Excel.',
    )
  }

  let table: string[][]
  try {
    table = kind === 'xlsx' ? xlsxRows(file.bytes) : csvRows(decodeText(file.bytes))
  } catch (error) {
    if (error instanceof OfficeFileError) throw new PatientImportError(error.message)
    throw error
  }

  const headerIndex = table
    .slice(0, 5)
    .findIndex((row) => row.some((title) => columnFor(title) === 'fullName'))
  if (headerIndex < 0) {
    throw new PatientImportError(
      'No encontramos la columna con el nombre de los pacientes. Fijate que la primera fila tenga los títulos, por ejemplo «Nombre», «Fecha de nacimiento», «Teléfono».',
    )
  }

  const titles = table[headerIndex]!
  const columns = titles.map((title) => columnFor(title))

  // Each field from its first column only. A second "Teléfono" is ignored and
  // listed as such, rather than silently overwriting the first.
  const taken = new Set<Column>()
  const used = columns.map((column) => {
    if (!column || taken.has(column)) return null
    taken.add(column)
    return column
  })

  const recognised: ImportPreview['recognised'] = []
  const ignored: string[] = []
  titles.forEach((title, index) => {
    const column = used[index]
    if (!title.trim()) return
    if (column && column !== 'lastName' && column !== 'age') {
      recognised.push({ title, field: column })
    } else if (!column) {
      ignored.push(title)
    }
  })

  const guardianIndex = used.indexOf('guardianName')
  const relationship = guardianIndex >= 0 ? relationshipFor(titles[guardianIndex]!) : null

  const existing = await existingNames(practitionerId)
  const seen = new Set<string>()

  const body = table.slice(headerIndex + 1)
  if (body.filter((row) => row.some(Boolean)).length > MAX_IMPORT_ROWS) {
    throw new PatientImportError(
      `La planilla tiene más de ${MAX_IMPORT_ROWS} filas. Partila en dos y subí cada parte.`,
    )
  }

  const rows: ImportRow[] = []
  body.forEach((cells, offset) => {
    if (!cells.some((cell) => cell.trim())) return

    const raw: Partial<Record<Column, string>> = {}
    used.forEach((column, index) => {
      const value = cells[index]?.trim()
      if (column && value) raw[column] = value
    })

    const notes: string[] = []
    const values: ImportRow['values'] = {}

    const name = [raw.fullName, raw.lastName].filter(Boolean).join(' ').replace(/\s+/g, ' ')
    if (!name) return
    values.fullName = name

    for (const field of ['school', 'schoolLevel', 'healthInsurer', 'phone', 'guardianName', 'referralReason'] as const) {
      if (raw[field]) values[field] = raw[field]
    }

    if (raw.guardianEmail) {
      if (z.email().safeParse(raw.guardianEmail).success) values.guardianEmail = raw.guardianEmail
      else notes.push(`El correo «${raw.guardianEmail}» no parece un correo; queda afuera.`)
    }

    let years: number | null = null
    if (raw.dateOfBirth) {
      const date = parseDate(raw.dateOfBirth, todayIso)
      if (date && date <= todayIso) {
        values.dateOfBirth = date
        years = yearsOld(date, todayIso)
      } else {
        notes.push(`No entendimos la fecha de nacimiento «${raw.dateOfBirth}»; queda vacía.`)
      }
    }
    if (years === null && raw.age && /^\d{1,3}$/.test(raw.age)) years = Number(raw.age)

    if (raw.startDate) {
      const date = parseDate(raw.startDate, todayIso)
      if (date) values.startDate = date
      else notes.push(`No entendimos la fecha de inicio «${raw.startDate}»; queda vacía.`)
    }

    const key = fold(name)
    rows.push({
      line: headerIndex + offset + 2,
      values,
      ageGroup: ageGroupFor(years),
      guardianRelationship: values.guardianName ? relationship : null,
      notes,
      duplicate: existing.has(key) || seen.has(key),
    })
    seen.add(key)
  })

  if (rows.length === 0) {
    throw new PatientImportError('La planilla tiene los títulos pero ningún paciente abajo.')
  }

  return { recognised, ignored, rows }
}

/** Everybody already in Ombúa, archived included: archiving is not leaving. */
async function existingNames(practitionerId: string): Promise<Set<string>> {
  const db = await getDb()
  const { data, error } = await db
    .from('patients')
    .select('full_name')
    .eq('practitioner_id', practitionerId)
    .is('deleted_at', null)
  if (error) throw error
  return new Set((data ?? []).map((row) => fold(row.full_name)))
}

// ─── Import ─────────────────────────────────────────────────────────────────

/**
 * Creates the rows the practitioner kept ticked.
 *
 * Every row goes through `PatientInput` and `createPatient`, the same path as
 * the form: the preview is a suggestion that travelled through the browser, and
 * the browser is not where anything is decided. All rows are checked before
 * the first is written, so a bad row refuses the import instead of leaving it
 * half done.
 */
export async function importPatients(practitionerId: string, input: unknown) {
  const rows = z.array(z.unknown()).min(1, 'Elegí al menos un paciente.').max(MAX_IMPORT_ROWS).parse(input)

  const parsed = rows.map((row, index) => {
    const result = PatientInput.safeParse(row)
    if (!result.success) {
      throw new PatientImportError(
        `El paciente número ${index + 1} tiene un dato que no podemos guardar: ${result.error.issues[0]?.message ?? 'revisalo'}.`,
      )
    }
    return result.data
  })

  for (const data of parsed) await createPatient(practitionerId, data)
  return parsed.length
}
