import { Resend } from 'resend'

import { env } from '@/lib/env'
import { weekdayName } from '@/lib/week'
import { firstName } from '@/lib/whatsapp'

/**
 * Transactional email.
 *
 * ─── Where email must not go ───────────────────────────────────────────────
 *
 * **No clinical content, ever.** No assessment results, no report bodies, no
 * progress notes. An email is an uncontrolled copy of whatever it contains,
 * sitting in a third-party inbox forever, and under Ley N.º 18.331 clinical data
 * does not belong in one. v1's digest sent patient names against a "possibly
 * unpaid" list, which is borderline; here the digest sends counts and a link,
 * and the names live behind the login.
 *
 * The booking notification is the one place a name appears, and it is the name
 * of someone who just typed it into a public form asking to be contacted — not a
 * patient, and not a clinical fact.
 *
 * ─── Why plain template strings ────────────────────────────────────────────
 *
 * Email HTML has to survive Outlook, which means tables, inline styles, and no
 * modern CSS. A React email renderer is a real dependency and a build step, for
 * two messages. Every interpolated value goes through `escapeHtml` first — the
 * one place in this codebase that builds markup by concatenation, and the reason
 * that function exists at the top of the file rather than somewhere general.
 */

let resend: Resend | null = null

function client() {
  resend ??= new Resend(env.RESEND_API_KEY)
  return resend
}

/**
 * The reason CLAUDE.md says never to build HTML by string concatenation is that
 * manual escaping fails eventually. Email is the exception where there is no
 * alternative, so the escaping is not optional and not spread around: nothing
 * below interpolates a value that has not been through here.
 */
function escapeHtml(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** The shared frame: violet header, white card. Ported from `legacy/api/aviso-reserva.js:50`. */
function layout({
  subtitle,
  body,
  footer,
}: {
  subtitle: string
  body: string
  footer: string
}) {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f4f5fb;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(30,36,54,.08)">
      <div style="background:linear-gradient(120deg,#6c4cf0,#8a5cf0);padding:20px 24px;color:#fff">
        <div style="font-weight:800;font-size:18px">Hilo</div>
        <div style="opacity:.9;font-size:13px;margin-top:2px">${escapeHtml(subtitle)}</div>
      </div>
      <div style="padding:22px 24px;color:#20293a">${body}</div>
    </div>
    <div style="max-width:520px;margin:12px auto 0;text-align:center;color:#9aa0b4;font-size:11.5px">${escapeHtml(footer)}</div>
  </div>`
}

function button(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin-top:14px;background:#6c5ce7;color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:12px;font-size:14px">${escapeHtml(label)}</a>`
}

/**
 * Sends, and never throws.
 *
 * A failed email must not roll back the thing it was announcing. If the booking
 * row is written and Resend is down, the request still exists and the
 * practitioner sees it in their inbox next time they open Hilo — which is a much
 * better outcome than a 500 shown to the family who just filled in the form.
 */
async function send(options: { to: string; subject: string; html: string }) {
  try {
    const { error } = await client().emails.send({
      from: env.MAIL_FROM,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    })
    if (error) throw error
    return true
  } catch (error) {
    console.error('[notifications] no se pudo enviar el mail', {
      subject: options.subject,
      error,
    })
    return false
  }
}

// ─── New booking request ────────────────────────────────────────────────────

/**
 * Tells the practitioner a family asked for a slot.
 *
 * v1 wired this as a Supabase Database Webhook: Supabase watched for an INSERT
 * and POSTed to a serverless function. v2 sends it inline from the route handler
 * that wrote the row.
 *
 * That deletes a real liability, not just a network hop. The webhook's
 * configuration — URL, secret header, table, event — lived in the Supabase
 * dashboard and existed nowhere in git: it could not be reviewed, could not be
 * tested, was not restored by any rollback, and would break silently the day the
 * URL changed. Sent from here, it is covered by a test.
 */
export async function sendBookingNotification({
  to,
  practitionerName,
  request,
  appUrl,
}: {
  to: string
  practitionerName: string
  request: {
    name: string
    phone: string
    preferred_weekday: number | null
    preferred_time: string | null
    note: string | null
  }
  appUrl: string
}) {
  const when = [
    request.preferred_weekday === null ? null : weekdayName(request.preferred_weekday),
    request.preferred_time?.slice(0, 5) ?? null,
  ]
    .filter(Boolean)
    .join(' ')

  const rows = [
    `<div><b>${escapeHtml(request.name)}</b></div>`,
    when ? `<div style="color:#586074">Turno pedido: <b>${escapeHtml(when)}</b></div>` : '',
    `<div style="color:#586074">Teléfono: ${escapeHtml(request.phone)}</div>`,
    request.note ? `<div style="color:#586074">Nota: ${escapeHtml(request.note)}</div>` : '',
  ].join('')

  const html = layout({
    subtitle: 'Nueva reserva',
    body: `
        <p style="margin:0 0 12px">Hola ${escapeHtml(firstName(practitionerName))},</p>
        <p style="margin:0 0 14px">Te entró una reserva nueva:</p>
        <div style="border:1px solid #eceef6;border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.7">${rows}</div>
        <p style="margin:16px 0 0;font-size:13.5px;color:#586074">Entrá a Hilo y confirmala para que quede en tu agenda.</p>
        ${button(`${appUrl}/reservas`, 'Abrir Hilo')}`,
    footer: 'Recibís este aviso porque tenés reservas activas en Hilo.',
  })

  return send({
    to,
    subject: `Nueva reserva: ${request.name}`,
    html,
  })
}

// ─── Fortnightly digest ─────────────────────────────────────────────────────

export type DigestSummary = {
  practitionerName: string
  sessionsThisFortnight: number
  pendingBookings: number
  patientsWithBalance: number
  outstandingTotal: number
}

/**
 * The fortnightly digest.
 *
 * **Counts and a link. No names.** v1 listed the patients it thought might not
 * have paid, which put a list of families and a financial judgement about them
 * into an inbox. The number is enough to make someone open the app, and the app
 * is where the names belong.
 */
export async function sendDigest({
  to,
  summary,
  appUrl,
}: {
  to: string
  summary: DigestSummary
  appUrl: string
}) {
  const line = (label: string, value: string) =>
    `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f2f8"><span style="color:#586074">${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`

  const money = `$ ${summary.outstandingTotal.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`

  const html = layout({
    subtitle: 'Tu resumen',
    body: `
        <p style="margin:0 0 12px">Hola ${escapeHtml(firstName(summary.practitionerName))},</p>
        <p style="margin:0 0 14px">Un repaso rápido de estas dos semanas:</p>
        <div style="font-size:14px;line-height:1.6">
          ${line('Sesiones registradas', String(summary.sessionsThisFortnight))}
          ${summary.pendingBookings > 0 ? line('Reservas sin confirmar', String(summary.pendingBookings)) : ''}
          ${summary.patientsWithBalance > 0 ? line('Pacientes con saldo', `${summary.patientsWithBalance} · ${money}`) : ''}
        </div>
        <p style="margin:16px 0 0;font-size:13.5px;color:#586074">El detalle está en Hilo, con nombre y apellido.</p>
        ${button(`${appUrl}/inicio`, 'Abrir Hilo')}`,
    footer: 'Recibís este resumen cada quince días. Si no querés recibirlo más, escribinos.',
  })

  return send({ to, subject: 'Tu resumen de Hilo', html })
}
