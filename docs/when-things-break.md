# Cuando algo se rompe

Esta guía es para el momento en que algo no anda y hay que hacer algo **ya**.
No hace falta entender el problema para dar el primer paso.

---

## La regla que vale más que todas

**Si el sitio está caído o roto, primero se restaura, después se investiga.**

Nadie diagnostica bien con el sitio abajo. Volver atrás no es rendirse: es sacar
la presión de encima para poder pensar.

---

## Primeros pasos, según el síntoma

| Qué está pasando | Primer paso |
| --- | --- |
| El sitio está caído o muy roto | **Rollback en Vercel.** Después investigar. |
| Un cambio quedó mal pero el sitio funciona | Revertí el commit y hacé push. Se redespliega solo. |
| Los datos se ven mal o faltan | **No toques nada.** Restaurá un backup en un proyecto nuevo y compará. |
| CI está en rojo y no se entiende el mensaje | Pegale el error completo a Claude. Los checks están escritos para explicarse. |
| Algo se está incendiando y nada de esto encaja | Llamá a Tomás. |

---

## Rollback en Vercel

1. Entrá a [vercel.com](https://vercel.com) → el proyecto **hilo** → pestaña
   **Deployments**.
2. Buscá el último deployment que funcionaba. Están ordenados por fecha y cada
   uno muestra el commit.
3. Los tres puntos `⋯` → **Promote to Production**.
4. Listo. En menos de un minuto el sitio vuelve a como estaba.

Esto **no** borra el código nuevo — sigue en GitHub. Solo cambia qué versión se
está sirviendo. Podés volver a desplegar cuando esté arreglado.

---

## Lo que el rollback NO arregla

El rollback devuelve el **código**. No devuelve los **datos**.

Si una migración borró una columna, esa columna sigue borrada después del
rollback. Por eso:

- Los backups diarios de Supabase tienen que estar prendidos.
- Si el plan lo permite, point-in-time recovery también. Son historias clínicas;
  el costo no es la variable interesante.
- **Restaurá siempre en un proyecto nuevo primero**, verificá que los datos estén
  bien, y recién ahí cambiá. Nunca restaures encima de una base viva mientras
  intentás arreglarla.

---

## Si CI está en rojo

CI es la única puerta de este proyecto: no hay nadie revisando el código además
de vos. Un check rojo es un freno real, no un trámite.

Los checks están escritos para explicarse solos. El mensaje dice qué pasó, por
qué importa, y qué hacer. Si aun así no se entiende, copiá **todo** el output y
pedíselo a Claude.

Lo que revisa cada uno:

| Check | Qué mira |
| --- | --- |
| `lint` | Que el código respete los límites de la arquitectura |
| `check:boundaries` | Que esos límites sigan funcionando de verdad |
| `typecheck` | Que los tipos cierren |
| `check:secrets` | Que ninguna clave secreta esté expuesta al navegador |
| `check:rls` | Que ninguna tabla quede sin protección de acceso |
| `check:migration` | Que ningún cambio destructivo a la base pase sin querer |
| `test` | Que las reglas de negocio sigan andando |
| `build` | Que compile |

**No desactives un check para que pase el build.** Si uno molesta seguido, es
información sobre el código, no sobre el check.

---

## Reglas duras

- **Nunca edites una migración que ya corrió en producción.** Escribí una nueva
  que la corrija. Editarla deja la base con un estado real que no coincide con su
  historia, y eso no se nota hasta que algo falla raro.
- **Nunca cambies el esquema desde el panel de Supabase.** Ese cambio existe en
  producción y en ningún archivo. El próximo `npm run db:reset` lo borra.
- **Nunca pongas `NEXT_PUBLIC_` adelante de una clave.** Ese prefijo publica el
  valor al navegador de todos.

---

## En desarrollo, no en producción

Cuatro cosas que cuestan horas la primera vez y treinta segundos cuando sabés
que existen. Ninguna afecta a producción ni a CI, que compila desde cero.

### La página se ve pero no anda nada

Ningún diálogo abre, ningún filtro filtra, ningún formulario manda. En la
consola, una fila de **403 en los archivos de `/_next/static/chunks/`**.

El dev server corre en `0.0.0.0` adentro del contenedor, así que un navegador
que pide `127.0.0.1` es otro origen para Next, y contesta 403 en todos los
bundles. La página se ve igual porque eso es HTML del servidor; lo que nunca
pasa es la hidratación. Lo arregla `allowedDevOrigins` en `next.config.ts`, que
ya está puesto — si volvés a ver 403 ahí, es que alguien lo sacó.

### Dos copias del repo abiertas a la vez

Con un worktree al lado del checkout principal, el segundo `./dx npm run dev`
arranca **sin ningún puerto publicado**, porque el 3000 ya está tomado. El
navegador te muestra el primero y te volvés loca buscando por qué no se aplican
tus cambios.

```bash
PORT=3001 ./dx npm run dev
```

Peor todavía si las dos copias comparten `.next`: los dos Turbopack se traban
escribiendo el mismo archivo y aparece `Resource deadlock avoided (os error 35)`
seguido de un panic que se lleva puesto el proceso.

### `npm run typecheck` falla por archivos que no existen

```
error TS6053: File '.next/types/routes.d 2.ts' not found.
```

Duplicados con " 2" en el nombre adentro de `.next/`, de los que deja macOS
cuando algo copia la carpeta. `tsconfig.json` los levanta con su glob y `tsc` se
queja de archivos que ya no están. Se borran y listo — `.next` está en
`.gitignore` y se regenera sola:

```bash
rm -f .next/types/*\ 2*.ts
```

### Un archivo de `src/server/` aparece vacío

Si un import falla con *"The module has no exports at all"* y el archivo tiene
cuatro líneas y un `export {}`, **no lo reescribas**. Mirá git primero:

```bash
git diff --stat src/server/
git restore src/server/<archivo>.ts
```

Pasó **cuatro veces** con `src/server/booking.ts` en agosto de 2026, siempre con
otra sesión de Claude corriendo sobre el mismo repositorio. Los commits nunca se
tocaron; solo el archivo en el directorio de trabajo. Reescribirlo a mano habría
sido tirar 225 líneas para reemplazarlas por una versión peor.

Si te vuelve a pasar, buscá quién más está escribiendo:

```bash
ps aux | grep '[c]laude' | grep -- --output-format
```

Una sesión headless sobre el mismo repositorio es la explicación más probable, y
mientras siga viva va a volver a pasar. Cerrala antes de seguir.

---

## Antes de llamar a Tomás

Tené esto a mano, hace la diferencia entre cinco minutos y una hora:

- Qué estabas haciendo cuando se rompió.
- Qué fue lo último que desplegaste (el commit).
- Si el rollback lo arregló o no.
- El mensaje de error completo, copiado entero — no un resumen ni una foto.
