'use client'

import { Camera } from '@/components/icons'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

/**
 * The optional photo on the patient form, with a local preview.
 *
 * The preview is a blob URL created in the browser — nothing is uploaded until
 * the form is submitted, so choosing the wrong photo costs nothing.
 */
export function PhotoPicker({ currentUrl }: { currentUrl?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  // Blob URLs hold the file in memory until they are revoked.
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    const url = URL.createObjectURL(file)
    setObjectUrl(url)
    setPreview(url)
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = ''
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    setObjectUrl(null)
    setPreview(currentUrl ?? null)
  }

  return (
    <div className="flex items-center gap-3.5">
      <div className="flex size-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-violet-soft text-violet">
        {preview ? (
          /* A plain <img>: the preview is a `blob:` URL for a file that has not
             been uploaded yet, so there is nothing for next/image to optimise
             and no remote host to configure. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <Camera className="size-[22px]" />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPick}
          className="hidden"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Camera className="size-4" />
          {preview ? 'Cambiar foto' : 'Agregar foto'}
          <span className="text-muted-foreground">· opcional</span>
        </Button>
        {objectUrl ? (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            Deshacer
          </Button>
        ) : null}
      </div>
    </div>
  )
}
