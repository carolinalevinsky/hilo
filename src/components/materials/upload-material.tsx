'use client'

import { Sparkles, Upload } from '@/components/icons'
import { useActionState, useState } from 'react'

import { uploadMaterialAction } from '@/app/(app)/materiales/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { AGE_RANGES, MATERIAL_KIND_LABELS } from '@/lib/material-areas'

/**
 * Uploading a material you already have — a scan, or a photo of a worksheet.
 *
 * A practitioner arrives with years of material already made, in a folder and a
 * filing cabinet. Asking them to retype it is asking them not to bother, and a
 * library that only holds what was typed into it stays empty.
 *
 * The file alone is not enough for Hilo to be useful about it later:
 * `bestMaterialFor` matches on words, so a PDF with no description is a title
 * nobody will ever be offered again. Hence the model reads it and drafts the
 * description — and the practitioner corrects it before anything is saved.
 *
 * **The notice above the field is not decoration.** Sending the file to
 * Anthropic is the only place a file of theirs leaves the server, and a photo
 * taken in a consulting room can have a child's name written on the page. This
 * says so before a file is chosen, which is the difference between a permission
 * and a surprise.
 */
export function UploadMaterial({ areas }: { areas: string[] }) {
  const [state, formAction, pending] = useActionState(uploadMaterialAction, EMPTY_FORM_STATE)
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          <Upload className="size-[18px]" />
          Subir un material
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir un material que ya tenés</DialogTitle>
          <DialogDescription>
            Un PDF o una foto de una ficha, un juego o una lámina. Hilo lo lee y escribe
            la descripción; vos la corregís antes de guardar.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <FormMessage message={state.message} />

          <p className="rounded-xl bg-amber-soft px-3 py-2.5 text-[12.5px] leading-relaxed text-[#8a5a12]">
            Para describirlo, Hilo le manda el archivo al modelo de IA. Fijate que no
            tenga el nombre de ningún paciente escrito. Una foto sacada en el consultorio
            a veces lo tiene.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="material-file">El archivo</Label>
            <input
              id="material-file"
              name="file"
              type="file"
              required
              accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
              className="w-full rounded-lg border border-input bg-background p-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-violet-soft file:px-3 file:py-1.5 file:text-[13px] file:font-bold file:text-violet focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="text-xs text-muted-foreground">
              {fileName ?? 'PDF, JPG, PNG o HEIC. Hasta 10 MB.'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="upload-area">Área</Label>
              <Select id="upload-area" name="area" required>
                {areas.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="upload-kind">Tipo</Label>
              <Select id="upload-kind" name="kind" defaultValue="worksheet">
                {Object.entries(MATERIAL_KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="upload-age">
              Edad
              <span className="font-normal text-muted-foreground"> · opcional</span>
            </Label>
            <Select id="upload-age" name="ageRange" defaultValue="">
              <option value="">Cualquier edad</option>
              {AGE_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </Select>
          </div>

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            <Sparkles className="size-4" />
            {pending ? 'Subiendo…' : 'Subir y describir'}
          </Button>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Queda privado en tu biblioteca. Si después lo querés publicar, lo hacés desde
            el material, con la declaración de autoría.
          </p>
        </form>
      </DialogContent>
    </Dialog>
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
