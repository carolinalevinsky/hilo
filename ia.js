// Hilo · backend de IA (Vercel Serverless Function)
// Recibe { system, user } o { ping:true } y responde con { text } o { ready }.
// La clave vive SOLO acá (variable de entorno ANTHROPIC_API_KEY), nunca en el navegador.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;

  // Leer el body (Vercel suele parsearlo solo; por las dudas contemplamos string)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; }
  }
  body = body || {};

  // Chequeo: ¿hay IA disponible? (la app lo usa para prender/apagar las funciones)
  if (body.ping) {
    res.status(200).json({ ready: !!key });
    return;
  }

  // Sin clave configurada → la app usa su borrador de respaldo
  if (!key) {
    res.status(200).json({ text: null, noKey: true });
    return;
  }

  const system = String(body.system || '');
  const user = String(body.user || '');
  if (!user) {
    res.status(200).json({ text: null });
    return;
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 1400,
        system: system,
        messages: [{ role: 'user', content: user }],
      }),
    });

    const j = await r.json();
    const text =
      j && j.content && j.content[0] && j.content[0].text
        ? j.content[0].text
        : null;

    res.status(200).json({ text });
  } catch (e) {
    // Ante cualquier error, la app cae al borrador de respaldo
    res.status(200).json({ text: null, error: String(e && e.message ? e.message : e) });
  }
}
