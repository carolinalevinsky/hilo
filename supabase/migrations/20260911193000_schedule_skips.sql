-- "Quitar de la agenda" que no vuelve (P5).
--
-- Una sesión generada por un horario fijo se borraba y reaparecía en la próxima
-- carga de la Agenda: `materialiseAppointments` recorre las reglas activas y
-- vuelve a crear cada fecha que falte, y la deduplicación es por la fila —
-- `unique (schedule_id, scheduled_on)— así que una fila borrada no deja rastro
-- contra el cual deduplicar. Con las horas sueltas funcionaba, y por eso el QA de
-- Thomas lo vio como algo intermitente.
--
-- Carolina decidió que "Quitar" pregunte "sólo esta vez" o "todas las de este
-- horario", como cualquier calendario con eventos que se repiten. "Todas" ya
-- existía (dar de baja la regla). "Sólo esta vez" necesita dónde anotar la
-- excepción, y es esta tabla: la regla sigue, y esta fecha no.
--
-- Una tabla aparte y no un estado nuevo en `appointments` (una fila "quitada" que
-- se esconde) porque borrar la sesión ya hace bien todo lo demás: la saca de
-- Google, desata el registro escrito de ella y lo preparado para ella (sus
-- foráneas son `set null`). Una fila escondida tendría que acordarse de que no
-- existe en cada consulta de la Agenda, las estadísticas, Inicio y la ficha.
--
-- Foránea compuesta sobre `(practitioner_id, schedule_id)`, por lo mismo que en
-- `20260907010000`: una foránea no pasa por RLS, y sin el par una fila con el
-- campo cambiado a mano podía apuntar al horario de otra profesional. Borrar el
-- horario se lleva sus excepciones.

alter table schedules
  add constraint schedules_practitioner_id_id_key unique (practitioner_id, id);

create table schedule_skips (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  schedule_id     uuid not null,
  skipped_on      date not null,
  created_at      timestamptz not null default now(),

  constraint schedule_skips_schedule_same_practitioner
    foreign key (practitioner_id, schedule_id)
    references schedules (practitioner_id, id)
    on delete cascade,

  -- Quitar dos veces la misma fecha es una sola excepción.
  unique (schedule_id, skipped_on)
);

alter table schedule_skips enable row level security;

create policy "own_rows" on schedule_skips
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));
