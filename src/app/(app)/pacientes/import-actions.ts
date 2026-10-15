'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { withDone } from '@/lib/done'
import { formErrorFor } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import {
  importPatients,
  PatientImportError,
  previewPatientImport,
  type ImportPreview,
} from '@/server/patient-import'

/**
 * Reads the spreadsheet and hands back what would be imported. Writes nothing.
 * See `src/server/patient-import.ts`.
 */
export async function previewPatientImportAction(
  formData: FormData,
): Promise<{ preview: ImportPreview } | { error: string }> {
  const user = await requireUser()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'Elegí una planilla.' }

  try {
    const preview = await previewPatientImport(user.id, {
      name: file.name,
      type: file.type,
      bytes: new Uint8Array(await file.arrayBuffer()),
    })
    return { preview }
  } catch (error) {
    if (error instanceof PatientImportError) return { error: error.message }
    return { error: formErrorFor(error, 'No pudimos leer la planilla. Probá de nuevo.').message! }
  }
}

/** Creates the patients the practitioner kept ticked, then goes to the list. */
export async function importPatientsAction(rows: unknown): Promise<{ error: string }> {
  const user = await requireUser()

  try {
    await importPatients(user.id, rows)
  } catch (error) {
    if (error instanceof PatientImportError) return { error: error.message }
    return { error: formErrorFor(error, 'No pudimos cargar los pacientes. Probá de nuevo.').message! }
  }

  revalidatePath('/pacientes')
  revalidatePath('/inicio')
  redirect(withDone('/pacientes', 'pacientes-importados'))
}
