import { cn } from '@/lib/utils'

/**
 * El isotipo: la "o" de ombúa, sola, adentro de un cuadrado redondeado.
 *
 * Es el logotipo recortado en su primera letra, y es lo que se usa donde no
 * entra la palabra entera: la barra lateral, el ícono de la app, la pestaña del
 * navegador. Sale de `public/brand/isotype.svg`, que es también lo que lee
 * `scripts/make-icons.py` para dibujar los PNG.
 *
 * La "o" trae su hueco como un subtrazo que gira al revés, y el punto es un
 * pelo más grande que ese hueco, así que lo tapa entero. Por eso se ve un disco
 * lleno y no un anillo. Está bien: es lo que dibuja el navegador con el archivo
 * de diseño, y `scripts/make-icons.py` llega al mismo resultado.
 *
 * Decorativo: nunca aparece solo — siempre al lado del nombre escrito o de un
 * link que ya dice a dónde va. Por eso `aria-hidden` y no una etiqueta.
 */
const SQUARE = 'M0 50C0 22.3858 22.3858 0 50 0H1204C1231.61 0 1254 22.3858 1254 50V1204C1254 1231.61 1231.61 1254 1204 1254H50C22.3858 1254 0 1231.61 0 1204V50Z'

const GLYPH = 'M610.872 150.558C865.985 129.732 1089.5 320.088 1109.55 575.268C1129.61 830.437 938.59 1053.39 683.354 1072.66C429.203 1091.87 207.419 901.85 187.445 647.74C167.472 393.654 356.842 171.297 610.872 150.558ZM698.029 569.06C682.175 551.788 658.212 544.462 635.408 549.905C601.279 558.085 579.902 591.982 587.261 626.291C594.617 660.6 628.017 682.786 662.493 676.224C685.527 671.84 704.379 655.333 711.759 633.088C719.138 610.843 713.883 586.332 698.029 569.06Z'

const DOT = { cx: 651, cy: 613, r: 65 } as const

/** Sobre qué está apoyado el isotipo. */
const VARIANTS = {
  /** Sobre una tarjeta blanca: cuadrado violeta, punto bordó. */
  onLight: { square: 'var(--brand-violet)', dot: 'var(--brand-bordo)' },
  /** Sobre la barra lateral violeta: cuadrado bordó, punto violeta. */
  onViolet: { square: 'var(--brand-bordo)', dot: 'var(--brand-violet)' },
} as const

export function Isotype({
  variant = 'onLight',
  size = 30,
  className,
}: {
  variant?: keyof typeof VARIANTS
  size?: number
  className?: string
}) {
  const colors = VARIANTS[variant]

  return (
    <svg
      viewBox="0 0 1254 1254"
      width={size}
      height={size}
      aria-hidden
      className={cn('block shrink-0', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={SQUARE} fill={colors.square} />
      <path d={GLYPH} fill="var(--brand-celeste)" />
      <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill={colors.dot} />
    </svg>
  )
}
