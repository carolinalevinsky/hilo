-- La cuenta de Google conectada, una por profesional.
--
-- Misma forma que `mp_accounts`, y por la misma razón: acá vive una credencial
-- que vale más que los datos que protege. Un refresh token de Google no vence,
-- y con él se lee y se escribe el calendario entero de esa persona — el de
-- trabajo y el de la vida — hasta que ella lo revoque a mano desde Google.
--
-- ─── Por qué la política es `using (false)` ────────────────────────────────
--
-- La política de filas propias que usa todo el resto del proyecto sería un
-- error acá. Dejaría que el navegador de la profesional pidiera esta fila, y con
-- ella el token, por más que hoy ninguna pantalla lo haga: cualquier XSS futuro
-- pasaría a valer el calendario completo en vez de nada.
--
-- Nadie la lee por RLS. La lee el servidor con la clave de servicio, que es la
-- única que la necesita. Y el `revoke` va además de la política, para que la
-- negativa ocurra un paso antes y no dependa de que quien agregue una política
-- nueva se acuerde de esta línea.
--
-- ─── Lo que no hace esta tabla ─────────────────────────────────────────────
--
-- Guardar el token cifrado. Queda en texto plano, igual que el de Mercado Pago.
-- Contra el escenario "alguien tiene la clave de servicio" cifrarlo no cambia
-- nada, porque la llave viviría al lado; sí ayudaría contra un volcado de la
-- base. Si algún día importa, el lugar es Supabase Vault y es un cambio acotado.
-- Se escribe acá para que sea una decisión conocida y no un olvido.

create table google_accounts (
  practitioner_id           uuid primary key references practitioners (id) on delete cascade,

  -- Qué cuenta quedó conectada. Se muestra en el perfil: "conectado como
  -- lucia@gmail.com". Sin esto, quien tiene dos cuentas de Google no puede saber
  -- a cuál le está escribiendo Hilo.
  google_email              text not null,

  -- El que no vence. Google lo entrega una sola vez, en la primera
  -- autorización, y sólo si se pide `access_type=offline` con `prompt=consent`.
  refresh_token             text not null,

  -- El de una hora. Se guarda para no pedir uno nuevo en cada operación, con su
  -- vencimiento al lado para saber cuándo dejó de servir.
  access_token              text,
  access_token_expires_at   timestamptz,

  -- 'primary' es el calendario principal de la cuenta. Queda como columna
  -- porque elegir otro es un pedido razonable — un calendario "Consultorio"
  -- aparte del personal — y agregarlo después sería una migración más.
  calendar_id               text not null default 'primary',

  -- Para la sincronización incremental: Google lo devuelve al terminar de
  -- listar, y en el siguiente pedido significa "contame sólo lo que cambió".
  -- Sin esto habría que traer el calendario entero cada vez.
  sync_token                text,

  -- El canal de notificaciones push. Google avisa a un webhook cuando algo
  -- cambia, pero el canal vence —una semana como máximo— así que hay que
  -- renovarlo, y para eso hay que saber cuándo vence y cuál renovar.
  channel_id                text,
  channel_resource_id       text,
  channel_expires_at        timestamptz,

  connected_at              timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create trigger google_accounts_touch_updated_at
  before update on google_accounts
  for each row execute function public.touch_updated_at();

alter table google_accounts enable row level security;

create policy "server_only" on google_accounts
  for all
  using (false)
  with check (false);

revoke all on table google_accounts from authenticated, anon;

-- El webhook de Google llega sin sesión y trae un id de canal, no un id de
-- profesional. Buscar por ese id es lo primero que hace, y sin índice sería un
-- recorrido de la tabla entera en cada notificación.
create index google_accounts_channel on google_accounts (channel_id);
