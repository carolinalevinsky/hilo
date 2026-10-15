import { describe, expect, it, vi } from 'vitest'

const existing = vi.hoisted(() => ({ names: [] as string[] }))
const created = vi.hoisted(() => ({ rows: [] as unknown[] }))

vi.mock('./db', () => ({
  getDb: async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          is: async () => ({
            data: existing.names.map((full_name) => ({ full_name })),
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

vi.mock('./patients', async (original) => ({
  ...(await original<typeof import('./patients')>()),
  createPatient: async (_practitionerId: string, input: unknown) => {
    created.rows.push(input)
    return input
  },
}))

import {
  columnFor,
  importPatients,
  parseDate,
  PatientImportError,
  previewPatientImport,
} from './patient-import'

const TODAY = '2026-10-15'
const csv = (text: string) => ({ name: 'pacientes.csv', type: 'text/csv', bytes: new TextEncoder().encode(text) })

describe('columnFor', () => {
  it.each([
    ['Nombre', 'fullName'],
    ['Nombre y apellido', 'fullName'],
    ['NOMBRE DEL PACIENTE', 'fullName'],
    ['Apellido', 'lastName'],
    ['F. Nac.', 'dateOfBirth'],
    ['Fecha de nacimiento', 'dateOfBirth'],
    ['Colegio', 'school'],
    ['Año', 'schoolLevel'],
    ['Mutualista', 'healthInsurer'],
    ['Cel.', 'phone'],
    ['Teléfono del responsable', 'phone'],
    ['Nombre del responsable', 'guardianName'],
    ['Madre', 'guardianName'],
    ['E-mail', 'guardianEmail'],
    ['Motivo de consulta', 'referralReason'],
    ['Fecha de ingreso', 'startDate'],
  ])('«%s» is %s', (title, field) => {
    expect(columnFor(title)).toBe(field)
  })

  it('leaves alone what it does not know', () => {
    expect(columnFor('Observaciones')).toBeNull()
    expect(columnFor('')).toBeNull()
  })
})

describe('parseDate', () => {
  it('reads day first, as in Uruguay', () => {
    expect(parseDate('03/04/2018', TODAY)).toBe('2018-04-03')
    expect(parseDate('3-4-2018', TODAY)).toBe('2018-04-03')
    expect(parseDate('2018-04-03', TODAY)).toBe('2018-04-03')
  })

  it('puts two-digit years in the past', () => {
    expect(parseDate('03/04/18', TODAY)).toBe('2018-04-03')
    expect(parseDate('03/04/95', TODAY)).toBe('1995-04-03')
  })

  it("reads Excel's day numbers", () => {
    expect(parseDate('42005', TODAY)).toBe('2015-01-01')
  })

  it('refuses what is not a date', () => {
    expect(parseDate('31/02/2018', TODAY)).toBeNull()
    expect(parseDate('marzo', TODAY)).toBeNull()
  })
})

describe('previewPatientImport', () => {
  it('reads a typical sheet: title row above, separate surname, notes for what it could not read', async () => {
    existing.names = ['Lucía Gómez']
    const preview = await previewPatientImport(
      'practitioner',
      csv(
        'Mis pacientes 2026;;;;\n' +
          'Nombre;Apellido;F. nac.;Madre;Observaciones\n' +
          'Tomás;Pérez;03/04/2018;Laura Pérez;viene los martes\n' +
          ';;;;\n' +
          'Lucía;Gómez;ayer;;\n' +
          'Martina;Silva;10/10/2010;;\n',
      ),
      TODAY,
    )

    expect(preview.recognised.map((column) => column.field)).toEqual([
      'fullName',
      'dateOfBirth',
      'guardianName',
    ])
    expect(preview.ignored).toEqual(['Observaciones'])
    expect(preview.rows).toHaveLength(3)

    const [tomas, lucia, martina] = preview.rows
    expect(tomas).toMatchObject({
      line: 3,
      values: { fullName: 'Tomás Pérez', dateOfBirth: '2018-04-03', guardianName: 'Laura Pérez' },
      ageGroup: 'children',
      guardianRelationship: 'mother',
      duplicate: false,
      notes: [],
    })
    expect(lucia!.duplicate).toBe(true)
    expect(lucia!.notes[0]).toMatch(/fecha de nacimiento «ayer»/)
    expect(martina!.ageGroup).toBe('adolescents')
  })

  it('says what to do with an old .xls', async () => {
    await expect(
      previewPatientImport('p', { name: 'viejo.xls', type: 'application/vnd.ms-excel', bytes: new Uint8Array() }),
    ).rejects.toThrow(/\.xlsx/)
  })

  it('refuses a sheet with no name column', async () => {
    await expect(previewPatientImport('p', csv('Teléfono;Colegio\n099;Elbio'), TODAY)).rejects.toThrow(
      PatientImportError,
    )
  })
})

describe('importPatients', () => {
  it('validates every row before writing any', async () => {
    created.rows = []
    await expect(
      importPatients('p', [{ fullName: 'Tomás Pérez' }, { fullName: 'Ana', guardianEmail: 'no-es-un-correo' }]),
    ).rejects.toThrow(/número 2/)
    expect(created.rows).toHaveLength(0)
  })

  it('creates the rows that came back', async () => {
    created.rows = []
    expect(await importPatients('p', [{ fullName: 'Tomás Pérez', ageGroup: 'children' }])).toBe(1)
    expect(created.rows).toHaveLength(1)
  })
})
