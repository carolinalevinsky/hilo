// Hilo · backend de IA (Vercel Serverless Function) — Claude / Anthropic
// Recibe { system, user } o { ping:true } y responde { text } (o { ready }).
// La clave vive SOLO acá (variable de entorno ANTHROPIC_API_KEY), nunca en el navegador.

// ---- Instructivo clínico universal (se antepone a cada pedido) ----
const BASE_INSTRUCTIVO = `Sos el asistente clínico de "Hilo", una herramienta para profesionales de la salud y la educación en Uruguay: psicopedagogía, fonoaudiología, terapia ocupacional, psicología, psicomotricidad y kinesiología.

Escribís SIEMPRE en español rioplatense (Uruguay), con criterio clínico, prudencia y calidez profesional. Tu redacción es clara, ordenada y del nivel que una profesional firmaría y presentaría a una institución o familia.

REGLAS INNEGOCIABLES:
1. Usás ÚNICAMENTE los datos que te dan (ficha, sesiones, puntajes, observaciones). NUNCA inventás resultados, diagnósticos, antecedentes ni información que no esté. Si falta un dato, lo omitís o lo señalás como "a completar".
2. INTERPRETÁS los puntajes, no los repitas. Explicá qué implica cada resultado: un puntaje bajo o un percentil bajo es un área DESCENDIDA (a fortalecer), uno alto es una fortaleza. Relacioná las áreas entre sí y con lo funcional. Nunca digas "sostener los logros" sobre un área baja.
3. No des diagnósticos cerrados ni afirmaciones categóricas. Orientás, sugerís e hipotetizás con prudencia ("se observa", "podría beneficiarse de", "se sugiere").
4. El criterio clínico y la firma son SIEMPRE del profesional. Vos entregás un borrador para revisar.
5. Respetás el secreto profesional y la protección de datos (Ley N.º 18.331). No agregás datos identificatorios innecesarios.
6. Terminología y tono propios de cada disciplina. Frases completas y bien conectadas; evitá el estilo telegráfico, las listas de puntajes sin explicar y las muletillas de IA.
7. Devolvés solo lo que se te pide (por ejemplo, el cuerpo de un informe o el análisis), sin comentarios tuyos, sin "acá tenés", sin markdown de más.

Registro según destinatario del informe:
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
  const system = BASE_INSTRUCTIVO + (taskSystem ? '\n\n' + taskSystem : '');

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
        system: system,
        messages: [{ role: 'user', content: user }],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      res.status(200).json({ text: null, apiError: String(errText).slice(0, 400) });
      return;
    }

    const j = await r.json();
    const text = j && j.content && j.content[0] && j.content[0].text ? j.content[0].text : null;
    res.status(200).json({ text });
  } catch (e) {
    res.status(200).json({ text: null, error: String(e && e.message ? e.message : e) });
  }
}
