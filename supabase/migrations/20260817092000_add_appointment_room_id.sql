-- Consulta online: a stable, meaningless room id per appointment.
--
-- v1 had this button and it must not be copied. It built the room name out of
-- the patient's own name (`legacy/index.html`, "Consulta online"):
--
--     https://meet.jit.si/Hilo-tomas-perez-x7k2p
--
-- `meet.jit.si` rooms are open to anyone holding the URL, so that link puts a
-- child's full name into an unauthenticated third-party address that then gets
-- pasted into WhatsApp threads and forwarded. It is the same class of mistake as
-- putting clinical content in an email, and it is what Ley N.º 18.331 is about.
-- v1 also generated the id in memory, so it changed on every reload and a link
-- already sent to a family stopped working.
--
-- Both halves are fixed by one column: a random id, stored, that says nothing.
-- The name lives in Hilo, where the policy below decides who reads it; the link
-- carries only the id.

alter table appointments
  add column room_id text;

-- No index: this is read as part of the appointment row, never searched by.
