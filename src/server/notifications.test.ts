import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Notifications.
 *
 * Two things are asserted, and the second one is the reason this file exists at
 * all: that the right person is emailed, and that **nothing clinical is in the
 * body**. Under Ley N.º 18.331 an email is an uncontrolled copy sitting in a
 * third-party inbox forever, and "just this once, include the note so she does
 * not have to log in" is exactly the helpful change that would break it.
 *
 * v1 could not have had this test: the booking email was triggered by a Supabase
 * Database Webhook configured in a dashboard, so there was no code path a test
 * could call.
 */

const sent: { from: string; to: string[]; subject: string; html: string }[] = []

vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: async (options: { from: string; to: string[]; subject: string; html: string }) => {
        sent.push(options)
        return { data: { id: 'test' }, error: null }
      },
    }
  },
}))

const { sendBookingNotification, sendDigest } = await import('./notifications')

beforeEach(() => {
  sent.length = 0
})

describe('sendBookingNotification', () => {
  const request = {
    name: 'Familia Pérez',
    phone: '099 123 456',
    preferred_weekday: 1,
    preferred_time: '09:00:00',
    note: 'Nos derivó la maestra.',
  }

  it('emails the practitioner with what they need to call back', async () => {
    await sendBookingNotification({
      to: 'lucia@hilo.test',
      practitionerName: 'Lucía Fernández',
      request,
      appUrl: 'https://hilo.uy',
    })

    expect(sent).toHaveLength(1)
    expect(sent[0]?.to).toEqual(['lucia@hilo.test'])
    expect(sent[0]?.subject).toContain('Familia Pérez')
    expect(sent[0]?.html).toContain('Hola Lucía,')
    expect(sent[0]?.html).toContain('099 123 456')
    expect(sent[0]?.html).toContain('Lunes 09:00')
    expect(sent[0]?.html).toContain('https://hilo.uy/reservas')
  })

  it('escapes what the sender typed', async () => {
    // The name and the note come from a public form that anyone can reach. This
    // is the one place in the codebase that builds markup by concatenation, so
    // it is the one place that has to prove it escapes.
    await sendBookingNotification({
      to: 'lucia@hilo.test',
      practitionerName: 'Lucía Fernández',
      request: {
        ...request,
        name: '<script>alert(1)</script>',
        note: 'Hola & "chau" <b>',
      },
      appUrl: 'https://hilo.uy',
    })

    expect(sent[0]?.html).not.toContain('<script>')
    expect(sent[0]?.html).toContain('&lt;script&gt;')
    expect(sent[0]?.html).toContain('Hola &amp; &quot;chau&quot; &lt;b&gt;')
  })

  it('leaves out a slot the family did not ask for', async () => {
    await sendBookingNotification({
      to: 'lucia@hilo.test',
      practitionerName: 'Lucía Fernández',
      request: { ...request, preferred_weekday: null, preferred_time: null, note: null },
      appUrl: 'https://hilo.uy',
    })

    expect(sent[0]?.html).not.toContain('Turno pedido')
    expect(sent[0]?.html).not.toContain('Nota:')
  })
})

describe('sendDigest', () => {
  it('sends counts and a link, and no patient names', async () => {
    // v1 listed the patients it thought might not have paid, which put a list of
    // families and a financial judgement about them into an inbox. The number is
    // enough to make someone open the app; the app is where the names belong.
    await sendDigest({
      to: 'lucia@hilo.test',
      summary: {
        practitionerName: 'Lucía Fernández',
        sessionsThisFortnight: 12,
        pendingBookings: 2,
        patientsWithBalance: 3,
        outstandingTotal: 4500,
      },
      appUrl: 'https://hilo.uy',
    })

    const html = sent[0]?.html ?? ''

    expect(html).toContain('12')
    expect(html).toContain('3 · $ 4.500')
    expect(html).toContain('https://hilo.uy/inicio')

    // Nothing that names a patient or describes their treatment.
    for (const forbidden of ['Tomás', 'Malena', 'objetivo', 'sesión con', 'evolución']) {
      expect(html.toLowerCase()).not.toContain(forbidden.toLowerCase())
    }
  })

  it('omits a line when there is nothing to say in it', async () => {
    await sendDigest({
      to: 'lucia@hilo.test',
      summary: {
        practitionerName: 'Lucía Fernández',
        sessionsThisFortnight: 4,
        pendingBookings: 0,
        patientsWithBalance: 0,
        outstandingTotal: 0,
      },
      appUrl: 'https://hilo.uy',
    })

    expect(sent[0]?.html).not.toContain('Reservas sin confirmar')
    expect(sent[0]?.html).not.toContain('Pacientes con saldo')
  })
})
