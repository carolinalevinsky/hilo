import { describe, expect, it, vi } from 'vitest'

/**
 * Qué pasa cuando la respuesta llega al techo de `max_tokens`.
 *
 * El techo depende del pedido y ahí adentro entra el *thinking*, así que se
 * alcanza antes de lo que sugiere el largo de lo que se ve. `ai.ts` chequeaba
 * `stop_reason === 'refusal'` y no éste: un informe que llegaba al tope se
 * cortaba a mitad de frase y la ruta mandaba `event: done` igual, así que la
 * pantalla lo daba por terminado.
 *
 * Un informe clínico incompleto que parece completo es lo peor de las dos
 * opciones — es lo que una profesional firma sin darse cuenta.
 */

const holder = vi.hoisted(() => ({
  stopReason: 'end_turn' as string | null,
  params: [] as { model: string; max_tokens: number; output_config?: { effort?: string } }[],
}))

vi.mock('@anthropic-ai/sdk', () => {
  class FakeAnthropic {
    messages = {
      stream: (params: { model: string; max_tokens: number; output_config?: { effort?: string } }) => {
        holder.params.push(params)
        const chunks = [
          { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Informe a medio ' } },
          { type: 'content_block_delta', delta: { type: 'text_delta', text: 'escribir, cortado en' } },
        ]
        return {
          async *[Symbol.asyncIterator]() {
            for (const chunk of chunks) yield chunk
          },
          finalMessage: async () => ({ stop_reason: holder.stopReason }),
        }
      },
    }
  }
  return { default: FakeAnthropic }
})

const { AI_MODEL, AiUnavailableError, streamChat, streamCompletion } = await import('./ai')

async function collect() {
  let text = ''
  for await (const chunk of streamCompletion('instrucciones', 'prompt')) text += chunk
  return text
}

describe('stop_reason', () => {
  it('avisa cuando el texto quedó cortado por el tope', async () => {
    holder.stopReason = 'max_tokens'

    await expect(collect()).rejects.toBeInstanceOf(AiUnavailableError)

    // Y el motivo se distingue de una negativa: la pantalla dice cosas
    // distintas para "no lo puedo escribir" y para "no me entró".
    await expect(collect()).rejects.toMatchObject({ reason: 'truncated' })
  })

  it('sigue distinguiendo una negativa', async () => {
    holder.stopReason = 'refusal'
    await expect(collect()).rejects.toMatchObject({ reason: 'refusal' })
  })

  it('no molesta cuando terminó bien', async () => {
    holder.stopReason = 'end_turn'
    await expect(collect()).resolves.toBe('Informe a medio escribir, cortado en')
  })
})

/**
 * Cada pedido piensa lo que necesita. Antes todos iban con el mismo techo y el
 * esfuerzo por defecto: el chat de dos frases pensaba como un informe.
 */
describe('per-task effort', () => {
  async function paramsFor(run: () => AsyncGenerator<string>) {
    holder.stopReason = 'end_turn'
    holder.params = []
    for await (const chunk of run()) void chunk
    return holder.params[0]!
  }

  it('a report thinks hard and has room to finish', async () => {
    const params = await paramsFor(() =>
      streamCompletion('instrucciones', 'prompt', undefined, [], 'report'),
    )
    expect(params.output_config?.effort).toBe('high')
    expect(params.max_tokens).toBeGreaterThanOrEqual(32_000)
  })

  it('the chat answers quickly', async () => {
    const params = await paramsFor(() =>
      streamChat('instrucciones', [{ role: 'user', content: 'hola' }]),
    )
    expect(params.output_config?.effort).toBe('low')
  })

  it('the model is still the pinned one', async () => {
    const params = await paramsFor(() =>
      streamCompletion('instrucciones', 'prompt', undefined, [], 'describe'),
    )
    expect(params.model).toBe(AI_MODEL)
  })
})
