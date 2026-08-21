# Poner el v2 online, reusando todo lo del v1

Esto **no** es `launch.md`. Aquel asume que hay que abrir cinco cuentas. Este es
para la situación real: las cuentas ya existen, sos la única usuaria, y no hay
pacientes reales que migrar.

Tu parte son unos quince minutos. El resto lo corre Claude.

---

## Antes de empezar

Dos datos que ya están confirmados y no hace falta buscar:

| Dato | Valor |
|---|---|
| Proyecto de Supabase | `uepyfqibtocrekvnliyk` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uepyfqibtocrekvnliyk.supabase.co` |

Las migraciones **no borran nada** — sólo crean tablas nuevas, con nombres en
inglés que no chocan con los del v1 (`pacientes` sigue intacta). El v1 no deja
de funcionar mientras hacés esto.

---

## 1. El token de Supabase — 2 minutos, tuyos

Generá uno en:

**https://supabase.com/dashboard/account/tokens**

*Generate new token*, nombre "hilo v2", y copialo. Se muestra una sola vez.

Después, en la terminal, desde la carpeta del worktree:

```bash
read -rs SUPABASE_ACCESS_TOKEN && export SUPABASE_ACCESS_TOKEN
```

Pegá el token y dale enter. `read -rs` no lo muestra en pantalla y no lo deja en
el historial de la shell.

Vas a necesitar también la contraseña de la base — está en
*Project Settings → Database*. Si no la tenés, ahí mismo se resetea:

```bash
read -rs SUPABASE_DB_PASSWORD && export SUPABASE_DB_PASSWORD
```

**Avisá cuando estén las dos exportadas.** Ahí corro yo:

```bash
./dx npx supabase link --project-ref uepyfqibtocrekvnliyk
./dx npx supabase db push
```

Y después cargo los 45 materiales compartidos y verifico que sean 45.

> Las variables viven sólo en esa terminal. Se van cuando la cerrás, y nunca
> pasan por el chat.

---

## 2. Borrar tu usuario viejo — 30 segundos, tuyos

**Esto es obligatorio y es fácil de pasar por alto.**

El v2 crea tu perfil con un trigger que se dispara cuando nace un usuario nuevo
en `auth.users`. Tu usuario del v1 ya existe, así que ese trigger nunca va a
correr para él: entrarías sin fila en `practitioners` y **todas las pantallas
fallarían**.

No se puede arreglar con un backfill porque `discipline` es obligatoria y no hay
de dónde sacarla.

La solución es un clic:

**Authentication → Users**, encontrá tu usuario, borralo.

Después te registrás de nuevo en el v2 con el mismo mail, el trigger corre como
corresponde, y tu perfil queda bien armado. No perdés nada: no hay pacientes.

---

## 3. Vercel — 10 minutos, tuyos

Un proyecto **nuevo**, no el del v1. El del v1 está configurado para HTML plano
y funciones sueltas; el v2 es una app de Next.js.

*Add New → Project*, importá `carolinalevinsky/hilo`, y en **Branch** elegí
`trabajo-nuevo`.

Después, las nueve variables. Seis salen de copiar y pegar del proyecto viejo
(*Settings → Environment Variables* del v1, en otra pestaña):

| En el v2 poné | Copiá de | Nota |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `SB_SERVICE_KEY` del v1 | cambia el nombre |
| `ANTHROPIC_API_KEY` | igual | mismo nombre |
| `RESEND_API_KEY` | igual | mismo nombre |
| `CRON_SECRET` | igual | mismo nombre |
| `MAIL_FROM` | `HILO_MAIL_FROM` del v1 | cambia el nombre |
| `MP_WEBHOOK_SECRET` | `HILO_WEBHOOK_SECRET` del v1 | cambia el nombre |

Las otras tres:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uepyfqibtocrekvnliyk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Project Settings → API*, la clave `anon public` |
| `NEXT_PUBLIC_APP_URL` | La URL `*.vercel.app` que te dé Vercel, exacta y con `https://` |

Cargalas para **Production y Preview**, las dos.

`HILO_MODELO` del v1 **no se copia**: el modelo ahora está fijo en el código, que
era el punto.

> Si falta una, el build falla y te dice cuál. Es a propósito.

---

## 4. Supabase tiene que saber la dirección nueva

*Authentication → URL Configuration*:

- **Site URL**: la URL de Vercel
- **Redirect URLs**: la misma

Sin esto entrás, y el login te redirige a la dirección vieja sin ningún error
que lo explique.

---

## 5. Ya está online

Andá a la URL de `*.vercel.app`, creá tu cuenta, y avisame. Ahí corro las
verificaciones:

- `robots.txt`, el manifest, y que `/api/digest` responda 401 sin autenticación
- El aislamiento por RLS contra la base real, con dos cuentas
- Un informe generado de punta a punta, que es el que cuesta plata

---

## 6. Un dominio propio, si algún día querés

**`hilo.uy` no es de Hilo.** Aparece como ejemplo en `launch.md` y en un comentario
de `booking-link.tsx`, y en algún momento se dio por propio sin comprobarlo. No lo
es: responde 403 y pertenece a otra persona.

Mientras tanto la URL de Vercel funciona perfecto — es una dirección real, con
HTTPS, y no vence.

El día que compres un dominio, apuntarlo son quince minutos y hay que tocar
**tres** lugares, no uno:

1. `NEXT_PUBLIC_APP_URL` en Vercel
2. Site URL y Redirect URLs en Supabase
3. La URL del webhook en Mercado Pago

Olvidarse del segundo es el error clásico: el login redirige a la dirección
vieja y no hay mensaje que lo explique.

---

## Lo que queda para después, y no frena nada

- **Prender GitHub Actions** (*Settings → Actions → General*). CI no corre y es
  la única puerta del proyecto. No bloquea el deploy, pero conviene.
- **Pausar el proyecto de Supabase del v1** — sólo si algún día lo separás del
  v2. Ahora comparten proyecto.
- **Borrar las tablas del v1** (`pacientes` y compañía) cuando estés segura de
  que no las querés. Pausar y borrar no son lo mismo: lo segundo no se deshace.
