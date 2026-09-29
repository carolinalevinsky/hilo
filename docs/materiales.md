# Cómo se escribe un material de Ombúa

La biblioteca compartida es contenido del producto, no datos de nadie: vive en
`supabase/seeds/`, con `practitioner_id` en null, y es igual en todos los
ambientes. Un material flojo lo ven todas las profesionales de esa disciplina,
así que el estándar está acá y se verifica solo: `src/lib/material-seeds.test.ts`
falla si un material entra por debajo de la línea.

Este documento es el estándar y de dónde sale.

---

## El problema que arregla

La primera biblioteca tenía 301 materiales de dos orígenes muy distintos.

45 venían transcritos del v1 por `scripts/extract-materials.mjs`. Medían 205
caracteres de mediana: una consigna y nada más. Así se veía uno entero, tal cual
lo abría una psicopedagoga:

> **Figuras y sus nombres** · Uní cada figura con su nombre: 🔺 · ◼️ · 🔵 · ⬠ /
> triángulo · cuadrado · círculo · pentágono / ¿Cuántos lados tiene cada una?

Sin para qué, sin qué mirar, sin qué hacer si no sale, sin segundo ejercicio. Y
en psicopedagogía **29 de los 50 materiales eran de esos**.

Los otros 256, escritos para Ombúa, medían 580 y estaban bien armados, pero
igual les faltaba lo mismo que a cualquier material de una sola pasada: un solo
ejercicio, la dosis sin decir, y la progresión apenas insinuada.

El estándar de abajo se aplica a los dos orígenes. No hay materiales "heredados"
en la biblioteca: los hay buenos o no están.

Después de la reescritura la biblioteca tiene 333 materiales, de 1971 caracteres
de mediana, repartidos así:

| disciplina | materiales | 3-5 | 6-7 | 8-9 | 10-11 | 12-14 | 15+ |
|---|---|---|---|---|---|---|---|
| psicopedagogía | 60 | 3 | 13 | 26 | 12 | 4 | 2 |
| terapia ocupacional | 58 | 16 | 26 | 8 | 3 | 3 | 2 |
| psicomotricidad | 56 | 15 | 25 | 9 | 4 | 3 | 0 |
| fonoaudiología | 55 | 9 | 22 | 16 | 4 | 2 | 2 |
| fisioterapia | 54 | 2 | 2 | 1 | 2 | 2 | 45 |
| psicología | 50 | 7 | 9 | 10 | 9 | 10 | 5 |

Fisioterapia sigue concentrada en adultos porque su práctica lo está, pero ya no
deja a un kinesiólogo de niños sin nada: tiene nueve materiales pediátricos.
Psicomotricidad no tiene 15+ a propósito: arriba de esa edad es otra práctica, y
el test la exime de esa franja.

---

## La anatomía

Un material es una sesión de trabajo, no una consigna. Mide entre 1300 y 2700
caracteres (la mediana de la biblioteca es 1971) y siempre tiene estas partes, en
este orden. Los nombres de los subtítulos se adaptan a la disciplina; el
contenido de cada parte no es opcional.

**1. Para qué sirve.** Una o dos frases: qué habilidad entrena y por qué esta
actividad y no otra. Es lo que la profesional le dice a la familia cuando
pregunta para qué es esto. Nunca es la repetición del título.

**2. Qué necesitás.** Los materiales, con cantidades. Si no hace falta nada, lo
dice: "Nada". Un material que pide algo que no está en la lista se abandona a la
mitad.

**3. Cómo se presenta.** Cómo arranca, y quién hace qué: primero lo muestra la
profesional, después lo hacen juntos, después solo. Ese orden —modelo, práctica
guiada, práctica sola— es la estructura de la enseñanza explícita, y es lo que
evita que el primer intento del chico sea también su primer error.

**4. Dos o más ejercicios, con el contenido escrito.** Esta es la parte que
antes faltaba. No "hacer listas de palabras con r": las palabras van escritas.
No "proponer problemas de dos pasos": los problemas van escritos. Tres bloques
de ejercicios es lo habitual, cada uno un escalón más difícil que el anterior, y
alcanzan para una sesión entera sin que la profesional tenga que inventar en el
momento.

**5. Progresión, para los dos lados.** Qué se cambia si sale fácil y qué se
cambia si no sale. Las dos direcciones, siempre: un material que sólo sabe
subir deja afuera al chico que no llegó, y ése es el que más lo necesita.

**6. Qué mirar.** Los indicadores de la observación clínica, y el criterio de
logro en número: cuántos aciertos sobre cuántos intentos, en cuántas sesiones
seguidas, para dar el paso siguiente. Sin criterio, la decisión de avanzar queda
a la impresión del día.

**7. Cuánto y cada cuánto.** La dosis. Minutos, repeticiones, series, ensayos,
veces por semana. Es el dato que más se omite y el que más cambia el resultado
(ver abajo, por disciplina).

**8. Para casa.** La versión corta para la familia, en lenguaje llano, más qué
hacer si no sale. Corta de verdad: si la parte de casa no se puede contar en
tres líneas, no se va a hacer.

**9. Ojo con esto.** Cuándo parar, qué no forzar, qué señal cambia el plan.
Obligatorio en fisioterapia y en todo lo que involucre dolor, esfuerzo, vía
aérea, alimentación o material en la boca.

### Lo que un material nunca tiene

- **Emoji como contenido.** Los 45 del v1 usaban 18 de ellos como parte del
  ejercicio, y uno pedía unir "⬠" con "pentágono": no es un emoji, es un
  carácter geométrico que en muchos dispositivos sale cuadradito. Una ficha se
  imprime, y lo que se imprime tiene que ser el mismo en cada máquina.
- **Rayas ni guiones largos.** Convención de la casa, igual que en el resto del
  producto.
- **Un área o un foco que la app no ofrezca.** El vocabulario está en
  `src/lib/material-areas.ts` y es el que aparece en el desplegable cuando una
  profesional crea el suyo. 23 de los 45 del v1 estaban archivados fuera de
  vocabulario, ocho de ellos en fonoaudiología con vocabulario y narrativa
  metidos adentro de "Articulación", que es otra cosa.
- **Diagnósticos ni conclusiones cerradas.** Un material describe lo que se
  observa, no lo que eso significa. La misma regla que el prompt clínico.

### Cómo llega a un ambiente

`supabase/seeds/` es la fuente de la verdad, y la carga es repetible. Cada
`insert` termina en `on conflict (title) where practitioner_id is null do
update`, apoyado en el índice único de
`20260928140000_materials_shared_title_unique`: una fila que ya está se
actualiza en su lugar y conserva su id, así que las planificaciones que apuntan
a ella siguen apuntando a ella. Un material compartido que ya no está en ningún
archivo se borra al final de la misma transacción.

Eso hace que el título de un material compartido sea su identidad entre
ambientes: cambiarlo no es una corrección de texto, es crear otro material y
dejar morir el anterior. Si hay que cambiarlo igual, se cambia sabiendo eso.

En local entra con `npm run db:reset`; en una base remota, con
`./dx npm run db:seed:remote`.

### Cómo se ve el texto

Lo dibuja el mismo `DocumentBody` que un informe
(`src/components/documents/clinical-document.tsx`):

- Una línea corta terminada en dos puntos y de hasta 60 caracteres es subtítulo.
- Toda otra línea es un párrafo.
- Las viñetas empiezan con `• `.
- Las líneas vacías se descartan: no separan, no hace falta ponerlas.

---

## La dosis, por disciplina

Lo concreto que se escribe en "Cuánto y cada cuánto", y de dónde sale.

**Fonoaudiología — articulación.** La evidencia sobre intensidad en trastornos
de los sonidos del habla apunta a 50 a 70 ensayos por sesión como piso, y 100 o
más para empezar a instalar un patrón motor nuevo. Un material de articulación
que ofrece doce palabras no alcanza para una sesión: por eso los bloques traen
listas largas y se repiten. La secuencia de complejidad es la tradicional
—sonido aislado, sílaba, palabra, frase, oración, conversación— y las ayudas se
retiran de a una: modelo, modelo demorado, producción sola.

**Fisioterapia.** Dosis explícita siempre: series, repeticiones, tiempo bajo
tensión, descanso y frecuencia semanal. El criterio de progresión se escribe en
número, no en sensación ("cuando salen tres series de diez con forma limpia"). En
niños la misma dosis va envuelta en juego y en formato corto y frecuente, porque
el programa de casa es donde pasa la mayor parte del trabajo.

**Terapia ocupacional.** Análisis de la actividad y graduación en las dos
direcciones, buscando el desafío justo: la tarea que cuesta pero sale. Las
actividades de trabajo pesado —empujar, tirar, trepar, cargar, saltar— se
escriben con dosis y momento del día, no como lista suelta.

**Psicología.** El molde es el de una ficha de TCC: psicoeducación breve,
ejemplo resuelto, práctica propia, tarea entre sesiones. Con adolescentes, el
experimento conductual con predicción escrita antes de probar, porque una
predicción específica se puede desmentir y una vaga no. Con chicos que se
resisten a escribir, la ficha se hace en voz alta y escribe la profesional: lo
que importa es el proceso, no la letra.

**Psicopedagogía.** Enseñanza explícita: modelo pensando en voz alta, práctica
guiada con corrección inmediata, práctica sola. Corrección del error en el
momento, práctica distribuida en el tiempo y recuperación —hacer que traiga lo
de la sesión anterior antes de empezar la nueva— en lugar de una sola pasada
larga.

**Psicomotricidad.** El cuerpo primero y el papel después: vivencia, después
representación gráfica. La progresión pasa por reducir la base de apoyo, quitar
la visión, agregar una consigna simultánea o cruzar la línea media, en ese
orden de dificultad.

**Todas.** El texto que lee una familia se escribe en lenguaje llano, con una
instrucción por línea y las cantidades dichas. Las guías de alfabetización en
salud apuntan a un nivel de lectura de escuela primaria para el material que se
entrega, y a verificar que se entendió pidiendo que lo cuente con sus palabras,
no preguntando si quedó claro.

---

## Fuentes

Lo de arriba es la síntesis de estas lecturas, hecha en septiembre de 2026.

- [Adherence to Home Exercise Programs](https://www.physio-pedia.com/Adherence_to_Home_Exercise_Programs) y [Strategies for Home Exercise Prescription](https://www.physio-pedia.com/Strategies_for_Home_Exercise_Prescription), Physiopedia
- [Improving home exercise program adherence](https://www.webpt.com/blog/improving-home-exercise-program-adherence-in-physical-therapy), WebPT
- [Patients' perspectives on home exercise programmes](https://pmc.ncbi.nlm.nih.gov/articles/PMC5938081/), PMC
- [Service Delivery for Children With Speech Sound Disorders: Evidence for the Quick Articulation! Model](https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/d52d5859-aa11-459d-b456-9ede6403a560), ASHA Evidence Maps
- [How many trials are enough](https://members-speechtherapytalk.com/articulation-therapy-high-trials/), Speech Therapy Talk, y [The intensity of treatment for articulation](https://ejtherapy.com/the-intensity-of-treatment-for-articulation/)
- [Traditional hierarchy approach](https://sites.google.com/csumb.edu/slp-treatment-activities/articulation-pediatrics/traditional-heiarchy-approach) y [A practical hierarchy for teaching and fading cues](https://speechtherapytalk.com/slp-materials/speech-therapy-cues/)
- [The sensory diet concept and template](https://fragilex.org/wp-content/uploads/2025/02/sensory-diet-concept-w-template.pdf)
- [Progressive supervised home-based strength training in children with spastic cerebral palsy](https://cdn.clinicaltrials.gov/large-docs/97/NCT03863197/Prot_SAP_000.pdf), protocolo
- [Factors affecting mothers' adherence to home exercise programs](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9517889/), PMC
- [CBT worksheets for kids and teens](https://www.therapistaid.com/therapy-worksheets/cbt/adolescents), Therapist Aid
- [The I do, we do, you do model explained](https://evidencebasedteaching.org/the-i-do-we-do-you-do-model-explained/) y [gradual release of responsibility](https://www.atomlearning.com/blog/gradual-release-of-responsibility)
- [Assess, select, and create easy-to-understand materials, Tool 11](https://www.ahrq.gov/health-literacy/improve/precautions/tool11.html), AHRQ
- [Improving written communication to promote health literacy](https://www.chcs.org/resource/improving-written-communication-to-promote-health-literacy/), CHCS

Nada de esto es uruguayo, y esa es la parte que no se copia: la dosis y la
estructura vienen de ahí, y el idioma, los precios del kiosco, los nombres y lo
que se juega en un patio de acá los escribimos nosotros.
