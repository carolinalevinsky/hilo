-- The sign-up trigger no longer loses a race on `practitioners.slug`.
--
-- `handle_new_practitioner` (20260811222602) looked for a free slug and then
-- inserted it. Two sign-ups with the same full name in the same instant both
-- looked, both saw `valentina-prueba` free, and the second insert hit
-- `practitioners_slug_key`. The trigger runs inside GoTrue's insert into
-- `auth.users`, so the whole sign-up rolled back and the person got "Database
-- error creating new user" and no account — nothing in that message says why.
-- Seen for real in the test suite, where two files create a practitioner with
-- the same name at the same moment.
--
-- The fix is the one `createProfile` in `src/server/practitioners.ts` already
-- uses: the unique constraint decides, and a violation on the slug means "taken,
-- try the next one". The existence check stays, so the non-racing case starts
-- from the first free slug and produces exactly the slugs it did before; it is
-- now a shortcut, not the guard.
--
-- Only `practitioners_slug_key` is retried. Any other unique violation — the
-- primary key, above all — is a real error and is raised as it was.
--
-- `create or replace` keeps the function's owner and grants, and the trigger on
-- `auth.users` points at the function by name, so it needs no change.

create or replace function public.handle_new_practitioner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_slug text;
  final_slug text;
  suffix integer := 1;
  violated text;
begin
  base_slug := public.slugify(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  if base_slug = '' then
    base_slug := 'profesional';
  end if;

  loop
    final_slug := case when suffix = 1 then base_slug else base_slug || '-' || suffix end;

    -- Skip the slugs that are visibly taken without paying for a failed insert.
    while exists (select 1 from public.practitioners p where p.slug = final_slug) loop
      suffix := suffix + 1;
      final_slug := base_slug || '-' || suffix;
    end loop;

    begin
      insert into public.practitioners (id, email, full_name, discipline, slug)
      values (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'discipline',
        final_slug
      );
      return new;
    exception when unique_violation then
      get stacked diagnostics violated = constraint_name;
      if violated is distinct from 'practitioners_slug_key' then
        raise;
      end if;
      -- Someone committed this slug between the check and the insert.
      suffix := suffix + 1;
    end;
  end loop;
end;
$$;
