'use client'

import { Upload } from '@/components/icons'
import { useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * Un campo para elegir un archivo, en castellano.
 *
 * El `<input type="file">` del navegador escribe su botón y su texto en el
 * idioma del sistema, no en el de la página: en una computadora en inglés decía
 * "Choose File · No file chosen" en medio de una pantalla en castellano, y eso
 * no se cambia con CSS. Acá el input real sigue estando —se envía con el
 * formulario, respeta `required` y `accept`— pero invisible, y lo que se ve es
 * nuestro: "Elegir archivo" y el nombre del que elegiste.
 *
 * Toda la caja es el `<label>`, así que se toca en cualquier parte.
 */
export function FileInput({
  id,
  onChange,
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'> & { id: string }) {
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded-lg border border-input bg-card p-1.5 pr-3 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 hover:border-violet/40',
        className,
      )}
    >
      <input
        {...props}
        id={id}
        type="file"
        className="sr-only"
        onChange={(event) => {
          setFileName(event.target.files?.[0]?.name ?? null)
          onChange?.(event)
        }}
      />
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-violet-soft px-3 py-1.5 text-body font-bold text-violet">
        <Upload className="size-4" />
        Elegir archivo
      </span>
      <span className={cn('min-w-0 truncate text-body', !fileName && 'text-muted-foreground')}>
        {fileName ?? 'Ningún archivo elegido'}
      </span>
    </label>
  )
}
