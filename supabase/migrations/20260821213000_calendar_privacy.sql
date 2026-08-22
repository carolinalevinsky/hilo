-- Cuánto de un paciente sale hacia Google Calendar.
--
-- Hoy no se pregunta: el link "Agregar a Google Calendar" del menú de cada
-- sesión manda `Sesión con <nombre y apellido>`. Eso deja escrito en un servidor
-- de Google, fuera del país, que esa persona es paciente de esta profesional.
--
-- La Ley 18.331 permite expresamente que un profesional de la salud trate los
-- datos de sus pacientes bajo secreto profesional. Mandarlos a un tercero en
-- otro país es otro acto, y para datos sensibles la lectura prudente pide
-- consentimiento del titular o de su familia.
--
-- Esa decisión es de la profesional, no del programa. Lo que sí decide el
-- programa es que sea una decisión y no un descuido: por eso hay una columna, y
-- por eso arranca en lo más reservado.
--
-- Ninguna opción manda nunca la nota clínica, el motivo de consulta ni los
-- objetivos. Eso no sale de Hilo por este camino bajo ninguna configuración.

alter table practitioners
  add column calendar_privacy text not null default 'busy'
    check (calendar_privacy in ('busy', 'initials', 'first_name'));

comment on column practitioners.calendar_privacy is
  'Qué se ve del paciente en Google Calendar: busy = "Ocupado", initials = "T. P.", first_name = "Tomás". Nunca la nota.';

-- Sobre RLS: `practitioners` ya tiene su política de filas propias y una columna
-- nueva no cambia qué filas se ven. `check:rls` mira tablas, no columnas, y
-- sigue en verde por la razón correcta.
