-- Para quién es la consulta, aparte de quién la pide.
--
-- La reserva pública tenía un solo nombre, "Nombre y apellido", y quien la
-- llena casi siempre es la madre o el padre. "Convertir en paciente" tomaba ese
-- nombre como el del paciente: la ficha nueva quedaba a nombre del adulto y el
-- niño no aparecía en ningún lado.
--
-- Opcional y aparte: una reserva de un adulto para sí mismo no tiene nada que
-- poner acá, y las que ya existen no lo dijeron. Al convertir, la profesional
-- confirma el nombre del paciente de todas formas.

alter table booking_requests
  add column patient_name text
    check (patient_name is null or char_length(patient_name) between 1 and 120);
