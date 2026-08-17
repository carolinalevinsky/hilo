'use client'

import { Globe, Lock } from '@/components/icons'
import { useActionState, useState } from 'react'

import { createMaterialAction, updateMaterialAction } from '@/app/(app)/materiales/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { AGE_RANGES, MATERIAL_KIND_LABELS } from '@/lib/material-areas'
import { cn } from '@/lib/utils'
import type { Material, MaterialVisibility } from '@/server/materials'

/**
 * Writing or editing a material.
 *
 * One form for both, as everywhere else in Hilo: the fields are identical and
 * two of them would drift. `material` being present is what switches it.
 *
 * The visibility selector is v1's (`legacy/index.html:823-836`) and in v1 it did
 * nothing — a "published" material lived in an array in memory until the tab was
 * reloaded. Here it is real, which is why the authorship declaration is a
 * requirement the server enforces and not a checkbox that only looks serious.
 */
export function MaterialForm({
  areas,
  material,
}: {
  areas: Record<string, string[]>
  material?: Material
}) {
  const [state, formAction, pending] = useActionState(
    material ? updateMaterialAction : createMaterialAction,
    EMPTY_FORM_STATE,
  )
  const [area, setArea] = useState(material?.area ?? Object.keys(areas)[0] ?? '')
  const [visibility, setVisibility] = useState<MaterialVisibility>(
    material?.visibility === 'public' ? 'public' : 'private',
  )

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <FormMessage message={state.message} />
      {material ? <input type="hidden" name="materialId" value={material.id} /> : null}

      <div className="space-y-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          placeholder="Ej: Bingo de sonidos iniciales"
          defaultValue={material?.title ?? ''}
          required
          autoFocus
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="area">Área</Label>
          <Select
            id="area"
            name="area"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            required
          >
            {Object.keys(areas).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="focus">
            Dentro del área
            <span className="font-normal text-muted-foreground"> · opcional</span>
          </Label>
          <Select id="focus" name="focus" defaultValue={material?.focus ?? ''}>
            <option value="">Sin especificar</option>
            {(areas[area] ?? []).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kind">Tipo</Label>
          <Select id="kind" name="kind" defaultValue={material?.kind ?? 'activity'}>
            {Object.entries(MATERIAL_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ageRange">
            Edad
            <span className="font-normal text-muted-foreground"> · opcional</span>
          </Label>
          <Select id="ageRange" name="ageRange" defaultValue={material?.age_range ?? ''}>
            <option value="">Cualquier edad</option>
            {AGE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="objective">¿Para qué sirve?</Label>
        <Input
          id="objective"
          name="objective"
          placeholder="Ej: Identificar con qué sonido empieza cada palabra"
          defaultValue={material?.objective ?? ''}
        />
        <p className="text-xs text-muted-foreground">
          Con esto Hilo te lo sugiere solo cuando tenés un objetivo parecido.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">La actividad</Label>
        <Textarea
          id="content"
          name="content"
          rows={12}
          required
          defaultValue={material?.content ?? ''}
          placeholder={`Cómo se juega:\nSe dice una palabra en voz alta y el niño marca la imagen que empieza con el mismo sonido.\n\nMateriales:\nCartones impresos y fichas.`}
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Una línea corta terminada en dos puntos se ve como subtítulo. El resto, párrafos.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-medium">Visibilidad</legend>

        {/* v1's `.seg`: two halves of one control, not two checkboxes. */}
        <div className="flex gap-1.5 rounded-xl border border-border bg-muted/60 p-1">
          <VisibilityOption
            icon={Lock}
            label="Privado · solo para mí"
            value="private"
            current={visibility}
            onPick={setVisibility}
          />
          <VisibilityOption
            icon={Globe}
            label="Público · comunidad"
            value="public"
            current={visibility}
            onPick={setVisibility}
          />
        </div>
        <input type="hidden" name="visibility" value={visibility} />

        <p className="rounded-xl bg-violet-soft px-3 py-2.5 text-[12.5px] text-violet">
          {visibility === 'public'
            ? 'Público: cualquier profesional de Hilo lo ve en su biblioteca y puede copiarlo, con tu nombre. Vos seguís siendo quien lo edita.'
            : 'Privado: queda solo en tu biblioteca. Nadie más lo ve.'}
        </p>

        {visibility === 'public' ? (
          <Label
            htmlFor="ownWork"
            className="flex items-start gap-2.5 text-[12.5px] leading-relaxed font-normal"
          >
            <Checkbox id="ownWork" name="ownWork" className="mt-0.5" />
            <span>
              Declaro que este material es de mi autoría o tengo permiso para compartirlo, y
              que no incluye contenido con derechos de autor de terceros (por ejemplo ARASAAC
              u otros bancos de uso no comercial).
            </span>
          </Label>
        ) : null}
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="max-sm:w-full">
        {pending
          ? 'Guardando…'
          : visibility === 'public'
            ? 'Publicar en la comunidad'
            : material
              ? 'Guardar cambios'
              : 'Guardar en mi biblioteca'}
      </Button>
    </form>
  )
}

function VisibilityOption({
  icon: Icon,
  label,
  value,
  current,
  onPick,
}: {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement
  label: string
  value: MaterialVisibility
  current: MaterialVisibility
  onPick: (value: MaterialVisibility) => void
}) {
  const active = current === value

  return (
    <button
      type="button"
      onClick={() => onPick(value)}
      aria-pressed={active}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-bold transition-colors',
        active ? 'bg-card text-violet shadow-card' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-[15px]" />
      {label}
    </button>
  )
}

function Select(props: React.ComponentProps<'select'>) {
  return (
    <select
      {...props}
      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
}
