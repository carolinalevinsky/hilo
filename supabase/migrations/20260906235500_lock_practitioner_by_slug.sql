-- `practitioner_by_slug` deja de estar al alcance de cualquiera.
--
-- La función es `security definer` y devuelve `id`, `full_name` y `discipline`
-- de una profesional a partir de su slug. Existe porque la página pública de
-- reservas necesita un nombre y una disciplina, y `practitioners` tiene la
-- política de filas propias, que para un visitante sin sesión no devuelve nada.
-- Eso está bien y no cambia.
--
-- Lo que cambia es quién puede llamarla. M7 terminaba con
--
--     grant execute on function public.practitioner_by_slug(text)
--       to anon, authenticated;
--
-- y ese `grant` no lo necesita nadie: el único llamador es `practitionerBySlug`
-- en `src/server/booking.ts`, que usa la clave de servicio —la función se creó
-- justamente porque no hay sesión— y la clave de servicio no pasa por acá.
--
-- Mientras tanto, `NEXT_PUBLIC_SUPABASE_ANON_KEY` viaja en el bundle de todo
-- visitante por diseño, y PostgREST publica las funciones del esquema `public`
-- como RPC. O sea que cualquiera, sin sesión, podía hacer:
--
--     POST /rest/v1/rpc/practitioner_by_slug   {"lookup_slug":"lucia-fernandez"}
--     → [{"id":"<uuid>","full_name":"Lucía Fernández","discipline":"..."}]
--
-- Los slugs los genera `slugify(full_name)`, así que se adivinan con un
-- diccionario de nombres. El resultado es el padrón de profesionales de la
-- salud que usan Hilo —nombre, disciplina y el UUID que también es su
-- `auth.uid()`— sin sesión y sin límite de tasa. Nada clínico, pero es dato
-- personal y es una lista para phishing dirigido sobre una población concreta.
--
-- ─── Las dos trampas de este `revoke` ──────────────────────────────────────
--
-- **Primera: no alcanza con `from anon, authenticated`.** El ACL de la función
-- es hoy
--
--     {=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres}
--
-- y esa primera entrada, la del grantee vacío, es `PUBLIC`. Postgres se la pone
-- a toda función al crearla. `anon` es parte de `PUBLIC`, así que sacarle el
-- grant nominal lo deja entrando igual por la puerta de al lado — un `revoke`
-- que se ejecuta sin error y no cambia nada, la misma forma de trampa que
-- tienen los permisos de columna en la migración anterior.
--
-- **Segunda, y es la que rompía la aplicación: `service_role` también hereda de
-- `PUBLIC`.** No tiene grant nominal en ese ACL. Revocar `PUBLIC` a secas le
-- saca el permiso al único que sí lo necesita, y la página de reservas pasa a
-- tirar `permission denied` para todas las familias. Por eso el `grant` de
-- abajo no es decorativo: es lo que mantiene viva la única llamada real.

revoke execute on function public.practitioner_by_slug(text)
  from public, anon, authenticated;

grant execute on function public.practitioner_by_slug(text) to service_role;

-- `slugify` y `unaccent_fallback` se dejan como están, con su EXECUTE para
-- PUBLIC. `createProfile` llama a `slugify` por RPC con la sesión de la usuaria
-- (`practitioners.ts`), así que `authenticated` la necesita; y son funciones
-- puras sobre una cadena de texto que no leen ninguna tabla ni revelan nada.
