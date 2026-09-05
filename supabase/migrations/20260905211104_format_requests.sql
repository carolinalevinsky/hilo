-- Los formatos de informe que las profesionales piden y todavía no existen.
--
-- La pantalla de Informes ofrece los formatos de la disciplina de cada una, y
-- esa lista está escrita a mano en `src/lib/recipients.ts` porque cada
-- destinatario tiene un tono distinto y eso se redactó, no se generó. La
-- consecuencia es que cuando falta uno —un informe para un juzgado, para una
-- obra social que pide otra cosa— no hay nada que hacer desde la app.
--
-- Esta tabla es ese "nada que hacer": queda escrito quién lo pidió y qué pidió,
-- y el formato nuevo lo agrega una persona al código.
--
-- ─── Por qué el texto no es clínico, y por qué igual se cuida ──────────────
--
-- Un pedido de formato habla de documentos, no de pacientes: "necesito uno para
-- el juzgado". Por eso puede viajar por correo, a diferencia de todo lo demás
-- que hay en esta base.
--
-- Pero nada impide que alguien escriba ahí el nombre de un paciente sin pensar.
-- El formulario lo pide expresamente y el largo está acotado, y aun así la fila
-- vive con la misma política que el resto: cada quien ve las suyas y nadie ve
-- las ajenas. Que el contenido sea inofensivo *casi siempre* no es razón para
-- guardarlo con menos cuidado que lo demás.

create table format_requests (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,

  -- Qué formato falta, en las palabras de quien lo pide. Acotado a 500: es una
  -- descripción, no un informe, y un límite en la base es el que no se puede
  -- saltear desde otra pantalla.
  detail          text not null check (length(trim(detail)) between 5 and 500),

  created_at      timestamptz not null default now()
);

create index format_requests_practitioner on format_requests (practitioner_id, created_at desc);

alter table format_requests enable row level security;

create policy "own_rows" on format_requests
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));
