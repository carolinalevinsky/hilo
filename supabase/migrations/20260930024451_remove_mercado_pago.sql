-- destructive: intentional
--
-- Mercado Pago sale de la v1, y del código entero (decidido el 2026-09-29).
--
-- `mp_accounts` guardaba el access token de cada profesional: una credencial
-- que mueve plata, en texto plano. Nunca se habilitó en producción —la bandera
-- estuvo siempre apagada—, así que la tabla está vacía; pero una tabla de
-- tokens sin código que la use es exactamente el tipo de cosa que alguien
-- vuelve a llenar sin saber por qué existe. Se borra.
--
-- `payments.mp_payment_id` era la clave de idempotencia del webhook, que ya no
-- existe. Nada la escribe. Se borra también.
--
-- Lo que queda a propósito: `payments.method = 'mercadopago'`, porque una
-- familia que paga por Mercado Pago y la profesional que lo anota a mano es un
-- pago registrado como cualquier otro; y `payments.status`, que sin el webhook
-- es siempre 'confirmed'.
--
-- Si Mercado Pago vuelve, vuelve desde el historial de git y con una migración
-- nueva, no revirtiendo ésta.

drop table if exists mp_accounts;

alter table payments drop column if exists mp_payment_id;
