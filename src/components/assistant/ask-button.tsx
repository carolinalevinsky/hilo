'use client'

import { MessageCircle } from '@/components/icons'

import { useAsk } from '@/components/assistant/ask-dock'

/**
 * "Preguntá a Ombúa" in the phone's top bar, beside the account.
 *
 * It was a violet circle in the bottom bar, and it was the loudest thing on
 * every screen. Up here it is the chat bubble alone, in a soft violet circle the
 * size of the account's: an action, not a destination, so it sits apart from
 * the tabs — and the top-right corner is where the thumb does not rest, so it
 * is never pressed by accident. The bubble is v1's, so it is recognised
 * without a word.
 */
export function AskButton() {
  const askOmbua = useAsk()

  return (
    <button
      type="button"
      onClick={askOmbua}
      aria-haspopup="dialog"
      aria-label="Preguntale a Ombúa"
      title="Preguntale a Ombúa"
      className="flex size-9 items-center justify-center rounded-full bg-violet-soft text-violet active:brightness-95"
    >
      <MessageCircle className="size-[19px]" />
    </button>
  )
}
