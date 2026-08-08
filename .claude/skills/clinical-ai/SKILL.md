---
name: clinical-ai
description: Work on Hilo's AI features — clinical reports, assessment analysis, prompts. Use before touching src/server/ai.ts, any prompt text, or anything that calls Anthropic.
---

# Clinical AI in Hilo

The output of these features is a document that a licensed professional signs
and sends to a school, a family, or a health insurer. Treat it accordingly.

## The prompt is a clinical artifact, not copy

`legacy/api/ia.js` lines 6–24 hold `BASE_INSTRUCTIVO`. It is good and it was
carefully written. Port it verbatim; do not "improve" it.

Its rules exist for reasons:

| Rule | Why it is there |
|---|---|
| Use only the data given; never invent results, diagnoses, or history | An invented finding in a signed clinical report is a professional liability, not a bug |
| Interpret scores, do not repeat them. A low percentile is a *descended* area | v1 users found the model writing "sostener los logros" about a weak area — actively wrong clinical advice |
| No closed diagnoses. Hypothesise: "se observa", "podría beneficiarse de" | Diagnosis is the professional's act, not the tool's |
| The professional's judgement and signature are always theirs | The output is a draft to review |
| Respect professional secrecy and Ley N.º 18.331 | Uruguayan data protection law |
| Rioplatense Spanish, full connected sentences, no AI tics | It has to read like the professional wrote it |

Per-recipient register (family / school / ANEP adecuaciones / health insurer /
patient) is also defined there. Each recipient needs a genuinely different tone,
not a relabelled one.

## Model

```ts
// src/server/ai.ts
const MODEL = 'claude-opus-5'
```

**Pinned in code. Never resolved at runtime.** v1 asked the account for a model
list and took the first `/haiku/i` match, which meant the quality of a signed
clinical report depended on what that list returned that day.

Changing the model is a deliberate one-line edit followed by a review of saved
reports — not a cost optimisation to slide in.

## Using the API

Use the official SDK (`@anthropic-ai/sdk`), never hand-rolled `fetch`.

Specific to this model:

- **Thinking is on by default.** `max_tokens` caps thinking *plus* output text
  together, so size it well above the expected report length or the report
  truncates.
- **Stream anything above ~16,000 `max_tokens`.** Report generation is the
  request most likely to hit a serverless timeout, and streaming also means the
  practitioner watches the report being written instead of staring at a spinner
  for thirty seconds.
- **Check `stop_reason === 'refusal'` before reading `content`.** A declined
  request returns HTTP 200 with empty or partial content. Code that reads
  `content[0].text` unconditionally crashes. Clinical prompts are benign, but
  adjacent life-sciences vocabulary can trip a classifier.
- **Do not add "double-check your work" instructions.** This model self-verifies;
  telling it to verify causes redundant work. This inverts the usual advice.
- **Cache the instruction block.** `BASE_INSTRUCTIVO` is identical on every
  request — put a cache breakpoint at the end of the system prompt and keep
  per-request content strictly after it.

## Every AI endpoint must

1. **Resolve the session.** v1's `/api/ia` had no authentication at all — anyone
   who found the URL could drain the Anthropic key.
2. **Check the monthly quota, server-side, before calling Anthropic.** v1 checked
   the plan limit in the browser, which anyone can edit.

```sql
select count(*) from reports
where practitioner_id = $1
  and created_at >= date_trunc('month', now());
```

No usage-counter table. A counter is a second copy of the truth that drifts.

3. **Record `ai_generated` and `ai_model` on the row.** When a model is later
   replaced, we need to know which reports came from which version. These are
   documents a professional signed.

## Checklist

- [ ] Session checked before the call
- [ ] Quota checked before the call
- [ ] Model is the pinned constant
- [ ] `stop_reason: 'refusal'` handled
- [ ] Streaming for long generations
- [ ] `ai_model` stored with the result
- [ ] Prompt still says: only given data, interpret don't repeat, no closed diagnoses
