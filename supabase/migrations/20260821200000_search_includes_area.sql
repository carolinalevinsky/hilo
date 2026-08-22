-- El área también se busca.
--
-- `search_text` se armó con título, foco y objetivo, y se dejó afuera el área.
-- El área es el nombre grande de la sección —"Conciencia fonológica",
-- "Articulación", "Lectura"— o sea, la palabra por la que alguien busca primero.
--
-- Doce materiales de fonoaudiología tienen "Conciencia fonológica" como área.
-- Buscar "fonologica" devolvía cero, con el chip de ese nombre a la vista, en la
-- misma pantalla. La biblioteca estaba entera; el buscador miraba para otro lado.
--
-- Se probó contra la base cargada y pasó igual, porque los dos materiales que sí
-- aparecían llevaban la palabra en el título. La prueba fue "encuentra algo",
-- que no es lo mismo que "encuentra lo que hay".
--
-- ─── Por qué se borra y se vuelve a crear ──────────────────────────────────
--
-- Postgres 17 puede reescribir la expresión de una columna generada con
-- `alter column ... set expression`, pero eso ata esta migración a la versión
-- del servidor. Borrar y volver a crear anda en cualquiera, y acá no cuesta
-- nada: la columna es `generated always as ... stored`, es decir, derivada.
-- Cada valor se recalcula solo desde las columnas que ya están en la fila. No
-- hay nada escrito a mano que se pueda perder.
--
-- El índice se va con la columna, así que se rehace abajo.

-- destructive: intentional

alter table materials drop column search_text;

alter table materials
  add column search_text text
  generated always as (
    lower(
      public.unaccent_fallback(
        coalesce(title, '') || ' ' ||
        coalesce(area, '') || ' ' ||
        coalesce(focus, '') || ' ' ||
        coalesce(objective, '')
      )
    )
  ) stored;

comment on column materials.search_text is
  'Título, área, foco y objetivo en minúsculas y sin acentos. La mantiene Postgres; no se escribe a mano.';

create index materials_search_trgm
  on materials
  using gin (search_text extensions.gin_trgm_ops);
