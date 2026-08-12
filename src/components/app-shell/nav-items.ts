import {
  CalendarDays,
  FileText,
  Home,
  Inbox,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/**
 * The navigation, in one place, used by both the desktop sidebar and the mobile
 * bottom bar.
 *
 * **Entries are added as their milestone lands, not before.** A nav item
 * pointing at a route that does not exist yet turns every preview URL into a
 * tour of 404s, and the whole point of shipping milestone by milestone is that
 * someone non-technical can click around and tell you whether it is right.
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
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/inicio', label: 'Inicio', icon: Home, onMobileBar: true },
  { href: '/pacientes', label: 'Pacientes', icon: Users, onMobileBar: true },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays, onMobileBar: true },
  { href: '/informes', label: 'Informes', icon: FileText },
  { href: '/cobros', label: 'Cobros', icon: Wallet, onMobileBar: true },
  { href: '/reservas', label: 'Reservas', icon: Inbox },
]

export const MOBILE_BAR_ITEMS = NAV_ITEMS.filter((item) => item.onMobileBar)
export const MOBILE_SHEET_ITEMS = NAV_ITEMS.filter((item) => !item.onMobileBar)
