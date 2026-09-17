import { BRAND_NAME } from '@/lib/brand'
import { cn } from '@/lib/utils'

/**
 * El logotipo: la palabra "ombúa" dibujada, no escrita.
 *
 * Son las seis curvas que entregó diseño, tal cual salen de
 * `public/brand/wordmark.svg`, más el punto adentro de la primera "o" — que es
 * un círculo aparte porque en la marca lleva su propio color.
 *
 * Va en línea y no como `<img>` a propósito: es lo primero que se ve al entrar
 * y como archivo aparte llegaría un instante después que la tarjeta que lo
 * contiene, con el salto correspondiente.
 *
 * Los colores salen de las variables CSS, así que cambiar la paleta en
 * `globals.css` lo cambia acá también. Las tres combinaciones son las que
 * entregó diseño; no inventar otras sin mirar el original.
 *
 * ─── El punto se pierde en chico, y está aceptado ─────────────────────────
 *
 * El punto bordó mide el 14% del ancho de la "o": 3,45px cuando el logotipo va
 * a 32, 3,0 en la barra lateral, 2,6 en legales. A ese tamaño, con suavizado y
 * en una pantalla que no sea retina, deja de leerse como un punto de color.
 *
 * Se miró y se decidió dejarlo así: de lejos la palabra se lee igual, y el
 * punto es un detalle para quien mira de cerca. Agrandarlo sería cambiar el
 * dibujo que entregó diseño, y eso no se hace desde acá. Si alguna vez hace
 * falta, lo que corresponde es una variante para tamaños chicos hecha por
 * diseño, no retocar estos trazos.
 *
 * El `viewBox` está recortado al dibujo y no es el del archivo, que trae aire
 * arriba y abajo — la palabra ocupa menos de la mitad de su alto. Con el del
 * archivo, `height={28}` daba una palabra de 13px y había que compensar a ojo
 * en cada pantalla. Recortado, `height` es el alto de la palabra.
 */
const LETTERS = [
  'M791.968 400.855C856.764 393.784 911.616 431.019 925.166 495.82C931.06 524.013 929.033 557.981 929.003 587.198L928.915 705L796.942 704.98L797.038 601.714C797.051 584.569 797.445 566.793 796.611 549.659C795.894 534.898 773.712 535.183 772.864 550.188C771.949 566.375 772.426 582.848 772.447 599.106L772.6 704.888L643.772 704.949C643.56 690.443 643.721 675.539 643.705 660.992C643.723 643.858 646.176 551.614 642.059 544.321C640.431 541.438 637.743 539.502 634.486 538.911C630.974 538.28 626.973 538.972 624.17 541.285C621.663 543.353 620.743 546.012 620.296 549.108C617.961 565.316 619.641 583.541 619.645 600.023L619.706 704.98H484.368L484.363 405.529L600.483 405.469C648.612 405.461 680.829 400.745 723.907 427.045C746.41 410.925 764.49 403.631 791.968 400.855Z',

  'M1074.96 343.293C1074.8 369.268 1074.95 395.246 1075.4 421.218C1087.02 407.636 1101.66 400.894 1119.29 399.799C1198.65 394.868 1258.6 464.562 1262.62 540.12C1265.02 585.362 1252.94 622.999 1223.37 656.808C1209.93 672.037 1193.68 684.529 1175.5 693.6C1134.65 714.042 1082.93 716.251 1039.93 701.765C1002.23 689.457 971.009 662.58 953.224 627.122C945.616 611.953 940.647 595.593 938.532 578.744C936.949 565.621 934.905 351.973 937.559 344.004L939.718 343.248L1074.96 343.293ZM1115.88 537.95C1110.18 532.31 1101.89 530.182 1094.17 532.371C1082.44 535.69 1075.57 547.825 1078.75 559.594C1081.92 571.362 1093.98 578.387 1105.79 575.343C1113.55 573.347 1119.64 567.331 1121.73 559.594C1123.82 551.846 1121.59 543.58 1115.88 537.95Z',

  'M1742.31 396.099C1787.71 391.214 1839.52 409.225 1871.78 441.575C1890.33 460.4 1903.61 483.774 1910.27 509.352C1917.32 536.891 1915.55 575.994 1915.52 605.457L1915.4 705.113L1790.42 705.143L1790.26 677.982C1784.16 684.385 1780.32 688.621 1773.31 693.956C1760.73 702.813 1746.04 708.218 1730.73 709.613C1699.97 712.463 1667.53 701.163 1644.48 681.291C1580.12 625.807 1571.27 517.792 1627.77 453.585C1659.29 417.776 1695.59 400.112 1742.31 396.099ZM1774.18 548.07C1771.01 536.189 1758.79 529.134 1746.91 532.34C1735.09 535.537 1728.08 547.693 1731.23 559.523C1734.39 571.352 1746.52 578.407 1758.36 575.293C1770.25 572.157 1777.35 559.961 1774.18 548.07Z',

  'M1441.67 401.248L1581.36 401.328L1581.31 533.91L1581.3 704.689L1462.45 704.749C1435.62 704.749 1393.46 706.537 1369.02 700.565C1346.96 695.234 1326.77 684.013 1310.61 668.1C1265.74 623.377 1271.56 569.453 1271.66 511.768L1271.73 401.331C1317.36 400.642 1364.87 401.222 1410.57 401.351L1410.51 507.602C1410.46 524.662 1410.03 541.983 1410.9 558.993C1411.26 565.756 1418.66 570.397 1424.94 570.763C1429.42 571.007 1433.81 569.422 1437.09 566.366C1440.78 562.923 1441.44 559.318 1441.53 554.444C1441.83 539.059 1441.65 523.561 1441.65 508.17L1441.67 401.248Z',

  'M298 393.95C386.265 386.745 463.597 452.605 470.536 540.894C477.476 629.178 411.385 706.315 323.077 712.984C235.145 719.631 158.411 653.886 151.5 565.968C144.59 478.058 210.109 401.125 298 393.95ZM328.154 538.745C322.669 532.77 314.378 530.235 306.488 532.118C294.68 534.949 287.284 546.676 289.83 558.546C292.375 570.416 303.931 578.092 315.859 575.822C323.829 574.306 330.351 568.595 332.904 560.899C335.458 553.202 333.64 544.721 328.154 538.745Z',

  'M1395.75 385.333L1370.36 322.253L1454 288.588C1465.79 283.845 1479.18 289.553 1483.93 301.337L1500.73 343.08L1395.75 385.333Z',
] as const

const DOT = { cx: 311.363, cy: 553, r: 23 } as const

/** Sobre qué está apoyado el logotipo. */
const TONES = {
  /** Fondo claro: la palabra en violeta, el punto en bordó. */
  violet: { letters: 'var(--brand-violet)', dot: 'var(--brand-bordo)' },
  /**
   * Fondo violeta u oscuro: la palabra en blanco, el punto en violeta.
   *
   * El punto va del color del fondo a propósito — se lee como el hueco de la
   * "o", igual que en las variantes que entregó diseño.
   */
  white: { letters: '#fff', dot: 'var(--brand-violet)' },
  /** La misma idea en celeste. Es la combinación del archivo original. */
  celeste: { letters: 'var(--brand-celeste)', dot: 'var(--brand-violet)' },
  /** Fondo claro, versión bordó: la palabra en bordó, el punto en celeste. */
  bordo: { letters: 'var(--brand-bordo)', dot: 'var(--brand-celeste)' },
} as const

export function Wordmark({
  tone = 'violet',
  height = 28,
  className,
}: {
  tone?: keyof typeof TONES
  /**
   * Alto en píxeles, del acento de la ú a la base de las letras.
   *
   * Ojo: NO es el alto de las minúsculas. El acento se lleva la cuarta parte de
   * arriba, así que las letras miden más o menos tres cuartos de este número —
   * `height={22}` da una palabra de 16px, que al lado de un título de 22px se
   * ve chica. Para que pese como un logo, va bastante más grande que el texto
   * que tiene debajo.
   */
  height?: number
  className?: string
}) {
  const { letters, dot } = TONES[tone]

  return (
    <svg
      viewBox="151 287 1765 427"
      height={height}
      role="img"
      aria-label={BRAND_NAME}
      className={cn('block w-auto shrink-0', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {LETTERS.map((d) => (
        <path key={d.slice(0, 24)} d={d} fill={letters} />
      ))}
      <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill={dot} />
    </svg>
  )
}
