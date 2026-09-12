-- El historial de un documento clínico: qué decía antes de que algo lo cambiara.
--
-- ─── Qué se rompía ────────────────────────────────────────────────────────
--
-- "Regenerar con IA" en un informe hacía, en este orden: borrar el texto de la
-- pantalla, escribir el nuevo mientras llegaba, y guardarlo. Sin preguntar y sin
-- copia. Una profesional que pasó cuarenta minutos redactando y ajustando a mano
-- perdía las cuarenta y cinco líneas apretando un botón que dice "Regenerar",
-- que suena a "hacelo de nuevo" y no a "tirá lo que escribí".
--
-- Es la peor pérdida de datos que tiene la aplicación, porque lo que se pierde
-- es criterio clínico escrito, no un dato que se vuelve a cargar mirando una
-- ficha.
--
-- El arreglo tiene dos mitades y esta tabla es la de abajo. La de arriba es que
-- **la IA no pisa**: propone al lado y no queda nada hasta apretar "Aplicar".
-- Aun así hace falta el historial, porque "Aplicar" también reemplaza, y porque
-- una edición a mano encima de un texto bueno es la misma pérdida más lenta.
--
-- ─── Por qué una tabla y no dos ───────────────────────────────────────────
--
-- Los dos documentos que se firman —`reports.content` y `assessments.analysis`—
-- son la misma cosa para este problema: texto plano que alguien escribe, corrige
-- y firma. Un historial por tabla serían dos esquemas y dos módulos idénticos.
--
-- Las dos claves foráneas son anulables y un `check` obliga a que venga
-- exactamente una. Es a propósito, y la alternativa —una columna `document_id`
-- suelta con un `kind` al lado— es la que no sirve: sin clave foránea no hay
-- `on delete cascade`, así que borrar un informe dejaría atrás sus versiones.
-- Eso no es un huérfano cosmético: es texto clínico que sigue existiendo después
-- de que la profesional apretó "Borrar", que es exactamente lo que ese botón
-- promete que no pasa.

create table document_versions (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,

  -- Una de las dos, nunca las dos, nunca ninguna.
  report_id       uuid references reports (id) on delete cascade,
  assessment_id   uuid references assessments (id) on delete cascade,

  -- Lo que el documento decía antes. Texto plano, por la misma razón que
  -- `reports.content`: una columna de HTML obliga a `dangerouslySetInnerHTML`
  -- del otro lado.
  body            text not null,

  -- Qué lo reemplazó. Sirve para que la lista diga "antes de regenerar con IA"
  -- en vez de una fecha sola: la pregunta que se hace al abrir el historial no
  -- es "cuándo" sino "cuál era la mía".
  replaced_by     text not null check (replaced_by in ('ai', 'edit', 'restore')),

  created_at      timestamptz not null default now(),

  constraint document_versions_one_document
    check (num_nonnulls(report_id, assessment_id) = 1)
);

-- La única consulta: las versiones de este documento, la más nueva primero.
create index document_versions_report_idx
  on document_versions (report_id, created_at desc);
create index document_versions_assessment_idx
  on document_versions (assessment_id, created_at desc);

alter table document_versions enable row level security;

-- `for all`, como el resto del esquema y no como `ai_usage`. Acá no hay parte
-- interesada en borrar: el que borra una versión se perjudica solo. Y una
-- profesional tiene que poder sacar texto clínico de su propia base.
create policy "own_rows" on document_versions
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));
