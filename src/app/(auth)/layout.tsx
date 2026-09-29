import Link from 'next/link'

import { Wordmark } from '@/components/brand/wordmark'
import { Layers, Star, TrendingUp } from '@/components/icons'
import { BRAND_NAME } from '@/lib/brand'

/**
 * El marco de las pantallas de entrada: entrar, recuperar la contraseña,
 * aceptar una invitación, completar el perfil.
 *
 * Son dos columnas. A la izquierda, en blanco, lo único que hay que hacer: el
 * logotipo, el formulario y los legales. A la derecha, el degradé violeta de v1
 * (`legacy/index.html:503`) con la presentación del producto — es la única
 * superficie que no es blanca, y lo primero que ve alguien que llega.
 *
 * El panel de la derecha desaparece abajo de `lg`. En un teléfono la columna
 * del formulario ocupa la pantalla entera: el degradé ahí no entra sin empujar
 * el formulario abajo del pliegue, y lo que la persona vino a hacer es entrar.
 *
 * El orden del DOM es el del teclado: el formulario primero, el panel después.
 */
export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col bg-card lg:flex-row">
      <section className="flex w-full grow flex-col p-6 sm:p-10 lg:w-[46%] lg:grow-0 lg:p-14 xl:p-20">
        {/* Logotipo, formulario y pie comparten una sola columna de 430px.
            Centrar sólo el formulario —que es lo que hacía el diseño— lo dejaba
            36px más adentro que el logotipo de arriba, y se ve. */}
        <div className="mx-auto flex w-full max-w-[430px] grow flex-col">
          <Link href="/" className="w-fit">
            <Wordmark height={30} />
          </Link>

          <div className="my-auto w-full py-10">{children}</div>

          <footer className="flex flex-col items-center justify-between gap-2 border-t border-border pt-4 text-micro text-muted-foreground sm:flex-row">
            <p>
              © {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.
            </p>
            {/* El diseño tenía acá "Soporte", apuntando a `#`. No hay página de
                soporte a la que llevar, y un enlace que no va a ningún lado en
                la pantalla de entrar es peor que no tenerlo; éstas dos existen. */}
            <div className="flex items-center gap-4">
              <Link href="/terminos" className="hover:text-foreground">
                Términos
              </Link>
              <Link href="/privacidad" className="hover:text-foreground">
                Privacidad
              </Link>
            </div>
          </footer>
        </div>
      </section>

      <aside className="app-auth-panel relative hidden overflow-hidden p-12 text-white lg:flex lg:w-[54%] lg:flex-col lg:justify-between xl:p-16">
        {/* La textura y los dos focos de luz del diseño. Van atrás de todo y no
            reciben clicks. */}
        <div className="app-auth-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 size-[30rem] rounded-full bg-[#4a3bc4]/50 blur-3xl" />

        <p className="relative inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-nano font-semibold tracking-[1px] uppercase backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-celeste" />
          Plataforma Ombúa · Gestión inteligente
        </p>

        <div className="relative my-auto max-w-xl py-10">
          <p className="text-[32px] leading-[1.1] font-extrabold tracking-[-0.8px] xl:text-[40px]">
            Lo que necesitás para cada paciente, siempre a mano.
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/75 xl:text-lg">
            Centralizá procesos, automatizá flujos y tomá decisiones con visibilidad total
            en tiempo real desde un único lugar.
          </p>

          <div className="mt-10 grid max-w-lg gap-4 sm:grid-cols-2">
            <article className="rounded-[18px] border border-white/20 bg-white/12 p-5 shadow-[0_8px_32px_rgba(31,38,135,0.15)] backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-[11px] bg-white/15">
                  <TrendingUp className="size-[18px]" />
                </span>
                <span className="rounded-full border border-green/40 bg-green/20 px-1.5 py-0.5 text-nano font-semibold text-[color-mix(in_oklab,var(--brand-green),white_50%)]">
                  +32.8%
                </span>
              </div>
              <p className="mt-3.5 text-micro font-semibold tracking-[1px] text-white/65 uppercase">
                Organización diaria
              </p>
              <p className="mt-1 text-2xl font-bold">4.8× más rápido</p>
              <p className="mt-1 text-meta text-white/75">Ahorro medido en horas/equipo</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-[color-mix(in_oklab,var(--brand-green),white_10%)] to-[color-mix(in_oklab,var(--brand-teal),white_25%)]" />
              </div>
            </article>

            <article className="rounded-[18px] border border-white/20 bg-white/12 p-5 shadow-[0_8px_32px_rgba(31,38,135,0.15)] backdrop-blur-md">
              <span className="flex size-9 items-center justify-center rounded-[11px] bg-white/15">
                <Layers className="size-[18px]" />
              </span>
              <p className="mt-3.5 text-micro font-semibold tracking-[1px] text-white/65 uppercase">
                Seguimiento claro
              </p>
              <p className="mt-1 text-2xl font-bold">1 plataforma</p>
              <p className="mt-1 text-meta text-white/75">
                Pacientes, sesiones y materiales
              </p>
              <p className="mt-3 flex items-center gap-2 text-micro font-medium text-white/85">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[color-mix(in_oklab,var(--brand-green),white_25%)] opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-[color-mix(in_oklab,var(--brand-green),white_25%)]" />
                </span>
                Sincronización activa
              </p>
            </article>
          </div>
        </div>

        <div className="relative flex items-center justify-between gap-6 border-t border-white/10 pt-6">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex -space-x-2.5">
              {AVATARS.map(({ initials, className }) => (
                <span
                  key={initials}
                  className={`flex size-8 items-center justify-center rounded-full text-micro font-bold text-foreground ring-2 ring-[#5f50d7] ${className}`}
                >
                  {initials}
                </span>
              ))}
            </div>
            <div className="min-w-0 text-meta">
              <p className="font-semibold">Más de 10 profesionales confían en Ombúa</p>
              <p className="mt-0.5 text-white/70">
                Psicopedagogos infantiles, psicólogos, fonoaudiólogas u otras profesiones.
              </p>
            </div>
          </div>

          <p className="hidden shrink-0 items-center gap-1 text-[color-mix(in_oklab,var(--brand-amber),white_30%)] xl:flex">
            {[0, 1, 2, 3, 4].map((star) => (
              <Star key={star} className="size-4" fill="currentColor" strokeWidth={0} />
            ))}
            <span className="ml-1 text-meta font-semibold text-white">4.9/5</span>
          </p>
        </div>
      </aside>
    </div>
  )
}

/** Las iniciales del pie del panel, con los colores del diseño. */
const AVATARS = [
  { initials: 'MR', className: 'bg-amber' },
  { initials: 'LS', className: 'bg-blue' },
  { initials: 'PA', className: 'bg-green' },
  { initials: 'MA', className: 'bg-celeste' },
] as const
