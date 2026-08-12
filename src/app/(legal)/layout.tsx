import Link from 'next/link'

/**
 * The reading shell for the terms and the privacy policy.
 *
 * Both are public: a family that receives a booking link may want to read them
 * before typing a phone number, and someone who has not signed up yet has to be
 * able to read what they are about to accept.
 */
export default function LegalLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="size-6 rounded-[8px] bg-violet" />
            <span className="text-[19px] font-extrabold tracking-[-0.3px]">Hilo</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 pb-16">
        <div className="mb-4 rounded-xl bg-amber-soft px-4 py-3 text-[12.5px] leading-relaxed text-[#8a5a12]">
          Documento modelo, orientativo. Antes de usarse con pacientes reales conviene una
          revisión legal, sobre todo por tratarse de datos de salud de menores.
        </div>

        <article className="space-y-3.5 text-[14px] leading-[1.65] [&_h1]:mb-4 [&_h1]:text-[22px] [&_h1]:font-extrabold [&_h1]:tracking-[-0.5px]">
          {children}
        </article>

        <p className="mt-10 text-[12.5px] text-muted-foreground">
          <Link href="/terminos" className="text-violet underline">
            Términos y Condiciones
          </Link>
          {' · '}
          <Link href="/privacidad" className="text-violet underline">
            Política de Privacidad
          </Link>
        </p>
      </main>
    </div>
  )
}
