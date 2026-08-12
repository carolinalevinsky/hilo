-- Demo data for local development.
--
-- Runs after every `npm run db:reset`, so a reset gives you a working app to
-- look at instead of a sign-up form and an empty database. It never runs in
-- production: Supabase only applies `seed.sql` to a local reset.
--
-- Sign in with:  lucia@hilo.test  /  hilo-de-prueba
--
-- The patients, goals, and session notes are v1's demo fixtures
-- (`legacy/index.html:889`), which were written by someone who knows the domain
-- and read like real records rather than "Test Patient 1".
--
-- Everything is deterministic: fixed UUIDs, dates relative to `current_date`.
-- Re-running gives the same database, which is what makes a screenshot from
-- yesterday still mean something today.

-- ─── The practitioner ──────────────────────────────────────────────────────
--
-- Inserted straight into auth.users, which is what Supabase Auth would do. The
-- trigger from M1 picks it up and creates the `practitioners` row from the
-- metadata, so this exercises the real sign-up path rather than going around it.

-- The empty strings at the bottom are not padding. GoTrue reads these columns
-- into non-nullable fields, so a NULL there makes every sign-in fail with
-- "invalid credentials" — a password error for something that has nothing to do
-- with the password. Leaving them out cost an hour once; it will not again.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, phone_change, phone_change_token,
  reauthentication_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated',
  'authenticated',
  'lucia@hilo.test',
  extensions.crypt('hilo-de-prueba', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Lucía Fernández","discipline":"psychopedagogy"}',
  now(),
  now(),
  '', '', '', '', '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at,
  created_at, updated_at
)
values (
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  '{"sub":"11111111-1111-4111-8111-111111111111","email":"lucia@hilo.test","email_verified":true}',
  'email',
  now(),
  now(),
  now()
);


-- ─── Patients ──────────────────────────────────────────────────────────────

insert into patients (
  id, practitioner_id, full_name, date_of_birth, age_group, school_level, school,
  health_insurer, phone, referral_reason, start_date, color, session_fee,
  billing_frequency, expected_sessions_per_month
)
values
  (
    '22222222-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111111',
    'Tomás Pérez',
    current_date - interval '5 years 4 months',
    'children', 'Nivel 5', 'Colegio Los Robles', 'CASMU', '099 123 456',
    'Dificultades en la articulación de varios fonemas y en la organización del lenguaje oral.',
    current_date - interval '5 months',
    'teal', 1500, 'monthly', 4
  ),
  (
    '22222222-0000-4000-8000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    'Malena Rodríguez',
    current_date - interval '7 years 2 months',
    'children', '2º escolar', 'Escuela N.º 45', 'Médica Uruguaya', '098 765 432',
    'Dificultades en la adquisición de la lectoescritura y en la atención sostenida.',
    current_date - interval '4 months',
    'violet', 1500, 'monthly', 4
  ),
  (
    '22222222-0000-4000-8000-000000000003',
    '11111111-1111-4111-8111-111111111111',
    'Andrés Méndez',
    current_date - interval '34 years',
    'adults', null, null, 'Médica Uruguaya', '091 222 333',
    'Consulta por ansiedad y estrés laboral, con dificultades para descansar.',
    current_date - interval '2 months',
    'amber', 1800, 'per_session', 4
  );


-- ─── Goals ─────────────────────────────────────────────────────────────────
--
-- The insert trigger records the starting point in `goal_progress`; the updates
-- below then walk each goal forward so the chart has a real curve on it.

insert into goals (id, practitioner_id, patient_id, title, progress, position)
values
  ('33333333-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000001', 'Producción del fonema /r/', 20, 0),
  ('33333333-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000001', 'Ampliación del vocabulario', 45, 1),
  ('33333333-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000001', 'Estructuración de oraciones', 25, 2),
  ('33333333-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000002', 'Conciencia fonológica', 40, 0),
  ('33333333-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000002', 'Fluidez lectora', 30, 1),
  ('33333333-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000003', 'Manejo de la ansiedad', 20, 0),
  ('33333333-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000003', 'Higiene del sueño', 30, 1);

-- Backdate the starting points the trigger just wrote, then lay down the rest of
-- the curve by hand. Doing it as inserts rather than as a series of UPDATEs
-- keeps the dates under control.
update goal_progress set recorded_on = current_date - interval '16 weeks';

insert into goal_progress (practitioner_id, patient_id, goal_id, recorded_on, value)
values
  -- Tomás · /r/ — steady, the kind of curve that makes a family feel something
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   '33333333-0000-4000-8000-000000000001', current_date - interval '12 weeks', 30),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   '33333333-0000-4000-8000-000000000001', current_date - interval '8 weeks', 40),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   '33333333-0000-4000-8000-000000000001', current_date - interval '4 weeks', 52),
  -- Tomás · vocabulario
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   '33333333-0000-4000-8000-000000000002', current_date - interval '12 weeks', 55),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   '33333333-0000-4000-8000-000000000002', current_date - interval '8 weeks', 65),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   '33333333-0000-4000-8000-000000000002', current_date - interval '4 weeks', 74),
  -- Tomás · oraciones
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   '33333333-0000-4000-8000-000000000003', current_date - interval '12 weeks', 35),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   '33333333-0000-4000-8000-000000000003', current_date - interval '8 weeks', 42),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   '33333333-0000-4000-8000-000000000003', current_date - interval '4 weeks', 50),
  -- Malena · conciencia fonológica
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000002',
   '33333333-0000-4000-8000-000000000004', current_date - interval '10 weeks', 50),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000002',
   '33333333-0000-4000-8000-000000000004', current_date - interval '5 weeks', 66),
  -- Malena · fluidez lectora — the flat one. A chart where every line rises is
  -- a chart nobody learns anything from.
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000002',
   '33333333-0000-4000-8000-000000000005', current_date - interval '10 weeks', 34),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000002',
   '33333333-0000-4000-8000-000000000005', current_date - interval '5 weeks', 38);

-- Now the current values, matching where each curve ended up.
update goals set progress = 65 where id = '33333333-0000-4000-8000-000000000001';
update goals set progress = 82 where id = '33333333-0000-4000-8000-000000000002';
update goals set progress = 55 where id = '33333333-0000-4000-8000-000000000003';
update goals set progress = 72 where id = '33333333-0000-4000-8000-000000000004';
update goals set progress = 40 where id = '33333333-0000-4000-8000-000000000005';
update goals set progress = 45 where id = '33333333-0000-4000-8000-000000000006';
update goals set progress = 60 where id = '33333333-0000-4000-8000-000000000007';


-- ─── Sessions ──────────────────────────────────────────────────────────────

insert into sessions (id, practitioner_id, patient_id, held_on, progress_note, private_note)
values
  ('44444444-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000001', current_date - interval '7 days',
   'Logró la /r/ en posición inicial de forma consistente; muy conectado al juego durante toda la sesión.',
   'La mamá cuenta que practicó en casa.'),
  ('44444444-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000001', current_date - interval '14 days',
   'Incorporó vocabulario nuevo y armó frases de cuatro a cinco palabras de forma espontánea.',
   null),
  ('44444444-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000001', current_date - interval '21 days',
   'Aún omite la /r/ en grupos consonánticos; se cansa sobre el final de la sesión.',
   null),
  ('44444444-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000002', current_date - interval '8 days',
   'Lee palabras de dos sílabas con apoyo; mejora bastante cuando el texto es de su interés.',
   null),
  ('44444444-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000002', current_date - interval '15 days',
   'Identifica sonidos iniciales y finales; sostiene la atención unos quince minutos.',
   'Muy colaboradora.'),
  ('44444444-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111',
   '22222222-0000-4000-8000-000000000003', current_date - interval '6 days',
   'Identificó los principales disparadores en el trabajo y practicó una técnica de respiración.',
   'Viene motivado.');

-- ─── Payments ──────────────────────────────────────────────────────────────
--
-- One paid up, one half paid, one not yet — so the ledger shows all three
-- states rather than a column of green ticks.

insert into payments (practitioner_id, patient_id, paid_on, period, amount, method)
values
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   date_trunc('month', current_date)::date + 4, to_char(current_date, 'YYYY-MM'),
   1500, 'transfer'),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000002',
   date_trunc('month', current_date)::date + 2, to_char(current_date, 'YYYY-MM'),
   750, 'cash'),
  -- Last month, settled, so stepping back a month is not an empty screen.
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   (date_trunc('month', current_date) - interval '1 month')::date + 5,
   to_char(current_date - interval '1 month', 'YYYY-MM'), 1500, 'transfer'),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000002',
   (date_trunc('month', current_date) - interval '1 month')::date + 3,
   to_char(current_date - interval '1 month', 'YYYY-MM'), 1500, 'cash');


-- ─── Standing slots ────────────────────────────────────────────────────────
--
-- The rules only. The occurrences are materialised by the app the first time
-- the agenda loads, which means the seed also exercises that code path rather
-- than working around it.

insert into schedules (
  practitioner_id, patient_id, weekday, start_time, duration_minutes, frequency, starts_on
)
values
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   1, '09:00', 45, 'weekly', current_date - interval '5 months'),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000001',
   3, '09:00', 45, 'weekly', current_date - interval '5 months'),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000002',
   2, '14:30', 45, 'weekly', current_date - interval '4 months'),
  ('11111111-1111-4111-8111-111111111111', '22222222-0000-4000-8000-000000000003',
   4, '18:00', 60, 'biweekly', current_date - interval '2 months');

insert into session_goals (practitioner_id, session_id, goal_id)
values
  ('11111111-1111-4111-8111-111111111111', '44444444-0000-4000-8000-000000000001',
   '33333333-0000-4000-8000-000000000001'),
  ('11111111-1111-4111-8111-111111111111', '44444444-0000-4000-8000-000000000002',
   '33333333-0000-4000-8000-000000000002'),
  ('11111111-1111-4111-8111-111111111111', '44444444-0000-4000-8000-000000000002',
   '33333333-0000-4000-8000-000000000003'),
  ('11111111-1111-4111-8111-111111111111', '44444444-0000-4000-8000-000000000003',
   '33333333-0000-4000-8000-000000000001'),
  ('11111111-1111-4111-8111-111111111111', '44444444-0000-4000-8000-000000000004',
   '33333333-0000-4000-8000-000000000005'),
  ('11111111-1111-4111-8111-111111111111', '44444444-0000-4000-8000-000000000005',
   '33333333-0000-4000-8000-000000000004'),
  ('11111111-1111-4111-8111-111111111111', '44444444-0000-4000-8000-000000000006',
   '33333333-0000-4000-8000-000000000006');
