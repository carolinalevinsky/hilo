/**
 * Server-Sent Events, for streaming a document as it is written.
 *
 * SSE rather than a plain chunked response because it survives what sits between
 * the app and the browser: a proxy that buffers a plain `text/plain` body will
 * hold the whole report and deliver it at once, undoing the point. The
 * `text/event-stream` content type plus `X-Accel-Buffering: no` is what tells
 * every layer in the path to pass bytes through.
 *
 * Three event names, and the third one matters most: `error` is how the client
 * learns that a refusal or an outage happened *after* the response already
 * started with a 200, which is the one failure an HTTP status cannot express.
 */

export type SseEvent =
  | { event: 'delta'; data: string }
  | { event: 'done'; data: string }
  | { event: 'error'; data: string }

function encode(event: SseEvent): string {
  // Every line of the payload needs its own `data:` prefix, and the blank line
  // is what terminates the event. Newlines are common in a clinical report, so
  // getting this wrong truncates at the first paragraph break.
  const lines = event.data.split('\n').map((line) => `data: ${line}`)
  return `event: ${event.event}\n${lines.join('\n')}\n\n`
}

export function sseResponse(source: AsyncGenerator<SseEvent>): Response {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async pull(controller) {
      const { value, done } = await source.next()
      if (done) {
        controller.close()
        return
      }
      controller.enqueue(encoder.encode(encode(value)))
    },
    cancel() {
      // The practitioner navigated away. Stop generating rather than finishing a
      // report nobody is waiting for — the tokens are billed either way.
      void source.return(undefined)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
