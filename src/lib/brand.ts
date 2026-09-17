/**
 * La marca, en un solo lugar.
 *
 * El nombre, los colores y las descripciones viven acá y en ningún otro lado.
 * Cambiar la marca entera es editar este archivo — no cuarenta.
 *
 * Tres consumidores no pueden importar TypeScript y guardan su propia copia de
 * los colores: `src/app/globals.css` (las variables CSS), `scripts/make-icons.py`
 * (dibuja los PNG del ícono) y `supabase/templates/*.html` (los mails que manda
 * GoTrue, que no pasan por la app). Para que esas copias no se desincronicen en
 * silencio, `brand.test.ts` las lee y falla si alguna dejó de coincidir con lo
 * que dice este archivo.
 *
 * Lo que NO está acá son las claves de almacenamiento que todavía llevan el
 * nombre viejo:
 * ésas no son marca, son datos ya escritos en el Google Calendar y en el
 * navegador de cada profesional. Están en `src/lib/storage-keys.ts`, con el
 * motivo al lado de cada una.
 */

/** Como se llama el producto. Va en títulos, mails, la PWA y el texto visible. */
export const BRAND_NAME = 'Ombúa'

/** El nombre corto para la pantalla de inicio del celular (máximo ~12 caracteres). */
export const BRAND_SHORT_NAME = 'Ombúa'

/** La descripción de una línea, para el `<meta name="description">`. */
export const BRAND_DESCRIPTION =
  'La herramienta de gestión para profesionales de la salud y la educación.'

/** La descripción larga, la que se ve al instalar la app. */
export const BRAND_LONG_DESCRIPTION =
  'Historias clínicas, agenda, objetivos, informes y cobros — todo tu consultorio en un solo lugar.'

/** El cierre de los mails. Se lee como "Ombúa — tu trabajo clínico, ordenado". */
export const BRAND_TAGLINE = 'tu trabajo clínico, ordenado'

/**
 * La paleta.
 *
 * Tres colores son la marca y salieron del logotipo: el violeta, el celeste y
 * el bordó. Los otros cinco son estados —pagado, pendiente, atrasado— y los
 * colores con que se distingue un paciente de otro en la agenda; no son marca,
 * y por eso el cambio de identidad no los tocó.
 *
 * Cada acento tiene su versión `Soft`, que es el fondo de los chips y las
 * badges: `bg-violet text-white` es el acento lleno, `bg-violet-soft
 * text-violet` es el chip.
 */
export const BRAND_COLORS = {
  /** El principal: la barra lateral, los botones, la barra de estado del celular. */
  violet: '#7161ea',
  violetSoft: '#f1effd',

  /** El claro del logotipo: la palabra sobre el violeta, y las superficies calmas. */
  celeste: '#d1e1f8',

  /**
   * El oscuro del logotipo — el punto adentro de la "o".
   *
   * La arte lo trae como `#551D1A`, un punto de verde más que éste. La
   * diferencia no se ve; los archivos del logo quedaron como los entregó
   * diseño y esto es lo que usa la interfaz.
   */
  bordo: '#551c1a',
  bordoSoft: '#f4eae9',

  /**
   * El violeta casi blanco: el fondo de un día cualquiera en la agenda, o el de
   * una cita adentro de un mail. No es un chip — es una superficie que se tiene
   * que leer como blanca y apenas teñida.
   */
  violetWhisper: '#f9f9fe',

  teal: '#12b5a5',
  tealSoft: '#e2f7f4',
  coral: '#ff6b6b',
  coralSoft: '#ffe9e9',
  amber: '#f7a800',
  amberSoft: '#fff3d9',
  green: '#21bf73',
  greenSoft: '#e2f6ec',
  blue: '#4c8dff',
  blueSoft: '#e7f0ff',
} as const

/**
 * Los dos extremos del degradé violeta — la pantalla de entrada, la barra
 * lateral y el encabezado de los mails.
 *
 * Escritos y no calculados porque los mails los necesitan como hex literal: el
 * cliente de correo no evalúa `color-mix`, y la mitad de ellos tampoco variables
 * CSS. Salen del violeta con el mismo desplazamiento que tenían los de v1.
 */
export const BRAND_VIOLET_DARK = '#5f50d7'
export const BRAND_VIOLET_LIGHT = '#8273f3'

/** El fondo de la app. No es un acento: es la superficie sobre la que va todo. */
export const BRAND_BACKGROUND = '#f5f6fb'

/** El texto sobre ese fondo. */
export const BRAND_FOREGROUND = '#1e2436'

/**
 * El título de una pestaña.
 *
 * `pageTitle('Pacientes')` da `Pacientes · Ombúa`.
 *
 * Las páginas que se imprimen —la ficha del paciente, un informe— no lo usan a
 * propósito: el navegador escribe el título en el encabezado del papel, y el
 * nombre del producto no va en un documento clínico que se firma y se entrega.
 */
export function pageTitle(section: string): string {
  return `${section} · ${BRAND_NAME}`
}
