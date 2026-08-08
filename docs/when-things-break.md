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

## Antes de llamar a Tomás

Tené esto a mano, hace la diferencia entre cinco minutos y una hora:

- Qué estabas haciendo cuando se rompió.
- Qué fue lo último que desplegaste (el commit).
- Si el rollback lo arregló o no.
- El mensaje de error completo, copiado entero — no un resumen ni una foto.
