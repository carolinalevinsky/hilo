-- DESPUÉS del deploy de `20261001040000_google_tokens_in_vault`.
--
-- El código nuevo ya lee y escribe los tokens en Vault. Esto pasa a Vault lo
-- que el código viejo haya conectado en el rato entre la migración y el
-- deploy, y borra el texto plano de todas las filas.
--
-- Se vacían las columnas y no se borran: `refresh_token` sigue existiendo,
-- nula, para que un rollback del código en Vercel no se encuentre con una
-- columna que no está. Borrarla es una migración aparte, el día que no haga
-- falta volver.

do $$
declare
  account record;
begin
  for account in
    select practitioner_id, refresh_token, access_token, refresh_secret_id, access_secret_id
      from public.google_accounts
     where refresh_token is not null or access_token is not null
  loop
    if account.refresh_token is not null and account.refresh_secret_id is null then
      update public.google_accounts
         set refresh_secret_id = vault.create_secret(account.refresh_token, 'google_refresh_' || account.practitioner_id)
       where practitioner_id = account.practitioner_id;
    end if;
    if account.access_token is not null and account.access_secret_id is null then
      update public.google_accounts
         set access_secret_id = vault.create_secret(account.access_token, 'google_access_' || account.practitioner_id)
       where practitioner_id = account.practitioner_id;
    end if;
  end loop;

  update public.google_accounts set refresh_token = null, access_token = null;
end;
$$;
