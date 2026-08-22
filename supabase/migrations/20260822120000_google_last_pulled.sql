-- Cuándo fue la última vez que se le preguntó a Google.
--
-- Hilo trae los cambios al abrir la Agenda. Sin esta columna eso sería una
-- consulta a Google en cada carga de la pantalla — incluida la de alguien que
-- toca "semana anterior" cuatro veces seguidas — y son cuatro viajes a otro
-- continente para preguntar cuatro veces lo mismo.
--
-- Con esto se pregunta como mucho una vez cada dos minutos. Mover una sesión
-- desde el celular y verla en la compu al ratito sigue funcionando igual; lo que
-- se evita es el viaje repetido.
--
-- ─── Sobre las columnas de canal que quedan sin usar ───────────────────────
--
-- `channel_id`, `channel_resource_id` y `channel_expires_at` se crearon pensando
-- en las notificaciones push de Google, y por ahora no las usa nadie: preguntar
-- al abrir la pantalla da el mismo resultado con mucha menos maquinaria — sin
-- endpoint público, sin canales que vencen cada semana, sin un cron que los
-- renueve, y sin un séptimo lugar con clave de servicio.
--
-- Se dejan en su lugar y no se borran porque el día que la demora moleste, el
-- push se agrega encima de esto sin rehacer nada. Que estén vacías es una
-- decisión, no un olvido.

alter table google_accounts
  add column last_pulled_at timestamptz;

comment on column google_accounts.last_pulled_at is
  'Última consulta de cambios a Google. Limita la frecuencia; no es el punto de sincronización, eso es sync_token.';
