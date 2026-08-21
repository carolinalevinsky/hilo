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

## Cómo está ahora

```
Navegador (Uruguay)
   ↓  ~180 ms         una vez por pantalla
Código + base (Oregon)
   ↓  ~1 ms           por consulta
```

Se paga un poco más en el salto único y se ahorran todos los saltos por consulta.

Está en `vercel.json`:

```json
"regions": ["pdx1"]
```

`pdx1` es Portland, que es donde vive `aws-0-us-west-2`. No es un número mágico:
tiene que coincidir con la región del proyecto de Supabase. Si algún día la base
se muda, esta línea se muda con ella o volvemos al problema de arriba.

## Lo que sería mejor todavía

Las dos cosas en São Paulo:

```
Navegador (Uruguay)
   ↓  ~30 ms
Código + base (São Paulo)
   ↓  ~1 ms
```

Eso exige crear un proyecto de Supabase nuevo en São Paulo y migrar los datos, y
después cambiar `regions` a `["gru1"]`. Es la mejor configuración posible para
usuarias en Uruguay y es varias horas de trabajo con datos reales de por medio.

Conviene medir con Oregon primero. Si con eso alcanza, la migración puede
esperar; si no, ya sabemos exactamente qué falta.

---

## Cómo comprobar dónde está corriendo

```bash
curl -s -D - -o /dev/null https://<tu-dominio>/entrar | grep -i x-vercel-id
```

Devuelve algo como `gru1::pdx1::abc123`. El **primero** es por dónde entró la
petición y el **segundo** es dónde corrió la función. El segundo es el que
importa, y es el que tiene que coincidir con la región de Supabase.
