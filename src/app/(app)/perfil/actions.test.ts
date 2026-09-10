import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Guardar el perfil, cuando el formulario viene mal.
 *
 * El defecto: el `catch` de estas dos acciones no miraba el error y contestaba
 * siempre "No pudimos guardar los cambios. Probá de nuevo." Un nombre de una
 * sola letra caía ahí, así que la pantalla pedía reintentar exactamente lo mismo
 * — para siempre, sin decir nunca qué corregir. Las frases estaban escritas en
 * `ProfileUpdate` desde el principio y no llegaban a ninguna parte.
 *
 * Se prueba contra el esquema real: lo único que se reemplaza es la base, con
 * una que grita si alguien la toca. Que no la toque es parte de lo que hay que
 * probar — un dato inválido tiene que rebotar antes.
 */

const holder = vi.hoisted(() => ({ touched: [] as string[] }))

/** Una base que no debería recibir ni una consulta en estos casos. */
function loudDb() {
  const chain: Record<string, unknown> = {}
  const self = () => chain
  Object.assign(chain, {
    from: (table: string) => {
      holder.touched.push(table)
      return chain
    },
    select: self,
    eq: self,
    update: self,
    insert: self,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
  })
  return chain
}

vi.mock('@/server/db', () => ({
  getDb: async () => loudDb(),
  getServiceDb: () => loudDb(),
}))

vi.mock('@/server/auth', () => ({ requireUser: async () => ({ id: 'lucia' }) }))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))

const { updateCalendarPrivacyAction, updateProfileAction } = await import('./actions')

let quiet: ReturnType<typeof vi.spyOn> | null = null

afterEach(() => {
  quiet?.mockRestore()
  quiet = null
  holder.touched = []
})

function form(values: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.append(key, value)
  return data
}

describe('updateProfileAction', () => {
  it('dice qué corregir cuando el nombre no alcanza', async () => {
    const state = await updateProfileAction(
      { ok: false, message: null },
      form({ fullName: 'L', discipline: 'psychopedagogy', phone: '' }),
    )

    expect(state.ok).toBe(false)
    expect(state.message).toBe('Escribí tu nombre y apellido.')
    // Y no llegó a la base: un dato inválido rebota antes.
    expect(holder.touched).toEqual([])
  })

  it('dice qué corregir cuando falta la profesión', async () => {
    const state = await updateProfileAction(
      { ok: false, message: null },
      form({ fullName: 'Lucía Pérez', discipline: '', phone: '' }),
    )

    expect(state.message).toBe('Elegí tu profesión.')
  })
})

describe('updateCalendarPrivacyAction', () => {
  it('dice qué corregir cuando la opción no es una de las tres', async () => {
    const state = await updateCalendarPrivacyAction(
      { ok: false, message: null },
      form({ calendarPrivacy: 'lo-que-sea' }),
    )

    expect(state.ok).toBe(false)
    expect(state.message).toBe('Elegí una de las tres opciones.')
    expect(holder.touched).toEqual([])
  })
})
