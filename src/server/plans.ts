import { startOfDayInUruguay, today } from '@/lib/dates'
import { getDb } from './db'

/**
 * Plan limits, and the quota check that runs before every call to Anthropic.
 *
 * v1 enforced this in the browser (`legacy/index.html:2775`), which anyone can
 * edit — and the endpoint behind it had no authentication at all
 * (`legacy/api/ia.js:71`), so a stranger who found the URL could drain the
 * Anthropic key. Both halves are fixed here: the count happens on the server,
 * and it happens *before* the expensive call.
 */

export const PLAN_LIMITS = {
  free: { label: 'Gratis', reports: 10, assessments: 10, questions: 40, materials: 10 },
  pro: { label: 'Pro', reports: 200, assessments: 400, questions: 1000, materials: 200 },
} as const

export type PlanId = keyof typeof PLAN_LIMITS

/** The four things that cost an Anthropic call. */
export type QuotaKind = 'reports' | 'assessments' | 'questions' | 'materials'

export function planLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanId] ?? PLAN_LIMITS.free
}

/**
 * El instante en que empezó el mes en curso en Uruguay.
 *
 * Se compara contra `created_at`, que es `timestamptz`, así que tiene que ser un
 * instante y no una fecha suelta. Leído con el reloj del servidor, el mes
 * arrancaba a las 21:00 del último día del mes anterior: la cuota se renovaba
 * tres horas antes de tiempo y la pantalla seguía diciendo "se renueva el 1.º".
 *
 * Exportada porque `materials.quota.test.ts` verifica el conteo contra la base y
 * necesita el mismo corte. Tenía una copia de estas cuatro líneas al lado de un
 * comentario que decía "as `src/server/plans.ts` runs it"; la copia se quedó
 * vieja apenas esto cambió, que es lo que hacen las copias.
 */
export function startOfMonth(): string {
  return startOfDayInUruguay(`${today().slice(0, 7)}-01`).toISOString()
}

/**
 * Cuántas de estas gastó esta profesional en el mes en curso.
 *
 * `count(*)` sobre un índice y no una columna contador, que es lo que decía este
 * archivo desde el principio y sigue siendo cierto: un contador es una segunda
 * copia de la verdad y se desincroniza, y la desincronización siempre aparece en
 * el peor momento — cuando a alguien se le niega un informe que pagó, o se le
 * entrega uno que no.
 *
 * Lo que cambió es **sobre qué** se cuenta. Antes eran las filas que el consumo
 * produce: los informes, las evaluaciones, los materiales con `source = 'ai'` y
 * una tabla `assistant_questions` que existía sólo para esto. Las cuatro tienen
 * política `for all`, así que borrar un informe devolvía la cuota — con botón,
 * incluso. Ahora se cuenta `ai_usage`, que la usuaria lee y no toca.
 *
 * La lectura sigue yendo por `getDb()`: la tabla tiene política de filas propias
 * para `select`, así que RLS alcanza y esto no necesita la clave de servicio.
 * La escritura sí, y vive sola en `src/server/ai-usage.ts`.
 */
export async function countThisMonth(
  practitionerId: string,
  kind: QuotaKind,
): Promise<number> {
  const db = await getDb()

  const { count, error } = await db
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .eq('practitioner_id', practitionerId)
    .eq('kind', kind)
    .gte('created_at', startOfMonth())

  if (error) throw error
  return count ?? 0
}

export type QuotaStatus = {
  kind: QuotaKind
  used: number
  limit: number
  remaining: number
  exceeded: boolean
}

export async function quota(
  practitionerId: string,
  plan: string,
  kind: QuotaKind,
): Promise<QuotaStatus> {
  const limit = planLimits(plan)[kind]
  const used = await countThisMonth(practitionerId, kind)

  return {
    kind,
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    exceeded: used >= limit,
  }
}

export class QuotaExceededError extends Error {
  constructor(readonly status: QuotaStatus) {
    super('quota_exceeded')
    this.name = 'QuotaExceededError'
  }
}

/**
 * Throws if the practitioner is over their monthly allowance.
 *
 * **Call this before the Anthropic request, never after.** After is a bill for a
 * document nobody is allowed to keep.
 *
 * `alreadyCounted` is for regeneration. The document exists by the time the AI
 * route runs — it was created with an offline draft so that an outage still
 * leaves something to edit — so it is already in the count, and the practitioner
 * would otherwise be blocked from improving the very report that used their last
 * allowance. It lets someone re-run the model on a document they already own;
 * it does not let them create another one.
 */
export async function assertQuota(
  practitionerId: string,
  plan: string,
  kind: QuotaKind,
  { alreadyCounted = false } = {},
) {
  const status = await quota(practitionerId, plan, kind)
  const used = alreadyCounted ? Math.max(status.used - 1, 0) : status.used

  if (used >= status.limit) throw new QuotaExceededError(status)
  return status
}

/**
 * Artículo, singular y plural de cada uno.
 *
 * Los tres escritos a mano y no derivados: el castellano no pluraliza sacando
 * una ese —"evaluaciones" es "evaluación", "materiales" es "material"— y una
 * regla que acierte los cuatro casos es más larga y más frágil que la tabla.
 */
const QUOTA_NOUN: Record<QuotaKind, { article: string; one: string; many: string }> = {
  reports: { article: 'los', one: 'informe', many: 'informes' },
  assessments: { article: 'las', one: 'evaluación', many: 'evaluaciones' },
  questions: { article: 'las', one: 'pregunta', many: 'preguntas' },
  materials: {
    article: 'los',
    one: 'material generado con IA',
    many: 'materiales generados con IA',
  },
}

export function quotaMessage(status: QuotaStatus): string {
  const { article, many } = QUOTA_NOUN[status.kind]
  return `Con tu plan ya usaste ${article} ${status.limit} ${many} de este mes. Se renueva el 1.º.`
}

/** A cuántos de distancia del límite se empieza a avisar. */
const WARN_FROM = 3

/**
 * El aviso de que se está por acabar el mes, o `null` cuando todavía sobra.
 *
 * La pantalla no muestra un contador permanente: saber que se usaron 2 de 10 no
 * le sirve a nadie y ocupa lugar arriba de lo que se vino a hacer. Lo que sí
 * importa es enterarse *antes* de chocar, y por eso esto aparece recién en los
 * últimos tres.
 *
 * Devuelve `null` también cuando ya no queda ninguno: ahí el aviso no
 * corresponde porque el límite ya se aplica solo, con `quotaMessage`, en el
 * momento en que se intenta crear. Dos textos distintos diciendo lo mismo en la
 * misma pantalla se contradicen apenas uno de los dos se queda viejo.
 */
export function quotaWarning(status: QuotaStatus): string | null {
  if (status.remaining === 0 || status.remaining > WARN_FROM) return null

  const { one, many } = QUOTA_NOUN[status.kind]
  const single = status.remaining === 1

  return `Te ${single ? 'queda' : 'quedan'} ${status.remaining} ${
    single ? one : many
  } este mes. Se renueva el 1.º.`
}
