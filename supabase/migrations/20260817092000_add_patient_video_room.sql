-- Consulta online: a room id that says nothing, and somewhere to put your own
-- link instead.
--
-- ─── Why v1's version must not be copied ──────────────────────────────────
--
-- v1 built the room name out of the patient's own name
-- (`legacy/index.html:1935`):
--
--     https://meet.jit.si/Hilo-tomas-perez-x7k2p
--
-- `meet.jit.si` rooms are open to anyone holding the URL, so that link puts a
-- child's full name into an unauthenticated third-party address which then gets
-- pasted into WhatsApp threads and forwarded onward. It is the same class of
-- mistake as putting clinical content in an email, and it is what Ley N.º 18.331
-- is about. v1 also generated the id in memory (`current._room`), so it changed
-- on every reload and a link already sent to a family stopped working.
--
-- Both halves are fixed by storing a random id: the name lives in Hilo, where
-- the policy on this table decides who reads it, and the link carries only the
-- id. Stable, because it is stored; meaningless, because it is random.
--
-- ─── Why it is on `patients` and not on `appointments` ────────────────────
--
-- Per patient, as v1 had it. The point of the link is that a family can save it
-- and use it every week, which a per-session room would break — and the button
-- lives on the patient's ficha, not on a row in the agenda.
--
-- (An earlier migration in this same branch put it on `appointments`. It never
-- ran anywhere but a laptop, so it was replaced rather than corrected on top.)

alter table patients
  add column room_id text,

  -- For a practitioner who already has Zoom, Meet or a room from their
  -- institution. When this is set it wins: Hilo should not push its own service
  -- onto someone who has already chosen one.
  --
  -- **Validated as http(s) in `src/server/patients.ts` before it is ever
  -- stored.** It is rendered as a link, and an unchecked `javascript:` in an
  -- href is a script running with the practitioner's session. A check
  -- constraint here would be a second, weaker copy of that rule — this comment
  -- is the pointer to the real one.
  add column video_url text;

-- No index and no policy change: both columns are read as part of the patient
-- row, which the existing `own_rows` policy already governs.
