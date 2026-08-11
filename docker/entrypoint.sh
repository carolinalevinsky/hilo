#!/bin/sh
# Puente de red entre el contenedor de desarrollo y Supabase.
#
# El problema que resuelve:
#
# NEXT_PUBLIC_SUPABASE_URL la leen dos cosas distintas. El servidor de Next
# corre acá adentro; el navegador corre en tu Mac. Para el navegador la base
# está en 127.0.0.1:54321. Para el contenedor, 127.0.0.1 es el contenedor mismo
# — ahí no hay nada.
#
# En vez de mantener dos URLs (que se desincronizan y producen un bug confuso
# de "anda en el server pero no en el browser"), hacemos que 127.0.0.1:5432x
# signifique lo mismo en los dos lados: socat escucha en esos puertos acá
# adentro y reenvía todo al host. Una sola variable, un solo valor.
set -e

# 54321 API (Kong) · 54322 Postgres · 54323 Studio · 54324 correo de prueba
for port in 54321 54322 54323 54324; do
  socat "TCP-LISTEN:${port},fork,reuseaddr,bind=127.0.0.1" \
        "TCP:host.docker.internal:${port}" 2>/dev/null &
done

exec "$@"
