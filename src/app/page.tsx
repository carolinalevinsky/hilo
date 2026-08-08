const ACCENTS = [
  { name: 'violet', label: 'Violeta', bg: 'bg-violet', soft: 'bg-violet-soft text-violet' },
  { name: 'teal', label: 'Verde agua', bg: 'bg-teal', soft: 'bg-teal-soft text-teal' },
  { name: 'coral', label: 'Coral', bg: 'bg-coral', soft: 'bg-coral-soft text-coral' },
  { name: 'amber', label: 'Ámbar', bg: 'bg-amber', soft: 'bg-amber-soft text-amber' },
  { name: 'green', label: 'Verde', bg: 'bg-green', soft: 'bg-green-soft text-green' },
  { name: 'blue', label: 'Azul', bg: 'bg-blue', soft: 'bg-blue-soft text-blue' },
]

/**
 * Placeholder home page. It exists to prove the design tokens ported from v1
 * actually resolve, and it gets replaced by the real app shell in M1.
 */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-[9px] bg-violet" />
        <h1 className="text-2xl font-extrabold tracking-tight">Hilo</h1>
      </div>

      <p className="mt-4 text-muted-foreground">
        El workspace está listo. Las pantallas se construyen a partir del M1.
      </p>

      <div className="mt-10 rounded-lg bg-card p-6 shadow-card">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Paleta
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ACCENTS.map((accent) => (
            <div key={accent.name} className="flex items-center gap-3">
              <div className={`size-9 rounded-xl ${accent.bg}`} />
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${accent.soft}`}
              >
                {accent.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
