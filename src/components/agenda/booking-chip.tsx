'use client'

import { Copy, Link2 } from '@/components/icons'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

/**
 * El link de reservas, en el encabezado de la Agenda.
 *
 * La versión completa —compartir por WhatsApp, ver cómo lo ven ellos, la
 * explicación— vive en `/reservas` y sigue ahí. Acá van las dos cosas que se
 * hacen sin pensar: leerlo para saber cuál es, y copiarlo.
 *
 * Está en la Agenda porque es donde se está cuando alguien pregunta "¿cómo pido
 * hora?". Antes había que acordarse de que existía una pantalla llamada
 * Reservas, entrar, y volver.
 *
 * ─── La dirección no se muestra ───────────────────────────────────────────
 *
 * Se copia, no se lee. Escrita entera ocupaba media pantalla de encabezado con
 * una cadena que nadie va a transcribir a mano, y encima empujaba los botones.
 * Quien quiere verla entra a "Reservas", donde está en grande y con las otras
 * formas de compartirla.
 */
export function BookingChip({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <>
      {/* En teléfono, un botón más, del mismo alto y la misma forma que
          "Agendar sesión": el recuadro con un botón adentro era otro objeto al
          lado del botón principal y la fila se veía despareja. Copiar el link
          sigue a un toque, en /reservas. */}
      <Button asChild variant="outline" size="lg" className="shrink-0 sm:hidden">
        <Link href="/reservas">
          <Link2 className="size-4 text-violet" />
          Reservas
        </Link>
      </Button>

      <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-card py-1.5 pr-1.5 pl-3 max-sm:hidden">
        <Link2 className="size-4 shrink-0 text-violet" />

        <Link
          href="/reservas"
          className="text-meta font-bold hover:text-violet hover:underline"
        >
          Reservas online
        </Link>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => {
            void navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }}
        >
          <Copy className="size-3.5" />
          {copied ? '¡Copiado!' : 'Copiar link'}
        </Button>
      </div>
    </>
  )
}
