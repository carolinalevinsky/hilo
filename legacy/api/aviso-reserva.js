// Hilo · avisa por mail al profesional apenas entra una reserva.
// Lo dispara un "Database Webhook" de Supabase cuando se inserta una fila en `reservas`.
// Necesita estas variables de entorno en Vercel:
//   SB_SERVICE_KEY        -> la clave service_role de Supabase (secreta)
//   RESEND_API_KEY        -> tu API key de Resend
//   HILO_WEBHOOK_SECRET   -> un texto inventado, el mismo que ponés en el header del webhook
//   HILO_MAIL_FROM        -> (opcional) remitente, ej: "Hilo <avisos@tudominio.com>". Por defecto usa onboarding@resend.dev

const SB_URL = 'https://uepyfqibtocrekvnliyk.supabase.co';
// acepta el nombre estándar o el que usaste en Vercel
const SB_SERVICE_KEY = process.env.SB_SERVICE_KEY || process.env.Superbase_service_role || process.env.SUPABASE_SERVICE_ROLE;
const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.Resend_Hilo_Mailing;
const WEBHOOK_SECRET = process.env.HILO_WEBHOOK_SECRET;
const MAIL_FROM = process.env.HILO_MAIL_FROM || 'Hilo <onboarding@resend.dev>';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  // Seguridad: el webhook manda un secreto compartido en el header Authorization.
  if (WEBHOOK_SECRET) {
    const auth = req.headers['authorization'] || '';
    if (auth !== 'Bearer ' + WEBHOOK_SECRET) { res.status(401).json({ error: 'no_autorizado' }); return; }
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
  body = body || {};
  const rec = body.record || body.new || body; // formato del webhook de Supabase
  const profId = rec && rec.prof_id;
  if (!profId) { res.status(200).json({ ok: false, motivo: 'sin_prof_id' }); return; }

  // 1) buscar el mail del profesional (con la clave service_role, del lado del servidor)
  let email = '', nombre = '';
  try {
    const r = await fetch(`${SB_URL}/rest/v1/profesionales?id=eq.${encodeURIComponent(profId)}&select=email,nombre`, {
      headers: { apikey: SB_SERVICE_KEY, Authorization: 'Bearer ' + SB_SERVICE_KEY },
    });
    if (r.ok) { const arr = await r.json(); if (arr && arr[0]) { email = arr[0].email || ''; nombre = arr[0].nombre || ''; } }
  } catch (e) { /* sigue */ }
  if (!email) { res.status(200).json({ ok: false, motivo: 'sin_email' }); return; }

  // 2) armar el mail
  const nom = esc(rec.nombre || 'Alguien');
  const cuando = [rec.dia, rec.hora].filter(Boolean).map(esc).join(' ');
  const tel = rec.telefono ? esc(rec.telefono) : '';
  const nota = rec.nota ? esc(rec.nota) : '';
  const hola = nombre ? ('Hola ' + esc(nombre.split(' ')[0]) + ',') : 'Hola,';
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f4f5fb;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(30,36,54,.08)">
      <div style="background:linear-gradient(120deg,#6c4cf0,#8a5cf0);padding:20px 24px;color:#fff">
        <div style="font-weight:800;font-size:18px">Hilo</div>
        <div style="opacity:.9;font-size:13px;margin-top:2px">Nueva reserva</div>
      </div>
      <div style="padding:22px 24px;color:#20293a">
        <p style="margin:0 0 12px">${hola}</p>
        <p style="margin:0 0 14px">Te entró una reserva nueva:</p>
        <div style="border:1px solid #eceef6;border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.7">
          <div><b>${nom}</b></div>
          ${cuando ? `<div style="color:#586074">Turno pedido: <b>${cuando}</b></div>` : ''}
          ${tel ? `<div style="color:#586074">Teléfono: ${tel}</div>` : ''}
          ${nota ? `<div style="color:#586074">Nota: ${nota}</div>` : ''}
        </div>
        <p style="margin:16px 0 0;font-size:13.5px;color:#586074">Entrá a Hilo y confirmala para que quede en tu agenda.</p>
        <a href="https://hilo-test.vercel.app/" style="display:inline-block;margin-top:14px;background:#6c5ce7;color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:12px;font-size:14px">Abrir Hilo</a>
      </div>
    </div>
    <div style="max-width:520px;margin:12px auto 0;text-align:center;color:#9aa0b4;font-size:11.5px">Recibís este aviso porque tenés reservas activas en Hilo.</div>
  </div>`;

  // 3) enviar con Resend
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: MAIL_FROM, to: [email], subject: `Nueva reserva: ${rec.nombre || 'sin nombre'}`, html }),
    });
    if (!r.ok) { const t = await r.text(); res.status(200).json({ ok: false, motivo: 'resend', detalle: t.slice(0, 200) }); return; }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false, motivo: 'red', detalle: String(e && e.message ? e.message : e) });
  }
}
