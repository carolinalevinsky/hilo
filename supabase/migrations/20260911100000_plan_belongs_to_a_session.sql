-- Que lo preparado para una sesión quede atado a esa sesión de la agenda (P14).
--
-- Hilo tenía dos planificaciones que no se conocían. "Plan de la semana", bajo
-- la grilla de la Agenda, guardaba un objetivo por cita (`focus_goal_id`).
-- "Planificar sesión", en Planificación, guardaba una lista por paciente
-- (`session_plan_items`) que no sabía para qué sesión era: la pantalla decía
-- "Próxima sesión de Tomás" sin decir cuándo. Elegir en una no cambiaba nada en
-- la otra, y el QA de Thomas lo resumió en "costó mucho entender qué hace".
--
-- Carolina eligió unirlas: lo que se prepara es para una sesión concreta, y la
-- Agenda muestra eso mismo.
--
-- ─── La columna ───────────────────────────────────────────────────────────
--
-- Opcional, por dos razones que no son la misma:
--
--   - Un paciente sin ninguna sesión agendada todavía se puede preparar igual.
--   - Las filas que ya existen no tienen sesión, y no se les inventa una: la
--     aplicación las lee como lo preparado para la próxima sesión del paciente,
--     que es lo que siempre quisieron decir. Ninguna fila se mueve acá.
--
-- Foránea compuesta sobre `(practitioner_id, patient_id, appointment_id)`, igual
-- que `sessions` (`20260911090000_session_belongs_to_its_appointment.sql`) y por
-- lo mismo: una foránea no pasa por RLS, y sin el par completo una fila con el
-- campo cambiado a mano podía colgar de la cita de otra profesional o de otro
-- paciente. La clave única que necesita en `appointments` ya existe desde esa
-- migración.
--
-- `on delete set null (appointment_id)`, con la columna nombrada: si se borra la
-- cita, lo preparado no se pierde — vuelve a ser lo preparado para ese paciente,
-- sin fecha. Planificar es lo que más tiempo lleva; perderlo porque se movió un
-- turno sería el peor castigo posible por usar la herramienta. Un `set null` a
-- secas anularía también `practitioner_id` y `patient_id`, que son `not null`.

alter table session_plan_items
  add column appointment_id uuid;

alter table session_plan_items
  add constraint session_plan_items_appointment_same_patient
  foreign key (practitioner_id, patient_id, appointment_id)
  references appointments (practitioner_id, patient_id, id)
  on delete set null (appointment_id);

create index session_plan_items_appointment_idx
  on session_plan_items (appointment_id);
