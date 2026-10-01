-- Los tokens de Google, cifrados en Supabase Vault.
--
-- `google_accounts` los guardaba en texto plano, y la migración que la creó lo
-- dejó escrito como decisión conocida: "si algún día importa, el lugar es
-- Supabase Vault". Importa: un refresh token de Google no vence y abre el
-- calendario entero de la profesional —el de trabajo y el personal—, y en
-- texto plano viaja en cada volcado y cada copia de la base.
--
-- Vault cifra con una llave que no vive en la base, así que un volcado lleva
-- los tokens ilegibles. Contra quien tiene la llave de servicio no cambia nada,
-- y eso sigue siendo cierto: la defensa ahí es que esa llave está en seis
-- archivos y en ningún navegador.
--
-- ─── En dos pasos ──────────────────────────────────────────────────────────
--
-- Ésta va ANTES del deploy y no borra nada: copia los tokens a Vault y deja
-- los de texto plano donde estaban, para que el código viejo siga andando en
-- el rato entre la migración y el deploy. `google_tokens_read` lee Vault y, si
-- una fila todavía no tiene secreto (la conectó el código viejo en ese rato),
-- el texto plano.
--
-- La que los borra es `20261001040100_google_tokens_plaintext_cleared`, que va
-- DESPUÉS del deploy.

alter table google_accounts
  alter column refresh_token drop not null,
  add column refresh_secret_id uuid,
  add column access_secret_id uuid;

comment on column google_accounts.refresh_secret_id is
  'El refresh token, en vault.secrets. La columna refresh_token queda vacía.';
comment on column google_accounts.access_secret_id is
  'El access token de una hora, en vault.secrets.';

-- Guarda los dos tokens. `refresh` nulo deja el que estaba: al renovar, Google
-- devuelve un access token nuevo y no siempre un refresh token.
create function public.google_tokens_save(
  practitioner uuid,
  refresh text default null,
  access text default null,
  access_expires_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  account public.google_accounts%rowtype;
begin
  select * into account from public.google_accounts where practitioner_id = practitioner for update;
  if not found then
    raise exception 'google_accounts: no hay cuenta para %', practitioner;
  end if;

  -- Una fila que conectó el código viejo trae el refresh en texto plano: pasa
  -- a Vault antes de que el `update` de abajo vacíe la columna.
  refresh := coalesce(refresh, case when account.refresh_secret_id is null then account.refresh_token end);

  if refresh is not null then
    if account.refresh_secret_id is null then
      account.refresh_secret_id := vault.create_secret(refresh, 'google_refresh_' || practitioner);
    else
      perform vault.update_secret(account.refresh_secret_id, refresh);
    end if;
  end if;

  if access is not null then
    if account.access_secret_id is null then
      account.access_secret_id := vault.create_secret(access, 'google_access_' || practitioner);
    else
      perform vault.update_secret(account.access_secret_id, access);
    end if;
  end if;

  update public.google_accounts
     set refresh_secret_id = account.refresh_secret_id,
         access_secret_id = account.access_secret_id,
         access_token_expires_at = coalesce(access_expires_at, account.access_token_expires_at),
         refresh_token = null,
         access_token = null
   where practitioner_id = practitioner;
end;
$$;

-- Los dos tokens en claro, para el servidor. Ver arriba lo del texto plano.
create function public.google_tokens_read(practitioner uuid)
returns table (refresh_token text, access_token text, access_token_expires_at timestamptz)
language sql
security definer
set search_path = ''
stable
as $$
  select
    coalesce(refresh.decrypted_secret, account.refresh_token),
    coalesce(access.decrypted_secret, account.access_token),
    account.access_token_expires_at
  from public.google_accounts account
  left join vault.decrypted_secrets refresh on refresh.id = account.refresh_secret_id
  left join vault.decrypted_secrets access on access.id = account.access_secret_id
  where account.practitioner_id = practitioner
$$;

-- Sólo el servidor, con la llave de servicio, que es quien ya leía la tabla.
revoke all on function public.google_tokens_save(uuid, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.google_tokens_read(uuid) from public, anon, authenticated;
grant execute on function public.google_tokens_save(uuid, text, text, timestamptz) to service_role;
grant execute on function public.google_tokens_read(uuid) to service_role;

-- Desconectar borra la fila; sin esto los secretos quedaban huérfanos en Vault,
-- que es justo lo contrario de desconectar.
create function public.google_tokens_forget()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from vault.secrets where id in (old.refresh_secret_id, old.access_secret_id);
  return old;
end;
$$;

revoke all on function public.google_tokens_forget() from public, anon, authenticated;

create trigger google_accounts_forget_tokens
  after delete on google_accounts
  for each row execute function public.google_tokens_forget();

-- Lo que ya estaba conectado pasa a Vault. El texto plano queda, por el código
-- viejo; lo borra la migración de después del deploy.
do $$
declare
  account record;
begin
  for account in select practitioner_id, refresh_token, access_token from public.google_accounts loop
    update public.google_accounts
       set refresh_secret_id = case when account.refresh_token is null then null
             else vault.create_secret(account.refresh_token, 'google_refresh_' || account.practitioner_id) end,
           access_secret_id = case when account.access_token is null then null
             else vault.create_secret(account.access_token, 'google_access_' || account.practitioner_id) end
     where practitioner_id = account.practitioner_id;
  end loop;
end;
$$;
