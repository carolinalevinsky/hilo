/**
 * Las medidas de los controles de las pantallas de entrada.
 *
 * Los campos del producto miden 32px de alto: entran ocho en una ficha de
 * paciente y ésa es la medida correcta ahí. En estas pantallas hay dos campos
 * en una columna de 420px, y a esa altura se ven apretados — el rediseño los
 * pide más grandes, que además es lo que conviene para escribir una contraseña
 * en un teléfono.
 *
 * Están acá y no escritos en cada formulario porque son seis: entrar,
 * recuperar, contraseña nueva (dos campos), invitación y completar perfil.
 * Escritos seis veces dejan de coincidir la primera vez que alguien toca uno.
 *
 * Los radios van en píxeles y no como `rounded-xl`: la escala del proyecto sale
 * de `--radius: 18px`, así que `xl` son 25px y un campo de 44px con ese radio
 * queda ovalado.
 */

/** La etiqueta arriba de un campo: más chica y más firme que la del producto. */
export const AUTH_LABEL = 'text-meta font-semibold tracking-[0.2px]'

/** Un campo de texto. El `<select>` de profesión usa el alto y el radio, pero
    no el padding: el hueco de su flecha lo mide `NativeSelect`. */
export const AUTH_FIELD = 'h-11 rounded-[12px] px-3.5 text-sm shadow-xs'

/**
 * El botón que cierra el formulario. Siempre ocupa el ancho entero.
 *
 * La sombra es violeta y no gris: apoyada sobre blanco, un botón de color con
 * sombra neutra se ve sucio. Es la del diseño, con el violeta de la marca.
 */
export const AUTH_SUBMIT =
  'h-12 w-full rounded-[12px] text-base font-semibold shadow-[0_18px_40px_-14px_rgba(113,97,234,0.75)]'
