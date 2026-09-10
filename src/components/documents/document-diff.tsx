import { isHeading } from '@/components/documents/clinical-document'
import { diffLines } from '@/lib/diff'

/**
 * Lo que la IA propone cambiar, al lado de lo que ya está escrito.
 *
 * Se lee de arriba hacia abajo como el documento que va a quedar: lo nuevo en
 * su lugar, y debajo de cada tramo cambiado, tachado, lo que reemplaza. Ese
 * orden es el pedido y también el correcto — lo que hay que juzgar es el texto
 * que se va a firmar; lo viejo está para saber qué se pierde si se aplica.
 *
 * Las líneas vacías del original no se dibujan: separan párrafos en el texto y
 * acá la separación la da el espaciado. Los títulos sí se marcan, con la misma
 * regla que usa el documento —`isHeading`, importada y no copiada— porque un
 * informe de cuarenta líneas sin sus títulos es una pared de texto justo cuando
 * hay que leerlo entero para decidir.
 */
export function DocumentDiff({ before, after }: { before: string; after: string }) {
  const blocks = diffLines(before, after)

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-3.5 text-[13px] leading-[1.65]">
      {blocks.map((block, index) =>
        block.type === 'same' ? (
          <Lines key={index} lines={block.lines} tone="same" />
        ) : (
          <div
            key={index}
            className="space-y-1.5 rounded-lg border-l-[3px] border-violet bg-violet-soft/50 py-2 pl-3 pr-2.5"
          >
            <Lines lines={block.added} tone="added" />

            {block.removed.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[12.5px] font-bold text-muted-foreground">
                  {block.added.length > 0 ? 'En lugar de:' : 'Saca esto:'}
                </p>
                <Lines lines={block.removed} tone="removed" />
              </div>
            ) : null}
          </div>
        ),
      )}
    </div>
  )
}

/**
 * Cada línea con su clase entera y armada de una vez.
 *
 * De una vez y no componiendo una base con un agregado: `font-medium` y
 * `font-bold` son las dos utilidades de la misma propiedad, y cuando las dos
 * caen en el mismo elemento gana la que quede última en el CSS generado, no la
 * que se escribió después. Es la misma trampa que el `ring` doble de la grilla
 * de la agenda.
 */
function Lines({ lines, tone }: { lines: string[]; tone: 'same' | 'added' | 'removed' }) {
  const visible = lines.filter((line) => line.trim() !== '')
  if (visible.length === 0) return null

  return (
    <div className="space-y-1.5">
      {visible.map((line, index) => (
        <p key={index} className={classFor(tone, isHeading(line.trim()))}>
          {line}
        </p>
      ))}
    </div>
  )
}

function classFor(tone: 'same' | 'added' | 'removed', heading: boolean): string {
  if (tone === 'added') return heading ? 'font-bold' : 'font-medium'

  const weight = heading ? 'font-bold ' : ''
  return tone === 'removed'
    ? `${weight}text-muted-foreground line-through decoration-muted-foreground/60`
    : `${weight}text-muted-foreground`
}
