import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DocumentDiff } from './document-diff'

/**
 * Lo que se ve antes de apretar "Aplicar".
 *
 * Se renderiza de verdad, a HTML, porque lo que hay que verificar es lo que la
 * profesional lee: que el texto nuevo esté, que el que se reemplaza esté
 * tachado, y sobre todo que un párrafo que la propuesta borra **aparezca**. Un
 * párrafo que la IA saca y que la pantalla no muestra es una pérdida aprobada
 * sin verla, que es el defecto que P19 vino a cerrar.
 */
function render(before: string, after: string) {
  return renderToStaticMarkup(<DocumentDiff before={before} after={after} />)
}

describe('DocumentDiff', () => {
  it('muestra lo nuevo y, tachado, lo que reemplaza', () => {
    const html = render('Llega derivada del colegio.', 'Llega derivada de la maestra.')

    expect(html).toContain('Llega derivada de la maestra.')
    expect(html).toContain('Llega derivada del colegio.')
    expect(html).toContain('line-through')
    expect(html).toContain('En lugar de:')

    // Lo nuevo arriba de lo viejo, que es el orden que se pidió y el que se lee
    // como el documento que va a quedar.
    expect(html.indexOf('de la maestra')).toBeLessThan(html.indexOf('del colegio'))
  })

  it('un párrafo que la propuesta borra se ve, y se ve que se borra', () => {
    const html = render('Uno.\n\nDos, que sobra.\n\nTres.', 'Uno.\n\nTres.')

    expect(html).toContain('Dos, que sobra.')
    expect(html).toContain('Saca esto:')
    expect(html).toContain('line-through')
  })

  it('un párrafo agregado no dice que reemplaza nada', () => {
    const html = render('Uno.\n\nTres.', 'Uno.\n\nDos.\n\nTres.')

    expect(html).toContain('Dos.')
    expect(html).not.toContain('En lugar de:')
    expect(html).not.toContain('Saca esto:')
  })

  it('marca los títulos con la misma regla que el documento', () => {
    // Sin esto el panel es una pared de texto gris justo cuando hay que leerlo
    // entero para decidir. La regla se importa de `clinical-document`, así que
    // este test también avisa si las dos se separan.
    const html = render('Antecedentes:\nUno.', 'Antecedentes:\nDos.')

    expect(html).toMatch(/<p class="[^"]*font-bold[^"]*">Antecedentes:<\/p>/)
    // Y un párrafo largo terminado en dos puntos no es un título.
    const largo = 'Se sugieren las siguientes adecuaciones para el aula, a coordinar con la maestra:'
    expect(render(largo, `${largo} uno.`)).not.toMatch(
      new RegExp(`<p class="[^"]*font-bold[^"]*">${largo}`),
    )
  })

  it('lo que no cambió sigue estando, para poder leer el documento entero', () => {
    const html = render('Antecedentes:\nUno.', 'Antecedentes:\nDos.')

    expect(html).toContain('Antecedentes:')
    expect(html).toContain('Dos.')
    expect(html).toContain('Uno.')
  })
})
