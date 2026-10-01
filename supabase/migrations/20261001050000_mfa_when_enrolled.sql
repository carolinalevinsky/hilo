-- Verificación en dos pasos, exigida por la base y no sólo por la pantalla.
--
-- Quien activa la verificación en dos pasos espera que su contraseña sola ya no
-- alcance. Si sólo lo controlara la app, no alcanzaría para la app — pero la
-- llave pública está en el entorno de Vercel, y con la contraseña se puede
-- pedir una sesión a `/auth/v1/token` y leer las tablas por PostgREST sin pasar
-- por ninguna pantalla nuestra. El lugar donde eso se corta es acá.
--
-- Una política **restrictiva** en cada tabla: se suma a `own_rows` con un AND,
-- no la reemplaza. Dice: si esta cuenta tiene un factor verificado, la sesión
-- tiene que ser `aal2` (contraseña + código). Quien no activó nada sigue igual.
--
-- `mfa_satisfied` es `security definer` porque lee `auth.mfa_factors`, que el
-- rol `authenticated` no puede leer. Va envuelta en `(select …)` por lo mismo
-- que `auth.uid()`: una vez por consulta, no una por fila.
--
-- `check:rls` exige esta política en toda tabla nueva.

create function public.mfa_satisfied()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors
         where user_id = (select auth.uid()) and status = 'verified'
      )
$$;

revoke all on function public.mfa_satisfied() from public;
grant execute on function public.mfa_satisfied() to authenticated;

do $$
declare
  t record;
begin
  for t in
    select c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
  loop
    execute format(
      'create policy "mfa_when_enrolled" on public.%I as restrictive for all to authenticated
         using ((select public.mfa_satisfied())) with check ((select public.mfa_satisfied()))',
      t.relname
    );
  end loop;
end;
$$;

-- Los archivos también: fotos de pacientes y materiales.
create policy "mfa_when_enrolled" on storage.objects as restrictive for all to authenticated
  using ((select public.mfa_satisfied())) with check ((select public.mfa_satisfied()));
