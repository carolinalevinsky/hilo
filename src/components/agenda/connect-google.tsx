import { CalendarPlus } from '@/components/icons'

import { Button } from '@/components/ui/button'

/**
 * El aviso de que Google Calendar todavía no está conectado.
 *
 * Sólo aparece cuando no lo está: quien ya conectó no tiene por qué volver a
 * leer esto cada vez que abre la Agenda, y un cartel que no se puede hacer
 * desaparecer se vuelve parte del mobiliario a los tres días.
 *
 * Vive en la Agenda y no en el perfil porque es acá donde la falta se nota — la
 * semana está a la vista y no coincide con lo que tenés en el teléfono. El botón
 * arranca el permiso directo, sin pasar por otra pantalla.
 *
 * ─── Por qué dice lo que dice ─────────────────────────────────────────────
 *
 * Nombra la privacidad antes de que la profesional apriete, no después. Lo que
 * se manda a un servidor de Google, fuera del país, es una decisión sobre datos
 * de un paciente, y el momento de enterarse es antes de autorizar. Por defecto
 * el evento dice "Ocupado" y no el nombre de nadie; se cambia en Mi perfil.
 */
export function ConnectGoogle() {
  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet/30 bg-violet-soft px-4 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <CalendarPlus className="mt-0.5 size-[18px] shrink-0 text-violet" />
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold">Conectá tu Google Calendar</p>
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Tus sesiones aparecen en tu calendario, y si movés una desde el celular
            se mueve acá. El evento dice sólo “Ocupado” hasta que vos elijas otra
            cosa en Mi perfil; la nota de la sesión no sale nunca.
          </p>
        </div>
      </div>

      {/* Un enlace y no un botón con acción: el final del camino es una
          redirección al dominio de Google. */}
      <Button asChild size="sm" className="shrink-0">
        <a href="/api/google/conectar">Conectar</a>
      </Button>
    </div>
  )
}
