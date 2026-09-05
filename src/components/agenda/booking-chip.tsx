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
 * El link se muestra sin `https://` sólo para que entre en el ancho; lo que se
 * copia es la dirección completa, porque un link a medias pegado en Instagram no
 * abre.
 */
export function BookingChip({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5">
      <Link2 className="size-4 shrink-0 text-violet" />

      <div className="min-w-0">
        <p className="text-[12.5px] font-bold">Reservas online</p>
        <Link
          href="/reservas"
          className="block truncate text-[11.5px] text-muted-foreground hover:text-violet hover:underline"
        >
          {url.replace(/^https?:\/\//, '')}
        </Link>
      </div>

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
  )
}
