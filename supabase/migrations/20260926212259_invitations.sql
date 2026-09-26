-- Ombúa pasa a ser por invitación.
--
-- Hasta acá el alta era abierta: cualquiera llegaba a /crear-cuenta y se hacía
-- una cuenta. El candado de verdad no está en esta migración sino en Supabase
-- —`enable_signup = false`, en `config.toml` y en el dashboard—, porque la anon
-- key viaja en el bundle de todo visitante y un POST directo a
-- `/auth/v1/signup` nunca pasa por ninguna pantalla nuestra. Acá está lo otro:
-- quién puede invitar, y el rastro de a quién se invitó.


-- ─── practitioners.is_admin ────────────────────────────────────────────────
--
-- Quién puede abrir la puerta. Hoy es una sola persona y probablemente siga
-- siéndolo, pero es una columna y no una variable de entorno para que agregar la
-- segunda sea un UPDATE y no un deploy.
--
-- **No hace falta revocarle el UPDATE a `authenticated`.** La migración
-- 20260906120000 hizo `revoke update on table practitioners` y devolvió el
-- permiso columna por columna; una columna agregada después nace sin `UPDATE`
-- para nadie, porque los privilegios de columna son por columna y el de tabla ya
-- no está. Un PATCH a PostgREST con la sesión propia contesta `42501`.
-- `src/server/rls.test.ts` lo verifica, que es la diferencia entre creerlo y
-- saberlo.
--
-- `SELECT` sí sigue siendo de tabla, así que la usuaria lee su propia bandera —
-- que es lo que necesita la pantalla para decidir si muestra el link.

alter table practitioners
  add column is_admin boolean not null default false;

comment on column practitioners.is_admin is
  'Puede invitar a otras profesionales. Se otorga con un UPDATE, nunca desde la aplicación.';


-- ─── invitations ───────────────────────────────────────────────────────────
--
-- Una invitación es un enlace con un token, igual que "Antes de empezar"
-- (`20260911165113_patient_forms.sql`) y que los cuestionarios de escalas: el
-- token viaja en el link y **nunca se guarda**, sólo su SHA-256.
--
-- ─── Por qué un token nuestro y no un link de Supabase ─────────────────────
--
-- `auth.admin.inviteUserByEmail` existe y hace casi esto. Lo que hace de más es
-- lo que sobra: **crea la cuenta en el momento de invitar**. Con eso, un correo
-- mal escrito deja un usuario fantasma en `auth.users` que además bloquea la
-- dirección correcta; reenviar ya no puede usar un link de tipo `invite` porque
-- la cuenta existe; y revocar pasa a significar borrar una cuenta, que es una
-- operación destructiva para deshacer un error de tipeo.
--
-- Con un token propio no existe nada hasta que la invitada elige su contraseña.
-- Reenviar es mandar el mismo correo de nuevo. Revocar es borrar una fila.
-- Equivocarse no cuesta nada.

create table invitations (
  id              uuid primary key default gen_random_uuid(),
  -- Quién invitó. Se llama `practitioner_id` y no `invited_by` para que la
  -- política sea la misma línea que en las otras quince tablas.
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  -- A quién. Se guarda normalizado en minúsculas desde
  -- `src/server/invitations.ts`; el índice único de abajo va sobre `lower()`
  -- igual, porque un índice que confía en que la aplicación normalizó no es un
  -- índice único.
  email           text not null,
  full_name       text not null,
  discipline      text not null check (discipline in (
                    'speech_therapy',
                    'psychopedagogy',
                    'occupational_therapy',
                    'psychology',
                    'psychomotricity',
                    'physiotherapy'
                  )),
  -- SHA-256 en hexadecimal del token que viaja en el link. El token en claro
  -- existe una sola vez, en la respuesta que arma el correo.
  token_hash      text not null unique,
  expires_at      timestamptz not null,
  -- Cuándo eligió su contraseña. Mientras sea null la invitación está pendiente,
  -- que es el único estado en el que se puede revocar.
  accepted_at     timestamptz,
  -- La cuenta que salió de acá. `on delete set null` y no `cascade`: si algún
  -- día se borra la cuenta, el rastro de quién la invitó y cuándo tiene que
  -- sobrevivir — es la mitad de para qué existe esta tabla.
  user_id         uuid references auth.users (id) on delete set null,
  -- Cuántas veces salió el correo. Sirve en pantalla ("reenviada 2 veces") y
  -- para notar desde afuera que a alguien no le está llegando.
  sent_count      integer not null default 1 check (sent_count > 0),
  last_sent_at    timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index invitations_practitioner_created_idx
  on invitations (practitioner_id, created_at desc);

create index invitations_user_idx on invitations (user_id);

-- Una sola invitación pendiente por dirección. Parcial y no `unique (email)` a
-- secas porque una dirección que ya aceptó tiene que poder volver a aparecer si
-- alguna vez se borra la cuenta y se la invita de nuevo. Lo que no puede haber
-- son dos pendientes al mismo correo: se mandan dos enlaces y uno de los dos no
-- funciona, sin nada que explique cuál.
create unique index invitations_pending_email_key
  on invitations (lower(email))
  where accepted_at is null;


-- ─── Quién lee y quién escribe ─────────────────────────────────────────────
--
-- La forma de `audit_log`, y por el mismo motivo: las filas las escribe
-- `src/server/invitations.ts` con clave de servicio, porque aceptar una
-- invitación crea una cuenta y quien la acepta no tiene sesión con la cual RLS
-- pueda decidir nada — es, literalmente, alguien que todavía no existe.
--
-- Entonces la política es sólo de lectura, y sólo de lo propio. Si además
-- tuviera `for all`, cualquier profesional podría insertarse filas con la anon
-- key y su sesión: no crearía ninguna cuenta —eso pasa por la clave de
-- servicio— pero ensuciaría su propia lista con invitaciones que nadie mandó, y
-- una lista que miente sobre a quién se invitó no sirve para lo único que
-- existe.
--
-- `token_hash` queda del lado legible de la política. No es un problema: es un
-- hash, y quien puede leerlo es la misma persona que acaba de generarlo.

alter table invitations enable row level security;

create policy "own_rows_read" on invitations
  for select
  using (practitioner_id = (select auth.uid()));

-- Igual que en `audit_log`: sacar el grant además de no poner política rechaza
-- el intento una compuerta antes, y hace que nadie pueda reabrirlo agregando una
-- política sin toparse con esta línea.
revoke insert, update, delete on table invitations from authenticated;
