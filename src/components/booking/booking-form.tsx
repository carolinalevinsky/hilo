'use client'

import { useState } from 'react'

import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { today } from '@/lib/dates'

/**
 * The form a family fills in.
 *
 * Two required fields — a name and a phone — because this is a request for a
 * call back, not a registration. Everything else is a preference the
 * practitioner will confirm anyway.
 *
 * It posts to `/api/reservas` rather than to a Server Action so that the route
 * handler can read `x-forwarded-for` for the rate limit and return a 429 the
 * form can show. The slug goes in the body; the practitioner it resolves to is
 * decided on the server.
 */
export function BookingForm({ slug, practitionerName }: { slug: string; practitionerName: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setError(null)

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        name: formData.get('name'),
        patientName: formData.get('patientName'),
        phone: formData.get('phone'),
        preferredDate: formData.get('preferredDate'),
        preferredTime: formData.get('preferredTime'),
        note: formData.get('note'),
      }),
    }).catch(() => null)

    // The body has to say so, not just the status. A 200 with an HTML page in
    // it is what a redirect looks like from here, and treating that as success
    // told a family their request had arrived when nothing was saved.
    const payload = (await response?.json().catch(() => null)) as
      | { ok?: boolean; error?: string }
      | null

    if (!response?.ok || payload?.ok !== true) {
      setError(payload?.error ?? 'No pudimos enviar tu solicitud. Probá de nuevo.')
      setStatus('idle')
      return
    }

    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl bg-green-soft px-4 py-5 text-center">
        <p className="text-lead font-bold text-[#1a8f57]">¡Listo, llegó tu solicitud!</p>
        <p className="mt-1.5 text-body leading-relaxed text-[#1a8f57]">
          {/* "Te vamos a escribir" prometía algo en nombre de Ombúa, que no
              escribe: escribe ella. */}
          {practitionerName} te va a escribir al teléfono que dejaste para confirmar el día
          y la hora.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormMessage message={error} />

      <div className="space-y-1.5">
        <Label htmlFor="name">Tu nombre y apellido</Label>
        <Input id="name" name="name" autoComplete="name" required />
      </div>

      {/* Quien llena esto casi siempre es la madre o el padre, y "Convertir en
          paciente" ponía ese nombre en la ficha del niño. */}
      <div className="space-y-1.5">
        <Label htmlFor="patientName">
          ¿Para quién es la consulta?
          <span className="font-normal text-muted-foreground"> · si no es para vos</span>
        </Label>
        <Input
          id="patientName"
          name="patientName"
          autoComplete="off"
          maxLength={120}
          placeholder="Por ejemplo, el nombre de tu hijo o hija"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="Ej: 099 123 456"
          autoComplete="tel"
          required
        />
      </div>

      {/* A date, not a weekday (P7): "martes" did not say which Tuesday, and a
          first interview is one appointment on one day. Quarter hours, because
          nobody books the 14:37 — `step` makes the browser say so before
          sending, and `PublicBooking` says it again on the server. */}
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="mb-1.5 text-sm font-medium">
          ¿Qué día y a qué hora te queda mejor?
          <span className="font-normal text-muted-foreground"> ·&nbsp;opcional</span>
        </legend>

        <div className="space-y-1.5">
          <Label htmlFor="preferredDate" className="sr-only">
            Fecha
          </Label>
          <Input id="preferredDate" name="preferredDate" type="date" min={today()} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferredTime" className="sr-only">
            Hora
          </Label>
          <Input id="preferredTime" name="preferredTime" type="time" step={900} />
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="note" className="block leading-snug">
          ¿Nos contás un poco?
          <span className="font-normal text-muted-foreground"> ·&nbsp;opcional</span>
        </Label>
        <Textarea
          id="note"
          name="note"
          rows={3}
          maxLength={500}
          placeholder="Por qué consultás, quién te derivó, lo que quieras."
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando…' : 'Pedir un turno'}
      </Button>

      <p className="text-center text-micro leading-relaxed text-muted-foreground">
        {/* Decía "No los compartimos con nadie más", y la nota viaja por
            correo y, si se convierte en paciente, llega al contexto de la IA.
            Esto dice lo que pasa y dónde leer el resto. */}
        Tus datos le llegan a quien te va a atender, a través de Ombúa. Cómo se guardan y con
        qué proveedores:{' '}
        <a href="/privacidad" target="_blank" className="underline">
          Política de Privacidad
        </a>
        .
      </p>
    </form>
  )
}
