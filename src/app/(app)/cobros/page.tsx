import { Check, Clock, DollarSign, Users, Wallet } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { StepHint } from '@/components/onboarding/step-hint'
import { PageHeader } from '@/components/page-header'
import { PeriodBar } from '@/components/period-bar'
import { PeriodNav } from '@/components/period-nav'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { BillingDialog } from '@/components/payments/billing-dialog'
import { PaymentDialog } from '@/components/payments/payment-dialog'
import { StatCard, StatCardGrid } from '@/components/stat-card'
import { ConfirmAction } from '@/components/confirm-action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDayMonth } from '@/lib/dates'
import { readStepHint } from '@/lib/first-steps'
import { currentPeriod, periodLabel, shiftPeriod } from '@/lib/periods'
import { listPatients } from '@/server/patients'
import { monthlyLedger } from '@/server/payments'

import { trashPaymentAction } from './actions'
import { currentUser } from '../session'
import { pageTitle } from '@/lib/brand'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: pageTitle('Pagos') }

const money = (value: number) =>
  `$ ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`

export default async function PaymentsPage({ searchParams }: PageProps<'/cobros'>) {
  const params = await searchParams
  const user = await currentUser()

  const now = currentPeriod()
  const requested = typeof params.mes === 'string' ? params.mes : now
  // Never a future month. There is nothing to collect for a month that has not
  // happened, and the arrows would otherwise walk forever into empty screens.
  const period = requested > now ? now : requested

  const [ledger, patients] = await Promise.all([
    monthlyLedger(user.id, period),
    listPatients(user.id),
  ])

  // "Pagaron 3/5" counts people, not money: how many patients have paid
  // something this month, which is the question you actually ask before chasing
  // anyone. v1 counted it the same way (`legacy/index.html:2380`).
  // Los dos números sobre la misma gente: los pacientes activos. El de arriba
  // contaba también a archivados y borrados que habían pagado ese mes, y el de
  // abajo sólo a los activos, así que podía decir "Pagaron 5/4".
  const current = ledger.rows.filter((row) => !row.archived && !row.deleted)
  const paidCount = current.filter((row) => row.paid > 0).length

  const patientOptions = patients.map((patient) => ({
    id: patient.id,
    full_name: patient.full_name,
  }))

  return (
    <>
      {/* "Primeros pasos" sends its third step here, with a line on top. */}
      <StepHint name={readStepHint(params.pasos, ['pagos'])} />

      <PageHeader
        title="Pagos"
        subtitle="Lo pagado y lo pendiente, mes a mes."
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
            title="Todavía no hay pagos"
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
          {/* La misma barra que la Agenda en escritorio. Sin el "Mes actual"
              chiquito que había debajo: el botón de la derecha ya lo dice, y
              apagado cuando ya estás ahí. */}
          <PeriodBar
            className="mb-3 sm:hidden"
            prevHref={`/cobros?mes=${shiftPeriod(period, -1)}`}
            nextHref={period < now ? `/cobros?mes=${shiftPeriod(period, 1)}` : undefined}
            label={periodLabel(period)}
            resetHref="/cobros"
            resetLabel="Este mes"
            isCurrent={period === now}
          />
          <div className="mb-4 flex items-center gap-3 max-sm:hidden">
            <PeriodNav
              prevHref={`/cobros?mes=${shiftPeriod(period, -1)}`}
              nextHref={period < now ? `/cobros?mes=${shiftPeriod(period, 1)}` : undefined}
              resetHref="/cobros"
              label={periodLabel(period)}
              isCurrent={period === now}
              resetLabel="Este mes"
            />
          </div>

          {/* v1's three, in v1's order (`legacy/index.html:2435-2439`). There is
              no "Esperado" card because it is just these two added together, and
              a third number that restates the first two makes the row harder to
              read, not more informative. */}
          <StatCardGrid className="lg:grid-cols-3">
            <StatCard
              icon={DollarSign}
              tone="green"
              value={money(ledger.totalPaid)}
              label="Pagado"
            />
            <StatCard
              icon={Clock}
              tone="amber"
              value={money(ledger.totalOutstanding)}
              label="Pendiente"
            />
            <StatCard
              icon={Users}
              tone="violet"
              value={`${paidCount}/${current.length}`}
              label="Pagaron"
            />
          </StatCardGrid>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Por paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {ledger.rows.map((row) => (
                  // En teléfono, todas las filas con la misma forma: la cara, el
                  // nombre con el estado debajo —en color, como texto— y un
                  // solo grupo de botones a la derecha, centrado. La etiqueta
                  // de estado apilada arriba de los botones hacía cada fila de
                  // un alto distinto y la columna de la derecha no se alineaba
                  // con nada.
                  <li
                    key={row.patientId}
                    className="flex items-center gap-3 py-2.5 sm:flex-wrap sm:py-3"
                  >
                    <PatientAvatar
                      fullName={row.fullName}
                      color={row.color}
                      size={36}
                      className="max-sm:size-8!"
                    />

                    <div className="min-w-0 flex-1 sm:min-w-[140px]">
                      <p className="text-body font-bold">
                        {row.fullName}
                        {/* Dicho, y no sólo insinuado por la fila más apagada:
                            si el mes cierra con una cifra que no cuadra, esto
                            es lo que la explica. */}
                        {row.deleted ? (
                          <span className="ml-2 align-middle rounded-full bg-muted px-2 py-0.5 text-micro font-bold text-muted-foreground">
                            Borrado
                          </span>
                        ) : row.archived ? (
                          <span className="ml-2 align-middle rounded-full bg-muted px-2 py-0.5 text-micro font-bold text-muted-foreground">
                            Archivado
                          </span>
                        ) : null}
                      </p>
                      {/* Sin honorario la fila decía "Sin honorario cargado" acá
                          y "Sin honorario" en la etiqueta de al lado: lo mismo,
                          dos veces, a dos centímetros. Queda la etiqueta —que es
                          la que se lee de un vistazo bajando la lista— y esta
                          línea pasa a ser lo único que falta hacer. */}
                      <MobileStatus row={row} money={money} />
                      <p className="text-meta text-muted-foreground max-sm:hidden">
                        {row.archived || row.deleted ? (
                          `${money(row.paid)} cobrado`
                        ) : row.expected === null ? (
                          <BillingDialog
                            patientId={row.patientId}
                            patientName={row.fullName}
                            sessionFee={row.billing.sessionFee}
                            billingFrequency={row.billing.frequency}
                            expectedSessionsPerMonth={row.billing.expectedSessionsPerMonth}
                            trigger={
                              <button
                                type="button"
                                className="font-semibold text-violet underline"
                              >
                                Cargar el honorario
                              </button>
                            }
                          />
                        ) : (
                          `${money(row.paid)} de ${money(row.expected)}`
                        )}
                        {/* En teléfono sin las fechas: partían el renglón en dos, y
                            están en "Pagos de este mes", abajo. */}
                        {row.payments.length > 0 ? (
                          <span className="max-sm:hidden">
                            {` · ${row.payments
                              .map((payment) => formatDayMonth(payment.paid_on))
                              .join(', ')}`}
                          </span>
                        ) : null}
                      </p>
                    </div>

                    <div className="max-sm:hidden">
                      <Status row={row} />
                    </div>

                    {/* Nothing to do on a deleted patient's row: the payments are
                        history, and there is nobody to charge or bill anymore. */}
                    {row.deleted ? null : (
                    <div className="flex shrink-0 items-center gap-1 sm:flex-wrap sm:gap-1.5">
                      {/* Sin honorario, en teléfono el botón de la derecha es
                          cargarlo: el mismo lugar que el tic de pago en las
                          demás filas, en vez de un link subrayado abajo
                          del nombre y tres puntos sueltos. */}
                      {row.expected === null && !row.archived ? (
                        <BillingDialog
                          patientId={row.patientId}
                          patientName={row.fullName}
                          sessionFee={row.billing.sessionFee}
                          billingFrequency={row.billing.frequency}
                          expectedSessionsPerMonth={row.billing.expectedSessionsPerMonth}
                          trigger={
                            <Button size="sm" variant="outline" className="sm:hidden">
                              Cargar honorario
                            </Button>
                          }
                        />
                      ) : null}

                      {/* Sin honorario no hay pago que registrar acá: "Registrar
                          pago" abriría un diálogo que no sabe de cuánto, al lado
                          de una etiqueta que ya dice que falta el número. Se
                          ofrece cargar el honorario, arriba, y nada se pierde —
                          el "Registrar pago" del encabezado sigue estando, con
                          su lista de pacientes, para el pago suelto de alguien a
                          quien todavía no le pusiste arancel. */}
                      {row.expected === null && !row.archived ? null : (
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
                            // `outline` y no `ghost`: sin borde, en teléfono era
                            // una palabra suelta y no se leía como un botón.
                            // En teléfono, un tic: "anotar que pagó", que es lo
                            // que se viene a hacer acá, en un botón cuadrado que
                            // deja el nombre con todo el ancho. Abre el mismo
                            // diálogo, con el monto que falta ya puesto.
                            <Button
                              size="sm"
                              variant="outline"
                              aria-label={`Registrar pago de ${row.fullName}`}
                              title="Registrar pago"
                              className={cn(
                                'max-sm:size-9 max-sm:p-0',
                                // Al día, el tic ya está "puesto": verde lleno,
                                // que se lee de lejos bajando la lista. Se
                                // puede tocar igual, para un pago adelantado.
                                row.expected !== null &&
                                  (row.outstanding ?? 0) <= 0 &&
                                  'max-sm:border-green max-sm:bg-green max-sm:text-white max-sm:hover:bg-green/90',
                              )}
                            >
                              <Check
                                className={cn(
                                  'size-4 sm:hidden',
                                  row.expected !== null && (row.outstanding ?? 0) <= 0
                                    ? 'text-white'
                                    : 'text-green-ink',
                                )}
                              />
                              <span className="max-sm:hidden">Registrar pago</span>
                            </Button>
                          }
                        />
                      )}

                      {/* v1's `···` (`legacy/index.html:2421`): the fee and the
                          frequency, edited from the row you are already
                          reading. */}
                      <span className={cn('flex', row.expected === null && !row.archived && 'max-sm:hidden')}>
                        <BillingDialog
                          patientId={row.patientId}
                          patientName={row.fullName}
                          sessionFee={row.billing.sessionFee}
                          billingFrequency={row.billing.frequency}
                          expectedSessionsPerMonth={row.billing.expectedSessionsPerMonth}
                        />
                      </span>
                    </div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

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
                        className="flex items-center justify-between gap-2 py-2 text-body"
                      >
                        <span>
                          <b>{payment.patients?.full_name}</b> · {money(Number(payment.amount))}{' '}
                          · {formatDayMonth(payment.paid_on)}
                          {payment.note ? ` · ${payment.note}` : ''}
                        </span>
                        <ConfirmAction
                          action={trashPaymentAction}
                          fields={{ paymentId: payment.id }}
                          trigger="Quitar"
                          title="¿Quitar este pago?"
                          description={`${money(Number(payment.amount))} de ${payment.patients?.full_name ?? 'este paciente'}. Va a la papelera: deja de contar en el mes, y lo podés recuperar desde la ficha del paciente.`}
                          confirmLabel="Quitar el pago"
                        />
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

/**
 * El estado de la fila en teléfono, como texto en color debajo del nombre, en
 * lugar de la etiqueta de `Status`. Dice lo mismo con las mismas palabras; lo
 * que cambia es que no ocupa una columna propia.
 */
function MobileStatus({
  row,
  money,
}: {
  row: {
    expected: number | null
    outstanding: number | null
    paid: number
    archived?: boolean
    deleted?: boolean
  }
  money: (value: number) => string
}) {
  const base = 'text-meta sm:hidden'
  if (row.archived || row.deleted) {
    return <p className={cn(base, 'text-muted-foreground')}>{money(row.paid)} cobrado</p>
  }
  if (row.expected === null) {
    return <p className={cn(base, 'text-muted-foreground')}>Sin honorario</p>
  }
  if ((row.outstanding ?? 0) <= 0) {
    return (
      <p className={cn(base, 'text-muted-foreground')}>
        <span className="font-semibold text-green-ink">Al día</span> · {money(row.paid)}
      </p>
    )
  }
  return (
    <p className={cn(base, 'text-muted-foreground')}>
      <span className="font-semibold text-amber-ink">Debe {money(row.outstanding!)}</span>
      {row.paid > 0 ? ` · pagó ${money(row.paid)}` : null}
    </p>
  )
}

/**
 * A patient with no fee on record shows "sin honorario", not "al día". A blank
 * to fill in and a settled account are different things, and conflating them is
 * how a month quietly looks collected when it is not.
 */
function Status({
  row,
}: {
  row: { expected: number | null; outstanding: number | null; deleted?: boolean }
}) {
  // A deleted patient's row already says "Borrado" and what they paid; "Sin
  // honorario" beside it would ask for a fee nobody is going to charge.
  if (row.deleted) return null

  if (row.expected === null) {
    return (
      <span className="rounded-full bg-muted px-2.5 py-1 text-micro font-bold text-muted-foreground">
        Sin honorario
      </span>
    )
  }

  if ((row.outstanding ?? 0) <= 0) {
    return (
      <span className="rounded-full bg-green-soft px-2.5 py-1 text-micro font-bold text-green-ink">
        Al día
      </span>
    )
  }

  return (
    <span className="rounded-full bg-amber-soft px-2.5 py-1 text-micro font-bold text-amber-ink">
      Debe {`$ ${row.outstanding!.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`}
    </span>
  )
}
