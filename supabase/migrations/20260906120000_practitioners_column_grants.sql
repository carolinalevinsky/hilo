-- Qué columnas de su propio perfil puede escribir una profesional.
--
-- Hasta acá, todas. La política de `practitioners` es la de filas propias
--
--     for all using (id = (select auth.uid()))
--          with check (id = (select auth.uid()))
--
-- y decide **qué fila**, no **qué columna**. El permiso de columna venía del
-- `alter default privileges … grant select, insert, update, delete on tables to
-- authenticated` de M1, que es a nivel de tabla y por lo tanto alcanza a cada
-- columna que la tabla llegue a tener — incluidas las tres que se agregaron
-- después (`digest_sent_at`, `calendar_privacy`) y una que estaba desde el
-- principio y no debió estar nunca del lado del usuario: `plan`.
--
-- O sea que un PATCH a PostgREST con la anon key —que viaja en el bundle de todo
-- visitante, por diseño— y el token de la propia sesión alcanzaba para:
--
--     PATCH /rest/v1/practitioners?id=eq.<propio uuid>   {"plan":"pro"}
--
-- Eso lleva los límites mensuales de 10/10/40/10 a 200/400/1000/200. No es una
-- fuga de datos clínicos: es la única defensa que tiene la clave de Anthropic
-- contra el gasto, decidida por quien está limitado. Es el defecto #9 de v1
-- (`legacy/index.html:2775`) con otra forma — allá el límite estaba en el
-- navegador; acá está en el servidor, pero el dato sobre el que decide era
-- escribible por el navegador.
--
-- ─── Por qué se revoca la tabla y se devuelven las columnas ────────────────
--
-- Porque lo que parece la línea obvia no hace nada. De la documentación de
-- Postgres, sobre REVOKE:
--
--     "if a role has been granted privileges on a table, then revoking the
--      same privileges from individual columns will have no effect."
--
-- Un `revoke update (plan) on practitioners from authenticated` suelto se
-- ejecuta sin error, no cambia nada, y deja a quien lo escribió convencido de
-- que cerró el agujero. Hay que sacar el permiso de tabla y volver a otorgar,
-- columna por columna, sólo lo que la aplicación efectivamente escribe.
--
-- ─── Cómo se mantiene esta lista ───────────────────────────────────────────
--
-- Cada columna de acá abajo tiene una función de `src/server/practitioners.ts`
-- que la escribe con la sesión de la usuaria, y ninguna otra columna la tiene.
-- Si algún día una pantalla nueva necesita escribir otra, esto se cae con
-- `42501 permission denied`, que es ruidoso y en el lugar correcto. Lo que no
-- puede volver a pasar es lo contrario: que una columna nueva quede escribible
-- porque nadie decidió que lo fuera.

-- ─── UPDATE ────────────────────────────────────────────────────────────────
--
--   full_name, discipline, phone   updatePractitioner    (practitioners.ts:93)
--   calendar_privacy               updateCalendarPrivacy (practitioners.ts:132)
--   onboarded_at                   markTourSeen          (practitioners.ts:173)
--
-- `onboarded_at` es la marca de "ya vi el recorrido guiado". Se escribe con la
-- sesión de la profesional sobre su propia fila y la política sigue decidiendo
-- cuál es esa fila, así que darle esta columna no abre nada. Está en la lista
-- porque casi se queda afuera: la primera versión de esta migración se escribió
-- sobre una rama donde esa columna todavía no la usaba nadie, y sin este `grant`
-- el recorrido se repetiría en cada carga **sin un solo error a la vista** —
-- `app-tour.tsx` llama a la acción con `.catch(() => {})`.
--
-- Fuera quedan, y es el punto:
--
--   plan             lo decide el cobro, no la cuenta.
--   slug             es el link público que ya está impreso en una tarjeta.
--                    Ninguna función lo escribe después del alta.
--   email            decide a dónde van el aviso de reserva y el resumen
--                    quincenal (`booking.ts:127`, `digest.ts:87`). Escribible,
--                    era una forma de hacer que Hilo le mande a otra dirección
--                    el nombre y el teléfono de una familia.
--   digest_sent_at   lo escribe el cron, con clave de servicio.
--   id, created_at, updated_at   nadie.
--
-- `updated_at` no necesita permiso aunque cambie en cada UPDATE: lo escribe el
-- trigger `practitioners_touch_updated_at`, y Postgres verifica privilegios
-- sobre las columnas que nombra la sentencia, no sobre las que toca un trigger.

revoke update on table practitioners from authenticated;

grant update (full_name, discipline, phone, calendar_privacy, onboarded_at)
  on table practitioners to authenticated;


-- ─── INSERT ────────────────────────────────────────────────────────────────
--
-- La fila la crea el trigger `handle_new_practitioner`, que es `security
-- definer` y corre como su dueño: no pasa por estos permisos y no se ve
-- afectado.
--
-- El único INSERT que hace una usuaria es `createProfile`
-- (`practitioners.ts:206`), el camino de reparación para una cuenta que existía
-- antes de que el trigger existiera. Escribe estas cinco columnas y ninguna más,
-- así que `plan` no está — y sin esto, una cuenta sin perfil podía crearse el
-- suyo ya en 'pro'.

revoke insert on table practitioners from authenticated;

grant insert (id, email, full_name, discipline, slug)
  on table practitioners to authenticated;


-- ─── Lo que esto no arregla ────────────────────────────────────────────────
--
-- La cuota mensual se cuenta con `count(*)` sobre `reports`, `assessments`,
-- `assistant_questions` y `materials` del mes en curso (`src/server/plans.ts`),
-- y las cuatro tablas tienen política `for all`: **borrar las filas devuelve la
-- cuota**. Con el plan ya cerrado acá, ése es el camino que queda para gastar
-- sin techo contra Anthropic, y no se arregla con permisos: hace falta un
-- registro de consumo que la usuaria no pueda borrar, con la forma de
-- `audit_log` (sin política de insert, `revoke insert, update, delete`), escrito
-- con clave de servicio. Está pendiente y anotado en
-- `docs/auditoria-seguridad-resultado-2026-09.md`.
