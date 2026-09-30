/**
 * Borrador, firmado o anulado, al lado del nombre de un documento en una lista.
 *
 * Lo que más se pregunta mirando la lista de un paciente antes de una reunión
 * es "¿esto ya lo firmé?". Los colores son los oscuros de cada tono, no los
 * claros: un rótulo que no se lee no contesta nada.
 */
export function DocumentStateBadge({
  row,
}: {
  row: { signed_at: string | null; voided_at: string | null }
}) {
  const state = row.voided_at ? 'voided' : row.signed_at ? 'signed' : 'draft'

  if (state === 'signed') {
    return (
      <span className="shrink-0 rounded-full bg-green-soft px-2 py-0.5 text-micro font-bold text-[#1a6b43]">
        Firmado
      </span>
    )
  }
  if (state === 'voided') {
    return (
      <span className="shrink-0 rounded-full bg-coral-soft px-2 py-0.5 text-micro font-bold text-[#a3301f]">
        Anulado
      </span>
    )
  }
  return (
    <span className="shrink-0 rounded-full border border-dashed border-foreground/35 px-2 py-0.5 text-micro font-bold text-foreground/75">
      Borrador
    </span>
  )
}
