import Image from 'next/image'

import { patientClasses } from '@/lib/patient-colors'
import { cn } from '@/lib/utils'

/**
 * The patient's photo, or their initials on their colour.
 *
 * The tinted pair — a pale background, the initials in the deep version of the
 * same colour — and not the solid colour. Solid, a list of patients was a row of
 * violet, amber, coral, green and teal squares at full strength, and the
 * avatars were the loudest thing on every screen they were on. The tinted pairs
 * are the brand's own (`brand.ts`), built to sit together; the colour still
 * tells patients apart at a glance.
 *
 * The colour is stored on the row and derived from the name, so the same person
 * is the same colour on every screen. v1 assigned colours in creation order,
 * which meant everyone's colour shifted whenever a patient was removed.
 */
export function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function PatientAvatar({
  fullName,
  color,
  photoUrl,
  size = 44,
  className,
}: {
  fullName: string
  color: string | null
  photoUrl?: string | null
  size?: number
  className?: string
}) {
  const classes = cn(
    'flex shrink-0 items-center justify-center overflow-hidden rounded-[29%] font-extrabold',
    patientClasses(color),
    className,
  )

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={`Foto de ${fullName}`}
        width={size}
        height={size}
        className={cn(classes, 'object-cover')}
        style={{ width: size, height: size }}
        unoptimized
      />
    )
  }

  return (
    <div
      className={classes}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden
    >
      {initials(fullName)}
    </div>
  )
}
