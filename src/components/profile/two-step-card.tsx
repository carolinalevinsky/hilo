'use client'

import { useActionState, useState, useTransition } from 'react'

import { confirmMfaAction, disableMfaAction, startMfaAction } from '@/app/(app)/perfil/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

/**
 * Activar o desactivar la verificación en dos pasos. Ver `src/server/mfa.ts`.
 *
 * Activar es en dos tiempos: el QR, y el primer código. Si se cierra la
 * pantalla en el medio no queda nada activado — un factor sin confirmar no
 * cuenta para nada, y el próximo intento lo borra.
 */
export function TwoStepCard({ enabled, factorId }: { enabled: boolean; factorId: string | null }) {
  const [enrolling, setEnrolling] = useState<{
    factorId: string
    qrCode: string
    secret: string
  } | null>(null)
  const [starting, startTransition] = useTransition()
  const [startError, setStartError] = useState<string | null>(null)
  const [confirmState, confirmAction, confirming] = useActionState(confirmMfaAction, EMPTY_FORM_STATE)
  const [disableState, disableAction, disabling] = useActionState(disableMfaAction, EMPTY_FORM_STATE)

  if (enabled && factorId) {
    return (
      <div className="space-y-3">
        <FormMessage message={confirmState.ok ? confirmState.message : null} ok />
        <FormMessage message={disableState.message} ok={disableState.ok} />
        <p className="text-body">
          <span className="font-semibold text-green-ink">Activada.</span> Para entrar te pedimos la
          contraseña y un código de tu app autenticadora.
        </p>
        <form action={disableAction}>
          <input type="hidden" name="factorId" value={factorId} />
          <Button type="submit" variant="outline" disabled={disabling}>
            Desactivar
          </Button>
        </form>
      </div>
    )
  }

  if (!enrolling) {
    return (
      <div className="space-y-3">
        <FormMessage message={disableState.ok ? disableState.message : null} ok />
        <FormMessage message={startError} />
        <p className="text-body leading-relaxed">
          Además de la contraseña, un código de 6 números que cambia cada 30 segundos, de una
          app como Google Authenticator o 1Password. Si alguien consigue tu contraseña, sin tu
          teléfono no entra.
        </p>
        <Button
          type="button"
          disabled={starting}
          onClick={() =>
            startTransition(async () => {
              setStartError(null)
              try {
                setEnrolling(await startMfaAction())
              } catch {
                setStartError('No pudimos empezar. Probá de nuevo en un rato.')
              }
            })
          }
        >
          {starting ? 'Preparando…' : 'Activar la verificación en dos pasos'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-body leading-relaxed">
        1. Abrí tu app autenticadora y escaneá este código. Si no podés escanearlo, cargá la clave
        a mano.
      </p>
      {/* Un SVG que arma Supabase, en data URL: no sale de la página. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={enrolling.qrCode}
        alt="Código QR para la app autenticadora"
        width={180}
        height={180}
        className="rounded-lg border bg-white p-2"
      />
      <p className="text-meta text-muted-foreground">
        Clave: <code className="font-mono break-all select-all">{enrolling.secret}</code>
      </p>

      <form action={confirmAction} className="space-y-3">
        <FormMessage message={confirmState.ok ? null : confirmState.message} />
        <input type="hidden" name="factorId" value={enrolling.factorId} />
        <div className="space-y-1.5">
          <Label htmlFor="mfa-code">2. Escribí el código que te muestra</Label>
          <Input
            id="mfa-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            className="max-w-[160px]"
            required
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={confirming}>
            {confirming ? 'Verificando…' : 'Confirmar y activar'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEnrolling(null)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
