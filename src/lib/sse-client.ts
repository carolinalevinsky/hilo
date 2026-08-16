/**
 * Reading the other end of `src/app/api/ai/sse.ts`.
 *
 * The parsing is small but it has two details that are wrong by default and
 * fail quietly: events are separated by a blank line, so whatever follows the
 * last one is a partial event and has to stay buffered for the next read; and a
 * payload spanning several lines arrives as several `data:` lines that must be
 * rejoined with newlines. Get the second one wrong and a clinical report
 * truncates at its first paragraph break — visibly, but only sometimes.
 */

export type SseHandlers = {
  onDelta: (text: string) => void
  onError?: (message: string) => void
  onDone?: (data: string) => void
}

export async function readSseStream(body: ReadableStream<Uint8Array>, handlers: SseHandlers) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const raw of events) {
      const name = raw.match(/^event: (.+)$/m)?.[1]
      const data = raw
        .split('\n')
        .filter((line) => line.startsWith('data: '))
        .map((line) => line.slice(6))
        .join('\n')

      if (name === 'delta') handlers.onDelta(data)
      else if (name === 'error') handlers.onError?.(data)
      else if (name === 'done') handlers.onDone?.(data)
    }
  }
}
