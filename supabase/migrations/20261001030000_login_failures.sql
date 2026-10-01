-- Un límite propio de intentos de entrada.
--
-- El único límite era el de Supabase: 30 entradas cada 5 minutos **por IP**.
-- Contra una cuenta puntual eso son 8.640 contraseñas por día desde una sola
-- máquina, y más desde varias. Las cuentas son de profesionales de la salud con
-- historias clínicas adentro.
--
-- Se cuentan los fallos por dos claves, las dos opacas (un hash con el secreto
-- de la app; ni el correo ni la IP se guardan):
--
--   correo + IP   5 fallos en 15 minutos y esa combinación espera.
--   sólo IP       30 fallos en 15 minutos y esa IP espera, pruebe el correo
--                 que pruebe.
--
-- Por correo + IP y no por correo solo: si no, cualquiera podría dejar afuera
-- a una profesional equivocándose cinco veces con su correo.
--
-- Funciones `security definer` y no la llave de servicio: quien está entrando
-- todavía no tiene sesión, y la tabla no se lee ni se escribe desde ningún
-- otro lado. Ver la lista de lugares con llave de servicio en CLAUDE.md, que
-- así no crece.

create table login_failures (
  id        bigint generated always as identity primary key,
  key_hash  text not null check (char_length(key_hash) between 16 and 64),
  failed_at timestamptz not null default now()
);

create index login_failures_key_idx on login_failures (key_hash, failed_at);

alter table login_failures enable row level security;

-- Nadie la toca directo: sólo las tres funciones de abajo.
create policy "nobody" on login_failures for all using (false) with check (false);
revoke all on table login_failures from anon, authenticated;

-- ¿Puede intentar? Falso si alguna de las dos claves pasó su tope.
create function public.login_allowed(per_account text, per_ip text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select
    (select count(*) from public.login_failures
      where key_hash = per_account and failed_at > now() - interval '15 minutes') < 5
    and
    (select count(*) from public.login_failures
      where key_hash = per_ip and failed_at > now() - interval '15 minutes') < 30
$$;

-- Anota un fallo en las dos claves, y de paso barre lo de más de un día.
create function public.note_login_failure(per_account text, per_ip text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.login_failures where failed_at < now() - interval '1 day';
  insert into public.login_failures (key_hash) values (per_account), (per_ip);
$$;

-- Una entrada buena borra los fallos de esa cuenta en esa IP.
create function public.clear_login_failures(per_account text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.login_failures where key_hash = per_account;
$$;

revoke all on function public.login_allowed(text, text) from public;
revoke all on function public.note_login_failure(text, text) from public;
revoke all on function public.clear_login_failures(text) from public;
grant execute on function public.login_allowed(text, text) to anon, authenticated;
grant execute on function public.note_login_failure(text, text) to anon, authenticated;
grant execute on function public.clear_login_failures(text) to anon, authenticated;
