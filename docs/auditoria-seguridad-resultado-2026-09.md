# Auditoría de seguridad — Hilo · resultado

**Fecha:** 6 de septiembre de 2026
**Alcance:** las dieciséis líneas de investigación de `docs/auditoria-seguridad-hilo.md`.

**Dos pasadas, y la segunda existe porque la primera se equivocó de rama:**

| | Rama | Qué cubrió |
|---|---|---|
| 1.ª | `chat-con-memoria` (`98b698d`) | Las dieciséis líneas, pero sobre una rama 16 commits atrás de `main` |
| 2.ª | `origin/main` (`1231308`) | Los 16 commits que faltaban — Agenda, Informes, `format_requests` |

**Modo:** lectura estática, y ejecución donde se pudo. La primera pasada se
entregó diciendo "no se ejecutó nada", que era falso: en esta máquina no hay
Node en el host **a propósito** —todo corre adentro de Docker con `./dx`, ver
el comentario de ese script— y eso se descubrió recién después. Lo que sigue
está verificado corriendo, salvo donde diga lo contrario.

---

## Estado de los arreglos — 6 de septiembre de 2026

Los tres ALTO están arreglados y **verificados**, en la rama
`arreglos-seguridad`, que sale de `origin/main`:

```
c87d5c6  Las tres tablas que nadie miraba, en el test de aislamiento
b9930a6  El asistente dice el nombre, no el apellido
d3beb60  El plan no se lo puede cambiar quien lo paga
f55486f  La cookie de sesión, fuera del alcance de cualquier script
```

Sobre esa rama: **247 tests en verde**, `lint`, `typecheck`, `check:migration`,
`check:secrets`, `check:rls` y `check:boundaries`, todo limpio. Además de los
tests, dos comprobaciones directas contra la base porque un verde no prueba por
qué es verde:

- `update practitioners set plan='pro'` como `authenticated` →
  `ERROR: permission denied`, y el formulario de perfil sigue andando.
- Con la política de `format_requests` aflojada a `using (true)`, los dos casos
  nuevos del test se ponen rojos; con la política de vuelta, verdes.

| Hallazgo | Estado |
|---|---|
| Cookie sin `HttpOnly` ni `Secure` | **Arreglado** — `src/lib/auth-cookie.ts`, `db.ts`, `proxy.ts` |
| `plan = 'pro'` auto-otorgable | **Arreglado** — migración de permisos por columna, con dos casos de test |
| Nombre y apellido al asistente | **Arreglado** — nombre de pila, con inicial sólo si hay dos iguales |
| `payments`, `booking_requests` y `format_requests` sin test de aislamiento | **Arreglado** — las tres, en las dos mitades |
| Borrar filas devuelve la cuota | **Abierto** — segunda mitad del hallazgo del plan. Necesita una tabla de consumo que la usuaria no pueda borrar; es una decisión de diseño, no un arreglo mecánico. |

Un ALTO más apareció durante el arreglo y era propio: la primera versión de la
migración de permisos **rompía el recorrido guiado**, porque se escribió sobre
la rama vieja donde nadie escribía `onboarded_at`. Arreglado y contado entero en
la segunda pasada, más abajo. Es la mejor ilustración de por qué esto tiene dos
pasadas.

Los MEDIO y los BAJO de las dos pasadas siguen todos abiertos.

---

## Resumen en una línea

**No encontré ninguna fuga de datos clínicos entre inquilinas.** El aislamiento
por RLS está bien construido, se aplica en las dieciocho tablas, y las veinte
llamadas con clave de servicio llevan todas su filtro de inquilino explícito.
Lo que sí encontré son tres cosas de severidad alta que no son fugas entre
inquilinas: la cookie de sesión viaja sin `HttpOnly` ni `Secure`, la cuota de
IA es auto-modificable por cualquier usuaria autenticada, y el asistente manda
a Anthropic más datos de los que su propia documentación dice que manda.

---

## Corrección importante: auditué la rama equivocada

**Esto lo descubrí después de entregar el informe, y corrige lo que decía acá.**

`chat-con-memoria` está **16 commits atrás de `origin/main`** y 8 adelante. O
sea que lo que auditué no es lo que está desplegado.

Lo que decía antes —"el mapa está desactualizado, `format_requests` no
existe"— estaba mal: **el mapa que me diste describía `main`, y era correcto.**
`format_requests` existe en `origin/main` desde el commit `038ff23`, con su
migración `20260905211104_format_requests.sql`, y con ella vienen `OWNER_EMAIL`
en `src/lib/env.ts` y `sendFormatRequestNotification` en
`src/server/notifications.ts`. En `main` son 19 tablas, como decía el mapa.

Miré la migración de `format_requests` y **la tabla está bien**: RLS activo,
política de filas propias con `with check`, `(select auth.uid())` envuelto,
`practitioner_id not null`, y un `check` de largo sobre `detail` en la base y no
sólo en el formulario. Eso cubre la línea 1 de la auditoría para esa tabla.

**Lo que sigue sin auditar es el código alrededor de ella y los otros quince
commits de `main`.** En particular, y todo cae dentro del alcance que me diste:

- `sendFormatRequestNotification` y la acción que la llama — es exactamente lo
  que pregunta la línea 12 ("¿qué texto se reenvía y a dónde?") y el punto 5 de
  "Lo que ya está decidido" ("auditá si esa promesa se puede romper").
- `PLAN_LIMITS` cambió en `main`: el plan gratis pasó de 5 a 10 informes. No
  cambia el hallazgo de la cuota, pero sí los números.
- `7728196` "El link de reservas sale de la dirección real, no de una variable"
  — toca la superficie pública, línea 8.
- `8d6b6db` sobre el remitente de Resend — toca la línea 12.

Lo que sí sigue en pie de mi corrección original: **no hay webhook de Google.**
Verifiqué los manejadores de ruta de `origin/main` y son los mismos trece (12
bajo `/api/` más `/confirmar`); las columnas de canal de `google_accounts`
siguen sin usarse.

Todo lo demás del informe —los hallazgos, y sobre todo el "dónde miré y no
encontré nada"— **vale para `chat-con-memoria`, no para `main`.** Los tres ALTO
sí están confirmados en las dos ramas: verifiqué que `origin/main` tiene el
mismo `patient.fullName` en el padrón (`assistant.ts:140`), el mismo
`createServerClient` sin `cookieOptions` en `db.ts` y en `proxy.ts`, y ningún
`revoke` sobre `practitioners`.

---

# Hallazgos

---

### [ALTO] La cookie de sesión de Supabase se emite sin `HttpOnly` y sin `Secure`

> **ARREGLADO el 6/9/2026.** Las opciones ahora viven en `src/lib/auth-cookie.ts`
> y las pasan tanto `getDb()` como el proxy. Sin verificar por CI.

**Estado:** CONFIRMADO
**Dónde:** `src/server/db.ts:30-46`, `src/proxy.ts:74-88`,
`node_modules/@supabase/ssr/dist/main/utils/constants.js:4`
**Clase:** exposición de credencial de sesión / amplificador de toma de cuenta

**Qué pasa.** Ni `getDb()` ni el proxy le pasan `cookieOptions` a
`createServerClient`, así que la librería aplica sus valores por omisión:

```js
DEFAULT_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
  httpOnly: false,          // ← acá
  maxAge: 400 * 24 * 60 * 60,
}
```

No hay ninguna clave `secure` en ese objeto ni en ningún otro lugar de
`@supabase/ssr` (`grep -rn secure` sobre `cookies.js` y
`createServerClient.js` no devuelve nada). Esas opciones se pasan tal cual a
`cookieStore.set(name, value, options)` en `db.ts:39` y a
`response.cookies.set(name, value, options)` en `proxy.ts:84`.

La cookie `sb-<ref>-auth-token` no guarda un identificador de sesión: guarda el
JSON entero de la sesión, **access token y refresh token incluidos**, troceado
en varias cookies si hace falta.

**Cómo se explota.** Con la sesión abierta, en la consola del navegador:

```js
document.cookie.match(/sb-[^=]+-auth-token(\.\d+)?=[^;]+/g)
```

devuelve el refresh token en claro. Cualquier XSS, cualquier extensión de
navegador con permiso de lectura de cookies, y cualquier script de terceros que
alguna vez entre a este dominio, se lleva una credencial que renueva sola.
Sin `Secure`, además, el navegador la manda en el primer pedido `http://` a
ese host (en Vercel la HSTS que agrega la plataforma tapa esto en la práctica;
`HttpOnly` no lo tapa nada).

Contrasta directamente con el cuidado que sí hay en el resto del proyecto:
`RECOVERY_COOKIE_OPTIONS` (`src/app/(auth)/recovery-cookie.ts:22-28`) y la
cookie de `state` de Google (`src/app/api/google/conectar/route.ts:39-45`)
ambas ponen `httpOnly: true` y `secure` explícitos. La cookie que vale más que
las dos juntas es la única que no lo hace, y no por decisión: por omisión.

**Qué se filtra.** El access token y el refresh token de la profesional. Con
ellos se lee y se escribe todo lo que su sesión alcanza, que es su historia
clínica completa.

**Cómo se arregla.** En los dos lugares que crean el cliente:

```ts
createServerClient<Database>(url, key, {
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
  cookies: { … },
})
```

Sin efecto colateral: la regla 2 de `eslint.config.mjs` ya prohíbe importar
`@supabase/*` desde `src/app/` y `src/components/`, así que **no hay ningún
cliente de Supabase en el navegador que necesite leer esta cookie**. El
`maxAge` de 400 días también conviene bajarlo.

**Alcance.** Los dos únicos lugares donde se crea un cliente con cookies:
`src/server/db.ts` y `src/proxy.ts`. Los dos tienen el mismo defecto.

---

### [ALTO] Una profesional puede ponerse `plan = 'pro'` sola, y vaciar su propia cuota borrando filas

> **ARREGLADO A MEDIAS el 6/9/2026.** La mitad del plan está cerrada en
> `supabase/migrations/20260906120000_practitioners_column_grants.sql`, con dos
> casos nuevos en `rls.test.ts`. **La mitad de la cuota sigue abierta**: contar
> sobre filas que la usuaria puede borrar necesita un registro de consumo
> aparte, y eso es una tabla nueva. Sin verificar por CI.

**Estado:** CONFIRMADO (por lectura del SQL y de los grants; no ejecutado)
**Dónde:** `supabase/migrations/20260811222602_…:31-32` y `:127-130`;
`src/server/plans.ts:12-16, 62-88`
**Clase:** elusión de control de gasto / la única defensa de la clave de Anthropic

**Qué pasa.** Dos hechos que juntos anulan la cuota:

1. `alter default privileges in schema public grant select, insert, update,
   delete on tables to authenticated` le da a cada usuaria autenticada permiso
   de UPDATE sobre **todas las columnas** de todas las tablas. No hay ni un
   `revoke` a nivel de columna en ninguna migración (`grep -n revoke
   supabase/migrations/*.sql` devuelve tres líneas, todas a nivel de tabla:
   `audit_log`, `mp_accounts`, `google_accounts`, `booking_requests`).
2. La política de `practitioners` es `for all using (id = (select auth.uid()))
   with check (id = (select auth.uid()))`. Un UPDATE sobre la fila propia pasa
   el `using` y pasa el `with check`, **sin importar qué columna cambie**.

`plan` es una de esas columnas (`database.types.ts:747-762` la lista como
`plan?: string` en `Update`). El `check` de Postgres sólo exige que sea
`'free'` o `'pro'`.

**Cómo se explota.** Con la sesión propia, desde la consola del navegador —
la anon key está en el bundle por diseño y el access token es legible por el
hallazgo anterior:

```js
await fetch(`${SUPABASE_URL}/rest/v1/practitioners?id=eq.${miUuid}`, {
  method: 'PATCH',
  headers: {
    apikey: ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ plan: 'pro' }),
})
```

Eso lleva los límites de 5/10/40/10 a 200/400/1000/200 por mes.

Y hay una segunda vuelta, peor, que no necesita PostgREST: la cuota es
`count(*)` sobre `reports`, `assessments`, `assistant_questions` y `materials`
del mes en curso (`plans.ts:62-88`). Las cuatro tablas tienen política
`for all`, así que **borrar las filas devuelve la cuota**. Para `reports`,
`assessments`, `payments` y `materials` la interfaz ya tiene botón de borrar
(`deleteReport`, `deleteAssessment`, `deleteMaterial`); para
`assistant_questions` alcanza un DELETE por PostgREST. Generar un informe,
borrarlo, repetir: la cuota nunca sube y el consumo contra la clave de
Anthropic no tiene techo.

**Qué se filtra.** Nada clínico. Lo que se pierde es el único control que
protege `ANTHROPIC_API_KEY` del gasto — que es exactamente el defecto #9 de v1
(`legacy/index.html:2775`), reaparecido de otra forma: v1 ponía el límite en el
navegador; acá está en el servidor, pero el dato sobre el que decide es
escribible por quien está limitado.

**Cómo se arregla.** Dos partes, y la primera es de una línea:

```sql
-- El perfil se edita por el formulario; estas cuatro columnas, no.
revoke update (plan, slug, email, digest_sent_at)
  on table practitioners from authenticated;
```

La segunda es más de fondo: contar la cuota sobre filas que la usuaria puede
borrar hace que la cuota sea opcional. Lo que corresponde es una tabla
`ai_usage` escrita con la clave de servicio (misma forma que `audit_log`: sin
política de insert, `revoke insert, update, delete … from authenticated`), y
contar sobre ésa. Costo: una séptima entrada en `SERVICE_DB_ALLOWED` — o
reutilizar `audit.ts`, que ya escribe con clave de servicio y ya registra
`generate`.

**Alcance.** El primer problema es de `practitioners`. El segundo alcanza a las
cuatro tablas contadas por `countThisMonth`. Y la clase —"`authenticated`
tiene UPDATE/DELETE columna por columna sobre todo"— es la misma que produce el
hallazgo de `author_name` más abajo.

---

### [ALTO] El asistente manda a Anthropic el nombre y apellido de todos los pacientes con sus objetivos, en cada pregunta

> **ARREGLADO el 6/9/2026.** El padrón manda nombre de pila, con inicial del
> apellido sólo donde dos pacientes comparten el nombre. Tres tests nuevos en
> `assistant.test.ts`, incluido uno que falla si vuelve un apellido. Sin
> verificar por CI.

**Estado:** CONFIRMADO
**Dónde:** `src/server/assistant.ts:155` (contra el comentario de cabecera del
mismo archivo, `:18-21`)
**Clase:** contenido clínico saliendo hacia un tercero sin decisión explícita

**Qué pasa.** La cabecera del archivo dice, textualmente:

> *The roster only: patient **first names**, ages, average progress, and goal
> titles with their percentages.*

Y `assistantRoster` arma:

```ts
return `- ${patient.fullName} (${patient.age ?? 'edad s/d'}): avance ${patient.averageProgress}%. Objetivos: ${goals}`
```

`fullName`, no `firstName` — y el objeto `AssistantPatient` tiene las dos
propiedades, calculadas al lado (`assistant.ts:113-114`). `sessionsToday`, tres
líneas más abajo, sí usa `firstName`. Es un descuido de una palabra, no una
decisión.

**Cómo se explota.** No hace falta un atacante. Cualquier pregunta al asistente
—incluso "hola"— construye el system prompt con `assistantSystemPrompt`
(`asistente/route.ts:78`), que incluye el padrón entero: **cada paciente activo
de esa profesional, con nombre y apellido, edad, porcentaje de avance y los
títulos de todos sus objetivos activos**. Los títulos de objetivo son
clínicos ("Conciencia fonológica", "Reducir estereotipias", "Integración
sensorial"). Se manda de nuevo en cada pregunta de la conversación, porque el
padrón va en el system prompt.

**Qué se filtra.** El listado nominal completo de menores en tratamiento, con
su objetivo terapéutico, hacia Anthropic. No es una fuga entre inquilinas: es
la totalidad del padrón de una profesional saliendo del país por escribir
"hola", con la documentación del propio archivo afirmando que no pasa.

**Cómo se arregla.** Cambiar `patient.fullName` por `patient.firstName` en
`assistant.ts:155`. Efecto colateral: si dos pacientes se llaman Tomás, el
modelo no los distingue — se resuelve con `Tomás P.` (las mismas iniciales que
ya calcula `calendar-privacy.ts`) o con un id corto por paciente. El
`offlineAnswer` puede seguir usando el nombre completo: nunca sale del
servidor.

**Alcance.** Sólo el asistente. Los otros cinco caminos de IA están bien
acotados y los verifiqué uno por uno: `informe` y `evaluacion` mandan el nombre
completo de **un** paciente sobre el que la profesional pidió un documento —
decisión explícita, correcta; `sesion` manda un nombre y la transcripción;
`material` y `material-archivo` no mandan ningún paciente, y el comentario de
`material-prompt.ts:14-19` explica bien por qué.

---

### [MEDIO] `practitioner_by_slug` está concedida a `anon` sin que la aplicación la use: permite enumerar profesionales desde internet

**Estado:** CONFIRMADO
**Dónde:** `supabase/migrations/20260812021836_create_booking_requests.sql:96`;
consumidor real en `src/server/booking.ts:59-64`
**Clase:** fuga de metadatos / enumeración

**Qué pasa.** La migración termina con:

```sql
grant execute on function public.practitioner_by_slug(text) to anon, authenticated;
```

Pero el único llamador de la aplicación es `practitionerBySlug`, que la invoca
con **`getServiceDb()`** — la clave de servicio saltea los grants. O sea que el
`grant … to anon, authenticated` no lo necesita nadie: es superficie regalada.

**Cómo se explota.** `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_ANON_KEY` están en el bundle de todo visitante, y
PostgREST expone las funciones del esquema `public` como RPC:

```
POST https://<ref>.supabase.co/rest/v1/rpc/practitioner_by_slug
apikey: <anon key>
{"lookup_slug":"lucia-fernandez"}
→ [{"id":"<uuid>","full_name":"Lucía Fernández","discipline":"speech_therapy"}]
```

Sin sesión y sin límite de tasa. Los slugs los genera `slugify(full_name)`
(`…practitioners_and_audit_log.sql:76-88`), así que son adivinables con un
diccionario de nombres uruguayos. El `id` que devuelve es el `auth.uid()` de la
profesional — el mismo identificador interno que el defecto #6 de v1 sacaba a
la calle, sólo que ahora por una puerta distinta.

Hay un segundo oráculo con la misma información: `/api/reservas` responde 404
`"Ese link no existe"` para un slug inexistente y sigue adelante para uno
existente (`reservas/route.ts:33-37`), **antes** de aplicar el límite de tasa,
que se calcula recién en la línea 44.

**Qué se filtra.** El padrón de profesionales de la salud que usan Hilo:
nombre, disciplina y UUID. Nada clínico, pero "esta persona es fonoaudióloga y
usa esta herramienta" es un dato personal, y la lista completa habilita
phishing dirigido muy creíble sobre una población concreta.

**Cómo se arregla.**

```sql
revoke execute on function public.practitioner_by_slug(text) from anon, authenticated;
```

No rompe nada: el único llamador usa clave de servicio. Y en `/api/reservas`,
mover el conteo de tasa **antes** de resolver el slug (contando por IP sola,
sin el `practitioner.id` en el hash) para que la enumeración también quede
limitada. Eso obliga a cambiar `submitterHash` para que acepte un hash sin
profesional en el caso de rechazo — unas diez líneas.

---

### [MEDIO] El nombre y apellido del paciente viaja a Mercado Pago como título del cobro

**Estado:** CONFIRMADO
**Dónde:** `src/app/(app)/cobros/actions.ts:124`, consumido en
`src/server/mercadopago.ts:139`
**Clase:** contenido clínico saliendo hacia un tercero sin decisión explícita

**Qué pasa.**

```ts
const link = await createPaymentLink(user.id, {
  amount,
  title: `Sesiones de ${patientName}`,   // patientName = nombre y apellido
  externalReference: buildExternalReference(user.id, patientId, period),
})
```

Ese `title` va como `items[0].title` en la preferencia de Checkout Pro, queda
guardado en Mercado Pago y se muestra en la pantalla de pago que abre la
familia.

**Cómo se explota.** No hace falta atacante: es el flujo normal. Es el
adversario 5 del modelo de amenaza —la propia dueña de la cuenta contra sí
misma— y el proyecto ya resolvió exactamente esta pregunta en otro lado y de
otra manera. `calendar_privacy` existe, arranca en `'busy'`, tiene tres
opciones y una pantalla que explica el costo de cada una, porque *"mandar los
datos a un tercero en otro país es otro acto"*
(`20260821213000_calendar_privacy.sql:6-12`). El mismo dato, hacia el mismo
tipo de destinatario, sale sin preguntar nada por el camino de Cobros.

**Qué se filtra.** Que una persona con nombre y apellido recibe sesiones de una
profesional de la salud identificada — hacia Mercado Pago, y hacia cualquiera
que abra el link (que se manda por WhatsApp y se reenvía).

**Cómo se arregla.** El título no necesita el apellido:

```ts
title: `Sesiones de ${firstName(patientName)} · ${periodName}`
```

o directamente `Sesiones · ${periodName}`, que es lo que la familia necesita
ver. `firstName` ya está en `src/lib/whatsapp.ts`. Costo: cero. Efecto
colateral: una profesional que cobra a dos Tomás en el mismo mes ve dos
entradas iguales en su panel de MP — se distingue por `external_reference`, que
ya lleva el `patient_id`.

**Alcance.** Un solo lugar. Verifiqué los demás caminos hacia terceros y están
bien: el correo de reserva lleva sólo lo que la familia escribió, el digest
lleva sólo números, el WhatsApp lleva nombre de pila y ninguna nota, y el
evento de Google arranca en "Ocupado".

---

### [MEDIO] La sala de videollamada es permanente y sin moderación: quien tuvo el link alguna vez entra a todas las sesiones futuras

**Estado:** CONFIRMADO
**Dónde:** `src/server/patients.ts:226-260` (`ensurePatientRoom`),
`src/lib/video.ts:13`,
`supabase/migrations/20260817092000_add_patient_video_room.sql`
**Clase:** acceso de un tercero a una sesión clínica

**Qué pasa.** La migración resuelve muy bien la mitad que v1 hizo mal —el
nombre del niño ya no está en la URL, y el id es aleatorio de 64 bits— y deja
la otra mitad sin tratar: **la sala es por paciente y es para siempre**
(`"El link es siempre el mismo, así que la familia puede guardarlo"`,
`online-consultation.tsx:105`). Una sala de `meet.jit.si` sin JWT ni lobby
admite a cualquiera que tenga la URL, en cualquier momento, sin avisar.

**Cómo se explota.** Alguien que recibió el link una vez —un familiar, una
persona a quien se lo reenviaron por WhatsApp, un ex cónyuge en una situación
de tenencia— abre esa URL a la hora de la sesión de la semana siguiente y entra
a la videollamada de un niño con su terapeuta. No hay revocación posible: la
única forma de cortar el acceso es cambiar `room_id`, y no hay ninguna función
que lo haga (`ensurePatientRoom` sólo crea si no existe).

**Qué se filtra.** La sesión clínica en vivo, que es más sensible que cualquier
fila de la base.

**Cómo se arregla.** Tres opciones, de menor a mayor costo:
1. Un botón "Generar link nuevo" en la ficha, que rota `room_id`. Es una
   función de diez líneas y le devuelve a la profesional el control.
2. Sala por cita en vez de por paciente, con el link generado al enviarlo.
   Rompe el "la familia lo guarda", que es una propiedad que se eligió a
   propósito.
3. Jitsi con lobby o con JWT, que exige configurar un servidor propio.

La (1) es la que corresponde ahora: es barata y cierra el caso irreversible.

---

### [MEDIO] Redirección abierta: `internalPath` rechaza `//` pero no `/\`

**Estado:** CONFIRMADO en el código · PROBABLE en el navegador (no lo ejecuté)
**Dónde:** `src/lib/safe-path.ts:16`; consumido en
`src/app/(auth)/actions.ts:88` y `src/app/(auth)/confirmar/route.ts:56`
**Clase:** redirección abierta / phishing de credenciales

**Qué pasa.**

```ts
return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
  ? value
  : fallback
```

El comentario del archivo identifica bien la trampa de `//ejemplo.com` y el
test la cubre. Falta la hermana: **`/\ejemplo.com`**. Empieza con una barra,
no empieza con dos, así que pasa el filtro.

**Cómo se explota.** Según el algoritmo de parseo de URL de WHATWG —el que
usan Chrome, Firefox y Safari para resolver un `Location` relativo— al llegar
al estado *relative slash state* con la barra invertida y un esquema especial,
se pasa a *special authority ignore slashes state*, y `ejemplo.com` se parsea
como **host**, no como ruta. `/\ejemplo.com` relativo a `https://app.hilo.uy/`
resuelve a `https://ejemplo.com/`.

La petición concreta:

```
https://app.hilo.uy/entrar?volver=/\ejemplo.com
```

`entrar/page.tsx:14` lo pone en un `<input type="hidden" name="volver">`
(`sign-in-form.tsx:71`), y `signInAction` hace
`redirect(internalPath(formData.get('volver'), '/inicio'))` **después de un
inicio de sesión exitoso**. La profesional escribe su contraseña en el dominio
real, y aterriza en el dominio del atacante — que muestra "tu sesión expiró,
volvé a entrar" y ya es creíble.

Lo marco PROBABLE y no CONFIRMADO porque no pude levantar un navegador ni un
Next en esta sesión (ver más abajo): lo que verifiqué es que el filtro deja
pasar la cadena, y el comportamiento del parseo es la especificación, no una
prueba mía. La otra ruta que consume `internalPath` —`?next=` en
`/confirmar`— requiere un token de correo válido, así que es mucho menos útil.

**Qué se filtra.** Nada por sí solo. Habilita phishing de credenciales de una
herramienta que guarda historias clínicas, desde una URL en el dominio legítimo.

**Cómo se arregla.** Dejar de razonar sobre prefijos y parsear:

```ts
export function internalPath(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || !value.startsWith('/')) return fallback
  try {
    const url = new URL(value, 'https://hilo.invalid')
    return url.origin === 'https://hilo.invalid' ? url.pathname + url.search : fallback
  } catch {
    return fallback
  }
}
```

Y agregar `/\ejemplo.com`, `/\/ejemplo.com` y `/%09/ejemplo.com` a
`safe-path.test.ts`, que hoy tiene cuatro casos y ninguno de éstos.

---

### [MEDIO] El límite de tasa de `/api/reservas` se puede saltear si Vercel no reescribe `x-forwarded-for`

**Estado:** PROBABLE
**Dónde:** `src/app/api/reservas/route.ts:42`
**Clase:** elusión de límite de tasa

**Qué pasa.**

```ts
const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
```

Tomar `[0]` sólo es correcto si el proxy de confianza **reemplaza** el
encabezado. Si lo **antepone o lo concatena** —que es lo que hace la mayoría de
los proxies— el primer valor es el que mandó el cliente, y el confiable es el
**último**. La documentación de Vercel dice que pone la IP del cliente en
`x-forwarded-for`, pero no garantiza el reemplazo del valor entrante, y hay
además `x-vercel-forwarded-for` justamente porque el otro no es de fiar.

No pude comprobar cuál de las dos hace Vercel hoy, y por eso va como PROBABLE.

**Cómo se explota.** Si el encabezado se concatena:

```
POST /api/reservas
X-Forwarded-For: 1.2.3.4
{"slug":"lucia-fernandez","name":"…","phone":"…"}
```

variando `1.2.3.4` en cada pedido: `submitterHash` da distinto cada vez,
`recentRequestCount` devuelve siempre 0, y el buzón de reservas de la
profesional se llena sin techo. También ensucia `booking_requests` con filas
que después hay que borrar a mano.

**Qué se filtra.** Nada. Es disponibilidad y molestia.

**Cómo se arregla.** Usar la cabecera que Vercel sí controla, o la última
entrada:

```ts
const forwarded = request.headers.get('x-vercel-forwarded-for')
  ?? request.headers.get('x-forwarded-for')
const parts = forwarded?.split(',').map((p) => p.trim()).filter(Boolean) ?? []
const ip = parts[parts.length - 1] ?? 'local'
```

(o `ipAddress()` de `@vercel/functions`, que es una dependencia más). El
comentario del código dice que la reserva a `'local'` "es la dirección segura
en la que equivocarse", y eso es cierto: con el encabezado ausente todos
comparten un contador. El problema es el opuesto — el encabezado presente y
controlado.

---

### [BAJO] Se pueden crear filas hijas apuntando al paciente de otra profesional

**Estado:** CONFIRMADO
**Dónde:** `src/server/sessions.ts:49`, `src/server/reports.ts:75`,
`src/server/assessments.ts:70`, `src/server/payments.ts:47`,
`src/server/goals.ts:63`, `src/server/appointments.ts:70` y `:232`
**Clase:** integridad referencial entre inquilinas

**Qué pasa.** Las seis funciones de inserción escriben
`patient_id: <lo que vino del formulario>` sin comprobar que ese paciente sea
de quien inserta. El `with check` de la política sólo mira `practitioner_id`, y
la clave foránea sólo exige que el paciente exista.

**Cómo se explota.** Una Server Action con `patientId` cambiado a mano —por
ejemplo `recordPaymentAction` con el UUID de un paciente ajeno— crea una fila
con `practitioner_id` del atacante y `patient_id` de la víctima.

**Qué se filtra.** **Nada.** Lo verifiqué en los dos caminos que podrían
convertirlo en lectura y los dos cierran: `gatherReportContext` filtra
`patients` por `practitioner_id` antes de armar el prompt
(`report-prompt.ts:41-45`), y todos los `select` con join incrustado
(`'*, patients(id, full_name, color)'`) pasan por RLS, que devuelve `null` en
el paciente. La consecuencia real es basura en la base y números de
estadísticas mal.

Vale la pena decir que **el mismo camino existe en el webhook de Mercado
Pago**, y ahí sí es con clave de servicio: `handlePaymentNotification`
(`mercadopago.ts:280-291`) inserta con el `patientId` que salió de
`external_reference`, validando que el `practitionerId` coincida con el dueño
del token, pero **sin validar el paciente**. Sigue sin filtrar por lo mismo,
pero es la instancia donde RLS ya no está para atajarlo.

**Cómo se arregla.** Una clave foránea compuesta cierra las seis de una vez y
no requiere tocar ninguna función:

```sql
alter table patients add constraint patients_owner_key unique (practitioner_id, id);

alter table sessions
  add constraint sessions_patient_same_owner
  foreign key (practitioner_id, patient_id) references patients (practitioner_id, id)
  on delete cascade;
-- ídem goals, goal_progress, schedules, appointments, assessments,
--      reports, payments, session_plan_items
```

Costo: nueve claves foráneas más y un índice único adicional. Beneficio: la
clase entera deja de existir, incluida la instancia del webhook.

---

### [BAJO] `pushAppointment` lee el nombre del paciente sin filtro de inquilino

**Estado:** CONFIRMADO
**Dónde:** `src/server/google-calendar.ts:177`
**Clase:** IDOR latente

**Qué pasa.**

```ts
db.from('patients').select('full_name').eq('id', appointment.patient_id).maybeSingle()
```

Sin `.eq('practitioner_id', practitionerId)`, a diferencia de las otras cuatro
consultas del mismo archivo. Hoy no filtra nada porque va por `getDb()` y RLS
la acota, y el `if (!patient) return false` de la línea 185 convierte el
resultado vacío en una salida limpia.

Es exactamente el caso que la línea 3 de la auditoría pide buscar: una función
que recibe `practitionerId` y no lo usa. Se vuelve una fuga —el nombre de un
paciente ajeno escrito en el calendario de Google del atacante— el día que
alguien la llame desde un contexto con clave de servicio, por ejemplo un cron
de reconciliación que empuje a Google las citas pendientes de todas.

**Cómo se arregla.** Agregar `.eq('practitioner_id', practitionerId)`. Una
línea, sin efecto colateral.

---

### [BAJO] Faltan cabeceras de seguridad: sin CSP, sin `X-Content-Type-Options`, sin `Permissions-Policy`

**Estado:** CONFIRMADO
**Dónde:** `next.config.ts` (no hay `headers()`), `vercel.json`
**Clase:** endurecimiento

**Qué pasa.** La aplicación no emite ninguna cabecera de seguridad propia. En
condiciones normales importa poco —no hay `dangerouslySetInnerHTML` en ningún
lado, lo verifiqué— pero **con la cookie de sesión legible por JavaScript
(primer hallazgo), una CSP es el control compensatorio principal**: sin ella,
cualquier script que llegue a ejecutarse en el origen se lleva el refresh
token y no hay segunda línea.

**Cómo se arregla.** Un `headers()` en `next.config.ts` con
`Content-Security-Policy` (Next documenta el patrón con nonce),
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
y `Permissions-Policy` cerrando cámara y micrófono salvo donde se usan. Ojo con
lo último: el botón de dictado usa `SpeechRecognition` y la videollamada abre
`meet.jit.si` en otra pestaña, así que `microphone=(self)` y `camera=()`.

---

### [BAJO] `/api/digest`: comparación no constante y sin límite de intentos

**Estado:** CONFIRMADO
**Dónde:** `src/app/api/digest/route.ts:30`
**Clase:** endurecimiento

**Qué pasa.** `if (authorization !== \`Bearer ${env.CRON_SECRET}\`)`. La forma
del guardia es correcta —no es `if (SECRET) { verificar }`, que es el defecto
#10 de v1, y el comentario lo dice bien—. La comparación no es de tiempo
constante.

**¿Importa acá?** Casi nada: medir diferencias de nanosegundos en una
comparación de cadenas a través de la red, contra una función serverless con
arranque en frío, no es un ataque practicable. Lo anoto porque la auditoría lo
pregunta explícitamente y porque el arreglo es gratis: `mercadopago.ts:1` ya
importa `timingSafeEqual` y el patrón está escrito tres archivos más allá.

Lo que sí conviene: no hay límite de intentos sobre este endpoint. Un
adversario puede probar secretos sin costo, y el resultado de acertar es
disparar el envío completo de correos.

---

### [BAJO] El webhook de Mercado Pago no verifica frescura, y consulta el pago con el token de todas

**Estado:** CONFIRMADO
**Dónde:** `src/server/mercadopago.ts:186-215` y `:300-322`
**Clase:** repetición / uso cruzado de credencial

**Qué pasa.** Dos cosas menores en un archivo por lo demás muy sólido — la
firma se verifica antes de tocar la base, el monto se lee de vuelta desde MP y
la idempotencia está en la restricción única, las tres bien.

1. `verifyWebhookSignature` no compara `ts` contra el reloj. Una notificación
   válida capturada sirve para siempre. El daño está acotado por la
   idempotencia (`existing` sólo actualiza el estado), pero un `ts` de hace seis
   meses debería rechazarse.
2. `pendingReference` recorre **todas** las cuentas de MP conectadas y consulta
   el pago con el token de cada una hasta que alguna conteste. Usar la
   credencial de la profesional B para preguntar por un pago que resultó ser de
   A es un uso de su credencial ajeno a ella. Hoy MP contesta 404 porque los
   tokens son por cuenta, y el `parsed.practitionerId === account.practitioner_id`
   de la línea 318 cierra bien el caso; pero es una llamada a un tercero con
   una credencial que no corresponde, y escala mal (una llamada HTTP por cuenta
   conectada, por pago nuevo).

**Cómo se arregla.** (1) `if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false`.
(2) Guardar la preferencia al crearla —`createPaymentLink` ya conoce
`practitionerId` y `externalReference`— y buscar por ahí en vez de barrer.

---

### [BAJO] `audit_log` se escribe y no lo lee nadie; y no registra las lecturas

**Estado:** CONFIRMADO
**Dónde:** `src/server/audit.ts:86-99`; el tipo `Action` en `:36-45`
**Clase:** trazabilidad

**Qué pasa.** El registro está bien hecho: no puede forjarse (sin política de
insert más `revoke`), no puede leerse cruzado (política de select por fila
propia, con test), y **no copia contenido clínico** — sólo acción, entidad e id,
que es la decisión correcta y evita la segunda copia del dato.

Lo que falta:
- **`listAuditLog` no tiene ningún llamador.** No hay pantalla donde una
  profesional vea su rastro. Bajo la Ley 18.331 el registro tiene valor cuando
  alguien puede consultarlo.
- **No se registra ninguna lectura de historia clínica.** El tipo `Action`
  incluye `'view'` y no se usa en ningún lado (`grep -rn "'view'"` sólo lo
  encuentra en su propia definición). Lo único que registra un acceso es
  `'export'` en `patient-export.ts:88`. Abrir la ficha de un paciente, leer sus
  notas de sesión o abrir un informe no deja rastro.

**Cómo se arregla.** Un `logAction(user.id, 'view', 'patient', id)` en
`/pacientes/[id]/page.tsx` es una línea, pero genera una fila por carga de
pantalla: conviene desduplicar por día (`on conflict` sobre
`(practitioner_id, entity, entity_id, date)`) o aceptar el volumen. Y una
pantalla en Perfil que muestre las últimas cincuenta entradas.

---

### [BAJO] El test de aislamiento tiene tres huecos concretos

**Estado:** CONFIRMADO
**Dónde:** `src/server/rls.test.ts:180-198` y el archivo entero
**Clase:** cobertura

El test es muy bueno y cubre lo que más importa. Lo que **no** cubre, en orden
de lo que yo agregaría:

1. **Que una profesional no puede subirse el plan.** El bloque
   `row level security on practitioners` prueba que A no escribe la fila de B,
   y nunca prueba que A no puede escribir columnas de su propia fila que no le
   corresponden. Es el hueco por el que pasa el segundo hallazgo de este
   informe, y el test que lo cerraría son cuatro líneas:
   ```ts
   it('no deja que una profesional se cambie el plan', async () => {
     await asA.from('practitioners').update({ plan: 'pro' }).eq('id', idA)
     const { data } = await service.from('practitioners').select('plan').eq('id', idA).single()
     expect(data?.plan).toBe('free')
   })
   ```
2. **`payments` y `booking_requests` no están en la lista de
   `the clinical tables`** (línea 182-197). Sus políticas son correctas —las
   leí— pero, en las palabras del propio comentario del archivo, son *"una
   política que nadie vio nunca funcionar"*. `payments` guarda datos financieros
   por paciente y `booking_requests` el teléfono de una familia.
3. **El bucket `patient-photos` no tiene ningún caso.** `material-files` tiene
   cuatro tests muy buenos, incluida la rama de publicación. Las fotos de los
   pacientes —el dato más sensible del sistema— dependen de cuatro políticas de
   `storage.objects` que ningún test ejecuta.

---

---

# Segunda pasada: los 16 commits de `main` (6 de septiembre)

Auditados con la rama parada en `origin/main`. Son 37 archivos y ~1.750 líneas,
casi todo Agenda e Informes. **No hay nada crítico ni alto.**

Lo primero, porque es lo más grave que encontró esta pasada y es mío:

### [ALTO] El `grant` de columnas rompía el recorrido guiado — introducido y arreglado en el día

**Estado:** CONFIRMADO (reproducido contra la base) · **ARREGLADO**
**Dónde:** `supabase/migrations/20260906120000_practitioners_column_grants.sql`

La primera versión de esa migración devolvía cuatro columnas de UPDATE:
`full_name`, `discipline`, `phone`, `calendar_privacy`. Se escribió sobre
`chat-con-memoria`, donde nada escribía `onboarded_at`. En `main` sí: el commit
`1203ee2` movió la marca del recorrido guiado de `localStorage` a
`practitioners.onboarded_at`, y `markTourSeen` la escribe con la sesión de la
usuaria.

```
update practitioners set onboarded_at = now();
ERROR:  permission denied for table practitioners
```

**Y fallaba en silencio.** `app-tour.tsx:66` llama a la acción con
`.catch(() => {})`, así que no hay error en pantalla ni en el log: el recorrido
guiado simplemente se repetiría en cada carga, para siempre, sin que nada diga
por qué. Es exactamente el modo de falla que el comentario de esa misma
migración advertía dos párrafos más arriba.

Arreglado agregando `onboarded_at` al `grant`, con el barrido exhaustivo hecho
esta vez: `src/server/practitioners.ts` escribe con la sesión `full_name`,
`discipline`, `phone` (`updatePractitioner`), `calendar_privacy`
(`updateCalendarPrivacy`) y `onboarded_at` (`markTourSeen`), y ninguna otra
columna en ningún otro archivo — `digest_sent_at` lo escribe el cron con clave
de servicio, que no pasa por estos permisos. El test dejó de decir "los campos
de su pantalla de perfil" y ahora dice **todas** las columnas que la aplicación
escribe, que es la lista que tiene que mantenerse.

La lección no es sobre permisos: es que auditar una rama vieja produce arreglos
que están bien contra la rama vieja.

---

### [BAJO] `currentOrigin` arma la URL con `x-forwarded-host`, sin lista de hosts válidos

**Estado:** CONFIRMADO · **Dónde:** `src/app/(app)/origin.ts:44`

Toma `x-forwarded-host` o `host` tal como vienen. Un pedido con
`Host: evil.com` hace que la página dibuje el link de reservas apuntando ahí.

**No es explotable por un tercero, y por una razón concreta:** lo único que se
arma con eso es un link que se renderiza en la respuesta a ese mismo pedido, y
el navegador de la víctima no falsifica su propio `Host`. Quien manda la
cabecera es el único que ve el resultado. Las dos páginas que lo usan son
dinámicas —leen cookies— así que tampoco hay caché donde una respuesta
envenenada quede guardada para otro.

Lo que lo haría grave es que ese valor llegara a un correo, que es el clásico
del envenenamiento de Host. **Verifiqué que hoy no pasa**: `digest/route.ts`,
`reservas/route.ts`, `auth.ts` y las dos plantillas de `notifications.ts` usan
`publicConfig.NEXT_PUBLIC_APP_URL`. El comentario del archivo lo dice, y por
ahora es verdad.

**Cómo se arregla.** Validar el host contra los que se esperan —el dominio
propio, `*.vercel.app`, `localhost`— y caer en `NEXT_PUBLIC_APP_URL` cuando no
coincide. Son cinco líneas, y convierten "hoy nadie lo usa para un correo" en
"el día que alguien lo use, no importa".

---

### [BAJO] El pedido de formato manda el texto por correo, y la promesa de no escribir nombres no la hace cumplir nada

**Estado:** CONFIRMADO · **Dónde:** `src/server/notifications.ts:240`,
`src/app/(app)/informes/actions.ts:117`

Es el punto 5 de "lo ya decidido" y lo que pedía era auditar si la promesa se
puede romper. Se puede: el formulario avisa
—*"Contanos del formato, no del paciente: no escribas nombres ni datos"*,
`request-format.tsx:99`— y eso es todo lo que hay. El texto viaja entero a
`OWNER_EMAIL`.

Todo lo demás de ese camino está bien y lo verifiqué: el destinatario es una
variable de entorno fija, no hay forma de que quien pide elija a dónde va;
los cuatro valores interpolados pasan por `escapeHtml`; y el guardia
`if (env.OWNER_EMAIL)` es una notificación sin destinatario, no un control que
se apaga por falta de configuración — la forma que el punto 6 describe, bien
implementada.

La fila queda protegida por RLS; la copia en la casilla, no. El proyecto ya
tiene el patrón que lo evitaría: el resumen quincenal manda cuentas y un link
justamente por esto. La contra es real —sin el texto, el aviso no es
accionable— así que lo dejo como riesgo residual conocido y no como defecto.

---

### [BAJO] Pedir un formato no tiene límite: cada envío es un correo

**Estado:** CONFIRMADO · **Dónde:** `src/app/(app)/informes/actions.ts:117`

`requestFormatAction` guarda y manda un correo, sin contador ni deduplicación.
Cualquiera con cuenta puede apretar el botón en un bucle y llenar la casilla de
`OWNER_EMAIL` gastando la cuota de Resend. Es la única superficie del sistema
que manda correo sin ningún tope — `/api/reservas` cuenta filas por hora, y el
digest tiene su lote acotado.

Alcanza con lo que ya existe en `booking.ts`: contar filas de la última hora
para ese `practitioner_id` y cortar en unas pocas.

---

### [BAJO] `format_requests` no tiene test de aislamiento, y `listFormatRequests` no tiene llamador

**Estado:** CONFIRMADO

`format-requests.test.ts` prueba el esquema de Zod y nada más — largos, recorte
de espacios, el tope de 500. La tabla más nueva del esquema no está en el bucle
de `the clinical tables` de `rls.test.ts`.

**Probé el aislamiento a mano y está bien.** Con dos profesionales reales en la
base local, A ve sólo su fila, y el intento de A de insertar una fila a nombre
de B da `new row violates row-level security policy`. La política es correcta;
lo que falta es que algo la mire. Van tres tablas en esa situación: `payments`,
`booking_requests` y ahora `format_requests`.

Aparte: `listFormatRequests` no lo llama nadie. Es la misma forma que
`listAuditLog`, y `practitioners.ts` tiene escrito por qué eso es peor que no
tener la función.

---

## Dónde miré en esta pasada y no encontré nada

**La fuga silenciosa que buscaba, y no está.** Los diálogos de la Agenda
reciben `PatientOption[]`, que es `{ id, full_name }` — pero el tipo declarado
no es lo que RSC serializa: si la página pasa la fila entera, TypeScript no
dice nada y viajan el diagnóstico, el teléfono y el motivo de consulta.
Revisé los seis sitios que pasan pacientes a un componente cliente
—agenda, cobros, informes/nuevo, evaluaciones/nueva, materiales/[id],
planificación— y **los seis narrowean con un `.map()` explícito**. Ninguno pasa
la fila.

**Los componentes nuevos, del lado correcto.** De los siete, cuatro son cliente
y reciben escalares o nada: `BookingChip({ url })`, `NowLine({ firstHour,
lastHour })`, `WeekViewSelect({ value })`, `RequestFormat()`. Los que sí tocan
datos clínicos —`SessionPanel` con la cita y el paciente, `WeekCalendar`,
`ConnectGoogle`, `PeriodNav`, `AppointmentMenu`— son componentes de servidor,
así que del payload sale lo dibujado y no las filas.

**Las dos Server Actions nuevas** (`markTourSeenAction`, `requestFormatAction`)
resuelven `requireUser()` primero y bajan `user.id`. Ningún id de profesional
sale de un formulario.

**`plans.ts` no cambió su lógica.** Lo que cambió son los límites (el plan
gratis pasó de 5 a 10 informes) y los textos del aviso. `assertQuota` y
`countThisMonth` están intactos, así que el hallazgo de la cuota —borrar filas
la devuelve— vale igual, sin cambios.

**Barrido de patrones sobre el diff entero.** Ninguna llamada nueva a
`getServiceDb`, ningún `dangerouslySetInnerHTML`, ningún `process.env` fuera de
`env.ts` (`OWNER_EMAIL` está adentro), ninguna directiva de caché ni
`export const dynamic`, ningún camino nuevo a Storage, a Anthropic ni a Google.
Los `href` nuevos son todos `Link` internos armados con ids.

**Google Calendar sigue igual de reservado.** `calendar_privacy` viaja como
prop desde la página hasta `appointment-menu.tsx:101`, que llama a
`calendarEventTitle`, que ante cualquier valor desconocido devuelve "Ocupado".

# Dónde miré (primera pasada, `chat-con-memoria`) y no encontré nada

Esto es tan parte del resultado como la lista de arriba.

**1 · RLS, las 18 tablas.** Leí las veinte migraciones enteras. Las dieciocho
tablas tienen `enable row level security` y al menos una política. Ninguna
tiene `using (true)`. Ninguna política de escritura carece de `with check`
(revisé las de `materials`, que son las únicas separadas por operación, y
`update_own` tiene los dos). Ningún `practitioner_id` es `nullable`, salvo
`materials.practitioner_id`, que es NULL a propósito para el contenido que
viene con Hilo y está cubierto por test. Todas usan `(select auth.uid())`
envuelto — no encontré ni un `auth.uid()` desnudo. Las cuatro tablas más nuevas
que me pediste mirar con lupa (`session_plan_items`, `assistant_questions`,
`goal_progress`; `format_requests` no existe) tienen la política estándar,
correcta.

**2 · Las veinte llamadas con clave de servicio.** Las enumeré una por una.
`google.ts` (6): todas con `.eq('practitioner_id', practitionerId)`, y el
valor viene siempre de `getUser()` en la ruta. `mercadopago.ts` (6): cinco con
filtro; la sexta es `pendingReference`, que lee todas las cuentas a propósito
y está comentada más arriba. `booking.ts` (4): la inserción usa el
`practitionerId` que resolvió el slug, no el cuerpo; las otras tres leen por id
o por hash. `audit.ts` (1): sólo escribe, nunca lee. `digest.ts` (2): leen
todas las filas a propósito y el cruce en memoria está bien —`sessionCounts.get(practitioner.id)`,
`balances.get(practitioner.id)`, `paidByPatient.get(patient.id)`; ningún
índice cruzado. **Ninguna llamada toma su filtro de un parámetro que controle
quien hace la petición.**

**3 · Sobre-lectura hacia componentes cliente.** Éste era el candidato más
probable y está limpio. Recorrí los 42 archivos con `'use client'` y sus
props. Los que reciben datos de paciente reciben campos escalares nombrados
(`patientName`, `patientPhone`, `sessionFee`), no filas. Los tres que reciben
una fila entera —`PatientForm` (`Patient`), `MaterialForm` (`Material`),
`GoalList` (`Goal[]`)— son formularios de edición que renderizan esos mismos
campos, y son datos propios. Los envoltorios que reciben `children`
(`PatientFilters`, `MaterialFilters`, `Results`) reciben el árbol ya renderizado
por el servidor, no los datos que lo produjeron. `WeekCalendar`, `WeekGrid`,
`AppointmentCard` y `AppointmentMenu` son componentes de servidor: pasan por el
payload de RSC sólo lo que se dibuja.

**4 · Caché.** No hay ni un `unstable_cache`, ni un `export const revalidate`,
ni un `fetchCache`, ni un `force-cache` en todo `src/`. El único `cache()` es
el de React en `src/app/(app)/session.ts`, que memoriza por render y no entre
peticiones —está explicado y es correcto. Las dos únicas variables de módulo en
`src/server/` son los clientes de Anthropic y Resend: no guardan datos de
usuario. Todas las pantallas de `(app)` leen por `getDb()`, que llama a
`cookies()`, lo que las vuelve dinámicas y las saca de cualquier caché. Los
`revalidatePath` apuntan a rutas dinámicas, así que sólo vacían el caché de
router del navegador de quien hizo la acción. Y `/api/pacientes/[id]/datos`
—la respuesta más peligrosa del sistema— manda `cache-control: no-store`
explícito.

**5 · Los seis caminos de IA.** Los seis verifican sesión (`getUser()` y 401 en
JSON, nunca una redirección) **y** cuota, en ese orden, antes de la primera
llamada a Anthropic. Los tres que reciben un id lo cargan por RLS y comparan
(`getReport(user.id, …)`, `getAssessment(user.id, …)`, y en materiales el
`material.practitioner_id !== user.id` explícito, que además atrapa el caso de
un material publicado por otra). `stop_reason: 'refusal'` se maneja bien
(`ai.ts:236-243`): se lee después del stream, se convierte en excepción tipada
y llega al cliente como un evento `error`, sin romper y sin mostrar nada del
contexto. No se registra ningún prompt ni ninguna respuesta en ningún log. La
inyección de prompt desde datos clínicos existe pero es sólo contra una misma:
verifiqué que **ningún texto de otra inquilina llega a un prompt** — el
contenido de un material de la comunidad nunca entra a
`materialAdjustmentPrompt` (la ruta exige propiedad), y `bestMaterialFor` usa
el texto sólo para puntuar, no lo manda a ningún lado.

**6 · La biblioteca de materiales.** Ataqué la rama de publicación de
`material_files_read` como pediste. La política liga
`storage.filename(name)` —el último segmento de la ruta, que es el
`material_id`— con una fila de `materials` con `visibility = 'public'`. Para
leer el archivo privado de otra haría falta que existiera una fila `materials`
con **ese mismo UUID** marcada como pública, y ese UUID es la clave primaria de
la fila privada de la víctima: crear un duplicado choca contra la clave
primaria. La política de escritura sólo mira la carpeta, así que sí se puede
subir un objeto con un nombre de archivo elegido a mano — pero queda bajo la
carpeta de quien sube, así que no alcanza nada ajeno. No hay ruta con `..` ni
con `/` intermedia porque la ruta la construye el servidor
(`${practitionerId}/${materialId}`) y las políticas la verifican igual. No
encontré ningún camino desde una sesión, un objetivo o una nota hacia un
material: `createMaterial` sólo se llama desde el formulario y desde generación
por IA, y `material-prompt.ts` no recibe ningún paciente.

**7 · La superficie pública.** `/reservar/[slug]` renderiza dos campos
(nombre y disciplina) y le pasa a `BookingForm` sólo el slug — el `id` que
devuelve la función no se serializa. Un slug inexistente da `notFound()` y una
página 404 igual para todos. La inserción de reservas está bien: el
`practitioner_id` se resuelve del slug en el servidor, nunca del cuerpo; el
cuerpo pasa entero por Zod con topes de longitud; la IP se guarda como hash
salado y nunca en claro. La firma del webhook de MP se verifica antes de tocar
la base y se rechaza con 401 si falta. `/api/google/callback` hace las tres
verificaciones en el orden correcto —sesión, `state` contra cookie `HttpOnly`,
y recién ahí el código— y borra la cookie pase lo que pase: **el clásico de
conectar la cuenta de Google del atacante a la sesión de la víctima está
cerrado**. `/confirmar` valida el tipo de token contra un `z.enum` antes de
pasárselo a Supabase, y la excepción del enlace de recuperación está atada a la
cookie `hilo-recovery`, que la Server Action vuelve a verificar por su cuenta
(`(auth)/actions.ts:158`) porque una acción es un endpoint. Todos los mensajes
de error de autenticación son deliberadamente iguales, salvo
`email_not_confirmed`, y el razonamiento de por qué esa excepción no filtra
nada es correcto.

**8 · Secretos.** No hay ni un `process.env` fuera de `src/lib/env.ts` salvo
dos `NODE_ENV` (que no es secreto). No hay ninguna cadena de reserva
`A || B`. No hay ningún guardia con forma `if (SECRET) { verificar }` — busqué
los tres sitios donde v1 lo tenía y los tres están escritos al revés, a
propósito. Los tres `NEXT_PUBLIC_` son los tres legítimos. Ningún secreto
aparece en un mensaje de error, en una respuesta de API ni en un comentario.
El token de MP nunca sale de `mercadopago.ts`; `isMercadoPagoConnected`
selecciona `connected_at` en vez de traer el token y preguntarle si está vacío,
que es el detalle que uno espera encontrar mal y está bien.

**9 · Registros.** Revisé los diecinueve `console.*`. Ninguno imprime una nota
de sesión, un informe, un objetivo, un prompt ni una respuesta del modelo. Los
que llevan objeto llevan ids y códigos. El `send()` de `notifications.ts`
—que la auditoría marcaba— registra el asunto y el error de Resend; el asunto
del aviso de reserva lleva el nombre de quien llenó el formulario público, que
es la excepción ya decidida, y el error es de Resend, no una fila. Ninguna
pantalla de error muestra el mensaje crudo de la base: `ErrorScreen` renderiza
sólo `error.digest`, y el razonamiento escrito ahí es exactamente el correcto.

**10 · Correo.** Cada valor interpolado pasa por `escapeHtml`; los revisé uno
por uno en las dos plantillas y no falta ninguno. El digest manda cuentas y un
link, sin un solo nombre de paciente. El aviso de reserva lleva sólo lo que la
familia escribió. El destinatario nunca viene del cliente: sale de
`practitionerEmail(practitioner.id)` con el id resuelto del slug en el servidor,
así que no hay inyección posible en `to`.

**11 · Google Calendar.** El valor por omisión de `calendar_privacy` es
`'busy'`, y `calendarEventTitle` cae en `'Ocupado'` ante cualquier valor
desconocido — el default es el que menos cuenta, que es lo correcto.
`eventBody` no lleva nota, ni motivo de consulta, ni objetivos, y no hay
configuración que los agregue. La sincronización entrante sólo toca eventos
marcados con `hilo_appointment_id`, la cancelación es un `update` de estado y
jamás un `delete`, y `pullOnce` sin punto de sincronización pide sólo desde hoy
hacia adelante para no reescribir el pasado. `disconnect` revoca contra Google
además de borrar la fila. El `refresh_token` no está cifrado en reposo, y eso
está escrito como decisión conocida en la migración con su razonamiento — no lo
reporto como hallazgo porque la auditoría pide ataque, no criterio, y no tengo
ataque.

**12 · Storage.** Las URLs firmadas son de una hora, en los dos buckets. No hay
ni un `getPublicUrl`. El tipo MIME y el tamaño se validan en el servidor con
Zod **y** en el bucket con `allowed_mime_types` y `file_size_limit` — las dos
listas coinciden. Ni SVG ni HTML están en ninguna de las dos listas, y el
objeto se sirve desde `supabase.co`, otro origen, así que aunque se colara no
sería XSS almacenado en el origen de Hilo. Probé mentalmente el camino de
escribir `photo_path` a mano apuntando a la carpeta de otra: `createSignedUrl`
va por `getDb()` y la política de `storage.objects` lo rechaza.

**13 · IDOR en `src/app/`.** Ninguna Server Action lee un `practitioner_id` de
un `formData`. Las 34 llamadas a funciones de `src/server/` pasan `user.id`
resuelto por `requireUser()`. Los ids que sí vienen del formulario
(`patientId`, `goalId`, `materialId`, `reportId`…) llegan siempre a una
consulta que también filtra por `practitioner_id`.

**14 · Inyección en el lenguaje de filtros de PostgREST.** `listMaterials` y
`countMaterials` arman un `.or(...)` concatenando `practitionerId` y
`discipline`. Seguí las dos hasta el origen: `practitionerId` es siempre
`user.id`, y `discipline` es siempre `practitioner.discipline`, leído de la
base y restringido por un `check` a seis valores. Ninguno de los dos llega
nunca desde una URL o un formulario. El comentario de `materials.ts:136-139`
muestra que ya hubo un incidente con esto y que la búsqueda —el único valor de
usuario— se movió a `.ilike()` con argumento. Bien resuelto.

**15 · XSS.** No hay `dangerouslySetInnerHTML` ni `innerHTML` en ningún lado.
Los documentos clínicos se guardan como texto plano y el marcado lo genera
React en tiempo de render, tal como explican las migraciones. Los `href`
dinámicos son tres: dos `whatsappLink` (que construyen la URL con
`encodeURIComponent` sobre un `https://wa.me/` fijo) y `video_url`, que pasa
por `VideoUrlInput` y sólo acepta `http:` y `https:`. La única forma de meter
un `javascript:` ahí es escribiendo la columna por PostgREST directo, y el
resultado es auto-XSS — que sólo importa por la cookie sin `HttpOnly` del
primer hallazgo, y se cierra arreglando aquél.

---

# Lo que no pude auditar

Lo digo explícito, porque el silencio se lee como "revisado y limpio".

- **`npm run db:reset`.** Todo lo demás corrió (`test`, `lint`, `typecheck`,
  los cuatro checks), pero el replay desde cero no: borra los datos locales y
  hay servidores de desarrollo levantados contra esa base. La migración nueva se
  aplicó con `supabase migration up`, que es el mismo SQL en el orden correcto,
  y `check:rls` pasa. El replay completo lo hace CI.
- **Vercel.** Qué hace la plataforma con `x-forwarded-for` —de ahí que el
  hallazgo del límite de reservas quede como PROBABLE—, si la HSTS que agrega
  por defecto está activa en este proyecto, y qué retención tienen los registros.
- **El navegador.** No pude confirmar de primera mano que `/\ejemplo.com`
  resuelve fuera del origen en Chrome, Firefox y Safari. Es la especificación de
  WHATWG y una clase de bypass conocida, pero no lo ejecuté.
- **La configuración del panel de Supabase.** Si la confirmación de correo está
  encendida, qué esquemas expone PostgREST, si hay límite de tasa en el endpoint
  de auth, y si los buckets siguen siendo privados en producción. Todo eso vive
  fuera de git.
- **Los seeds** (`supabase/seeds/*.sql`, varios miles de líneas de materiales de
  biblioteca). Insertan filas con `practitioner_id` NULL, que es el caso ya
  cubierto por política y test, así que el riesgo de haberlos salteado es bajo —
  pero no los leí.
- **`e2e/` y `playwright.config.ts`.** No los leí.

---

# Las tres cosas que auditaría primero, con otra pasada

1. **Todo lo que `authenticated` puede escribir por PostgREST, columna por
   columna.** El hallazgo del plan es una instancia; `materials.author_name`
   (falsificable, y la auditoría preguntaba justo por eso),
   `materials.copied_from` (apuntable a cualquier fila),
   `practitioners.email` (que decide a dónde va el aviso de reserva y el
   digest) y `patients.video_url` son otras cuatro. La pregunta correcta no es
   "¿tiene RLS?" sino "**¿qué columnas de esta fila tiene sentido que la dueña
   escriba, y cuáles sólo el servidor?**". `practitioners` ya tiene su
   respuesta; las otras diecisiete siguen contestando "todas". Yo escribiría un
   script que liste, por tabla, las columnas que
   ninguna Server Action escribe y que sin embargo `authenticated` puede
   escribir: esa lista es el hallazgo.

2. **El aislamiento de Storage, con la base local levantada.** Es la única
   superficie del sistema donde la autorización no la decide Postgres sobre
   filas sino una política sobre rutas de texto, con `storage.foldername` y
   `storage.filename` haciendo de parser. Ataqué la rama de publicación de
   `material-files` y aguanta, pero lo hice leyendo. Con la base arriba
   probaría: rutas con `..`, con `//`, con `%2f`, con espacios finales, objetos
   en la raíz sin carpeta, y nombres que colisionen con un `material_id`
   público. Y agregaría los tests que faltan para `patient-photos`.

3. **El chat con memoria, que es lo que se está construyendo en esta rama.**
   El diseño actual es bueno —el hilo vive en la pestaña, el servidor no guarda
   transcripción, `parseHistory` valida forma y alterna estrictamente, y hay
   tope de diez turnos—. Pero es la única superficie donde el cuerpo de la
   petición se reenvía a Anthropic casi tal cual, y es donde este hallazgo del
   padrón completo apareció. Si la memoria alguna vez se persiste —y la nota de
   la rama sugiere que se está pensando— cambian tres cosas de golpe: aparece
   una tabla con texto clínico en claro, aparece una política nueva que
   escribir, y aparece la pregunta que la auditoría hace y que hoy no tiene
   dónde fallar: **¿puede el historial de un paciente entrar en la conversación
   sobre otro?** Hoy no, porque no hay historial guardado. Ése es el momento
   para volver a mirar.

---

## Una última cosa

Este código está mejor que el 95% de lo que audito, y no por casualidad: las
decisiones difíciles están escritas al lado del código que las implementa, con
el defecto de v1 que las motivó. Eso es lo que hace que una auditoría como ésta
pueda concentrarse en buscar el contraejemplo en vez de gastarse en reconstruir
el criterio.

Y también es donde está la lección de los tres hallazgos altos: **los tres son
cosas que nadie decidió.** La cookie sin `HttpOnly` es un default de librería
que nadie miró. El plan escribible es un `grant` de la primera migración
alcanzando una columna que se agregó después. El nombre completo en el
asistente es una palabra que no coincide con el comentario tres líneas arriba.
Ninguno es un error de criterio; los tres son omisiones en lugares donde el
proyecto sí tenía el criterio escrito. Los controles automáticos que existen
—`check:rls`, `check:secrets`, `check:boundaries`, el test de aislamiento—
miden exactamente lo que dicen medir y ninguno mide esto.

El cuarto alto lo escribí yo, arreglando los otros tres, y es de la misma
familia: la migración de permisos devolvía las columnas que la aplicación
escribía **en la rama que yo estaba mirando**, y `main` escribía una más. Habría
roto el recorrido guiado en silencio, porque quien lo llama se traga el error.
Lo agarró la segunda pasada. La moraleja no es sobre permisos ni sobre
`onboarded_at`: es que una auditoría sobre una rama vieja produce arreglos que
están bien contra la rama vieja, y que lo primero de todo es `git fetch`.
