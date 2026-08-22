import Link from 'next/link'

import { Button } from '@/components/ui/button'

/**
 * The landing page, for someone who is not signed in.
 *
 * Anyone with a session never sees it — the proxy sends them to `/inicio`.
 */
export default function LandingPage() {
  return (
    <div className="hilo-auth-bg flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center text-white">
      <div className="mb-6 flex items-center gap-3">
        <span className="size-9 rounded-[11px] bg-white/90" />
        <span className="text-[34px] font-extrabold tracking-[-0.8px]">Hilo</span>
      </div>

      <h1 className="max-w-xl text-[26px] leading-tight font-extrabold tracking-[-0.6px] sm:text-[32px]">
        Tus pacientes, tus sesiones y tus informes, en un solo lugar
      </h1>

      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/85">
        Hecho para fonoaudiólogas, psicopedagogas, terapeutas ocupacionales, psicólogas,
        psicomotricistas y kinesiólogas de Uruguay.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Button asChild size="lg" className="w-full bg-white text-violet hover:bg-white/90">
          <Link href="/crear-cuenta">Crear mi cuenta</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full border-white/40 bg-transparent text-white hover:bg-white/12 hover:text-white"
        >
          <Link href="/entrar">Ya tengo cuenta</Link>
        </Button>
      </div>

      <p className="mt-10 text-[12px] text-white/70">
        <Link href="/terminos" className="underline">
          Términos
        </Link>
        {' · '}
        <Link href="/privacidad" className="underline">
          Privacidad
        </Link>
      </p>
    </div>
  )
}
