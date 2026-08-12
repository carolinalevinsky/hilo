import type { ReactNode } from 'react'

/**
 * The look of a signed clinical document: title, who and when, the body, and a
 * signature line. Ported from v1's `.doc` (`legacy/index.html:2757`).
 *
 * It is a document, not a screen. Serif-free but generous, printed-page width,
 * and a signature block with the practitioner's name under a rule — because the
 * thing being produced here is a piece of paper that goes to a school with
 * someone's professional name on it, and it should look like one on the way out.
 */
export function ClinicalDocument({
  title,
  subtitle,
  meta,
  children,
  footer,
}: {
  title: string
  subtitle: string
  meta?: { label: string; value: string }[]
  children: ReactNode
  footer: { name: string; discipline: string }
}) {
  return (
    <article className="hilo-doc mx-auto max-w-[720px] rounded-lg bg-card px-6 py-8 shadow-card sm:px-10">
      <h1 className="text-center text-[20px] font-extrabold tracking-[-0.4px]">{title}</h1>
      <p className="mt-1 text-center text-[12.5px] text-muted-foreground">{subtitle}</p>

      {meta && meta.length > 0 ? (
        <dl className="mt-5 grid gap-x-5 gap-y-1 border-y border-border py-3 text-[12.5px] sm:grid-cols-2">
          {meta.map((entry) => (
            <div key={entry.label} className="flex gap-1.5">
              <dt className="font-bold">{entry.label}:</dt>
              <dd className="min-w-0">{entry.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-5">{children}</div>

      <div className="mt-12 text-center">
        <div className="mx-auto mb-1.5 h-px w-52 bg-foreground/60" />
        <p className="text-[13px] font-bold">{footer.name}</p>
        <p className="text-[12px] text-muted-foreground">{footer.discipline}</p>
      </div>
    </article>
  )
}

/**
 * The body, rendered from plain text.
 *
 * The document has exactly two kinds of line: a short heading ending in a colon,
 * and a paragraph. That is what the prompt asks the model for, and it is what
 * the offline draft produces, so one renderer covers both.
 *
 * Plain text in, React elements out — no `dangerouslySetInnerHTML` anywhere in
 * this path. v1 built these documents by concatenating HTML strings, which is
 * the habit behind its XSS surface, and the text here comes from a language
 * model and a practitioner's keyboard.
 */
export function DocumentBody({ text }: { text: string }) {
  const blocks = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="space-y-2.5 text-[14px] leading-[1.65]">
      {blocks.map((line, index) =>
        isHeading(line) ? (
          <h2 key={index} className="pt-2 text-[14px] font-extrabold">
            {line}
          </h2>
        ) : (
          <p key={index}>{line}</p>
        ),
      )}
    </div>
  )
}

/**
 * A heading is a short line that ends in a colon. Both halves matter: without
 * the length limit, "Se sugiere lo siguiente:" at the end of a paragraph would
 * become a heading.
 */
function isHeading(line: string): boolean {
  return line.endsWith(':') && line.length <= 60
}
