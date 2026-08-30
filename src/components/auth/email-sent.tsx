import { MailCheck } from 'lucide-react'

/**
 * What replaces the form once an email is on its way.
 *
 * It replaces the form rather than sitting above it because the next step is in
 * the inbox, not on this screen — leaving the fields there invites a second
 * submit and a second email.
 */
export function EmailSent({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-green-soft px-4 py-5 text-center">
      <MailCheck className="mx-auto size-7 text-green" aria-hidden />
      <p className="mt-2.5 text-[14px] font-bold">{title}</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}
