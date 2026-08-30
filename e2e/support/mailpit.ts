/**
 * Reading the local test inbox.
 *
 * `supabase start` runs Mailpit and points GoTrue's SMTP at it, so every email
 * Supabase Auth sends locally lands there instead of in someone's inbox. Port
 * 54324 is the same number inside the dev container and on the host — see
 * `docker/entrypoint.sh`.
 *
 * This exists for one reason: a password recovery test that stops at "we sent
 * you an email" is not testing recovery. The part that broke for a year is what
 * happens *after* the link is clicked, so the test has to click it.
 */

const MAILPIT = 'http://127.0.0.1:54324'

type Message = { ID: string; To: { Address: string }[]; Subject: string }

/**
 * Waits for the newest message addressed to `email` and returns its subject and
 * the first link in it.
 *
 * Polls rather than sleeps: GoTrue sends the mail after answering the request,
 * so the email is usually there in well under a second, and a fixed wait would
 * either be flaky or slow.
 */
export async function waitForEmail(
  email: string,
  timeoutMs = 15_000,
): Promise<{ subject: string; link: string }> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const list = await fetch(`${MAILPIT}/api/v1/messages?limit=50`)
    const { messages } = (await list.json()) as { messages: Message[] }
    const found = messages.find((message) =>
      message.To.some((to) => to.Address.toLowerCase() === email.toLowerCase()),
    )

    if (found) {
      const detail = await fetch(`${MAILPIT}/api/v1/message/${found.ID}`)
      const { HTML } = (await detail.json()) as { HTML: string }
      return { subject: found.Subject, link: firstLink(HTML) }
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`no llegó ningún correo para ${email} en ${timeoutMs}ms`)
}

/**
 * `&amp;` is correct in an HTML attribute and every mail client decodes it
 * before following the link. `fetch` and `page.goto` do not, so it is decoded
 * here — otherwise `type` and `next` arrive as part of the token and the link
 * fails for a reason that has nothing to do with the code under test.
 */
function firstLink(html: string): string {
  const match = html.match(/href="([^"]+)"/)
  if (!match?.[1]) throw new Error('el correo no traía ningún enlace')
  return match[1].replace(/&amp;/g, '&')
}
