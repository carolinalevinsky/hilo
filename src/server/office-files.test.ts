import { deflateRawSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import {
  csvRows,
  decodeText,
  docxText,
  OfficeFileError,
  readDocument,
  readZip,
  xlsxRows,
} from './office-files'

/**
 * A minimal zip writer, so the tests build real `.xlsx` and `.docx` files from
 * a few lines of XML instead of checking in binaries nobody can read in a diff.
 * One entry stored and the rest deflated, so both methods are exercised.
 */
function zip(entries: Record<string, string>): Uint8Array {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0

  Object.entries(entries).forEach(([name, text], index) => {
    const raw = Buffer.from(text, 'utf8')
    const method = index === 0 ? 0 : 8
    const data = method === 0 ? raw : deflateRawSync(raw)
    const nameBytes = Buffer.from(name, 'utf8')

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(method, 8)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(raw.length, 22)
    local.writeUInt16LE(nameBytes.length, 26)
    locals.push(local, nameBytes, data)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(method, 10)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(raw.length, 24)
    central.writeUInt16LE(nameBytes.length, 28)
    central.writeUInt32LE(offset, 42)
    centrals.push(central, nameBytes)

    offset += 30 + nameBytes.length + data.length
  })

  const directory = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(Object.keys(entries).length, 8)
  end.writeUInt16LE(Object.keys(entries).length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)

  return new Uint8Array(Buffer.concat([...locals, directory, end]))
}

describe('readZip', () => {
  it('reads stored and deflated entries', () => {
    const entries = readZip(zip({ 'a.txt': 'hola', 'b.txt': 'chau '.repeat(50) }))
    expect(entries.get('a.txt')!().toString()).toBe('hola')
    expect(entries.get('b.txt')!().toString()).toBe('chau '.repeat(50))
  })

  it('refuses something that is not a zip', () => {
    expect(() => readZip(new TextEncoder().encode('no soy un zip'))).toThrow(OfficeFileError)
  })
})

describe('xlsxRows', () => {
  const workbook = (sheet: string, shared = '') =>
    zip({
      'xl/workbook.xml':
        '<workbook><sheets><sheet name="Pacientes" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels':
        '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>',
      'xl/sharedStrings.xml': `<sst>${shared}</sst>`,
      'xl/worksheets/sheet1.xml': `<worksheet><sheetData>${sheet}</sheetData></worksheet>`,
    })

  it('reads shared strings, rich text, inline strings and numbers', () => {
    const rows = xlsxRows(
      workbook(
        '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>' +
          '<row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" s="3"><v>42005</v></c></row>' +
          '<row r="3"><c r="A3" t="inlineStr"><is><t>Ana &amp; Bea</t></is></c></row>',
        '<si><t>Nombre</t></si><si><t>Fecha de nacimiento</t></si>' +
          '<si><r><t>Tomás </t></r><r><t xml:space="preserve">Pérez</t></r></si>',
      ),
    )
    expect(rows).toEqual([
      ['Nombre', 'Fecha de nacimiento'],
      ['Tomás Pérez', '42005'],
      ['Ana & Bea'],
    ])
  })

  it('keeps columns in place when a cell is missing, and survives empty rows', () => {
    const rows = xlsxRows(
      workbook(
        '<row r="1"><c r="A1" t="inlineStr"><is><t>a</t></is></c><c r="C1" t="inlineStr"><is><t>c</t></is></c></row>' +
          '<row r="2"/>' +
          '<row r="3"><c r="B3" t="inlineStr"><is><t>b</t></is></c></row>',
      ),
    )
    expect(rows).toEqual([['a', '', 'c'], [], ['', 'b']])
  })
})

describe('docxText', () => {
  it('reads paragraphs in order, including empty ones and tables', () => {
    const text = docxText(
      zip({
        '[Content_Types].xml': '<Types/>',
        'word/document.xml':
          '<w:document><w:body>' +
          '<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>Bingo de sonidos</w:t></w:r></w:p>' +
          '<w:p w:rsidR="00A1"/>' +
          '<w:p><w:r><w:t xml:space="preserve">Materiales: </w:t></w:r><w:r><w:t>cartones</w:t></w:r></w:p>' +
          '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Paso 1</w:t></w:r></w:p></w:tc></w:tr></w:tbl>' +
          '</w:body></w:document>',
      }),
    )
    expect(text).toBe('Bingo de sonidos\n\nMateriales: cartones\nPaso 1')
  })

  it('says so when the zip is not a Word document', () => {
    expect(() => docxText(zip({ 'otra.xml': '<x/>' }))).toThrow(/Word/)
  })
})

describe('csvRows', () => {
  it('detects the semicolon a Spanish Excel uses, and honours quotes', () => {
    expect(csvRows('Nombre;Motivo\r\nTomás;"Lee lento; se frustra"\r\n"Ana ""Anita""";\n')).toEqual([
      ['Nombre', 'Motivo'],
      ['Tomás', 'Lee lento; se frustra'],
      ['Ana "Anita"', ''],
    ])
  })

  it('detects commas from Google Sheets', () => {
    expect(csvRows('Nombre,Teléfono\nLucía,099 123 456')).toEqual([
      ['Nombre', 'Teléfono'],
      ['Lucía', '099 123 456'],
    ])
  })
})

describe('decodeText', () => {
  it('reads a Windows-1252 CSV without mangling accents', () => {
    // "Martínez" in Windows-1252: í is a single byte, 0xED.
    const bytes = new Uint8Array([0x4d, 0x61, 0x72, 0x74, 0xed, 0x6e, 0x65, 0x7a])
    expect(decodeText(bytes)).toBe('Martínez')
  })

  it('drops the byte-order mark', () => {
    expect(decodeText(new TextEncoder().encode('﻿Nombre'))).toBe('Nombre')
  })
})

describe('readDocument', () => {
  const docx = zip({
    'word/document.xml':
      '<w:document><w:body><w:p><w:r><w:t>Actividad: bingo de sonidos iniciales con cartones</w:t></w:r></w:p></w:body></w:document>',
  })

  it('sends a Word file as its text', () => {
    const read = readDocument({ name: 'plan.docx', type: '', bytes: docx })
    expect(read).toEqual({ kind: 'text', text: 'Actividad: bingo de sonidos iniciales con cartones' })
  })

  it('sends a PDF as a file', () => {
    const read = readDocument({ name: 'plan.pdf', type: 'application/pdf', bytes: new Uint8Array([1, 2, 3]) })
    expect(read.kind).toBe('file')
  })

  it('refuses what the model cannot read, saying what to do instead', () => {
    expect(() =>
      readDocument({ name: 'IMG_1.HEIC', type: 'image/heic', bytes: new Uint8Array([1]) }),
    ).toThrow(/captura/)
    expect(() =>
      readDocument({ name: 'viejo.doc', type: 'application/msword', bytes: new Uint8Array([1]) }),
    ).toThrow(/\.docx/)
    expect(() =>
      readDocument({
        name: 'grande.pdf',
        type: 'application/pdf',
        bytes: new Uint8Array(4 * 1024 * 1024 + 1),
      }),
    ).toThrow(/4 MB/)
  })
})
