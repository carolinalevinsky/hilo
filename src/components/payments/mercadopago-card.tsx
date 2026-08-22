'use client'

import { useActionState } from 'react'

import {
  connectMercadoPagoAction,
  disconnectMercadoPagoAction,
} from '@/app/(app)/cobros/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

/**
 * Connecting a Mercado Pago account.
 *
 * The token is typed once and never shown again — not masked, not partially
 * revealed, not fetched to check whether it is still there. The screen asks the
 * server "is an account connected?" and gets a yes or no; the credential itself
 * has no path back to a browser (see `mp_accounts` in the M6 migration).
 *
 * That is the whole of defect #1: v1 read this token into a page.
 */
export function MercadoPagoCard({ connected }: { connected: boolean }) {
  const [state, formAction, pending] = useActionState(
    connectMercadoPagoAction,
    EMPTY_FORM_STATE,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cobrar por Mercado Pago</CardTitle>
        <p className="text-[12.5px] text-muted-foreground">
          El dinero va directo a tu cuenta. Hilo sólo arma el link.
        </p>
      </CardHeader>

      <CardContent>
        {connected ? (
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-xl bg-green-soft px-3.5 py-2.5 text-[12.5px] text-[#1a8f57]">
              Tu cuenta está conectada. Podés mandar links de pago desde la tabla de abajo.
            </p>
            <form action={disconnectMercadoPagoAction}>
              <Button type="submit" variant="ghost" size="sm">
                Desconectar
              </Button>
            </form>
          </div>
        ) : (
          <form action={formAction} className="max-w-md space-y-3">
            {state.ok ? null : <FormMessage message={state.message} />}

            <div className="space-y-1.5">
              <Label htmlFor="accessToken">Access token de producción</Label>
              <Input
                id="accessToken"
                name="accessToken"
                type="password"
                autoComplete="off"
                placeholder="APP_USR-…"
                required
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Lo sacás de{' '}
                <a
                  href="https://www.mercadopago.com.uy/developers/panel/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet underline"
                >
                  tu panel de Mercado Pago
                </a>
                . Se guarda cifrado en el servidor y no vuelve a mostrarse. Ni a vos.
              </p>
            </div>

            <Button type="submit" disabled={pending}>
              {pending ? 'Conectando…' : 'Conectar cuenta'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
