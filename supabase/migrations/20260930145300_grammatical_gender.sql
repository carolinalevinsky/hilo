-- El género gramatical con el que se escribe sobre alguien.
--
-- En pacientes, porque la IA ya no recibe el nombre (ver
-- `src/lib/pseudonyms.ts`) y sin él no sabe si escribir "atento" o "atenta".
-- En profesionales, porque la aplicación le hablaba a todas en femenino
-- ("¡Bienvenida!") y hay kinesiólogos y psicólogos.
--
-- Null significa "no lo dijo": se deduce del nombre cuando se puede y si no,
-- masculino. 'unspecified' es "prefiero no decir", una elección que se respeta
-- — no se deduce encima de ella. La regla vive en
-- `src/lib/grammatical-gender.ts`.

alter table patients
  add column grammatical_gender text
    check (grammatical_gender in ('masculine', 'feminine', 'unspecified'));

alter table practitioners
  add column grammatical_gender text
    check (grammatical_gender in ('masculine', 'feminine', 'unspecified'));

-- La profesional elige el suyo en Mi perfil, así que la columna necesita
-- permiso de escritura desde la sesión: `20260906120000` revocó el UPDATE de
-- tabla, y toda columna nueva nace sin permiso para nadie.
--
-- Y `consent_template` va en la misma línea porque le pasó exactamente eso: se
-- agregó en `20260911165113`, después de los permisos por columna, y nadie se
-- lo dio. Guardar un consentimiento propio en Mi perfil fallaba siempre con
-- "permission denied", y la pantalla decía "No pudimos guardar".
grant update (grammatical_gender, consent_template) on table practitioners to authenticated;
