import { z } from 'zod'

import { getDb } from './db'

/**
 * Verificación en dos pasos: la contraseña y un código de una app
 * autenticadora (Google Authenticator, 1Password, la que use).
 *
 * Opcional, por cuenta. Quien la activa no puede entrar sólo con la
 * contraseña: la app la manda a `/verificar` (ver `proxy.ts`) y la base, por
 * su parte, no le devuelve una fila a una sesión sin el código (ver la
 * migración `mfa_when_enrolled`). La segunda es la que cuenta; la primera es
 * para que la pantalla no quede vacía sin explicar por qué.
 *
 * Todo con la sesión de quien la usa, nunca con la llave de servicio: es su
 * cuenta y sus factores.
 */

const Code = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'El código son 6 números. Fijate en la app.')

export type MfaStatus = {
  /** Tiene un factor verificado: la contraseña sola no alcanza. */
  enabled: boolean
  factorId: string | null
}

export async function mfaStatus(): Promise<MfaStatus> {
  const db = await getDb()
  const { data, error } = await db.auth.mfa.listFactors()
  if (error) throw error

  const factor = data.totp[0] ?? null
  return { enabled: factor !== null, factorId: factor?.id ?? null }
}

/**
 * ¿Esta sesión entró con contraseña y le falta el código? Es lo que mira el
 * proxy para mandarla a `/verificar`. Lee el token, no va a la red.
 */
export async function needsSecondStep(): Promise<boolean> {
  const db = await getDb()
  const { data } = await db.auth.mfa.getAuthenticatorAssuranceLevel()
  return data?.nextLevel === 'aal2' && data.currentLevel !== 'aal2'
}

/**
 * Empieza a activarla: devuelve el QR y la clave para cargar a mano.
 *
 * Los intentos que quedaron a medias (un QR que nunca se confirmó) se borran
 * antes: cada uno es un factor sin verificar, y Supabase deja diez.
 */
export async function startEnrollment() {
  const db = await getDb()
  const { data: factors, error: listError } = await db.auth.mfa.listFactors()
  if (listError) throw listError

  for (const factor of factors.all) {
    if (factor.status !== 'verified') await db.auth.mfa.unenroll({ factorId: factor.id })
  }

  const { data, error } = await db.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: `Ombúa ${new Date().toISOString().slice(0, 10)}`,
    issuer: 'Ombúa',
  })
  if (error) throw error

  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret }
}

export type MfaResult = { ok: true } | { ok: false; message: string }

/** Confirma el factor nuevo con el primer código: recién ahí queda activada. */
export async function confirmEnrollment(factorId: string, code: unknown): Promise<MfaResult> {
  return verify(factorId, code)
}

/** El segundo paso de una entrada: el código del factor que ya tiene. */
export async function verifySecondStep(code: unknown): Promise<MfaResult> {
  const { factorId } = await mfaStatus()
  if (!factorId) return { ok: true }
  return verify(factorId, code)
}

export async function disableMfa(factorId: string): Promise<MfaResult> {
  const db = await getDb()
  const { error } = await db.auth.mfa.unenroll({ factorId })
  if (error) {
    return { ok: false, message: 'No pudimos desactivarla. Volvé a entrar y probá de nuevo.' }
  }
  return { ok: true }
}

async function verify(factorId: string, code: unknown): Promise<MfaResult> {
  const parsed = Code.safeParse(code)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Revisá el código.' }
  }

  const db = await getDb()
  const { error } = await db.auth.mfa.challengeAndVerify({ factorId, code: parsed.data })
  if (error) {
    return {
      ok: false,
      message:
        'Ese código no es válido. Fijate que sea el de Ombúa y que la hora del teléfono esté bien.',
    }
  }
  return { ok: true }
}
