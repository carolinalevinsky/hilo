import { describe, expect, it } from 'vitest'

import { hideNames, revealNames } from '@/lib/pseudonyms'

import { documentAliases, parsePatientDraft } from './patient-document'

describe('parsePatientDraft', () => {
  it('turns the answer into the form’s own fields', () => {
    const draft = parsePatientDraft(
      `Acá está:
{
  "fechaNacimiento": "2018-04-03",
  "poblacion": "Niños",
  "centroEducativo": "Escuela 12",
  "clase": "2.º",
  "mutualista": null,
  "telefono": "099 123 456",
  "responsable": "Laura Pérez",
  "vinculo": "madre",
  "correoResponsable": "laura@example.com",
  "motivoConsulta": "Dificultades en la lectura.",
  "inicioTratamiento": null
}`,
      '2026-10-15',
    )
    expect(draft).toEqual({
      dateOfBirth: '2018-04-03',
      ageGroup: 'children',
      school: 'Escuela 12',
      schoolLevel: '2.º',
      phone: '099 123 456',
      guardianName: 'Laura Pérez',
      guardianRelationship: 'mother',
      guardianEmail: 'laura@example.com',
      referralReason: 'Dificultades en la lectura.',
    })
  })

  it('drops what does not check out instead of showing it', () => {
    expect(
      parsePatientDraft(
        '{"fechaNacimiento":"03/04/2030","correoResponsable":"no","centroEducativo":"[NOMBRE]","vinculo":"vecina"}',
        '2026-10-15',
      ),
    ).toEqual({})
  })

  it('returns nothing for an answer that is not JSON', () => {
    expect(parsePatientDraft('No pude leer el documento.')).toEqual({})
  })
})

describe('documentAliases', () => {
  it('brings each part of the name back as itself', () => {
    const aliases = documentAliases('Tomás Pérez')
    const hidden = hideNames('Tomás Pérez vive con su madre, Laura Pérez.', aliases)
    expect(hidden).not.toMatch(/Tomás|Pérez/)
    // The mother keeps her own surname, not the patient's first name.
    expect(revealNames('Responsable: Laura [APELLIDO]', aliases)).toBe('Responsable: Laura Pérez')
    expect(revealNames(hidden, aliases)).toBe('Tomás Pérez vive con su madre, Laura Pérez.')
  })
})
