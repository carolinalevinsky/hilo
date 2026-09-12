# Términos y Privacidad: lo que falta antes de publicar

**Escrito el 10 de septiembre de 2026.** Es P11 del documento de Thomas, y la
instrucción fue **redactar, no publicar**. Así que acá no hay ningún cambio
aplicado: las dos pantallas siguen exactamente como estaban.

Lo que sí hay es la parte que un abogado no puede escribir solo, porque hay que
mirar el código para saberla: **qué hace Hilo de verdad con los datos, y en qué
puntos los dos documentos publicados no lo dicen o dicen otra cosa.** Con esto
al lado, la revisión legal se vuelve corta.

Los dos archivos:

- `src/app/(legal)/terminos/page.tsx`
- `src/app/(legal)/privacidad/page.tsx`

El `layout` de esas dos pantallas ya avisa que son documentos modelo y que
conviene una revisión legal antes de usarlos con pacientes reales. Eso está
bien y hay que dejarlo hasta que la revisión ocurra.

---

## 1. Hay dos huecos sin llenar, y están publicados

`terminos/page.tsx:104` y `privacidad/page.tsx:85` dicen, con esas palabras:

> **Contacto.** [correo de contacto de Hepic].

Las dos pantallas son públicas y estáticas: cualquiera que abra el link del pie
las ve así. Un documento legal con un corchete sin llenar no es un error de
redacción, es la señal de que nadie lo leyó entero — y es lo primero que va a
notar una familia que entra a leer antes de dejar un teléfono.

**Es un cambio de una línea en cada archivo y no depende de ninguna decisión
más.** Cuál es el correo lo sabés vos; yo no lo puedo inventar.

---

## 2. "Con quién se comparten: con nadie" no es cierto

La Política de Privacidad dice:

> **Con quién se comparten.** Con nadie, salvo autorización expresa de la familia
> (por ejemplo, enviar un informe al colegio o a la mutualista) o requerimiento
> legal.

Tres párrafos más arriba, el mismo documento dice que los textos se envían a un
proveedor de IA. Las dos cosas no pueden ser verdad a la vez, y la que está mal
es ésta: **hay encargados del tratamiento, y son varios.** Un documento que dice
"con nadie" y en otro renglón dice que manda texto clínico afuera se lee como
descuidado en el mejor caso.

Esto es lo que hay de verdad, mirando el código. Sirve tal cual como lista de
encargados:

| Quién | Qué ve, exactamente |
|---|---|
| **Supabase** | Todo. Es la base de datos y el almacenamiento: pacientes, sesiones, objetivos, evaluaciones, informes y sus versiones anteriores. |
| **Vercel** | El tránsito. Corre la aplicación; los datos le pasan por adentro aunque no los guarde. |
| **Anthropic** | El texto que se manda a redactar: el contexto del informe o de la evaluación, el dictado de una sesión, la pregunta al asistente, y el archivo que se sube para que lo describa. No la base entera — sólo lo de ese pedido. |
| **Resend** | Correo. El resumen semanal va **sin nombres**: cuenta cuántas sesiones y cuánto saldo, y un link. La única excepción está en el punto 4. |
| **Google Calendar** | Sólo si la profesional lo conecta, y sólo lo que ella eligió que salga: "Ocupado", las iniciales, o el nombre de pila. Nunca el motivo ni la nota. |
| **El servicio de dictado del navegador** (Google en Chrome, Apple en Safari) | El audio, cuando se usa dictar o grabar. **No pasa por Hilo**: va del navegador a ese servicio y vuelve como texto. Esto ya está bien explicado en el documento. |
| **Mercado Pago** | Nada, por ahora: está apagado para la v1 (ver el punto 3). |

Dos cosas que conviene decir junto a esa tabla, porque son ciertas y son buenas:

- **Ningún informe ni nota clínica viaja por correo.** Es una regla del proyecto,
  no una casualidad: el resumen manda números y un link, y el contenido queda
  atrás del login. Un correo es una copia que ya no se controla.
- **Queda registro de quién tocó qué y cuándo** (`audit_log`), y la profesional
  puede leer el suyo. Es lo que hace contestable la pregunta que la Ley N.º
  18.331 permite hacer.

**Ojo con el orden.** Nombrar a Anthropic y a Resend como encargados en un
documento público es afirmar que hay una relación de encargo. Eso es P10 —el
papeleo de tratamiento de datos con los dos— y va **antes** de publicar esta
tabla, no después.

---

## 3. Los Términos ofrecen algo que la v1 no tiene

Cláusula 12, `terminos/page.tsx:87`:

> **Pagos.** Los cobros a las familias se realizan directamente entre el/la
> profesional y la familia; Hilo solo facilita el medio (por ejemplo, Mercado
> Pago) y no es parte de esa relación ni retiene los fondos.

**Mercado Pago está apagado** desde el commit `3a01b1a` (P8): la bandera está en
`src/lib/features.ts` y el corte se hace en el servidor, no escondiendo un
botón. El párrafo describe algo que hoy no se puede hacer.

El fondo de la cláusula —Hilo no es parte de la relación de cobro y no retiene
fondos— sigue siendo correcto y hay que conservarlo. Lo que sobra es el ejemplo.
Redacción propuesta:

> **12. Pagos.** Los cobros a las familias se acuerdan y se realizan directamente
> entre el/la profesional y la familia. Hilo lleva el registro de lo cobrado y lo
> pendiente; no interviene en el pago, no es parte de esa relación y no retiene
> fondos en ningún momento.

Cuando Mercado Pago se vuelva a prender, se le agrega el ejemplo de vuelta.

---

## 4. El formulario público de reservas no está en ninguno de los dos documentos

Es el hueco más importante después del punto 2, y no lo tenía el documento de
Thomas.

Una familia que recibe el link de reserva escribe **nombre, teléfono y una nota
libre**, y aprieta enviar sin tener cuenta y sin haber aceptado nada. Esa nota
libre es donde alguien escribe "mi hija tiene dificultades en el lenguaje": es
un dato de salud, de un menor, cargado por alguien que todavía no es paciente.

Y esos tres campos **salen por correo** hacia la profesional, con nombre y
teléfono adentro (`src/server/notifications.ts:122`). Es la única excepción a la
regla de "los correos no llevan nombres", y es una excepción deliberada: el
aviso de una reserva sin el nombre no sirve para nada.

Nada de esto está mal. Lo que está mal es que **ninguno de los dos documentos lo
menciona**. Hace falta un párrafo en la Política de Privacidad, y un aviso corto
en el propio formulario antes del botón de enviar. Redacción propuesta para el
documento:

> **Pedidos de hora desde el link público.** Si llegaste por el link de reservas
> de un/a profesional, lo que escribas —nombre, teléfono y el comentario— se
> guarda para que pueda contactarte y se le avisa por correo electrónico. No hace
> falta que cuentes ahí ningún detalle de salud: alcanza con el motivo en una
> línea, y el resto lo hablás en la consulta. Si finalmente no se agenda nada,
> podés pedirle que borre el pedido.

---

## 5. Ninguno de los dos dice desde cuándo rige

Los Términos, en la cláusula 14, prometen comunicar los cambios relevantes. Sin
una fecha de última actualización arriba, esa promesa no se puede verificar
desde afuera ni cumplir desde adentro: no hay contra qué comparar.

Una línea en el encabezado de cada uno —"Última actualización: <fecha>"— y
actualizarla cuando cambien. Es lo que convierte la cláusula 14 en algo real.

---

## 6. Lo que dice sobre conservación se quedó corto

> **Conservación.** Mientras dure el tratamiento y por los plazos que exijan las
> obligaciones profesionales y legales; luego se suprimen o anonimizan.

Correcto, y le falta lo que la aplicación hace de verdad, que es más preciso y
más tranquilizador:

- **Archivar** un paciente lo saca de las listas y **no borra nada**.
- **Borrar** un paciente lo marca como borrado y lo saca de todas las pantallas.
- **Exportar** entrega todos los datos de un paciente, para la familia que los
  pide.
- Desde el commit `c4dc65f`, un informe guarda **las versiones anteriores** de su
  texto. Se borran junto con el informe: la clave foránea está puesta
  justamente para que apretar "Borrar" no deje texto clínico atrás.

Redacción propuesta, para sumar después del párrafo actual:

> Desde la ficha del paciente se puede archivar (deja de aparecer en las listas y
> no se borra nada), borrar (deja de estar disponible en la aplicación) o
> exportar todos sus datos. De los informes se guardan también las versiones
> anteriores del texto, que se borran junto con el informe.

---

## Resumen, por si mirás sólo esto

| | Qué | Depende de |
|---|---|---|
| 1 | Llenar los dos `[correo de contacto de Hepic]` | Vos. Dos líneas. |
| 2 | Reemplazar "con nadie" por la lista real de encargados | **P10 primero** |
| 3 | Sacar el ejemplo de Mercado Pago de la cláusula 12 | Nada |
| 4 | Sumar el párrafo del formulario público de reservas | Nada |
| 5 | Poner fecha de última actualización en los dos | Vos |
| 6 | Completar el párrafo de conservación | Nada |

Los puntos 3, 4 y 6 tienen la redacción ya escrita más arriba y no dependen de
nadie más. El 1 y el 5 son datos que sólo tenés vos. El 2 espera a P10.

Y el aviso de "documento modelo, orientativo" del `layout` se queda hasta que un
abogado los mire. Nada de esto lo reemplaza.
