-- Las cinco fechas que quedaban: el día que es en Uruguay, no en UTC.
--
-- `current_date` en Postgres es la fecha en UTC, y el servidor corre en UTC
-- para usuarias que están en UTC-3. Entre las 21:00 y la medianoche de Uruguay
-- la base ya está en el día siguiente. `goal_progress.recorded_on` se corrigió
-- en `20260929012235`; estas cinco son el mismo default, con el mismo error.
--
-- Al escribir esa migración dije que las cinco eran latentes porque la
-- aplicación siempre les pasa una fecha explícita. Eso era cierto de cuatro.
--
-- `reports.issued_on` NO se escribe desde ningún lado: el insert de
-- `createReport` (`src/server/reports.ts`) no nombra la columna, así que la
-- fecha de emisión de todos los informes la pone este default. Un informe
-- generado después de las nueve de la noche queda emitido mañana — en un
-- documento clínico firmado, con la fecha impresa adentro. Para esa columna
-- esto no es prevención, es el arreglo.
--
-- Las otras cuatro sí son prevención: hoy `held_on`, `assessed_on`, `paid_on` y
-- `starts_on` llegan siempre con una fecha desde las pantallas, que ya la
-- calculan con `today()` (`src/lib/dates.ts`). El default es el camino que
-- queda abierto para el día que alguien agregue un insert que no la nombre —
-- que es exactamente lo que pasó con los informes.
--
-- Las filas que ya están quedan como están. Cuáles se escribieron de noche no
-- se puede saber desde acá, y reescribir fechas de documentos clínicos sobre
-- una suposición es peor que dejar el dato como se guardó.

alter table sessions
  alter column held_on set default (now() at time zone 'America/Montevideo')::date;

alter table assessments
  alter column assessed_on set default (now() at time zone 'America/Montevideo')::date;

alter table reports
  alter column issued_on set default (now() at time zone 'America/Montevideo')::date;

alter table payments
  alter column paid_on set default (now() at time zone 'America/Montevideo')::date;

alter table schedules
  alter column starts_on set default (now() at time zone 'America/Montevideo')::date;
