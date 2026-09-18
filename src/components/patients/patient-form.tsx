'use client'

import { useActionState, useState } from 'react'

import { createPatientAction, updatePatientAction } from '@/app/(app)/pacientes/actions'
import { FormMessage } from '@/components/auth/form-message'
import { PhotoPicker } from '@/components/patients/photo-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { NEW_PATIENT_FREQUENCY_LABELS } from '@/lib/appointment-labels'
import {
  AGE_GROUP_LABELS,
  BILLING_FREQUENCY_LABELS,
  GUARDIAN_RELATIONSHIP_LABELS,
} from '@/lib/patient-labels'
import { QUARTER_HOURS, WEEK_ORDER, weekdayName } from '@/lib/week'
import type { Patient } from '@/server/patients'

/**
 * One form for creating and for editing. The fields, their order, and their
 * wording come from v1's "Nuevo paciente" modal (`legacy/index.html:693`) —
 * which is worth keeping verbatim, because the order matches how a practitioner
 * actually receives the information.
 *
 * A page rather than a modal: this is long enough that on a phone a modal means
 * scrolling inside a scroll, and a page can be linked to.
 *
 * **Lo obligatorio se marca una vez.** Antes cada campo que no lo era decía
 * "· opcional" al lado del nombre: nueve veces la misma palabra, una por campo,
 * y los dos que sí hacían falta no decían nada. Ahora el asterisco marca los
 * dos, una línea lo explica arriba, y el resto de las etiquetas quedan limpias.
 */
export function PatientForm({
  patient,
  photoUrl,
}: {
  patient?: Patient
  photoUrl?: string | null
}) {
  const editing = Boolean(patient)
  const [state, formAction, pending] = useActionState(
    editing ? updatePatientAction : createPatientAction,
    EMPTY_FORM_STATE,
  )

  // La población decide qué preguntas tienen sentido más abajo, así que es lo
  // único del formulario que el cliente necesita saber.
  const [ageGroup, setAgeGroup] = useState<string>(patient?.age_group ?? 'children')
  // Un adolescente puede venir solo. Arranca en "sí" para quien todavía no
  // existe, y en lo que diga la ficha para quien ya está cargado.
  const [hasGuardian, setHasGuardian] = useState(!patient || Boolean(patient.guardian_name))
  const [frequency, setFrequency] = useState('weekly')
  const [weekday, setWeekday] = useState('1')

  const showsGuardian = ageGroup !== 'adults' && (ageGroup !== 'adolescents' || hasGuardian)

  /**
   * Un solo campo que vive en dos lugares: arriba con el paciente cuando viene
   * solo, y adentro del bloque del responsable cuando hay un adulto a cargo —
   * que es cuando el número es de él, y cuando se completa junto con su nombre.
   *
   * Controlado, y por eso: cambiar la población lo mueve de un lugar al otro, y
   * un campo que se desmonta y se vuelve a montar arranca vacío. El valor vive
   * acá, así que el número escrito sigue estando después de la mudanza.
   */
  const [phone, setPhone] = useState(patient?.phone ?? '')
  const phoneField = (
    <Field
      label={showsGuardian ? 'Teléfono del responsable' : 'Teléfono'}
      htmlFor="phone"
      required
    >
      <Input
        id="phone"
        name="phone"
        type="tel"
        required
        placeholder="Ej: 099 123 456"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
      />
    </Field>
  )

  return (
    <form action={formAction} className="space-y-6">
      {patient ? <input type="hidden" name="patientId" value={patient.id} /> : null}

      <FormMessage message={state.message} />

      <PhotoPicker currentUrl={photoUrl} />

      {/* One column on a phone, two from `sm`, three from `xl` — the same
          progression the wide list screens use (`/pacientes`, `/materiales`).
          The DOM order never changes, so the phone still reads in the order a
          practitioner receives the information; the wider breakpoints only
          decide how many of those fields share a row.

          The spans below are what keeps the three-column rows from breaking
          into ragged halves: at `xl` the patient's own data fills two rows and
          the long text fields take two thirds each. */}
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Sin `col-span`: el nombre ocupaba dos columnas y dejaba la grilla
            corrida por uno, así que el último campo de la sección —Mutualista—
            terminaba solo, con un hueco al lado que parecía un error. Con todos
            los campos del mismo ancho las filas cierran, y media fila alcanza
            de sobra para un nombre. */}
        <Field label="Nombre y apellido" htmlFor="fullName" required>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={patient?.full_name}
            required
            autoFocus={!editing}
          />
        </Field>

        <Field label="Fecha de nacimiento" htmlFor="dateOfBirth">
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={patient?.date_of_birth ?? ''}
          />
        </Field>

        <Field label="Población" htmlFor="ageGroup">
          <NativeSelect
            id="ageGroup"
            name="ageGroup"
            value={ageGroup}
            onChange={(event) => setAgeGroup(event.target.value)}
          >
            {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </Field>

        {/* El teléfono, cuando el paciente lo contesta él mismo. Cuando hay un
            adulto a cargo el campo no está acá: está abajo, adentro del bloque
            del responsable, que es de quien es ese número. Ver `phoneField`. */}
        {showsGuardian ? null : phoneField}

        {/* Las dos preguntas de la escuela, escondidas con adultos por lo mismo
            que el responsable: "Colegio / escuela" y "Grado o nivel" son
            preguntas de escolaridad, y a una persona de cuarenta años no le
            corresponden. Se esconden, no se desmontan, así que a quien ya las
            tenía cargadas no se le borran.

            El grado no sale de la edad, aunque lo parezca: se repite, se entra
            tarde, hay escuela especial, y la fecha de nacimiento es opcional
            —sin ella no hay edad de la que deducir nada—. Además es lo que se
            lee al lado de la sesión y arriba del informe. */}
        <Field
          label="Colegio / escuela"
          htmlFor="school"
          className={ageGroup === 'adults' ? 'hidden' : undefined}
        >
          <Input id="school" name="school" defaultValue={patient?.school ?? ''} />
        </Field>

        <Field
          label="Grado o nivel"
          htmlFor="schoolLevel"
          className={ageGroup === 'adults' ? 'hidden' : undefined}
        >
          <Input
            id="schoolLevel"
            name="schoolLevel"
            placeholder="Ej: 2º escolar"
            defaultValue={patient?.school_level ?? ''}
          />
        </Field>

        <Field label="Mutualista" htmlFor="healthInsurer">
          <Input
            id="healthInsurer"
            name="healthInsurer"
            defaultValue={patient?.health_insurer ?? ''}
          />
        </Field>

        <Field
          label="Motivo de consulta"
          htmlFor="referralReason"
          className="sm:col-span-2 xl:col-span-2"
        >
          <Textarea
            id="referralReason"
            name="referralReason"
            rows={3}
            placeholder="¿Por qué llega a la consulta?"
            defaultValue={patient?.referral_reason ?? ''}
          />
        </Field>

        {/* Only when creating. The motivo above says why they arrived — "derivado
            por la maestra" — which is not a goal, and a practitioner who typed
            what they meant to work on into that box had to type it again on the
            ficha afterwards. Asking here is asking once. Editing does not offer
            it: by then the patient has a goal list, and a second way in would
            quietly create duplicates. */}
        {editing ? null : (
          <Field
            label="Primer objetivo"
            htmlFor="firstGoal"
            className="sm:col-span-2 xl:col-span-2"
          >
            <Input
              id="firstGoal"
              name="firstGoal"
              maxLength={200}
              placeholder="Ej: Producir /r/ en posición inicial"
            />
            <p className="text-xs text-muted-foreground">
              Lo que vas a trabajar. Con esto Hilo sigue el avance y arma los informes.
              Después agregás los que quieras desde la ficha.
            </p>
          </Field>
        )}

        {/* Sólo al editar. En el alta nadie sabe todavía cuándo empieza el
            tratamiento —es la fecha de la primera sesión, que todavía no
            ocurrió— y pedirlo ahí era pedir una fecha inventada o dejar el
            campo vacío para siempre. Ahora lo escribe la primera sesión que se
            registra (ver `startTreatmentOn`), y acá queda para corregirlo:
            quien viene de años de papel pone la fecha real. */}
        {editing ? (
          <Field label="Inicio del tratamiento" htmlFor="startDate">
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={patient?.start_date ?? ''}
            />
            <p className="text-xs text-muted-foreground">
              Se completa solo con la primera sesión que registres.
            </p>
          </Field>
        ) : null}
      </div>

      {/* El adulto a cargo, en su propio bloque. Hasta ahora el alta sólo tenía
          "Teléfono de la familia", sin nombre: el consentimiento que pide la
          Ley 19.529 para un menor lo firma una persona, el link para
          completar la ficha le llega a una persona, y el informe "para la
          familia" lo lee alguien con nombre. Un solo responsable, a
          propósito — ver la migración `patient_guardian`.

          Quién lo ve: con niños, siempre. Con adultos, nadie — preguntarle a
          una persona de cuarenta años quién es su madre era ruido en la mitad
          del formulario. Con adolescentes depende, que es justo el caso que no
          se puede resolver de antemano: a los trece hay un adulto a cargo y a
          los diecinueve puede no haberlo.

          Se esconde con `hidden` en vez de desmontarse: los campos siguen en el
          formulario, así que cambiar la población de un paciente ya cargado no
          le borra en silencio el responsable que tenía. Esto es historia
          clínica; lo que se borra se borra a propósito. */}
      <fieldset
        aria-labelledby="seccion-responsable"
        className={
          ageGroup === 'adults' ? 'hidden' : 'space-y-4 border-t border-border pt-6'
        }
      >
        {/* Un `<p>` nombrado con `aria-labelledby`, y no el elemento que el HTML
            tiene para esto: el navegador lo dibuja *adentro* del borde del
            `fieldset` y le abre un hueco, así que el título de cada sección
            quedaba con media raya colgando a la derecha. Con esto la línea que
            separa una sección de la otra se dibuja entera, y el grupo se sigue
            anunciando igual en un lector de pantalla. */}
        <p id="seccion-responsable" className={SECTION_TITLE}>
          Responsable
        </p>

        {ageGroup === 'adolescents' ? (
          <div className="max-w-xs">
            <Field label="¿Tiene un adulto a cargo?" htmlFor="hasGuardian">
              {/* Sin `name`: es un interruptor de esta pantalla, no un dato del
                  paciente. Lo que se guarda son los campos de abajo. */}
              <NativeSelect
                id="hasGuardian"
                value={hasGuardian ? 'yes' : 'no'}
                onChange={(event) => setHasGuardian(event.target.value === 'yes')}
              >
                <option value="yes">Sí</option>
                <option value="no">No, viene solo/a</option>
              </NativeSelect>
            </Field>
          </div>
        ) : null}

        <div
          className={
            showsGuardian ? 'grid gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3' : 'hidden'
          }
        >
          <Field label="Nombre del responsable" htmlFor="guardianName">
            <Input
              id="guardianName"
              name="guardianName"
              placeholder="Nombre y apellido"
              defaultValue={patient?.guardian_name ?? ''}
            />
          </Field>

          {showsGuardian ? phoneField : null}

          <Field label="Es su…" htmlFor="guardianRelationship">
            <NativeSelect
              id="guardianRelationship"
              name="guardianRelationship"
              defaultValue={patient?.guardian_relationship ?? ''}
            >
              <option value="">Elegí</option>
              {Object.entries(GUARDIAN_RELATIONSHIP_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>
          </Field>

          <Field label="Correo del responsable" htmlFor="guardianEmail">
            <Input
              id="guardianEmail"
              name="guardianEmail"
              type="email"
              placeholder="nombre@correo.com"
              defaultValue={patient?.guardian_email ?? ''}
            />
          </Field>
        </div>
      </fieldset>

      {/* Also only when creating. The form was already asking "sesiones por mes"
          one fieldset down — it wanted to know how often you see them — but had
          nowhere to say *when*, so the day and time had to be repeated in the
          Agenda dialog. This writes the same rule that dialog writes, and the
          Agenda materialises the occurrences from it.

          El título decía "Cuándo la ves", que le ponía género a un paciente que
          puede no tenerlo: la mitad de las fichas de una fonoaudióloga son
          varones. Lo que hace este bloque es agendar, así que se llama así.

          The hour is empty on purpose and is the switch: no hour, no schedule.
          A pre-filled 09:00 would agendar every patient at nine for somebody
          who has not decided yet. */}
      {editing ? null : (
        <fieldset
          aria-labelledby="seccion-agenda"
          className="space-y-4 border-t border-border pt-6"
        >
          <p id="seccion-agenda" className={SECTION_TITLE}>
            Agenda
          </p>

          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Día de la semana" htmlFor="weekday">
              <NativeSelect
                id="weekday"
                name="weekday"
                value={weekday}
                onChange={(event) => setWeekday(event.target.value)}
              >
                {WEEK_ORDER.map((day) => (
                  <option key={day} value={day}>
                    {weekdayName(day)}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            {/* De a cuartos de hora, igual que el diálogo de agendar, porque
                escriben la misma regla y el servidor rechaza lo que no cae en
                uno. La opción vacía sigue siendo el interruptor: es el valor
                por defecto, y sin hora no se agenda nada. */}
            <Field label="Hora" htmlFor="startTime">
              <NativeSelect id="startTime" name="startTime" defaultValue="">
                <option value="">Todavía no sé</option>
                {QUARTER_HOURS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field label="Frecuencia" htmlFor="frequency">
              <NativeSelect
                id="frequency"
                name="frequency"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
              >
                {Object.entries(NEW_PATIENT_FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>

          {frequency === 'once' ? (
            <p className="text-meta text-muted-foreground">
              Queda agendada una sola sesión, el {weekdayName(Number(weekday)).toLowerCase()}{' '}
              que viene. No se repite.
            </p>
          ) : null}
        </fieldset>
      )}

      <fieldset
        aria-labelledby="seccion-pagos"
        className="space-y-4 border-t border-border pt-6"
      >
        <p id="seccion-pagos" className={SECTION_TITLE}>
          Pagos
        </p>

        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Honorario ($)" htmlFor="sessionFee">
            <Input
              id="sessionFee"
              name="sessionFee"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="Monto"
              defaultValue={patient?.session_fee ?? ''}
            />
          </Field>

          <Field label="Frecuencia de pago" htmlFor="billingFrequency">
            <NativeSelect
              id="billingFrequency"
              name="billingFrequency"
              defaultValue={patient?.billing_frequency ?? 'monthly'}
            >
              {Object.entries(BILLING_FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>
          </Field>

          <Field
            label="Sesiones por mes"
            htmlFor="expectedSessionsPerMonth"
            hint="esperadas"
          >
            <Input
              id="expectedSessionsPerMonth"
              name="expectedSessionsPerMonth"
              type="number"
              min="0"
              max="62"
              inputMode="numeric"
              placeholder="Ej: 4"
              defaultValue={patient?.expected_sessions_per_month ?? ''}
            />
          </Field>
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="max-sm:w-full">
        {pending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear paciente'}
      </Button>
    </form>
  )
}

/** El título de una sección del formulario. */
const SECTION_TITLE = 'text-body font-bold text-muted-foreground uppercase'

function Field({
  label,
  htmlFor,
  hint,
  required,
  className,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-coral">
            *
          </span>
        ) : null}
        {hint ? <span className="font-normal text-muted-foreground"> · {hint}</span> : null}
      </Label>
      {children}
    </div>
  )
}

