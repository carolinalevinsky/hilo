import { Resend } from 'resend'

import {
  BRAND_BACKGROUND,
  BRAND_COLORS,
  BRAND_NAME,
  BRAND_VIOLET_DARK,
  BRAND_VIOLET_LIGHT,
} from '@/lib/brand'
import { formatLongDate } from '@/lib/dates'
import { env, publicConfig } from '@/lib/env'
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

/**
 * The shared frame: violet header, white card. Ported from `legacy/api/aviso-reserva.js:50`.
 *
 * The wordmark is a PNG and not the SVG every other surface uses, because Gmail
 * and Outlook drop `<img src="…svg">` without rendering anything — the reader
 * would see an empty violet band. It is drawn from `wordmark-for-dark.svg` at
 * twice its display size, for retina screens, with a transparent background so
 * the gradient shows through.
 *
 * `alt` is the brand name and is styled, which matters more here than usual:
 * Gmail blocks images from senders the reader has never written to, and an
 * invitation is by definition the first message. When that happens the header
 * still reads "Ombúa", in white and bold, where the logo would have been.
 */
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
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:${BRAND_BACKGROUND};padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(30,36,54,.08)">
      <div style="background:linear-gradient(120deg,${BRAND_VIOLET_DARK},${BRAND_VIOLET_LIGHT});padding:20px 24px;color:#fff">
        <img
          src="${publicConfig.NEXT_PUBLIC_APP_URL}/brand/wordmark-email.png"
          width="132"
          height="33"
          alt="${BRAND_NAME}"
          style="display:block;border:0;font-weight:800;font-size:18px;color:#fff"
        />
        <div style="opacity:.9;font-size:13px;margin-top:7px">${escapeHtml(subtitle)}</div>
      </div>
      <div style="padding:22px 24px;color:#20293a">${body}</div>
    </div>
    <div style="max-width:520px;margin:12px auto 0;text-align:center;color:#9aa0b4;font-size:11.5px">${escapeHtml(footer)}</div>
  </div>`
}

function button(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin-top:14px;background:${BRAND_COLORS.violet};color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:12px;font-size:14px">${escapeHtml(label)}</a>`
}

/**
 * Sends, and never throws.
 *
 * A failed email must not roll back the thing it was announcing. If the booking
 * row is written and Resend is down, the request still exists and the
 * practitioner sees it in their inbox next time they open Ombúa — which is a much
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
    /** Since P7 the form asks for a date; older requests only have the weekday. */
    preferred_date?: string | null
    preferred_time: string | null
    note: string | null
  }
  appUrl: string
}) {
  const when = [
    request.preferred_date
      ? formatLongDate(request.preferred_date)
      : request.preferred_weekday === null
        ? null
        : weekdayName(request.preferred_weekday),
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
        <p style="margin:16px 0 0;font-size:13.5px;color:#586074">Entrá a Ombúa y confirmala para que quede en tu agenda.</p>
        ${button(`${appUrl}/reservas`, 'Abrir Ombúa')}`,
    footer: 'Recibís este aviso porque tenés reservas activas en Ombúa.',
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
        <p style="margin:16px 0 0;font-size:13.5px;color:#586074">El detalle está en Ombúa, con nombre y apellido.</p>
        ${button(`${appUrl}/inicio`, 'Abrir Ombúa')}`,
    footer: 'Recibís este resumen cada quince días. Si no querés recibirlo más, escribinos.',
  })

  return send({ to, subject: 'Tu resumen de Ombúa', html })
}

/**
 * Aviso a quien mantiene Ombúa de que falta un formato de informe.
 *
 * Va a `OWNER_EMAIL` y no a la profesional: es un pedido *hacia adentro*, y
 * quien tiene que enterarse es quien puede agregar el formato.
 *
 * ─── Por qué este mail sí puede llevar el texto ───────────────────────────
 *
 * La regla del proyecto es que el contenido clínico no viaja por correo, y se
 * sostiene: un mail es una copia que vive para siempre en una casilla de otra
 * empresa. Un pedido de formato no es contenido clínico —habla de documentos,
 * no de pacientes— así que acá el texto va entero, que es lo único que hace útil
 * el aviso.
 *
 * Lo que no viaja es de qué pacientes se trata, porque no se pregunta: el
 * formulario pide expresamente que no se escriban nombres. Lo que sí va es el
 * nombre y el correo de la profesional, que son datos de ella y de nadie más, y
 * sin ellos no hay a quién contestarle.
 */
export async function sendFormatRequestNotification({
  to,
  practitionerName,
  practitionerEmail,
  discipline,
  detail,
}: {
  to: string
  practitionerName: string
  practitionerEmail: string
  discipline: string
  detail: string
}) {
  const html = layout({
    subtitle: 'Pedido de formato',
    body: `
        <p style="margin:0 0 12px">${escapeHtml(practitionerName)} (${escapeHtml(discipline)}) pidió un formato de informe que todavía no existe:</p>
        <blockquote style="margin:0 0 14px;padding:12px 14px;background:${BRAND_COLORS.violetWhisper};border-radius:11px;font-size:14px;line-height:1.6">${escapeHtml(detail)}</blockquote>
        <p style="margin:0;font-size:13.5px;color:#586074">Contestale a ${escapeHtml(practitionerEmail)}.</p>`,
    footer: 'Este aviso lo genera Ombúa cuando alguien pide un formato nuevo.',
  })

  return send({ to, subject: `Pedido de formato · ${practitionerName}`, html })
}

// ─── An invitation ──────────────────────────────────────────────────────────

/**
 * The one email Ombúa sends to somebody who does not have an account.
 *
 * It carries a link with a token in it, which is the closest thing to a
 * credential that leaves this system by mail — so the two sentences about what
 * the link does and when it stops working are not padding. Somebody who was not
 * expecting this has to be able to tell, from the message alone, whether it is
 * for them.
 *
 * The inviter's name is in the body for the same reason. "Te invitaron a una
 * herramienta clínica" from nobody in particular is indistinguishable from
 * phishing; "Carolina te invitó" is a fact the reader can check against their
 * own week.
 *
 * No clinical content, and there is none to leak here: at the moment this is
 * sent, the recipient has no patients and no records.
 */
export async function sendInvitation({
  to,
  fullName,
  inviterName,
  link,
}: {
  to: string
  fullName: string
  inviterName: string
  link: string
}) {
  const html = layout({
    subtitle: 'Te invitaron a Ombúa',
    body: `
        <p style="margin:0 0 12px">Hola ${escapeHtml(firstName(fullName))},</p>
        <p style="margin:0 0 14px"><b>${escapeHtml(inviterName)}</b> te invitó a usar Ombúa: tus pacientes, tus sesiones y tus informes en un solo lugar.</p>
        <p style="margin:0;font-size:13.5px;color:#586074">Tocá el botón, elegí una contraseña y entrás derecho a tu espacio de trabajo.</p>
        ${button(link, 'Crear mi cuenta')}
        <p style="margin:16px 0 0;font-size:12.5px;line-height:1.6;color:#6b7280">
          El enlace vence en catorce días y se usa una sola vez. Si no esperabas esta invitación, ignorá este correo: sin elegir una contraseña no se crea ninguna cuenta.
        </p>`,
    footer: 'Recibís este correo porque alguien te invitó a Ombúa.',
  })

  return send({ to, subject: `${inviterName} te invitó a Ombúa`, html })
}
