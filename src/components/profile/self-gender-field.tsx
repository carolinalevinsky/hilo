import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { GRAMMATICAL_GENDERS, SELF_GENDER_LABELS } from '@/lib/grammatical-gender'

/**
 * "Me identifico como", para que Ombúa le hable a cada quien como corresponde:
 * "Bienvenida" o "Bienvenido". Arranca con lo que se deduce del nombre; si no
 * se deduce, vacío, que se lee en masculino. Ver `grammatical-gender.ts`.
 */
export function SelfGenderField({
  defaultValue,
  withHint = false,
}: {
  defaultValue: string | null
  /**
   * Para qué se pregunta. Al aceptar la invitación, que es la primera vez que
   * alguien lo ve y se puede preguntar por qué; en Mi perfil ya lo sabe.
   */
  withHint?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="grammaticalGender">Me identifico como</Label>
      <NativeSelect id="grammaticalGender" name="grammaticalGender" defaultValue={defaultValue ?? ''}>
        <option value="">Elegí una opción</option>
        {GRAMMATICAL_GENDERS.map((value) => (
          <option key={value} value={value}>
            {SELF_GENDER_LABELS[value]}
          </option>
        ))}
      </NativeSelect>
      {withHint ? (
        <p className="text-xs text-muted-foreground">
          Sólo para cómo te habla Ombúa («bienvenido» o «bienvenida»).
        </p>
      ) : null}
    </div>
  )
}
