'use client'

import { ChevronDown, MoreHorizontal } from '@/components/icons'
import { useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * La fila de botones del encabezado de un paciente, plegada en teléfono.
 *
 * Son seis —Sesión, Consulta online, Evaluar, Compartir con familia, Generar
 * informe, Editar ficha— y en escritorio entran en una línea al costado del
 * nombre. En un teléfono de 375 px se apilan de a dos y ocupan 490 px de 812
 * antes del primer dato del paciente: más de media pantalla de botones para
 * llegar a la edad de un chico.
 *
 * Así que en teléfono quedan dos y el resto se abre con "Más". Los dos son los
 * de v1 (`legacy/index.html:1188`): lo que hacés durante la sesión y lo que
 * hacés después. Los otros cuatro no desaparecen, están a un toque.
 *
 * ─── Por qué no es un menú ────────────────────────────────────────────────
 *
 * Un `DropdownMenu` sería lo obvio y no sirve acá: dos de estos cuatro abren un
 * diálogo —la consulta online y el compartir—, y el contenido de un menú se
 * desmonta al cerrarse, así que el diálogo se iría con él. Esto en cambio no
 * mueve nada de lugar: los mismos botones, dibujados una sola vez, con una
 * clase que decide si se ven. En escritorio el contenedor es `contents`, o sea
 * que no existe, y los botones caen en la fila del encabezado como siempre.
 */
export function PatientActions({
  primary,
  secondary,
}: {
  /** Los dos que se ven siempre. */
  primary: React.ReactNode
  /** Los que en teléfono viven detrás de "Más". */
  secondary: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {primary}

      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        aria-expanded={open}
        aria-label={open ? 'Menos acciones' : 'Más acciones'}
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-white/16 px-2.5 text-white hover:bg-white/26 sm:hidden"
      >
        {/* Sin palabra: con "Más" escrito no entraba en la fila de los otros
            dos y quedaba solo en un renglón propio. */}
        {open ? <ChevronDown className="size-4 rotate-180" /> : <MoreHorizontal className="size-5" />}
      </button>

      <div
        className={cn(
          'grid w-full grid-cols-2 gap-2 sm:contents',
          open ? 'flex' : 'hidden',
        )}
      >
        {secondary}
      </div>
    </>
  )
}
