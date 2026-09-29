-- Un avance cargado de noche pertenece al día que es en Uruguay.
--
-- `goal_progress.recorded_on` tenía `default current_date`, y `current_date` en
-- Postgres es la fecha en UTC. Entre las 21:00 y la medianoche de Uruguay ya es
-- el día siguiente allá: un avance anotado después de la última sesión de la
-- tarde quedaba fechado mañana en la historia del objetivo, y el gráfico de
-- progreso lo mostraba un día corrido.
--
-- Nadie escribe esta columna desde la aplicación —la pone el trigger de
-- `goals`, que no la nombra— así que el default es el único lugar donde se
-- decide. El resto del producto ya usa la hora de Uruguay: `TIME_ZONE` en
-- `src/lib/dates.ts`, y todas las fechas que viajan desde las pantallas pasan
-- por `today()`.
--
-- Las filas que ya están quedan como están. Cuáles se anotaron de noche no se
-- puede saber desde acá, y reescribir la historia clínica sobre una suposición
-- es peor que dejar el dato como se guardó.
--
-- Las otras columnas con `default current_date` —`sessions.held_on`,
-- `assessments.assessed_on`, `reports.issued_on`, `payments.paid_on`,
-- `schedules.starts_on`— tienen el mismo problema latente, pero todas se
-- escriben con una fecha explícita desde la aplicación, así que el default no
-- llega a usarse. Se dejan para una decisión aparte.

alter table goal_progress
  alter column recorded_on set default (now() at time zone 'America/Montevideo')::date;
