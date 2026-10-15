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
    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card py-1 pr-1 pl-2.5 sm:gap-2.5 sm:py-1.5 sm:pr-1.5 sm:pl-3">
      <Link2 className="size-4 shrink-0 text-violet" />

      <Link
        href="/reservas"
        className="text-meta font-bold hover:text-violet hover:underline"
      >
        <span className="sm:hidden">Reservas</span>
        <span className="max-sm:hidden">Reservas online</span>
      </Link>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        aria-label={copied ? 'Link copiado' : 'Copiar link para reservar'}
        onClick={() => {
          void navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        }}
      >
        <Copy className="size-3.5" />
        {/* En teléfono sólo el ícono: con la palabra, este recuadro y
            "Agendar sesión" no entraban en una fila, y el botón principal de
            la pantalla bajaba a un renglón propio. */}
        <span className="max-sm:hidden">{copied ? '¡Copiado!' : 'Copiar link'}</span>
        {copied ? <span className="sm:hidden">¡Listo!</span> : null}
      </Button>
    </div>
  )
}
