# Hilo — hallazgos de QA

Dos partes: lo que salió de leer el código, y lo que salió de probar la app a mano.

`npm run typecheck` pasa. `npm run test` **no corre en esta máquina** por lo que
está en P0 — en CI sí, con el entorno completo. En cualquier caso nada de lo que
está acá lo agarra ningún check, así que no esperes que se caiga solo.

---

## Cómo trabajar este documento

**Esto es una lista de hallazgos, no una lista de tareas aprobadas.** Varios
puntos son decisiones de producto o tienen implicancias legales, y algunos se
contradicen entre sí. Antes de tocar código:

1. **Preguntá qué se hace con cada punto.** No asumas la solución. Muchos de
   estos tienen dos o tres salidas razonables (arreglar / sacar / posponer /
   dejar como está y documentarlo), y cuál corresponde no está decidido. Los que
   están marcados con **[DECIDIR]** no se tocan sin una respuesta explícita.
2. **No borres código.** Para las funcionalidades que se saquen del alcance
   —Mercado Pago, videollamadas— la instrucción es **desactivar y ocultar**, no
   eliminar. El código queda en el repo, funcionando, detrás de una bandera o sin
   entrada en la interfaz. Sacarlo significa reescribirlo el día que vuelva, y
   volver es el plan.
3. **Un cambio por vez, con su verificación.** Varios de estos comparten causa
   raíz; arreglar la causa y no el síntoma es lo que corresponde, pero conviene
   confirmar que el síntoma efectivamente se fue.

---

# Parte 1 — Lo que salió de leer el código

Ordenado por probabilidad de que aparezca probando.

## A. Huso horario — la franja 21:00–00:00

**El más fácil de disparar y el que más cosas toca.** Tomás ya lo había
sospechado probando; está confirmado y es más ancho de lo que parecía.

`src/lib/dates.ts:69` — `today()` es `new Date()` leído con el huso del
**servidor**. En Vercel eso es UTC. Uruguay es UTC−3. Nada fija `TZ` en la app: el
único lugar donde se fija es `package.json:11` (`TZ=UTC vitest run`), que es para
los tests.

Entre las 21:00 y la medianoche de Uruguay, el servidor ya está en el día
siguiente.

**Cómo probarlo:** cambiá la hora del Mac a las 21:30, o probá de noche de verdad.

| Dónde | Qué pasa |
|---|---|
| `components/sessions/session-form.tsx:74` | La fecha de la sesión viene con la de mañana |
| `components/agenda/schedule-dialogs.tsx:159,235` | Igual, al agendar |
| `components/documents/assessment-form.tsx:66` | Igual, al crear una evaluación |
| `components/payments/payment-dialog.tsx:117` | Igual, al registrar un cobro |
| `app/(app)/agenda/page.tsx:55` | Un domingo a las 21:05, la Agenda salta a la semana que viene |
| `server/statistics.ts:71` | Las horas de hoy se cuentan como pasadas para la asistencia |
| `server/plans.ts:27` | **La cuota mensual se renueva a las 21:00 del último día del mes.** El texto dice "Se renueva el 1.º" |

Encima son componentes cliente que se renderizan primero en el servidor: el HTML
que llega trae la fecha del servidor y el navegador ya está en otro día. La que
queda es la del servidor.

El código ya sabe de esta trampa — `server/google-calendar.ts:88` la explica bien
y la resuelve con `Intl.DateTimeFormat` y `TIME_ZONE`. El resto de la app no.

## B. Archivar o borrar un paciente

### B1 — Los cobros del mes bajan

`server/payments.ts` → `monthlyLedger` arma `rows` sólo con pacientes activos
(`.is('deleted_at', null).is('archived_at', null)`), y `totalPaid` es la suma de
esas filas. Los pagos de un paciente archivado siguen en la tabla pero **no se
suman a nada**.

**Repro:** registrá un cobro → archivá al paciente → volvé a Cobros de ese mes.
El total baja y el pago no aparece en ningún lado.

### B2 — Los horarios sobreviven al archivado

`setPatientArchived` (`server/patients.ts:473`) y `softDeletePatient` (`:498`) no
tocan `schedules`. El horario queda `is_active = true`, así que
`materialiseAppointments` le sigue creando sesiones cada vez que alguien abre la
Agenda.

**Repro:** paciente con horario fijo semanal → archivalo → abrí la Agenda y pasá a
la semana que viene. Sigue apareciendo.

### B3 — El nombre de un paciente borrado sigue saliendo

`server/appointments.ts` → `listAppointments` hace `patients(id, full_name, color)`
sin filtrar `deleted_at`. Un paciente "borrado" (derecho al olvido, Ley 18.331)
sigue mostrando su nombre en la grilla.

### B4 — Estadísticas incoherentes

`server/statistics.ts` cuenta `sessions`, `goals` y `reports` sin excluir
pacientes borrados, pero `activePatients` sí los excluye. Se puede llegar a
"0 pacientes activos / 12 sesiones este mes".

## C. Cuota de IA y gasto contra Anthropic

### C1 — Regenerar es gratis e ilimitado

`api/ai/informe/route.ts:57`, `api/ai/evaluacion/route.ts:45` y
`api/ai/material/route.ts:89` pasan `alreadyCounted: true` y **nunca llaman a
`recordUsage`**. La cuenta le resta 1 al total, así que `used - 1 >= limit` nunca
se cumple para un documento que ya existe.

**Repro:** con la cuota agotada (plan gratis, 10 informes), abrí cualquier informe
ya creado y apretá "Regenerar" veinte veces. Son veinte llamadas completas a
Anthropic y el contador no se mueve.

El comentario en `server/plans.ts:108` dice que es a propósito ("no le deja crear
otro"), pero no tiene tope de ningún tipo — y con el campo `adjustment` es
efectivamente un chat libre.

### C2 — La cuota se quema aunque la IA no conteste

`api/ai/sesion/route.ts:83` anota la unidad y no la devuelve nunca. Si Anthropic
está caído, cae en `offlineSessionNote` (texto propio, cuesta cero) y la unidad
igual se gastó. `api/ai/asistente/route.ts` es la única ruta que llama a
`releaseUsage`, que es la función escrita justamente para esto.

**Repro:** sacá `ANTHROPIC_API_KEY` del `.env` y dictá una sesión varias veces.

Lo mismo, más chico, en `app/(app)/informes/actions.ts:59` — `recordUsage` va
antes de `createReport`, así que un insert que falle se lleva la unidad puesta.

### C3 — Informe largo cortado a la mitad

`server/ai.ts` chequea `stop_reason === 'refusal'` pero no `'max_tokens'`. El tope
son 20.000 tokens y ahí adentro entra el thinking. Un informe que llegue al techo
se corta mitad de frase y la ruta igual manda `event: done`, así que la pantalla lo
da por terminado.

**Repro:** paciente con muchas sesiones, objetivos y evaluaciones → generá el
informe más largo que puedas.

## D. Webhook de Mercado Pago — errores que no se ven

`server/mercadopago.ts:277` y `:281` son **las dos únicas escrituras de todo
`src/server/` donde no se lee el `error`**:

```ts
await db.from('payments').update({ status }).eq('id', existing.id)   // :277
await db.from('payments').insert({ … })                              // :281
```

Si el insert falla, la función vuelve normal, la ruta devuelve 200, y Mercado Pago
deja de reintentar. El pago no queda registrado y nadie se entera.

El camino realista es la carrera: MP reintenta la misma notificación en paralelo,
las dos pasan el `select` de `existing` (que da vacío) y la segunda choca contra el
índice único de `mp_payment_id`. Ese choque hoy es silencio.

También `pendingReference` (`:301`) recorre **todas** las cuentas MP conectadas
haciendo un fetch con cada token, para cada pago desconocido.

> Ver **P8** en la Parte 2: si Mercado Pago se desactiva, esto deja de ser urgente,
> pero el código queda y el arreglo sigue correspondiendo antes de reactivarlo.

## E. Google Calendar — se pierden cambios pasados los 250

`server/google-calendar.ts:302` pide `maxResults: 250` y `:342` guarda
`payload.nextSyncToken ?? null`. **`nextPageToken` no se lee en ningún lado.**

Cuando hay más de 250 cambios, Google devuelve página + `nextPageToken` y **no**
manda `nextSyncToken`. Entonces las páginas siguientes no se piden nunca, y el
punto de sincronización se guarda en `null`, así que la próxima pasada arranca de
cero desde hoy. Los cambios del medio se pierden y nada avisa.

**Repro:** conectá una cuenta con un calendario cargado y mirá la primera
sincronización.

Aparte: si borrás un evento en Google y después lo restaurás, `applyEvent` (`:355`)
actualiza fecha y hora pero no vuelve el `status` a `scheduled`. La sesión queda
cancelada en Hilo para siempre.

## F. El digest quincenal

`server/digest.ts` → `digestRecipients` trae **todos** los profesionales, **todas**
las sesiones de la quincena, **todos** los pacientes activos y **todos** los pagos
del período. Ninguna de las cinco consultas tiene `.limit()`.

PostgREST corta en 1000 filas por defecto y no lo dice. Pasado ese punto los
números salen mal: profesionales con 0 sesiones que no reciben el mail, o saldos
impagos incompletos. En un cron desatendido que corre cada quince días.

El comentario del archivo dice "cinco consultas, sin importar cuántos
profesionales existan" — el tope de `DIGEST_BATCH_SIZE` limita los mails, no las
filas leídas.

## G. `/agenda?semana=` sin techo

`app/(app)/agenda/page.tsx:53` acepta cualquier entero finito.

- `semana=52` → `materialiseAppointments` escribe un año de sesiones de una. La
  guarda de `occurrencesBetween` corta en 400 iteraciones, así que el techo son
  ~400 filas por horario, **por carga de página**.
- `semana=999999999` → `mondayOf` se pasa del rango de `Date`, `toDateInput`
  devuelve `"NaN-NaN-NaN"`, eso entra al `.gte('scheduled_on', …)` y Postgres tira.
  Pantalla de error.

**Repro:** barra de direcciones.

## H. Menores

- **`deactivateSchedule`** (`server/appointments.ts:93`) pone `ends_on = hoy` pero
  borra las sesiones `>= hoy`. Dar de baja un horario se lleva puesta la sesión de
  hoy, que según `ends_on` debería quedar.
- **`occurrencesBetween`** (`:180`): la guarda de 400 vueltas se cuenta desde
  `starts_on`, no desde la ventana. Un horario semanal con `starts_on` de hace más
  de ~7 años y medio deja de generar sesiones, en silencio.
- **`api/reservas/route.ts:100`** hace `await sendBookingNotification(...)`. El
  comentario de arriba dice que no se espera; sí se espera. Con Resend lento, la
  familia mira el spinner.
- **`app/(auth)/recovery-cookie.ts:24`** lee `process.env.NODE_ENV` directo, contra
  la regla de `CLAUDE.md` de pasar todo por `src/lib/env.ts`.

## Lo que miré y está bien

Para no gastar tiempo ahí: `lib/safe-path.ts` (open redirect), la verificación de
firma de MP, el bearer del cron, la lista de siete usos de service-role, el
`proxy.ts`, la generación de slugs, el aislamiento por RLS, y el manejo de
`stop_reason: 'refusal'`. Todo eso está cuidado y con el porqué escrito al lado.

---

# Parte 2 — Lo que salió de probar a mano

Hallazgos de Tomás usando la app. Donde encontré la causa raíz leyendo el código,
va anotada.

## Configuración de producción

### P0 — El `.env.local` está incompleto y eso rompe los tests

Salió al intentar commitear: el pre-commit corre `typecheck` y se cayó porque
`node_modules` estaba viejo. Con `npm install` se arregla eso, pero queda lo otro:

Comparado contra `.env.example`, al `.env.local` le faltan cuatro variables:

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_APP_URL
OWNER_EMAIL
```

`NEXT_PUBLIC_APP_URL` es obligatoria en `src/lib/env.ts:95`, y como ese archivo
valida al importarse, **18 de los 24 archivos de test ni siquiera cargan**
(90 tests pasan, 1 falla de verdad: `src/lib/mail-from.test.ts`). O sea que la
suite local no está diciendo lo que parece decir.

Las dos de Google además apuntan derecho a **P3**: si tampoco están en Vercel, esa
es la explicación de que la conexión no ande en producción, y no hay que buscar
más lejos.

### P1 — El mail de verificación apunta a localhost

Las plantillas usan `{{ .SiteURL }}` (`supabase/templates/confirmacion.html:23` y
`recuperacion.html:19`), que resuelve contra el **Site URL del proyecto Supabase
hosteado**, no contra `NEXT_PUBLIC_APP_URL`.

Es un ajuste de dashboard, no de código: Authentication → URL Configuration → Site
URL, más `additional_redirect_urls` con el dominio de producción. El
`supabase/config.toml:163` que dice `http://127.0.0.1:3000` es el de local y está
bien así.

Rompe los dos mails: confirmación y recuperación de contraseña.

### P2 — Deja usar la cuenta sin verificar el mail

**Esto es a propósito, no un bug.** `supabase/config.toml:244`
`enable_confirmations = false`, con el porqué escrito al lado: que una profesional
se registre y esté trabajando el mismo minuto. Todo el flujo para prenderlo está
construido y probado punta a punta; encenderlo es cambiar ese valor acá y en el
dashboard. Ver `docs/launch.md §1`.

**[DECIDIR]** si se prende para el lanzamiento. Arreglar P1 es requisito previo:
prender confirmaciones con el Site URL apuntando a localhost deja a todo el mundo
afuera.

### P3 — Google Calendar no conecta en producción

Coincide con lo que sospechaba Tomás, y **P0 le da mucho peso a la segunda mitad
de la sospecha**: `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` faltan en el
`.env.local`. Chequear primero si también faltan en Vercel — es lo más barato de
descartar. Si están, entonces sí es el `redirect_uri` de producción, que tiene que
figurar en los orígenes autorizados de la consola de Google. A verificar contra
`api/google/callback/route.ts` y la pantalla de credenciales de Google Cloud.

Vale confirmarlo antes de tocar nada: el código de OAuth en sí está bien.

## Agenda

### P4 — "Vino" y "Volver a agendada" no se ven

**Misma causa raíz para los dos.** La grilla sólo estiliza el estado `cancelled`:

- `components/agenda/week-calendar.tsx:372` → `appointment.status === 'cancelled' && 'opacity-55'`. Y nada más.
- `components/agenda/week-grid.tsx` → **no lee `status` en ningún lado**.

Así que `attended`, `no_show` y `scheduled` se dibujan exactamente igual. Marcar
"Vino" funciona —la fila se actualiza en la base— pero no cambia un pixel. Y
"Volver a agendada" (`appointment-menu.tsx:73`) es el mismo caso al revés: pasa de
un estado invisible a otro estado invisible, así que parece que no hace nada.

Lo que hay que definir es cómo se ven los cuatro estados. `session-panel.tsx:38`
ya tiene una paleta (`attended` verde, `no_show` coral) que se puede reusar para no
inventar una segunda.

### P5 — "Quitar de la agenda" no anda si la hora vino de un horario fijo

El síntoma que reportaste como "si el que agendó fue el cliente" es en realidad
"si la sesión la generó una regla recurrente".

`deleteAppointmentAction` borra la fila. Pero la regla en `schedules` sigue activa,
y **la próxima carga de la Agenda llama a `materialiseAppointments`, que la vuelve
a crear**. La deduplicación es por el índice único `(schedule_id, scheduled_on)`, y
como la fila ya no está, no hay contra qué deduplicar.

O sea: se borra y reaparece. Para las horas sueltas (`source: 'manual'`) sí
funciona, que es por qué parece intermitente.

**[DECIDIR]** cuál es el comportamiento correcto. Las opciones razonables son
marcar la ocurrencia como excepción en vez de borrarla, o que "Quitar" ofrezca
"sólo esta vez" contra "todas las de este horario". Es la misma decisión que toma
cualquier calendario con eventos recurrentes.

### P6 — Agendar haciendo click en el calendario

Como Google Calendar: click en una franja horaria y se abre el diálogo con esa
fecha y esa hora ya puestas. Hoy hay que abrir el diálogo y escribir las dos cosas.

## Reservas públicas

### P7 — El formulario pide muy poco y muy mal

`components/booking/booking-form.tsx:125` es `<Input type="time" />` sin `step`,
así que la familia puede pedir las 14:37.

Y `preferredWeekday` (`:107`) es un día de la semana, no una fecha: la familia dice
"martes" y no hay forma de saber cuál martes. Para una consulta puntual —una
primera entrevista, que es el caso típico de una reserva— eso no alcanza.

Dos cambios: `step="900"` para que sea de a 15 minutos, y agregar fecha real.

## Alcance — sacar de la v1

> Recordatorio: **desactivar y ocultar, no borrar.**

### P8 — Mercado Pago [DECIDIR]

La postura de Tomás: no meterse ahora. Que los pagos **no dependan de Hilo** es un
compromiso grande para asumir en la v1.

Lo que se queda: registrar pagos a mano, subir comprobantes, el libro mensual de
Cobros. Todo eso es registro y no toca plata.

Lo que se apaga: la conexión de la cuenta MP, la generación de links de pago y el
webhook. `server/mercadopago.ts` entero, la entrada en el perfil, y el botón de
"cobrar por Mercado Pago" en Cobros.

Sacar también la cláusula 12 de los términos si deja de aplicar, o reescribirla.

### P9 — Videollamadas [DECIDIR]

`src/lib/video.ts` abre una sala en `meet.jit.si` con un id aleatorio. La sala es
pública: cualquiera con la URL entra, no hay autenticación ni sala de espera. Para
una sesión clínica con un menor, eso es un problema real, y no hay acuerdo de
tratamiento de datos con el proveedor.

Misma postura que MP: apagar la entrada, dejar el código.

### P10 — BAA / acuerdo de tratamiento de datos

Vale para los tres proveedores por los que sale contenido:

- **Anthropic** — los informes, evaluaciones y el dictado. Es el más importante:
  por acá salen notas clínicas.
- **El navegador, por el dictado** — la Web Speech API no reconoce en el
  dispositivo: manda el audio al servicio del navegador (en Chrome, Google) y
  devuelve texto. El audio de una sesión con un niño llega a un tercero.

  **Esto ya lo encontró y lo arregló Carolina** mientras yo escribía esto
  (commit `4b1f541`): la pantalla decía lo contrario y ahora dice la verdad, y la
  política de privacidad lo explica en `privacidad/page.tsx:55-62`, con la salida
  para quien no lo quiera. La divulgación está hecha.

  Lo que queda es la decisión de fondo: **[DECIDIR]** si el dictado se sostiene
  así para la v1 sabiendo eso, o si se apaga hasta que `processLocally` sea usable.
- **Resend** — los mails. Hoy no llevan contenido clínico, y esa regla hay que
  sostenerla.

No es trabajo de código; es papelería que tiene que existir antes de tener
pacientes reales adentro.

## Legales y textos

### P11 — Términos y privacidad, inconsistentes

`app/(legal)/terminos/page.tsx` y `privacidad/page.tsx` no coinciden entre sí sobre
qué dato sale del sistema y qué no. Con P8 y P9 desactivados, además, van a hablar
de cosas que no existen.

Hay que reescribirlos contra lo que la app hace de verdad. La lista corta de qué
sale hoy: el texto que la profesional escribe va a Anthropic; los archivos de
material subidos también, pero sólo por la ruta de describir un archivo; a Google
Calendar va la hora y un título configurable que por defecto dice "Ocupado"; a
Resend van avisos sin contenido clínico.

### P12 — Publicar en la comunidad, y qué pasa si no tenía permiso

La declaración existe y se valida en el servidor (`server/materials.ts:82`,
casilla en `material-form.tsx:397`), pero el botón no se desactiva hasta marcarla,
así que se llega al error después de intentar.

Lo de fondo es lo que decía Tomás: pedir la declaración no alcanza. Los términos
tienen que decir qué pasa si resulta que no tenía permiso — quién responde, y que
Hilo puede bajar el material sin aviso.

## Producto y usabilidad

### P13 — Nombres que no cierran

En el perfil del paciente se habla todo el tiempo de "sesión", pero en la barra
lateral esa palabra no existe. ¿Una sesión se tiene en Agenda o en Planificación?
No se entiende.

Es el problema de vocabulario más grande que tiene la app y arrastra a P14.

### P14 — Planificación es difícil de entender

Costó mucho probar hasta entender qué hace. Es la pantalla que más se beneficia de
que se resuelva primero P13.

### P15 — Navegación: el botón atrás manda a cualquier lado

Perfil del paciente → click en una evaluación → atrás lleva a `/evaluaciones` en
vez de al perfil. Probablemente pasa lo mismo con informes y materiales.

### P16 — "Próxima sesión" sin fecha

En el perfil del paciente dice que hay una próxima sesión pero no cuándo es.

### P17 — La pestaña Evolución

Necesita fechas: no se ve cuándo mejoró un objetivo, sólo el número actual. Y no se
puede corregir un error — no hay forma de borrar un registro de progreso.

### P18 — Materiales sin paginación

Lista completa de una. Con biblioteca propia más lo de la comunidad, no escala.

### P19 — Versionado de informes

Si editás un informe a mano y después le pasás la IA, se pierde lo escrito a mano.
Guardar versiones y poder volver atrás.

Es el punto de esta lista con más riesgo clínico: lo que se pierde es texto que una
profesional escribió y va a firmar.

### P20 — Prompt propio para informes y evaluaciones

En vez de que pidan un formato nuevo por el botón de "me falta este formato", que
puedan pegar el prompt que ya usan y correrlo con los datos del paciente cargados.

Ojo con el bloque clínico de `server/ai.ts`: las reglas innegociables (no inventar
resultados, interpretar puntajes, no dar diagnósticos cerrados) tienen que seguir
aplicando arriba de cualquier prompt que escriba la usuaria.

### P21 — Onboarding más interactivo

Que invite a hacer las cosas que menciona en vez de sólo listarlas.

### P22 — "Instalá Hilo", ¿qué es?

Es el aviso de instalar la PWA (`app/manifest.ts`). No se entiende qué ofrece. O se
explica en una frase, o se saca.
