-- Cuánto dura cada cosa del plan, para poder sumarlas.
--
-- El planificador arma una lista y la sesión tiene un largo —`appointments.
-- duration_minutes`, 45 por defecto—, pero entre las dos no había ninguna
-- relación: se podían dejar preparadas seis actividades para tres cuartos de
-- hora y nada lo decía. Con esto, la tarjeta del plan puede mostrar "30 / 45
-- min" mientras se arma.
--
-- La duración va en el ítem del plan y no en el material, y esa es la decisión
-- de fondo: el mismo material dura diez minutos con un chico y veinticinco con
-- otro. Puesta en el material sería una estimación equivocada la mitad de las
-- veces, y habría que completarla en los ciento cuarenta que ya están cargados.
-- Puesta acá, la elige quien planifica, para esta sesión y este paciente.
--
-- 15 minutos por defecto para las filas que ya existen y para las que se suman
-- sin elegir. No es un dato inventado sobre lo que pasó: es el largo típico de
-- una actividad, y quien planifica lo cambia en un click. `not null` para que
-- la suma no tenga que decidir qué hacer con un hueco.

alter table session_plan_items
  add column duration_minutes integer not null default 15
    check (duration_minutes > 0 and duration_minutes <= 240);
