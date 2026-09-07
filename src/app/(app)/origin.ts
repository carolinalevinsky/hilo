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
/**
 * Los hosts que pueden mandar. Todo lo demás cae en la variable.
 *
 * `x-forwarded-host` llega tal como venga: un pedido con `Host: ejemplo.com`
 * hacía que la página dibujara el link de reservas apuntando ahí. No es
 * explotable por un tercero —lo único que se arma es un link que se devuelve en
 * la respuesta a ese mismo pedido, y el navegador de la víctima no falsifica su
 * propio `Host`— así que esto no cierra un agujero abierto: cierra el que se
 * abriría el día que alguien use `currentOrigin()` para armar el link de un
 * correo, que es el clásico del envenenamiento de Host.
 *
 * `*.vercel.app` está adentro porque los previews cambian de nombre en cada
 * despliegue y son justo el caso que esta función vino a resolver.
 */
function trusted(host: string): boolean {
  const name = (host.split(':')[0] ?? '').toLowerCase()
  if (!name) return false

  if (name === 'localhost' || name === '127.0.0.1') return true
  if (name === 'vercel.app' || name.endsWith('.vercel.app')) return true

  try {
    return name === new URL(publicConfig.NEXT_PUBLIC_APP_URL).hostname.toLowerCase()
  } catch {
    return false
  }
}

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

  if (!trusted(host)) {
    // Ruidoso a propósito. Si esto aparece y no es un pedido con el encabezado
    // falsificado, entonces `NEXT_PUBLIC_APP_URL` está mal cargada y los links
    // de los correos —que salen de esa misma variable— también lo están. Antes
    // eso era silencioso de un lado y correcto del otro, que es la peor
    // combinación para darse cuenta.
    console.warn('[origin] host no reconocido, uso NEXT_PUBLIC_APP_URL', { host })
    return publicConfig.NEXT_PUBLIC_APP_URL
  }

  const proto =
    list.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')

  return `${proto}://${host}`
}
