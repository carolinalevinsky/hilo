-- Que una fila hija no pueda apuntar al paciente de otra profesional.
--
-- Nueve tablas llevan `practitioner_id` y `patient_id`, y hasta acá nada exigía
-- que las dos hablaran de la misma persona. La política de filas propias mira
-- `practitioner_id` y nada más; la clave foránea mira que el paciente exista y
-- nada más. Entre las dos queda un hueco: una fila con **mi** `practitioner_id`
-- y **tu** `patient_id` pasa las dos.
--
-- Se llega por una Server Action con el campo cambiado a mano — `createSession`,
-- `createReport`, `createAssessment`, `recordPayment`, `createGoal`,
-- `createAppointment` y `createSchedule` escriben el `patient_id` que les llega
-- del formulario sin comprobar de quién es.
--
-- ─── Qué se filtraba: nada, y por qué igual se cierra ──────────────────────
--
-- Se verificaron los dos caminos que lo convertirían en lectura y los dos
-- cierran: `gatherReportContext` filtra `patients` por `practitioner_id` antes
-- de armar el prompt, y los `select` con join incrustado pasan por RLS, que
-- devuelve el paciente en null. Así que esto no es una fuga, es basura: filas
-- que ensucian estadísticas y cobros, y un informe que apunta a un paciente que
-- para quien lo pidió no existe.
--
-- Se cierra igual, y en el esquema y no en las siete funciones, por dos razones.
-- La primera es que siete comprobaciones que hay que acordarse de escribir son
-- siete lugares donde la próxima se olvida. La segunda es que hoy lo único que
-- lo detiene del lado de la lectura es RLS, y ya vimos hoy qué pasa cuando una
-- función que se apoya en RLS termina llamada con la clave de servicio: deja de
-- estar acotada sin que nadie toque esa función.
--
-- ─── Cómo funciona ────────────────────────────────────────────────────────
--
-- Una clave única sobre `(practitioner_id, id)` en `patients` —redundante, ya
-- que `id` sola es única, pero es lo que Postgres necesita para poder apuntarle
-- un par— y después una foránea compuesta desde cada hija, **en lugar** de la
-- que había sobre `patient_id` sola.
--
-- ─── Por qué la vieja se va y no se queda al lado ─────────────────────────
--
-- La primera versión de esta migración las dejaba a las dos. Parecía gratis:
-- dos foráneas hacia la misma tabla no se estorban y la vieja no molestaba a
-- nadie. Rompió la aplicación entera.
--
-- PostgREST resuelve `select('*, patients(...)')` buscando **la** relación entre
-- las dos tablas. Con dos, no elige:
--
--     PGRST201 · Could not embed because more than one relationship was found
--                for 'appointments' and 'patients'
--
-- y con eso se caen la Agenda, Cobros, Informes, Evaluaciones, Reservas y el
-- asistente — todo lo que trae el paciente incrustado. Ningún test unitario lo
-- vio; lo vio el end-to-end, en el primer `expect` después del alta.
--
-- Así que queda una sola por par de tablas, y es la compuesta. No se pierde nada
-- en el camino: la compuesta exige que el paciente exista **y** que sea de quien
-- dice la fila, o sea todo lo que exigía la vieja y una condición más.
--
-- `booking_requests.patient_id` es nullable y eso está bien: con `match simple`
-- —el default— una fila con el par incompleto no se verifica, que es
-- exactamente lo que se quiere para una reserva que todavía no se convirtió en
-- paciente.
--
-- Se comprobó antes de escribir esto que ninguna fila de las nueve tablas viola
-- la regla, así que la migración no puede fallar por datos preexistentes.

alter table patients
  add constraint patients_practitioner_id_id_key unique (practitioner_id, id);

alter table goals
  add constraint goals_patient_same_practitioner
  foreign key (practitioner_id, patient_id)
  references patients (practitioner_id, id) on delete cascade;

alter table goal_progress
  add constraint goal_progress_patient_same_practitioner
  foreign key (practitioner_id, patient_id)
  references patients (practitioner_id, id) on delete cascade;

alter table sessions
  add constraint sessions_patient_same_practitioner
  foreign key (practitioner_id, patient_id)
  references patients (practitioner_id, id) on delete cascade;

alter table schedules
  add constraint schedules_patient_same_practitioner
  foreign key (practitioner_id, patient_id)
  references patients (practitioner_id, id) on delete cascade;

alter table appointments
  add constraint appointments_patient_same_practitioner
  foreign key (practitioner_id, patient_id)
  references patients (practitioner_id, id) on delete cascade;

alter table assessments
  add constraint assessments_patient_same_practitioner
  foreign key (practitioner_id, patient_id)
  references patients (practitioner_id, id) on delete cascade;

alter table reports
  add constraint reports_patient_same_practitioner
  foreign key (practitioner_id, patient_id)
  references patients (practitioner_id, id) on delete cascade;

alter table payments
  add constraint payments_patient_same_practitioner
  foreign key (practitioner_id, patient_id)
  references patients (practitioner_id, id) on delete cascade;

alter table session_plan_items
  add constraint session_plan_items_patient_same_practitioner
  foreign key (practitioner_id, patient_id)
  references patients (practitioner_id, id) on delete cascade;

-- `booking_requests` va aparte por dos motivos.
--
-- Su `patient_id` es opcional —se llena recién cuando la reserva se convierte en
-- paciente— así que la baja es `set null` y no `cascade`, igual que la foránea
-- que ya tenía.
--
-- Y el `set null` lleva la columna escrita entre paréntesis, que es lo que hace
-- que esto sea correcto y no una casualidad. Un `on delete set null` a secas
-- sobre una foránea compuesta pone en null **las dos** columnas, y
-- `practitioner_id` es `not null`: borrar un paciente fallaría. En la prueba no
-- falló, porque la foránea vieja sobre `patient_id` sola se dispara antes y deja
-- la fila sin par que verificar — pero eso es depender del orden en que Postgres
-- corre las acciones referenciales, que no es algo que uno quiera que sostenga
-- una baja. Nombrando la columna, sólo se anula ésa, sin importar el orden.
-- (`set null (columna)` existe desde Postgres 15; acá corre 17.)
alter table booking_requests
  add constraint booking_requests_patient_same_practitioner
  foreign key (practitioner_id, patient_id)
  references patients (practitioner_id, id) on delete set null (patient_id);

-- ─── Y las viejas se van ──────────────────────────────────────────────────
--
-- Después de las compuestas y no antes: entre un `drop` y un `add` no puede
-- haber un instante donde la integridad no esté cubierta, y una migración es
-- una transacción, pero el orden se lee igual que se ejecuta.

alter table goals              drop constraint goals_patient_id_fkey;
alter table goal_progress      drop constraint goal_progress_patient_id_fkey;
alter table sessions           drop constraint sessions_patient_id_fkey;
alter table schedules          drop constraint schedules_patient_id_fkey;
alter table appointments       drop constraint appointments_patient_id_fkey;
alter table assessments        drop constraint assessments_patient_id_fkey;
alter table reports            drop constraint reports_patient_id_fkey;
alter table payments           drop constraint payments_patient_id_fkey;
alter table session_plan_items drop constraint session_plan_items_patient_id_fkey;
alter table booking_requests   drop constraint booking_requests_patient_id_fkey;
