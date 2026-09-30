import { restoreFromTrashAction } from '@/app/(app)/trash-actions'
import { ArchiveRestore } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/dates'
import type { TrashItem } from '@/server/trash'

/**
 * La papelera de un paciente: lo que se apartó y se puede recuperar.
 *
 * No aparece si está vacía. Vive en la ficha y no en una pantalla aparte
 * porque la pregunta que la trae es siempre sobre alguien: "¿dónde quedó el
 * registro de Tomás del martes?".
 *
 * Recuperar no pregunta: se deshace mandándolo de nuevo a la papelera.
 */

const KIND_LABEL: Record<TrashItem['kind'], string> = {
  session: 'Registro de sesión',
  report: 'Informe',
  assessment: 'Evaluación',
  payment: 'Pago',
}

function describe(item: TrashItem) {
  if (item.kind === 'payment') {
    const amount = Number(item.label).toLocaleString('es-UY', { maximumFractionDigits: 0 })
    return `$ ${amount}`
  }
  return item.label.trim() || 'Sin texto'
}

export function TrashCard({ patientId, items }: { patientId: string; items: TrashItem[] }) {
  if (items.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Papelera</CardTitle>
        <p className="text-meta text-muted-foreground">
          Lo que mandaste a la papelera. No se borra nunca: podés recuperarlo cuando quieras.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={`${item.kind}:${item.id}`} className="flex items-start gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-meta font-bold">
                  {KIND_LABEL[item.kind]} · {formatDate(item.happened_on)}
                </p>
                <p className="line-clamp-2 text-meta text-muted-foreground">{describe(item)}</p>
              </div>
              <form action={restoreFromTrashAction}>
                <input type="hidden" name="kind" value={item.kind} />
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="patientId" value={patientId} />
                <Button type="submit" variant="outline" size="sm">
                  <ArchiveRestore className="size-4" />
                  Recuperar
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
