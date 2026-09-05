import { headers } from 'next/headers'

import { publicConfig } from '@/lib/env'

/**
 * La dirección desde la que se está sirviendo esta página.
 *
 * ─── Por qué no alcanza con `NEXT_PUBLIC_APP_URL` ─────────────────────────
 *
 * Esa variable se carga a mano en Vercel, y una variable cargada a mano se
 * puede cargar mal sin que nada avise. Pasó: quedó con la URL de Supabase, y el
 * link de reservas que se le pasa a las familias apuntaba al dominio de la base
 * de datos, que no sirve páginas. El link se veía perfecto y no llevaba a
 * ningún lado.
 *
 * La dirección real de una petición no se puede cargar mal: la pone el
 * servidor. Para todo lo que se muestra dentro de una página —el link que se
 * copia, el que se comparte por WhatsApp— esta es la fuente correcta, y además
 * acierta sola en los previews, donde el dominio es otro y la variable seguiría
 * apuntando a producción.
 *
 * ─── Lo que sigue necesitando la variable ─────────────────────────────────
 *
 * Los correos y el cron no ocurren dentro de una petición: no hay `host` que
 * leer. Ahí manda `NEXT_PUBLIC_APP_URL`, y si está mal, los links de los mails
 * salen mal. Esto arregla la mitad que se puede arreglar desde el código.
 *
 * ─── Por qué vive en `src/app/` ───────────────────────────────────────────
 *
 * Porque lee `next/headers`, y `src/server/` no importa de `next/*` — esa regla
 * la hace cumplir el lint. Leer la dirección de una petición es trabajo de
 * transporte, y el transporte vive en esta capa.
 */
export async function currentOrigin(): Promise<string> {
  const list = await headers()

  // `x-forwarded-host` es el que pone Vercel; `host` es el que hay corriendo
  // local. No es una cadena de variables de entorno —lo que la guía prohíbe—
  // sino dos nombres del mismo encabezado según quién sirva.
  const host = list.get('x-forwarded-host') ?? list.get('host')

  if (!host) {
    // Sin encabezados no queda nada mejor que la variable. Pasa en un render
    // sin petición, que es justo el caso para el que la variable existe.
    return publicConfig.NEXT_PUBLIC_APP_URL
  }

  const proto =
    list.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')

  return `${proto}://${host}`
}
