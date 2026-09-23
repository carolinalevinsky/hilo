import { ChevronDown } from '@/components/icons'
import { cn } from '@/lib/utils'

/**
 * El `<select>` del sistema, con la flecha de Ombúa.
 *
 * Es nativo a propósito: el de Radix (`ui/select.tsx`) no se envía con el
 * formulario —necesita estado del cliente y un input escondido para hacer lo
 * que éste hace solo— y en un teléfono el selector del sistema es el mejor
 * control que hay. Eso no está en discusión; lo que estaba mal era cómo se veía.
 *
 * **La flecha.** La del navegador la dibuja el sistema operativo: gris de macOS
 * en una Mac, otra cosa en Windows, y en ninguno de los dos casos se parece al
 * resto de la interfaz. Con `appearance-none` se apaga y la dibujamos nosotros,
 * con el mismo ícono que usa todo el producto y en `text-muted-foreground`, que
 * sigue al tema claro y al oscuro. El ícono no recibe clicks
 * (`pointer-events-none`), así que tocarlo abre la lista igual.
 *
 * **El hueco de la derecha.** `pr-8` deja el lugar de la flecha, y ni un pixel
 * más: "Todas las semanas" adentro de un diálogo de dos columnas entra justo, y
 * cada cuatro pixeles de más le cortan una letra. Es la misma medida que ya
 * usaba el selector de la Agenda (`week-view-select.tsx`), que es de donde sale
 * este diseño.
 *
 * Había ocho copias de este archivo pegadas al pie de ocho componentes, todas
 * iguales salvo por el `px`, y ninguna con flecha propia. Ahora es uno.
 *
 * `className` va al `<select>` y `wrapperClassName` al envoltorio, que es quien
 * ocupa el ancho: un control de barra de herramientas que mide lo que mide
 * necesita las dos cosas (ver `week-view-select.tsx`).
 */
export function NativeSelect({
  className,
  wrapperClassName,
  ...props
}: React.ComponentProps<'select'> & { wrapperClassName?: string }) {
  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <select
        {...props}
        className={cn(
          'h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      />
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
