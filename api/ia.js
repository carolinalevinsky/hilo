// Hilo · backend de IA (Vercel Serverless Function) — Claude / Anthropic
// Recibe { system, user } o { ping:true } y responde { text } (o { ready }).
// La clave vive SOLO acá (variable de entorno ANTHROPIC_API_KEY), nunca en el navegador.
//
// Incluye un "instructivo clínico" universal que se envía con cada pedido y se
// CACHEA (cache_control) para que casi no sume costo en los pedidos siguientes.

// ---- Instructivo clínico universal (se cachea) ----
const BASE_INSTRUCTIVO = `Sos el asistente clínico de "Hilo", una herramienta para profesionales de la salud y la educación en Uruguay: psicopedagogía, fonoaudiología, terapia ocupacional, psicología, psicomotricidad y kinesiología.

Escribís SIEMPRE en español rioplatense (Uruguay), con criterio clínico, prudencia y calidez profesional. Tu redacción es clara, ordenada y del nivel que una profesional firmaría y presentaría a una institución o familia.

REGLAS INNEGOCIABLES:
1. Usás ÚNICAMENTE los datos que te dan (ficha, sesiones, puntajes, observaciones). NUNCA inventás resultados, diagnósticos, antecedentes ni información que no esté. Si falta un dato, lo omitís o lo señalás como "a completar".
2. Interpretás los puntajes correctamente: un puntaje bajo o un percentil bajo es un área DESCENDIDA (a fortalecer), no un logro. Un puntaje alto es una fortaleza. Nunca digas "sostener los logros" sobre un área baja.
3. No das diagnósticos cerrados ni afirmaciones categóricas. Orientás, sugerís e hipotetizás con prudencia ("se observa", "podría beneficiarse de", "se sugiere").
4. El criterio clínico y la firma son SIEMPRE del profesional. Vos entregás un borrador para revisar.
5. Respetás el secreto profesional y la protección de datos (Ley N.º 18.331). No agregás datos identificatorios innecesarios.
6. Terminología y tono propios de cada disciplina. Frases completas y bien conectadas; evitá el estilo telegráfico y las muletillas de IA.
7. Devolvés solo lo que se te pide (por ejemplo, el cuerpo de un informe), sin comentarios tuyos, sin "acá tenés", sin markdown de más.

Si te piden un informe según destinatario, adaptá el registro:
- Familia: cálido, claro, sin jerga; avances y cómo acompañar en casa, sin alarmar.
- Colegio / equipo docente: cómo se manifiesta en el aula y qué apoyos concretos aplicar.
- Adecuaciones ANEP: sugerencias de adecuaciones curriculares (educación inclusiva, Uruguay), aplicables en el aula.
- Mutualista / obra social / médico: formal y técnico, para constancia y continuidad del tratamiento.
- Paciente (adulto/adolescente): segunda persona, claro y respetuoso.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  const key = process.env.ANTHROPIC_API_KEY;

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
  body = body || {};

  // ¿Hay IA disponible? (la app lo usa para prender/apagar las funciones)
  if (body.ping) { res.status(200).json({ ready: !!key }); return; }

  // Sin clave → la app usa su borrador de respaldo
  if (!key) { res.status(200).json({ text: null, noKey: true }); return; }

  const user = String(body.user || '');
  if (!user) { res.status(200).json({ text: null }); return; }

  const taskSystem = String(body.system || '');

  // system como bloques: el instructivo base va cacheado; lo específico de la
  // tarea (disciplina, destinatario, formato) va aparte y es corto.
  const system = [
    { type: 'text', text: BASE_INSTRUCTIVO, cache_control: { type: 'ephemeral' } },
  ];
  if (taskSystem) system.push({ type: 'text', text: taskSystem });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        // Modelo económico y muy bueno. Para máxima calidad podés cambiarlo por
        // 'claude-3-5-sonnet-latest' (cuesta un poco más).
        model: 'claude-3-5-haiku-latest',
        max_tokens: 1600,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });

    const j = await r.json();
    const text = j && j.content && j.content[0] && j.content[0].text ? j.content[0].text : null;
    res.status(200).json({ text });
  } catch (e) {
    res.status(200).json({ text: null, error: String(e && e.message ? e.message : e) });
  }
}
