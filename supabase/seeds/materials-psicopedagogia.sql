-- Psicopedagogía: la biblioteca compartida completa de la disciplina.
--
-- Escrita contra el estándar de docs/materiales.md: para qué sirve, qué
-- necesitás, cómo se presenta, dos o tres ejercicios con el contenido escrito,
-- progresión para los dos lados, qué mirar con criterio de logro, dosis, y la
-- versión corta para casa.
--
-- Muchas de las ideas vienen del v1, que tenía 45 materiales buenos de título y
-- flacos de contenido: 29 de ellos eran de psicopedagogía y medían 200
-- caracteres. La idea se conservó donde era buena; el texto es nuevo entero. El
-- generador que los transcribía (scripts/extract-materials.mjs) se retiró: el
-- contenido ya no sale de legacy/index.html, y un script que lo regenera sería
-- un script que borra esto sin avisar.
--
-- Convenciones del texto, que las dibuja DocumentBody:
--   Una línea corta terminada en dos puntos y de hasta 60 caracteres es subtítulo.
--   Toda otra línea es un párrafo. Las viñetas empiezan con "• ".
--   Sin rayas, sin guiones largos y sin emoji: esto se imprime.
--
-- practitioner_id en null es lo que los hace compartidos: la política de lectura
-- de materials deja ver esas filas a todo el mundo, y ninguna política de
-- escritura permite tocarlas.

-- ─── Lectura ────────────────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychopedagogy', 'Lectura', 'Conciencia fonológica', 'Bingo de sonidos iniciales', 'game', 'Identificar el primer sonido de una palabra y sostenerlo en la cabeza mientras se busca', '3-5 años', 'Para qué sirve:
Escuchar con qué sonido empieza una palabra es anterior a la letra y no se aprende mirando: se aprende escuchando. Un chico que todavía no aísla el sonido inicial no puede asociarlo a una letra, aunque reconozca la letra de memoria.
Qué necesitás:
Dos cartones escritos a mano en una hoja y algo para marcar: porotos, tapitas, monedas.
Cómo se presenta:
Primero lo hacés vos, en voz alta y exagerando el primer sonido: mmmmesa empieza con mmm. Después lo dicen juntos. Después decís la palabra y espera él.
Ejercicio 1, el sonido solo, sin cartón:
Decís la palabra y tiene que decir sólo el primer sonido, no la letra.
• mesa, sol, pan, luna, dedo, foca, casa, pelota
• Si contesta con el nombre de la letra, aceptalo y repetí el sonido vos.
Ejercicio 2, el cartón:
Cartón A: gato · luna · manzana · perro · sol · pez
Cartón B: casa · dedo · mesa · foca · pelota · árbol
Decís un sonido, no una palabra: empieza con /m/. Marca la imagen o la palabra que corresponde.
Ejercicio 3, al revés:
Él dice una palabra y vos tenés que encontrarla en el cartón. Si te equivocás a propósito, tiene que darse cuenta y corregirte. Esa corrección es la parte que más enseña.
Progresión:
• Si sale fácil: pasá al último sonido de la palabra, que es bastante más difícil.
• Si no sale: quedate en tres pares de palabras que empiecen muy distinto (mesa y sol, no mesa y mano) y volvé a exagerar el sonido.
Qué mirar:
Si necesita que le repitas la palabra, si mira tu boca para resolver, si confunde el sonido con el nombre de la letra. El paso siguiente se da cuando acierta 8 de 10 en dos sesiones seguidas.
Cuánto y cada cuánto:
De diez a quince minutos, dos veces por semana, apuntando a unos cuarenta ensayos en cada rato. Es un juego corto y repetido, no una actividad larga.
Para casa:
Jugar en el auto o en la cola del supermercado, sin cartón: yo veo algo que empieza con /s/. Tres o cuatro palabras y se corta, antes de que se aburra.'),

  (null, 'psychopedagogy', 'Lectura', 'Conciencia fonológica', 'Cadena de palabras', 'game', 'Segmentar una palabra en sílabas y usar la última para empezar otra', '6-7 años', 'Para qué sirve:
Para partir la palabra en sílabas y sostener la última mientras se busca otra que empiece igual. Son dos cosas a la vez: segmentar y retener, que es la mezcla que después hace falta para escribir una palabra larga.
Qué necesitás:
Nada. Con papel se puede anotar la cadena para verla crecer.
Cómo se presenta:
Armás una cadena de tres vos solo, en voz alta y golpeando las palmas en cada sílaba. Después una juntos. Después arranca él.
Ejercicio 1, partir en sílabas con las palmas:
• ca-sa, pe-lo-ta, sa-po, ma-ri-po-sa, te-lé-fo-no
• Que diga cuántas palmas salieron. Si se pierde, hacelo más lento, no más fuerte.
Ejercicio 2, la cadena:
Cada palabra empieza con la última sílaba de la anterior.
• casa, sapo, poco, corazón, zona
• mesa, sábana, natación, ciento, tomate
Empezá vos con la primera y seguí alternando.
Ejercicio 3, la cadena al revés:
Vos das el final y él tiene que encontrar la palabra que termina así: una palabra que termine en to. Es más difícil que buscar por el principio.
Progresión:
• Si sale fácil: cadena con sonidos en lugar de sílabas (casa, arco, ojo) y cronómetro para ver cuántos eslabones salen en dos minutos.
• Si no sale: quedate en contar sílabas con las palmas y en palabras de dos sílabas, sin cadena.
Qué mirar:
Si corta la palabra por donde va, si repite la sílaba correcta o la aproxima, si puede sostener la sílaba mientras piensa. Va bien cuando arma cinco eslabones seguidos sin ayuda, dos sesiones seguidas.
Cuánto y cada cuánto:
Diez minutos, dos o tres veces por semana. Conviene al principio de la sesión, cuando está más disponible.
Para casa:
Jugar caminando a la escuela. Si se corta la cadena, empieza otra, no se busca hasta encontrarla. La idea es que salga rápido y con risa.'),

  (null, 'psychopedagogy', 'Lectura', 'Conciencia fonológica', 'Sacarle el primer sonido', 'activity', 'Quitar el sonido inicial de una palabra y decir lo que queda, que es el paso más difícil de la conciencia fonológica', '6-7 años', 'Para qué sirve:
Quitar un sonido y decir lo que queda es la tarea que mejor predice cómo va a andar la lectura, y es la que más cuesta: pide manipular la palabra, no sólo escucharla.
Qué necesitás:
Nada. Fichas o tapitas ayudan para representar cada sonido con un objeto.
Cómo se presenta:
Lo mostrás resuelto dos veces, pensando en voz alta: si a rosa le saco la /r/, queda osa. Después una juntos. Después solo. Empezá siempre por palabras donde lo que queda es otra palabra de verdad, porque el resultado se puede reconocer.
Ejercicio 1, queda otra palabra:
• rosa sin /r/ es osa
• pala sin /p/ es ala
• mala sin /m/ es ala
• sala sin /s/ es ala
• foca sin /f/ es oca
• pino sin /p/ es ino, que no es palabra: avisale que a veces pasa
Ejercicio 2, con tapitas:
Pone una tapita por cada sonido de la palabra, saca la primera con el dedo y dice lo que queda con las que sobraron. El movimiento de la mano sostiene lo que la cabeza todavía no.
Ejercicio 3, el último sonido:
Ahora se saca el final: pan sin /n/, sol sin /l/, mar sin /r/. Más difícil, y va después.
Progresión:
• Si sale fácil: cambiar un sonido por otro, no sacarlo: en pala cambiá la /p/ por /m/.
• Si no sale: volvé a sílabas, que es un nivel más abajo: mesa sin me queda sa.
Qué mirar:
Si repite la palabra entera en lugar de la parte que queda, si necesita las tapitas, si lo resuelve más rápido en algunas posiciones. Criterio para avanzar: 8 de 10 sin tapitas, dos sesiones seguidas.
Cuánto y cada cuánto:
De cinco a diez minutos por sesión, dos o tres veces por semana. Es exigente: mejor corto y seguido que largo una vez.
Para casa:
Dos minutos, oral, sin lápiz. Cuatro o cinco palabras de las que ya salieron en sesión, para que la familia lo escuche salir bien y no para aprender algo nuevo.'),

  (null, 'psychopedagogy', 'Lectura', 'Fluidez lectora', 'Lectura repetida: El gato Ramón', 'text', 'Leer el mismo texto tres veces para ganar velocidad y dejar de trabar la comprensión', '6-7 años', 'Para qué sirve:
Leer el mismo texto varias veces es lo que libera la cabeza: mientras la lectura cuesta, toda la atención se va en decodificar y no queda nada para entender. La velocidad no es el objetivo, es lo que deja lugar al objetivo.
Qué necesitás:
El texto impreso, un reloj con segundero o el celular, y una hoja para anotar los tres intentos.
Cómo se presenta:
Primero lo leés vos entero, en voz alta y con expresión, mientras él sigue con el dedo. Después leen juntos, a la par. Después lee solo, tres veces.
Ejercicio 1, el texto:
Ramón es un gato gordo y dormilón. Todas las mañanas se sube al techo a mirar los pájaros. Un día, un pájaro azul se paró a su lado. Ramón no se movió. Se quedaron los dos mirando el sol, muy tranquilos.
Ejercicio 2, las tres pasadas:
• Primera: despacio, sin importar el tiempo. Se anota.
• Segunda: un poco más rápido, sin tropezar. Se anota.
• Tercera: como si le contara algo a alguien. Se anota.
Anotá palabras por minuto y errores en cada pasada, en la misma hoja, para que vea los tres números juntos.
Ejercicio 3, las palabras que se trabaron:
Elegí las tres o cuatro palabras donde se trabó. Se leen solas, cinco veces cada una, y se vuelve a leer la oración donde estaban. Eso es lo que hace que la próxima pasada mejore de verdad.
Progresión:
• Si sale fácil: un texto más largo, o el mismo con preguntas de comprensión al final.
• Si no sale: leé una oración por vez en lugar del texto entero, y seguí leyendo a la par más tiempo antes de soltarlo.
Qué mirar:
Si respeta el punto, si vuelve atrás a releer, si adivina la palabra por la primera sílaba. Un salto de palabras por minuto entre la primera y la tercera pasada es la señal buena; si no hay diferencia, el texto es demasiado difícil.
Cuánto y cada cuánto:
Diez minutos, tres veces por semana, con el mismo texto una semana entera. El texto se cambia cuando la tercera pasada suena natural.
Para casa:
Que lea el mismo texto una vez por día a alguien de la casa, y que ese alguien escuche sin corregir. Al final, que cuente de qué se trataba. Nada más.'),

  (null, 'psychopedagogy', 'Lectura', 'Fluidez lectora', 'Leer con la voz de los personajes', 'activity', 'Leer con entonación y respetando los signos, que es lo que muestra que el texto se está entendiendo', '8-9 años', 'Para qué sirve:
La entonación no es adorno: nadie le pone voz a algo que no entendió. Un chico que lee todo con la misma voz y sin parar en los puntos está decodificando, no leyendo.
Qué necesitás:
Un diálogo corto impreso, de dos o tres personajes.
Cómo se presenta:
Lo leés vos exagerando las voces, hasta que le dé risa. Después se reparten los personajes y leen juntos. Después lee él los dos personajes.
Ejercicio 1, el diálogo:
Hay tres papeles: el que pregunta, el que contesta y el que cuenta.
• Narrador: Martina golpeó la puerta tres veces.
• Martina: ¿Hay alguien? ¡Se me hace tarde!
• Vecino: Ya voy, ya voy. ¿Qué pasó?
• Martina: Se me quedó la llave adentro.
• Narrador: El vecino se rió y fue a buscar la suya.
Ejercicio 2, la misma oración de cuatro maneras:
Se lee "ya voy" enojado, dormido, apurado y contento. Misma palabra, cuatro voces. Después se busca en el texto cuál es la que va, y por qué.
Ejercicio 3, los signos manda:
Se leen estas tres, y tiene que sonar distinto cada una:
• Se me hace tarde.
• ¡Se me hace tarde!
• ¿Se me hace tarde?
Progresión:
• Si sale fácil: leerlo grabado y escucharse, o leerle a un hermano más chico.
• Si no sale: quedate en una oración por vez y marcá los puntos con lápiz antes de leer.
Qué mirar:
Si para en los puntos, si sube la voz en las preguntas, si vuelve a empezar la oración cuando se le escapó el sentido. Va bien cuando lee el diálogo entero con tres voces distintas sin que se lo recuerdes.
Cuánto y cada cuánto:
De diez a quince minutos, dos veces por semana. Un diálogo nuevo cada semana, el mismo repetido dentro de la semana.
Para casa:
Leerle un diálogo a alguien de la casa, dos veces en la semana. Poner las voces es parte de la tarea, no un extra.'),

  (null, 'psychopedagogy', 'Lectura', 'Fluidez lectora', 'Palabras relámpago', 'game', 'Reconocer de un golpe de vista las palabras frecuentes, para no decodificarlas cada vez', '8-9 años', 'Para qué sirve:
Hay palabras que aparecen en todos los textos y conviene que salgan sin decodificar: mientras se deletrea "porque", la oración se pierde. El reconocimiento inmediato de las palabras frecuentes es la mitad de la fluidez.
Qué necesitás:
Veinte tarjetas escritas a mano, o la lista impresa y una hoja para tapar.
Cómo se presenta:
Mostrás la tarjeta un segundo y la tapás. Si la dijo, va a una pila; si no, a la otra. Las de la segunda pila se practican y vuelven.
Ejercicio 1, la lista de las frecuentes:
• que, para, porque, cuando, donde, entonces, también, después
• aunque, mientras, siempre, nunca, algunos, todavía, además, mucho
Ejercicio 2, un segundo y tapo:
Veinte tarjetas, una pasada. Se cuentan las que salieron solas. Se anota el número y se repite la ronda: casi siempre sube en la segunda.
Ejercicio 3, la palabra adentro de la oración:
Las que salieron sueltas ahora van en una oración, que es donde importan.
• Me fui temprano porque me dolía la cabeza.
• Cuando llegamos, todavía no habían abierto.
• Siempre pide lo mismo, aunque después no lo come.
Progresión:
• Si sale fácil: bajá a medio segundo, o sumá palabras largas de la materia que estén dando en la escuela.
• Si no sale: sacá las que confunde, dejá diez, y mostrá dos segundos en lugar de uno.
Qué mirar:
Cuáles confunde entre sí (cuando y cuanto, donde y dónde), si adivina por la primera sílaba, si las lee sueltas y se le caen dentro de la oración. Meta: dieciocho de veinte en una pasada, dos sesiones seguidas.
Cuánto y cada cuánto:
Cinco minutos al empezar la sesión, todas las sesiones. Es el clásico calentamiento corto y diario.
Para casa:
Las cinco que no salieron, pegadas en la puerta de la heladera. Se leen al pasar, sin sentarse a estudiarlas.'),

  (null, 'psychopedagogy', 'Lectura', 'Comprensión lectora', 'Qué entendí, con el texto tapado', 'worksheet', 'Responder preguntas literales y de inferencia, y distinguir las que están escritas de las que hay que pensar', '8-9 años', 'Para qué sirve:
Contestar lo que está escrito y contestar lo que se deduce son dos tareas distintas, y muchos chicos que "no entienden" en realidad no saben cuál de las dos les están pidiendo. Acá se nombran las dos.
Qué necesitás:
El texto impreso, lápiz, y algo para tapar el texto en la segunda parte.
Cómo se presenta:
Lee el texto una vez. Después contestás vos la primera pregunta en voz alta, mostrando dónde la encontraste. Recién después contesta él.
Ejercicio 1, el texto:
Sofía encontró una caja vieja en el fondo de su casa. Adentro había cartas amarillas y una foto de su abuela cuando era chica. Sofía se quedó un rato mirando la foto y después la guardó en su cuaderno.
Ejercicio 2, las que están escritas:
Se subraya en el texto de dónde sale cada respuesta.
• ¿Qué encontró Sofía?
• ¿Dónde estaba la caja?
• ¿Qué había adentro?
Ejercicio 3, las que hay que pensar:
Estas no están escritas. La respuesta se arma con lo que dice el texto más lo que uno sabe.
• ¿Por qué guardó la foto en el cuaderno?
• ¿Cómo se imaginás que se sentía?
• ¿Hace cuánto que esa caja estaba ahí? ¿Qué palabra del texto te lo dice?
Progresión:
• Si sale fácil: que escriba él dos preguntas para vos, una de cada tipo. Inventar la pregunta es más difícil que contestarla.
• Si no sale: quedate en las literales y trabajá con el texto a la vista, señalando con el dedo antes de escribir.
Qué mirar:
Si vuelve al texto o contesta de memoria, si responde con una palabra donde hacía falta una oración, si en las inferenciales dice "no dice". Criterio: las tres literales bien y al menos una inferencial justificada.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana, con un texto nuevo y corto cada vez.
Para casa:
Una noticia corta del diario o una página de un libro, y una sola pregunta de las de pensar, hecha en voz alta por quien acompaña.'),

  (null, 'psychopedagogy', 'Lectura', 'Comprensión lectora', 'Detective lector', 'activity', 'Buscar en el texto la pista que sostiene una respuesta, en lugar de contestar de memoria', '8-9 años', 'Para qué sirve:
Para instalar un hábito concreto: toda respuesta se puede señalar con el dedo en el texto. El chico que aprende a buscar la pista deja de adivinar, y de paso deja de frustrarse cuando no se acuerda.
Qué necesitás:
Un texto corto impreso, lápiz y resaltador o lápiz de color.
Cómo se presenta:
La primera la resolvés vos en voz alta: yo creo que es de noche, y lo sé por esta palabra, acá. Subrayás la pista. Recién después le toca.
Ejercicio 1, el texto:
Cuando Joaquín llegó, las luces del club ya estaban prendidas y no quedaba nadie en la cancha. Dejó el bolso en el banco, se sentó y miró el reloj de la pared. Suspiró.
Ejercicio 2, la pista subrayada:
Cada respuesta se marca en el texto con color antes de decirla.
• ¿A qué fue Joaquín al club?
• ¿Llegó a tiempo? ¿Qué te lo dice?
• ¿Qué hora era, más o menos?
• ¿Cómo estaba él al final? ¿Por qué palabra lo sabés?
Ejercicio 3, la pista falsa:
Digo yo una respuesta equivocada y él tiene que refutarla con el texto: yo digo que la cancha estaba llena. Buscá la parte que me deja mal parada.
Progresión:
• Si sale fácil: dos textos cortos sobre lo mismo que se contradicen en un dato, y hay que encontrar en cuál está.
• Si no sale: textos de tres oraciones y una sola pregunta, con la pista ya subrayada por vos para que la lea.
Qué mirar:
Si subraya antes de contestar o después, si la pista que elige sostiene la respuesta, si puede refutar con el texto y no con su opinión. Va bien cuando subraya sin que se lo pidas, en dos textos seguidos.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Textos nuevos, pregunta siempre del mismo formato: la respuesta y la pista.
Para casa:
Con cualquier cosa que lea, una pregunta: ¿en qué parte dice eso? Es la única consigna, y sirve para todas las materias.'),

  (null, 'psychopedagogy', 'Lectura', 'Comprensión lectora', 'Contar lo que leí, sin mirar', 'activity', 'Reconstruir un texto con las propias palabras, en orden, y detectar lo que se perdió', '8-9 años', 'Para qué sirve:
Volver a contar lo leído obliga a armar el texto entero en la cabeza, no a reconocer respuestas sueltas. Y muestra rapidísimo qué se entendió: lo que falta en el relato es lo que no entró.
Qué necesitás:
Un texto corto impreso y una hoja dividida en tres partes: principio, medio, final.
Cómo se presenta:
Después de leer, contás vos el texto primero, en cinco oraciones, para que vea el largo que se espera. Después lo cuenta él con el texto tapado. Después lo escribe.
Ejercicio 1, contarlo oral, con el texto tapado:
Tres reglas: en orden, con tus palabras, sin detalles de más. Vos no interrumpís: anotás qué se saltó.
Ejercicio 2, las tres partes en la hoja:
• Principio: quién y dónde.
• Medio: qué problema aparece.
• Final: cómo se resuelve.
Una oración en cada parte, no más.
Ejercicio 3, comparar con el texto:
Se destapa el texto y se busca qué quedó afuera. Se agrega con otro color. Lo que se agrega ahí es la lista de lo que hay que trabajar.
Progresión:
• Si sale fácil: que lo cuente desde el punto de vista de otro personaje, o que lo resuma en una sola oración.
• Si no sale: cortá el texto en tres partes y que cuente una parte por vez, apenas la lee.
Qué mirar:
Si respeta el orden, si arranca por el final, si se queda en un detalle llamativo y pierde el hilo, si usa palabras del texto o las propias. Criterio: las tres partes en orden, sin ayuda, dos textos seguidos.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Se puede cerrar así cualquier lectura de la sesión.
Para casa:
Que cuente en la cena lo que leyó, en tres oraciones. Quien escucha pregunta sólo una cosa: y antes de eso, ¿qué pasaba?'),

  (null, 'psychopedagogy', 'Lectura', 'Comprensión lectora', 'Las preguntas que no están en el texto', 'worksheet', 'Sostener una inferencia con evidencia del texto y distinguirla de una opinión', '10-11 años', 'Para qué sirve:
En cuarto y quinto las preguntas dejan de estar escritas en el texto, y ahí aparecen chicos que leían bien y empiezan a fallar. La habilidad nueva no es leer: es justificar lo que se deduce.
Qué necesitás:
El texto impreso, lápiz de color, la hoja de respuestas con dos columnas.
Cómo se presenta:
Armás vos la primera respuesta en dos partes, en voz alta: lo que pienso, y la parte del texto que me deja pensarlo. Esa es la forma de toda respuesta de acá en adelante.
Ejercicio 1, el texto:
Camila revisó la mochila dos veces antes de salir. En el ómnibus repasó las tarjetas que había escrito la noche anterior, aunque ya se las sabía. Cuando la llamaron, dejó las tarjetas dobladas sobre el banco y pasó al frente sin ellas.
Ejercicio 2, dos columnas:
En la izquierda la respuesta, en la derecha la parte del texto que la sostiene.
• ¿Qué estaba por hacer Camila?
• ¿Cómo estaba antes de pasar al frente?
• ¿Por qué dejó las tarjetas en el banco?
• ¿Le fue bien? Ojo con esta: decidí si el texto alcanza para saberlo.
Ejercicio 3, separar la opinión:
De estas tres, dos se pueden sostener con el texto y una es opinión. Hay que decir cuál es cuál.
• Camila estaba nerviosa.
• Camila había estudiado.
• Camila es una buena alumna.
Progresión:
• Si sale fácil: un texto donde el narrador no sea confiable, y preguntar qué conviene creerle.
• Si no sale: volvé a textos de cinco oraciones y a una sola pregunta inferencial con la pista ya marcada.
Qué mirar:
Si la evidencia que elige sostiene la respuesta, si puede decir "el texto no alcanza", si mezcla lo que sabe del mundo con lo que dice el texto. Criterio: tres de cuatro con evidencia pertinente, y la pregunta sin respuesta identificada.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana. Un texto por vez, siempre con la columna de la evidencia.
Para casa:
La misma pregunta sobre cualquier lectura de la escuela: ¿de dónde sacás eso? Dicha sin tono de examen.'),

  (null, 'psychopedagogy', 'Lectura', 'Comprensión lectora', 'Estudiar de un texto de ciencias', 'guide', 'Leer para estudiar: subrayar lo importante, armar el resumen y quedarse con las preguntas', '12-14 años', 'Para qué sirve:
En liceo el problema casi nunca es leer: es leer para estudiar. Subrayar todo, subrayar nada y releer cinco veces sin retener son la misma dificultad, y se trabaja con un procedimiento fijo.
Qué necesitás:
Una página del libro de la materia, resaltador, lápiz y una hoja aparte.
Cómo se presenta:
La primera vez lo hacés vos con su material, narrando cada decisión: esto ya lo sabía, esto es nuevo, esto es un ejemplo y no lo subrayo. Después una sección juntos. Después una sola.
Ejercicio 1, tres lecturas distintas:
• Primera, sin lápiz: sólo para saber de qué va. Cinco minutos.
• Segunda, con resaltador: una idea por párrafo, no más de una línea.
• Tercera, con lápiz al margen: una palabra que resuma el párrafo.
Ejercicio 2, el resumen en la hoja aparte:
Con el libro cerrado, escribir lo subrayado con palabras propias. Si no sale sin abrir el libro, no estaba entendido: se vuelve al párrafo.
Ejercicio 3, las preguntas que quedan:
Anotar tres preguntas que el texto no contesta o que no se entendieron. Esas tres van a la clase o al mensaje al profesor. Terminar de estudiar no es no tener dudas: es saber cuáles son.
Progresión:
• Si sale fácil: que arme el cuadro o el esquema en lugar del resumen lineal, y que se autoevalúe tapando la mitad.
• Si no sale: un párrafo por vez y vos marcando dónde está la idea, hasta que la encuentre sola.
Qué mirar:
Cuánto subraya (más de un tercio de la página es demasiado), si el resumen usa palabras propias o copia, si puede explicar el tema sin mirar. Criterio: página resumida en menos de diez líneas y explicada de memoria.
Cuánto y cada cuánto:
Treinta minutos, una vez por semana, con el material real de una materia. No sirve con textos inventados.
Para casa:
El mismo procedimiento con una página por semana, de la materia que más cuesta. Y la explicación en voz alta a alguien, que es la parte que muestra si entró.'),

  (null, 'psychopedagogy', 'Lectura', 'Fluidez lectora', 'Trabalenguas cronometrados', 'game', 'Ganar precisión y velocidad articulatoria en la lectura en voz alta, con un juego que no parece ejercicio', '8-9 años', 'Para qué sirve:
Es fluidez disfrazada de juego, y sirve para el chico que lee lento y ya se dio cuenta de que lee lento: el cronómetro compite contra su propio número, no contra nadie.
Qué necesitás:
Los trabalenguas impresos en letra grande y un cronómetro.
Cómo se presenta:
Lo leés vos primero despacio y con errores a propósito, para que quede claro que trabarse es parte del juego. Después leen juntos. Después contra el reloj.
Ejercicio 1, lento y entero:
• Tres tristes tigres tragaban trigo en un trigal.
• Pablito clavó un clavito en la calva de un calvito.
• El perro de San Roque no tiene rabo porque Ramón Ramírez se lo ha cortado.
Primero sin reloj, hasta que salga completo sin trabarse.
Ejercicio 2, tres intentos con reloj:
Se anotan los tres tiempos y los errores de cada uno. La regla es que un intento con error no cuenta, para que la velocidad no se coma la precisión.
Ejercicio 3, el que se elige:
Que elija su favorito y lo practique para decirlo en casa. Elegir sube muchísimo la práctica que hace después.
Progresión:
• Si sale fácil: dos trabalenguas seguidos sin respirar de más, o inventar uno con su nombre.
• Si no sale: la primera mitad sola, o un trabalenguas de una línea.
Qué mirar:
Si respeta las palabras completas cuando acelera, si el segundo intento baja el tiempo, si se enoja con el error o se ríe. Meta: el mismo trabalenguas entero y sin error, dos veces seguidas.
Cuánto y cada cuánto:
Cinco minutos al final de la sesión, dos o tres veces por semana. Funciona bien como cierre.
Para casa:
Uno solo, el que eligió, para decirlo en la mesa el fin de semana. Sin cronómetro en casa: en casa es show, no entrenamiento.')
on conflict (title) where practitioner_id is null do update set
  discipline = excluded.discipline, area = excluded.area, focus = excluded.focus,
  kind = excluded.kind, objective = excluded.objective,
  age_range = excluded.age_range, content = excluded.content;

-- ─── Escritura ──────────────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychopedagogy', 'Escritura', 'Grafismo', 'Trazos que bailan', 'worksheet', 'Ejercitar el trazo continuo y la direccionalidad antes de que aparezca la letra', '3-5 años', 'Para qué sirve:
Antes de la letra hay que sostener el lápiz, apoyar la mano y mover el brazo en una dirección sin levantarlo. Si eso todavía no está, la letra sale temblada por una razón que no tiene nada que ver con las letras.
Qué necesitás:
Hojas grandes, marcadores gruesos o crayones, y una pared o una puerta para la parte de parado.
Cómo se presenta:
Cada trazo se hace tres veces antes de tocar el lápiz: grande en el aire con todo el brazo, después en la pared, después en la hoja con el dedo. El lápiz es el último paso, no el primero.
Ejercicio 1, los cuatro caminos:
Dibujás vos el camino en la hoja, de punta a punta, y él lo repasa sin levantar la mano.
• La ola: sube y baja redondeado, todo seguido.
• El zigzag: sube y baja en punta.
• El caracol: desde afuera hacia el centro, y después desde el centro hacia afuera.
• La montaña: arcos iguales, uno al lado del otro.
Ejercicio 2, en grande y parado:
El mismo trazo en una hoja pegada a la pared, a la altura de los ojos, con el brazo estirado. Cinco de cada uno. En la pared trabaja el hombro, que es lo que después sostiene la mano.
Ejercicio 3, de un punto a otro sin levantar:
Marcás dos puntos y un camino con curvas entre ellos; tiene que llegar sin salirse y sin levantar el marcador. Tres caminos, cada vez más angosto.
Progresión:
• Si sale fácil: caminos más angostos, y trazos que empiezan y terminan donde vos digas.
• Si no sale: más grande y más parado. Si se sale del camino, ensanchalo en lugar de pedirle más cuidado.
Qué mirar:
Cómo agarra el marcador, si mueve la mano o el brazo entero, si levanta el lápiz en cada curva, si el trazo se le va siempre para el mismo lado. Va bien cuando hace los cuatro caminos seguidos sin levantar la mano.
Cuánto y cada cuánto:
Diez minutos, tres veces por semana. Corto, porque cansa la mano y cuando cansa deja de enseñar.
Para casa:
Dibujar con el dedo en el vidrio empañado, en la arena o en la espuma de la bañera. Los mismos cuatro trazos, sin hoja y sin lápiz.'),

  (null, 'psychopedagogy', 'Escritura', 'Grafismo', 'Renglones y alturas', 'worksheet', 'Respetar el renglón y la altura de cada letra, para que la escritura se vuelva legible', '6-7 años', 'Para qué sirve:
Una letra ilegible casi nunca es un problema de prolijidad: son tres cosas concretas que se pueden entrenar de a una. La altura es la primera, y la que más cambia cómo se lee el cuaderno.
Qué necesitás:
Hoja con renglones anchos, lápiz, y un color para marcar los pisos y los techos.
Cómo se presenta:
Antes de escribir, se pintan tres líneas con color: el piso, la mitad y el techo. Escribís vos una palabra mostrando qué letra toca cada línea, y después escribe él.
Ejercicio 1, las tres alturas:
• Altas, tocan el techo: l, t, d, b, h, k, f
• Chicas, quedan en la mitad: a, e, o, u, m, n, s
• Bajas, se van abajo del piso: p, g, j, q, y
Que las diga y las señale antes de escribirlas.
Ejercicio 2, copiar cuidando la altura:
Copiar estas palabras con las tres líneas marcadas:
• lupa · gato · dedo · jirafa · pelota · hilo · queso
Al terminar cada palabra, revisar con el dedo si las altas llegaron y las bajas bajaron.
Ejercicio 3, la misma palabra tres veces:
Elegí una palabra que le salga mal y que la escriba tres veces, cada vez más despacio. La tercera casi siempre es la mejor, y conviene que lo vea.
Progresión:
• Si sale fácil: sacá la línea de la mitad, después la del techo, y por último pasá a renglón común.
• Si no sale: renglones más anchos y palabras de tres letras, sólo con letras de una misma altura.
Qué mirar:
Si las altas y las bajas se distinguen, si el tamaño se le va agrandando o achicando dentro de la palabra, si aprieta tanto el lápiz que marca la hoja de atrás. Criterio: dos renglones seguidos con las alturas respetadas, sin las líneas de color.
Cuánto y cada cuánto:
Diez minutos, tres veces por semana. Después de eso, cansa y empeora.
Para casa:
Dos renglones por día, no más, en hoja con renglón ancho. Mejor dos renglones prolijos que una página entera peleada.'),

  (null, 'psychopedagogy', 'Escritura', 'Grafismo', 'La letra que se entiende', 'guide', 'Encontrar cuál de los cuatro problemas de legibilidad tiene esta letra, y trabajar sólo ese', '8-9 años', 'Para qué sirve:
A esta edad ya no sirve pedir "mejor letra": hay que saber qué está fallando. Casi siempre es una de cuatro cosas, y cada una tiene su ejercicio. Trabajar las cuatro juntas es lo que hace que no mejore ninguna.
Qué necesitás:
Una hoja escrita por él de antes, lápiz, y el cuaderno de la escuela para comparar.
Cómo se presenta:
Miran juntos una página vieja del cuaderno y buscan cuál de los cuatro problemas aparece más. Lo eligen entre los dos, y ése es el único que se trabaja por ahora. Decirlo en voz alta importa: la letra deja de ser un juicio y pasa a ser una tarea.
Ejercicio 1, encontrar el problema:
• Tamaño: letras de tamaños distintos en la misma palabra.
• Espacio: palabras pegadas entre sí, o letras separadas dentro de la palabra.
• Renglón: letras que flotan o se hunden.
• Inclinación: unas para adelante y otras para atrás.
Ejercicio 2, el ejercicio del problema elegido:
• Si es el tamaño: escribir en hoja cuadriculada, una letra por cuadrito.
• Si es el espacio: un dedo apoyado entre palabra y palabra, o un punto con lápiz antes de empezar la que sigue.
• Si es el renglón: marcar el piso con color y copiar tres renglones.
• Si es la inclinación: rayas paralelas inclinadas de fondo, y escribir siguiéndolas.
Ejercicio 3, la prueba de legibilidad:
Escribe cuatro palabras y las tapa. A los diez minutos, se destapa y las lee él. Si él no las puede leer, el problema no era del maestro.
Progresión:
• Si sale fácil: la misma prueba con una oración escrita rápido, que es la situación real de la clase.
• Si no sale: volvé a trabajar tamaño y renglón con soporte gráfico, y bajá la exigencia de velocidad.
Qué mirar:
Si escribe distinto cuando va rápido, si se le cae la legibilidad después de tres renglones, si toma el lápiz con mucha fuerza. Criterio: sus propias cuatro palabras leídas sin dudar, dos veces seguidas.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana, un solo problema a la vez y durante tres semanas antes de cambiar.
Para casa:
La lista del supermercado, escrita por él, y que la lea quien va a comprar. Es la prueba de legibilidad más honesta que hay.'),

  (null, 'psychopedagogy', 'Escritura', 'Ortografía', 'Dictado de palabras con r y rr', 'activity', 'Escuchar la diferencia entre la r suave y la fuerte, y decidir cuándo va doble', '6-7 años', 'Para qué sirve:
La regla de la rr no se aprende de memoria: primero hay que oír que son dos sonidos distintos. Un chico que no distingue cara de carro no tiene cómo decidir cuántas erres escribir.
Qué necesitás:
Hoja, lápiz, y una hoja aparte tuya con las palabras.
Cómo se presenta:
Decís las dos palabras seguidas, exagerando: caro, carro. Que diga cuál suena más fuerte. Después las dice él, y recién después las escribe. Primero el oído, después la mano.
Ejercicio 1, escuchar y separar en dos columnas:
No se escribe la palabra todavía: sólo se decide de qué lado va.
• Suave: cara, pera, aro, oreja, toro, arena, mira
• Fuerte: carro, perro, torre, burro, marrón, ferrocarril, rama
Ojo con las que empiezan con r: rama suena fuerte y se escribe con una sola.
Ejercicio 2, el dictado:
Diez palabras, dictadas de a una, mezclando los dos grupos: cara, carro, pera, perro, toro, torre, arena, burro, marrón, rama. Al final se revisan juntas, y de cada error se dice en voz alta por qué.
Ejercicio 3, las dos en una oración:
• El perro de la cara blanca.
• La torre del toro de madera.
Copiar y leer en voz alta cuidando la diferencia.
Progresión:
• Si sale fácil: sumá la regla completa, con la r que suena fuerte después de n, l y s: enredo, alrededor.
• Si no sale: quedate en el paso de escuchar y clasificar, sin escribir, hasta que las separe sin dudar.
Qué mirar:
Si distingue de oído antes de escribir, si escribe rr al principio de palabra, si duda sólo en las palabras largas. Criterio: 8 de 10 en el dictado, dos sesiones seguidas.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. El dictado corto y revisado en el momento enseña más que el largo corregido después.
Para casa:
Cinco palabras por semana, las que fallaron, dictadas por alguien de la casa. Se corrige ahí mismo, juntos, y no se pasa en limpio.'),

  (null, 'psychopedagogy', 'Escritura', 'Ortografía', 'La b larga y la v corta', 'worksheet', 'Usar las reglas que sí son confiables para decidir entre b y v, en lugar de adivinar', '8-9 años', 'Para qué sirve:
La b y la v suenan igual en el Río de la Plata, así que el oído no ayuda. Lo que ayuda son tres o cuatro reglas confiables y la memoria visual de las palabras frecuentes. Todo lo demás es adivinar, y conviene decirlo.
Qué necesitás:
Hoja, lápiz, y el cartel de las reglas escrito a mano para que quede a la vista.
Cómo se presenta:
Escribís vos el cartel con las tres reglas mientras las explicás con un ejemplo cada una. El cartel queda arriba de la mesa y se consulta: la idea es que lo use, no que lo recuerde.
Ejercicio 1, el cartel de las reglas:
• Con b: después de m (bomba, cambio), y los verbos en aba, abas, ábamos (cantaba, jugábamos).
• Con b: las palabras que empiezan con bi, bu, bur, bus (bicicleta, buscar, burro).
• Con v: después de n (invierno, envase), y las que empiezan con ad (advertir).
• Y una lista corta de las que hay que saber de memoria: iba, tuve, estuvo, nuevo, volver.
Ejercicio 2, completar y decir la regla:
Se completa con b o v y al lado se escribe qué regla se usó. Si no hay regla, se escribe "de memoria".
• bom__a · cam__io · in__ierno · __icicleta · canta__a · en__ase · __uscar · nue__o
Ejercicio 3, el dictado de las traidoras:
Diez palabras, todas de la lista de memoria y de las reglas trabajadas: iba, bomba, invierno, jugábamos, envase, buscar, volver, cambio, nuevo, bicicleta. Se corrige en el momento.
Progresión:
• Si sale fácil: escribir un texto corto de cinco oraciones usando seis palabras de la lista, y revisarlo con el cartel.
• Si no sale: una sola regla por semana, con seis palabras de esa regla y nada más.
Qué mirar:
Si consulta el cartel o adivina, si puede nombrar la regla que usó, cuáles palabras falla siempre. Criterio: 8 de 10 en el dictado nombrando la regla, dos sesiones seguidas.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Una regla nueva recién cuando la anterior salga sola.
Para casa:
Que busque en un texto cualquiera cinco palabras con b y cinco con v, y que diga de cada una si hay regla. Buscar cansa menos que copiar y enseña más.'),

  (null, 'psychopedagogy', 'Escritura', 'Ortografía', 'Las palabras que siempre se escriben mal', 'activity', 'Armar la lista propia de errores repetidos y trabajarla con memoria visual, no con copia', '10-11 años', 'Para qué sirve:
Cada chico falla siempre en las mismas veinte o treinta palabras. Trabajar esas, y no la ortografía en general, es lo que cambia el cuaderno. Y copiarlas veinte veces no funciona: la copia mecánica no deja huella visual.
Qué necesitás:
Dos o tres cuadernos suyos de la escuela, fichas o papelitos, y un sobre o una caja para guardarlas.
Cómo se presenta:
Buscan juntos en los cuadernos y anotan cada palabra mal escrita en una ficha, con la forma correcta grande y la parte difícil en otro color. Que las escriba él: la ficha es suya.
Ejercicio 1, armar la lista:
Diez fichas para empezar, no más. Van con la palabra bien escrita y la letra complicada marcada con color: había, iba, ahora, hacer, dijo, porque, también, después, entonces, aunque.
Ejercicio 2, mirar, tapar, escribir, comparar:
Este es el ejercicio, en cuatro pasos y en ese orden.
• Mira la ficha cinco segundos y fijate en la parte marcada.
• Tapala.
• Escribila de memoria.
• Destapá y compará letra por letra.
Si falló, se repite con esa ficha; si salió, va al sobre de las logradas.
Ejercicio 3, la palabra en su oración:
Cada palabra lograda se usa en una oración inventada por él, escrita a mano. Fuera de la oración la palabra se olvida.
Progresión:
• Si sale fácil: dictado de un texto suyo con seis de esas palabras, y que se autocorrija con las fichas.
• Si no sale: cinco fichas en lugar de diez, y la parte difícil más marcada.
Qué mirar:
Si mira la parte marcada o la palabra entera, si la escribe igual de mal siempre o cambia el error, si al mes vuelve a fallar en las logradas. Criterio: una ficha pasa al sobre cuando sale bien tres días distintos.
Cuánto y cada cuánto:
Diez minutos, tres veces por semana, con cinco fichas por vez. Las del sobre se revisan una vez al mes.
Para casa:
Las cinco fichas de la semana, y el mismo ciclo de mirar, tapar, escribir y comparar. Dos minutos por día alcanzan.'),

  (null, 'psychopedagogy', 'Escritura', 'Ortografía', 'Las tildes que cambian la palabra', 'worksheet', 'Usar la tilde diacrítica y las reglas de acentuación en la escritura de liceo', '12-14 años', 'Para qué sirve:
En liceo la tilde deja de ser un detalle y empieza a cambiar el sentido de la oración. Y lo que se corrige en los escritos no es la regla general: son cinco o seis pares que aparecen todo el tiempo.
Qué necesitás:
Hoja, lápiz, y un escrito propio reciente, corregido por el profesor si lo hay.
Cómo se presenta:
Se leen en voz alta los dos miembros de un par en dos oraciones, y se escucha qué cambia. Primero el sentido, después la regla. Al revés no se sostiene.
Ejercicio 1, los pares que importan:
• el y él: El perro es de él.
• si y sí: Si querés, decí que sí.
• mas y más: Quería más, mas no había.
• se y sé: No sé si se enteró.
• tu y tú: Tú tenés tu razón.
• que y qué: ¿Qué querés que haga?
Escribir una oración propia con cada par, los dos usos en la misma oración.
Ejercicio 2, la regla general, en tres renglones:
• Agudas: llevan tilde si terminan en n, s o vocal (cami+ón, come+rás, sof+á).
• Graves: llevan tilde si no terminan en n, s o vocal (árbol, cárcel).
• Esdrújulas: siempre (médico, teléfono, matemática).
Clasificar diez palabras del texto de una materia y decidir si llevan tilde.
Ejercicio 3, corregir un texto propio:
Buscar en su escrito todas las tildes que faltan o sobran, y al lado de cada una escribir por qué. Es la parte que transfiere: la regla en el texto de otro no se lleva al propio.
Progresión:
• Si sale fácil: sumá los interrogativos indirectos, que son los que más se escapan: no sé cuándo llega.
• Si no sale: quedate en tres pares diacríticos y en las esdrújulas, que son las más fáciles de ver.
Qué mirar:
Si escucha la diferencia de sentido, si aplica la regla o tildea por costumbre, si transfiere al escrito propio. Criterio: seis de seis pares bien usados en oraciones propias, y su texto corregido con tres justificaciones.
Cuánto y cada cuánto:
Veinte minutos, una o dos veces por semana, siempre cerrando con un texto propio.
Para casa:
Revisar las tildes de lo que escriba para la escuela antes de entregarlo, buscando sólo estos seis pares. Una pasada, un objetivo.'),

  (null, 'psychopedagogy', 'Escritura', 'Producción de textos', 'Antes de escribir, la lluvia de ideas', 'guide', 'Planificar un texto antes de escribirlo, para que la hoja en blanco deje de ser el problema', '8-9 años', 'Para qué sirve:
La hoja en blanco no se resuelve escribiendo: se resuelve antes. Un chico que arranca sin plan escribe dos oraciones y se queda, y lo vive como que no se le ocurre nada, cuando lo que falta es el paso anterior.
Qué necesitás:
Dos hojas (una para el plan, otra para el texto) y lápiz. Que sean dos hojas distintas es parte de la idea.
Cómo se presenta:
El plan se hace en voz alta y lo escribís vos la primera vez, con sus palabras, para que vea que ninguna idea se descarta en esta parte. La regla de la lluvia es que todo se anota, incluso lo malo.
Ejercicio 1, la lluvia, dos minutos con reloj:
Tema: un día que me acuerdo. Todo lo que aparezca va a la hoja en palabras sueltas, sin oraciones y sin orden. Mínimo diez palabras. No se tacha nada.
Ejercicio 2, elegir y ordenar:
De la lluvia se eligen cinco palabras y se numeran del 1 al 5 en el orden en que van a aparecer. Las que sobran quedan ahí, tachadas o no: haberlas pensado no fue tiempo perdido.
Ejercicio 3, una oración por número:
En la otra hoja, una oración por cada palabra numerada. Cinco oraciones, ni más ni menos. Se lee en voz alta al terminar, y sólo ahí se corrige algo.
Progresión:
• Si sale fácil: que el plan tenga principio, medio y final marcados, y dos oraciones por parte.
• Si no sale: la lluvia oral y vos escribiendo, con tres palabras en lugar de diez.
Qué mirar:
Si la lluvia le sale sola o necesita preguntas tuyas, si puede descartar, si el texto sigue el orden que él mismo puso. Criterio: plan propio de cinco palabras y texto de cinco oraciones que lo respete.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana. El plan nunca se saltea, aunque el texto sea corto.
Para casa:
Antes de cualquier escrito de la escuela, dos minutos de lluvia en el borrador. La familia no tiene que corregir: sólo recordar que ese paso existe.'),

  (null, 'psychopedagogy', 'Escritura', 'Producción de textos', 'Principio, medio y final', 'worksheet', 'Escribir un relato con las tres partes completas, y no sólo con el episodio del medio', '8-9 años', 'Para qué sirve:
El relato que empieza en el problema y termina sin resolverlo es el más común a esta edad. Escribir con las tres partes a la vista es lo que las hace aparecer, y después se internaliza.
Qué necesitás:
Una hoja doblada en tres, o con tres recuadros dibujados, y lápiz.
Cómo se presenta:
Contás vos una historia de tres oraciones y ellos tienen que decir dónde estaba cada parte. Después se planifica la de él en los tres recuadros, con una palabra o un dibujo en cada uno, y recién después se escribe.
Ejercicio 1, la historia en tres escenas:
La secuencia para armar: empieza a llover · un perro se moja · alguien lo lleva a su casa.
En cada recuadro, una oración. Usá primero, después y al final.
Ejercicio 2, la misma historia, otro final:
Se cambia sólo el tercer recuadro: ahora el perro entra solo a un almacén. Todo lo demás queda igual. Cambiar el final muestra que el final es una decisión y no lo que pasó.
Ejercicio 3, una historia propia:
Tres recuadros vacíos, tema libre, misma regla: una oración por recuadro, y las palabras primero, después y al final en alguna parte.
Progresión:
• Si sale fácil: dos oraciones por recuadro, y que el medio tenga un problema de verdad y no sólo algo que pasa.
• Si no sale: dibuja las tres escenas y vos escribís sus oraciones al pie. Lo que se entrena es la estructura, no la letra.
Qué mirar:
Si el principio dice quién y dónde, si el medio tiene un problema, si el final resuelve o se corta. Criterio: tres historias seguidas con las tres partes, la última sin recuadros.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana. Se lee siempre en voz alta al final.
Para casa:
Contar una historia de tres partes en la cena, sin escribir. Quien escuche puede preguntar cómo terminó, que es la pregunta que enseña.'),

  (null, 'psychopedagogy', 'Escritura', 'Producción de textos', 'Carta a alguien de verdad', 'activity', 'Escribir un texto con destinatario real, que es lo que hace aparecer el cuidado por el lector', '8-9 años', 'Para qué sirve:
Escribir para alguien cambia cómo se escribe: aparece el saludo, aparece explicar lo que el otro no sabe, aparece revisar antes de entregar. Un texto sin lector es un ejercicio; una carta que se manda, no.
Qué necesitás:
Hoja, lápiz, sobre, y un destinatario de verdad: una abuela, un primo que vive lejos, un compañero enfermo.
Cómo se presenta:
Primero se decide a quién y para qué. Después mostrás las partes de una carta con una escrita por vos. Recién después escribe la suya, y se manda: esa parte no es opcional.
Ejercicio 1, las partes:
• Saludo: Querida abuela.
• Para qué escribo: Te escribo para contarte algo que pasó.
• Lo que cuento: dos o tres oraciones.
• Una pregunta para el otro: ¿Vos te acordás de cuando...?
• Cierre y firma: Te quiero, Manuel.
Ejercicio 2, lo que el otro no sabe:
Se lee su carta buscando una sola cosa: ¿la abuela entiende de quién habla? Donde dice "el de la bici", se agrega quién es. Escribir para otro es agregar lo que falta.
Ejercicio 3, la relectura antes de cerrar el sobre:
Tres pasadas cortas, una por cosa: que se entienda, que estén los puntos, que las palabras difíciles estén bien. Una pasada por vez, no todo junto.
Progresión:
• Si sale fácil: una carta de reclamo o de pedido, que exige otro tono, o contestar la que llegó.
• Si no sale: una postal de cuatro renglones. El destinatario real importa más que el largo.
Qué mirar:
Si aparece el destinatario en el texto, si explica lo que el otro no puede saber, si revisa algo por su cuenta. Criterio: carta con las cinco partes y una corrección hecha por él.
Cuánto y cada cuánto:
Media hora, una vez por semana, hasta que la carta se manda. Puede llevar dos sesiones y está bien.
Para casa:
Llevar la carta al correo o entregarla. Y si llega respuesta, leerla en sesión: la respuesta es lo que hace que quiera escribir la próxima.'),

  (null, 'psychopedagogy', 'Escritura', 'Producción de textos', 'Revisar lo que escribí', 'guide', 'Revisar un texto propio con una lista de tres cosas, de a una por pasada', '10-11 años', 'Para qué sirve:
Revisar no es leer de nuevo: es buscar una cosa a la vez. El chico que relee entero y no encuentra nada no está distraído, está buscando todo junto, que es lo mismo que no buscar nada.
Qué necesitás:
Un texto propio ya escrito, tres lápices de colores distintos y la lista de las tres pasadas.
Cómo se presenta:
La primera vez revisás vos un texto tuyo, con errores puestos a propósito, narrando cada pasada. Que te vea encontrar y corregir baja muchísimo la resistencia a que le corrijan.
Ejercicio 1, primera pasada, que se entienda:
Con un color: buscar sólo las partes que no se entienden si uno no sabía de qué hablaba. Se agrega lo que falta, no se saca.
Ejercicio 2, segunda pasada, las oraciones:
Con otro color: leer en voz alta y poner un punto donde la voz se detiene. Si una oración ocupa tres renglones, se parte en dos.
Ejercicio 3, tercera pasada, las palabras:
Con el tercer color: las palabras repetidas (dijo, dijo, dijo) y las dudosas de ortografía. Las repetidas se cambian por otra; las dudosas se buscan.
Progresión:
• Si sale fácil: que revise el texto de otro compañero con la misma lista, que es más difícil y más útil.
• Si no sale: una sola pasada por sesión, la de que se entienda, y las otras dos más adelante.
Qué mirar:
Si encuentra algo sin ayuda, si acepta cambiar o defiende todo, si la versión corregida es realmente mejor. Criterio: tres cambios propios en un texto, en dos textos seguidos.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana, siempre sobre un texto suyo y nunca el mismo día que lo escribió.
Para casa:
Antes de entregar cualquier escrito, una sola pasada: la de que se entienda. Una, y elegida.'),

  (null, 'psychopedagogy', 'Escritura', 'Producción de textos', 'Defender una postura por escrito', 'guide', 'Escribir un texto argumentativo de liceo con tesis, argumentos y una objeción contestada', '15+ años', 'Para qué sirve:
En liceo y en la prueba de ingreso casi todo lo que se escribe es argumentativo, y el error más común no es de redacción: es no tener una tesis. Sin una oración que diga qué se sostiene, el texto queda en un resumen del tema.
Qué necesitás:
Hoja o computadora, y un tema sobre el que tenga opinión de verdad.
Cómo se presenta:
Antes de escribir, la discuten hablando cinco minutos, y vos tomás la posición contraria. Discutir primero le da los argumentos y, sobre todo, le muestra qué le van a contestar.
Ejercicio 1, la tesis en una oración:
Una sola oración afirmativa, sin "yo creo que", que se pueda discutir. Se prueba así: si nadie puede estar en contra, no es una tesis.
• Débil: El celular en el liceo es un tema importante.
• Fuerte: El celular no debería estar prohibido en clase, sino usado como herramienta.
Ejercicio 2, la estructura en cuatro partes:
• Tesis, una oración.
• Dos argumentos, cada uno con un ejemplo o un dato.
• Una objeción de los que piensan al revés, escrita con honestidad.
• La respuesta a esa objeción, y el cierre.
Escribir el esquema en cinco líneas antes del texto.
Ejercicio 3, el texto y la prueba del contrario:
Se escribe el texto siguiendo el esquema. Después se lo lee alguien que piense distinto (vos) y marca la parte más débil. Se reescribe sólo esa parte.
Progresión:
• Si sale fácil: sumar una cita o un dato con la fuente, y ajustar el registro al lector (profesor, diario, autoridad del liceo).
• Si no sale: quedate en tesis más un argumento, bien armado, sin objeción.
Qué mirar:
Si la tesis es discutible, si los argumentos la sostienen o repiten la tesis con otras palabras, si la objeción está escrita de verdad o es de cartón. Criterio: tesis discutible, dos argumentos con ejemplo y una objeción contestada.
Cuánto y cada cuánto:
Cuarenta minutos, una vez por semana, con un tema nuevo cada dos semanas para poder reescribir.
Para casa:
Buscar en un diario una columna de opinión y marcarle la tesis, los argumentos y la objeción. Leer argumentación ajena es la práctica más corta que hay.')
on conflict (title) where practitioner_id is null do update set
  discipline = excluded.discipline, area = excluded.area, focus = excluded.focus,
  kind = excluded.kind, objective = excluded.objective,
  age_range = excluded.age_range, content = excluded.content;

-- ─── Matemática ─────────────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychopedagogy', 'Matemática', 'Numeración', 'Los números que se pueden agarrar', 'activity', 'Contar objetos de verdad con correspondencia uno a uno y entender que el último número dice cuántos hay', '3-5 años', 'Para qué sirve:
Recitar del uno al diez no es contar. Contar es tocar cada objeto una sola vez, decir un número por objeto y entender que el último dice cuántos hay. Son tres cosas distintas y se ven una por una.
Qué necesitás:
Veinte objetos iguales (tapitas, porotos, botones) y tres recipientes o platos.
Cómo se presenta:
Contás vos en voz alta tocando cada tapita y corriéndola a un costado. Después cuentan juntos. Después cuenta él y vos sólo mirás dónde se traba.
Ejercicio 1, contar corriendo cada objeto:
Cinco tapitas, después ocho, después doce. La regla es correrlas mientras se cuentan: mover la mano es lo que evita contar dos veces la misma.
Al final de cada conteo, la pregunta clave: ¿cuántas hay? Si vuelve a contar todo en lugar de decir el último número, eso es lo que hay que trabajar.
Ejercicio 2, dame tantas:
Ahora al revés, que es más difícil: dame seis tapitas. Se pide 3, 6, 9 y 4, en ese desorden. Dar una cantidad exige saber cuándo parar.
Ejercicio 3, repartir en tres platos:
Doce tapitas en tres platos, las mismas en cada uno. Después se cuenta cuántas quedaron en cada plato. Esto es el principio del reparto, y sale mucho antes de que exista la división.
Progresión:
• Si sale fácil: contar desde un número que no sea el uno (empezá en cuatro), y contar objetos desordenados sin moverlos.
• Si no sale: bajá a cinco objetos, en fila, y contá vos señalando mientras él dice los números.
Qué mirar:
Si toca un objeto por número, si repite o saltea, si contesta cuántos hay sin recontar, si se pierde siempre en el mismo número. Criterio: cuenta doce bien y contesta cuántos hay sin recontar, dos sesiones seguidas.
Cuánto y cada cuánto:
De diez a quince minutos, tres veces por semana, siempre con objetos de verdad y nunca con dibujos todavía.
Para casa:
Contar lo que ya se cuenta en la casa: los platos de la mesa, las medias del tender, las escaleras. Con la pregunta de cuántas hay al final, que es la que enseña.'),

  (null, 'psychopedagogy', 'Matemática', 'Numeración', 'La recta numérica saltarina', 'worksheet', 'Ubicar números en la recta y contar de dos en dos y de cinco en cinco', '6-7 años', 'Para qué sirve:
La recta ordena los números en el espacio, y ese orden es el que después sostiene la suma y la resta: sumar es avanzar, restar es volver. Contar salteado, además, es la puerta de las tablas.
Qué necesitás:
Hoja apaisada, lápiz y regla. Una recta dibujada en el piso con cinta también funciona, y mejor.
Cómo se presenta:
Dibujás la recta con los números de 0 a 20 y marcás los saltos con el dedo, contando en voz alta. Después salta él con el dedo, y después escribe. Si la recta está en el piso, salta con el cuerpo primero.
Ejercicio 1, completar los saltos:
• De 2 en 2: 0, 2, __, __, 8, __, __, 14, __, __, 20
• De 5 en 5: 0, 5, __, __, 20, __, __, 35
• De 10 en 10: 0, 10, __, __, 40, __, __, 70
Ejercicio 2, saltos hacia atrás:
• De 2 en 2 desde 20: 20, 18, __, __, 12, __
• De 5 en 5 desde 50: 50, 45, __, __, 30, __
Hacia atrás cuesta bastante más, y es lo que necesita la resta.
Ejercicio 3, el número que falta en el medio:
En una recta de 0 a 20 sin números, marcás tres posiciones y tiene que decir qué número va en cada una. Se empieza por las que están cerca del 0, del 10 y del 20, que son las referencias.
Progresión:
• Si sale fácil: recta de 0 a 100 de 10 en 10, y saltos de 3 en 3.
• Si no sale: recta de 0 a 10, saltos de 2 en 2, y con el cuerpo en el piso antes que en la hoja.
Qué mirar:
Si usa los números marcados como referencia o cuenta desde el cero cada vez, si el salto hacia atrás lo desarma, si escribe los números al derecho. Criterio: las tres series de la primera parte completas sin ayuda.
Cuánto y cada cuánto:
Quince minutos, dos o tres veces por semana. La recta del piso conviene dejarla puesta y usarla al pasar.
Para casa:
Contar de 2 en 2 los escalones, y de 5 en 5 con las monedas. Sin hoja.'),

  (null, 'psychopedagogy', 'Matemática', 'Numeración', 'La escalera de decenas', 'worksheet', 'Sumar y restar de diez en diez entendiendo que cambia una sola cifra', '6-7 años', 'Para qué sirve:
Sumar diez no es contar diez: es cambiar una cifra. El chico que para hacer 34 más 10 cuenta uno por uno todavía no ve la decena, y ése es el paso que abre el cálculo mental de dos cifras.
Qué necesitás:
Hoja, lápiz, y si hay, material de base diez o diez palitos atados en manojos.
Cómo se presenta:
Escribís la serie y la leés en voz alta señalando qué cifra cambia y qué cifra se queda quieta. Que lo diga él después: cambia el primero, el segundo se queda. Esa frase es la que hay que instalar.
Ejercicio 1, la escalera para arriba:
• 10, 20, __, __, 50, __, __, 80, __, 100
• 14, 24, __, __, 54, __, __, 84, __
• 37, 47, __, __, 77, __, __
Ejercicio 2, la escalera para abajo:
• 100, 90, __, __, 60, __, __, 30, __
• 65, 55, __, __, 25, __
Y la pregunta cada dos renglones: ¿qué cifra cambió?
Ejercicio 3, diez más y diez menos, salteado:
Diez cuentas mezcladas, para que no resuelva por inercia:
• 23 + 10 · 46 + 10 · 71 - 10 · 58 - 10 · 30 + 10
• 62 - 10 · 85 + 10 · 19 + 10 · 44 - 10 · 90 - 10
Progresión:
• Si sale fácil: de 100 en 100 con números de tres cifras, y sumar 9 pensándolo como diez menos uno.
• Si no sale: con material concreto, agregando y quitando un manojo de diez, hasta que vea que el manojo no se desarma.
Qué mirar:
Si cuenta uno por uno o cambia la cifra, si en la bajada se pierde, si el 19 más 10 lo resuelve igual que el 44 menos 10. Criterio: nueve de diez en el ejercicio salteado, dos sesiones seguidas.
Cuánto y cada cuánto:
Quince minutos, tres veces por semana, hasta que el salteado salga sin pensar.
Para casa:
Con la calculadora tapada: le dicen un número, él dice cuánto es diez más, y después se verifica. Cinco por vez.'),

  (null, 'psychopedagogy', 'Matemática', 'Numeración', 'El valor de cada lugar', 'activity', 'Entender que la misma cifra vale distinto según el lugar que ocupa en el número', '8-9 años', 'Para qué sirve:
Casi todo lo que sale mal al restar llevando, al comparar números largos o al escribir 205 como 2005 es valor posicional. Y se ve, con material, en una sesión: el 4 de 42 no es cuatro, son cuarenta.
Qué necesitás:
Material de base diez, o palitos y gomitas para armar manojos de diez, y una hoja con tres columnas: centenas, decenas, unidades.
Cómo se presenta:
Armás vos un número con el material y lo escribís en las columnas, diciendo en voz alta cuántas decenas y cuántas unidades. Después armás vos y escribe él. Después dice el número y lo arma él.
Ejercicio 1, armar y escribir:
Armar con el material y anotar en la tabla: 26, 42, 60, 105, 150, 213.
La pregunta de cada uno: ¿cuánto vale este 2? El de 26 vale dos, el de 213 vale doscientos.
Ejercicio 2, el mismo dígito en dos lugares:
• En 33, ¿los dos tres valen lo mismo?
• En 55 y en 505, ¿qué vale cada cinco?
• Escribí un número donde el 7 valga setenta. Y otro donde valga setecientos.
Ejercicio 3, descomponer y componer:
• 47 = 40 + 7 · 83 = __ + __ · 156 = 100 + __ + __
• Y al revés: 200 + 30 + 4 = __ · 60 + 9 = __ · 400 + 5 = __
El último es el que muestra si entendió: 405, no 45.
Progresión:
• Si sale fácil: cuatro cifras y comparaciones de números largos, diciendo por qué uno es mayor.
• Si no sale: quedate en dos cifras con material concreto, sin pasar a la hoja.
Qué mirar:
Si necesita el material, si en el 405 escribe 45, si puede decir cuánto vale un dígito sin contar. Criterio: los seis números de la primera parte armados y escritos bien, y 400 + 5 resuelto.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana, con material hasta que sobre.
Para casa:
Leer en voz alta los números que aparecen en la calle o en la tele y decir cuántas decenas tienen. Sin hoja, dos o tres por vez.'),

  (null, 'psychopedagogy', 'Matemática', 'Cálculo mental', 'Cálculo relámpago', 'worksheet', 'Resolver sumas y restas hasta veinte con estrategias, y no contando con los dedos', '6-7 años', 'Para qué sirve:
Las cuentas hasta veinte tienen que salir rápido porque después se usan adentro de cuentas más grandes. El chico que suma con los dedos no está haciendo algo mal, está usando la única estrategia que tiene: hay que darle otras.
Qué necesitás:
Hoja, lápiz, reloj. Y tapitas a mano para las que no salen.
Cómo se presenta:
Antes de las cuentas se enseña una estrategia y se dice su nombre. Se resuelve una con vos pensando en voz alta: para 8 más 5, lleno hasta diez y me sobran tres. Después una juntos, después solo.
Ejercicio 1, las estrategias, con nombre:
• Llenar el diez: 8 + 5 es 8 + 2 + 3.
• Los dobles: 6 + 6 = 12, y de ahí 6 + 7 es el doble más uno.
• Más diez y saco: 9 + 6 es 10 + 6 menos uno.
Ejercicio 2, la hoja de cuentas:
Doce cuentas, sin reloj, con la estrategia dicha:
• 7 + 5 · 9 + 6 · 12 - 4 · 8 + 8
• 15 - 7 · 6 + 9 · 14 - 6 · 10 + 7
• 13 - 5 · 4 + 8 · 16 - 9 · 11 - 3
Ejercicio 3, contra su propio reloj:
La misma hoja, ahora con reloj, dos veces en la semana. Se anota el tiempo y los errores. Compite contra su número de la vez pasada y contra nadie más.
Progresión:
• Si sale fácil: hasta cien de a decenas enteras, y sumas de tres términos.
• Si no sale: hasta diez, con tapitas, y una sola estrategia por semana.
Qué mirar:
Si usa los dedos, si puede nombrar la estrategia, en qué cuentas tarda siempre. Criterio: diez de doce bien, nombrando estrategia en al menos cinco, sin dedos.
Cuánto y cada cuánto:
Diez minutos, tres veces por semana. El tiempo se mide sólo una de esas tres.
Para casa:
Cinco cuentas orales por día, en cualquier momento, y que diga cómo la pensó. El cómo importa más que el resultado.'),

  (null, 'psychopedagogy', 'Matemática', 'Cálculo mental', 'Las estrategias que reemplazan a los dedos', 'guide', 'Reemplazar el conteo uno a uno por estrategias de cálculo con nombre propio', '8-9 años', 'Para qué sirve:
A los ocho o nueve años seguir contando con los dedos no es un hábito: es que nadie le mostró otra cosa. Y contar uno por uno ocupa toda la memoria de trabajo, así que en cuentas de dos pasos se pierde siempre.
Qué necesitás:
Hoja, lápiz, y un cartel con las cinco estrategias a la vista.
Cómo se presenta:
Se elige una estrategia por semana. La mostrás resuelta dos veces pensando en voz alta, la nombran, y todas las cuentas de la semana se resuelven con ésa aunque haya otra más rápida.
Ejercicio 1, el cartel de las cinco:
• Llenar el diez: 47 + 8 es 47 + 3 + 5.
• Sumar de a decenas y después las unidades: 36 + 25 es 36 + 20 + 5.
• Compensar: 39 + 17 es 40 + 17 menos uno.
• Restar contando para arriba: 62 - 58 es cuánto le falta a 58 para llegar a 62.
• Dobles y casi dobles: 25 + 26 es el doble de 25 más uno.
Ejercicio 2, la misma cuenta de dos maneras:
Resolver 48 + 26 con dos estrategias distintas y ver que da lo mismo. Repetir con 73 - 48. Que dos caminos den el mismo resultado es lo que le da confianza para dejar los dedos.
Ejercicio 3, elegir la estrategia antes de calcular:
Diez cuentas, con la estrategia escrita antes:
• 58 + 7 · 45 + 30 · 39 + 24 · 71 - 68 · 34 + 35
• 90 - 47 · 26 + 27 · 53 - 19 · 48 + 26 · 100 - 62
Progresión:
• Si sale fácil: cuentas de tres cifras y estimación antes de calcular (más o menos cuánto va a dar).
• Si no sale: una sola estrategia, con números hasta veinte, y material concreto para mostrar por qué funciona.
Qué mirar:
Si sigue usando los dedos cuando se complica, si puede explicar el camino, si elige la estrategia conveniente o siempre la misma. Criterio: ocho de diez bien con la estrategia escrita, sin dedos, dos sesiones seguidas.
Cuánto y cada cuánto:
Quince minutos, tres veces por semana, una estrategia nueva cada dos semanas.
Para casa:
Cinco cuentas orales por día y siempre la misma pregunta: ¿cómo lo pensaste? Nunca cuánto tardaste.'),

  (null, 'psychopedagogy', 'Matemática', 'Cálculo mental', 'Las tablas, sin recitarlas', 'activity', 'Construir las tablas de multiplicar a partir de las que ya se saben, en lugar de memorizarlas de corrido', '8-9 años', 'Para qué sirve:
Recitar la tabla del siete de corrido no sirve para resolver 7 por 6 si hay que empezar del principio cada vez. Lo que sirve es saber de dónde sacar el resultado: del doble, del diez menos algo, del anterior más siete.
Qué necesitás:
Hoja cuadriculada, lápiz, y la tabla pitagórica de diez por diez dibujada.
Cómo se presenta:
Se pinta en la tabla pitagórica lo que ya sabe: el uno, el dos, el cinco, el diez. Queda poquito sin pintar, y eso cambia la cara: no son cien cuentas nuevas, son veinte.
Ejercicio 1, pintar lo que ya se sabe:
• El uno y el dos: los dobles.
• El cinco: termina en cero o en cinco.
• El diez: se agrega un cero.
Con eso pintado, contar cuántos casilleros quedan. Son menos de los que esperaba.
Ejercicio 2, construir las difíciles desde las fáciles:
• Del cuatro: el doble del dos. 4 x 7 es el doble de 2 x 7.
• Del seis: el doble del tres. 6 x 8 es el doble de 3 x 8.
• Del nueve: el diez menos una vez. 9 x 6 es 60 menos 6.
• Del siete: el cinco más el dos. 7 x 8 es 40 más 16.
Ejercicio 3, las que quedan, en tarjetas:
Las que no salen con ninguna estrategia (casi siempre 7 x 8, 6 x 8, 7 x 6) van a cuatro tarjetas y se practican como palabras: mirar, tapar, decir, comprobar.
Progresión:
• Si sale fácil: la división como pregunta al revés (¿cuántas veces entra el 6 en 48?) y multiplicar por decenas enteras.
• Si no sale: una tabla por semana, construida desde su pariente, y la tabla pitagórica siempre a la vista.
Qué mirar:
Si empieza a recitar desde el principio, si usa la estrategia o adivina, cuáles son sus tres difíciles. Criterio: la tabla pitagórica completada en menos de cinco minutos, con dos errores como máximo.
Cuánto y cada cuánto:
Quince minutos, tres veces por semana. Las tarjetas, dos minutos por día.
Para casa:
Las tres tarjetas difíciles en la heladera y la tabla pitagórica en la carpeta. Consultarla no es hacer trampa, y conviene decírselo a la familia.'),

  (null, 'psychopedagogy', 'Matemática', 'Cálculo mental', 'Estimar antes de calcular', 'activity', 'Dar un resultado aproximado antes de hacer la cuenta, para poder darse cuenta de un error grande', '10-11 años', 'Para qué sirve:
Estimar es el control de calidad del cálculo: el chico que estima no entrega 302 cuando la respuesta era 32. Y es lo que permite darse cuenta solo, sin que alguien corrija.
Qué necesitás:
Hoja, lápiz. Sin calculadora en la primera parte y con calculadora en la última.
Cómo se presenta:
Antes de cada cuenta se dice un número aproximado en voz alta y se escribe al costado. Recién después se calcula. Lo modelás dos veces vos: 48 por 21 va a dar cerca de mil, porque es como 50 por 20.
Ejercicio 1, redondear para estimar:
• 48 + 37 es como 50 + 40, o sea cerca de 90.
• 312 - 198 es como 300 - 200, o sea cerca de 100.
• 48 x 21 es como 50 x 20, o sea cerca de 1000.
• 597 : 3 es como 600 : 3, o sea cerca de 200.
Ejercicio 2, estimar y después calcular:
Ocho cuentas, en dos columnas:
• 68 + 45 · 402 - 189 · 29 x 11 · 812 : 4
• 57 + 38 · 703 - 298 · 19 x 21 · 356 : 5
Ejercicio 3, cazar el error:
Estas están resueltas, y tres están mal. Hay que encontrarlas estimando, sin hacer la cuenta.
• 48 + 37 = 85 · 312 - 198 = 214 · 25 x 4 = 1000 · 96 : 4 = 24 · 199 + 199 = 498
Progresión:
• Si sale fácil: estimar con decimales y con precios reales de un ticket de supermercado.
• Si no sale: estimar con decenas enteras y números de dos cifras, y decir sólo si va a ser más o menos que cien.
Qué mirar:
Si estima o calcula rápido y dice que estimó, si la estimación queda cerca, si usa la estimación para revisar. Criterio: las tres cuentas erradas encontradas sin calcular.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Y la estimación se pide siempre, en toda cuenta de toda sesión.
Para casa:
En el supermercado, estimar el total antes de la caja. Se anota el número y se compara con el ticket.'),

  (null, 'psychopedagogy', 'Matemática', 'Cálculo escrito', 'Sumas con reserva, sin perder la que se lleva', 'worksheet', 'Sumar en columna con reserva entendiendo qué es lo que se lleva y por qué', '8-9 años', 'Para qué sirve:
La suma llevando falla por dos motivos distintos: no entender qué es lo que se lleva, o entenderlo y perderlo en el camino. El primero se arregla con material, el segundo con un lugar fijo para anotarlo.
Qué necesitás:
Hoja cuadriculada, lápiz, y material de base diez o palitos en manojos.
Cómo se presenta:
Primero con material: se suman las unidades, y cuando pasan de diez se atan diez y se mudan a la columna del lado. Recién después la misma cuenta en la hoja. La mudanza tiene que verse una vez para que el número chiquito de arriba signifique algo.
Ejercicio 1, con material y en la hoja a la vez:
Resolver 27 + 15 con los palitos y anotando cada paso al lado.
• Siete más cinco es doce: son un manojo de diez y dos sueltos.
• El manojo se muda arriba de las decenas. Ese es el uno que se lleva.
• Dos más uno más uno, tres decenas. Total 42.
Ejercicio 2, la columna con el cuadriculado:
Un dígito por cuadrito y la reserva siempre arriba, en el mismo lugar.
• 27 + 15 · 48 + 36 · 59 + 27 · 145 + 38 · 276 + 148
Ejercicio 3, encontrar el error del otro:
Estas cuatro están resueltas y dos están mal. Hay que decir qué pasó, no sólo corregir.
• 38 + 25 = 513 (sumó sin llevar y pegó los dos resultados)
• 47 + 16 = 63 (bien)
• 59 + 28 = 77 (se perdió la reserva)
• 146 + 37 = 183 (bien)
Progresión:
• Si sale fácil: tres sumandos, y sumas con reserva en dos columnas seguidas.
• Si no sale: volvé al material y a dos cifras, y usá hoja cuadriculada con las columnas pintadas de colores distintos.
Qué mirar:
Si alinea las columnas, dónde anota la reserva, si la pierde en el paso siguiente, si el resultado tiene una cifra de más. Criterio: cinco cuentas seguidas bien, con la reserva anotada en su lugar.
Cuánto y cada cuánto:
Quince minutos, tres veces por semana, cinco cuentas por vez. Cinco bien enseñan más que veinte peleadas.
Para casa:
Cinco cuentas en hoja cuadriculada, corregidas juntos el mismo día. Si hay error, que diga qué pasó antes de rehacerla.'),

  (null, 'psychopedagogy', 'Matemática', 'Cálculo escrito', 'Restas llevando, con el cero adelante', 'worksheet', 'Restar en columna con canje, incluidos los casos con cero, entendiendo de dónde sale lo que se presta', '8-9 años', 'Para qué sirve:
La resta con canje es el punto donde más chicos se caen, y casi siempre por el mismo lugar: el cero del medio. Si el canje se entiende con material, el cero deja de ser un caso especial.
Qué necesitás:
Hoja cuadriculada, lápiz, material de base diez o palitos en manojos.
Cómo se presenta:
Con material primero: no alcanzan las unidades, así que se desata un manojo de diez y pasa a la columna de las unidades. Desatar es la palabra: el canje es eso y nada más. Después la misma cuenta escrita.
Ejercicio 1, con material y escrito al lado:
Resolver 42 - 17 con los palitos.
• Dos menos siete no se puede.
• Se desata un manojo de las decenas: quedan tres decenas y doce unidades.
• Doce menos siete, cinco. Tres menos uno, dos. Total 25.
Ejercicio 2, las cuentas en columna:
• 42 - 17 · 63 - 28 · 81 - 45 · 154 - 76 · 232 - 158
Ejercicio 3, el cero en el medio:
Este es el caso difícil y se hace aparte, con material la primera vez.
• 100 - 37 · 204 - 68 · 300 - 145 · 502 - 89
La frase que ayuda: no hay decenas para desatar, así que primero se desata una centena.
Progresión:
• Si sale fácil: restas de cuatro cifras, y comprobar cada resta sumando el resultado con lo que se restó.
• Si no sale: quedate en dos cifras con material, y usá la estrategia de contar para arriba (de 17 a 42) como camino alternativo.
Qué mirar:
Si resta el chico del grande sin importar el orden (7 menos 2 en lugar de 12 menos 7), si el cero lo detiene, si comprueba. Criterio: cuatro de cinco bien, y dos de las del cero resueltas sin material.
Cuánto y cada cuánto:
Quince minutos, tres veces por semana, cinco cuentas por vez y de a un tipo.
Para casa:
Tres restas por día, corregidas el mismo día, y la comprobación con la suma siempre. La comprobación hace que se dé cuenta solo.'),

  (null, 'psychopedagogy', 'Matemática', 'Cálculo escrito', 'Multiplicar por dos cifras', 'worksheet', 'Resolver la multiplicación de dos cifras entendiendo por qué el segundo renglón se corre', '10-11 años', 'Para qué sirve:
El corrimiento del segundo renglón es un misterio para casi todos los chicos que aprenden el algoritmo de memoria: corren un lugar porque les dijeron. Cuando se ve que ese renglón es la multiplicación por decenas, deja de olvidarse.
Qué necesitás:
Hoja cuadriculada, lápiz, la tabla pitagórica a la vista.
Cómo se presenta:
Primero se resuelve descomponiendo, sin algoritmo: 23 x 14 es 23 x 10 más 23 x 4. Se calculan las dos partes y se suman. Después se muestra que el algoritmo es exactamente eso, escrito de otra manera.
Ejercicio 1, descomponer antes del algoritmo:
• 23 x 14 = (23 x 10) + (23 x 4) = 230 + 92 = 322
• 35 x 12 = (35 x 10) + (35 x 2) = __ + __ = __
• 46 x 21 = (46 x 20) + (46 x 1) = __ + __ = __
Ejercicio 2, el algoritmo al lado de la descomposición:
La misma cuenta de las dos formas, una al lado de la otra, y la pregunta: ¿qué número del algoritmo es el 230? Ahí se entiende el corrimiento.
• 23 x 14 · 35 x 12 · 46 x 21
Ejercicio 3, cinco con el algoritmo y estimación previa:
Antes de cada una, la estimación. Después la cuenta.
• 27 x 13 · 48 x 22 · 56 x 31 · 19 x 24 · 73 x 15
Progresión:
• Si sale fácil: tres cifras por dos, y multiplicaciones con cero en el multiplicador (30 x 24).
• Si no sale: quedate en la descomposición, que da el mismo resultado y es correcta. El algoritmo puede esperar.
Qué mirar:
Si corre el segundo renglón, si sabe por qué, si pierde la reserva, si la tabla lo frena más que el algoritmo. Criterio: cuatro de cinco bien con estimación previa, dos sesiones seguidas.
Cuánto y cada cuánto:
Veinte minutos, tres veces por semana, cinco cuentas por vez.
Para casa:
Tres por día, con la tabla pitagórica al lado. Si el error es de tabla y no de algoritmo, se anota aparte: son dos cosas distintas.'),

  (null, 'psychopedagogy', 'Matemática', 'Cálculo escrito', 'La división por una cifra', 'worksheet', 'Dividir por una cifra sabiendo qué significa cada paso, y comprobar el resultado', '10-11 años', 'Para qué sirve:
La división es el algoritmo más largo y el que más pasos tiene para olvidarse. Si cada paso tiene un nombre y el resultado se comprueba, el chico puede encontrar solo dónde se equivocó en lugar de rehacer todo.
Qué necesitás:
Hoja cuadriculada, lápiz, tabla pitagórica a la vista.
Cómo se presenta:
Primero con reparto real: 48 caramelos entre 3 chicos, con tapitas. Después el algoritmo, nombrando los cuatro pasos en voz alta en cada cifra: cuántas veces entra, multiplico, resto, bajo.
Ejercicio 1, el reparto con material:
Repartir 48 tapitas entre 3 pilas, de a diez primero y después de a una. Se cuenta lo que quedó en cada pila: 16. Después se hace la cuenta escrita y se compara.
Ejercicio 2, los cuatro pasos, dichos en voz alta:
• 48 : 3 · 96 : 4 · 84 : 6 · 75 : 5
En cada cifra, la cadena completa: cuántas veces entra, multiplico, resto, bajo. Decirla es lo que evita saltear el resto.
Ejercicio 3, con resto y con comprobación:
• 47 : 4 · 59 : 5 · 83 : 6 · 137 : 4
La comprobación es obligatoria: cociente por divisor más resto tiene que dar el dividendo. Si no da, el error está en la cuenta y lo busca él.
Progresión:
• Si sale fácil: dividendos de cuatro cifras, y cocientes con cero en el medio (612 : 3), que es el caso que confunde.
• Si no sale: volvé al reparto con material y a dividendos de dos cifras sin resto.
Qué mirar:
Si saltea el resto, si baja la cifra siguiente, si el cociente tiene la cantidad de cifras razonable, si comprueba. Criterio: tres de cuatro con resto bien y comprobadas por él.
Cuánto y cada cuánto:
Veinte minutos, tres veces por semana, cuatro cuentas por vez. Es la que más cansa: no conviene estirarla.
Para casa:
Dos divisiones por día, siempre con la comprobación escrita abajo. Sin comprobación no cuentan.'),

  (null, 'psychopedagogy', 'Matemática', 'Resolución de problemas', 'Problemas del kiosco', 'worksheet', 'Resolver problemas de la vida diaria con dinero, de uno y de dos pasos', '6-7 años', 'Para qué sirve:
Los problemas con plata del kiosco son los primeros que tienen sentido para un chico, y el sentido es lo que sostiene el cálculo: nadie se pierde en cuánto le queda del vuelto.
Qué necesitás:
Hoja, lápiz y monedas o billetes de juguete. Las monedas de verdad funcionan mejor.
Cómo se presenta:
El primer problema se actúa con las monedas: vos sos el del kiosco y él compra. Después se escribe lo que pasó. El orden importa: primero la escena, después la cuenta.
Ejercicio 1, de un paso, actuados con monedas:
• Juana tiene 50 pesos y compra un alfajor de 20. ¿Cuánto le queda?
• Un chupetín sale 15 pesos. ¿Cuánto salen dos?
• Pedro tiene 40 pesos y quiere algo de 60. ¿Cuánto le falta?
Ejercicio 2, de dos pasos:
Acá hay que hacer dos cuentas, y el error típico es contestar después de la primera.
• Juana tiene 100 pesos. Compra un alfajor de 20 y un jugo de 35. ¿Cuánto le queda?
• En el kiosco hay 24 chupetines. Se venden 9 a la mañana y 7 a la tarde. ¿Cuántos quedan?
Ejercicio 3, el problema al revés:
Le das el resultado y tiene que inventar el problema: la respuesta es 30 pesos. Inventá una compra que dé eso. Inventar muestra si entendió la estructura.
Progresión:
• Si sale fácil: tres pasos, y problemas donde falta un dato y hay que decir cuál.
• Si no sale: un solo paso, con las monedas en la mano y sin escribir nada.
Qué mirar:
Si contesta con la primera cuenta en los de dos pasos, si elige la operación por las palabras (le queda, le falta) o por la escena, si el resultado es razonable. Criterio: dos de dos pasos resueltos completos, dos sesiones seguidas.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Dos o tres problemas por vez, no una hoja entera.
Para casa:
Que pague él en el kiosco o en la panadería y calcule el vuelto antes de recibirlo. Una vez por semana alcanza.'),

  (null, 'psychopedagogy', 'Matemática', 'Resolución de problemas', 'Leer el problema antes de calcular', 'guide', 'Aplicar un procedimiento fijo de cuatro pasos antes de elegir la operación', '8-9 años', 'Para qué sirve:
El chico que ve dos números y suma no tiene un problema de cálculo: no leyó. Un procedimiento fijo de cuatro pasos, siempre el mismo, es lo que frena la cuenta automática.
Qué necesitás:
El problema impreso con espacio para escribir, lápiz de color y el cartel de los cuatro pasos.
Cómo se presenta:
La primera vez hacés vos los cuatro pasos en voz alta, incluido equivocarte y volver. Después uno juntos. Después solo, con el cartel a la vista.
Ejercicio 1, los cuatro pasos:
• Leer y tapar el problema: contarlo con mis palabras sin mirar.
• Subrayar la pregunta, no los números.
• Marcar los datos que sirven, y tachar los que no.
• Estimar: más o menos cuánto va a dar. Después calcular.
Ejercicio 2, aplicarlos a estos tres:
• En el ómnibus viajaban 34 personas. En la primera parada bajaron 12 y subieron 9. ¿Cuántas viajan ahora?
• Una caja trae 6 alfajores. La maestra compró 4 cajas para 20 chicos. ¿Alcanza para todos?
• Martín tiene 8 años y su hermana tiene el doble. ¿Cuántos años tiene la hermana?
Ejercicio 3, contar el problema sin los números:
Se lee el problema y lo cuenta sin decir ninguna cifra: había gente en un ómnibus, bajaron algunos y subieron otros, y quiero saber cuántos hay. Si puede contarlo así, la operación aparece sola.
Progresión:
• Si sale fácil: problemas con datos de más y problemas donde falta un dato.
• Si no sale: problemas de un paso, y vos leyendo en voz alta mientras él tapa los números con el dedo.
Qué mirar:
Si subraya la pregunta, si tacha datos, si su estimación es razonable, si suma por defecto. Criterio: los cuatro pasos hechos sin que se los recuerdes, en dos problemas seguidos.
Cuánto y cada cuánto:
Veinte minutos, dos o tres veces por semana. Dos problemas bien trabajados por sesión.
Para casa:
Un problema por día de los de la escuela, con los cuatro pasos escritos. Si los pasos están y la cuenta salió mal, está bien igual.'),

  (null, 'psychopedagogy', 'Matemática', 'Resolución de problemas', 'Problemas de dos pasos', 'worksheet', 'Reconocer que un problema pide dos operaciones y escribir la pregunta intermedia', '8-9 años', 'Para qué sirve:
El problema de dos pasos se falla por contestar a la mitad. Lo que lo arregla es hacer visible la pregunta del medio: qué necesito saber antes de poder contestar lo que me preguntan.
Qué necesitás:
Hoja con dos recuadros por problema, uno para cada paso, y lápiz.
Cómo se presenta:
Mostrás la pregunta intermedia en uno resuelto: para saber cuánto le queda, primero tengo que saber cuánto gastó. Esa frase, con el primero, con el segundo y con el tercero, hasta que la diga él.
Ejercicio 1, escribir sólo la pregunta del medio:
No se resuelve nada todavía: sólo se escribe qué hay que averiguar primero.
• Compré 3 cuadernos de 90 pesos cada uno y pagué con 500. ¿Cuánto vuelto me dieron?
• Hay 5 mesas con 4 sillas cada una y se llevaron 6 sillas. ¿Cuántas quedaron?
• Leí 25 páginas el lunes y 18 el martes. El libro tiene 100. ¿Cuántas me faltan?
Ejercicio 2, los dos recuadros:
Primer recuadro, la cuenta del medio y su resultado. Segundo recuadro, la cuenta final. La respuesta se escribe con una oración completa, no con un número solo.
Ejercicio 3, el problema trampa:
Este es de un solo paso, aunque tenga tres números. Hay que darse cuenta y decirlo.
• En el estante hay 4 libros de 200 páginas y me leí 3 libros. ¿Cuántos libros me quedan?
Progresión:
• Si sale fácil: tres pasos, y problemas donde el resultado del medio no se pide pero hay que usarlo dos veces.
• Si no sale: vos escribís la pregunta del medio y él sólo resuelve las dos cuentas.
Qué mirar:
Si contesta con el resultado intermedio, si escribe la pregunta del medio sola, si detecta el trampa. Criterio: dos problemas con la pregunta intermedia escrita por él y la respuesta en oración.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana, dos o tres problemas por vez.
Para casa:
Un problema de dos pasos por día, con los dos recuadros. La familia no corrige la cuenta: pregunta qué había que saber primero.'),

  (null, 'psychopedagogy', 'Matemática', 'Resolución de problemas', 'Problemas con datos de más y de menos', 'worksheet', 'Decidir qué datos sirven, qué datos sobran y cuándo falta uno para poder resolver', '10-11 años', 'Para qué sirve:
En la vida los problemas vienen con datos que no sirven, y a veces sin el dato que hace falta. Un chico entrenado sólo con problemas perfectos usa todos los números que ve, siempre.
Qué necesitás:
Los problemas impresos, dos colores de lápiz.
Cómo se presenta:
Se marca con verde lo que sirve y se tacha con rojo lo que sobra, antes de calcular. La primera vez lo hacés vos y te equivocás a propósito en uno, para que él te corrija.
Ejercicio 1, datos que sobran:
Tachar lo que no se usa y después resolver.
• Lucía tiene 11 años y compró 3 kilos de manzana a 80 pesos el kilo. La feria abre a las 8. ¿Cuánto gastó?
• Un ómnibus con 40 asientos lleva 28 pasajeros y tarda 50 minutos. ¿Cuántos asientos quedan libres?
Ejercicio 2, falta un dato:
Estos no se pueden resolver. Hay que decir qué dato falta, y no inventarlo.
• Pagué 350 pesos por varios cuadernos. ¿Cuánto salió cada uno?
• El equipo ganó 4 partidos. ¿Cuántos jugó?
Ejercicio 3, inventar el dato que falta y resolver:
Ahora sí: se elige un dato razonable, se escribe, y se resuelve con ése. Y se dice en voz alta que la respuesta depende del dato que él eligió.
Progresión:
• Si sale fácil: problemas con dos datos que sobran y uno que falta a la vez.
• Si no sale: problemas con un solo dato de más, y vos preguntando de cada número si sirve.
Qué mirar:
Si usa todos los números por costumbre, si puede decir "no se puede saber", si defiende por qué un dato sobra. Criterio: dos problemas con datos tachados correctamente y los dos incompletos identificados.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana, tres problemas por vez.
Para casa:
Un problema por semana de este tipo. Y en la conversación, cuando alguien diga un número que no sirve, notarlo juntos.'),

  (null, 'psychopedagogy', 'Matemática', 'Resolución de problemas', 'Fracciones de la pizza', 'worksheet', 'Comparar fracciones sencillas con apoyo gráfico y resolver problemas de partes de un entero', '10-11 años', 'Para qué sirve:
La fracción se rompe cuando se enseña como dos números sueltos. Con la pizza se ve lo que hay que ver: que el de abajo dice en cuántas partes se cortó, y que cuanto más grande es, más chica es cada parte.
Qué necesitás:
Círculos de papel para cortar, tijera, lápices de color. Y una pizza de verdad alguna vez, si se puede.
Cómo se presenta:
Se cortan los círculos de verdad: en dos, en cuatro, en ocho. Se apoyan uno sobre otro para comparar. Se escribe recién cuando el papel ya mostró que un octavo es más chico que un cuarto.
Ejercicio 1, cortar y comparar:
• Cortar un círculo en 2, otro en 4 y otro en 8.
• Apoyar un medio, un cuarto y un octavo uno sobre otro. ¿Cuál es más grande?
• ¿Cuántos cuartos hacen un medio? ¿Cuántos octavos hacen un cuarto?
Ejercicio 2, pintar y escribir la fracción:
Se pintan las partes pedidas y se escribe la fracción al lado: un medio, tres cuartos, dos tercios, cinco octavos. Y la pregunta de control: ¿cuánto falta para la pizza entera?
Ejercicio 3, los problemas:
• Pedimos una pizza de 8 porciones. Yo comí 3 y mi hermano 2. ¿Cuánto queda?
• Éramos 4 y nos comimos media pizza cada uno. ¿Cuántas pizzas pedimos?
• Un cuarto de pizza cuesta 120 pesos. ¿Cuánto cuesta la pizza entera?
Progresión:
• Si sale fácil: fracciones equivalentes con el papel (dos cuartos es un medio) y sumas de igual denominador.
• Si no sale: quedate en medios y cuartos, sólo con el papel, sin escribir fracciones.
Qué mirar:
Si cree que un octavo es más grande que un cuarto porque ocho es más que cuatro, si puede decir cuánto falta para el entero, si el gráfico lo resuelve y el número no. Criterio: las tres comparaciones bien y dos problemas resueltos con dibujo.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana, con material concreto las primeras tres semanas.
Para casa:
Repartir algo de verdad: una pizza, una tarta, una chocolatina. Y decir en voz alta qué fracción le tocó a cada uno.'),

  (null, 'psychopedagogy', 'Matemática', 'Geometría', 'Figuras por sus lados y sus vértices', 'worksheet', 'Reconocer figuras planas por la cantidad de lados y vértices, y no por su aspecto', '6-7 años', 'Para qué sirve:
Un chico que reconoce el triángulo sólo cuando está apoyado en la base no reconoce triángulos: reconoce un dibujo. La figura se define por los lados y los vértices, y eso se cuenta con el dedo.
Qué necesitás:
Palitos de helado o escarbadientes, plastilina para los vértices, hoja y lápiz.
Cómo se presenta:
Se arman las figuras con palitos y bolitas de plastilina, contando en voz alta los lados y los vértices. Después se dibujan. Armar antes de dibujar es lo que saca el reconocimiento por aspecto.
Ejercicio 1, armar y contar:
• Triángulo: 3 palitos, 3 bolitas.
• Cuadrado: 4 palitos iguales, 4 bolitas.
• Rectángulo: 4 palitos, dos largos y dos cortos.
• Pentágono: 5 palitos, 5 bolitas.
Ejercicio 2, la misma figura girada:
Se gira el triángulo armado y se apoya en un vértice. ¿Sigue siendo triángulo? Se dibuja así, apoyado en la punta. Después el cuadrado girado, que parece un rombo y no lo es.
Ejercicio 3, unir la figura con su nombre y su número:
En la hoja, tres columnas: el dibujo, el nombre, la cantidad de lados.
• triángulo, cuadrado, rectángulo, círculo, pentágono
• 3 lados, 4 lados iguales, 4 lados, ningún lado, 5 lados
Y una pregunta más: ¿cuántos vértices tiene cada una?
Progresión:
• Si sale fácil: cuerpos con cajas y cuerpos redondos, contando caras y aristas.
• Si no sale: quedate en triángulo y cuadrado, armados con palitos, hasta que los cuente sin ayuda.
Qué mirar:
Si cuenta los lados o reconoce de memoria, si la figura girada lo confunde, si llama cuadrado a cualquier cosa de cuatro lados. Criterio: cinco figuras nombradas con su cantidad de lados, y el triángulo girado reconocido.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana, con palitos las primeras semanas.
Para casa:
Buscar figuras en la casa: la ventana, la baldosa, la señal de la esquina. Contar los lados con el dedo, en el aire.'),

  (null, 'psychopedagogy', 'Matemática', 'Geometría', 'Perímetro con los pasos y con la regla', 'activity', 'Medir el contorno de una figura entendiendo que el perímetro es la suma de los lados', '8-9 años', 'Para qué sirve:
El perímetro se olvida cuando es una fórmula. Si primero se camina el contorno de la habitación contando pasos, la idea queda: es lo que mide dar la vuelta alrededor.
Qué necesitás:
Cinta métrica o regla, hoja, lápiz. Y espacio para caminar.
Cómo se presenta:
Se camina el borde de la mesa o de la habitación contando pasos, y se anota. Después se mide con la cinta. Después se pasa a la hoja. Ese es el orden y no conviene saltearlo.
Ejercicio 1, medir con el cuerpo y con la cinta:
• Dar la vuelta a la mesa contando pasos, y anotar.
• Medir cada lado con la cinta y sumar los cuatro.
• Comparar: los pasos y los centímetros miden lo mismo con dos unidades distintas.
Ejercicio 2, perímetros en la hoja:
Figuras dibujadas con los lados marcados, y hay que sumar.
• Rectángulo de 5 cm y 3 cm: perímetro __
• Cuadrado de 4 cm de lado: perímetro __
• Triángulo de 6, 6 y 4 cm: perímetro __
• Figura en forma de L con lados de 2, 3, 2, 1, 4 y 4 cm: perímetro __
La L es la importante: no hay fórmula, hay que sumar.
Ejercicio 3, al revés, el lado que falta:
• Un cuadrado tiene perímetro 20 cm. ¿Cuánto mide cada lado?
• Un rectángulo tiene perímetro 16 cm y un lado de 5 cm. ¿Cuánto mide el otro?
Progresión:
• Si sale fácil: comparar dos figuras de igual perímetro y distinta forma, que es la puerta al área.
• Si no sale: quedate en sumar los lados marcados, sin figuras irregulares y sin problemas al revés.
Qué mirar:
Si suma todos los lados o sólo dos, si en el cuadrado multiplica por cuatro entendiendo por qué, si se pierde en la figura irregular. Criterio: los cuatro perímetros bien y uno de los problemas al revés.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana, siempre midiendo algo real al empezar.
Para casa:
Medir el perímetro de su cuarto o de la cama con la cinta, y anotarlo. Una medición por semana.'),

  (null, 'psychopedagogy', 'Matemática', 'Geometría', 'Área: cuántos cuadraditos entran', 'worksheet', 'Entender el área como cantidad de unidades que cubren una superficie, antes de usar la fórmula', '10-11 años', 'Para qué sirve:
Confundir área con perímetro es el error más repetido de la geometría escolar. Se separa de una sola forma: el perímetro se camina, el área se cubre. Y para cubrir hay que contar cuadraditos.
Qué necesitás:
Hoja cuadriculada, lápiz de color, tijera. Y baldosas o azulejos para mirar.
Cómo se presenta:
Se dibuja un rectángulo en la cuadriculada y se pintan los cuadraditos de adentro uno por uno, contándolos. Recién cuando aparece el aburrimiento se pregunta si no hay una forma más rápida: ahí sale la multiplicación, de él.
Ejercicio 1, contar cuadraditos:
Dibujar en la cuadriculada y contar el interior.
• Rectángulo de 4 por 3: __ cuadraditos
• Rectángulo de 5 por 2: __ cuadraditos
• Cuadrado de 4 por 4: __ cuadraditos
Después: ¿se puede saber sin contar todos? ¿Cómo?
Ejercicio 2, área y perímetro de la misma figura:
Para cada una, las dos medidas, en dos columnas, con las palabras cubrir y caminar al lado.
• Rectángulo de 6 por 2 · Rectángulo de 4 por 3 · Cuadrado de 5 por 5
Ojo con el primer par: 6 por 2 y 4 por 3 tienen la misma área y distinto perímetro. Es la mejor pregunta de todo el material.
Ejercicio 3, figuras compuestas:
Una figura en L formada por dos rectángulos. Se corta en dos con una línea, se calcula cada parte y se suman. Cortar la figura es la estrategia, y conviene nombrarla.
Progresión:
• Si sale fácil: áreas en metros cuadrados con medidas reales del cuarto, y triángulos como la mitad de un rectángulo.
• Si no sale: sólo contar cuadraditos, sin fórmula, y sin mezclar con perímetro todavía.
Qué mirar:
Si suma los lados cuando le piden área, si llega solo a la multiplicación, si puede explicar la diferencia con sus palabras. Criterio: dos figuras con área y perímetro bien diferenciados, y la L resuelta cortándola.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana. La cuadriculada se usa siempre, incluso cuando ya sabe la fórmula.
Para casa:
Contar las baldosas del piso de la cocina para saber su área. Y después medirla con la cinta, y comparar.')
on conflict (title) where practitioner_id is null do update set
  discipline = excluded.discipline, area = excluded.area, focus = excluded.focus,
  kind = excluded.kind, objective = excluded.objective,
  age_range = excluded.age_range, content = excluded.content;

-- ─── Atención ───────────────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychopedagogy', 'Atención', 'Atención sostenida', 'Unir del 1 al 20 sin perder el hilo', 'worksheet', 'Sostener la atención en una secuencia larga y volver al punto donde se estaba después de una interrupción', '6-7 años', 'Para qué sirve:
Seguir una secuencia larga pide mantener en la cabeza en qué número se estaba mientras los ojos buscan el siguiente. Es la misma habilidad que sostiene copiar del pizarrón sin perder el renglón.
Qué necesitás:
Hoja con los números desordenados (los escribís vos), lápiz y reloj.
Cómo se presenta:
Hacés vos los primeros cinco en voz alta, diciendo el número que buscás mientras lo buscás. Decirlo en voz alta es la estrategia: eso es lo que hay que enseñar, no la tarea.
Ejercicio 1, del 1 al 20 salteados en la hoja:
Escribí los números repartidos por toda la hoja, así:
• 3 · 7 · 1 · 14 · 9
• 5 · 2 · 11 · 18 · 6
• 4 · 20 · 8 · 15 · 12
• 10 · 17 · 13 · 19 · 16
Se unen con una línea, en orden, sin levantar el lápiz.
Ejercicio 2, con una interrupción a propósito:
A mitad de camino le hacés una pregunta cualquiera (qué comiste hoy) y tiene que contestar y volver. Volver al punto exacto es lo que se entrena acá, y es lo que pasa en el aula todo el tiempo.
Ejercicio 3, letras y números alternados:
Más difícil: 1, a, 2, b, 3, c, hasta el 8 y la h. Alternar obliga a sostener dos series a la vez.
Progresión:
• Si sale fácil: hasta el 40, o la versión de letras y números completa.
• Si no sale: hasta el 10, con los números en dos filas ordenadas de izquierda a derecha.
Qué mirar:
Si dice el número en voz alta, si vuelve al lugar después de la interrupción, si se saltea siempre en la misma zona de la hoja, cuánto tarda comparado con la vez anterior. Criterio: del 1 al 20 sin error y volviendo solo después de la interrupción.
Cuánto y cada cuánto:
De cinco a diez minutos, tres veces por semana, como calentamiento al empezar.
Para casa:
Buscar en el supermercado los números de los pasillos en orden, o los de las casas de la cuadra. Es la misma tarea sin hoja.'),

  (null, 'psychopedagogy', 'Atención', 'Atención sostenida', 'El cronómetro que se va estirando', 'activity', 'Estirar de a poco el tiempo de trabajo continuo, midiéndolo en lugar de exigirlo', '8-9 años', 'Para qué sirve:
Pedirle a un chico que se concentre media hora cuando aguanta seis minutos garantiza que fracase. Si se mide cuánto aguanta hoy y se estira de a un minuto, el progreso se ve y él lo ve.
Qué necesitás:
Reloj o cronómetro, una tarea aburrida pero fácil (cuentas que ya sabe, copiar una lista), y una hoja para anotar los tiempos.
Cómo se presenta:
Primero se mide sin pedir nada: trabajá hasta que te aburras y yo miro el reloj. Ese número es el punto de partida, y no se juzga. Después se acuerda el objetivo de la próxima vez: uno o dos minutos más.
Ejercicio 1, la medición inicial:
Se anota el tiempo hasta la primera distracción evidente: mirar para otro lado, hablar de otra cosa, levantarse. Sin retos y sin avisos. Tres mediciones en tres sesiones distintas, y se promedia.
Ejercicio 2, el objetivo de a un minuto:
Se pone el reloj a la vista con el objetivo acordado. Si llega, se anota y se festeja. Si no llega, el objetivo de la próxima es el mismo, no menos y no más.
Ejercicio 3, la pausa que se pide:
Se le enseña a pedir la pausa en lugar de irse: puedo parar un minuto. La pausa es de un minuto de reloj, y después se vuelve. Saber pedirla es lo que hace que el tiempo crezca.
Progresión:
• Si sale fácil: estirar el bloque hasta veinte minutos y pasar a una tarea que le cueste de verdad.
• Si no sale: bloques de tres minutos con pausa de uno, repetidos, en lugar de un bloque largo.
Qué mirar:
Cuánto aguanta, si la distracción viene de afuera o de adentro, si pide la pausa, si el tiempo mejora en dos semanas. Criterio: el bloque acordado completo en dos sesiones seguidas, después se estira.
Cuánto y cada cuánto:
Todas las sesiones, con la tarea que toque. No es una actividad aparte: es cómo se mide el trabajo de la sesión.
Para casa:
El mismo reloj para los deberes, con el tiempo que ya logró en sesión y no uno mayor. Y la pausa de un minuto permitida y avisada.'),

  (null, 'psychopedagogy', 'Atención', 'Atención sostenida', 'La lista de distracciones', 'worksheet', 'Identificar qué interrumpe el estudio y decidir por anticipado qué hacer con cada cosa', '12-14 años', 'Para qué sirve:
A esta edad ya se puede trabajar la atención desde afuera: no como fuerza de voluntad, sino como decisiones tomadas antes de sentarse. La distracción que uno anticipa es la mitad de una distracción.
Qué necesitás:
Hoja dividida en tres columnas, lápiz. Y el celular arriba de la mesa, que es parte del ejercicio.
Cómo se presenta:
No empieza con un consejo, empieza con un registro: anotar durante dos días qué lo cortó y cuántas veces. Con datos propios la conversación cambia y deja de ser un reto.
Ejercicio 1, el registro de dos días:
Una raya cada vez que se corta, y una palabra de qué fue. Nada más, sin cambiar nada todavía.
• Ejemplos que suelen aparecer: notificación, hermano, hambre, me acordé de algo, aburrimiento, música con letra.
Ejercicio 2, las tres columnas:
Cada distracción va a una columna, y eso define qué se hace.
• La saco de antes: celular en otro cuarto, agua y comida servidas, puerta cerrada.
• La anoto y sigo: las cosas que se me ocurren van a un papel al costado, y las miro después.
• La acepto: el ruido de la casa, el hermano chico. Con éstas se trabaja con auriculares o cambiando el horario.
Ejercicio 3, el plan de la próxima sesión de estudio:
Tres líneas escritas antes de empezar: qué voy a hacer, cuánto tiempo, y qué saqué de la mesa. Al terminar, una raya más si algo lo cortó igual.
Progresión:
• Si sale fácil: bloques de veinticinco minutos con pausa de cinco, y el registro sólo una vez por semana.
• Si no sale: una sola distracción por semana, la más frecuente, y nada más.
Qué mirar:
Si el registro es honesto, si puede clasificar sin justificarse, si baja la cantidad de interrupciones en dos semanas. Criterio: registro de dos días hecho por él y un cambio concreto sostenido una semana.
Cuánto y cada cuánto:
Veinte minutos para armarlo, y cinco minutos de revisión una vez por semana.
Para casa:
El plan de tres líneas antes de cada sesión de estudio. Escrito, aunque sea en el margen del cuaderno.'),

  (null, 'psychopedagogy', 'Atención', 'Atención sostenida', 'Estudiar en bloques, con el reloj de aliado', 'guide', 'Organizar el estudio de liceo en bloques con pausas planificadas, en lugar de sesiones largas y peleadas', '15+ años', 'Para qué sirve:
En liceo lo que falla no suele ser la capacidad de estudiar: es la organización del tiempo. Tres horas seguidas rinden menos que cuatro bloques con pausas, y además son las tres horas que no se empiezan nunca.
Qué necesitás:
Reloj o celular con temporizador, hoja para la lista, y un lugar fijo.
Cómo se presenta:
Se arma el primer bloque juntos, en sesión, y se hace ahí mismo: veinticinco minutos de trabajo real con vos al lado haciendo otra cosa. Que lo viva una vez vale más que explicarlo.
Ejercicio 1, el bloque de veinticinco y cinco:
• Antes de arrancar: una sola tarea escrita y el celular fuera de la mesa.
• Veinticinco minutos de reloj, sin cambiar de materia.
• Cinco de pausa, de pie y sin pantalla.
• Cuatro bloques seguidos y después una pausa larga.
Ejercicio 2, partir la materia en tareas de un bloque:
Estudiar historia no es una tarea. Leer y resumir dos páginas de historia sí. Se parte el programa de la prueba en tareas que quepan en un bloque, y se escriben en una lista.
Ejercicio 3, la lista de la semana de prueba:
Cuántos bloques hacen falta, cuántos caben por día, y en qué día va cada uno. Si no caben, algo se recorta a propósito y no por accidente el día antes.
Progresión:
• Si sale fácil: bloques de cuarenta minutos y repaso espaciado, volviendo a lo de hace tres días antes de lo nuevo.
• Si no sale: bloques de diez minutos. El largo importa menos que empezar.
Qué mirar:
Si completa el bloque, si la pausa se estira sola, si las tareas de la lista son del tamaño de un bloque, si arranca sin pelear. Criterio: cuatro bloques completos en un día, dos semanas seguidas.
Cuánto y cada cuánto:
Se revisa cinco minutos por sesión, y el resto pasa en la semana. Conviene mirar la lista juntos cada semana.
Para casa:
Empezar por un bloque por día, siempre a la misma hora y en el mismo lugar. El horario fijo hace más que la fuerza de voluntad.'),

  (null, 'psychopedagogy', 'Atención', 'Atención selectiva', 'Tachar el símbolo que se busca', 'worksheet', 'Buscar un objetivo entre distractores manteniendo la consigna, y revisar lo que quedó sin marcar', '6-7 años', 'Para qué sirve:
Buscar una cosa e ignorar el resto es lo que hace falta para encontrar la palabra en el renglón o el dato en la consigna. Y acá se ve limpio: cuántas encontró, cuántas se le pasaron y cuántas marcó de más.
Qué necesitás:
Hoja con una grilla de símbolos hecha a mano, lápiz y reloj.
Cómo se presenta:
Marcás vos los primeros tres explicando la estrategia: voy por renglón, de izquierda a derecha, y no salto. La estrategia se dice, porque sin ella la búsqueda es azarosa.
Ejercicio 1, la grilla y la consigna:
Escribí ocho renglones mezclando estas figuras: una cruz, un círculo, un cuadrado y un triángulo, dibujados a mano. Consigna: tachar sólo los triángulos.
Al final se cuentan los aciertos, las omisiones y los de más. Los tres números, no sólo el primero.
Ejercicio 2, dos condiciones a la vez:
Misma grilla, consigna nueva: tachar los triángulos y encerrar los círculos. Dos reglas a la vez cuestan mucho más que una.
Ejercicio 3, la revisión:
Vuelve a pasar la hoja buscando lo que se le pasó, con otro color. Revisar es una habilidad aparte y hay que pedirla explícitamente.
Progresión:
• Si sale fácil: grilla más densa, con reloj, o cambiar la consigna a mitad de hoja.
• Si no sale: grilla más chica, con más espacio entre símbolos y una sola figura distinta.
Qué mirar:
Si va renglón por renglón o salta, si se le pasan las de los bordes, si marca de más al final por cansancio, si revisa sin que se lo pidas. Criterio: quince de dieciséis en la de una condición, dos sesiones seguidas.
Cuánto y cada cuánto:
Diez minutos, dos o tres veces por semana. Una hoja por vez.
Para casa:
Buscar en una página de una revista todas las veces que aparezca una letra, y contarlas. Dos minutos, no más.'),

  (null, 'psychopedagogy', 'Atención', 'Atención selectiva', 'Igual o diferente, letra por letra', 'worksheet', 'Comparar pares parecidos detectando la diferencia, con una estrategia de comparación ordenada', '8-9 años', 'Para qué sirve:
Comparar dos cosas casi iguales es lo que se necesita para copiar bien del pizarrón, para revisar una cuenta y para no confundir b con d. La habilidad no es mirar más: es mirar en orden.
Qué necesitás:
Hoja con los pares impresos o escritos, lápiz.
Cómo se presenta:
Comparás vos el primer par en voz alta, señalando con el dedo de a un carácter: b, b, igual; d, d, igual. De a uno y de izquierda a derecha. Esa es la estrategia y tiene que quedar dicha.
Ejercicio 1, pares de letras y números:
Marcar igual o diferente. Los de números son los más difíciles.
• bdpq / bdpq
• 3287 / 3282
• lomo / lome
• casa / casa
• 5619 / 5619
• arbol / arbel
Ejercicio 2, pares largos:
Acá ya no alcanza la mirada, hay que ir de a uno.
• 4738291 / 4738921
• transporte / transpotre
• 90210456 / 90210456
Ejercicio 3, copiar y verificar:
Le das una lista de seis números de cuatro cifras. La copia. Después la verifica contra el original de a uno con el dedo, y marca lo que corrigió. Lo que se entrena es la verificación.
Progresión:
• Si sale fácil: pares con dos diferencias, o comparar con reloj.
• Si no sale: pares de tres caracteres y diferencias en la primera posición, que es la más fácil de ver.
Qué mirar:
Si señala con el dedo, si dice que son iguales sin revisar el final, si se apura. Criterio: seis de seis en los cortos y dos de tres en los largos, con estrategia visible.
Cuánto y cada cuánto:
Diez minutos, dos veces por semana. Combina bien después de una tarea de cálculo.
Para casa:
Verificar un número copiado de verdad: el de un documento, una dirección, un número de teléfono. Con el dedo y en voz alta.'),

  (null, 'psychopedagogy', 'Atención', 'Atención selectiva', 'Lo que importa entre lo que no', 'worksheet', 'Encontrar el dato relevante en un texto lleno de información que no hace falta', '8-9 años', 'Para qué sirve:
En la escuela casi nada viene limpio: el dato que sirve está entre otros diez que no. Un chico que no filtra lee todo con el mismo peso, se cansa y no encuentra.
Qué necesitás:
Textos cortos impresos, resaltador y lápiz.
Cómo se presenta:
Primero se lee la pregunta, después el texto. Ese orden es la estrategia entera: saber qué se busca antes de empezar a buscar. Lo mostrás dos veces y se lo hacés decir.
Ejercicio 1, la pregunta primero:
Texto: El martes la clase de quinto fue al museo. Salieron a las 9 en dos ómnibus, uno con 28 chicos y otro con 31. La entrada costaba 40 pesos por chico y volvieron a las 13.
• ¿Cuántos chicos fueron? Subrayá sólo lo que hace falta.
• ¿Cuánto tiempo estuvieron afuera? Subrayá sólo lo que hace falta.
La misma información, dos preguntas, dos subrayados distintos.
Ejercicio 2, el aviso clasificado:
Texto: Se alquila apartamento de dos dormitorios en Pocitos, cuarto piso con ascensor, gastos comunes 4.500, alquiler 28.000, se pide garantía, portero cuatro horas.
• ¿Cuánto hay que pagar por mes en total?
• ¿Sirve para alguien que no puede subir escaleras?
Ejercicio 3, la consigna de la escuela:
Traés una consigna real de su cuaderno y se subraya qué pide, cuántas cosas pide y con qué formato. Las consignas de tres partes son las que se contestan a medias.
Progresión:
• Si sale fácil: textos más largos y preguntas que necesitan dos datos de lugares distintos.
• Si no sale: textos de dos oraciones y una pregunta, con el dato subrayado por vos para que lo encuentre.
Qué mirar:
Si lee la pregunta primero, si subraya de más, si encuentra el dato del final o se queda con el primero que aparece. Criterio: dos textos con subrayado pertinente y las dos preguntas bien.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Conviene usar material real (avisos, consignas, folletos).
Para casa:
Buscar un dato en un folleto, un menú o una etiqueta. Uno por día, oral.'),

  (null, 'psychopedagogy', 'Atención', 'Atención selectiva', 'Leer la consigna hasta el final', 'worksheet', 'Identificar cuántas cosas pide una consigna antes de empezar a resolverla', '10-11 años', 'Para qué sirve:
Muchísimas pruebas se pierden por consignas hechas a medias, no por no saber. Contar cuántas cosas pide la consigna, antes de escribir, es un hábito de dos segundos que cambia la nota.
Qué necesitás:
Consignas impresas (inventadas y reales de su cuaderno), lápiz de color.
Cómo se presenta:
Antes de resolver, se numeran las cosas que la consigna pide, con círculos sobre los verbos. Lo hacés vos con la primera, marcando cada verbo: subrayá, escribí, explicá. Tres verbos, tres cosas.
Ejercicio 1, contar los pedidos:
Numerar cada cosa que se pide, sin resolver todavía.
• Leé el texto, subrayá las ideas principales y escribí un resumen de cinco renglones.
• Resolvé las cuentas, verificá los resultados y marcá con rojo las que te dieron mal.
• Observá la imagen, describila en tres oraciones y explicá qué te parece que pasó antes.
Ejercicio 2, la consigna trampa:
Estas piden algo escondido al final, que es donde nadie mira.
• Escribí cinco oraciones sobre el invierno usando en cada una una palabra con tilde.
• Dibujá el mapa, poné los nombres de los departamentos y firmá abajo con lápiz azul.
Ejercicio 3, resolver y verificar contra la consigna:
Resuelve una y después vuelve a la consigna con el dedo, tachando cada pedido cumplido. Volver a leer la consigna al final es la parte que hay que instalar.
Progresión:
• Si sale fácil: consignas de prueba reales, con tiempo medido, y autoverificación al final.
• Si no sale: consignas de dos pedidos, con los verbos ya marcados por vos.
Qué mirar:
Si cuenta los pedidos antes de empezar, si se le pierde el último, si vuelve a la consigna al terminar. Criterio: tres consignas numeradas bien por él y una resuelta con verificación final.
Cuánto y cada cuánto:
Diez minutos, dos veces por semana, y siempre con las consignas reales de la semana.
Para casa:
Antes de cada deber, numerar la consigna. Es lo único que se pide, y toma diez segundos.'),

  (null, 'psychopedagogy', 'Atención', 'Funciones ejecutivas', 'Mi plan del día', 'worksheet', 'Escribir un plan realista del día con tiempos, y compararlo al final con lo que pasó', '8-9 años', 'Para qué sirve:
Planificar se aprende comparando el plan con lo que pasó. Sin esa comparación, el chico planifica cinco tareas en una hora para siempre, porque nadie le mostró cuánto dura una hora.
Qué necesitás:
Hoja con tres columnas (qué, cuánto creo que tarda, cuánto tardó), lápiz y reloj.
Cómo se presenta:
Armás vos el plan de la sesión en esa hoja, en voz alta, y te equivocás en una estimación a propósito. Al final comparan y se ve el error. Que el error sea tuyo la primera vez baja mucho la resistencia.
Ejercicio 1, el plan de la sesión:
Tres tareas, con la estimación de cada una:
• Leer el texto: creo que 5 minutos.
• Las cuentas: creo que 10 minutos.
• El dibujo: creo que 5 minutos.
Ejercicio 2, medir y comparar:
Se anota el tiempo real de cada una. Después, las dos preguntas: ¿en cuál me pasé más? ¿qué pasó ahí?
Ejercicio 3, el plan de una tarde en casa:
Ahora con lo de la casa: deberes, merienda, jugar, ducha. Con horarios. Se lleva a casa y se trae la semana siguiente con lo que pasó de verdad anotado al lado.
Progresión:
• Si sale fácil: planificar dos días y meter un imprevisto a propósito, para practicar reacomodar.
• Si no sale: dos tareas, sin estimación de tiempo, sólo el orden.
Qué mirar:
Si sus estimaciones se acercan con la práctica, si planifica en el orden que le conviene o en el que le gusta, si tolera comparar. Criterio: tres estimaciones con menos de cinco minutos de diferencia, en dos sesiones.
Cuánto y cada cuánto:
Cinco minutos al empezar y cinco al cerrar, todas las sesiones. Es la rutina de la sesión, no una actividad.
Para casa:
El plan de la tarde en un papel pegado en la mesa, y una tilde en lo que se cumplió. Sin premio y sin reto: sólo la tilde.'),

  (null, 'psychopedagogy', 'Atención', 'Funciones ejecutivas', 'El cuaderno de deberes que sirve', 'guide', 'Armar un sistema de registro de tareas que el chico pueda sostener sin que nadie se lo recuerde', '8-9 años', 'Para qué sirve:
No anotar los deberes casi nunca es olvido: es que el sistema no existe o es demasiado complicado. Un sistema que se sostiene tiene tres características, y ninguna es la prolijidad.
Qué necesitás:
Su agenda o cuaderno de deberes, lápiz, y una hoja para el modelo.
Cómo se presenta:
Miran juntos cómo anota hoy y qué pasa con eso. Después se arma un formato nuevo, corto, y se prueba una semana entera antes de cambiarle nada.
Ejercicio 1, las tres reglas del sistema:
• Un solo lugar. Dos lugares es ninguno.
• Cada tarea con su fecha de entrega, no la fecha en que se dio.
• Una tilde al terminarla, para que se vea lo que falta.
Ejercicio 2, el formato de una línea:
Se practica escribiendo cinco tareas en el formato, rápido, como en clase cuando suena el timbre.
• Materia, qué hay que hacer, para qué día.
• Ejemplo: Matemática, página 34 ejercicios 1 a 5, para el jueves.
Ejercicio 3, la revisión de dos minutos:
Todos los días a la misma hora se abre el cuaderno y se hacen dos preguntas: ¿qué hay para mañana? ¿qué hay para esta semana? Se practica en sesión con su cuaderno real.
Progresión:
• Si sale fácil: sumar las pruebas y las entregas largas, con un aviso propio tres días antes.
• Si no sale: que anote sólo con dibujos o iniciales, o que le saque una foto al pizarrón y la copie en casa.
Qué mirar:
Si anota en clase o después, si la fecha es la de entrega, si hace la revisión sin que se la pidan, si el sistema sobrevive una semana. Criterio: cinco días seguidos con todo anotado y las tildes puestas.
Cuánto y cada cuánto:
Diez minutos, una vez por semana, revisando el cuaderno real. El resto pasa en la semana.
Para casa:
La revisión de dos minutos, a la misma hora, con alguien al lado las dos primeras semanas y solo después.'),

  (null, 'psychopedagogy', 'Atención', 'Funciones ejecutivas', 'Semáforo: pará y pensá', 'worksheet', 'Frenar antes de responder, con tres pasos que se pueden decir en voz alta', '8-9 años', 'Para qué sirve:
El chico que contesta antes de leer no es apurado por gusto: no tiene un freno. El semáforo le da uno con nombre y con tres pasos, y con el tiempo lo dice para adentro.
Qué necesitás:
Una hoja con el semáforo dibujado (tres círculos, rojo arriba), lápiz.
Cómo se presenta:
Se pinta el semáforo juntos y se practica en voz alta antes de cada tarea: rojo, paro. Amarillo, pienso qué me piden. Verde, arranco. Los primeros días lo decís vos y él lo repite.
Ejercicio 1, los tres pasos, en voz alta:
• Rojo: freno la mano. Nada de lápiz todavía.
• Amarillo: ¿qué me piden? ¿cuántas cosas? ¿cómo empiezo?
• Verde: hago el primer paso y nada más.
Ejercicio 2, aplicarlo a cinco tareas cortas:
Tareas donde apurarse hace fallar, para que el freno se note.
• 8 + 5 x 2 (la de la multiplicación primero)
• Escribí tres palabras que terminen en ón (no que empiecen)
• ¿Cuántos lados tiene un rombo? (no un rombo cualquiera: contá)
• Copiá esta serie al revés: 4 8 2 9
• Subrayá la palabra más larga de esta lista: casa, ventana, sol, mariposa, tren
Ejercicio 3, cuando ya se equivocó:
Se hace igual pero después: paro, leo qué me pedían, y veo qué hice. La comparación entre lo pedido y lo hecho, dicha en voz alta, sin reto.
Progresión:
• Si sale fácil: el semáforo para adentro, sin decirlo, y en tareas más largas.
• Si no sale: sólo el rojo. Frenar la mano dos segundos ya es el objetivo.
Qué mirar:
Si frena, si el amarillo es real o es una fórmula vacía, si lo usa cuando nadie lo mira. Criterio: cuatro de cinco tareas con el semáforo hecho sin que se lo recuerdes.
Cuánto y cada cuánto:
Se usa en toda la sesión, en cada tarea, dos semanas seguidas. No es una actividad de diez minutos.
Para casa:
El semáforo dibujado y pegado en la mesa donde hace los deberes. Y la familia lo nombra en lugar de retar: acordate del rojo.'),

  (null, 'psychopedagogy', 'Atención', 'Funciones ejecutivas', 'Tareas largas, en pedazos', 'guide', 'Partir un trabajo largo en pasos con fecha propia, para que dejen de hacerse la noche anterior', '10-11 años', 'Para qué sirve:
Un trabajo para dentro de dos semanas es invisible: no se ve hasta la noche anterior. Partirlo en pasos con fecha convierte una cosa enorme y lejana en cinco cosas chicas y cercanas.
Qué necesitás:
El trabajo real que le pidieron, hoja, lápiz y un calendario del mes a la vista.
Cómo se presenta:
Se hace con un trabajo de verdad, nunca con un ejemplo inventado. Partís vos el primero, en voz alta, y calculás para atrás desde la fecha de entrega. Calcular para atrás es la parte que no se le ocurre.
Ejercicio 1, partir en pasos:
Ejemplo con una maqueta del sistema solar para dentro de dos semanas.
• Buscar la información: 1 día.
• Hacer la lista de materiales: 1 día.
• Comprar o juntar los materiales: 2 días.
• Armar: 2 días.
• Escribir el cartel y revisar: 1 día.
Ejercicio 2, ponerle fecha a cada paso, para atrás:
Se empieza por la fecha de entrega y se va restando. Se escribe cada paso en el día que le toca del calendario, con lápiz.
Ejercicio 3, el primer paso, ahora:
El primer paso se empieza en la sesión, aunque sean cinco minutos. El primer paso hecho es lo que hace que el plan exista; un plan sin empezar se abandona.
Progresión:
• Si sale fácil: dos trabajos a la vez en el mismo calendario, y un día de colchón puesto a propósito.
• Si no sale: partir en tres pasos y poner fecha sólo al primero.
Qué mirar:
Si los pasos son del tamaño de un día, si calcula para atrás, si empieza el primero, si al mirar el calendario se ve que el plan se cumplió. Criterio: un trabajo entregado a tiempo con el plan a la vista.
Cuánto y cada cuánto:
Veinte minutos cuando aparece un trabajo largo, y cinco minutos de revisión por semana.
Para casa:
El calendario en la pared, con los pasos escritos. Y la pregunta de la familia una vez por semana: ¿cuál es el paso de hoy?'),

  (null, 'psychopedagogy', 'Atención', 'Funciones ejecutivas', 'Empezar cuando no dan ganas', 'activity', 'Reducir el costo de arrancar con reglas concretas, en lugar de esperar la motivación', '12-14 años', 'Para qué sirve:
Casi nadie posterga por vago: se posterga porque arrancar cuesta y porque la tarea, vista entera, es abrumadora. Lo que funciona no es motivación, son reglas que bajan el costo de los primeros dos minutos.
Qué necesitás:
Hoja, lápiz, reloj. Y una tarea real que esté postergando.
Cómo se presenta:
Se elige una tarea que esté evitando y se prueban las reglas ahí mismo, en sesión. Probar en el momento es la única forma: hablado en abstracto no se lleva a la casa.
Ejercicio 1, las cuatro reglas:
• Dos minutos: se empieza con el compromiso de dos minutos y después se puede parar. Casi nunca se para.
• El primer paso ridículo: no es estudiar historia, es abrir el libro en la página.
• Nada de limpiar antes: el escritorio se ordena después, no antes.
• Peor pero hecho: la primera versión puede ser mala. Mala y hecha le gana a perfecta y sin empezar.
Ejercicio 2, aplicarlas a la tarea que está evitando:
Se escribe la tarea, se escribe su primer paso ridículo, y se hace ese paso con el reloj en dos minutos. Se anota qué pasó después de los dos minutos: siguió o paró.
Ejercicio 3, la lista de primeros pasos:
Para las tres tareas pendientes de la semana, sólo el primer paso de cada una, escrito en una línea y en infinitivo. La lista no tiene tareas: tiene comienzos.
Progresión:
• Si sale fácil: sumar un horario fijo para la tarea más evitada, siempre el mismo día y la misma hora.
• Si no sale: bajar a dos minutos de verdad, con el reloj a la vista y vos en la sala haciendo otra cosa.
Qué mirar:
Si el primer paso que escribe es lo bastante chico, si después de dos minutos sigue, qué tarea evita siempre y por qué (no sabe hacerla, le da vergüenza, es aburrida). Criterio: tres tareas empezadas con la regla de los dos minutos en una semana.
Cuánto y cada cuánto:
Quince minutos por sesión, con tareas reales, mientras dure el problema.
Para casa:
Un solo primer paso por día, escrito la noche anterior. Escribirlo antes es la mitad del trabajo.'),

  (null, 'psychopedagogy', 'Atención', 'Memoria de trabajo', 'Qué había acá', 'game', 'Retener información visual el tiempo suficiente para compararla con lo que cambió', '6-7 años', 'Para qué sirve:
Sostener algo en la cabeza mientras se hace otra cosa es lo que permite copiar del pizarrón, seguir una consigna de tres pasos y resolver una cuenta de dos. Se entrena, y con objetos se ve.
Qué necesitás:
Seis a diez objetos chicos de la cartuchera o de la casa, y un pañuelo o una hoja para tapar.
Cómo se presenta:
Primero mirás vos y él saca un objeto, y adivinás vos en voz alta diciendo cómo te acordaste: estaba al lado de la goma. La estrategia (agrupar, nombrar, ubicar) es lo que hay que enseñar.
Ejercicio 1, qué falta:
Cinco objetos a la vista diez segundos. Se tapa, se saca uno, se destapa. ¿Qué falta?
Cuatro rondas, agregando un objeto por ronda si va saliendo.
Ejercicio 2, qué se movió:
Los mismos objetos, pero ahora no se saca ninguno: se cambian dos de lugar. Recordar posiciones es más difícil que recordar objetos.
Ejercicio 3, decirlos en orden:
Se muestran cuatro objetos en fila, se tapan, y tiene que nombrarlos en orden. Después al revés, que es bastante más difícil y es la versión que más se parece a lo que pide la escuela.
Progresión:
• Si sale fácil: más objetos, o más parecidos entre sí, o una pregunta en el medio para interferir.
• Si no sale: tres objetos, quince segundos de exposición, y nombrarlos en voz alta antes de tapar.
Qué mirar:
Cuántos objetos sostiene, si usa alguna estrategia, si el orden al revés lo desarma, si nombrarlos en voz alta lo ayuda. Criterio: seis objetos con uno faltante, acertado en tres rondas seguidas.
Cuánto y cada cuánto:
Diez minutos, dos o tres veces por semana, como juego de cierre.
Para casa:
El mismo juego con lo que hay en la mesa después de comer. Cinco objetos, dos rondas.'),

  (null, 'psychopedagogy', 'Atención', 'Memoria de trabajo', 'Repetir al revés', 'activity', 'Sostener una serie en la cabeza y manipularla, que es lo que exige la mayoría de las tareas escolares', '8-9 años', 'Para qué sirve:
Repetir al revés no es memoria sola: es memoria más manipulación, que es exactamente lo que pide una cuenta mental o una consigna de dos pasos. Y se puede medir con precisión, sin material.
Qué necesitás:
Nada. Una hoja para anotar hasta dónde llega.
Cómo se presenta:
Se explica con dos ejemplos hechos por vos, en voz alta, incluida la estrategia: los digo para adentro mientras los doy vuelta. Después se mide sin ayuda.
Ejercicio 1, números al derecho, para calibrar:
Decís la serie una vez, a un número por segundo, y él la repite igual.
• 4 7 2 · 8 1 5 9 · 3 6 2 7 4 · 9 2 8 5 1 6
Se anota hasta dónde llegó sin error.
Ejercicio 2, números al revés:
Misma cosa, pero al revés. Casi siempre son dos menos que al derecho, y está bien que sea así.
• 5 2 · 8 3 6 · 1 9 4 7 · 6 2 8 5 3
Ejercicio 3, palabras en orden alfabético:
Tres palabras dichas en desorden, para que las diga ordenadas: pera, ave, mesa. Sostener y ordenar a la vez.
• sol, árbol, mano · uva, pan, escuela · tren, brazo, silla
Progresión:
• Si sale fácil: sumar una consigna de tres pasos para hacer de memoria (tocá la mesa, después la silla, después la puerta).
• Si no sale: series de dos al revés, y permitirle contar con los dedos en el aire.
Qué mirar:
Cuánto sostiene al derecho y cuánto al revés, si usa alguna estrategia, si se frustra cuando se pierde. Criterio: cuatro al revés bien, tres veces seguidas.
Cuánto y cada cuánto:
Cinco a diez minutos, tres veces por semana. Corto: cansa mucho más de lo que parece.
Para casa:
Jugar en el auto con las patentes al revés. Dos o tres y se corta.'),

  (null, 'psychopedagogy', 'Atención', 'Memoria de trabajo', 'Tres consignas seguidas', 'activity', 'Escuchar varias instrucciones, retenerlas y ejecutarlas en orden sin que se las repitan', '10-11 años', 'Para qué sirve:
En clase las consignas vienen de a tres y se dicen una sola vez. El chico que sólo retiene la última no está distraído: le falta una estrategia para retener una cadena, y hay varias que se enseñan.
Qué necesitás:
Material de la mesa (hojas, lápices, tijera, regla) y una hoja para registrar.
Cómo se presenta:
Das las tres consignas una sola vez, seguidas, y él repite en voz alta antes de empezar. Repetir antes de hacer es la estrategia principal y hay que pedirla hasta que sea automática.
Ejercicio 1, tres consignas de acción:
Una sola vez, y repite antes de moverse.
• Doblá la hoja en cuatro, escribí tu nombre en el borde y ponela abajo del libro.
• Dibujá tres círculos, pintá el del medio y dejá los otros vacíos.
• Cerrá la cartuchera, apoyá la regla en la mesa y contame qué día es hoy.
Ejercicio 2, consignas con condición:
Ahora aparece un si, que obliga a retener también la regla.
• Si el número que digo es par, escribilo; si es impar, dibujá una raya. Números: 4, 7, 10, 3, 8.
• Escribí las palabras que digo, pero sólo las que empiezan con m: mesa, sol, mano, perro, mora.
Ejercicio 3, la cadena escrita al final:
Tres consignas orales y, recién al terminarlas, escribirlas de memoria. Hacer y después recordar es el nivel más difícil.
Progresión:
• Si sale fácil: cuatro consignas, o consignas dadas al principio de la sesión para ejecutar al final.
• Si no sale: dos consignas, y que las repita dos veces antes de empezar.
Qué mirar:
Si repite antes de hacer, si se le cae la del medio (es la que más se pierde), si pide que se las repitas. Criterio: tres consignas ejecutadas en orden, sin repetición, en tres intentos seguidos.
Cuánto y cada cuánto:
Diez minutos, dos veces por semana. Y en el resto de la sesión, dar las consignas de a tres a propósito.
Para casa:
Los mandados de la casa de a tres, dichos una sola vez, y que los repita antes de ir. Sin lista escrita.')
on conflict (title) where practitioner_id is null do update set
  discipline = excluded.discipline, area = excluded.area, focus = excluded.focus,
  kind = excluded.kind, objective = excluded.objective,
  age_range = excluded.age_range, content = excluded.content;
