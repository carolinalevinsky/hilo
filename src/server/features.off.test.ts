import { describe, expect, it, vi } from 'vitest'

/**
 * Que apagado signifique apagado.
 *
 * Mercado Pago y las videollamadas quedaron fuera del alcance de la v1, y la
 * instrucción fue desactivar y ocultar, no borrar. Lo que estos tests fijan es
 * la mitad que no se ve: que las funciones se cierren **en el servidor**.
 *
 * Esconder el botón no cierra nada — cualquiera puede editar el código del
 * navegador, que es exactamente lo que `legacy/index.html:2775` hacía mal con
 * los límites de plan. Si esto vuelve a prenderse algún día, que sea porque
 * alguien editó `src/lib/features.ts`, no porque una pantalla dejó de esconder
 * un botón.
 */

const holder = vi.hoisted(() => ({
  features: { mercadoPago: false, videoCalls: false },
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

const { connectMercadoPago, createPaymentLink, handlePaymentNotification, isMercadoPagoConnected } =
  await import('./mercadopago')
const { ensurePatientRoom, rotatePatientRoom } = await import('./patients')

describe('Mercado Pago apagado', () => {
  it('no deja conectar una cuenta', async () => {
    await expect(
      connectMercadoPago('practitioner-1', { accessToken: 'APP_USR-lo-que-sea' }),
    ).rejects.toThrow()
    expect(holder.inserted).toHaveLength(0)
  })

  it('no genera links de pago', async () => {
    await expect(
      createPaymentLink('practitioner-1', {
        amount: 1500,
        title: 'Agosto',
        externalReference: 'a:b:2026-08',
      }),
    ).rejects.toThrow()
  })

  it('contesta que no hay cuenta conectada, sin ir a la base', async () => {
    await expect(isMercadoPagoConnected('practitioner-1')).resolves.toBe(false)
  })

  it('ignora una notificación que llegue igual, sin escribir un pago', async () => {
    // El caso real: una cuenta que quedó conectada antes de apagar esto y sigue
    // recibiendo avisos. No puede seguir tocando el libro de nadie.
    await expect(handlePaymentNotification('123456')).resolves.toBeUndefined()
    expect(holder.inserted).toHaveLength(0)
  })
})

describe('videollamadas apagadas', () => {
  it('no abre una sala, ni escribe room_id', async () => {
    await expect(ensurePatientRoom('practitioner-1', 'patient-1')).resolves.toBeNull()
    expect(holder.inserted).toHaveLength(0)
  })

  it('tampoco rota una sala existente', async () => {
    await expect(rotatePatientRoom('practitioner-1', 'patient-1')).resolves.toBeNull()
  })
})
