-- Instrucciones propias para informes y evaluaciones (P20).
--
-- El QA de Thomas: en vez de pedir un formato nuevo por "me falta este
-- formato", que la profesional pueda pegar el prompt que ya usa y correrlo con
-- los datos del paciente. Carolina eligió que se pueda **guardar con un nombre y
-- reusar**, y que vaya siempre **debajo** de las reglas clínicas de Hilo.
--
-- ─── Dos cosas ────────────────────────────────────────────────────────────
--
-- `prompt_templates`: las guardadas, por profesional y por tipo de documento.
-- Un nombre por tipo: guardar otra vez con el mismo nombre la actualiza, que es
-- lo que alguien espera de "Informe para el colegio".
--
-- `custom_instructions` en `reports` y `assessments`: el texto que se usó para
-- ese documento, copiado. Copiado y no referenciado, por dos razones: la ruta de
-- IA lo lee de la base y no de lo que mande el navegador en cada pedido, y
-- "Regenerar" usa lo mismo aunque la plantilla después se edite o se borre. Un
-- documento firmado tiene que poder decir con qué se escribió.
--
-- Los topes de largo están en la base además de en la aplicación: son texto que
-- va entero a Anthropic en cada generación.

create table prompt_templates (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,

  kind            text not null check (kind in ('report', 'assessment')),
  name            text not null check (char_length(name) between 1 and 80),
  body            text not null check (char_length(body) between 1 and 4000),

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (practitioner_id, kind, name)
);

create trigger prompt_templates_touch_updated_at
  before update on prompt_templates
  for each row execute function public.touch_updated_at();

alter table prompt_templates enable row level security;

create policy "own_rows" on prompt_templates
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));

alter table reports
  add column custom_instructions text
    check (char_length(custom_instructions) <= 4000);

alter table assessments
  add column custom_instructions text
    check (char_length(custom_instructions) <= 4000);
