import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  BRAND_BACKGROUND,
  BRAND_COLORS,
  BRAND_FOREGROUND,
  BRAND_NAME,
  BRAND_VIOLET_DARK,
  BRAND_VIOLET_LIGHT,
  pageTitle,
} from './brand'

/**
 * La marca, contra sus copias.
 *
 * `brand.ts` es el único lugar donde se escriben el nombre y los colores, pero
 * hay tres consumidores que no pueden importar TypeScript y guardan su propia
 * copia: las variables CSS de `globals.css`, las plantillas que GoTrue manda sin
 * pasar por la app, y los SVG de la arte.
 *
 * Una copia que se desincroniza no rompe nada: deja un violeta viejo en el botón
 * de un mail y nadie se entera por meses. Esto es lo que se entera.
 *
 * Y el último bloque es la contracara de "cambiarlo en todos lados": si vuelve a
 * aparecer el nombre viejo en una pantalla, acá falla.
 */

const root = join(__dirname, '..', '..')
const read = (...parts: string[]) => readFileSync(join(root, ...parts), 'utf8')

const SRC = join(root, 'src')

/** Todo el código y el CSS bajo `src/`, para los bloques que barren el árbol. */
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return /\.(ts|tsx|css)$/.test(entry.name) ? [full] : []
  })
}

/** Todos los hex de un texto, en minúscula y a seis dígitos. */
function hexes(text: string): Set<string> {
  const found = text.match(/#[0-9a-fA-F]{6}\b/g) ?? []
  return new Set(found.map((h) => h.toLowerCase()))
}

describe('la paleta en globals.css', () => {
  const css = read('src', 'app', 'globals.css')

  /** El valor crudo de una `--brand-*`, tal como quedó declarada en `:root`. */
  function declared(name: string): string | undefined {
    return new RegExp(`--brand-${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim().toLowerCase()
  }

  // `violetSoft` → `violet-soft`, que es como se escribe la variable.
  const asVariable = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

  it.each(Object.entries(BRAND_COLORS))('--brand-%s vale lo mismo que brand.ts', (key, hex) => {
    expect(declared(asVariable(key))).toBe(hex.toLowerCase())
  })

  it('los dos extremos del degradé coinciden', () => {
    expect(declared('violet-dark')).toBe(BRAND_VIOLET_DARK)
    expect(declared('violet-light')).toBe(BRAND_VIOLET_LIGHT)
  })

  it('el fondo y el texto coinciden', () => {
    expect(/--background:\s*([^;]+);/.exec(css)?.[1]?.trim()).toBe(BRAND_BACKGROUND)
    expect(/--foreground:\s*([^;]+);/.exec(css)?.[1]?.trim()).toBe(BRAND_FOREGROUND)
  })
})

describe('las plantillas de mail de Supabase', () => {
  // GoTrue manda estos archivos tal cual, sin pasar por la app: no hay forma de
  // que lean una variable. Lo que se puede verificar es que el hex que tienen
  // escrito siga siendo uno de la marca.
  it.each(['confirmacion.html', 'recuperacion.html'])('%s usa los violetas de la marca', (file) => {
    const found = hexes(read('supabase', 'templates', file))
    // El botón y el encabezado. Los grises del texto y el blanco de la tarjeta
    // no son marca y no se miran.
    expect(found).toContain(BRAND_COLORS.violet)
    expect(found).toContain(BRAND_VIOLET_DARK)
    expect(found).toContain(BRAND_VIOLET_LIGHT)
    expect(found).toContain(BRAND_BACKGROUND)
  })

  it.each(['confirmacion.html', 'recuperacion.html'])('%s dice el nombre nuevo', (file) => {
    expect(read('supabase', 'templates', file)).toContain(BRAND_NAME)
  })
})

describe('la arte de la marca', () => {
  const dir = join(root, 'public', 'brand')
  const files = readdirSync(dir).filter((f) => f.endsWith('.svg'))

  it('hay logotipo e isotipo', () => {
    expect(files).toContain('wordmark.svg')
    expect(files).toContain('isotype.svg')
  })

  // Los tonos oscuros de la arte son propios y están documentados en `brand.ts`.
  // Lo que no puede correrse es el violeta, que es el color principal.
  it.each(['wordmark.svg', 'isotype.svg'])('%s usa el violeta de la marca', (file) => {
    expect(hexes(read('public', 'brand', file))).toContain(BRAND_COLORS.violet)
  })

  it('el isotipo usa el celeste de la marca para la letra', () => {
    expect(hexes(read('public', 'brand', 'isotype.svg'))).toContain(BRAND_COLORS.celeste)
  })

  it('el isotipo sigue teniendo la estructura que espera make-icons.py', () => {
    const svg = read('public', 'brand', 'isotype.svg')
    expect(svg.match(/<path\b/g)).toHaveLength(2)
    expect(svg.match(/<circle\b/g)).toHaveLength(1)
    expect(svg).toMatch(/viewBox="0 0 (\d+) \1"/)
  })
})

describe('el nombre viejo no volvió', () => {
  /**
   * Lo que sí puede decir "hilo" está en `storage-keys.ts`, que es donde viven
   * las claves ya escritas en el Google Calendar y en el navegador de cada
   * profesional. Ese archivo, y los dos tests que fijan esas claves a propósito.
   */
  const allowed = [
    join('lib', 'storage-keys.ts'),
    join('server', 'google-calendar.test.ts'),
    // Este archivo: nombra el nombre viejo para poder buscarlo.
    join('lib', 'brand.test.ts'),
  ]

  const files = walk(SRC).filter((f) => !allowed.some((a) => f.endsWith(a)))

  it('ninguna pantalla dice el nombre viejo', () => {
    const offenders = files
      .filter((f) => /\bhilo\b/i.test(readFileSync(f, 'utf8')))
      .map((f) => f.slice(SRC.length + 1))
    expect(offenders).toEqual([])
  })
})

describe('el violeta viejo no volvió', () => {
  /**
   * El nombre viejo se ve; un violeta viejo, no. El cambio de marca movió cada
   * hex que se nombra a sí mismo, y pasó por al lado de dos sombras que
   * escribían `rgb(108 92 231 / 35%)` a mano —el `#6c5ce7` de Hilo— porque una
   * sombra al 35% de opacidad no es un color que alguien compare. Se arreglaron
   * por otro lado; lo que faltaba es lo que impide que vuelvan.
   *
   * Busca el violeta viejo en las tres notaciones en que se puede escribir: el
   * hex, y el `rgb()` separado por comas o por espacios.
   */
  const viejo = /#6c5ce7\b|108[\s,_]+92[\s,_]+231/i

  // Este archivo queda afuera: nombra el violeta viejo para poder buscarlo.
  const files = walk(SRC).filter((f) => !f.endsWith(join('lib', 'brand.test.ts')))

  it('ningún archivo escribe el violeta de Hilo', () => {
    const offenders = files
      .filter((f) => viejo.test(readFileSync(f, 'utf8')))
      .map((f) => f.slice(SRC.length + 1))
    expect(offenders).toEqual([])
  })

  // Un buscador que no encuentra nada pasa siempre, y no protege de nada.
  it('el que busca de verdad encuentra', () => {
    expect(viejo.test('shadow-[0_4px_12px_rgb(108_92_231_/_35%)]')).toBe(true)
    expect(viejo.test('#6C5CE7')).toBe(true)
    expect(viejo.test('rgb(108, 92, 231)')).toBe(true)
    expect(viejo.test('#7161ea')).toBe(false)
  })
})

describe('pageTitle', () => {
  it('arma el título con el nombre de la marca', () => {
    expect(pageTitle('Pacientes')).toBe(`Pacientes · ${BRAND_NAME}`)
  })
})

/**
 * El texto de color se lee. Ámbar sobre ámbar suave daba 1,8:1 y blanco sobre
 * verde 2,4:1; el mínimo de WCAG AA para texto chico es 4,5:1.
 */
describe('contraste del texto de color', () => {
  function luminance(hex: string) {
    const [r, g, b] = [1, 3, 5].map((index) => {
      const channel = parseInt(hex.slice(index, index + 2), 16) / 255
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
  }
  function contrast(a: string, b: string) {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (light! + 0.05) / (dark! + 0.05)
  }

  it.each(['teal', 'coral', 'amber', 'green', 'blue'] as const)(
    '%s: la tinta pasa 4,5:1 sobre blanco y sobre su fondo suave',
    (accent) => {
      const ink = BRAND_COLORS[`${accent}Ink`]
      expect(contrast(ink, '#ffffff')).toBeGreaterThanOrEqual(4.5)
      expect(contrast(ink, BRAND_COLORS[`${accent}Soft`])).toBeGreaterThanOrEqual(4.5)
    },
  )
})
