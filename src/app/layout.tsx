import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'

// Inter is the v1 typeface. Keeping it is not inertia — it was chosen, it reads
// well at small sizes in dense clinical tables, and changing it would change how
// every screen feels.
const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// User-facing text is Rioplatense Spanish. Code and comments are English.
export const metadata: Metadata = {
  title: 'Hilo',
  description:
    'La herramienta de gestión para profesionales de la salud y la educación.',
  icons: {
    // iOS ignores the manifest's `icons`, so the home screen icon has to be
    // declared here as well or it falls back to a screenshot of the page.
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    // What makes "Agregar a inicio" on iOS open standalone instead of Safari.
    // iOS has no `beforeinstallprompt`, so this is the whole iOS install story.
    capable: true,
    title: 'Hilo',
    statusBarStyle: 'default',
  },
  other: {
    // Next.js emits only the standardised `mobile-web-app-capable`, which
    // WebKit did not honour before iOS 17.4. The old Apple-prefixed name is
    // what an older iPhone reads, and there are plenty of those in consulting
    // rooms here. Without it, "Agregar a inicio" opens Safari with its chrome.
    'apple-mobile-web-app-capable': 'yes',
  },
}

// Separate from `metadata` because Next.js 16 requires it: `themeColor` moved
// out of the metadata export. It tints the phone's status and address bars.
export const viewport: Viewport = {
  themeColor: '#6c5ce7',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es-UY"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
