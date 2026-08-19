'use client'

/**
 * The goal picker in "Plan de la semana", which saves as soon as you pick.
 *
 * v1 saved on change (`onchange="setPlanObj(…)"`) and that is the right
 * behaviour for a row of a list — a dropdown with its own Save button beside it,
 * eight times down the page, is a worse screen.
 *
 * A four-line client island rather than a client-rendered panel: everything
 * around it stays a Server Component, and this only exists because a `<select>`
 * cannot submit its own form without JavaScript. Without it the control would
 * look interactive and quietly change nothing, which is the failure mode worth
 * avoiding.
 */
export function FocusSelect({
  name,
  defaultValue,
  label,
  options,
}: {
  name: string
  defaultValue: string
  label: string
  options: { id: string; title: string; progress: number }[]
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      aria-label={label}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.title} ({option.progress}%)
        </option>
      ))}
    </select>
  )
}
