import Link from 'next/link'

import { Wordmark } from '@/components/brand/wordmark'

/**
 * The shell around signing in and signing up.
 *
 * The violet gradient is v1's (`legacy/index.html:503`). It is the first thing a
 * practitioner sees and it is the only screen in the product that is not white —
 * keeping it is what makes the app recognisable before a single word is read.
 */
export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="app-auth-bg flex min-h-dvh items-center justify-center overflow-auto p-5">
      <div className="w-full max-w-[400px] rounded-[24px] bg-card px-7 pt-8 pb-6 shadow-[0_30px_80px_rgba(20,14,60,0.45)]">
        <Link href="/" className="mb-5 flex items-center gap-2.5">
          <Wordmark height={22} />
        </Link>
        {children}
      </div>
    </div>
  )
}
