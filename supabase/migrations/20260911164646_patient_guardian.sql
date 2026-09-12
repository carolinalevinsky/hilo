-- The adult responsible for a patient: who signs, who pays, who gets the report.
--
-- Most of Hilo's patients are children, and until now the ficha had no one to
-- address but the child. Ley 19.529 asks for the consent of the parent or
-- guardian of a minor, the consent link (next migration) goes to a person, and
-- a report "para la familia" is read by somebody with a name.
--
-- One responsable per patient, as columns on the patient rather than a contacts
-- table. Two parents who both want the report is a real case, and it is also the
-- case that makes a simple ficha complicated; it can become a table the day
-- somebody needs it. The phone is the one already on the patient, which the
-- form has always labelled "Teléfono de la familia".
--
-- All three are optional: an adult is their own responsable, and a child can be
-- signed up at the door with a name and nothing else.

alter table patients
  add column guardian_name         text,
  add column guardian_relationship text
    check (guardian_relationship in ('mother', 'father', 'guardian', 'other')),
  add column guardian_email        text
    check (guardian_email is null or guardian_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');
