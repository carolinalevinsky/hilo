import { Wallet } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { MercadoPagoCard } from '@/components/payments/mercadopago-card'
import { PaymentDialog } from '@/components/payments/payment-dialog'
import { PaymentLinkButton } from '@/components/payments/payment-link-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDayMonth } from '@/lib/dates'
import { currentPeriod, periodLabel, shiftPeriod } from '@/lib/periods'
import { requireUser } from '@/server/auth'
import { isMercadoPagoConnected } from '@/server/mercadopago'
import { listPatients } from '@/server/patients'
import { monthlyLedger } from '@/server/payments'

import { deletePaymentAction } from './actions'

export const metadata: Metadata = { title: 'Cobros · Hilo' }

const money = (value: number) =>
  `$ ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`

export default async function PaymentsPage({ searchParams }: PageProps<'/cobros'>) {
  const params = await searchParams
  const user = await requireUser()

  const now = currentPeriod()
  const requested = typeof params.mes === 'string' ? params.mes : now
  // Never a future month. There is nothing to collect for a month that has not
  // happened, and the arrows would otherwise walk forever into empty screens.
  const period = requested > now ? now : requested

  const [ledger, patients, mpConnected] = await Promise.all([
    monthlyLedger(user.id, period),
    listPatients(user.id),
    isMercadoPagoConnected(user.id),
  ])

  const patientOptions = patients.map((patient) => ({
    id: patient.id,
    full_name: patient.full_name,
  }))
  const phoneOf = new Map(patients.map((patient) => [patient.id, patient.phone]))

  return (
    <>
      <PageHeader
        title="Cobros"
        subtitle="Lo cobrado y lo pendiente, mes a mes."
        action={
          patients.length > 0 ? (
            <PaymentDialog period={period} patients={patientOptions} />
          ) : null
        }
      />

      {patients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="Todavía no hay cobros"
            text="Cargá un paciente con su honorario y acá vas a llevar el control de lo cobrado y lo pendiente, mes a mes."
            action={
              <Button asChild>
                <Link href="/pacientes/nuevo">Cargar mi primer paciente</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/cobros?mes=${shiftPeriod(period, -1)}`}>← Mes anterior</Link>
            </Button>
            <Button asChild variant={period === now ? 'secondary' : 'outline'} size="sm">
              <Link href="/cobros">Este mes</Link>
            </Button>
            {period < now ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/cobros?mes=${shiftPeriod(period, 1)}`}>Mes siguiente →</Link>
              </Button>
            ) : null}
            <span className="ml-1 text-[13px] font-bold">{periodLabel(period)}</span>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Total label="Cobrado" value={money(ledger.totalPaid)} tone="green" />
            <Total label="Pendiente" value={money(ledger.totalOutstanding)} tone="amber" />
            <Total label="Esperado" value={money(ledger.totalExpected)} tone="muted" />
          </div>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Por paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {ledger.rows.map((row) => (
                  <li key={row.patientId} className="flex flex-wrap items-center gap-3 py-3">
                    <PatientAvatar
                      fullName={row.fullName}
                      color={row.color}
                      size={36}
                    />

                    <div className="min-w-[140px] flex-1">
                      <p className="text-[13.5px] font-bold">{row.fullName}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {row.expected === null
                          ? 'Sin honorario cargado'
                          : `${money(row.paid)} de ${money(row.expected)}`}
                        {row.payments.length > 0
                          ? ` · ${row.payments
                              .map((payment) => formatDayMonth(payment.paid_on))
                              .join(', ')}`
                          : ''}
                      </p>
                    </div>

                    <Status row={row} />

                    <div className="flex flex-wrap gap-1.5">
                      {mpConnected && row.outstanding !== null && row.outstanding > 0 ? (
                        <PaymentLinkButton
                          patientId={row.patientId}
                          patientName={row.fullName}
                          patientPhone={phoneOf.get(row.patientId) ?? null}
                          period={period}
                          periodName={periodLabel(period)}
                          amount={row.outstanding}
                        />
                      ) : null}

                      <PaymentDialog
                        period={period}
                        patients={patientOptions}
                        defaultPatientId={row.patientId}
                        defaultAmount={
                          row.outstanding !== null && row.outstanding > 0
                            ? row.outstanding
                            : null
                        }
                        trigger={
                          <Button size="sm" variant="ghost">
                            Registrar pago
                          </Button>
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <MercadoPagoCard connected={mpConnected} />

          {ledger.rows.some((row) => row.payments.length > 0) ? (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Pagos de {periodLabel(period).toLowerCase()}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {ledger.rows
                    .flatMap((row) => row.payments)
                    .map((payment) => (
                      <li
                        key={payment.id}
                        className="flex items-center justify-between gap-2 py-2 text-[13px]"
                      >
                        <span>
                          <b>{payment.patients?.full_name}</b> · {money(Number(payment.amount))}{' '}
                          · {formatDayMonth(payment.paid_on)}
                          {payment.note ? ` · ${payment.note}` : ''}
                        </span>
                        <form action={deletePaymentAction}>
                          <input type="hidden" name="paymentId" value={payment.id} />
                          <Button type="submit" variant="ghost" size="xs">
                            Quitar
                          </Button>
                        </form>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </>
  )
}

function Total({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'green' | 'amber' | 'muted'
}) {
  const classes = {
    green: 'bg-green-soft text-[#1a8f57]',
    amber: 'bg-amber-soft text-[#8a5a12]',
    muted: 'bg-card text-foreground',
  }[tone]

  return (
    <div className={`rounded-lg px-4 py-3 shadow-card ${classes}`}>
      <p className="text-[12px] font-bold uppercase opacity-75">{label}</p>
      <p className="text-[22px] font-extrabold tracking-[-0.5px]">{value}</p>
    </div>
  )
}

/**
 * A patient with no fee on record shows "sin honorario", not "al día". A blank
 * to fill in and a settled account are different things, and conflating them is
 * how a month quietly looks collected when it is not.
 */
function Status({ row }: { row: { expected: number | null; outstanding: number | null } }) {
  if (row.expected === null) {
    return (
      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
        Sin honorario
      </span>
    )
  }

  if ((row.outstanding ?? 0) <= 0) {
    return (
      <span className="rounded-full bg-green-soft px-2.5 py-1 text-[11px] font-bold text-[#1a8f57]">
        Al día
      </span>
    )
  }

  return (
    <span className="rounded-full bg-amber-soft px-2.5 py-1 text-[11px] font-bold text-[#8a5a12]">
      Debe {`$ ${row.outstanding!.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`}
    </span>
  )
}
