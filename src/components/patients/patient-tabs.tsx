'use client'

import { useRef, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

/**
 * La ficha de un paciente, en pestañas, sólo en el teléfono.
 *
 * En escritorio la ficha son dos columnas y se ve casi entera de un vistazo. En
 * un teléfono esas dos columnas se apilaban en una tira de 2.700 px: para llegar
 * a los registros de sesiones había que pasar por la evolución, los objetivos,
 * la próxima sesión y los informes, y los botones de archivar y borrar al
 * paciente quedaban arriba de todo eso. Nadie encuentra nada en una pantalla que
 * mide tres pantallas y media.
 *
 * Cuatro y no más: con cinco ("Informes" aparte) la última quedaba cortada en
 * un teléfono de 390 px, y una pestaña que no se ve no existe. Los informes van
 * en "Historial", con los registros de sesiones: las dos cosas son lo que ya
 * se escribió sobre el paciente.
 *
 * Las pestañas no mueven ninguna tarjeta: cada una lleva `data-section` y una
 * regla de `globals.css` esconde las que no corresponden a la pestaña elegida,
 * sólo por debajo de `lg`. Así el escritorio queda exactamente como estaba y
 * las tarjetas siguen siendo Server Components.
 */

export const PATIENT_SECTIONS = ['resumen', 'objetivos', 'historial', 'datos'] as const
export type PatientSection = (typeof PATIENT_SECTIONS)[number]

const LABELS: Record<PatientSection, string> = {
  resumen: 'Resumen',
  objetivos: 'Objetivos',
  historial: 'Historial',
  datos: 'Datos',
}

/**
 * Anclas que ya existen en la app y apuntan adentro de una pestaña. `#objetivos`
 * lo usan Inicio y la Agenda para llevarte a mover el avance.
 */
const HASH_TO_SECTION: Record<string, PatientSection> = {
  resumen: 'resumen',
  objetivos: 'objetivos',
  historial: 'historial',
  sesiones: 'historial',
  informes: 'historial',
  datos: 'datos',
}

export function PatientTabs({
  counts,
  children,
}: {
  counts: Partial<Record<PatientSection, number>>
  children: React.ReactNode
}) {
  // La pestaña vive en el ancla de la URL (`#historial`), no en un estado
  // propio: así un link desde otra pantalla abre la pestaña justa, y al
  // recargar volvés a donde estabas. En el servidor no hay ancla, y por eso el
  // tercer argumento: la primera pintura es "Resumen" y no hay desajuste.
  const hash = useSyncExternalStore(subscribeToHash, readHash, () => '')
  const tab = HASH_TO_SECTION[hash] ?? 'resumen'
  const barRef = useRef<HTMLDivElement>(null)

  function choose(next: PatientSection) {
    // `replaceState` y no `location.hash =`: este último salta a la tarjeta
    // con ese id (`#objetivos` existe) y deja una entrada por pestaña en el
    // historial, así que "atrás" recorría pestañas en vez de salir.
    window.history.replaceState(window.history.state, '', `#${next}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    // Si ya bajaste, la pestaña nueva arranca donde arrancan las pestañas, no
    // a mitad de la anterior.
    const bar = barRef.current
    if (bar && bar.getBoundingClientRect().top <= 60) {
      bar.scrollIntoView({ block: 'start' })
    }
  }

  return (
    <>
      <div
        ref={barRef}
        role="tablist"
        aria-label="Secciones de la ficha"
        className="sticky top-[calc(52px+env(safe-area-inset-top))] z-40 -mx-3.5 mb-3 flex scroll-mt-[calc(52px+env(safe-area-inset-top))] gap-1 overflow-x-auto border-b border-border bg-background/95 px-3.5 backdrop-blur-md [scrollbar-width:none] lg:hidden"
      >
        {PATIENT_SECTIONS.map((section) => (
          <button
            key={section}
            type="button"
            role="tab"
            aria-selected={tab === section}
            onClick={() => choose(section)}
            className={cn(
              '-mb-px flex flex-1 shrink-0 items-center justify-center gap-1 border-b-2 px-1.5 py-3 text-body font-semibold whitespace-nowrap transition-colors',
              tab === section
                ? 'border-violet text-violet'
                : 'border-transparent text-muted-foreground',
            )}
          >
            {LABELS[section]}
            {counts[section] ? (
              <span
                className={cn(
                  'rounded-full px-1.5 text-micro leading-[18px]',
                  tab === section ? 'bg-violet-soft' : 'bg-muted',
                )}
              >
                {counts[section]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div data-patient-tab={tab}>{children}</div>
    </>
  )
}

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function readHash() {
  return window.location.hash.slice(1)
}
