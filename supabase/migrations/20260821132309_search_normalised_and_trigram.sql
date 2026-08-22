-- Buscar sin acentos, y sin recorrer la tabla entera.
--
-- Dos problemas que se resuelven con lo mismo.
--
-- ─── Los acentos ───────────────────────────────────────────────────────────
--
-- `ilike` resuelve las mayúsculas y no los acentos, así que "Lucia" no encuentra
-- a "Lucía" y "fonologica" no encuentra "Conciencia fonológica". El comentario en
-- src/server/patients.ts ya lo decía como limitación conocida. Para quien busca,
-- no es una limitación: es que la aplicación no encuentra lo que tiene adelante.
--
-- ─── El recorrido completo ─────────────────────────────────────────────────
--
-- `ilike '%algo%'` con comodín al principio no puede usar un índice común, así
-- que Postgres lee la tabla entera en cada búsqueda. Con 45 materiales daba
-- igual; con 301 y una comunidad que publica, deja de dar igual.
--
-- ─── La solución ───────────────────────────────────────────────────────────
--
-- Una columna generada con el texto ya normalizado, más un índice GIN de
-- trigramas sobre ella. La columna es `stored` y `generated always`: Postgres la
-- mantiene, así que no hay forma de que se desincronice del original. Un trigger
-- sí tendría esa forma.
--
-- Y como junta título, foco y objetivo en un solo campo, la búsqueda pasa a ser
-- un `ilike` sobre una columna en vez de un `or(...)` de tres condiciones. Eso
-- elimina de raíz la clase de error que produjo el 500 al escribir una coma:
-- ya no hay un filtro que se arme concatenando texto.

create extension if not exists pg_trgm with schema extensions;

-- ─── materials ─────────────────────────────────────────────────────────────

alter table materials
  add column search_text text
  generated always as (
    lower(
      public.unaccent_fallback(
        coalesce(title, '') || ' ' ||
        coalesce(focus, '') || ' ' ||
        coalesce(objective, '')
      )
    )
  ) stored;

comment on column materials.search_text is
  'Título, foco y objetivo en minúsculas y sin acentos. La mantiene Postgres; no se escribe a mano.';

create index materials_search_trgm
  on materials
  using gin (search_text extensions.gin_trgm_ops);

-- ─── patients ──────────────────────────────────────────────────────────────

alter table patients
  add column search_text text
  generated always as (lower(public.unaccent_fallback(full_name))) stored;

comment on column patients.search_text is
  'El nombre en minúsculas y sin acentos, para que "Lucia" encuentre a "Lucía".';

create index patients_search_trgm
  on patients
  using gin (search_text extensions.gin_trgm_ops);

-- Sobre RLS: las dos columnas viven en tablas que ya tienen su política, y una
-- columna nueva no cambia qué filas se ven. `check:rls` mira tablas, no columnas,
-- y sigue en verde por la razón correcta.
