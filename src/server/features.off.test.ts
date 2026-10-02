import { describe, expect, it, vi } from 'vitest'

/**
 * Que apagado signifique apagado.
 *
 * Las videollamadas quedaron fuera del alcance de la v1, y la instrucción fue
 * desactivar y ocultar, no borrar. Lo que estos tests fijan es la mitad que no
 * se ve: que la función se cierre **en el servidor**. (Mercado Pago también
 * estaba acá; se decidió sacarlo del código entero, así que no hay nada que
 * apagar.)
 *
 * Esconder el botón no cierra nada — cualquiera puede editar el código del
 * navegador, que es exactamente lo que `legacy/index.html:2775` hacía mal con
 * los límites de plan. Si esto vuelve a prenderse algún día, que sea porque
 * alguien editó `src/lib/features.ts`, no porque una pantalla dejó de esconder
 * un botón.
 */

const holder = vi.hoisted(() => ({
  features: { videoCalls: false },
  inserted: [] as unknown[],
}))

vi.mock('@/lib/features', () => ({
  FEATURES: holder.features,
  FEATURE_OFF_MESSAGE: 'Esto no está disponible por ahora.',
}))

/** Una base que grita si alguien le escribe algo. */
function loudDb() {
  const chain: Record<string, unknown> = {}
  const self = () => chain
  Object.assign(chain, {
    from: self,
    select: self,
    eq: self,
    update: self,
    upsert: (row: unknown) => {
      holder.inserted.push(row)
      return chain
    },
    insert: (row: unknown) => {
      holder.inserted.push(row)
      return chain
    },
    delete: self,
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  })
  return chain
}

vi.mock('./db', () => ({
  getDb: async () => loudDb(),
  getServiceDb: () => loudDb(),
}))

const { ensurePatientRoom, rotatePatientRoom } = await import('./patient-room')

describe('videollamadas apagadas', () => {
  it('no abre una sala, ni escribe room_id', async () => {
    await expect(ensurePatientRoom('practitioner-1', 'patient-1')).resolves.toBeNull()
    expect(holder.inserted).toHaveLength(0)
  })

  it('tampoco rota una sala existente', async () => {
    await expect(rotatePatientRoom('practitioner-1', 'patient-1')).resolves.toBeNull()
  })
})
