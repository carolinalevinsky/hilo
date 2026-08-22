import {
  CalendarDays,
  ClipboardList,
  FileText,
  Home,
  Users,
  Wallet,
  type LucideIcon,
} from '@/components/icons'

/**
 * The navigation, in one place, used by both the desktop sidebar and the mobile
 * bottom bar.
 *
 * **These six, in this order, are v1's** (`legacy/index.html:538-544`) minus
 * Clínica, which v2 does not have. The order is not alphabetical and not
 * arbitrary: it walks the working day — who am I seeing, who are they, when,
 * what am I preparing, what do I have to write, who owes me.
 *
 * Three screens that exist as routes are deliberately **not** here, because in
 * v1 they were never top-level destinations — each one belongs to the screen
 * that gives it meaning, and promoting them to the sidebar is what made v2 feel
 * like a different product:
 *
 *   /materiales     a tab inside Planificación   (`legacy/index.html:611`)
 *   /reservas       a card at the top of Agenda  (`legacy/index.html:1499`)
 *   /estadisticas   a link at the foot of Inicio (`legacy/index.html:568`)
 *
 * If one of them loses its entry point, it becomes unreachable. Adding it back
 * here is not the fix — restoring the entry point is.
 *
 * `onMobileBar` marks the four that fit across the bottom of a phone; the rest
 * live behind "Más". v1 chose Inicio / Pacientes / Agenda / Cobros
 * (`legacy/index.html:997`) and that choice was correct — those are the screens
 * opened between sessions, standing up, with a patient in the room.
 */

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  onMobileBar?: boolean
  /**
   * Extra route prefixes that should light this item up. A screen that lives
   * *inside* another one — Materiales inside Planificación — has its own URL but
   * is not its own destination, and a sidebar with nothing highlighted reads as
   * "you have left the app".
   */
  alsoActiveFor?: string[]
}

/** Whether `pathname` is inside `href` — the route itself or anything under it. */
function within(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isNavItemActive(item: NavItem, pathname: string) {
  return (
    within(pathname, item.href) ||
    (item.alsoActiveFor?.some((href) => within(pathname, href)) ?? false)
  )
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/inicio', label: 'Inicio', icon: Home, onMobileBar: true, alsoActiveFor: ['/estadisticas'] },
  { href: '/pacientes', label: 'Pacientes', icon: Users, onMobileBar: true },
  {
    href: '/agenda',
    label: 'Agenda',
    icon: CalendarDays,
    onMobileBar: true,
    alsoActiveFor: ['/reservas'],
  },
  {
    // Lands on the materials library, which is the tab v1 opened
    // (`legacy/index.html:611` — `planiTab('mat')` is the default). Both halves
    // sit under one "Planificación" heading with the tabs between them, so this
    // decides which one you see first, not which ones exist. Materials is the
    // right first screen: it is the half you browse, and the planner is the half
    // you go to once you have found something.
    href: '/materiales',
    label: 'Planificación',
    icon: ClipboardList,
    alsoActiveFor: ['/planificacion'],
  },
  {
    href: '/informes',
    label: 'Informes y evaluaciones',
    icon: FileText,
    alsoActiveFor: ['/evaluaciones'],
  },
  { href: '/cobros', label: 'Cobros', icon: Wallet, onMobileBar: true },
]

export const MOBILE_BAR_ITEMS = NAV_ITEMS.filter((item) => item.onMobileBar)
export const MOBILE_SHEET_ITEMS = NAV_ITEMS.filter((item) => !item.onMobileBar)
