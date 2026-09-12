-- Que el registro de una sesión quede atado a la hora de la agenda que registra.
--
-- `sessions.appointment_id` existe desde M4 (`20260812011520`) con su índice, y
-- nadie la escribió nunca: `createSession` insertaba paciente, fecha y nota, y
-- nada más. Marcar "Vino" en la agenda y escribir el registro eran dos hechos
-- sueltos sobre el mismo encuentro, así que la agenda y el cuaderno podían
-- contradecirse para siempre — ver `docs/hallazgos-2026-09-10.md`, punto 1.
--
-- Esta migración prepara el esquema para que la aplicación empiece a escribirla.
-- Dos cosas, las dos en la base y no en el código, por la misma razón que dio
-- `20260907010000`: una comprobación que hay que acordarse de escribir en cada
-- función es una comprobación que la próxima función olvida.
--
-- ─── 1. Que la hora sea de la misma profesional y del mismo paciente ───────
--
-- La foránea de M4 mira que la cita exista y nada más, y las foráneas no pasan
-- por RLS. Con ella, un formulario con el campo cambiado a mano podía atar mi
-- registro a **tu** cita, o a la cita de otro paciente mío. Se reemplaza por una
-- compuesta sobre `(practitioner_id, patient_id, appointment_id)`, que exige las
-- tres cosas juntas.
--
-- Reemplaza y no se suma, por lo mismo que en `20260907010000`: PostgREST no
-- sabe elegir entre dos relaciones hacia la misma tabla (PGRST201) y la agenda
-- va a incrustar `sessions(id)` en cada cita.
--
-- `on delete set null (appointment_id)`, con la columna nombrada: borrar una
-- cita no borra el registro de lo que pasó en ella, sólo lo desata. Un
-- `set null` a secas anularía las tres columnas, y dos son `not null`.
--
-- Con `match simple` —el default— un registro sin cita (alguien vino sin estar
-- agendado) no se verifica, que es lo que la columna siempre quiso permitir.
--
-- ─── 2. Un registro por hora agendada, como mucho ─────────────────────────
--
-- Único parcial: muchos registros sin cita, pero nunca dos para la misma. Dos
-- pestañas abiertas guardando a la vez chocan acá, no en un conteo que después
-- no cierra.
--
-- El índice común de M4 (`sessions_appointment_idx`) queda: el único lo cubre, y
-- sacarlo no es parte de esto.
--
-- Nadie escribió la columna nunca, así que no hay filas que puedan violar ninguna
-- de las dos reglas.

alter table appointments
  add constraint appointments_practitioner_patient_id_key
  unique (practitioner_id, patient_id, id);

alter table sessions
  add constraint sessions_appointment_same_patient
  foreign key (practitioner_id, patient_id, appointment_id)
  references appointments (practitioner_id, patient_id, id)
  on delete set null (appointment_id);

alter table sessions drop constraint sessions_appointment_id_fkey;

create unique index sessions_one_per_appointment
  on sessions (appointment_id)
  where appointment_id is not null;
