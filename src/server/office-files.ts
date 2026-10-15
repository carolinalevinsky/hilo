import { inflateRawSync } from 'node:zlib'

import { canDescribe, type Attachment } from './ai'

/**
 * Reading the files practitioners already keep their work in: Excel, Word and
 * CSV.
 *
 * An `.xlsx` and a `.docx` are zip archives of XML. Node already inflates zip
 * entries, and what is needed from the XML is the text of cells and paragraphs —
 * formatting, formulas and images are irrelevant to importing a list of patients
 * or the activities in a plan. So this is a reader of exactly that, with no
 * dependency, rather than a spreadsheet library the size of a spreadsheet
 * program.
 *
 * Everything here works on bytes that came from a stranger's computer. The
 * limits below are what keep a crafted archive from inflating into gigabytes.
 */

export class OfficeFileError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OfficeFileError'
  }
}

const UNREADABLE = 'No pudimos abrir el archivo. Probá guardarlo de nuevo desde Excel o Word.'

/** No single entry of a real spreadsheet or document comes near this. */
const MAX_ENTRY_BYTES = 40 * 1024 * 1024

// ─── Zip ──────────────────────────────────────────────────────────────────────

/**
 * The entries of a zip archive, by name, inflated on demand.
 *
 * Read through the central directory at the end of the file, not by walking the
 * local headers: the central directory always carries the real sizes, while a
 * local header written in streaming mode may say zero and put them after the
 * data.
 */
export function readZip(bytes: Uint8Array): Map<string, () => Buffer> {
  const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  // End of central directory: 22 bytes plus a comment of up to 65535.
  let end = -1
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65_557); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      end = i
      break
    }
  }
  if (end < 0) throw new OfficeFileError(UNREADABLE)

  const count = buffer.readUInt16LE(end + 10)
  let at = buffer.readUInt32LE(end + 16)
  const entries = new Map<string, () => Buffer>()

  for (let n = 0; n < count; n++) {
    if (at + 46 > buffer.length || buffer.readUInt32LE(at) !== 0x02014b50) {
      throw new OfficeFileError(UNREADABLE)
    }
    const method = buffer.readUInt16LE(at + 10)
    const compressedSize = buffer.readUInt32LE(at + 20)
    const nameLength = buffer.readUInt16LE(at + 28)
    const extraLength = buffer.readUInt16LE(at + 30)
    const commentLength = buffer.readUInt16LE(at + 32)
    const localOffset = buffer.readUInt32LE(at + 42)
    const name = buffer.toString('utf8', at + 46, at + 46 + nameLength)
    at += 46 + nameLength + extraLength + commentLength

    entries.set(name, () => {
      if (localOffset + 30 > buffer.length || buffer.readUInt32LE(localOffset) !== 0x04034b50) {
        throw new OfficeFileError(UNREADABLE)
      }
      const start =
        localOffset + 30 + buffer.readUInt16LE(localOffset + 26) + buffer.readUInt16LE(localOffset + 28)
      const data = buffer.subarray(start, start + compressedSize)

      if (method === 0) return data
      if (method === 8) {
        try {
          return inflateRawSync(data, { maxOutputLength: MAX_ENTRY_BYTES })
        } catch {
          throw new OfficeFileError(UNREADABLE)
        }
      }
      throw new OfficeFileError(UNREADABLE)
    })
  }

  return entries
}

function entryText(entries: Map<string, () => Buffer>, name: string): string | null {
  const read = entries.get(name)
  return read ? read().toString('utf8') : null
}

// ─── XML, only as much as needed ─────────────────────────────────────────────

export function decodeXml(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (whole, entity: string) => {
    const lower = entity.toLowerCase()
    if (lower === 'amp') return '&'
    if (lower === 'lt') return '<'
    if (lower === 'gt') return '>'
    if (lower === 'quot') return '"'
    if (lower === 'apos') return "'"
    const code = lower.startsWith('#x') ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10)
    return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole
  })
}

/** All the `<t>` text inside a fragment, joined: a cell or a run of rich text. */
function textRuns(fragment: string, tag: string): string {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g')
  let text = ''
  for (const match of fragment.matchAll(pattern)) text += decodeXml(match[1] ?? '')
  return text
}

// ─── Excel ────────────────────────────────────────────────────────────────────

/** `B` → 1, `AA` → 26. */
function columnIndex(reference: string): number {
  const letters = reference.match(/^[A-Z]+/i)?.[0].toUpperCase() ?? 'A'
  let index = 0
  for (const letter of letters) index = index * 26 + (letter.charCodeAt(0) - 64)
  return index - 1
}

/**
 * The first sheet of a workbook as rows of strings.
 *
 * Only the first sheet: a list of patients is one table, and guessing which of
 * five tabs is the right one would be wrong more often than asking the
 * practitioner to put it first. Dates come out as Excel's day numbers — a cell
 * does not say it is a date without reading the styles, and the column it is
 * under does. See `parseDate` in `patient-import.ts`.
 */
export function xlsxRows(bytes: Uint8Array): string[][] {
  const entries = readZip(bytes)

  const shared: string[] = []
  const sharedXml = entryText(entries, 'xl/sharedStrings.xml')
  if (sharedXml) {
    for (const item of sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
      shared.push(textRuns(item[1] ?? '', 't'))
    }
  }

  const sheetXml = entryText(entries, firstSheetPath(entries))
  if (!sheetXml) throw new OfficeFileError('El Excel no tiene ninguna hoja con datos.')

  const rows: string[][] = []
  for (const row of sheetXml.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const cells: string[] = []
    let next = 0
    for (const cell of (row[1] ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attributes = cell[1] ?? ''
      const body = cell[2] ?? ''
      const reference = attributes.match(/\br="([A-Z]+)\d*"/i)?.[1]
      const index = reference ? columnIndex(reference) : next
      next = index + 1

      const type = attributes.match(/\bt="(\w+)"/)?.[1]
      const value = decodeXml(body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? '')

      let text: string
      if (type === 's') text = shared[Number(value)] ?? ''
      else if (type === 'inlineStr') text = textRuns(body, 't')
      else if (type === 'b') text = value === '1' ? 'Sí' : 'No'
      else text = value

      cells[index] = text.trim()
    }
    rows.push(Array.from(cells, (cell) => cell ?? ''))
  }

  return rows
}

function firstSheetPath(entries: Map<string, () => Buffer>): string {
  const workbook = entryText(entries, 'xl/workbook.xml') ?? ''
  const rels = entryText(entries, 'xl/_rels/workbook.xml.rels') ?? ''
  const id = workbook.match(/<sheet\b[^>]*\br:id="([^"]+)"/)?.[1]

  if (id) {
    for (const rel of rels.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
      const attributes = rel[1] ?? ''
      if (attributes.match(/\bId="([^"]+)"/)?.[1] !== id) continue
      const target = attributes.match(/\bTarget="([^"]+)"/)?.[1]
      if (target) return target.startsWith('/') ? target.slice(1) : `xl/${target}`
    }
  }

  const sheets = [...entries.keys()].filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
  sheets.sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]))
  return sheets[0] ?? 'xl/worksheets/sheet1.xml'
}

// ─── Word ─────────────────────────────────────────────────────────────────────

/**
 * The text of a Word document, one paragraph per line.
 *
 * Tables come out as their cells' paragraphs in reading order, which is how a
 * plan written in a table — one row per activity — still reads as a plan.
 */
export function docxText(bytes: Uint8Array): string {
  const xml = entryText(readZip(bytes), 'word/document.xml')
  if (!xml) throw new OfficeFileError('Ese archivo no parece un Word (.docx).')

  const paragraphs: string[] = []
  for (const paragraph of xml.matchAll(/<w:p\b[^>]*?(?:\/>|>([\s\S]*?)<\/w:p>)/g)) {
    const body = (paragraph[1] ?? '')
      .replace(/<w:tab\/>/g, '<w:t>\t</w:t>')
      .replace(/<w:br\b[^>]*\/>/g, '<w:t>\n</w:t>')
    paragraphs.push(textRuns(body, 'w:t'))
  }

  return paragraphs
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

/**
 * Bytes to text, for a CSV whose encoding nobody wrote down.
 *
 * Excel on Windows still saves "CSV" in Windows-1252, where "Martínez" is not
 * valid UTF-8. Reading it as UTF-8 first and falling back when that produces
 * replacement characters gets both right.
 */
export function decodeText(bytes: Uint8Array): string {
  const utf8 = new TextDecoder('utf-8').decode(bytes)
  const text = utf8.includes('�') ? new TextDecoder('windows-1252').decode(bytes) : utf8
  return text.replace(/^﻿/, '')
}

/**
 * A CSV as rows of strings.
 *
 * The separator is whichever of `;`, `,` and tab appears most in the first line:
 * an Excel set to Spanish separates with `;` because `,` is the decimal mark,
 * and Google Sheets uses `,`.
 */
export function csvRows(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const separator = [';', ',', '\t'].reduce((best, candidate) =>
    firstLine.split(candidate).length > firstLine.split(best).length ? candidate : best,
  )

  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
    } else if (char === '"' && cell === '') {
      quoted = true
    } else if (char === separator) {
      row.push(cell.trim())
      cell = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(cell.trim())
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell.trim())
    rows.push(row)
  }

  return rows
}

// ─── Which kind of file ──────────────────────────────────────────────────────

export type SpreadsheetKind = 'xlsx' | 'csv'

/** By extension first: browsers disagree about the media type of a CSV. */
export function spreadsheetKind(fileName: string, mediaType: string): SpreadsheetKind | null {
  const name = fileName.toLowerCase()
  if (name.endsWith('.xlsx') || mediaType.includes('spreadsheetml')) return 'xlsx'
  if (name.endsWith('.csv') || name.endsWith('.txt') || mediaType === 'text/csv') return 'csv'
  return null
}

export function isDocx(fileName: string, mediaType: string): boolean {
  return (
    fileName.toLowerCase().endsWith('.docx') || mediaType.includes('wordprocessingml.document')
  )
}

// ─── A document for the AI to read ───────────────────────────────────────────

/**
 * Vercel refuses a request body above 4.5 MB before any of our code runs, so a
 * bigger limit here would be a promise the platform breaks with a bare error.
 */
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024

export type ReadableDocument =
  | { kind: 'text'; text: string }
  | { kind: 'file'; attachment: Attachment }

/**
 * A Word file, a PDF or a photo, in the form the model takes it.
 *
 * Word goes as its text, not as a file: the API does not read `.docx`, and text
 * is the one form in which a patient's name can be hidden before it leaves (see
 * `streamCompletion`'s `aliases`). A PDF or a photo goes as it is.
 */
export function readDocument(file: {
  name: string
  type: string
  bytes: Uint8Array
}): ReadableDocument {
  if (file.bytes.byteLength === 0) throw new OfficeFileError('El archivo está vacío.')
  if (file.bytes.byteLength > MAX_DOCUMENT_BYTES) {
    throw new OfficeFileError('El archivo pesa más de 4 MB. Probá con una foto más liviana o partí el PDF.')
  }

  if (isDocx(file.name, file.type)) {
    const text = docxText(file.bytes)
    if (text.length < 20) throw new OfficeFileError('El Word está vacío o tiene sólo imágenes. Subilo como PDF.')
    return { kind: 'text', text: text.slice(0, 60_000) }
  }

  if (file.name.toLowerCase().endsWith('.doc')) {
    throw new OfficeFileError('Ese es el formato viejo de Word (.doc). Abrilo y guardalo como .docx o como PDF.')
  }

  if (/^image\/hei[cf]$/.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
    throw new OfficeFileError(
      'Las fotos HEIC del iPhone no las puede leer la IA. Sacá una captura de pantalla de la foto y subí esa.',
    )
  }

  if (!canDescribe(file.type)) {
    throw new OfficeFileError('Subí un Word (.docx), un PDF o una foto (JPG o PNG).')
  }

  return {
    kind: 'file',
    attachment: { mediaType: file.type, data: Buffer.from(file.bytes).toString('base64') },
  }
}
