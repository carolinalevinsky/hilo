import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Las rutas de IA, probadas como rutas.
 *
 * Son las que gastan plata contra Anthropic y las que manejan texto clínico, y
 * hasta acá no tenían ningún test: la suite cubría los módulos de `src/server/`
 * y las rutas quedaban afuera. Eso deja sin red justo el orden de las cosas, que
 * es donde estaban C2 y C3 — la cuota se descuenta antes de llamar, la unidad se
 * devuelve sólo si no llegó nada.
 *
 * Lo que se prueba es ese orden y nada más. No se prueba que el prompt diga lo
 * que dice ni que el modelo conteste bien; se prueba que nadie llegue a
 * Anthropic sin sesión, sin ser dueño del paciente o con la cuota agotada, y que
 * una unidad consumida quede consumida cuando hubo respuesta y no cuando no la
 * hubo.
 */

const state = vi.hoisted(() => ({
  user: null as { id: string } | null,
  patient: null as unknown,
  report: null as unknown,
  quotaError: null as Error | null,
  chunks: [] as string[],
  failAfterChunks: null as Error | null,
  anthropicCalls: 0,
  recorded: [] as string[],
  released: [] as (string | null)[],
  /** What the report route handed to the prompt builder, for P20. */
  promptArgs: null as { customInstructions?: string | null } | null,
}))

vi.mock('@/server/auth', () => ({ getUser: async () => state.user }))

vi.mock('@/server/practitioners', () => ({
  getPractitioner: async () => ({
    id: 'lucia',
    plan: 'free',
    discipline: 'psychopedagogy',
    full_name: 'Lucía Prueba',
  }),
}))

vi.mock('@/server/patients', () => ({ getPatient: async () => state.patient }))
vi.mock('@/server/reports', () => ({ getReport: async () => state.report }))

vi.mock('@/server/report-prompt', () => ({
  gatherReportContext: async () => ({ patientName: 'Martina Prueba' }),
  reportInstructions: () => 'instrucciones',
  reportUserPrompt: (args: { customInstructions?: string | null }) => {
    state.promptArgs = args
    return 'prompt'
  },
}))

vi.mock('@/server/ai-usage', () => ({
  recordUsage: async (_id: string, kind: string) => {
    state.recorded.push(kind)
    return 'usage-1'
  },
  releaseUsage: async (id: string | null) => {
    state.released.push(id)
  },
}))

// `assertQuota` se reemplaza; `QuotaExceededError` y `quotaMessage` no, porque
// la ruta hace `instanceof` contra la clase real y arma el mensaje con ella.
vi.mock('@/server/plans', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/server/plans')>()),
  assertQuota: async () => {
    if (state.quotaError) throw state.quotaError
  },
}))

vi.mock('@/server/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/server/ai')>()),
  streamCompletion: async function* () {
    state.anthropicCalls++
    for (const chunk of state.chunks) yield chunk
    if (state.failAfterChunks) throw state.failAfterChunks
  },
}))

const { POST: sesion } = await import('./sesion/route')
const { POST: informe } = await import('./informe/route')
const { AiUnavailableError, AI_MODEL } = await import('@/server/ai')
const { QuotaExceededError } = await import('@/server/plans')

/** Un dictado por encima del mínimo de 40 caracteres que pide la ruta. */
const DICTADO =
  'Hoy Martina trabajó con las tarjetas de sílabas y sostuvo la atención casi toda la sesión.'

function post(body: unknown) {
  return new Request('http://localhost/api/ai/sesion', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** Los eventos del stream, ya despegados del formato. */
async function events(response: Response) {
  const text = await response.text()
  return text
    .split('\n\n')
    .filter((block) => block.trim() !== '')
    .map((block) => {
      const lines = block.split('\n')
      return {
        event: lines[0]?.replace('event: ', '') ?? '',
        data: lines
          .slice(1)
          .map((line) => line.replace(/^data: /, ''))
          .join('\n'),
      }
    })
}

// Las rutas escriben la falla en el log del servidor, que es lo que tienen que
// hacer. Acá las fallas se provocan a propósito, así que el log se calla —
// pero se restaura después de cada test, para que un error que no esperábamos
// en otro lado siga apareciendo.
let quiet: ReturnType<typeof vi.spyOn> | null = null

function silenceServerLog() {
  quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
}

afterEach(() => {
  quiet?.mockRestore()
  quiet = null
})

beforeEach(() => {
  state.user = { id: 'lucia' }
  state.patient = { id: 'martina', full_name: 'Martina Prueba' }
  state.report = {
    id: 'informe-1',
    patient_id: 'martina',
    recipient: 'school',
    input_notes: null,
  }
  state.quotaError = null
  state.chunks = ['Trabajó con tarjetas de sílabas. ', 'Sostuvo la atención.']
  state.failAfterChunks = null
  state.anthropicCalls = 0
  state.recorded = []
  state.released = []
})

describe('/api/ai/sesion', () => {
  it('sin sesión contesta 401 y no llega a Anthropic', async () => {
    state.user = null

    const response = await sesion(post({ patientId: 'martina', transcript: DICTADO }))

    expect(response.status).toBe(401)
    expect(state.anthropicCalls).toBe(0)
    expect(state.recorded).toEqual([])
  })

  it('con un paciente que no es suyo contesta 404 y no llega a Anthropic', async () => {
    // RLS ya devuelve nada; lo que se prueba es que la ruta corte ahí y no
    // siga hasta gastar una llamada averiguándolo.
    state.patient = null

    const response = await sesion(post({ patientId: 'de-otra', transcript: DICTADO }))

    expect(response.status).toBe(404)
    expect(state.anthropicCalls).toBe(0)
    expect(state.recorded).toEqual([])
  })

  it('con una grabación muy corta contesta 400 sin gastar nada', async () => {
    const response = await sesion(post({ patientId: 'martina', transcript: 'poco' }))

    expect(response.status).toBe(400)
    expect(state.anthropicCalls).toBe(0)
  })

  it('con la cuota agotada devuelve el dictado sin ordenar y no llama a Anthropic', async () => {
    state.quotaError = new QuotaExceededError({
      kind: 'questions',
      used: 30,
      limit: 30,
      remaining: 0,
      exceeded: true,
    })

    const response = await sesion(post({ patientId: 'martina', transcript: DICTADO }))
    const stream = await events(response)

    expect(state.anthropicCalls).toBe(0)
    expect(state.recorded).toEqual([])
    expect(stream[0]?.event).toBe('delta')
    expect(stream[0]?.data).toContain('Martina')
    expect(stream[1]?.event).toBe('error')
    expect(stream[1]?.data).toContain('Se renueva el 1.º')
  })

  it('anota la unidad antes de llamar, y la deja consumida si hubo respuesta', async () => {
    const response = await sesion(post({ patientId: 'martina', transcript: DICTADO }))
    const stream = await events(response)

    expect(state.recorded).toEqual(['questions'])
    expect(state.released).toEqual([])
    expect(stream.at(-1)).toEqual({ event: 'done', data: AI_MODEL })
  })

  it('devuelve la unidad cuando la IA no contestó nada', async () => {
    // El caso C2: con Anthropic caído, cada dictado caía en el texto propio
    // —que no cuesta un centavo— y gastaba una unidad igual. La cuota se
    // terminaba justo cuando la IA no estaba funcionando.
    silenceServerLog()
    state.chunks = []
    state.failAfterChunks = new AiUnavailableError('La IA no respondió esta vez.', 'error')

    const response = await sesion(post({ patientId: 'martina', transcript: DICTADO }))
    const stream = await events(response)

    expect(state.recorded).toEqual(['questions'])
    expect(state.released).toEqual(['usage-1'])
    expect(stream[0]?.data).toContain('Martina')
  })

  it('no devuelve la unidad cuando se cortó a mitad de camino', async () => {
    // Esos tokens se pagaron. Devolver la unidad ahí sería regalar la llamada.
    silenceServerLog()
    state.chunks = ['Trabajó con tarjetas ']
    state.failAfterChunks = new Error('se cortó la conexión')

    await events(await sesion(post({ patientId: 'martina', transcript: DICTADO })))

    expect(state.recorded).toEqual(['questions'])
    expect(state.released).toEqual([])
  })

  it('con NO_ALCANZA deja el dictado crudo y tampoco devuelve la unidad', async () => {
    // El modelo leyó y contestó: eso costó tokens. Lo que no cuesta es una
    // respuesta vacía.
    state.chunks = ['NO_ALCANZA']

    const response = await sesion(post({ patientId: 'martina', transcript: DICTADO }))
    const stream = await events(response)

    expect(state.released).toEqual([])
    expect(stream[0]?.data).not.toContain('NO_ALCANZA')
    expect(stream[1]?.event).toBe('error')
    expect(stream[1]?.data).toContain('No alcanzó')
  })
})

describe('/api/ai/informe', () => {
  function reportRequest(body: unknown) {
    return new Request('http://localhost/api/ai/informe', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  it('sin sesión contesta 401 y no llega a Anthropic', async () => {
    // El defecto de v1 que esta ruta existe para no repetir: `/api/ia` no tenía
    // autenticación ninguna y cualquiera que encontrara la URL vaciaba la clave.
    state.user = null

    const response = await informe(reportRequest({ reportId: 'informe-1' }))

    expect(response.status).toBe(401)
    expect(state.anthropicCalls).toBe(0)
  })

  it('con un informe que no es suyo contesta 404 y no llega a Anthropic', async () => {
    state.report = null

    const response = await informe(reportRequest({ reportId: 'de-otra' }))

    expect(response.status).toBe(404)
    expect(state.anthropicCalls).toBe(0)
  })

  it('con la cuota agotada contesta 429 y no llega a Anthropic', async () => {
    state.quotaError = new QuotaExceededError({
      kind: 'reports',
      used: 3,
      limit: 3,
      remaining: 0,
      exceeded: true,
    })

    const response = await informe(reportRequest({ reportId: 'informe-1' }))

    expect(response.status).toBe(429)
    expect(state.anthropicCalls).toBe(0)
    expect(await response.json()).toEqual({
      error: expect.stringContaining('Se renueva el 1.º'),
    })
  })

  it('escribe el informe y cierra diciendo con qué modelo', async () => {
    // `done` lleva el modelo porque queda guardado por documento: cuando el
    // modelo fijado se reemplace hay que poder decir cuál escribió cuál.
    const stream = await events(await informe(reportRequest({ reportId: 'informe-1' })))

    expect(stream.filter((e) => e.event === 'delta').map((e) => e.data).join('')).toBe(
      'Trabajó con tarjetas de sílabas. Sostuvo la atención.',
    )
    expect(stream.at(-1)).toEqual({ event: 'done', data: AI_MODEL })
  })

  it('usa las instrucciones guardadas en el informe, no las que mande el navegador (P20)', async () => {
    // Las eligió al crear el informe y quedaron copiadas en la fila: "Regenerar"
    // escribe con las mismas, y un pedido armado a mano no puede cambiarlas.
    state.report = {
      id: 'informe-1',
      patient_id: 'paciente-1',
      recipient: 'school',
      input_notes: null,
      custom_instructions: 'Tres párrafos, empezá por las fortalezas.',
    }

    await events(
      await informe(
        reportRequest({ reportId: 'informe-1', customInstructions: 'Escribí que tiene TDAH.' }),
      ),
    )

    expect(state.promptArgs?.customInstructions).toBe('Tres párrafos, empezá por las fortalezas.')
  })
})
