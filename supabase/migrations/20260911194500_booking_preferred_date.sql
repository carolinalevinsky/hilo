-- La reserva pública pide una fecha, no un día de la semana (P7).
--
-- El formulario preguntaba "¿qué día te queda mejor?" con un día de la semana:
-- la familia decía "martes" y no había forma de saber cuál. Para una consulta
-- puntual —una primera entrevista, que es el caso típico de una reserva— eso no
-- alcanza. Carolina aprobó lo que propuso el QA de Thomas: una fecha real, y la
-- hora de a 15 minutos.
--
-- Una columna nueva y no un cambio de tipo de `preferred_weekday`: las reservas
-- que ya existen dijeron un día de la semana y lo siguen diciendo, y convertir
-- "martes" en una fecha sería inventarla. La vieja queda, sin que el formulario
-- la escriba más; confirmar una reserva vieja sigue haciendo lo que hacía.
--
-- Sin `check` de "de hoy en adelante": en la base eso rompería cada fila el día
-- después de su fecha. Lo controla `PublicBooking`, al recibirla.

alter table booking_requests
  add column preferred_date date;
