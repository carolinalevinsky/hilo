import { redirect } from 'next/navigation'

/**
 * The root, for someone who is not signed in, is the sign-in screen.
 *
 * Anyone with a session never gets here — the proxy sends them to `/inicio`.
 */
export default function RootPage() {
  redirect('/entrar')
}
