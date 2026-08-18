import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ChevronDown,
  Copy,
  Menu,
  Square,
  Trash2,
  X,
} from 'lucide-react'

/**
 * Hilo's icons, transcribed from v1 (`legacy/index.html:924-968`).
 *
 * Every icon in the product is drawn from those paths. They are not decoration:
 * a set has a voice — stroke weight, corner radius, how much white it leaves —
 * and swapping it for another well-made set (lucide, which is what v2 used)
 * changes how the whole product reads, in a way that is hard to name and
 * impossible to unsee once noticed.
 *
 * ─── Why this file looks like lucide ───────────────────────────────────────
 *
 * The exports are named exactly as lucide's, take the same props, and render
 * the same way, so switching a screen over is one import line and no change to
 * any JSX. That was deliberate: fifty files changed one line each is a diff you
 * can actually read, and it leaves no half-migrated screens.
 *
 * ─── The ones still coming from lucide ─────────────────────────────────────
 *
 * Nine at the bottom have no v1 original, because v1 drew them as text
 * characters (‹ › ×) or never needed them at all. They are re-exported here
 * rather than imported from lucide at each call site, so the whole product still
 * has exactly one place icons come from, and the exceptions are visible in one
 * list instead of scattered.
 *
 * If one of those nine is ever drawn in Hilo's own hand, it replaces its
 * re-export here and nothing else in the codebase moves.
 */

type IconProps = React.SVGProps<SVGSVGElement>

/**
 * What every icon here is. Named `LucideIcon` so the places that hold an icon
 * in a data structure — the nav, the stat card — change their import line and
 * nothing else.
 */
export type LucideIcon = (props: IconProps) => React.ReactElement

/** v1's `ic()` (`legacy/index.html:969`), as a component. */
function icon(path: React.ReactNode) {
  return function Icon({ className, ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
        {...props}
      >
        {path}
      </svg>
    )
  }
}

export const Home = icon(
  <path d="M19 7.90634V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V7.90634M2 10.0001L10.8531 3.80294C11.5417 3.32089 12.4583 3.32089 13.1469 3.80294L22 10.0001" />,
)

export const Users = icon(
  <path d="M18.5051 19H20C21.1046 19 22.0669 18.076 21.716 17.0286C21.1812 15.4325 19.8656 14.4672 17.5527 14.1329M14.5001 10.8645C14.7911 10.9565 15.1244 11 15.5 11C17.1667 11 18 10.1429 18 8C18 5.85714 17.1667 5 15.5 5C15.1244 5 14.7911 5.04354 14.5001 5.13552M9.5 14C13.1135 14 15.0395 15.0095 15.716 17.0286C16.0669 18.076 15.1046 19 14 19H5C3.89543 19 2.93311 18.076 3.28401 17.0286C3.96047 15.0095 5.88655 14 9.5 14ZM9.5 11C11.1667 11 12 10.1429 12 8C12 5.85714 11.1667 5 9.5 5C7.83333 5 7 5.85714 7 8C7 10.1429 7.83333 11 9.5 11Z" />,
)

export const User = icon(
  <>
    <path d="M17 20C18.1046 20 19.0454 19.0899 18.7951 18.0141C18.1723 15.338 16.0897 14 12 14C7.91032 14 5.8277 15.338 5.20492 18.0141C4.95455 19.0899 5.89543 20 7 20H17Z" />
    <path d="M12 11C14 11 15 10 15 7.5C15 5 14 4 12 4C10 4 9 5 9 7.5C9 10 10 11 12 11Z" />
  </>,
)

export const UserPlus = icon(
  <path d="M3 11H8M5.5 13.5V8.5M14.5 14C18.2966 14 20.2305 15.3374 20.8093 18.0121C21.0429 19.0917 20.1046 20 19 20H10C8.89543 20 7.95709 19.0917 8.19071 18.0121C8.76953 15.3374 10.7034 14 14.5 14ZM14.5 10C16.1667 10 17 9.14286 17 7C17 4.85714 16.1667 4 14.5 4C12.8333 4 12 4.85714 12 7C12 9.14286 12.8333 10 14.5 10Z" />,
)

const calendarPath = (
  <path d="M20 9H4M7 3V5M17 3V5M6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21Z" />
)

export const CalendarDays = icon(calendarPath)
export const CalendarPlus = icon(calendarPath)

const clockPath = (
  <path d="M16 14L12 12V7M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" />
)

export const Clock = icon(clockPath)
export const CalendarClock = icon(clockPath)

export const ClipboardList = icon(
  <path d="M9 18H20M9 12H20M9 6H20M4 17.5H5V18.5H4V17.5ZM4 11.5H5V12.5H4V11.5ZM4 5.5V6.5H5V5.5H4Z" />,
)

export const FileText = icon(
  <path d="M19 9L13 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V9ZM13 3V8C13 8.55228 13.4477 9 14 9H19" />,
)

export const Wallet = icon(
  <path d="M19 8V6C19 4.89543 18.1046 4 17 4H6C4.34315 4 3 5.34315 3 7V17C3 18.6569 4.34315 20 6 20H19C20.1046 20 21 19.1046 21 18V10C21 8.89543 20.1046 8 19 8ZM19 8H7M17 14H16" />,
)

export const MessageCircle = icon(
  <path d="M12 11H12.01M8 11H8.01M16 11H16.01M12.2896 17.9984C18.0965 17.9343 21 15.9189 21 11C21 6 18 4 12 4C6 4 3 6 3 11C3 14.0771 4.13623 16.018 6.40868 17.0557L5 21L12.2896 17.9984Z" />,
)

const trendPath = <path d="M3 17L9 11L13 15L21 7M16 7H21V12" />

export const TrendingUp = icon(trendPath)
export const ChartColumn = icon(trendPath)

export const ChartPie = icon(
  <path d="M19 13C19 17.4183 15.4183 21 11 21C6.58172 21 3 17.4183 3 13C3 8.58172 6.58172 5 11 5M11 11V4C11 3.44772 11.449 2.99475 11.9986 3.04924C16.7241 3.51775 20.4823 7.27586 20.9508 12.0014C21.0053 12.551 20.5523 13 20 13H13C11.8954 13 11 12.1046 11 11Z" />,
)

export const TriangleAlert = icon(
  <path d="M12 15H12.01M12 12V9M4.98207 19H19.0179C20.5615 19 21.5233 17.3256 20.7455 15.9923L13.7276 3.96153C12.9558 2.63852 11.0442 2.63852 10.2724 3.96153L3.25452 15.9923C2.47675 17.3256 3.43849 19 4.98207 19Z" />,
)

const checkPath = (
  <path d="M16 9L10 15.5L7.5 13M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" />
)

export const CircleCheck = icon(checkPath)
export const Check = icon(checkPath)

export const Printer = icon(
  <path d="M7 17H5C3.89543 17 3 16.1046 3 15V11C3 9.34315 4.34315 8 6 8H7M7 17V14H17V17M7 17V18C7 19.1046 7.89543 20 9 20H15C16.1046 20 17 19.1046 17 18V17M17 17H19C20.1046 17 21 16.1046 21 15V11C21 9.34315 19.6569 8 18 8H17M7 8V6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V8M7 8H17M15 11H17" />,
)

export const Plus = icon(
  <path d="M12 8V16M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" />,
)

export const Link2 = icon(
  <path d="M10 8H7C4.79086 8 3 9.79086 3 12C3 14.2091 4.79086 16 7 16H10M14 8H17C19.2091 8 21 9.79086 21 12C21 14.2091 19.2091 16 17 16H14M9 12H15" />,
)

const refreshPath = (
  <path d="M20.9844 6V10H17M20.9844 10L17.6569 6.34315C14.5327 3.21895 9.46734 3.21895 6.34315 6.34315C3.21895 9.46734 3.21895 14.5327 6.34315 17.6569C9.46734 20.781 14.5327 20.781 17.6569 17.6569C18.4407 16.873 19.0279 15.9669 19.4184 15" />
)

export const RefreshCw = icon(refreshPath)
export const RotateCw = icon(refreshPath)

export const DollarSign = icon(
  <path d="M12 3V21M15.679 6.63439C14.063 4.2691 7.94541 4.02196 7.94541 8.16745C7.94541 12.3129 16.7524 10.33 16.2439 15.2118C15.8199 19.2823 9.19299 19.3384 7.21094 16.0891" />,
)

export const SlidersHorizontal = icon(
  <>
    <path d="M9.65202 4.56614C9.85537 3.65106 10.667 3 11.6044 3H12.3957C13.3331 3 14.1447 3.65106 14.3481 4.56614L14.551 5.47935C15.2121 5.73819 15.8243 6.09467 16.3697 6.53105L17.2639 6.24961C18.1581 5.96818 19.1277 6.34554 19.5964 7.15735L19.9921 7.84264C20.4608 8.65445 20.3028 9.68287 19.612 10.3165L18.9218 10.9496C18.9733 11.2922 19.0001 11.643 19.0001 12C19.0001 12.357 18.9733 12.7078 18.9218 13.0504L19.612 13.6835C20.3028 14.3171 20.4608 15.3455 19.9921 16.1574L19.5965 16.8426C19.1278 17.6545 18.1581 18.0318 17.2639 17.7504L16.3698 17.4689C15.8243 17.9053 15.2121 18.2618 14.551 18.5206L14.3481 19.4339C14.1447 20.3489 13.3331 21 12.3957 21H11.6044C10.667 21 9.85537 20.3489 9.65202 19.4339L9.44909 18.5206C8.78796 18.2618 8.17579 17.9053 7.63034 17.4689L6.73614 17.7504C5.84199 18.0318 4.87234 17.6545 4.40364 16.8426L4.00798 16.1573C3.53928 15.3455 3.69731 14.3171 4.38811 13.6835L5.07833 13.0504C5.02678 12.7077 5.00005 12.357 5.00005 12C5.00005 11.643 5.02678 11.2922 5.07833 10.9496L4.38813 10.3165C3.69732 9.68288 3.5393 8.65446 4.008 7.84265L4.40365 7.15735C4.87235 6.34554 5.842 5.96818 6.73616 6.24962L7.63035 6.53106C8.1758 6.09467 8.78796 5.73819 9.44909 5.47935L9.65202 4.56614Z" />
    <path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" />
  </>,
)

export const Sparkles = icon(
  <path d="M12 3C12 7.97056 7.97056 12 3 12C7.97056 12 12 16.0294 12 21C12 16.0294 16.0294 12 21 12C16.0294 12 12 7.97056 12 3Z" />,
)

export const BookOpen = icon(
  <path d="M12 20.2491C14.4519 18.1444 19.3058 18.5499 22 19.811V6.14784C18.1962 5.14533 13.5586 5.24601 12 7.32234C10.4414 5.24601 5.80377 5.14533 2 6.14784V19.811C4.69417 18.5499 9.5481 18.1444 12 20.2491ZM12 7.32234V20.2491" />,
)

export const Compass = icon(
  <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3M12 21C9.4651 18.3899 8 15.3051 8 12C8 8.69488 9.4651 5.61005 12 3M12 21C14.5349 18.3899 16 15.3051 16 12C16 8.69488 14.5349 5.61005 12 3M20 9H4M20 15H4" />,
)

/**
 * Same drawing, both of v1's names for it: `globe` on "Público · comunidad" and
 * `compass` on the public booking page.
 */
export const Globe = Compass

export const Video = icon(
  <path d="M15 8.5V7C15 5.9 14.1 5 13 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19H13C14.1 19 15 18.1 15 17V15.5M15 8.5L21 5.75V18.25L15 15.5M15 8.5V15.5" />,
)

export const Lock = icon(
  <path d="M8 11V7.5C8 5.29 9.79 3.5 12 3.5C14.21 3.5 16 5.29 16 7.5V11M6.8 11H17.2C18.19 11 19 11.81 19 12.8V18.7C19 19.69 18.19 20.5 17.2 20.5H6.8C5.81 20.5 5 19.69 5 18.7V12.8C5 11.81 5.81 11 6.8 11Z" />,
)

export const Send = icon(<path d="M21 3L3 10L10 14L14 21L21 3ZM10 14L21 3" />)

export const Search = icon(
  <path d="M13.3891 13.3891L19 19M9.5 15C12.5376 15 15 12.5376 15 9.5C15 6.4624 12.5376 4 9.5 4C6.4624 4 4 6.4624 4 9.5C4 12.5376 6.4624 15 9.5 15Z" />,
)

export const Target = icon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3.6" />
  </>,
)

export const Camera = icon(
  <>
    <path d="M4 8.5h2.6l1.6-2h7.6l1.6 2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.1" />
  </>,
)

export const Mic = icon(
  <path d="M12 15C13.66 15 15 13.66 15 12V6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6V12C9 13.66 10.34 15 12 15ZM5 11V12C5 15.87 8.13 19 12 19C15.87 19 19 15.87 19 12V11M12 19V22" />,
)

export const Download = icon(
  <path d="M12 3V15M12 15L8 11M12 15L16 11M5 17V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V17" />,
)

export const Inbox = icon(
  <path d="M9 4H7C5.9 4 5 4.9 5 6V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6C19 4.9 18.1 4 17 4H15M9 4C9 5.1 9.9 6 11 6H13C14.1 6 15 5.1 15 4M9 4C9 2.9 9.9 2 11 2H13C14.1 2 15 2.9 15 4M9 12H15M9 16H13" />,
)

export const MoreHorizontal = icon(
  <>
    <circle cx="5" cy="12" r="1.9" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.9" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.9" fill="currentColor" stroke="none" />
  </>,
)

export const Pencil = icon(
  <path d="M4 20H8L18.5 9.5C19.33 8.67 19.33 7.33 18.5 6.5C17.67 5.67 16.33 5.67 15.5 6.5L5 17V20M13.5 8.5L16.5 11.5" />,
)

export const Eye = icon(
  <>
    <path d="M2 12C2 12 5.6 5.5 12 5.5C18.4 5.5 22 12 22 12C22 12 18.4 18.5 12 18.5C5.6 18.5 2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
)

export const EyeOff = icon(
  <path d="M3 3L21 21M10.6 10.7C10.2 11.1 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 13 13.8 13.4 13.4M9.4 5.2C10.2 5 11 4.9 12 4.9C18.4 4.9 22 12 22 12C21.4 13.1 20.7 14.1 19.9 15M6.1 6.2C3.8 7.7 2 12 2 12C2 12 5.6 18.5 12 18.5C13.7 18.5 15.2 18.1 16.4 17.4" />,
)

/**
 * No v1 original. v1 drew arrows and closes as text characters (‹ › ×) and
 * never needed the rest. Re-exported so every icon in the product still comes
 * from this one module.
 */
export {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ChevronDown,
  Copy,
  Menu,
  Square,
  Trash2,
  X,
}
