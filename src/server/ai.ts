import Anthropic from '@anthropic-ai/sdk'

import { env } from '@/lib/env'

/**
 * The Anthropic client, the clinical instruction block, and the two things that
 * must happen before either is used.
 *
 * The output of this file is a document a licensed professional signs and sends
 * to a school, a family, or a health insurer. Everything here is shaped by that.
 */

/**
 * **Pinned. Never resolved at runtime.**
 *
 * v1 asked the account for its model list and took the first `/haiku/i` match
 * (`legacy/api/ia.js:33`), which meant the quality of a signed clinical report
 * depended on what that list returned that day. Changing this is a deliberate
 * one-line edit followed by a review of saved reports — not a cost optimisation
 * to slide in.
 */
const MODEL = 'claude-opus-5'

/**
 * Thinking is on by default on this model, and `max_tokens` caps thinking *plus*
 * output text together. A value sized for the report body alone truncates the
 * report; this leaves headroom for both.
 */
const MAX_TOKENS = 20_000

export const AI_MODEL = MODEL

let client: Anthropic | null = null

function anthropic() {
  client ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  return client
}

/**
 * ─── The clinical instruction block ────────────────────────────────────────
 *
 * Ported verbatim from `legacy/api/ia.js` lines 6–24. **Do not "improve" it.**
 *
 * Every rule in it is there for a reason that cost something to learn. The
 * second one in particular: v1 users found the model writing "sostener los
 * logros" about an area that was *weak*, which is not a style problem, it is
 * actively wrong clinical advice in a document someone signs.
 *
 * It is identical on every request, which is exactly the shape prompt caching is
 * for — see the cache breakpoint in `systemPrompt()` below.
 */
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
- Paciente (adulto/adolescente): segunda persona, claro y respetuoso.`

/**
 * The system prompt: the shared block, cached, then the task-specific part.
 *
 * The cache breakpoint sits at the end of `BASE_INSTRUCTIVO` and everything
 * per-request comes strictly after it. Cache reads cost about a tenth of the
 * base input rate, and this block comfortably exceeds the 512-token minimum
 * cacheable prefix.
 *
 * Note what is absent: any instruction to double-check or verify. This model
 * self-verifies, and telling it to do so causes redundant work. That inverts the
 * usual advice, which is why it is written down here.
 */
function systemPrompt(taskInstructions: string) {
  return [
    {
      type: 'text' as const,
      text: BASE_INSTRUCTIVO,
      cache_control: { type: 'ephemeral' as const },
    },
    { type: 'text' as const, text: taskInstructions },
  ]
}

/**
 * A file sent along with the prompt, for the model to read.
 *
 * The only thing that uses this is describing an uploaded material, and it is
 * the one place a *file* of the practitioner's leaves the server — everywhere
 * else, only text they typed does. The upload form says so before a file is
 * chosen. See `supabase/migrations/…_add_material_files.sql`.
 */
export type Attachment = {
  mediaType: DescribableType
  /** Base64, without the `data:` prefix. */
  data: string
}

/**
 * What the model can actually read.
 *
 * HEIC is deliberately absent and is *not* an oversight: the bucket accepts it,
 * because that is what an iPhone produces and a photo of a worksheet must not be
 * rejected at the door, but the API does not take it. A file it cannot read is
 * stored and kept; only the description has to be written by hand.
 */
export const DESCRIBABLE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

export type DescribableType = (typeof DESCRIBABLE_TYPES)[number]

export function canDescribe(mediaType: string | null | undefined): mediaType is DescribableType {
  return DESCRIBABLE_TYPES.includes(mediaType as DescribableType)
}

/** A PDF is a `document` to the API; everything else here is an `image`. */
function attachmentBlock(attachment: Attachment) {
  if (attachment.mediaType === 'application/pdf') {
    return {
      type: 'document' as const,
      source: {
        type: 'base64' as const,
        media_type: 'application/pdf' as const,
        data: attachment.data,
      },
    }
  }

  return {
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: attachment.mediaType,
      data: attachment.data,
    },
  }
}

/** What a refusal or an outage looks like to the caller. */
export class AiUnavailableError extends Error {
  constructor(
    message: string,
    readonly reason: 'refusal' | 'error',
  ) {
    super(message)
    this.name = 'AiUnavailableError'
  }
}

/**
 * Streams a completion as plain text chunks.
 *
 * Streaming is not a nicety here. Report generation is the request most likely
 * to hit a serverless timeout, and streaming removes the HTTP timeout as the
 * constraint entirely. It also means the practitioner watches the report being
 * written rather than staring at a spinner for thirty seconds — which, for a
 * document they are about to read carefully anyway, is the better experience.
 */
export async function* streamCompletion(
  taskInstructions: string,
  userPrompt: string,
  attachment?: Attachment,
): AsyncGenerator<string> {
  const stream = anthropic().messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt(taskInstructions),
    messages: [
      {
        role: 'user',
        content: attachment
          ? [attachmentBlock(attachment), { type: 'text', text: userPrompt }]
          : userPrompt,
      },
    ],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }

  // Checked *after* the stream, because a refusal arrives as a normal HTTP 200
  // with empty or partial content. Code that reads `content[0].text`
  // unconditionally crashes on it. Clinical prompts are benign, but adjacent
  // life-sciences vocabulary can trip a safety classifier, and a crash mid-report
  // is not the way a practitioner should find out.
  const message = await stream.finalMessage()
  if (message.stop_reason === 'refusal') {
    throw new AiUnavailableError(
      'La IA no pudo redactar este texto con los datos cargados.',
      'refusal',
    )
  }
}
