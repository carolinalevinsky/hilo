// Hilo · crea un link de cobro de Mercado Pago (Checkout Pro)
// El token del profesional vive en Supabase (tabla mp_cuentas, protegido por RLS).
// Esta función lo lee del lado del servidor usando la sesión del profesional (JWT),
// así el token nunca queda expuesto en el navegador.

const SB_URL = 'https://uepyfqibtocrekvnliyk.supabase.co';
const SB_KEY = 'sb_publishable_s72ugu6GfbslnC6pC7oteA_pG6YOoJr';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
  body = body || {};

  const jwt = String(body.jwt || '');
  const monto = Number(body.monto || 0);
  const titulo = String(body.titulo || 'Sesión').slice(0, 120);
  const back = String(body.back || SB_URL);

  if (!jwt) { res.status(200).json({ error: 'sin_sesion' }); return; }
  if (!(monto > 0)) { res.status(200).json({ error: 'monto_invalido' }); return; }

  let token = '';
  try {
    const r = await fetch(`${SB_URL}/rest/v1/mp_cuentas?select=token&limit=1`, {
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + jwt },
    });
    if (r.ok) { const arr = await r.json(); token = (arr && arr[0] && arr[0].token) || ''; }
  } catch (e) { /* sigue sin token */ }
  if (!token) { res.status(200).json({ error: 'sin_cuenta' }); return; }

  try {
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        items: [{ title: titulo, quantity: 1, unit_price: monto, currency_id: 'UYU' }],
        back_urls: { success: back, failure: back, pending: back },
        auto_return: 'approved',
      }),
    });
    const j = await r.json();
    if (!r.ok) { res.status(200).json({ error: 'mp_error', detail: String(j && (j.message || j.error) || '').slice(0, 200) }); return; }
    res.status(200).json({ link: j.init_point || j.sandbox_init_point || null });
  } catch (e) {
    res.status(200).json({ error: 'red', detail: String(e && e.message ? e.message : e) });
  }
}
