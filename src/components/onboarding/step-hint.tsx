import Link from 'next/link'

import type { StepHintName } from '@/lib/first-steps'

/**
 * "Acá tenés esto, y se hace así." What a real screen says to somebody who
 * arrived from "Primeros pasos".
 *
 * The card on Inicio used to do each step itself, with a small form of its own.
 * That taught a way of loading a patient, scheduling and writing a record that
 * exists nowhere else in the product — and let somebody write up a session that
 * had never been scheduled. Now each step opens the screen where the thing is
 * always done, and this strip is the only thing that is different about it: one
 * sentence on what to do here, and the way back.
 *
 * Which sentence comes from `?pasos=` (`src/lib/first-steps.ts`). Without it the
 * screen is exactly the one everybody else sees.
 */
const HINTS: Record<StepHintName, { step: number; text: string }> = {
  paciente: {
    step: 1,
    text: 'Esta es la ficha de alta, la misma que vas a usar siempre. Con el nombre y un teléfono alcanza. Si ya sabés qué van a trabajar y qué día viene, ponelo acá y la sesión aparece sola en tu Agenda.',
  },
  planificar: {
    step: 2,
    text: 'Acá armás la sesión que viene. Ombúa te sugiere los objetivos del paciente y materiales de tu biblioteca: tocá “Agregar” en uno y queda en el plan.',
  },
  pagos: {
    step: 3,
    text: 'Acá vas a ver quién pagó y quién debe, mes a mes. Cada pago lo anotás cuando llega, y el mes se cuenta solo.',
  },
}

export function StepHint({ name }: { name: StepHintName | null }) {
  if (!name) return null
  const { step, text } = HINTS[name]

  return (
    <div
      role="note"
      className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl bg-violet-soft px-4 py-3 text-body leading-relaxed text-violet"
    >
      <p className="min-w-[220px] flex-1">
        <b>Primeros pasos · {step} de 3.</b> {text}
      </p>
      <Link href="/inicio" className="shrink-0 font-bold hover:underline">
        Volver a Inicio →
      </Link>
    </div>
  )
}
