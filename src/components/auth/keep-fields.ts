import { startTransition, type FormEvent } from 'react'

/**
 * Sends a form to its action without React emptying it afterwards.
 *
 * With `<form action={…}>` React 19 resets every uncontrolled field once the
 * action answers — including when the answer is "no". Somebody accepting an
 * invitation who forgot the terms box got the message *and* an empty password
 * field, typed it again, forgot something else, and lost it again. A wrong
 * password is the same: it is easier to fix one letter you can see (the eye is
 * there for that) than to retype the whole thing blind.
 *
 * Dispatching the action ourselves inside a transition keeps `pending` and
 * `state` from `useActionState` working as before, and skips the reset. The
 * `action` attribute stays on the form, so it still submits without JavaScript.
 */
export function submitKeepingFields(action: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => action(formData))
  }
}
