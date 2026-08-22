-- Psicopedagogía, hasta llegar a 50.
--
-- El v1 traía 29, casi todos de Lectura y Escritura. Estos 21 completan las
-- áreas más flacas: funciones ejecutivas, producción de textos, numeración y
-- resolución de problemas.
--
-- Convenciones: subtítulo es una línea corta terminada en dos puntos, las
-- viñetas empiezan con •, y no hay rayas en el texto que lee la persona.

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychopedagogy', 'Atención', 'Funciones ejecutivas', 'Planificar antes de empezar', 'guide', 'Instalar el paso de planificación en tareas de varios pasos', '10-11 años', 'El problema:
Empezar por donde caiga y darse cuenta a la mitad de que faltaba algo.
Las cuatro preguntas, antes de tocar nada:
• ¿Qué me están pidiendo exactamente?
• ¿Qué necesito para hacerlo?
• ¿En qué orden lo hago?
• ¿Cuánto me va a llevar?
Cómo se practica:
Con tareas que no sean escolares primero. Armar una mochila, preparar una merienda, ordenar un cajón.
Lo que se escribe:
Los pasos, en una hoja, antes de empezar. Después se van tachando.
Al final:
Comparar cuánto tardó de verdad con lo que había estimado. La estimación mejora con repetición y es de lo que más se transfiere.'),

  (null, 'psychopedagogy', 'Atención', 'Funciones ejecutivas', 'Tareas largas, en pedazos', 'guide', 'Fraccionar una tarea extensa para que sea abordable', '10-11 años', 'Por qué:
Una tarea grande produce parálisis. Una lista de partes chicas, no.
Cómo se parte:
Se escribe la tarea y se divide en pedazos de veinte minutos como máximo.
Un ejemplo, para un trabajo de historia:
• Buscar tres fuentes.
• Leer la primera y anotar cinco datos.
• Leer la segunda y anotar cinco datos.
• Leer la tercera.
• Armar el índice.
• Escribir el primer punto.
Lo importante:
Cada pedazo tiene que terminar en algo terminado. Avanzar un rato no es un pedazo; anotar cinco datos sí.
Entre pedazo y pedazo:
Cinco minutos de pausa real, lejos de la mesa.
El primer pedazo:
Que sea el más fácil, no el más importante. Empezar es lo difícil.'),

  (null, 'psychopedagogy', 'Atención', 'Funciones ejecutivas', 'El cuaderno de deberes que sirve', 'guide', 'Organizar el registro de tareas para que no se olviden', '8-9 años', 'Por qué falla el que usa:
Porque anota qué hay que hacer y no cuándo hay que entregarlo, ni cuánto va a llevar.
Las cuatro columnas:
Materia. Qué hay que hacer. Para cuándo. Cuánto creo que me lleva.
La revisión, todos los días:
Al llegar a casa, mirar la lista y elegir el orden. No siempre lo más urgente primero: a veces conviene sacarse de encima lo corto.
Lo que se tacha:
Cada cosa terminada, con una línea. Ver la lista tachada importa.
Los viernes:
Mirar la semana siguiente y ver qué entregas vienen. Anticipar es lo que evita el domingo a la noche.
Quién lo revisa:
Al principio un adulto, con él. Después sólo pregunta si lo revisó.'),

  (null, 'psychopedagogy', 'Atención', 'Funciones ejecutivas', 'Empezar cuando no dan ganas', 'activity', 'Reducir la barrera de inicio en tareas postergadas', '12-14 años', 'De qué se trata:
Casi nunca cuesta la tarea. Cuesta empezarla.
Las estrategias, para probar y quedarse con dos:
• Los cinco minutos: se empieza con el compromiso de parar a los cinco. Casi siempre se sigue.
• El primer paso ridículo: abrir el cuaderno. Nada más que eso.
• Decir en voz alta qué se va a hacer, antes de hacerlo.
• Poner un cronómetro a la vista.
• Empezar por lo más fácil de la lista.
Lo que no funciona:
Esperar a tener ganas. Las ganas aparecen después de empezar, no antes.
Cómo se elige cuál sirve:
Se prueba una por semana y se anota si funcionó. Al mes quedan las dos que le sirven a él.'),

  (null, 'psychopedagogy', 'Atención', 'Atención sostenida', 'El cronómetro que se va estirando', 'activity', 'Ampliar el tiempo de trabajo continuo de forma progresiva', '8-9 años', 'Cómo se hace:
Se mide cuánto puede trabajar concentrado sin interrumpirse. Ese es el punto de partida, sea cual sea.
La progresión:
Si el punto de partida son seis minutos, la semana siguiente son siete. Después ocho.
Las reglas del bloque:
• Nada más sobre la mesa que lo que se usa.
• El celular fuera del cuarto, no dado vuelta.
• Si aparece una idea que distrae, se anota en un papel al lado y se sigue.
El papel al lado es clave:
Anotar la distracción la saca de la cabeza sin tener que atenderla.
La pausa:
Obligatoria, y lejos de la mesa.
Cuánto se puede llegar a estirar:
A los nueve años, veinte minutos ya es mucho.'),

  (null, 'psychopedagogy', 'Atención', 'Atención selectiva', 'Encontrar lo que importa entre lo que no', 'worksheet', 'Filtrar información relevante en medio de distractores', '8-9 años', 'Las actividades:
• Tachar todas las letras a en un texto, cronometrado.
• Buscar siete diferencias.
• En una lista de veinte palabras, marcar sólo las de animales.
• En un problema con datos de más, subrayar sólo los que se usan.
La última es la que más transfiere:
Un problema matemático con datos que sobran obliga a decidir qué mirar, que es lo mismo que hace falta en un texto largo.
Cómo se gradúa:
Más distractores, o distractores más parecidos a lo buscado.
Lo que hay que mirar:
Si va rápido y se saltea cosas, o si va tan despacio que no termina. Los dos son problemas distintos y se trabajan distinto.'),

  (null, 'psychopedagogy', 'Escritura', 'Producción de textos', 'Antes de escribir, la lluvia de ideas', 'guide', 'Separar el generar ideas del ordenarlas y del escribirlas', '8-9 años', 'El problema:
Escribir pide inventar, ordenar y redactar al mismo tiempo. Es demasiado junto, y por eso aparece la hoja en blanco.
Los tres momentos, separados:
• Momento uno: anotar todas las ideas que aparezcan, sin juzgar ninguna, en desorden. Cinco minutos.
• Momento dos: numerarlas en el orden en que irían. Tachar las que no van.
• Momento tres: escribir, siguiendo los números.
Lo que cambia:
En el momento tres ya no hay que inventar nada. Sólo redactar lo que ya está decidido.
Para el momento uno:
Vale escribir palabras sueltas, dibujar, o dictarle a alguien.
Con cuántas ideas alcanza:
Seis u ocho para un texto corto.'),

  (null, 'psychopedagogy', 'Escritura', 'Producción de textos', 'El texto que tiene principio, medio y final', 'worksheet', 'Estructurar una narración con las tres partes', '8-9 años', 'La estructura, en tres cajas en una hoja:
• Principio: quién, dónde, cuándo.
• Medio: qué problema aparece.
• Final: cómo se resuelve.
Cómo se completa:
Primero con palabras sueltas en cada caja. Después se escribe el texto tomando cada caja como un párrafo.
Los andamios que ayudan:
Había una vez. Un día. Entonces. Al final.
El error típico:
Un texto que es todo principio. Se presenta a los personajes durante diez renglones y no pasa nada.
Cómo se corrige:
Contando cuántos renglones tiene cada caja. Si el medio es más corto que el principio, falta historia.
Para revisar:
Que se lo lea en voz alta a alguien. Los problemas se escuchan antes de verse.'),

  (null, 'psychopedagogy', 'Escritura', 'Producción de textos', 'Revisar lo que escribí', 'guide', 'Instalar el paso de revisión, que casi nunca se hace', '10-11 años', 'Por qué no se hace:
Porque revisar aburre y porque no se sabe qué mirar. Lo segundo tiene solución.
La lista de chequeo, en este orden:
• ¿Se entiende de qué hablo?
• ¿Está todo lo que quería decir?
• ¿Sobra algo?
• ¿Cada párrafo tiene una idea?
• Puntos y mayúsculas.
• Ortografía.
El orden importa:
Corregir la ortografía primero y después darse cuenta de que hay que reescribir el párrafo es trabajo perdido.
Cómo revisar de verdad:
Leerlo en voz alta. Donde se traba la voz, hay algo que arreglar.
Con un día de por medio:
Un texto revisado al otro día se corrige mucho mejor que uno revisado enseguida.'),

  (null, 'psychopedagogy', 'Escritura', 'Ortografía', 'Las palabras que siempre se escriben mal', 'activity', 'Trabajar el error ortográfico propio en vez de reglas generales', '10-11 años', 'De qué se trata:
Cada chico se equivoca siempre en las mismas veinte o treinta palabras. Trabajar esas rinde más que estudiar reglas.
Cómo se arma la lista:
Se juntan sus escritos de un mes y se anotan los errores repetidos.
Cómo se trabaja cada palabra:
• Mirarla escrita bien, cinco segundos.
• Taparla y escribirla.
• Comparar letra por letra.
• Si está bien, va al montón de las logradas. Si no, se repite.
Con cinco palabras por semana:
No más. Veinte no queda ninguna.
El repaso:
Las logradas se vuelven a revisar a la semana y al mes. Lo que no se repasa se olvida.
Lo que no ayuda:
Escribirla veinte veces seguidas. Después de la tercera, la mano copia sin mirar.'),

  (null, 'psychopedagogy', 'Escritura', 'Grafismo', 'La letra que se entiende', 'guide', 'Mejorar la legibilidad sin pelear por la prolijidad', '8-9 años', 'Qué se mira, en este orden de importancia:
• Que las letras se distingan entre sí.
• Que haya espacio entre las palabras.
• Que las letras se apoyen en el renglón.
• Que el tamaño sea parejo.
• La inclinación.
La prolijidad no está en la lista:
Una letra fea que se lee es suficiente. Pelear por que sea linda desgasta y no sirve.
Los apoyos:
• Renglón doble para el tamaño.
• Un dedo entre palabra y palabra.
• Papel con guía para la inclinación.
Cuánto se corrige por vez:
Una sola cosa. Todo junto no cambia nada.
Cuándo dejar de insistir:
Si a los diez años la letra se lee, se trabaja la velocidad y no la forma.'),

  (null, 'psychopedagogy', 'Matemática', 'Numeración', 'Los números que se pueden agarrar', 'activity', 'Construir la noción de cantidad antes del símbolo', '3-5 años', 'La secuencia, y el orden es todo:
• Cantidad: muchos y pocos, con objetos.
• Correspondencia: un objeto, un dedo, un número dicho.
• Conteo con sentido: saber que el último número dicho es cuánto hay.
• Comparación: cuál tiene más.
• Y recién después, el símbolo escrito.
El error habitual:
Empezar por el símbolo. Un chico puede escribir el 5 perfecto y no saber que son cinco cosas.
Cómo se prueba si entendió:
Contar cinco objetos y preguntarle cuántos hay. Si vuelve a contarlos, todavía no.
Los materiales:
Tapitas, botones, porotos. Nada comprado.
Cuánto se cuenta:
Hasta cinco primero. Hasta diez después. Contar hasta cien de memoria no significa nada.'),

  (null, 'psychopedagogy', 'Matemática', 'Numeración', 'El valor de cada lugar', 'activity', 'Comprender que la posición cambia el valor de la cifra', '8-9 años', 'Por qué cuesta:
Que el 2 de 23 valga veinte y no dos es un salto conceptual grande, y sin él las cuentas con llevadas son magia sin sentido.
Los materiales:
Palitos sueltos y palitos atados de a diez con una gomita. Nada de fichas de colores al principio: que el diez sea diez cosas de verdad.
Las actividades:
• Armar un número con palitos: 23 son dos atados y tres sueltos.
• Cuando hay diez sueltos, atarlos. Ahí aparece el canje.
• Sumar juntando y atando cuando se llega a diez.
• Restar desatando un paquete cuando hace falta.
Lo que se descubre:
Que llevar y pedir prestado son atar y desatar. Deja de ser una regla y pasa a ser algo que se vio.
Cuándo pasar al papel:
Cuando el canje con palitos sale sin ayuda.'),

  (null, 'psychopedagogy', 'Matemática', 'Cálculo mental', 'Las estrategias que reemplazan a contar con los dedos', 'guide', 'Ampliar el repertorio de estrategias de cálculo', '8-9 años', 'La idea:
Contar con los dedos no está mal, pero es lento. El objetivo es agregar estrategias, no prohibir esa.
Las estrategias, en orden de aparición:
• Contar desde el mayor: para 3 más 8, empezar en 8.
• Los dobles: 6 más 6, 7 más 7. Se memorizan.
• Casi dobles: 6 más 7 es el doble de 6 más uno.
• Hacer diez: 8 más 5 es 8 más 2 más 3.
• Descomponer: 7 más 6 es 7 más 3 más 3.
Cómo se enseña una:
Se muestra, se practica con cinco cuentas, y se le pregunta cuándo le conviene usarla.
La pregunta que importa:
¿Cómo lo pensaste? Y se escucha, aunque el resultado esté mal. Ahí está la información.'),

  (null, 'psychopedagogy', 'Matemática', 'Cálculo mental', 'Las tablas, sin recitarlas', 'activity', 'Construir las tablas de multiplicar apoyándose en relaciones', '8-9 años', 'El problema de recitarlas:
Se recita del uno al diez y si preguntan siete por ocho hay que empezar de nuevo desde el principio.
Las relaciones que sirven:
• La del 2 es el doble.
• La del 4 es el doble del doble.
• La del 5 termina en cero o en cinco, y es la mitad de la del 10.
• La del 9 es la del 10 menos el número.
• Si sabés 7 por 8, sabés 8 por 7.
Cuáles hay que memorizar de verdad:
Muy pocas. Con las relaciones de arriba quedan seis u ocho difíciles, y esas sí se practican.
Cómo se practican esas:
Tarjetas, dos minutos por día. Sólo las difíciles.
Lo que hay que sacar:
La velocidad como medida. Un chico que llega al resultado en cinco segundos pensando entendió más que uno que lo dice en uno sin saber por qué.'),

  (null, 'psychopedagogy', 'Matemática', 'Resolución de problemas', 'Leer el problema antes de calcular', 'guide', 'Instalar la comprensión previa al cálculo', '8-9 años', 'El problema del problema:
Muchos chicos buscan los números y hacen una cuenta sin haber entendido qué se pregunta.
Los pasos, antes de calcular:
• Leer el problema entero, sin mirar los números.
• Contarlo con las propias palabras.
• Dibujar la situación.
• Decir qué se pregunta.
• Estimar si el resultado va a ser más grande o más chico que los datos.
La estimación previa es la mejor:
Si estimó que iba a dar más y le dio menos, se da cuenta solo de que algo falló.
Al final:
¿Tiene sentido esta respuesta? Un problema de edades que da doscientos años tiene un error, y verlo es parte de resolver.
Con problemas sin números:
Se puede trabajar todo esto sin calcular nada.'),

  (null, 'psychopedagogy', 'Matemática', 'Resolución de problemas', 'Problemas con datos de más y de menos', 'worksheet', 'Discriminar qué información se necesita', '10-11 años', 'Los tres tipos:
• Con datos que sobran.
• Con datos que faltan, y hay que decir cuál falta.
• Sin pregunta, y hay que inventar una que se pueda contestar.
El tercero es el mejor:
Inventar la pregunta obliga a entender la situación entera. Y es el que menos se hace.
Un ejemplo del tercero:
Ana tiene 24 figuritas, le regala 8 a su hermano y compra 15 más. Y ahí se corta. Que invente qué se puede preguntar.
Lo que aparece:
Cuántas tiene ahora. Cuántas le quedaron después de regalar. Cuánto gastó. Algunas se pueden contestar y otras no, y distinguirlo es el ejercicio.
Cuántos por sesión:
Dos. Son densos.'),

  (null, 'psychopedagogy', 'Lectura', 'Comprensión lectora', 'Las preguntas que no están en el texto', 'worksheet', 'Trabajar la comprensión inferencial', '10-11 años', 'Los tres niveles de pregunta:
• Literal: la respuesta está escrita. ¿Cómo se llamaba el perro?
• Inferencial: la respuesta se deduce. ¿Por qué se habrá escapado?
• Crítica: la respuesta es propia. ¿Te parece que hizo bien?
Dónde se traba casi todo el mundo:
En la segunda. Se contestan bien las literales y se responde cualquier cosa en las inferenciales.
Cómo se trabaja la inferencial:
Después de responder, la pregunta clave es: ¿en qué parte del texto te apoyaste? Y que lo señale con el dedo.
Eso es lo que enseña:
Que inferir no es inventar. Es apoyarse en algo que está escrito y agregarle lo que uno sabe.
Cuántas por texto:
Dos literales, tres inferenciales, una crítica.'),

  (null, 'psychopedagogy', 'Lectura', 'Comprensión lectora', 'Contar lo que leí', 'activity', 'Practicar el resumen oral, que precede al escrito', '8-9 años', 'Por qué oral primero:
Resumir por escrito junta comprender, sintetizar y redactar. Oral saca la última parte.
La progresión:
• Contar el texto entero con las propias palabras.
• Contarlo en cinco oraciones.
• Contarlo en tres.
• Contarlo en una.
La de una oración es la que más enseña:
Obliga a decidir qué es lo más importante, que es exactamente lo que es resumir.
Lo que hay que escuchar:
Si cuenta todo en orden sin jerarquizar, todavía está recordando y no resumiendo.
Después:
Escribir la oración única. Y a partir de ahí, el resumen escrito.
Con qué textos:
Cortos. Media carilla al principio.'),

  (null, 'psychopedagogy', 'Lectura', 'Fluidez lectora', 'Leer con la voz de los personajes', 'activity', 'Trabajar la prosodia, que es parte de la fluidez', '8-9 años', 'Qué es la prosodia:
La entonación, las pausas y el ritmo. Un chico puede leer rápido y sin errores y aun así sonar como una lista de palabras.
Cómo se trabaja:
Con textos con diálogo, y cada personaje con su voz.
Los pasos:
• Vos leés y él escucha.
• Leen juntos, en voz alta, al mismo tiempo.
• Él lee y vos acompañás sólo si se traba.
• Él lee solo.
Lo de leer juntos es lo que más sirve:
Arrastra la entonación sin corregir nada.
Los signos:
Antes de leer, marcar dónde hay preguntas y exclamaciones. La entonación se anticipa.
Para grabar:
Que se grabe y se escuche. Se corrige solo mucho más de lo que corrige nadie.'),

  (null, 'psychopedagogy', 'Atención', 'Atención sostenida', 'La lista de distracciones', 'worksheet', 'Identificar qué interrumpe y en qué momento', '12-14 años', 'Cómo se hace:
Durante una semana, cada vez que se interrumpe estudiando, anota una raya en una hoja y una palabra de qué fue.
Al final de la semana:
Se cuentan y se agrupan.
Lo que suele aparecer:
• El celular.
• Alguien que entra al cuarto.
• Hambre o sed.
• Una idea que aparece de la nada.
• Aburrimiento con esa materia en particular.
Qué se hace con cada grupo:
Las externas se resuelven cambiando el ambiente. Las internas se resuelven con el papel al lado para anotarlas y seguir.
La que sorprende:
Casi siempre son muchas más de las que creía.
Sin cambiar nada la primera semana:
Sólo contar. Medir ya cambia la conducta, y además el dato queda limpio.');
