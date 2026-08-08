import type { Metadata } from 'next'
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
