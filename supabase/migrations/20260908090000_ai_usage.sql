-- destructive: intentional
--
-- El registro de consumo de IA, que es lo único que le pone techo al gasto.
--
-- ─── Por qué la cuota no funcionaba ────────────────────────────────────────
--
-- `src/server/plans.ts` contaba con `count(*)` sobre las filas que el consumo
-- produce: `reports`, `assessments`, `assistant_questions` y los `materials`
-- con `source = 'ai'`. La idea era buena y está escrita en ese archivo —un
-- contador aparte es una segunda copia de la verdad y se desincroniza— pero
-- tiene un agujero: **las cuatro tablas tienen política `for all`, así que la
-- usuaria puede borrar sus filas, y borrarlas le devuelve la cuota.**
--
-- Para `reports`, `assessments` y `materials` hay hasta un botón. Para
-- `assistant_questions` alcanza un DELETE por PostgREST con la anon key, que
-- viaja en el bundle. Generar, copiar el texto, borrar, repetir: el gasto contra
-- Anthropic no tenía techo.
--
-- Eso convivía con el defecto #9 de v1 (`legacy/index.html:2775`) en el mismo
-- lugar del razonamiento: allá el límite estaba en el navegador; acá estaba en
-- el servidor, pero sobre un dato que el navegador podía borrar.
--
-- ─── La forma, que es la de `audit_log` ───────────────────────────────────
--
-- Una fila por unidad consumida, escrita con la clave de servicio, que la
-- usuaria puede leer y no puede tocar. Es exactamente el argumento de
-- `audit_log`: un registro que quien está siendo medido puede editar no es un
-- registro. Sin política de insert, y el `revoke` además, para que la negativa
-- ocurra un paso antes y no dependa de que alguien se acuerde de esta línea al
-- agregar una política nueva.
--
-- Sigue sin haber columna contador. Se cuenta con `count(*)` sobre un índice,
-- como antes; lo que cambia es qué se cuenta.

create table ai_usage (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,

  -- Los cuatro de `PLAN_LIMITS`. Text con check y no un enum de Postgres, como
  -- todo el resto del esquema: agregar un valor a un enum adentro de una
  -- transacción es incómodo, un check cambia con un alter.
  kind            text not null check (kind in (
                    'reports', 'assessments', 'questions', 'materials'
                  )),

  created_at      timestamptz not null default now()
);

-- La única consulta: cuántas de este tipo, de esta profesional, este mes.
create index ai_usage_by_month on ai_usage (practitioner_id, kind, created_at desc);

alter table ai_usage enable row level security;

-- Se lee la propia —la pantalla de perfil podría mostrar cuánto va— y no se
-- escribe desde ninguna sesión.
create policy "own_rows_read" on ai_usage
  for select
  using (practitioner_id = (select auth.uid()));

revoke insert, update, delete on table ai_usage from authenticated;


-- ─── `assistant_questions` se muda acá y se va ────────────────────────────
--
-- Esa tabla existía **sólo para ser contada** — la migración que la creó lo dice
-- con todas las letras, y por eso no guarda el texto de la pregunta. Ahora la
-- cuenta la lleva `ai_usage`, así que quedaría una tabla que nadie escribe y
-- nadie lee, que es justo lo que `practitioners.ts` explica que es peor que no
-- tenerla.
--
-- Las filas se copian antes de borrar la tabla, así que el mes en curso no se
-- reinicia por esta migración: quien haya hecho treinta preguntas hoy sigue
-- teniendo treinta contadas mañana. Eso es lo que hace que esto sea una mudanza
-- y no un perdón.

insert into ai_usage (practitioner_id, kind, created_at)
select practitioner_id, 'questions', created_at from assistant_questions;

drop table assistant_questions;
