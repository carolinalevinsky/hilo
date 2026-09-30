-- Lo firmado queda firmado, y lo clínico no se borra: se va a la papelera.
--
-- ─── Qué se rompía ────────────────────────────────────────────────────────
--
-- Un informe o una evaluación nunca terminaban de estar hechos. Se podían
-- editar, regenerar o borrar para siempre después de entregados, y el borrado
-- se llevaba el historial de versiones en cascada. No había forma de probar qué
-- texto le llegó a un colegio, a una mutualista o al BPS. Los registros de
-- sesión y los pagos se borraban con un `delete` directo, sin vuelta atrás. Y
-- aunque la aplicación nunca borre un paciente, la base se lo dejaba borrar a
-- cualquiera con su propia sesión: un `DELETE /rest/v1/patients` se llevaba en
-- cascada consentimientos, sesiones e informes.
--
-- La historia clínica es del paciente (Ley 18.335) y hay que conservarla sin
-- alterarla: lo firmado se corrige con una versión nueva, no pisándolo.
--
-- ─── Qué hace esta migración ──────────────────────────────────────────────
--
-- 1. **Firmar congela.** `reports.signed_at` / `assessments.signed_at`. Al
--    firmar, el trigger pone la hora (no la que mande el navegador) y guarda
--    una copia del texto firmado en `document_versions`. Mientras está firmado,
--    el texto no cambia. "Corregir" pone `signed_at` en null: el texto vuelve a
--    ser un borrador y la copia firmada sigue en el historial para siempre.
--
-- 2. **Lo firmado no se borra, se anula.** `voided_at` + `void_reason`. Sólo
--    se puede anular algo que alguna vez se firmó, y anular es definitivo.
--
-- 3. **Papelera sin vencimiento.** `deleted_at` en sesiones, informes,
--    evaluaciones y pagos. Las políticas de lectura esconden lo que está en la
--    papelera, así que ninguna pantalla ni consulta tiene que acordarse de
--    filtrarlo: el que olvida un `.is('deleted_at', null)` no muestra nada de
--    más. Mover a la papelera, recuperar y listarla pasan por tres funciones
--    `security definer`, porque una fila que la política ya no deja ver
--    tampoco se deja actualizar.
--
-- 4. **La base no deja borrar historia clínica.** Se revoca `delete` a
--    `authenticated` en todas las tablas clínicas, y las versiones de un
--    documento pasan a ser sólo lectura.

-- ─── 1 y 2. Firmar y anular ─────────────────────────────────────────────────

alter table reports
  add column signed_at   timestamptz,
  add column voided_at   timestamptz,
  add column void_reason text,
  add column deleted_at  timestamptz,
  add constraint reports_void_has_reason
    check (voided_at is null or length(trim(coalesce(void_reason, ''))) > 0);

alter table assessments
  add column signed_at   timestamptz,
  add column voided_at   timestamptz,
  add column void_reason text,
  add column deleted_at  timestamptz,
  add constraint assessments_void_has_reason
    check (voided_at is null or length(trim(coalesce(void_reason, ''))) > 0);

-- Una copia firmada lleva la hora de la firma. El resto de las versiones no.
alter table document_versions
  add column signed_at timestamptz;

alter table document_versions
  drop constraint document_versions_replaced_by_check;

alter table document_versions
  add constraint document_versions_replaced_by_check
    check (replaced_by in ('ai', 'edit', 'restore', 'signed')),
  add constraint document_versions_signed_has_time
    check ((replaced_by = 'signed') = (signed_at is not null));

-- ¿Este documento se firmó alguna vez? Es lo que decide si se puede mandar a la
-- papelera (no) o anular (sí). Se pregunta al historial y no a `signed_at`,
-- porque un documento firmado y después abierto para corregir tiene
-- `signed_at` en null y sigue teniendo una versión entregada.
create or replace function public.document_was_signed(kind text, document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.document_versions v
    where v.replaced_by = 'signed'
      and (
        (kind = 'report' and v.report_id = document_id)
        or (kind = 'assessment' and v.assessment_id = document_id)
      )
  );
$$;

revoke execute on function public.document_was_signed(text, uuid) from public, anon, authenticated;

-- Las reglas del ciclo de vida, para los dos documentos.
--
-- `security definer` porque la copia firmada la escribe este trigger y nadie
-- más: la política de `document_versions` no deja insertar `signed` desde una
-- sesión, así que nadie puede fabricar una "versión firmada" con fecha vieja.
create or replace function public.guard_clinical_document()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  kind text := case tg_table_name when 'reports' then 'report' else 'assessment' end;
  body_changed boolean;
  new_body text;
begin
  if tg_op = 'INSERT' then
    -- Un documento nace borrador, siempre. Firmar es un paso aparte.
    new.signed_at := null;
    new.voided_at := null;
    new.void_reason := null;
    new.deleted_at := null;
    return new;
  end if;

  if kind = 'report' then
    new_body := new.content;
    body_changed :=
      new.content is distinct from old.content
      or new.title is distinct from old.title
      or new.recipient is distinct from old.recipient
      or new.issued_on is distinct from old.issued_on
      or new.patient_id is distinct from old.patient_id;
  else
    new_body := new.analysis;
    body_changed :=
      new.analysis is distinct from old.analysis
      or new.instrument is distinct from old.instrument
      or new.assessed_on is distinct from old.assessed_on
      or new.results is distinct from old.results
      or new.observations is distinct from old.observations
      or new.patient_id is distinct from old.patient_id;
  end if;

  -- Anulado es el final. No se edita, no se firma, no se desanula.
  if old.voided_at is not null then
    raise exception 'Este documento está anulado y no se puede modificar.'
      using errcode = 'P0001', hint = 'document_voided';
  end if;

  -- Firmado: el texto no se toca. Lo único que se puede es abrirlo para
  -- corregir (signed_at → null) o anularlo.
  if old.signed_at is not null and body_changed then
    raise exception 'Este documento está firmado. Para cambiarlo, primero corregilo.'
      using errcode = 'P0001', hint = 'document_signed';
  end if;

  -- Firmar: la hora la pone la base, y la copia también.
  if new.signed_at is not null and old.signed_at is null then
    if coalesce(trim(new_body), '') = '' then
      raise exception 'No se puede firmar un documento vacío.'
        using errcode = 'P0001', hint = 'document_empty';
    end if;
    new.signed_at := now();
    insert into public.document_versions
      (practitioner_id, report_id, assessment_id, body, replaced_by, signed_at)
    values (
      new.practitioner_id,
      case when kind = 'report' then new.id end,
      case when kind = 'assessment' then new.id end,
      new_body,
      'signed',
      new.signed_at
    );
  elsif new.signed_at is not null and new.signed_at is distinct from old.signed_at then
    -- Cambiarle la fecha a una firma no es firmar.
    new.signed_at := old.signed_at;
  end if;

  -- Anular: sólo lo que alguna vez se firmó. Un borrador va a la papelera.
  if new.voided_at is not null and old.voided_at is null then
    if not public.document_was_signed(kind, new.id) then
      raise exception 'Sólo se anula lo que se firmó. Un borrador se manda a la papelera.'
        using errcode = 'P0001', hint = 'document_not_signed';
    end if;
    new.voided_at := now();
  elsif new.void_reason is distinct from old.void_reason then
    new.void_reason := old.void_reason;
  end if;

  -- A la papelera: nunca algo que se firmó.
  if new.deleted_at is not null and old.deleted_at is null
     and public.document_was_signed(kind, new.id) then
    raise exception 'Lo que se firmó no se borra: se anula.'
      using errcode = 'P0001', hint = 'document_signed';
  end if;

  return new;
end;
$$;

revoke execute on function public.guard_clinical_document() from public, anon, authenticated;

create trigger reports_guard_lifecycle
  before insert or update on reports
  for each row execute function public.guard_clinical_document();

create trigger assessments_guard_lifecycle
  before insert or update on assessments
  for each row execute function public.guard_clinical_document();

-- ─── 3. La papelera ─────────────────────────────────────────────────────────

alter table sessions add column deleted_at timestamptz;
alter table payments add column deleted_at timestamptz;

-- Una sesión en la papelera no ocupa su cita: se puede volver a registrar.
drop index sessions_one_per_appointment;
create unique index sessions_one_per_appointment
  on sessions (appointment_id)
  where appointment_id is not null and deleted_at is null;

create index reports_trash_idx on reports (patient_id) where deleted_at is not null;
create index assessments_trash_idx on assessments (patient_id) where deleted_at is not null;
create index sessions_trash_idx on sessions (patient_id) where deleted_at is not null;
create index payments_trash_idx on payments (patient_id) where deleted_at is not null;

-- Las cuatro tablas pasan de `for all` a una política por operación, para que
-- la papelera quede fuera de todas. No hay política de `delete`: no se borra.
do $$
declare
  t text;
begin
  foreach t in array array['reports', 'assessments', 'sessions', 'payments'] loop
    execute format('drop policy "own_rows" on %I', t);

    execute format(
      'create policy "own_rows_read" on %I for select
         using (practitioner_id = (select auth.uid()) and deleted_at is null)', t);

    execute format(
      'create policy "own_rows_insert" on %I for insert
         with check (practitioner_id = (select auth.uid()) and deleted_at is null)', t);

    execute format(
      'create policy "own_rows_update" on %I for update
         using (practitioner_id = (select auth.uid()) and deleted_at is null)
         with check (practitioner_id = (select auth.uid()) and deleted_at is null)', t);
  end loop;
end;
$$;

-- Mandar a la papelera. Devuelve si encontró algo que mandar.
create or replace function public.trash_record(kind text, record_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  touched integer;
begin
  if me is null then
    raise exception 'Sin sesión.' using errcode = '42501';
  end if;

  case kind
    when 'session' then
      update public.sessions set deleted_at = now()
        where id = record_id and practitioner_id = me and deleted_at is null;
    when 'report' then
      update public.reports set deleted_at = now()
        where id = record_id and practitioner_id = me and deleted_at is null;
    when 'assessment' then
      update public.assessments set deleted_at = now()
        where id = record_id and practitioner_id = me and deleted_at is null;
    when 'payment' then
      update public.payments set deleted_at = now()
        where id = record_id and practitioner_id = me and deleted_at is null;
    else
      raise exception 'Tipo desconocido: %', kind using errcode = '22023';
  end case;

  get diagnostics touched = row_count;
  return touched > 0;
end;
$$;

-- Sacar de la papelera. Una sesión recuperada cuya cita ya tiene otro registro
-- vuelve sin cita: dos registros de una misma hora no pueden quedar atados los
-- dos a ella, y perder el vínculo es mejor que no poder recuperar el texto.
create or replace function public.restore_record(kind text, record_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  touched integer;
begin
  if me is null then
    raise exception 'Sin sesión.' using errcode = '42501';
  end if;

  case kind
    when 'session' then
      update public.sessions s
        set deleted_at = null,
            appointment_id = case
              when exists (
                select 1 from public.sessions other
                where other.appointment_id = s.appointment_id
                  and other.deleted_at is null
                  and other.id <> s.id
              ) then null
              else s.appointment_id
            end
        where s.id = record_id and s.practitioner_id = me and s.deleted_at is not null;
    when 'report' then
      update public.reports set deleted_at = null
        where id = record_id and practitioner_id = me and deleted_at is not null;
    when 'assessment' then
      update public.assessments set deleted_at = null
        where id = record_id and practitioner_id = me and deleted_at is not null;
    when 'payment' then
      update public.payments set deleted_at = null
        where id = record_id and practitioner_id = me and deleted_at is not null;
    else
      raise exception 'Tipo desconocido: %', kind using errcode = '22023';
  end case;

  get diagnostics touched = row_count;
  return touched > 0;
end;
$$;

-- Lo que hay en la papelera de un paciente, lo último primero.
create or replace function public.list_trash(patient uuid)
returns table (
  kind       text,
  id         uuid,
  label      text,
  happened_on date,
  deleted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select * from (
    select 'session'::text, s.id, left(coalesce(s.progress_note, ''), 140),
           s.held_on, s.deleted_at
      from public.sessions s
      where s.patient_id = patient and s.practitioner_id = auth.uid()
        and s.deleted_at is not null
    union all
    select 'report', r.id, r.title, r.issued_on, r.deleted_at
      from public.reports r
      where r.patient_id = patient and r.practitioner_id = auth.uid()
        and r.deleted_at is not null
    union all
    select 'assessment', a.id, a.instrument, a.assessed_on, a.deleted_at
      from public.assessments a
      where a.patient_id = patient and a.practitioner_id = auth.uid()
        and a.deleted_at is not null
    union all
    select 'payment', p.id, p.amount::text, p.paid_on, p.deleted_at
      from public.payments p
      where p.patient_id = patient and p.practitioner_id = auth.uid()
        and p.deleted_at is not null
  ) trash
  order by deleted_at desc
  limit 200;
$$;

revoke execute on function public.trash_record(text, uuid) from public, anon;
revoke execute on function public.restore_record(text, uuid) from public, anon;
revoke execute on function public.list_trash(uuid) from public, anon;
grant execute on function public.trash_record(text, uuid) to authenticated;
grant execute on function public.restore_record(text, uuid) to authenticated;
grant execute on function public.list_trash(uuid) to authenticated;

-- ─── 4. La base no deja borrar historia clínica ─────────────────────────────

-- Las versiones son un registro: se agregan, no se editan ni se borran. Y la
-- copia firmada sólo la escribe el trigger de arriba.
drop policy "own_rows" on document_versions;

create policy "own_rows_read" on document_versions for select
  using (practitioner_id = (select auth.uid()));

create policy "own_rows_insert" on document_versions for insert
  with check (practitioner_id = (select auth.uid()) and replaced_by <> 'signed');

revoke update, delete on table document_versions from authenticated;

-- Ninguna de estas tablas se borra desde una sesión. Un paciente se archiva o
-- se marca borrado (`deleted_at`); lo demás va a la papelera o no se borra.
revoke delete on table
  patients,
  reports,
  assessments,
  sessions,
  payments,
  consents,
  patient_forms,
  intake_responses,
  scale_responses
from authenticated;
