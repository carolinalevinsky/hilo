// Hilo · resumen quincenal por mail a cada profesional.
// Lo dispara un Cron de Vercel (ver vercel.json). Junta lo que necesita tu atención:
// reservas sin confirmar y pagos que podrían estar atrasados. No manda mail si no hay nada para avisar.
// Variables de entorno en Vercel:
//   SB_SERVICE_KEY   -> clave service_role de Supabase (secreta)
//   RESEND_API_KEY   -> API key de Resend
//   HILO_MAIL_FROM   -> (opcional) remitente
//   CRON_SECRET      -> (opcional) lo setea Vercel; si está, validamos que el llamado venga del cron

const SB_URL = 'https://uepyfqibtocrekvnliyk.supabase.co';
// acepta el nombre estándar o el que usaste en Vercel
const SB_SERVICE_KEY = process.env.SB_SERVICE_KEY || process.env.Superbase_service_role || process.env.SUPABASE_SERVICE_ROLE;
const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.Resend_Hilo_Mailing;
const MAIL_FROM = process.env.HILO_MAIL_FROM || 'Hilo <onboarding@resend.dev>';
const CRON_SECRET = process.env.CRON_SECRET;

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function sbGet(path) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: { apikey: SB_SERVICE_KEY, Authorization: 'Bearer ' + SB_SERVICE_KEY } });
  if (!r.ok) return [];
  try { return await r.json(); } catch (e) { return []; }
}

export default async function handler(req, res) {
  // Si Vercel maneja CRON_SECRET, validamos que el llamado sea del cron.
  if (CRON_SECRET) {
    const auth = req.headers['authorization'] || '';
    if (auth !== 'Bearer ' + CRON_SECRET) { res.status(401).json({ error: 'no_autorizado' }); return; }
  }

  // mes anterior (para detectar pagos atrasados)
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = prev.getFullYear() + '-' + String(prev.getMonth() + 1).padStart(2, '0');
  const prevLabel = prev.toLocaleDateString('es-UY', { month: 'long', year: 'numeric' });

  const profs = await sbGet('profesionales?select=id,email,nombre');
  const reservas = await sbGet('reservas?estado=eq.pendiente&select=prof_id');
  const pacientes = await sbGet('pacientes?select=profesional_id,nombre,data');

  const resPorProf = {};
  reservas.forEach(r => { resPorProf[r.prof_id] = (resPorProf[r.prof_id] || 0) + 1; });

  const atrasadosPorProf = {};
  pacientes.forEach(p => {
    const d = p.data || {};
    const fee = Number(d.fee) || 0;
    if (fee <= 0) return;
    const pg = (d.pagos && d.pagos[prevKey]) || null;
    const pagado = pg && (pg.paid === true || Number(pg.n) > 0);
    if (!pagado) { (atrasadosPorProf[p.profesional_id] = atrasadosPorProf[p.profesional_id] || []).push(p.nombre || 'Paciente'); }
  });

  let enviados = 0;
  for (const prof of profs) {
    if (!prof.email) continue;
    const nRes = resPorProf[prof.id] || 0;
    const atr = atrasadosPorProf[prof.id] || [];
    if (!nRes && !atr.length) continue; // nada para avisar, no molestamos

    const hola = prof.nombre ? ('Hola ' + esc(prof.nombre.split(' ')[0]) + ',') : 'Hola,';
    const bloques = [];
    if (nRes) bloques.push(`<div style="border:1px solid #eceef6;border-radius:12px;padding:14px 16px;margin-bottom:10px"><div style="font-weight:700;color:#20293a">${nRes} reserva(s) sin confirmar</div><div style="color:#586074;font-size:13.5px;margin-top:2px">Entrá a la Agenda y confirmalas para que queden en tu semana.</div></div>`);
    if (atr.length) bloques.push(`<div style="border:1px solid #eceef6;border-radius:12px;padding:14px 16px"><div style="font-weight:700;color:#20293a">Posibles pagos pendientes de ${esc(prevLabel)}</div><div style="color:#586074;font-size:13.5px;margin-top:4px">${atr.map(esc).join(', ')}</div><div style="color:#9aa0b4;font-size:12px;margin-top:6px">Revisá en Cobros; puede que ya lo hayas cobrado y falte marcarlo.</div></div>`);

    const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f4f5fb;padding:24px">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(30,36,54,.08)">
        <div style="background:linear-gradient(120deg,#6c4cf0,#8a5cf0);padding:20px 24px;color:#fff">
          <div style="font-weight:800;font-size:18px">Hilo</div>
          <div style="opacity:.9;font-size:13px;margin-top:2px">Tu resumen</div>
        </div>
        <div style="padding:22px 24px;color:#20293a">
          <p style="margin:0 0 14px">${hola} esto es lo que te está esperando:</p>
          ${bloques.join('')}
          <a href="https://hilo-test.vercel.app/" style="display:inline-block;margin-top:16px;background:#6c5ce7;color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:12px;font-size:14px">Abrir Hilo</a>
        </div>
      </div>
      <div style="max-width:520px;margin:12px auto 0;text-align:center;color:#9aa0b4;font-size:11.5px">Resumen quincenal de Hilo.</div>
    </div>`;

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: MAIL_FROM, to: [prof.email], subject: 'Tu resumen de Hilo', html }),
      });
      enviados++;
    } catch (e) { /* seguimos con el resto */ }
  }

  res.status(200).json({ ok: true, enviados });
}
