# Dónde corre cada cosa, y por qué importa

Hilo hace varias consultas por pantalla, una atrás de la otra: no puede empezar
la segunda hasta que vuelve la primera. Con la base al lado eso no se nota. Con
la base en otro continente, cada una de esas esperas se suma.

Por eso la ubicación no es un detalle de infraestructura acá: es la variable que
más pesa en cuánto tarda una pantalla en aparecer.

---

## La regla

**El código y la base tienen que estar en el mismo lugar.**

No "cerca del usuario". En el mismo lugar. La distancia al usuario se paga una
vez por pantalla; la distancia a la base se paga **por consulta**.

Con seis consultas por pantalla, un salto de 60 ms a la base cuesta 360 ms. Un
salto de 60 ms al usuario cuesta 60.

---

## Cómo estaba, y por qué era lo peor de los dos mundos

```
Navegador (Uruguay)
   ↓  ~150 ms         una vez por pantalla
Código (Washington, iad1)
   ↓  ~60 ms          por CADA consulta
Base (Oregon, aws-0-us-west-2)
```

Tres lugares distintos. El código lejos del usuario **y** lejos de la base.

La base quedó en Oregon porque es la del v1, que se reusó para salir rápido.
`docs/launch.md` decía que un proyecto nuevo iba en São Paulo justamente por
esto; reusar fue la decisión correcta para publicar, y esto es lo que costó.

## El paso intermedio: los dos en Oregon

Primero se movió sólo el código, a Oregon, para juntarlo con la base sin tocar
datos. Eso arregló los saltos por consulta y dejó el número así:

| | Cuánto | Se paga |
|---|---|---|
| Llegar al borde de Vercel (São Paulo) | ~150 ms | una vez |
| Del borde hasta Oregon y volver | ~180 ms | una vez |
| El código corriendo | ~193 ms | una vez |
| **Total** | **~500 ms** | |

Los ~193 ms salen del panel de Vercel, en *Active CPU*, y los otros dos de
comparar un archivo estático —que se sirve en el borde y nunca viaja a Oregon,
~150 ms— contra una pantalla dinámica, ~500 ms.

Con ese reparto medido quedó claro que sólo había una palanca más: **los 180 ms
de ir hasta Oregon**, que se borran si el código y la base viven donde está la
usuaria.

## Cómo está ahora

```
Navegador (Uruguay)
   ↓  ~30 ms          una vez por pantalla
Código + base (São Paulo)
   ↓  ~1 ms           por consulta
```

Está en `vercel.json`:

```json
"regions": ["gru1"]
```

`gru1` es São Paulo, que es donde vive `sa-east-1`. No es un número mágico: tiene
que coincidir con la región del proyecto de Supabase. Si algún día la base se
muda, esta línea se muda con ella o volvemos al problema de arriba.

> La región de un proyecto de Supabase **no se puede cambiar**. Su propia
> documentación dice que el procedimiento para cambiarla es crear un proyecto
> nuevo y migrar. Por eso esto se hizo cuando no había datos reales que mover:
> tres pacientes de prueba, cero sesiones, cero informes. Con historias clínicas
> cargadas la misma mudanza exige respaldo, plan de vuelta atrás y una ventana de
> mantenimiento.

`Settings → Functions → Function Region` en Vercel es un valor aparte, y
`vercel.json` le gana. Cuando no coinciden, el panel muestra "Overridden" y lo
que manda es el archivo. Conviene igual dejarlos iguales: el día que el archivo
no cubra alguna función, esa se va sola a donde diga el panel.

---

## La otra mitad: tardar poco y parecer que no tardás

Mover el código a Oregon bajó el número y no cambió la sensación. El motivo es
que había un segundo problema, independiente del primero.

Cambiar un filtro es una **transición** de React: la pantalla vieja se queda en
su lugar mientras el servidor contesta, en vez de vaciarse y mostrar un
esqueleto. Eso es lo correcto —vaciar una lista para volver a llenarla con casi
lo mismo es peor— pero tiene una condición: **hay que dibujar que algo está
pasando.**

No se dibujaba. El código decía:

```ts
const [, startTransition] = useTransition()
```

Esa coma descarta `isPending`, que es el dato que dice "hay algo en curso". Sin
él, tocabas un chip y la pantalla quedaba **exactamente igual** hasta que
llegaba la respuesta y cambiaba todo de golpe. Cuatrocientos milisegundos así se
sienten como varios segundos, porque durante ese rato la aplicación es
indistinguible de una que no recibió el click.

Tres cosas lo arreglan, y ninguna hace que el servidor conteste más rápido:

| Qué | Cómo |
|---|---|
| El chip se pinta al tocarlo | `useOptimistic` sobre la query string, en `use-url-state.ts` |
| La lista se atenúa mientras carga | `Results`, con `aria-busy` para lectores de pantalla |
| El menú se pinta al tocarlo | `useLinkStatus()`, adentro del `<Link>` |

Lo optimista es la dirección **como va a quedar**, no como está: si el servidor
contesta otra cosa, React lo corrige solo. No hay un segundo lugar donde viva el
estado.

Medido en el navegador: al segundo cuadro después del click el chip ya está
pintado y `aria-busy` ya es `true`, con la URL todavía sin cambiar. La píldora
del menú queda blanca a los 147 ms, también antes de que la navegación termine.

**La regla que queda:** si una interacción dispara una transición, algo tiene que
cambiar en pantalla en el mismo cuadro. `useTransition` sin leer `isPending` es
casi siempre un error, y se reconoce por esa coma.

---

## Cómo comprobar dónde está corriendo

```bash
curl -s -D - -o /dev/null https://<tu-dominio>/entrar | grep -i x-vercel-id
```

Devuelve algo como `gru1::pdx1::abc123`. El **primero** es por dónde entró la
petición y el **segundo** es dónde corrió la función. El segundo es el que
importa, y es el que tiene que coincidir con la región de Supabase.
