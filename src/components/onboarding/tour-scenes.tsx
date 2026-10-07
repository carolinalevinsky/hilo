/**
 * The short animated drawings at the top of each tour card: what happens on
 * that screen, played rather than described. A list where a patient opens into
 * a ficha; a week where a session appears and gets marked "Vino"; a goal and a
 * material dropping into a session plan; notes becoming a signed report; a debt
 * becoming a payment.
 *
 * They are drawn, not screenshots, on purpose: a new account's screens are
 * empty, so there is nothing real to show yet, and a screenshot of somebody
 * else's patients would be a strange thing to open with. The drawing shows the
 * *shape* of what happens — the few elements that matter, in the order they
 * happen — and the real screen is one click away, ringed in the nav.
 *
 * ─── How the loop works ────────────────────────────────────────────────────
 *
 * Every scene is one cycle (`CYCLE`), and every animated element is hidden at
 * 0% and appears at its own moment in the cycle, so the whole scene resets at
 * once and plays again. The moments are keyframes named by the percentage they
 * fire at: `fx('in', 30)` appears at 30%, `fx('tap', 24)` is a tap ring at
 * 24%, `fx('fill', 42)` is a bar filling from 42%, `fx('out', 54)` is
 * something that goes away at 54% (for a chip that changes). Only the moments
 * in `MOMENTS` exist, and `fx` only accepts those: a class for a moment with
 * no keyframes is silently static — it is how "25 set." once sat on the ficha
 * from the first frame. An element's resting state is its final one, so with
 * `prefers-reduced-motion` the scene simply shows its end.
 */

export type SceneName = 'bienvenida' | 'pacientes' | 'agenda' | 'planificacion' | 'informes' | 'pagos'

const CYCLE = '7s'

// Las curvas de las animaciones. Un elemento "entra" en 5% del ciclo (350ms),
// una barra se llena en 12%, un toque dura 10%.
const MOMENTS = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84] as const
type Moment = (typeof MOMENTS)[number]
type Effect = 'in' | 'pop' | 'tap' | 'fill' | 'out'

/** The class that plays `effect` at moment `at` of the cycle. */
function fx(effect: Effect, at: Moment): string {
  return `ts-${effect}-${at}`
}
const KEYFRAMES = MOMENTS.map(
  (p) => `
@keyframes ts-in-${p}{0%,${p}%{opacity:0;transform:translateY(4px)}${p + 5}%,100%{opacity:1;transform:none}}
@keyframes ts-pop-${p}{0%,${p}%{opacity:0;transform:scale(.6)}${p + 4}%{opacity:1;transform:scale(1.08)}${p + 7}%,100%{opacity:1;transform:scale(1)}}
@keyframes ts-tap-${p}{0%,${p}%{opacity:0;transform:scale(.5)}${p + 2}%{opacity:.9;transform:scale(.7)}${p + 9}%,100%{opacity:0;transform:scale(1.6)}}
@keyframes ts-fill-${p}{0%,${p}%{transform:scaleX(0)}${p + 12}%,100%{transform:scaleX(1)}}
@keyframes ts-out-${p}{0%,${p}%{opacity:1}${p + 3}%,100%{opacity:0}}
.ts-in-${p}{animation:ts-in-${p} ${CYCLE} ease-out infinite}
.ts-pop-${p}{animation:ts-pop-${p} ${CYCLE} ease-out infinite}
.ts-tap-${p}{animation:ts-tap-${p} ${CYCLE} ease-out infinite}
.ts-fill-${p}{animation:ts-fill-${p} ${CYCLE} ease-out infinite}
.ts-out-${p}{animation:ts-out-${p} ${CYCLE} ease-out infinite}`,
).join('')

const STYLE = `
.ts [class*="ts-"]{transform-box:fill-box;transform-origin:center}
.ts [class*="ts-fill-"]{transform-origin:left center}
.ts text{font-family:inherit;font-weight:600;user-select:none}
@media (prefers-reduced-motion:reduce){.ts [class*="ts-"]{animation:none !important}.ts [class*="ts-tap-"]{opacity:0}}
${KEYFRAMES}`

/** The one `<style>` for all the scenes; rendered once, by the card. */
export function SceneStyles() {
  return <style>{STYLE}</style>
}

export function Scene({ name }: { name: SceneName }) {
  const Drawing = SCENES[name]
  return (
    <div className="ts overflow-hidden rounded-xl bg-violet-whisper">
      <Drawing />
    </div>
  )
}

// ─── The palette, as the app's own variables ─────────────────────────────────

const violet = 'var(--brand-violet)'
const violetSoft = 'var(--brand-violet-soft)'
const coral = 'var(--brand-coral)'
const amber = 'var(--brand-amber)'
const amberSoft = 'var(--brand-amber-soft)'
const amberInk = 'var(--brand-amber-ink)'
const green = 'var(--brand-green)'
const greenSoft = 'var(--brand-green-soft)'
const greenInk = 'var(--brand-green-ink)'
const blue = 'var(--brand-blue)'
const card = 'var(--card)'
const border = 'var(--border)'
const muted = 'var(--muted)'
const ink = 'var(--foreground)'
const quiet = 'var(--muted-foreground)'

const frame = { viewBox: '0 0 320 150', width: '100%', 'aria-hidden': true } as const

/** The ring of a tap, where a finger would land. */
function Tap({ x, y, at }: { x: number; y: number; at: Moment }) {
  return <circle cx={x} cy={y} r={11} fill={violet} opacity={0} className={fx('tap', at)} />
}

/** A grey line standing in for a word or two of text. */
function Line({ x, y, w, h = 4, color = border }: { x: number; y: number; w: number; h?: number; color?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={color} />
}

function Check({ x, y, color = card }: { x: number; y: number; color?: string }) {
  return (
    <path
      d={`M${x} ${y + 2.5} l2.2 2.2 l4.3 -4.6`}
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

// ─── Bienvenida: las cinco pantallas, una tras otra ──────────────────────────

/** The five screens as tiles along a path, in the order the tour visits them. */
function Bienvenida() {
  const tiles: { label: string; at: Moment; icon: typeof PersonIcon }[] = [
    { label: 'Pacientes', at: 6, icon: PersonIcon },
    { label: 'Agenda', at: 18, icon: CalendarIcon },
    { label: 'Planificación', at: 30, icon: ListIcon },
    { label: 'Informes', at: 42, icon: DocIcon },
    { label: 'Pagos', at: 54, icon: CoinIcon },
  ]
  const x = (i: number) => 8 + i * 61
  return (
    <svg {...frame}>
      {/* El camino que las une, que se dibuja a medida que aparecen. */}
      <rect x={36} y={74} width={248} height={2} rx={1} fill={violetSoft} />
      <rect x={36} y={74} width={248} height={2} rx={1} fill={violet} className={fx('fill', 6)} opacity={0.6} />

      {tiles.map((tile, i) => {
        const Icon = tile.icon
        return (
          <g key={tile.label} className={fx('pop', tile.at)}>
            <rect x={x(i)} y={40} width={56} height={70} rx={11} fill={card} stroke={border} />
            <circle cx={x(i) + 28} cy={66} r={14} fill={violetSoft} />
            <Icon x={x(i) + 28} y={66} />
            <text x={x(i) + 28} y={98} fontSize={7} fill={ink} textAnchor="middle">{tile.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function PersonIcon({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke={violet} strokeWidth={1.5} strokeLinecap="round">
      <circle cx={x - 1.5} cy={y - 2.5} r={2.6} />
      <path d={`M${x - 7} ${y + 5.5} c 0 -4, 11 -4, 11 0`} />
      <circle cx={x + 4.5} cy={y - 1.5} r={2} />
      <path d={`M${x + 2.5} ${y + 5.5} c 1 -3, 6 -3, 6.5 0`} />
    </g>
  )
}

function CalendarIcon({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke={violet} strokeWidth={1.5} strokeLinecap="round">
      <rect x={x - 6} y={y - 5} width={12} height={11} rx={2} />
      <line x1={x - 6} x2={x + 6} y1={y - 1.5} y2={y - 1.5} />
      <line x1={x - 3} x2={x - 3} y1={y - 7} y2={y - 4} />
      <line x1={x + 3} x2={x + 3} y1={y - 7} y2={y - 4} />
    </g>
  )
}

function ListIcon({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke={violet} strokeWidth={1.5} strokeLinecap="round">
      {[-4, 0, 4].map((dy) => (
        <g key={dy}>
          <circle cx={x - 5} cy={y + dy} r={0.8} fill={violet} />
          <line x1={x - 1.5} x2={x + 6} y1={y + dy} y2={y + dy} />
        </g>
      ))}
    </g>
  )
}

function DocIcon({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke={violet} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x - 4.5} ${y - 6.5} h 6 l 3.5 3.5 v 9 h -9.5 z`} />
      <line x1={x - 2} x2={x + 2.5} y1={y} y2={y} />
      <line x1={x - 2} x2={x + 2.5} y1={y + 3} y2={y + 3} />
    </g>
  )
}

function CoinIcon({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke={violet} strokeWidth={1.5} strokeLinecap="round">
      <circle cx={x} cy={y} r={6} />
      <text x={x} y={y + 2.8} fontSize={8} fill={violet} stroke="none" textAnchor="middle" fontWeight={700}>$</text>
    </g>
  )
}

// ─── Pacientes: la lista, y una ficha que se abre ────────────────────────────

function Pacientes() {
  const rows = [
    { y: 14, color: coral, initials: 'TP', name: 48 },
    { y: 56, color: blue, initials: 'MR', name: 60 },
    { y: 98, color: amber, initials: 'JS', name: 40 },
  ]
  return (
    <svg {...frame}>
      {rows.map((row, i) => (
        <g key={row.y} className={fx('in', MOMENTS[i]!)}>
          <rect x={10} y={row.y} width={136} height={34} rx={9} fill={card} stroke={border} />
          <circle cx={30} cy={row.y + 17} r={10} fill={row.color} />
          <text x={30} y={row.y + 20} fontSize={7.5} fill={card} textAnchor="middle">{row.initials}</text>
          <Line x={48} y={row.y + 10} w={row.name} h={5} color={ink} />
          <Line x={48} y={row.y + 21} w={34} />
          <rect x={112} y={row.y + 11} width={26} height={12} rx={6} fill={violetSoft} />
        </g>
      ))}
      <Tap x={80} y={31} at={30} />
      <rect x={10} y={14} width={136} height={34} rx={9} fill="none" stroke={violet} strokeWidth={1.5} className={fx('in', 30)} />

      {/* La ficha, que entra desde la derecha al tocar la primera fila. */}
      <g className={fx('in', 36)}>
        <rect x={160} y={10} width={150} height={130} rx={10} fill={card} stroke={border} />
        <rect x={160} y={10} width={150} height={38} rx={10} fill={coral} opacity={0.9} />
        <rect x={160} y={30} width={150} height={18} fill={coral} opacity={0.9} />
        <circle cx={180} cy={29} r={11} fill={card} opacity={0.35} />
        <text x={180} y={32} fontSize={8} fill={card} textAnchor="middle">TP</text>
        <text x={197} y={27} fontSize={9} fill={card}>Tomás</text>
        <text x={197} y={38} fontSize={6.5} fill={card} opacity={0.85} fontWeight={500}>6 años · 1.º año</text>
      </g>

      <g className={fx('in', 48)}>
        <text x={170} y={66} fontSize={7} fill={quiet} letterSpacing={0.4}>OBJETIVO</text>
        <text x={300} y={66} fontSize={7.5} fill={violet} textAnchor="end">60%</text>
        <text x={170} y={79} fontSize={7} fill={ink} fontWeight={500}>Seguir una consigna de dos pasos</text>
        <rect x={170} y={85} width={130} height={5} rx={2.5} fill={muted} />
        <rect x={170} y={85} width={78} height={5} rx={2.5} fill={violet} className={fx('fill', 54)} />
      </g>

      <g className={fx('in', 66)}>
        <text x={170} y={106} fontSize={7} fill={quiet} letterSpacing={0.4}>SESIONES</text>
        <circle cx={174} cy={117} r={3} fill={green} />
        <Line x={182} y={115} w={70} />
        <text x={300} y={119} fontSize={6.5} fill={quiet} textAnchor="end" fontWeight={500}>2 oct.</text>
      </g>
      <g className={fx('in', 78)}>
        <circle cx={174} cy={130} r={3} fill={green} />
        <Line x={182} y={128} w={58} />
        <text x={300} y={132} fontSize={6.5} fill={quiet} textAnchor="end" fontWeight={500}>25 set.</text>
      </g>
    </svg>
  )
}

// ─── Agenda: la semana, una sesión, y «Vino» ─────────────────────────────────

function Agenda() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  const hours = ['09', '10', '11', '12']
  const col = (i: number) => 38 + i * 56
  const row = (i: number) => 32 + i * 28
  return (
    <svg {...frame}>
      <rect x={10} y={10} width={300} height={130} rx={10} fill={card} stroke={border} />
      {days.map((day, i) => (
        <text key={day} x={col(i) + 28} y={24} fontSize={7.5} fill={i === 4 ? violet : quiet} textAnchor="middle">{day}</text>
      ))}
      {hours.map((hour, i) => (
        <g key={hour}>
          <text x={28} y={row(i) + 10} fontSize={6.5} fill={quiet} textAnchor="end" fontWeight={500}>{hour}:00</text>
          <line x1={34} x2={308} y1={row(i)} y2={row(i)} stroke={border} />
        </g>
      ))}
      {days.map((_, i) => (
        <line key={i} x1={col(i)} x2={col(i)} y1={30} y2={138} stroke={border} />
      ))}

      {/* La semana que ya estaba: los otros pacientes. */}
      {[
        { day: 0, hour: 1, name: 'Juan', color: blue },
        { day: 0, hour: 3, name: 'Sofía', color: amber },
        { day: 1, hour: 0, name: 'Mía', color: coral },
        { day: 1, hour: 2, name: 'Lucas', color: violet },
        { day: 2, hour: 1, name: 'Emma', color: blue },
        { day: 3, hour: 0, name: 'Juan', color: blue },
        { day: 3, hour: 2, name: 'Mía', color: coral },
        { day: 4, hour: 2, name: 'Sofía', color: amber },
      ].map((session, i) => (
        <g key={i} className={fx('in', MOMENTS[i % 3]!)}>
          <rect x={col(session.day) + 3} y={row(session.hour) + 2} width={50} height={24} rx={5} fill={card} stroke={border} />
          <rect x={col(session.day) + 3} y={row(session.hour) + 2} width={3} height={24} rx={1.5} fill={session.color} />
          <text x={col(session.day) + 10} y={row(session.hour) + 12} fontSize={6} fill={ink} fontWeight={500}>{hours[session.hour]}:00 · {session.name}</text>
          <Line x={col(session.day) + 10} y={row(session.hour) + 17} w={20} h={3} />
        </g>
      ))}

      {/* La de hoy, que aparece, se toca y queda marcada. */}
      <g className={fx('pop', 30)}>
        <rect x={col(4) + 3} y={row(0) + 2} width={50} height={24} rx={5} fill={violetSoft} stroke={violet} strokeWidth={0.8} />
        <text x={col(4) + 8} y={row(0) + 12} fontSize={6} fill={violet}>09:00 · Tomás</text>
        <Line x={col(4) + 8} y={row(0) + 17} w={20} h={3} color={violet} />
      </g>
      <Tap x={col(4) + 28} y={row(0) + 14} at={48} />

      <g className={fx('pop', 54)}>
        <rect x={col(4) + 3} y={row(0) + 2} width={50} height={24} rx={5} fill={greenSoft} stroke={green} strokeWidth={0.8} />
        <text x={col(4) + 8} y={row(0) + 12} fontSize={6} fill={greenInk}>09:00 · Tomás</text>
        <circle cx={col(4) + 12} cy={row(0) + 19} r={4} fill={green} />
        <Check x={col(4) + 9} y={row(0) + 17} />
        <text x={col(4) + 19} y={row(0) + 21.5} fontSize={6} fill={greenInk}>Vino</text>
      </g>

      {/* Y el botón que registra cómo salió, debajo de la sesión de hoy. */}
      <g className={fx('in', 72)}>
        <rect x={204} y={row(1) + 4} width={102} height={18} rx={9} fill={violet} />
        <text x={255} y={row(1) + 16} fontSize={7} fill={card} textAnchor="middle">Registrar sesión</text>
      </g>
    </svg>
  )
}

// ─── Planificación: un objetivo y un material, al plan ───────────────────────

function Planificacion() {
  return (
    <svg {...frame}>
      {/* Las dos pestañas de la pantalla. */}
      <g className={fx('in', 6)}>
        <rect x={10} y={8} width={64} height={16} rx={8} fill={violetSoft} />
        <text x={42} y={19} fontSize={6.5} fill={violet} textAnchor="middle">Planificación</text>
        <text x={104} y={19} fontSize={6.5} fill={quiet} textAnchor="middle">Materiales</text>
      </g>

      {/* Las sugerencias, a la izquierda. */}
      <g className={fx('in', 12)}>
        <text x={12} y={38} fontSize={6.5} fill={quiet} letterSpacing={0.4}>OBJETIVOS DE TOMÁS</text>
        <rect x={10} y={43} width={150} height={28} rx={8} fill={card} stroke={border} />
        <circle cx={24} cy={57} r={6} fill={violetSoft} />
        <circle cx={24} cy={57} r={2} fill={violet} />
        <text x={34} y={55} fontSize={6.5} fill={ink} fontWeight={500}>Seguir una consigna</text>
        <text x={34} y={64} fontSize={6.5} fill={ink} fontWeight={500}>de dos pasos</text>
        <rect x={116} y={49} width={38} height={16} rx={8} fill={violet} />
        <text x={135} y={60} fontSize={6.5} fill={card} textAnchor="middle">Agregar</text>
      </g>
      <g className={fx('in', 18)}>
        <text x={12} y={85} fontSize={6.5} fill={quiet} letterSpacing={0.4}>MATERIALES DE TU BIBLIOTECA</text>
        <rect x={10} y={90} width={72} height={50} rx={8} fill={card} stroke={border} />
        <rect x={16} y={96} width={26} height={9} rx={4.5} fill={amberSoft} />
        <text x={29} y={102.5} fontSize={5.5} fill={amberInk} textAnchor="middle">Juego</text>
        <text x={16} y={117} fontSize={6.5} fill={ink} fontWeight={500}>Simón dice</text>
        <Line x={16} y={124} w={40} h={3} />
        <Line x={16} y={131} w={28} h={3} />
        <rect x={88} y={90} width={72} height={50} rx={8} fill={card} stroke={border} />
        <rect x={94} y={96} width={30} height={9} rx={4.5} fill={violetSoft} />
        <text x={109} y={102.5} fontSize={5.5} fill={violet} textAnchor="middle">Pauta</text>
        <text x={94} y={117} fontSize={6.5} fill={ink} fontWeight={500}>Dos órdenes</text>
        <Line x={94} y={124} w={44} h={3} />
        <Line x={94} y={131} w={30} h={3} />
      </g>

      {/* El plan, a la derecha. */}
      <g className={fx('in', 12)}>
        <rect x={176} y={8} width={134} height={132} rx={10} fill={card} stroke={border} />
        <rect x={176} y={8} width={134} height={34} rx={10} fill={violet} />
        <rect x={176} y={26} width={134} height={16} fill={violet} />
        <text x={186} y={22} fontSize={6} fill={card} opacity={0.8} letterSpacing={0.4}>PLAN DE LA SESIÓN</text>
        <text x={186} y={35} fontSize={8} fill={card}>Tomás · lunes 9:00</text>
      </g>

      <Tap x={135} y={57} at={30} />
      <g className={fx('pop', 36)}>
        <rect x={184} y={52} width={118} height={26} rx={7} fill={violetSoft} />
        <circle cx={196} cy={65} r={4} fill={violet} />
        <text x={205} y={63} fontSize={6.5} fill={ink} fontWeight={500}>Seguir una consigna</text>
        <text x={205} y={72} fontSize={6.5} fill={ink} fontWeight={500}>de dos pasos</text>
      </g>

      <Tap x={46} y={115} at={54} />
      <g className={fx('pop', 60)}>
        <rect x={184} y={84} width={118} height={26} rx={7} fill={amberSoft} />
        <text x={192} y={95} fontSize={6.5} fill={ink} fontWeight={500}>Simón dice</text>
        <text x={192} y={104} fontSize={6} fill={quiet} fontWeight={500}>Juego · 10 min</text>
      </g>

      <g className={fx('in', 72)}>
        <circle cx={196} cy={125} r={5} fill={green} />
        <Check x={193} y={123} />
        <text x={205} y={128} fontSize={6.5} fill={greenInk}>Guardado para ese día</text>
      </g>
    </svg>
  )
}

// ─── Informes: las sesiones, el borrador, la firma ───────────────────────────

function Informes() {
  const notes: { y: number; label: string; at: Moment }[] = [
    { y: 22, label: 'Sesión · 18 set.', at: 6 },
    { y: 60, label: 'Sesión · 25 set.', at: 12 },
    { y: 98, label: 'Sesión · 2 oct.', at: 18 },
  ]
  const lines: { y: number; w: number; at: Moment }[] = [
    { y: 46, w: 128, at: 36 },
    { y: 56, w: 112, at: 42 },
    { y: 66, w: 124, at: 48 },
    { y: 80, w: 100, at: 54 },
    { y: 90, w: 126, at: 60 },
    { y: 100, w: 84, at: 66 },
  ]
  return (
    <svg {...frame}>
      {notes.map((note) => (
        <g key={note.y} className={fx('in', note.at)}>
          <rect x={10} y={note.y} width={104} height={30} rx={8} fill={card} stroke={border} />
          <text x={18} y={note.y + 12} fontSize={6.5} fill={quiet}>{note.label}</text>
          <Line x={18} y={note.y + 18} w={70} h={3} />
          <Line x={18} y={note.y + 24} w={50} h={3} />
        </g>
      ))}

      {/* Las flechas, cuando el borrador empieza a escribirse. */}
      <g className={fx('in', 30)}>
        <path d="M118 37 C 135 37, 135 70, 150 70" fill="none" stroke={violet} strokeWidth={1.2} opacity={0.6} />
        <path d="M118 75 C 135 75, 135 70, 150 70" fill="none" stroke={violet} strokeWidth={1.2} opacity={0.6} />
        <path d="M118 113 C 135 113, 135 70, 150 70" fill="none" stroke={violet} strokeWidth={1.2} opacity={0.6} />
      </g>

      <g className={fx('in', 24)}>
        <rect x={156} y={10} width={154} height={130} rx={8} fill={card} stroke={border} />
        <text x={168} y={26} fontSize={7} fill={quiet} letterSpacing={0.4}>INFORME PARA EL COLEGIO</text>
        <text x={168} y={37} fontSize={8} fill={ink}>Tomás Pérez</text>
      </g>
      {lines.map((line) => (
        <rect key={line.y} x={168} y={line.y} width={line.w} height={4} rx={2} fill={border} className={fx('fill', line.at)} />
      ))}

      <g className={fx('in', 78)}>
        <path d="M170 124 c 6 -10, 10 4, 16 -4 c 5 -6, 9 2, 14 -3 c 4 -4, 8 0, 12 -2" fill="none" stroke={violet} strokeWidth={1.4} strokeLinecap="round" />
        <line x1={168} x2={240} y1={128} y2={128} stroke={border} />
        <rect x={258} y={116} width={44} height={16} rx={8} fill={greenSoft} />
        <circle cx={267} cy={124} r={4} fill={green} />
        <Check x={264} y={122} />
        <text x={274} y={127} fontSize={6.5} fill={greenInk}>Firmado</text>
      </g>
    </svg>
  )
}

// ─── Pagos: lo que debe, el pago, el mes ─────────────────────────────────────

function Pagos() {
  return (
    <svg {...frame}>
      {/* El mes, arriba: lo pagado, lo pendiente. */}
      <g className={fx('in', 6)}>
        <rect x={10} y={10} width={146} height={44} rx={9} fill={card} stroke={border} />
        <text x={20} y={24} fontSize={6.5} fill={quiet} letterSpacing={0.4}>PAGADO</text>
        <rect x={164} y={10} width={146} height={44} rx={9} fill={card} stroke={border} />
        <text x={174} y={24} fontSize={6.5} fill={quiet} letterSpacing={0.4}>PENDIENTE</text>
        {/* Adentro del grupo que aparece, para que no estén antes que su tarjeta. */}
        <text x={20} y={44} fontSize={13} fill={ink} fontWeight={800} className={fx('out', 60)}>$ 0</text>
        <text x={20} y={44} fontSize={13} fill={greenInk} fontWeight={800} className={fx('pop', 60)}>$ 1.200</text>
        <text x={174} y={44} fontSize={13} fill={amberInk} fontWeight={800} className={fx('out', 60)}>$ 1.200</text>
        <text x={174} y={44} fontSize={13} fill={ink} fontWeight={800} className={fx('pop', 60)}>$ 0</text>
      </g>

      {/* Por paciente: la fila de Tomás. */}
      <g className={fx('in', 12)}>
        <rect x={10} y={66} width={300} height={74} rx={10} fill={card} stroke={border} />
        <text x={22} y={82} fontSize={7.5} fill={ink}>Por paciente</text>
        <line x1={10} x2={310} y1={90} y2={90} stroke={border} />
        <circle cx={32} cy={115} r={11} fill={coral} />
        <text x={32} y={118} fontSize={7.5} fill={card} textAnchor="middle">TP</text>
        <text x={50} y={113} fontSize={8} fill={ink}>Tomás Pérez</text>
        <text x={50} y={124} fontSize={6.5} fill={quiet} fontWeight={500}>1 sesión · octubre</text>
      </g>

      {/* Lo que debe, y el botón: llegan con la fila y se van con el pago. */}
      <g className={fx('in', 12)}>
        <g className={fx('out', 54)}>
          <rect x={168} y={106} width={60} height={18} rx={9} fill={amberSoft} />
          <text x={198} y={118} fontSize={7} fill={amberInk} textAnchor="middle">Debe $ 1.200</text>
          <rect x={234} y={106} width={66} height={18} rx={9} fill={violet} />
          <text x={267} y={118} fontSize={7} fill={card} textAnchor="middle">Registrar pago</text>
        </g>
      </g>
      <Tap x={267} y={115} at={42} />

      <g className={fx('pop', 54)}>
        <rect x={214} y={106} width={86} height={18} rx={9} fill={greenSoft} />
        <circle cx={224} cy={115} r={4.5} fill={green} />
        <Check x={221} y={113} />
        <text x={262} y={118} fontSize={7} fill={greenInk} textAnchor="middle">Pagó $ 1.200</text>
      </g>
    </svg>
  )
}

const SCENES: Record<SceneName, () => React.JSX.Element> = {
  bienvenida: Bienvenida,
  pacientes: Pacientes,
  agenda: Agenda,
  planificacion: Planificacion,
  informes: Informes,
  pagos: Pagos,
}
