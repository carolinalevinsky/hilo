import { cn } from '@/lib/utils'

/**
 * La franja de mensaje arriba de un formulario. Coral cuando algo salió mal,
 * verde cuando salió bien; la forma es la de v1 (`legacy/index.html:511`).
 *
 * No renderiza nada cuando no hay mensaje, así que un formulario puede montarla
 * sin condiciones.
 */
export function FormMessage({
  message,
  ok = false,
  className,
}: {
  message: string | null | undefined
  /**
   * Cambia el color y, lo que más importa, cómo lo anuncia un lector de
   * pantalla: `alert` interrumpe lo que se esté leyendo, y eso está bien para un
   * error pero no para una confirmación. `status` espera su turno.
   */
  ok?: boolean
  className?: string
}) {
  if (!message) return null

  return (
    <p
      role={ok ? 'status' : 'alert'}
      className={cn(
        'rounded-[11px] px-3.5 py-2.5 text-meta leading-relaxed',
        ok ? 'bg-green-soft text-[#1a8f57]' : 'bg-coral-soft text-[#c0392b]',
        className,
      )}
    >
      {message}
    </p>
  )
}
