'use client'

import { useState } from 'react'

import { RotateCw } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/dates'
import type { DocumentVersion } from '@/server/document-versions'

/**
 * Las versiones anteriores del documento, para poder volver.
 *
 * No aparece hasta que hay algo que recuperar: un informe recién escrito no
 * tiene nada atrás, y una sección vacía llamada "Versiones anteriores" es una
 * promesa sin contenido.
 *
 * Restaurar no pide confirmación a propósito. Volver a una versión guarda antes
 * la que está —eso lo hace `restoreVersion` del lado del servidor—, así que
 * restaurar la equivocada se arregla restaurando de nuevo. Un cartel de "¿estás
 * segura?" sobre una acción reversible entrena a apretar "sí" sin leer, y
 * después ese reflejo llega al botón que sí borra.
 */

const REASONS: Record<string, string> = {
  ai: 'antes de aplicar una propuesta de la IA',
  edit: 'antes de una edición a mano',
  restore: 'antes de restaurar otra versión',
}

export function DocumentHistory({
  versions,
  onRestore,
  disabled,
}: {
  versions: DocumentVersion[]
  onRestore: (versionId: string) => Promise<void>
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)

  if (versions.length === 0) return null

  return (
    <div className="no-print border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        {open ? 'Ocultar versiones anteriores' : `Versiones anteriores (${versions.length})`}
      </button>

      {open ? (
        <ul className="mt-3 space-y-2">
          {versions.map((version) => (
            <li
              key={version.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border px-3 py-2.5"
            >
              <div className="min-w-[200px] flex-1">
                <p className="text-[12.5px] font-bold">
                  {formatDateTime(version.created_at)}
                  <span className="font-normal text-muted-foreground">
                    {' · '}
                    {REASONS[version.replaced_by] ?? 'antes de un cambio'}
                  </span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted-foreground">
                  {preview(version.body)}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={disabled || restoring !== null}
                onClick={async () => {
                  setRestoring(version.id)
                  try {
                    await onRestore(version.id)
                  } finally {
                    setRestoring(null)
                  }
                }}
              >
                <RotateCw className={`size-4 ${restoring === version.id ? 'animate-spin' : ''}`} />
                {restoring === version.id ? 'Restaurando…' : 'Restaurar'}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/**
 * Las primeras palabras, para reconocerla.
 *
 * Salteando los títulos —las líneas que terminan en dos puntos— porque son
 * iguales en todas las versiones y no distinguen ninguna.
 */
function preview(body: string): string {
  const line =
    body
      .split('\n')
      .map((value) => value.trim())
      .find((value) => value !== '' && !value.endsWith(':')) ?? ''

  return line.length > 140 ? `${line.slice(0, 140)}…` : line
}
