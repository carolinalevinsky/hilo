-- Fonoaudiología: la biblioteca compartida completa de la disciplina.
--
-- Escrita contra el estándar de docs/materiales.md. La dosis que aparece en
-- "Cuánto y cada cuánto" no es una impresión: en trastornos de los sonidos del
-- habla la evidencia sobre intensidad apunta a 50 a 70 ensayos por sesión como
-- piso y a 100 o más para instalar un patrón motor nuevo, así que los bloques
-- traen listas largas a propósito. La secuencia de complejidad es la
-- tradicional (sonido aislado, sílaba, palabra, frase, oración, conversación) y
-- las ayudas se retiran de a una.
--
-- Once materiales venían del v1, y ocho de ellos estaban archivados adentro de
-- "Articulación" con focos que eran vocabulario, narrativa, morfosintaxis o
-- comprensión oral. Eso ahora es el área Lenguaje, que es donde van.
--
-- Convenciones del texto, que las dibuja DocumentBody:
--   Una línea corta terminada en dos puntos y de hasta 60 caracteres es subtítulo.
--   Toda otra línea es un párrafo. Las viñetas empiezan con "• ".
--   Sin rayas, sin guiones largos y sin emoji: esto se imprime.

-- ─── Articulación ───────────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'speech_therapy', 'Articulación', 'Praxias orofaciales', 'Praxias con espejo, la rutina corta', 'activity', 'Ganar movilidad y precisión de lengua, labios y mejillas con una rutina breve y diaria', '3-5 años', 'Para qué sirve:
Antes de pedir un sonido hay que saber si la lengua llega donde tiene que llegar. Las praxias no arreglan la articulación por sí solas, pero sí dan el movimiento que después se usa para el sonido, y son un buen lugar para empezar cuando el chico todavía no tolera que le pidan una palabra.
Qué necesitás:
Un espejo donde entren las dos caras, la tuya y la de él.
Cómo se presenta:
Cada movimiento lo hacés vos primero, mirándose los dos en el espejo. Después lo hace él mirándose. Después lo hace mirándote a vos, sin espejo, que es más difícil. Nunca se corrige con la mano: se corrige mostrando de nuevo.
Ejercicio 1, la lengua, cinco movimientos:
• Sacarla derecha y guardarla, cinco veces.
• Tocarse el labio de arriba y el de abajo, cinco veces.
• Llevarla a una comisura y a la otra, cinco veces.
• Pegarla al paladar y hacer ruido al despegarla (el caballito), cinco veces.
• Pasarla por atrás de los dientes de arriba, de un lado al otro, tres veces.
Ejercicio 2, los labios y las mejillas:
• Beso y sonrisa, alternando, cinco veces.
• Inflar las dos mejillas y aguantar tres segundos, cinco veces.
• Inflar una sola mejilla y pasar el aire a la otra, tres veces.
• Vibrar los labios como un motor, tres veces.
Ejercicio 3, mantener la posición:
El movimiento se hace y se sostiene contando hasta tres. Sostener es más difícil que repetir, y es lo que después hace falta para un sonido que dura.
Progresión:
• Si sale fácil: sin espejo, y encadenando dos movimientos seguidos (lengua arriba y después a un costado).
• Si no sale: uno o dos movimientos por sesión, y con vos haciéndolo al lado todo el tiempo.
Qué mirar:
Si el movimiento sale limpio o arrastra la mandíbula, si la lengua llega al paladar, si se cansa antes de terminar la serie, si hay asimetría de un lado. Criterio para avanzar: los cinco movimientos de lengua sin espejo, dos sesiones seguidas.
Cuánto y cada cuánto:
Cinco minutos, todos los días. Es lo que hace la diferencia: corto y diario le gana a largo y dos veces por semana.
Para casa:
La rutina de la lengua frente al espejo del baño, mientras se lava los dientes, una vez por día. Cinco movimientos, cinco veces cada uno, y listo.'),

  (null, 'speech_therapy', 'Articulación', 'Praxias orofaciales', 'Praxias con comida', 'activity', 'Trabajar movilidad oral con comida, para el chico que no tolera la rutina frente al espejo', '3-5 años', 'Para qué sirve:
Hay chicos que no hacen praxias por consigna, y pelear con eso no lleva a ningún lado. Con comida el movimiento sale igual, y encima sale con motivo: nadie tiene que acordarse de llevar la lengua al labio si ahí hay dulce de leche.
Qué necesitás:
Dulce de leche o queso untable, palitos salados, pan, y una cuchara. Y consultar antes si hay alergias o alguna dificultad para deglutir.
Cómo se presenta:
Se juega, no se ejercita: no hace falta decir que es un ejercicio. Vos lo hacés primero, exagerando, y se ríen. Se limpia la boca al final y se cierra el juego.
Ejercicio 1, la lengua que busca:
• Un poquito de dulce de leche en el labio de arriba, en el centro. Que lo saque con la lengua, sin las manos.
• Después en el labio de abajo.
• Después en una comisura y en la otra.
• Y la más difícil: un poquito atrás de los dientes de arriba.
Ejercicio 2, labios y soplo:
• Chupar de un sorbete, y después de un sorbete más finito.
• Sostener un palito salado con los labios, sin los dientes, cinco segundos.
• Tomar de la cuchara cerrando los labios, sin que quede nada.
Ejercicio 3, masticar de los dos lados:
Un pedacito de pan del lado derecho y otro del izquierdo, mirando que mastique con las muelas y no adelante. Alternar lados es lo que hay que observar.
Progresión:
• Si sale fácil: pasá a las praxias con espejo, que ya van a tener sentido, y dejá la comida para la parte final.
• Si no sale: quedate en el labio de arriba y en el sorbete, que son los dos más fáciles.
Qué mirar:
Si la lengua llega o ayuda con el labio de abajo, si mastica de los dos lados, si babea, si la boca queda abierta en reposo. Criterio: los cuatro puntos del primer bloque alcanzados con la lengua, sin manos.
Cuánto y cada cuánto:
Cinco a diez minutos, dos o tres veces por semana. En la merienda, no en un momento aparte.
Para casa:
En la merienda de todos los días, el dulce de leche en el labio una vez. No hace falta más, y conviene que no sea una tarea.'),

  (null, 'speech_therapy', 'Articulación', 'Praxias orofaciales', 'La lengua que sube', 'activity', 'Lograr el apoyo de la punta de la lengua en el paladar, que es la base de varios sonidos', '6-7 años', 'Para qué sirve:
Varios sonidos necesitan la punta de la lengua arriba, atrás de los dientes: la t, la d, la n, la l, la s y la r. Si la lengua no sube ni sostiene, esos sonidos salen todos aproximados, y trabajar de a uno sin el apoyo no alcanza.
Qué necesitás:
Espejo, y algo dulce y seguro para marcar el punto (dulce de leche). Un bajalenguas también sirve para señalar sin tocar.
Cómo se presenta:
Se le muestra el punto exacto: no el paladar en general, sino el lugar justo atrás de los dientes de arriba. Se marca con un poquito de dulce y la lengua va ahí. Que lo mire en el espejo, no que lo adivine.
Ejercicio 1, encontrar el punto:
• Toca el punto con la lengua y lo sostiene contando hasta tres. Cinco veces.
• Sube y baja la lengua diez veces seguidas, sin mover la mandíbula.
• Sube la lengua y abre la boca manteniéndola arriba, tres veces. Esta es la difícil.
Ejercicio 2, del apoyo al sonido:
• Con la lengua en el punto, decir la t: ta, te, ti, to, tu. Diez de cada una.
• Después la d: da, de, di, do, du.
• Después la n y la l igual.
Ejercicio 3, palabras con el punto:
• tomate, dedo, nariz, luna, teléfono, ladrillo, dinosaurio, natación
Que las diga despacio, notando que la lengua sube en cada una.
Progresión:
• Si sale fácil: la misma serie con sílabas trabadas, y después en frases cortas.
• Si no sale: quedate en encontrar el punto con el dulce, sin pedir sonido, unas cuantas sesiones.
Qué mirar:
Si la mandíbula acompaña el movimiento de la lengua (tiene que quedarse quieta), si la lengua se aplana en lugar de hacer punta, si el sonido cambia cuando el apoyo está bien. Criterio: diez subidas seguidas sin mover la mandíbula y la serie de la t limpia.
Cuánto y cada cuánto:
Diez minutos, todos los días si se puede. Apuntá a unos setenta ensayos de sonido en la sesión, que es la dosis que mueve el patrón motor.
Para casa:
Frente al espejo, la lengua al punto diez veces y después ta te ti to tu. Dos minutos, una vez por día.'),

  (null, 'speech_therapy', 'Articulación', 'Praxias orofaciales', 'La boca cerrada y la respiración nasal', 'guide', 'Trabajar el cierre labial en reposo y la respiración por la nariz, y saber cuándo derivar', '6-7 años', 'Para qué sirve:
Un chico que respira por la boca todo el día tiene la lengua abajo, los labios flojos y la boca abierta en reposo, y eso condiciona la articulación entera. Pero también puede tener una obstrucción, y eso no lo arregla ningún ejercicio: hay que mirarlo y derivar.
Qué necesitás:
Espejo, un vaso de agua, y un papelito liviano. Y la historia: si ronca, si duerme con la boca abierta, si está siempre congestionado.
Cómo se presenta:
Primero se observa sin pedir nada: mirar cómo tiene la boca cuando está distraído, cómo respira mientras juega. Después se le explica en simple: la nariz es para respirar, la boca es para hablar y comer.
Ejercicio 1, sentir el aire de la nariz:
• Soplar el papelito con la nariz, con la boca cerrada, cinco veces.
• Tapar un lado y respirar por el otro, cinco veces cada lado. Si un lado no pasa aire, eso es un dato para el médico.
• Inspirar por la nariz y soltar por la boca, contando hasta tres.
Ejercicio 2, aguantar los labios cerrados:
• Labios juntos y el aire quieto, contando hasta diez.
• Sostener un palito con los labios, sin dientes, diez segundos.
• Un trago de agua en la boca, labios cerrados, aguantar diez segundos sin tragar.
Ejercicio 3, los momentos del día:
Se eligen tres momentos concretos para cerrar la boca a propósito: mirando la tele, en el auto, escuchando un cuento. Se anotan esos tres, no se pide todo el día.
Progresión:
• Si sale fácil: estirar los momentos, y sumar la lengua apoyada arriba mientras respira por la nariz.
• Si no sale: acortar a cinco segundos y revisar si hay obstrucción antes de insistir.
Ojo con esto:
Si ronca, si duerme con la boca abierta, si tiene la nariz tapada casi siempre, si un lado no pasa aire, o si hay ojeras marcadas y sueño de día, corresponde derivar a otorrinolaringología antes de seguir. Sin vía aérea libre esto no se sostiene, y la familia hace fuerza al vacío.
Qué mirar:
Cómo tiene la boca en reposo cuando no lo miran, si respira por la nariz durmiendo (preguntar en casa), si tolera diez segundos de labios cerrados. Criterio: diez segundos de cierre sin esfuerzo y los tres momentos del día sostenidos una semana.
Cuánto y cada cuánto:
Cinco minutos por día, y los tres momentos elegidos. Es un hábito, no una serie.
Para casa:
Los tres momentos elegidos y nada más, sin retos. La frase que ayuda no es cerrá la boca: es acordate de respirar por la nariz.'),

  (null, 'speech_therapy', 'Articulación', 'Fonema /r/', 'La r suave, la de cara y pera', 'activity', 'Instalar la vibrante simple, que es más fácil que la múltiple y muchas veces alcanza', '6-7 años', 'Para qué sirve:
La r simple es un solo golpe de lengua, no una vibración, y es bastante más fácil que la r múltiple. Se trabaja primero porque muchas veces con ella el habla ya se entiende, y la múltiple puede venir meses después.
Qué necesitás:
Espejo. Nada más.
Cómo se presenta:
Se parte de un movimiento que ya tiene: la d. Decirle eda, eda, eda rápido lleva la lengua al mismo lugar, y de ahí sale la r. Lo mostrás vos, lo dicen juntos, y después solo.
Ejercicio 1, del movimiento que ya está:
• eda, eda, eda, cada vez más rápido. Veinte veces.
• Ahora era, era, era. Veinte veces.
• Entre vocales: ara, ere, iri, oro, uru. Diez de cada una.
Ejercicio 2, en palabras, por posición:
• En el medio: cara, pera, aro, oreja, toro, arena, careta, mariposa
• Al final de sílaba: mar, por, ser, carta, puerta, verde, tortuga
Diez repeticiones de cada palabra. Con diez palabras ya son cien ensayos, que es la dosis que buscamos.
Ejercicio 3, en frases cortas:
• La cara de la nena.
• El toro en la arena.
• La puerta verde.
Cinco veces cada una, y después en una pregunta y respuesta, que es más parecido a hablar.
Progresión:
• Si sale fácil: pasá a la r múltiple con el material que corresponde, y a conversación con la r simple.
• Si no sale: volvé a eda, eda y trabajá sólo entre vocales unas cuantas sesiones. No se fuerza con la mano.
Qué mirar:
Que sea un golpe y no una l, que no aparezca una r de garganta, si sale en el medio pero no al final de sílaba. Criterio: 8 de 10 palabras limpias en dos sesiones seguidas, antes de pasar a frases.
Cuánto y cada cuánto:
Quince minutos, dos o tres veces por semana, apuntando a cien ensayos por sesión. La cuenta importa: se llega con listas largas, no con dos palabras.
Para casa:
Las diez palabras del bloque dos, cinco veces cada una, una vez por día. Que quien acompañe escuche y no corrija: si sale mal, se pasa a la siguiente.'),

  (null, 'speech_therapy', 'Articulación', 'Fonema /r/', 'La r que vibra, paso a paso', 'guide', 'Instalar la vibrante múltiple con una secuencia de aproximaciones, sin forzar la lengua', '6-7 años', 'Para qué sirve:
La r múltiple es el sonido que más tarda y el que más frustra. La secuencia importa: se busca la vibración desde movimientos que el chico ya hace, y no pidiéndole que vibre, que es pedirle justamente lo que no puede.
Qué necesitás:
Espejo, un sorbete, y un vaso con agua.
Cómo se presenta:
Se explica en simple dónde va la lengua: arriba, atrás de los dientes, y el aire la hace temblar. No se sostiene la lengua con nada ni se la empuja. Cada paso se prueba unas cuantas veces y se pasa al siguiente sólo si aparece algo.
Ejercicio 1, buscar la vibración:
• Vibrar los labios como un motor, y después pasar ese temblor a la lengua.
• Decir tr, tr, tr rápido y fuerte: la lengua rebota en el lugar de la r.
• Decir dr, dr, dr igual.
• Soplar fuerte con la lengua arriba, apenas tocando: ahí suele aparecer el primer temblor.
Ejercicio 2, la r adentro de tr y dr:
• tra, tre, tri, tro, tru. Diez de cada una.
• dra, dre, dri, dro, dru. Diez de cada una.
• Palabras: tren, trapo, tres, drama, cuadro, padre, madre, letra
Ejercicio 3, la r sola, cuando ya vibró en tr:
• arra, erre, irri, orro, urru. Diez de cada una.
• Palabras: carro, perro, torre, burro, marrón, jarra, hierro
• Y la más difícil, la r al principio: rama, risa, ropa, rueda, red
Progresión:
• Si sale fácil: palabras con dos erres, frases, y después conversación dirigida.
• Si no sale: quedate en tr y dr todo el tiempo que haga falta, y trabajá la r simple en paralelo, que es la que va a hacer que se le entienda.
Ojo con esto:
No se empuja la lengua con el dedo ni con ningún objeto, y no se insiste con ejercicios de fuerza. Si a los siete u ocho años no aparece nada después de varios meses, conviene revisar el frenillo y la movilidad con quien corresponda, y decidir con la familia si tiene sentido seguir.
Qué mirar:
Si aparece vibración en tr antes que sola, si la r sale de la garganta en lugar de la punta de la lengua, si se cansa o se frustra. Criterio: la r vibrada en tra, tre, tri, tro, tru, 8 de 10, antes de pasar a la r sola.
Cuánto y cada cuánto:
Quince minutos, dos o tres veces por semana, cien ensayos por sesión. Es el sonido que más práctica necesita.
Para casa:
Un solo paso, el que está saliendo en sesión, cinco veces por día y treinta segundos cada vez. Nunca el paso siguiente: en casa se practica lo que ya sale, no lo que se está buscando.'),

  (null, 'speech_therapy', 'Articulación', 'Fonema /r/', 'La r adentro de un grupo', 'activity', 'Llevar la r ya lograda a los grupos consonánticos y a palabras largas', '8-9 años', 'Para qué sirve:
Una r que sale sola y se pierde en pr, br, gr no está terminada. El grupo es más exigente porque hay que hacer dos cosas seguidas y rápido, y es donde vuelve el error cuando el chico habla en serio.
Qué necesitás:
La lista impresa, y algo para marcar los aciertos.
Cómo se presenta:
Se arranca por el grupo que le sale mejor y se avanza por dificultad. Vos das el modelo, él repite, y después lo dice sin modelo. El modelo se retira de a poco: primero lo decís con él, después antes que él, después nada.
Ejercicio 1, sílabas, por grupo:
Diez de cada serie, marcando los aciertos.
• bra, bre, bri, bro, bru
• pra, pre, pri, pro, pru
• gra, gre, gri, gro, gru
• cra, cre, cri, cro, cru
• fra, fre, fri, fro, fru
Ejercicio 2, palabras:
• brazo, broche, brillante, abrigo, cabra
• primo, premio, profesor, aprender, compra
• grande, gris, granja, alegre, tigre
• crema, cruz, cristal, escribir, microbio
• fruta, frío, frase, cofre, África
Cinco veces cada palabra: son ciento veinticinco ensayos, que es la dosis buena.
Ejercicio 3, frases y una historia:
• El primo trajo fruta y crema.
• El tigre gris está en la granja grande.
Y después que cuente algo usando cinco de esas palabras, que es donde se ve si se sostiene.
Progresión:
• Si sale fácil: conversación libre con un tema que obligue a usar grupos, y lectura en voz alta.
• Si no sale: un solo grupo por sesión, en sílabas, hasta que salga limpio.
Qué mirar:
Si se le cae la r en el grupo, si le agrega una vocal en el medio (berazo por brazo), si sale en palabra y se pierde en la frase, cuál grupo es el peor. Criterio: 8 de 10 palabras limpias por grupo, y la historia con cinco palabras sostenidas.
Cuánto y cada cuánto:
Quince minutos, dos o tres veces por semana. Cien ensayos o más por sesión.
Para casa:
Un grupo por semana, diez palabras, cinco veces cada una, una vez por día. Y si se le cae en la conversación, no se corrige: se anota y se trabaja en sesión.'),

  (null, 'speech_therapy', 'Articulación', 'Fonema /r/', 'Cuando la r no llega y hay que decidir', 'guide', 'Evaluar si conviene seguir buscando la vibrante múltiple o pasar a compensar y sostener lo logrado', '8-9 años', 'Para qué sirve:
Hay chicos que trabajan la r durante dos años y no aparece. Seguir sin criterio los deja con la sensación de estar siempre en deuda con un sonido, y a la familia también. Esta es la conversación que corresponde tener, con datos y no con impresiones.
Qué necesitás:
El registro de lo trabajado, una grabación de habla espontánea de un minuto, y un momento con la familia.
Cómo se presenta:
Se revisa lo hecho en voz alta con la familia y con el chico si tiene edad: qué se probó, cuánto tiempo, qué cambió y qué no. La decisión se toma juntos, no se comunica.
Ejercicio 1, hacer el balance, con datos:
• ¿Cuánto tiempo se trabajó y con qué frecuencia real?
• ¿Aparece la vibración en algún contexto, aunque sea una vez? Anotar en cuál.
• ¿Cuánto afecta la inteligibilidad? Contar en la grabación cuántas palabras no se entienden.
• ¿Qué dice él de esto? Si evita palabras o si ya no le importa.
Ejercicio 2, las tres opciones sobre la mesa:
• Seguir buscando la múltiple, con un plazo acordado: tres meses y volvemos a mirar.
• Consolidar la r simple, que suele alcanzar para que se entienda, y soltar la múltiple por ahora.
• Pausa: dejar descansar seis meses y retomar más grande, que a veces aparece sola.
Ninguna es la mala. Lo que hace daño es no elegir.
Ejercicio 3, lo que se hace igual en los tres casos:
• Sostener la r simple con práctica corta y espaciada.
• Trabajar que no evite palabras con r, que es lo que empieza a limitar el vocabulario.
• Dejar por escrito qué se decidió y cuándo se vuelve a revisar.
Progresión:
• Si sale fácil: si en el plazo aparece vibración, se vuelve al material de la múltiple.
• Si no sale: se pasa a consolidar, sin presentarlo como un fracaso, porque no lo es.
Qué mirar:
La inteligibilidad medida en la grabación, la evitación de palabras, el cansancio del chico con el tema. Criterio de la revisión: se vuelve a mirar en la fecha acordada, con otra grabación para comparar.
Cuánto y cada cuánto:
Una sesión para la conversación, y una revisión cada tres meses con grabación.
Para la familia:
La frase que conviene llevarse: que la r múltiple no salga no le impide hablar bien, y en muchos adultos tampoco está. Y que no se corrija en la mesa, porque corregir la r en la mesa enseña a hablar menos.');

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'speech_therapy', 'Articulación', 'Fonemas /s/ y /l/', 'La l bien apoyada', 'activity', 'Instalar la l con apoyo de la punta de la lengua y salida del aire por los costados', '3-5 años', 'Para qué sirve:
La l necesita la punta de la lengua arriba y el aire saliendo por los costados. Cuando falta el apoyo, la l sale como una d o como una vocal, y además arrastra a la r, que usa el mismo punto.
Qué necesitás:
Espejo, y algo dulce y seguro para marcar el punto de apoyo.
Cómo se presenta:
Se marca el punto atrás de los dientes de arriba y la lengua va ahí. Después se sostiene la lengua arriba y se saca la voz: sale la l larga. Lo mostrás vos alargándola mucho, lllll, que es lo que la hace fácil de imitar.
Ejercicio 1, la l larga:
• Lengua en el punto, voz encendida: lllll, cinco segundos. Cinco veces.
• Con la lengua arriba, abrir y cerrar la boca sin bajarla, tres veces.
• Alternar la, la, la sin mover la mandíbula, diez veces.
Ejercicio 2, sílabas y palabras:
• la, le, li, lo, lu. Diez de cada una.
• Al principio: luna, lápiz, leche, lobo, lima, lupa
• En el medio: pelota, helado, muleta, paleta, kilo
• Al final de sílaba: sol, mil, papel, árbol, caracol
Cinco veces cada palabra.
Ejercicio 3, frases con dos l:
• La luna en el lago.
• El lobo lame la leche.
• El helado de limón.
Progresión:
• Si sale fácil: la l dentro de grupos (bl, pl, cl) y en conversación.
• Si no sale: quedate en la l larga con apoyo marcado, y trabajá la lengua arriba con las praxias antes de pedir el sonido.
Qué mirar:
Si la lengua sube o se queda plana, si sale una d en lugar de l, si la l al final de sílaba desaparece, si la mandíbula se mueve en cada sílaba. Criterio: 8 de 10 palabras limpias en las tres posiciones, dos sesiones seguidas.
Cuánto y cada cuánto:
Diez a quince minutos, dos o tres veces por semana, cien ensayos por sesión.
Para casa:
Las seis palabras del principio, cinco veces cada una, una vez por día frente al espejo. Dos minutos.'),

  (null, 'speech_therapy', 'Articulación', 'Fonemas /s/ y /l/', 'La s que no se escapa', 'guide', 'Corregir el ceceo o el sigmatismo lateral con posición de lengua y salida central del aire', '6-7 años', 'Para qué sirve:
La s sale mal de varias maneras distintas y cada una necesita otra cosa: si la lengua asoma entre los dientes es una s interdental, si el aire se va por los costados es un sigmatismo lateral, y si suena como sh el problema es el punto. Primero se identifica cuál es.
Qué necesitás:
Espejo, un sorbete, y una tira de papel finito.
Cómo se presenta:
Se mira en el espejo cómo sale hoy y se nombra: mirá, la lengua se asoma. Después se busca la posición nueva sin pedir la s todavía: dientes juntos, lengua adentro, aire por el medio.
Ejercicio 1, encontrar la salida central del aire:
• Dientes juntos y sonreír, y soplar sin voz. El aire tiene que salir por el medio, no por los costados.
• Poner la tira de papel delante de los dientes: tiene que moverse de frente.
• Soplar por el sorbete apoyado en el medio de la lengua, sin voz. Ese es el camino del aire de la s.
Ejercicio 2, de la t a la s:
La t deja la lengua en el lugar justo, así que se usa de puente.
• Decir ts, ts, ts, y estirar la s del final: tsssss. Diez veces.
• Después la s sola, larga: sssss, cinco segundos. Cinco veces.
• Sílabas: sa, se, si, so, su, y también as, es, is, os, us. Diez de cada una.
Ejercicio 3, palabras y frases:
• Al principio: sol, sopa, silla, semana, sandía
• En el medio: casa, pasto, bolsa, vestido, pescado
• Al final: lápiz, mes, feliz, autobús, vez
• Frases: La sopa está sabrosa. El sol sale seis.
Progresión:
• Si sale fácil: grupos con s (sp, st, sc), lectura en voz alta y conversación.
• Si no sale: volvé al soplo sin voz con la tira de papel, y revisá si hay mordida abierta o interposición lingual.
Ojo con esto:
Si hay mordida abierta, dientes de leche ausentes en la zona de adelante o interposición lingual marcada, conviene coordinar con odontología u ortodoncia. Una s puede no cerrar mientras la boca no cierra.
Qué mirar:
Si la lengua asoma, por dónde sale el aire (mirá con la mano al costado de la boca), si suena como sh, si la s al final de palabra desaparece. Criterio: 8 de 10 palabras en las tres posiciones, dos sesiones seguidas.
Cuánto y cada cuánto:
Quince minutos, dos o tres veces por semana, apuntando a cien ensayos.
Para casa:
La s larga frente al espejo con la tira de papel, y las cinco palabras del principio, cinco veces cada una. Una vez por día.'),

  (null, 'speech_therapy', 'Articulación', 'Fonemas /s/ y /l/', 'La s y la z, la r y la l', 'activity', 'Discriminar de oído pares de sonidos parecidos antes de pedir la producción correcta', '6-7 años', 'Para qué sirve:
Cuando un chico dice lata por rata, muchas veces tampoco escucha la diferencia. Pedirle que produzca lo que no discrimina es pedirle que apunte con los ojos cerrados: primero el oído, después la boca.
Qué necesitás:
Dos tarjetas o dos hojas, una para cada sonido del par, y la lista de palabras.
Cómo se presenta:
Vos decís, él sólo señala. No repite nada todavía, y eso hay que decirlo: acá no hablás, sólo escuchás. Sacar la producción del medio baja muchísimo la ansiedad.
Ejercicio 1, igual o diferente:
Decís dos palabras y él dice si son la misma o distintas, sin verte la boca.
• rata, lata · pero, pelo · mira, mila · cara, cala · toro, tolo
• casa, caza · sí, si · risa, riza
Ejercicio 2, señalar cuál dije:
Las dos tarjetas sobre la mesa (una r, una l). Decís una palabra y señala la tarjeta del sonido que escuchó.
• rama, lama · pera, pela · loro, lolo · faro, falo · muro, mulo
Veinte ensayos, anotando aciertos.
Ejercicio 3, ahora sí, decirlas:
Recién ahora produce, y de a pares, para que la diferencia se sienta en la boca.
• rata y lata · pero y pelo · cara y cala · toro y tolo
Cinco veces cada par.
Progresión:
• Si sale fácil: pares dentro de frases, y corrección de él a vos cuando te equivocás a propósito.
• Si no sale: quedate en igual o diferente sin producción, con palabras muy distintas primero.
Qué mirar:
Si discrimina de oído sin ver tu boca, si se equivoca siempre para el mismo lado, si al producir mejora cuando el par está a la vista. Criterio: dieciocho de veinte en señalar, antes de pasar a producir.
Cuánto y cada cuánto:
Diez minutos al principio de la sesión, dos o tres veces por semana.
Para casa:
El juego de igual o diferente, veinte pares, oral y sin espejo. Dos minutos, y sin corregir cómo habla el resto del día.'),

  (null, 'speech_therapy', 'Articulación', 'Fonemas /s/ y /l/', 'Trabalenguas graduados', 'text', 'Practicar la producción en habla rápida y encadenada, que es el último paso antes de la conversación', '8-9 años', 'Para qué sirve:
Un sonido que ya sale en palabras sueltas se cae cuando el habla se acelera. El trabalenguas es la práctica de habla rápida con el sonido cargado, y es el paso que falta entre el ejercicio y hablar de verdad.
Qué necesitás:
Los textos impresos en letra grande, cronómetro, y algo para grabar si se puede.
Cómo se presenta:
Primero lo leés vos lento y completo, después juntos, después él lento, y sólo al final rápido. La regla es que la velocidad nunca se gana perdiendo el sonido: un intento rápido con error no cuenta.
Ejercicio 1, con s, del más fácil al más difícil:
• Sara soñaba sin sueño.
• Seis sapos secos salen al sol.
• Si sos sastre, cosé seis sacos sin coser sin ganas.
Ejercicio 2, con l y con r:
• La lluvia lava la loza del lunes.
• Lalo lee la lista y la lee al revés.
• Erre con erre cigarro, erre con erre barril.
• El perro de Ramón rompe la rama del romero.
Ejercicio 3, tres velocidades y la grabación:
Cada trabalenguas, tres veces: lento, normal, rápido. Se graba la versión normal y se escucha juntos, contando los sonidos que salieron bien. Escucharse es la parte que más sirve, y la que menos se hace.
Progresión:
• Si sale fácil: inventar un trabalenguas con su nombre, y pasar a conversación libre cronometrada.
• Si no sale: la primera mitad de cada texto, en lento, y sin cronómetro.
Qué mirar:
Si el sonido se cae al acelerar, en qué posición se cae primero, si se autocorrige al escucharse. Criterio: el trabalenguas entero a velocidad normal con el sonido limpio, dos veces seguidas.
Cuánto y cada cuánto:
Diez minutos al final de la sesión, dos o tres veces por semana. Funciona bien como cierre.
Para casa:
El trabalenguas que eligió él, tres veces por día en velocidad lenta. La velocidad se gana en sesión, no en casa.'),

  (null, 'speech_therapy', 'Articulación', 'Fonemas /k/ y /g/', 'Los sonidos que se hacen atrás', 'activity', 'Instalar la k y la g llevando el dorso de la lengua al velo, sin que salgan como t y d', '3-5 años', 'Para qué sirve:
Decir tasa por casa o dato por gato es uno de los patrones más comunes a los tres o cuatro años: el sonido de atrás se hace adelante. El trabajo es llevar la lengua atrás, y hay dos trucos que lo hacen fácil.
Qué necesitás:
Espejo, agua para la gárgara, y algo para sostener la punta de la lengua abajo si hace falta (un bajalenguas).
Cómo se presenta:
Se le muestra dónde está el sonido: acá atrás, con la garganta. Los dos trucos son acostarse boca arriba, porque la gravedad ayuda a que la lengua caiga atrás, y hacer la gárgara, que es el mismo lugar.
Ejercicio 1, encontrar el punto de atrás:
• Toser suave: la k está ahí.
• Hacer gárgara con un poco de agua, tres veces.
• Acostado boca arriba, decir ca, ca, ca. Diez veces.
• Con la punta de la lengua apoyada abajo, decir ca: si la punta no puede subir, sale atrás.
Ejercicio 2, sílabas y después palabras:
• ka, ke, ki, ko, ku, y también ak, ek, ik, ok, uk. Diez de cada una.
• ga, gue, gui, go, gu. Diez de cada una.
• Palabras con k: casa, cama, cuna, boca, vaca, camión, escuela
• Palabras con g: gato, goma, gusano, tortuga, amigo, agua
Cinco veces cada palabra.
Ejercicio 3, el par que no se confunde:
Ahora los pares, para que la diferencia se sienta.
• casa y tasa · cama y tama · gato y dato · goma y doma
Cinco veces cada par, y después él te dice uno y vos señalás.
Progresión:
• Si sale fácil: sentado en lugar de acostado, y después en frases y conversación.
• Si no sale: quedate en la gárgara y en la posición acostada, sin pedir palabras.
Qué mirar:
Si el sonido sale adelante, si mejora acostado, si le sale en ak y no en ka (es frecuente y sirve para empezar por ahí). Criterio: 8 de 10 palabras con k limpias, sentado, dos sesiones seguidas.
Cuánto y cada cuánto:
Diez minutos, dos o tres veces por semana. Cien ensayos por sesión.
Para casa:
La gárgara en el baño una vez por día, y seis palabras cinco veces cada una. La gárgara sola ya hace la mitad del trabajo.'),

  (null, 'speech_therapy', 'Articulación', 'Fonemas /k/ y /g/', 'Adelante o atrás, el juego de decidir', 'game', 'Discriminar k de t y g de d, en el oído y en la propia boca', '6-7 años', 'Para qué sirve:
Cuando el patrón de hacer adelante los sonidos de atrás ya está instalado, el chico produce la k pero se le vuelve a caer en palabras largas o cuando habla rápido. Este juego trabaja la discriminación, que es lo que sostiene la corrección.
Qué necesitás:
Dos cajas o dos hojas, una marcada adelante y otra atrás, y tarjetas o palabras escritas.
Cómo se presenta:
Se explica con la mano: este sonido se hace acá adelante (señalando los dientes) y este otro acá atrás (señalando la garganta). Después se clasifica de oído, y sólo al final se produce.
Ejercicio 1, clasificar de oído:
Decís la palabra y él la pone en una caja, sin repetirla.
• Atrás: casa, gato, cuna, goma, escuela, tortuga
• Adelante: taza, dato, tuna, doma, estrella, tortita
Veinte ensayos, sin que le vea la boca.
Ejercicio 2, los pares mínimos, produciendo:
• casa y taza · gato y dato · coma y toma · gota y dota · quema y tema
Cinco veces cada par. Que note con la mano en la garganta cuál vibra atrás.
Ejercicio 3, palabras largas y frases:
Acá es donde vuelve el error, así que es el que importa.
• camioneta, escaleras, cucaracha, kilómetro, guitarra, canguro
• El canguro come en la escuela. La tortuga camina con la guitarra.
Progresión:
• Si sale fácil: conversación libre y lectura en voz alta, contando cuántas veces se cae.
• Si no sale: volvé a clasificar de oído, y a palabras de dos sílabas.
Qué mirar:
Si discrimina sin ver tu boca, si en palabras largas vuelve el sonido de adelante, si se autocorrige. Criterio: dieciocho de veinte clasificando, y las seis palabras largas limpias.
Cuánto y cada cuánto:
Diez a quince minutos, dos veces por semana.
Para casa:
Las seis palabras largas, tres veces cada una, una vez por día. Y en la conversación no se corrige: se anota qué palabra se cayó.'),

  (null, 'speech_therapy', 'Articulación', 'Grupos consonánticos', 'Los grupos con l', 'activity', 'Producir bl, pl, cl, fl y gl sin separarlos con una vocal ni perder una consonante', '6-7 años', 'Para qué sirve:
Los grupos con l se simplifican de dos maneras: se pierde una consonante (pancha por plancha) o se mete una vocal en el medio (palancha). Son dos errores distintos y la ayuda es distinta para cada uno.
Qué necesitás:
La lista impresa, y algo para marcar los aciertos.
Cómo se presenta:
Se muestra el grupo pegado, alargando la primera consonante y cayendo en la l sin respirar: ppppla. Después juntos, después solo. Si mete una vocal, se le hace notar con la mano: dos sonidos pegados, no tres.
Ejercicio 1, las sílabas, grupo por grupo:
Diez de cada serie.
• bla, ble, bli, blo, blu
• pla, ple, pli, plo, plu
• cla, cle, cli, clo, clu
• fla, fle, fli, flo, flu
• gla, gle, gli, glo, glu
Ejercicio 2, palabras:
• blanco, bloque, bicicleta, tabla, pueblo
• plato, plancha, pluma, playa, cumpleaños
• clase, clavo, claro, bicicleta, tecla
• flor, flaco, flauta, inflar, reflejo
• globo, iglesia, regla, siglo
Cinco veces cada palabra.
Ejercicio 3, frases y una historia:
• El plato blanco en la playa.
• La flor en el globo claro.
Y después que cuente algo de su cumpleaños usando cinco palabras de la lista.
Progresión:
• Si sale fácil: pasá a los grupos con r, que son más difíciles, y a conversación.
• Si no sale: un grupo por sesión, en sílabas, alargando la primera consonante.
Qué mirar:
Si pierde una consonante o agrega una vocal, si el grupo sale al principio de palabra pero no en el medio, cuál grupo es el peor. Criterio: 8 de 10 palabras por grupo, dos sesiones seguidas.
Cuánto y cada cuánto:
Quince minutos, dos o tres veces por semana, cien ensayos por sesión.
Para casa:
Un grupo por semana, diez palabras, cinco veces cada una, una vez por día.'),

  (null, 'speech_therapy', 'Articulación', 'Grupos consonánticos', 'Las palabras largas que se comen sílabas', 'activity', 'Producir palabras de tres y cuatro sílabas completas, sin omitir la sílaba débil', '6-7 años', 'Para qué sirve:
Mariposa que sale posa, o elefante que sale efante: la sílaba que se pierde casi siempre es la que no lleva el acento. No es articulación, es estructura de la palabra, y se trabaja golpeando las sílabas.
Qué necesitás:
Nada. Un tambor o la mesa para golpear ayuda mucho.
Cómo se presenta:
Se golpea la palabra en sílabas, una por golpe, y se cuentan. Después se dice golpeando. Después sin golpear. El golpe es el andamio y se retira al final, no antes.
Ejercicio 1, golpear y contar:
• ma-ri-po-sa, cuatro golpes
• e-le-fan-te, cuatro
• te-lé-fo-no, cuatro
• za-pa-ti-lla, cuatro
• bi-ci-cle-ta, cuatro
Que diga cuántos golpes salieron antes de decir la palabra entera.
Ejercicio 2, la palabra con y sin golpe:
Cada palabra tres veces golpeando y dos veces sin golpear. Si al soltar el golpe se come la sílaba, se vuelve a golpear una vez más y se intenta de nuevo.
• mariposa, elefante, teléfono, zapatilla, bicicleta, dinosaurio, mandarina, refrigerador
Ejercicio 3, la palabra adentro de una frase:
Acá es donde se pierde, porque la frase acelera.
• La mariposa está en la bicicleta.
• El elefante come mandarina.
• El teléfono está en la zapatilla.
Progresión:
• Si sale fácil: palabras de cinco sílabas y frases largas, sin golpe.
• Si no sale: palabras de tres sílabas, siempre con golpe, y elegí palabras con sílabas simples.
Qué mirar:
Cuál sílaba se pierde (casi siempre la débil), si el golpe la recupera, si sale sola y se cae en la frase. Criterio: las ocho palabras completas sin golpe, y tres frases limpias.
Cuánto y cada cuánto:
Diez a quince minutos, tres veces por semana.
Para casa:
Cinco palabras largas golpeando en la mesa, una vez por día. Con la familia golpeando también, que lo hace más fácil y más divertido.'),

  (null, 'speech_therapy', 'Articulación', 'Grupos consonánticos', 'Los grupos con r, que son los más difíciles', 'activity', 'Producir br, pr, tr, dr, cr, gr y fr manteniendo la r dentro del grupo', '8-9 años', 'Para qué sirve:
Los grupos con r piden la r y además piden hacerla rápido después de otra consonante. Son los últimos que se logran, y los primeros que se caen cuando el chico habla rápido o está cansado.
Qué necesitás:
La lista impresa y algo para marcar.
Cómo se presenta:
Se arranca por tr y dr, que son los más fáciles porque la lengua ya está en el lugar. El modelo se retira de a poco: primero decís con él, después antes que él, después nada.
Ejercicio 1, sílabas, del más fácil al más difícil:
Diez de cada serie, en este orden.
• tra, tre, tri, tro, tru
• dra, dre, dri, dro, dru
• bra, bre, bri, bro, bru
• pra, pre, pri, pro, pru
• cra, cre, cri, cro, cru
• gra, gre, gri, gro, gru
• fra, fre, fri, fro, fru
Ejercicio 2, palabras:
• tren, tres, trabajo, letra, retrato
• cuadro, padre, madre, vidrio, golondrina
• brazo, libro, abrigo, cabra, sobre
• primo, profesor, aprender, compra, sorpresa
• crema, cristal, escribir, microbio, secreto
• grande, tigre, alegre, agrio, peligro
Cinco veces cada palabra: son ciento cincuenta ensayos.
Ejercicio 3, frases, lectura y conversación:
• El tren grande trae tres libros.
• Mi primo escribe con crema en el vidrio.
Y después un minuto de conversación sobre un tema que obligue a usar grupos: qué hiciste el sábado, qué hay en tu mochila.
Progresión:
• Si sale fácil: lectura en voz alta de un texto cargado de grupos, y conversación libre contando las caídas.
• Si no sale: un grupo por sesión, empezando por tr, y en sílabas hasta que salga limpio.
Qué mirar:
Si mete una vocal en el medio, si pierde la r, si sale en sílaba y se cae en palabra larga, qué pasa en conversación comparado con la lista. Criterio: 8 de 10 palabras por grupo y el minuto de conversación con dos caídas como máximo.
Cuánto y cada cuánto:
Quince minutos, dos o tres veces por semana, cien ensayos o más.
Para casa:
Un grupo por semana, diez palabras, cinco veces cada una. Y un minuto de contar algo, grabado si se puede, para escucharlo en sesión.'),

  (null, 'speech_therapy', 'Articulación', 'Grupos consonánticos', 'Del sonido a la conversación', 'guide', 'Llevar un sonido ya logrado al habla espontánea, que es el paso que suele quedar sin hacer', '8-9 años', 'Para qué sirve:
Un sonido que sale en la sesión y no sale en el patio no está generalizado, y la generalización no pasa sola: es una etapa con sus propias tareas. Es la etapa que más se saltea, y por eso hay chicos que trabajan un sonido durante años.
Qué necesitás:
Algo para grabar, una hoja de registro, y temas de conversación preparados.
Cómo se presenta:
Se explica el plan al chico: ya sabés hacer el sonido, ahora hay que hacerlo cuando no estás pensando en él. Se sube un escalón por semana y se baja cuando se cae, sin drama.
Ejercicio 1, la escalera, un escalón por semana:
• Palabras sueltas de la lista.
• Frases hechas con esas palabras.
• Responder preguntas con respuestas cortas.
• Contar algo preparado, un minuto.
• Conversación libre, tres minutos.
• Hablar con otra persona, en otro lugar.
Ejercicio 2, el minuto grabado y contado:
Se graba un minuto de conversación y se cuentan juntos los aciertos y las caídas. El número se anota en la hoja y se compara con el de la semana pasada. Contar es lo que hace visible el progreso.
Ejercicio 3, la autocorrección:
Se le enseña a darse cuenta y arreglar sin que nadie diga nada: si se te escapa, la repetís bien y seguís. Practicado así, adentro de la conversación, cinco veces.
Progresión:
• Si sale fácil: el escalón de hablar con otra persona, y después en la escuela.
• Si no sale: bajá un escalón y quedate dos semanas. Bajar no es retroceder, es sostener.
Qué mirar:
Cuántas caídas por minuto, si se autocorrige, si el sonido sale con vos y no con otros, si se cae cuando está cansado o entusiasmado. Criterio para el alta del sonido: dos caídas por minuto o menos, en conversación libre, con dos personas distintas.
Cuánto y cada cuánto:
Diez minutos de conversación grabada por sesión, todas las sesiones, hasta el alta.
Para casa:
Un minuto por día de contar algo, con el sonido en la cabeza. Y en el resto del día nadie corrige: corregir fuera de la práctica hace que hable menos, y es lo contrario de lo que se busca.');

-- ─── Habla y voz ────────────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'speech_therapy', 'Habla y voz', 'Soplo y respiración', 'Juegos de soplo con propósito', 'game', 'Trabajar la salida de aire dirigida y sostenida con juegos que tienen un objetivo visible', '3-5 años', 'Para qué sirve:
Soplar por soplar se aburre en dos minutos. Soplar para meter una pelotita en un arco se hace veinte veces sin que nadie lo pida, y el trabajo es el mismo: aire dirigido, sostenido y graduado.
Qué necesitás:
Sorbetes, pelotitas de papel o de telgopor, una vela, burbujas, un vaso con agua, y algo para armar un arco (dos lápices).
Cómo se presenta:
Se juega y se compite un poco, con vos también soplando. Nada se explica como ejercicio. Entre juego y juego hay que dejar descansar, porque soplar mucho seguido marea.
Ejercicio 1, soplo fuerte y corto:
• El arco: meter la pelotita de papel entre dos lápices, desde diez centímetros. Después desde veinte.
• La carrera: dos pelotitas, una para cada uno, hasta el borde de la mesa.
• Apagar la vela desde cerca, y después desde más lejos.
Ejercicio 2, soplo suave y sostenido:
• Burbujas: una sola grande, que es lo difícil, en lugar de muchas chicas.
• El sorbete en el vaso con agua: hacer burbujitas parejas contando hasta cinco, sin que salpique.
• Mantener la pelotita de papel apoyada en la mesa moviéndose despacio, sin que se escape.
Ejercicio 3, graduar a pedido:
Ahora se pide fuerte o suave según una consigna, alternando: fuerte, suave, fuerte, suave. Graduar es más difícil que soplar y es lo que después usa el habla.
Progresión:
• Si sale fácil: soplar con la boca en punta y con la lengua en distintas posiciones, y sumar soplo con voz.
• Si no sale: acercá el objetivo y hacelo más liviano. Si no sale ni con eso, revisá si respira por la boca o tiene la nariz tapada.
Ojo con esto:
Pausas entre juego y juego, siempre. Soplar mucho seguido produce mareo, y con un chico que se marea el juego se termina. Si tiene asma o alguna dificultad respiratoria, consultar antes.
Qué mirar:
Si el aire sale por la boca o se escapa por la nariz, si puede sostener cinco segundos, si gradúa a pedido, si infla las mejillas en lugar de dirigir el aire. Criterio: cinco segundos sostenidos y las dos consignas de graduación.
Cuánto y cada cuánto:
Diez minutos, dos o tres veces por semana, con pausas.
Para casa:
Burbujas o el sorbete en el vaso, dos minutos por día, como juego. Nada de soplar globos sin control.'),

  (null, 'speech_therapy', 'Habla y voz', 'Soplo y respiración', 'El soplo que dirige', 'game', 'Controlar la dirección y la puntería del aire, no sólo su fuerza', '3-5 años', 'Para qué sirve:
Para el habla no alcanza con tener aire: hay que dirigirlo. Este material trabaja la puntería del soplo, que es lo que después permite que el aire salga por el medio de la lengua en la s o por los costados en la l.
Qué necesitás:
Sorbetes, papelitos chicos, una hoja con un camino dibujado, plumas, y un dibujo con pintura aguada para soplar.
Cómo se presenta:
Todo es puntería, y la puntería se ve: o entró o no entró. Lo hacés vos primero, fallás, y se ríen. Que falle está permitido y hay que mostrarlo.
Ejercicio 1, el camino:
• Un papelito y un camino dibujado en la hoja. Soplar para que el papelito vaya por el camino sin salirse.
• El camino con una curva, que es más difícil.
• El camino angosto.
Ejercicio 2, el sorbete como puntero:
• Levantar papelitos aspirando con el sorbete y llevarlos a un plato. Diez papelitos.
• Soplar por el sorbete para mover una pluma hasta una marca en la mesa.
• Con el sorbete, soplar una gota de pintura aguada y hacer que se estire para un lado y para el otro.
Ejercicio 3, fuerte, suave y en punta:
Se pide el mismo recorrido tres veces con tres soplos distintos: fuerte, suave, y con la boca en punta como un silbido. Notar que en punta el aire llega más lejos, que es justamente el control que interesa.
Progresión:
• Si sale fácil: sumá sostener el soplo cinco segundos mientras la pluma se mantiene en el aire, y pasá a soplo con voz.
• Si no sale: objetivos más grandes y más cerca, y sin sorbete.
Ojo con esto:
Pausas entre ejercicio y ejercicio. Si aparece mareo, se corta. Y el sorbete se usa para aspirar papelitos, nunca para aspirar líquidos con la cabeza hacia atrás.
Qué mirar:
Si el aire sale dirigido o se dispersa, si se escapa por la nariz, si puede hacer la boca en punta, si mejora con el sorbete (indica que necesita el canal). Criterio: el camino con curva completado dos veces seguidas.
Cuánto y cada cuánto:
Diez minutos, dos o tres veces por semana.
Para casa:
El camino dibujado en una hoja y un papelito. Dos minutos por día, y la hoja se puede dibujar de nuevo cada vez.'),

  (null, 'speech_therapy', 'Habla y voz', 'Soplo y respiración', 'Respirar para hablar', 'guide', 'Coordinar la respiración con el habla, para dejar de quedarse sin aire a mitad de la frase', '8-9 años', 'Para qué sirve:
Hay chicos que hablan hasta quedarse sin aire y terminan la frase apretando la garganta. Eso cansa la voz y corta el habla en lugares raros. Lo que se entrena es la coordinación: tomar aire donde va la coma.
Qué necesitás:
Un texto corto impreso, lápiz para marcar, y la mano para apoyar en la panza.
Cómo se presenta:
Primero se siente la respiración baja con la mano en la panza, acostado o sentado, sin hablar. Después se agrega la voz. Después el texto. El orden es respirar, sonar, hablar, leer.
Ejercicio 1, sentir la respiración baja:
• Mano en la panza: al tomar aire por la nariz, la mano se mueve para afuera. Cinco veces, sin levantar los hombros.
• Tomar aire en dos tiempos y soltar en cuatro, contando. Cinco veces.
• Soltar el aire haciendo sssss parejo, cinco segundos, sin que se corte.
Ejercicio 2, contar con un solo aire:
• Tomar aire una vez y contar hasta donde llegue, sin apretar la garganta al final. Se anota el número.
• Tres intentos, y se compara. Se busca parejo, no máximo: si al final aprieta, el número no vale.
Ejercicio 3, el texto marcado:
Se marca con lápiz dónde se toma aire, en las comas y en los puntos, y se lee respetando las marcas.
• Ayer fuimos al parque, / que queda a tres cuadras de mi casa. / Llevamos la pelota / y jugamos hasta que se hizo de noche. /
Progresión:
• Si sale fácil: textos más largos con menos marcas, y después hablar espontáneo cuidando las pausas.
• Si no sale: frases de cinco palabras con una sola marca, y más trabajo de respiración sin habla.
Qué mirar:
Si levanta los hombros al inspirar, si termina las frases apretando, si toma aire en el medio de una palabra, cuántos números cuenta parejo. Criterio: el texto leído respetando las marcas, sin apretar al final, dos veces seguidas.
Cuánto y cada cuánto:
Diez a quince minutos, dos o tres veces por semana.
Para casa:
Cinco respiraciones con la mano en la panza antes de dormir, y leer un párrafo marcado en voz alta. Tres minutos.'),

  (null, 'speech_therapy', 'Habla y voz', 'Fluidez del habla', 'Hablar despacio, jugando', 'activity', 'Instalar un habla más lenta y con contacto suave en el chico que tartamudea, sin pedirle que se controle', '6-7 años', 'Para qué sirve:
Pedirle a un chico que tartamudea que hable despacio y respire suele empeorarlo: le agrega una cosa más para controlar. Lo que sí funciona es que el habla lenta aparezca en el juego, modelada por el adulto, y que él la copie sin que se la pidan.
Qué necesitás:
Muñecos o animalitos, un juego de mesa simple, y tu propia velocidad de habla.
Cómo se presenta:
Bajás vos la velocidad de tu habla a la mitad, con pausas largas entre frases, y no decís nada al respecto. La tortuga que habla despacio y la liebre que habla rápido son el disfraz: el modelo es tu voz.
Ejercicio 1, la tortuga y la liebre:
• Dos muñecos. La tortuga habla lento y estirando las palabras, la liebre rápido y atropellada.
• Vos hacés los dos, exagerando. Después él elige uno y juegan.
• Se juega cinco minutos con la tortuga, que es la que interesa, y un minuto con la liebre, que hace que sea un juego y no una corrección.
Ejercicio 2, las frases estiradas:
Con la tortuga, frases de tres o cuatro palabras, estirando la primera sílaba y sin golpear el comienzo.
• Vaaamos al parque.
• Quieeero la pelota.
• Hoooy es martes.
Cinco de cada una, siempre jugando.
Ejercicio 3, el turno largo:
Se agrega una pausa de dos segundos antes de cada respuesta, para los dos. El juego es que nadie contesta rápido. Esa pausa baja la presión de tiempo, que es la que más traba.
Progresión:
• Si sale fácil: el mismo habla en frases más largas y en contar algo, siempre con vos modelando lento.
• Si no sale: no se insiste en la producción. Se sigue modelando lento y se trabaja con la familia (ver el material de pautas para la familia).
Ojo con esto:
Nunca se dice hablá despacio, respirá, pensá antes de hablar ni empezá de nuevo. Esas cuatro frases son las que aumentan la tensión. El modelo se da, no se pide.
Qué mirar:
Si copia la velocidad sin que se la pidas, si la disfluencia baja con el habla lenta, si hay tensión visible (cierre de ojos, movimientos) o palabras que evita. Criterio: habla lenta espontánea en cinco minutos de juego, dos sesiones seguidas.
Cuánto y cada cuánto:
Quince minutos por sesión, dos veces por semana. Y tu velocidad baja durante toda la sesión, no sólo en el juego.
Para casa:
Cinco minutos por día de juego con un adulto que habla lento y hace pausas. Sin corregir nada, sin pedir nada. Eso es toda la tarea.'),

  (null, 'speech_therapy', 'Habla y voz', 'Fluidez del habla', 'Qué hace la familia con la tartamudez', 'guide', 'Dar a la familia pautas concretas de qué hacer y qué no, en un tema donde el consejo común empeora las cosas', '6-7 años', 'Para qué sirve:
La familia de un chico que tartamudea recibe consejos de todo el mundo, y casi todos son malos: que respire, que piense antes, que hable despacio, que no se ponga nervioso. Esta es la hoja que corrige eso, y suele ser la intervención que más cambia en las primeras semanas.
Qué necesitás:
Un rato con la familia sin el chico presente, y esta hoja para dejarles.
Cómo se presenta:
Se explica primero qué es y qué no es: la tartamudez no es nerviosismo ni falta de práctica, y no la causó nada que hicieron ellos. Eso hay que decirlo explícitamente, porque casi siempre lo están pensando.
Ejercicio 1, lo que sí ayuda:
• Bajar la propia velocidad de habla. Es lo que más efecto tiene, y no hay que pedirle nada a él.
• Esperar dos segundos antes de contestarle.
• Mirarlo a los ojos mientras se traba, con la cara tranquila.
• Dejarlo terminar, siempre, aunque tarde.
• Reservar diez minutos por día de conversación sin apuro, sin otros chicos y sin pantalla.
Ejercicio 2, lo que no ayuda, aunque parezca:
• Decirle que hable despacio, que respire o que piense antes.
• Completarle la frase o adivinar la palabra.
• Pedirle que empiece de nuevo.
• Hacerlo hablar delante de gente para que practique.
• Poner cara de preocupación, o mirar para otro lado.
Ejercicio 3, qué decir cuando él lo nota:
Si pregunta por qué le pasa, o se frustra, hay una respuesta corta y honesta: a veces las palabras se te quedan trabadas, y estamos trabajando para que salgan más fáciles. No pasa nada, yo te escucho igual.
Y si alguien en la escuela o en la familia se ríe, eso se corta de entrada y se habla con esa persona, no con él.
Progresión:
• Si sale fácil: sumar el momento de conversación a diez minutos diarios fijos y anotar en qué situaciones habla más fluido.
• Si no sale: quedarse sólo con dos pautas, las dos primeras, hasta que se vuelvan hábito.
Qué mirar:
Si la disfluencia cambia según la situación, si aparece tensión o evitación de palabras, si la familia pudo sostener las pautas. Criterio: las dos pautas principales sostenidas dos semanas, y los diez minutos diarios hechos.
Cuánto y cada cuánto:
Una sesión con la familia, y una revisión a las dos semanas. Las pautas son permanentes, no una tarea.
Para casa:
La hoja pegada en la cocina, y los diez minutos diarios de conversación sin apuro. Eso es lo que hay que hacer; el resto es lo que hay que dejar de hacer.'),

  (null, 'speech_therapy', 'Habla y voz', 'Fluidez del habla', 'El habla lenta que se practica leyendo', 'activity', 'Practicar habla con contacto suave y velocidad controlada en lectura, que es más fácil que en conversación', '8-9 años', 'Para qué sirve:
Leer es más fácil que conversar porque las palabras ya están elegidas. Por eso es un buen lugar para practicar la técnica: primero se instala leyendo, después se lleva a hablar. Al revés no funciona.
Qué necesitás:
Textos cortos impresos, lápiz para marcar, y algo para grabar si se puede.
Cómo se presenta:
Se explica la técnica en dos puntos: empezar la palabra suave, sin golpe, y estirar un poco la primera sílaba. Lo modelás leyendo un párrafo así, exagerado. Después leen juntos, a la par, que es el paso más fácil. Después solo.
Ejercicio 1, leer juntos a la par:
El mismo texto los dos a la vez, en voz alta, con tu velocidad marcando el paso. Leer a la par baja la disfluencia casi siempre, y eso le muestra que la fluidez es posible.
Ejercicio 2, el comienzo suave marcado:
Se subrayan las primeras palabras de cada oración y se leen estirando la primera sílaba.
• Aaayer fuimos al río.
• Eeel agua estaba fría.
• Nooosotros igual nos metimos.
Cinco oraciones así, primero con vos y después solo.
Ejercicio 3, el turno de hablar:
Recién ahora conversación: le hacés preguntas de respuesta corta y él contesta con la misma técnica. Cinco preguntas. Después una pregunta abierta, que es el paso siguiente.
Progresión:
• Si sale fácil: respuestas más largas, contar algo de un minuto, y después hablar con otra persona.
• Si no sale: volvé a leer a la par, y quedate ahí varias sesiones.
Ojo con esto:
Esto se practica en un contexto tranquilo y elegido, nunca cuando ya se trabó y está frustrado. Y no se le pide la técnica en la conversación de todos los días: lo que se busca es que aparezca sola.
Qué mirar:
Si la técnica baja la disfluencia, si la sostiene más de tres oraciones, si aparece tensión al usarla, cómo cambia de leer a conversar. Criterio: cinco oraciones leídas con comienzo suave y tres respuestas cortas con la técnica.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Grabar un minuto cada dos semanas para comparar.
Para casa:
Leer a la par con alguien, tres minutos por día. Sólo leer a la par, que es el ejercicio que no falla.'),

  (null, 'speech_therapy', 'Habla y voz', 'Fluidez del habla', 'Contar un cuento con apoyo de imágenes', 'activity', 'Sostener un turno largo de habla con apoyo visual, para que la disfluencia no corte la narración', '6-7 años', 'Para qué sirve:
Contar algo largo es lo que más cuesta cuando hay disfluencia: hay que elegir palabras, ordenar y hablar a la vez. Con las imágenes a la vista se saca una de las tres cargas, y el turno largo se vuelve posible.
Qué necesitás:
Tres o cuatro imágenes de una secuencia, dibujadas a mano o recortadas.
Cómo se presenta:
Primero lo contás vos, lento y con pausas, señalando cada imagen. Después lo cuentan juntos, una imagen cada uno. Después él solo. Las imágenes se quedan a la vista todo el tiempo.
Ejercicio 1, ordenar antes de contar:
Se ordenan las imágenes sobre la mesa y se nombra cada una con una palabra, sin contar todavía. Ordenar primero saca la presión de armar la historia mientras habla.
Ejercicio 2, una imagen cada uno:
Vos contás la primera, él la segunda, vos la tercera, él la cuarta. Con tu velocidad lenta de modelo y una pausa de dos segundos antes de cada turno.
Ejercicio 3, el cuento entero:
Ahora él solo, con las imágenes a la vista. Vos no interrumpís, no completás y no corregís: sólo escuchás mirándolo. Al final se comenta la historia, no cómo habló.
Progresión:
• Si sale fácil: sacar una imagen, después dos, hasta contarlo de memoria. Y después contar algo que le pasó de verdad, que es más difícil.
• Si no sale: dos imágenes en lugar de cuatro, y seguir con un turno cada uno.
Ojo con esto:
No se cuenta cuántas veces se trabó y no se comenta el habla al terminar. Lo que se comenta es la historia. Si él lo trae, se habla de eso con naturalidad.
Qué mirar:
Si sostiene el turno largo, si la disfluencia sube cuando saca la vista de las imágenes, si evita palabras o las cambia por otras, si aparece tensión. Criterio: cuatro imágenes contadas solo, dos veces seguidas.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Una secuencia nueva cada semana.
Para casa:
Contar un cuento con el libro abierto, tres minutos por día, con alguien que escucha sin corregir y sin apurar.'),

  (null, 'speech_therapy', 'Habla y voz', 'Fluidez del habla', 'Hablar en clase cuando uno tartamudea', 'guide', 'Preparar con el adolescente las situaciones de habla del liceo, y acordar con los docentes qué se cambia', '12-14 años', 'Para qué sirve:
En la adolescencia el problema deja de ser sólo la disfluencia y pasa a ser lo que se hace para esconderla: no levantar la mano, faltar el día de la exposición, contestar corto. Esa evitación cuesta más que la tartamudez.
Qué necesitás:
Un rato a solas con él, hoja y lápiz. Y después, una conversación con el liceo si él acepta.
Cómo se presenta:
No se arranca por la técnica: se arranca preguntando qué situaciones evita y qué le pasa en cada una. La lista la hace él y es confidencial. Desde ahí se elige una para trabajar.
Ejercicio 1, el mapa de las situaciones:
Poner de 1 a 10 cuánto cuesta cada una.
• Contestar cuando el profesor pregunta.
• Leer en voz alta en clase.
• Hacer una exposición.
• Hablar por teléfono.
• Pedir algo en un negocio.
• Presentarse a alguien nuevo.
Se elige la que está en el medio de la lista, no la peor.
Ejercicio 2, la preparación de esa situación:
• Qué se va a decir, escrito, si es una exposición o una llamada.
• Ensayarlo tres veces acá, con la técnica que ya conoce.
• Decidir qué hace si se traba: parar, respirar una vez, y seguir. No empezar de nuevo.
• Y la opción de nombrarlo: a veces decir yo tartamudeo un poco saca toda la presión de encima.
Ejercicio 3, lo que se acuerda con el liceo:
Con su permiso, y con él presente si quiere.
• Que no se le pida leer en voz alta de sorpresa, y que sí se le pueda avisar antes.
• Que se le dé el tiempo que tarde, sin completarle la frase.
• Que la nota de una exposición no baje por la fluidez.
• Que si alguien se ríe, eso se corta en el momento y no se habla con él después.
Progresión:
• Si sale fácil: subir una situación en la lista, y sumar hablar con desconocidos.
• Si no sale: bajar a una situación más fácil, y trabajar primero lo que piensa sobre trabarse.
Qué mirar:
Cuánto evita, si la evitación baja, si puede nombrarlo cuando le conviene, cómo se siente después de una situación lograda. Criterio: una situación de la lista hecha en la vida real, y anotada.
Cuánto y cada cuánto:
Veinte minutos por sesión, una vez por semana, con una situación por quincena.
Para casa:
La situación acordada, una vez, en la semana. Y anotar qué pasó: no si se trabó, sino si la hizo.'),

  (null, 'speech_therapy', 'Habla y voz', 'Voz', 'Cuidar la voz que se usa gritando', 'guide', 'Reducir el abuso vocal en el chico que queda disfónico, con cambios concretos de conducta', '8-9 años', 'Para qué sirve:
El chico que grita en el recreo y termina la semana afónico no necesita ejercicios de voz: necesita gritar menos y tomar más agua. Los nódulos infantiles casi siempre vienen de ahí, y se trabaja sobre la conducta.
Qué necesitás:
Una hoja para el registro, y una conversación con la familia y, si se puede, con la escuela.
Cómo se presenta:
Primero se registra sin cambiar nada: dos días anotando cuándo usa la voz fuerte. Con el registro delante, él mismo elige qué dos cosas cambiar, y elegir cambia la adherencia por completo.
Ejercicio 1, el registro de dos días:
Una raya por cada vez, y en qué situación.
• Gritar en el recreo o jugando a la pelota.
• Hablar fuerte con la tele o la música encendida.
• Llamar a alguien de otra habitación gritando.
• Aclararse la garganta, toser a propósito, hacer voces raras jugando.
Ejercicio 2, las reglas que se eligen, dos y no más:
• Para llamar a alguien, ir hasta donde está. No se grita de un cuarto a otro.
• Botella de agua siempre a mano, y tomar durante todo el día.
• Bajar la tele antes de hablar, en lugar de hablar más fuerte.
• No aclararse la garganta: tragar o tomar un sorbo de agua en lugar de carraspear.
• Nada de hablar en secreto forzando el susurro, que cansa igual que gritar.
Ejercicio 3, la voz suave, practicada:
• Decir mmmm suave, con la mano en la nariz para sentir la vibración, cinco veces.
• Contar hasta diez con voz suave y aire parejo, tres veces.
• Decir una frase corta con esa misma voz, tres veces, y notar que se escucha igual.
Progresión:
• Si sale fácil: sumar una tercera regla y revisar el registro a las dos semanas.
• Si no sale: quedate en una sola regla, la del agua, que es la que nadie discute.
Ojo con esto:
Si la disfonía dura más de dos o tres semanas, corresponde una consulta con otorrinolaringología antes de seguir: hay que ver las cuerdas. Ningún trabajo de voz reemplaza esa mirada.
Qué mirar:
Cómo suena la voz al principio y al final del día, si hay carraspeo, cuántas rayas tiene el registro, si la voz mejora los fines de semana (dato que confirma el abuso). Criterio: dos reglas sostenidas dos semanas y el registro con menos rayas.
Cuánto y cada cuánto:
Diez minutos por sesión para revisar el registro, y las reglas todos los días.
Para casa:
La botella de agua y la regla de no gritar entre habitaciones. Y que la familia también las cumpla: una casa donde los grandes se llaman a los gritos no se puede pedir.'),

  (null, 'speech_therapy', 'Habla y voz', 'Voz', 'Hablar fuerte sin gritar', 'activity', 'Proyectar la voz con apoyo respiratorio, en lugar de subir el volumen forzando la garganta', '8-9 años', 'Para qué sirve:
Gritar sale de la garganta y proyectar sale del aire. Se escuchan parecido y el cuerpo las vive muy distinto: el chico que aprende a proyectar puede hacerse oír en el recreo sin quedarse sin voz.
Qué necesitás:
Espacio para alejarse unos metros, y la mano para apoyar en la panza.
Cómo se presenta:
Se muestra la diferencia con el cuerpo: una frase gritada y la misma proyectada, y él pone la mano en tu garganta y después en tu panza. Sentir dónde trabaja cada una es lo que hace entendible todo el resto.
Ejercicio 1, la diferencia, sentida:
• Mano en la panza: decir hola a un metro. La panza se mueve poquito.
• A tres metros: la panza se mueve más, la garganta igual de suelta.
• A cinco metros: la panza se mueve mucho más. Si en cambio se aprieta la garganta, se vuelve a tres metros.
Ejercicio 2, el volumen que sube sin que suba el tono:
• Contar del uno al diez subiendo el volumen de a poco, manteniendo el mismo tono. Tres veces.
• Decir una frase corta en tres volúmenes: para alguien al lado, para alguien en la puerta, para alguien en el patio.
• Con la mano en la garganta: tiene que quedarse igual de suelta en las tres.
Ejercicio 3, el llamado:
Llamar a alguien que está lejos, proyectando: eh, vení. Tres veces, y después la versión gritada una vez, para comparar cómo queda la garganta. La comparación es el aprendizaje.
Progresión:
• Si sale fácil: proyectar en un espacio grande y con ruido de fondo, que es la situación real del recreo.
• Si no sale: quedate en el trabajo de respiración y en tres metros, sin subir más.
Ojo con esto:
Cinco minutos y se descansa: la voz se cansa rápido y una sesión larga deja peor de lo que empezó. Si hay disfonía que no mejora, consulta con otorrinolaringología.
Qué mirar:
Si sube el tono junto con el volumen (es la señal de que fuerza), si la garganta queda tensa, si el aire se acaba antes de la frase. Criterio: los tres volúmenes con la garganta suelta y el tono estable.
Cuánto y cada cuánto:
Cinco minutos, dos o tres veces por semana. Corto, siempre.
Para casa:
Un truco para practicar: imaginar que la voz sale por la frente y no por la boca. Tres llamados proyectados por día, y nada más.'),

  (null, 'speech_therapy', 'Habla y voz', 'Voz', 'Hablar sin forzar la garganta', 'activity', 'Instalar un modo de fonación suave y económico, con vibración y sin esfuerzo laríngeo', '10-11 años', 'Para qué sirve:
Una voz apretada se puede desarmar con ejercicios que producen vibración y bajan la resistencia en la laringe. Son los ejercicios más agradecidos de la voz: el cambio se escucha en la misma sesión.
Qué necesitás:
Un sorbete y un vaso con agua hasta la mitad, y la mano para apoyar en la cara.
Cómo se presenta:
Se empieza por los ejercicios que vibran, porque la vibración hace el trabajo sin que haya que pedir nada. Se hace con él, los dos a la vez, y se escucha la voz antes y después.
Ejercicio 1, los que vibran:
• Mmmm suave, con la mano en la nariz, cinco segundos. Cinco veces.
• Vibrar los labios como un motor, con voz, cinco segundos. Cinco veces.
• La misma vibración subiendo y bajando el tono como una sirena, tres veces.
Ejercicio 2, el sorbete en el agua:
• Soplar por el sorbete dentro del agua, haciendo burbujas parejas, con voz. Diez segundos por vez, cinco veces.
• Ahora con la voz subiendo y bajando mientras burbujea, tres veces.
• Después del sorbete, decir una frase: casi siempre suena más suelta, y conviene que lo note.
Ejercicio 3, pasar la voz nueva al habla:
• Empezar la frase con mmmm y seguir hablando desde ahí: mmmm hoy es martes. Cinco frases.
• Después sin el mmmm, buscando la misma sensación. Cinco frases.
• Después contar algo de treinta segundos con esa voz.
Progresión:
• Si sale fácil: conversación de dos minutos manteniendo la voz suelta, y lectura en voz alta.
• Si no sale: quedate en el sorbete y en el mmmm, que son los que no fallan.
Ojo con esto:
Diez a quince minutos como máximo, y se corta si aparece cansancio o carraspera. Si la disfonía persiste más de dos o tres semanas, hace falta la mirada de otorrinolaringología: la voz no se trabaja a ciegas.
Qué mirar:
Si la voz cambia entre el principio y el final de la sesión, si aparece esfuerzo visible en el cuello, si puede sostener la voz nueva en habla espontánea. Criterio: treinta segundos de habla con voz suelta, dos sesiones seguidas.
Cuánto y cada cuánto:
Diez minutos, tres veces por semana. Y el sorbete se puede hacer todos los días.
Para casa:
El sorbete en el vaso, cinco veces por diez segundos, una vez por día. Y tomar agua durante todo el día.'),

  (null, 'speech_therapy', 'Habla y voz', 'Voz', 'La voz después de un pólipo o un nódulo', 'guide', 'Acompañar la recuperación de la voz después de una cirugía o un tratamiento laríngeo, según indicación médica', '15+ años', 'Para qué sirve:
Después de una cirugía de cuerdas el resultado depende de lo que pasa en las semanas siguientes: el reposo indicado, la vuelta gradual y, sobre todo, cambiar lo que produjo la lesión. Si el uso vocal vuelve igual que antes, la lesión vuelve también.
Qué necesitás:
El informe médico y la indicación de reposo, una botella de agua, sorbete y vaso, y una hoja de registro.
Cómo se presenta:
Lo primero es leer juntos la indicación médica y respetar el reposo tal como está escrito. Nada de lo que sigue se hace antes de que el médico habilite el uso de la voz.
Ejercicio 1, el reposo y la vuelta, en orden:
• Reposo absoluto o relativo, por el tiempo que indicó el médico. Sin susurrar, que fuerza igual.
• Habilitado el uso: empezar con cinco minutos de voz suave por hora.
• Subir de a cinco minutos por día, si no aparece molestia ni ronquera al final del día.
• Volver al uso habitual recién cuando aguanta una jornada sin cambios en la voz.
Ejercicio 2, lo suave, con el alta médica:
• Sorbete en el agua con voz, diez segundos, cinco veces.
• Mmmm suave con la mano en la cara, cinco veces.
• Sirena suave con labios vibrando, tres veces.
• Frases cortas empezadas con mmmm, cinco.
Todo suave: en esta etapa no se proyecta, no se canta y no se levanta el volumen.
Ejercicio 3, cambiar lo que produjo la lesión:
Esta es la parte que evita la recaída, y hay que escribirla.
• Cuántas horas de voz por día tiene su trabajo o su actividad, y cómo se pueden recortar.
• Micrófono o amplificación, si habla para grupos.
• Pausas de voz programadas: cinco minutos cada hora, en el reloj.
• Hidratación permanente y nada de carraspear.
• Y si hay reflujo, tabaco o alcohol, eso se trata en paralelo con quien corresponda.
Progresión:
• Si sale fácil: se suben cinco minutos de voz por día, y se agrega lectura en voz alta suave.
• Si no sale: se vuelve al tiempo de uso de la semana anterior, el que toleraba sin ronquera al final del día.
Ojo con esto:
Cualquier dolor, sangrado, cambio brusco de la voz o falta de aire es motivo de consulta médica inmediata, no de ajuste de ejercicios. Y el susurro no es reposo: es esfuerzo.
Qué mirar:
Cómo está la voz al principio y al final del día, si tolera el tiempo de uso indicado, si aparece carraspeo, si volvió alguna conducta de abuso. Criterio de alta: una jornada completa de uso habitual sin cambio de voz al final del día.
Cuánto y cada cuánto:
Ejercicios suaves diez minutos, dos veces por día, y control semanal con registro.
Para casa:
El registro de cuántos minutos de voz por día y cómo está la voz a la noche. Una línea por día, para saber si se está subiendo demasiado rápido.'),

  (null, 'speech_therapy', 'Habla y voz', 'Voz', 'La voz que trabaja todo el día', 'guide', 'Prevenir y manejar el cansancio vocal en quien usa la voz como herramienta de trabajo', '15+ años', 'Para qué sirve:
Docentes, vendedores, locutores y quien atiende público usan la voz seis u ocho horas por día, sin pausas y a veces contra el ruido. La disfonía por uso profesional es previsible, y el trabajo es de organización además de técnica.
Qué necesitás:
Una hoja para el mapa del día, botella de agua, sorbete y vaso.
Cómo se presenta:
Se hace el mapa del día real: a qué hora empieza a hablar, cuánto habla seguido, cuándo aparece el cansancio. Con el mapa se deciden las pausas, y con las pausas cambia la mitad del problema.
Ejercicio 1, el mapa y las pausas:
• Anotar las horas de voz de un día típico, con los cortes que ya tiene.
• Marcar en qué momento del día aparece el cansancio.
• Poner tres pausas de voz de cinco minutos, con alarma, antes de ese momento.
• Y una regla: contra el ruido no se compite. Se baja el ruido o se usa amplificación.
Ejercicio 2, el calentamiento de la voz, antes de empezar:
Cinco minutos antes de la primera clase o el primer turno.
• Sorbete en el agua con voz, diez segundos, cinco veces.
• Mmmm suave, cinco veces.
• Sirena con labios vibrando, subiendo y bajando, tres veces.
• Dos frases de la jornada dichas con voz suelta.
Ejercicio 3, el enfriamiento y la recuperación:
• Al terminar la jornada, dos minutos de mmmm suave y sorbete.
• Hidratación durante todo el día, y vapor de agua si la voz quedó cansada.
• Nada de susurrar en la recuperación, y nada de carraspear.
• Un día por semana con la menor cantidad de voz posible, si se puede elegir.
Progresión:
• Si sale fácil: se sostienen las tres pausas y se suma el enfriamiento del final de la jornada.
• Si no sale: se recorta tiempo de voz antes de agregar ejercicios, y se revisa si hay ruido de fondo con el que está compitiendo.
Ojo con esto:
Disfonía de más de dos o tres semanas, dolor al hablar, o pérdida de voz repetida son motivo de consulta con otorrinolaringología. Y si hay reflujo, alergia o tabaco, eso se trata en paralelo: el cuidado vocal no alcanza solo.
Qué mirar:
A qué hora aparece el cansancio, si las pausas lo corren más tarde, cómo está la voz al final de la semana comparada con el lunes. Criterio: una semana completa con las tres pausas hechas y la voz del viernes parecida a la del lunes.
Cuánto y cada cuánto:
Cinco minutos de calentamiento antes de cada jornada y dos de enfriamiento al final. Todos los días de trabajo.
Para casa:
La alarma de las tres pausas puesta en el celular, y la botella de agua a la vista. Las dos cosas juntas hacen más que cualquier ejercicio.');

-- ─── Conciencia fonológica ──────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'speech_therapy', 'Conciencia fonológica', 'Sílabas', 'Contar sílabas con el cuerpo', 'game', 'Segmentar palabras en sílabas usando palmas, pasos y saltos antes de cualquier trabajo con letras', '3-5 años', 'Para qué sirve:
La sílaba es la primera unidad que un chico puede escuchar adentro de una palabra, antes del fonema. Y se escucha mejor con el cuerpo: una palmada por sílaba convierte algo invisible en algo que se cuenta.
Qué necesitás:
Nada. Un tambor, aros o cinta en el piso lo hacen mejor.
Cómo se presenta:
Lo hacés vos primero, exagerando y bien lento: ma-ri-po-sa, cuatro palmadas. Después juntos. Después él solo. El cuerpo va primero y siempre.
Ejercicio 1, palmadas:
Empezá por palabras de dos sílabas y subí.
• Dos: ca-sa, pe-rro, me-sa, so-pa, ma-no
• Tres: pe-lo-ta, ven-ta-na, za-pa-to, ca-mi-sa
• Cuatro: ma-ri-po-sa, te-lé-fo-no, bi-ci-cle-ta
Después de cada palabra, la pregunta: ¿cuántas palmadas salieron?
Ejercicio 2, pasos y saltos:
• Una sílaba, un paso adelante. La palabra más larga llega más lejos, y eso se ve.
• Con aros en el piso: un salto por sílaba.
• Dos palabras seguidas y comparar cuál llegó más lejos: mano o mariposa.
Ejercicio 3, su nombre y los de la familia:
Los nombres son las palabras que más le importan.
• Su nombre, en palmadas.
• El de la mamá, el del papá, el del hermano, el de la mascota.
• Y una pregunta que le encanta: ¿quién tiene el nombre más largo de la casa?
Progresión:
• Si sale fácil: decir la palabra sin la última sílaba, y decir cuántas sílabas tiene sin palmear.
• Si no sale: quedate en palabras de dos sílabas y palmeá vos mientras él escucha.
Qué mirar:
Si corta la palabra por donde va, si palmea de más o de menos, si puede decir el número sin volver a palmear, si le sale mejor con el cuerpo que sentado. Criterio: palabras de tres sílabas contadas bien, 8 de 10, dos sesiones seguidas.
Cuánto y cada cuánto:
Diez minutos, tres veces por semana. Corto y con el cuerpo.
Para casa:
Palmear los nombres en la mesa antes de comer, o los pasos hasta la escuela. Dos minutos, en cualquier momento.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sílabas', 'El tren de las sílabas', 'game', 'Armar palabras juntando sílabas y reconocer la sílaba que se repite entre varias palabras', '6-7 años', 'Para qué sirve:
Juntar sílabas para formar una palabra es la operación inversa de partirla, y es la que se usa para leer. Reconocer que ca está en casa, cama y camión es lo que después permite leer una sílaba nueva sin deletrear.
Qué necesitás:
Tarjetas con sílabas escritas a mano: ca, sa, me, pa, to, lo, ma, la, ta, so, pe, mi.
Cómo se presenta:
Se arman palabras poniendo dos vagones juntos, diciendo cada sílaba y después la palabra entera. Lo hacés vos dos veces, y después arma él. El tren va de izquierda a derecha, siempre, que es el orden de la lectura.
Ejercicio 1, armar palabras de dos vagones:
• ca + sa, me + sa, pa + to, lo + ma, ma + la, so + pa, pe + lo, mi + to
Que diga las dos sílabas por separado y después la palabra pegada y rápido.
Ejercicio 2, la sílaba que se repite:
Se pone una tarjeta fija (ca) y se buscan palabras que la tengan.
• Con ca al principio: casa, cama, camión, caballo, calle
• Con ca en el medio: boca, vaca, chancho no, pero muñeca sí
• Y la pregunta: ¿en qué lugar está el ca en cada una?
Ejercicio 3, palabras de tres vagones:
• ca + mi + sa, pe + lo + ta, to + ma + te, ma + le + ta, so + pa no, pero za + pa + to sí
Y después al revés: se dice la palabra y él la parte en vagones.
Progresión:
• Si sale fácil: sacar un vagón del medio y decir qué queda, y armar palabras de cuatro sílabas.
• Si no sale: dos vagones, con las sílabas más simples, y vos diciendo la palabra entera al final.
Qué mirar:
Si junta en el orden correcto, si al armar dice la palabra o se queda en las sílabas, si reconoce la sílaba repetida en distintas posiciones. Criterio: ocho palabras de dos vagones armadas y la sílaba repetida encontrada en tres palabras.
Cuánto y cada cuánto:
Quince minutos, dos o tres veces por semana.
Para casa:
Las tarjetas en un sobre, y armar tres palabras por día. Se pueden escribir en papelitos y no hace falta nada comprado.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sílabas', 'Sacar y agregar sílabas', 'activity', 'Manipular la palabra quitando o agregando una sílaba, que es más difícil que contarlas', '6-7 años', 'Para qué sirve:
Contar sílabas es escuchar; sacarlas y agregarlas es manipular, y ahí empieza la conciencia fonológica de verdad. Es la tarea que más se parece a lo que hace falta para escribir una palabra larga.
Qué necesitás:
Tapitas o fichas, una por sílaba. El apoyo concreto es lo que hace posible el ejercicio.
Cómo se presenta:
Se pone una tapita por sílaba, se saca la que corresponde con el dedo y se dice lo que queda mirando las que sobraron. La mano sostiene lo que la cabeza todavía no.
Ejercicio 1, sacar la última:
• mesa sin sa, queda me
• pelota sin ta, queda pelo
• camisa sin sa, queda cami
• zapato sin to, queda zapa
Empezá por las que dejan una palabra de verdad, que se puede reconocer.
Ejercicio 2, sacar la primera:
Más difícil, porque hay que soltar el comienzo.
• camisa sin ca, queda misa
• pelota sin pe, queda lota
• maleta sin ma, queda leta
• tomate sin to, queda mate
Ejercicio 3, agregar una sílaba:
• Agregale sa a me: mesa
• Agregale ta a pelo: pelota
• Agregale to a za pa: zapato
• Y una divertida: agregale te a toma
Progresión:
• Si sale fácil: sacar la sílaba del medio, y pasar a sacar sonidos en lugar de sílabas.
• Si no sale: volvé a contar sílabas con palmadas, sin manipular, unas cuantas sesiones.
Qué mirar:
Si necesita las tapitas, si repite la palabra entera en lugar de la parte que queda, si la primera le cuesta más que la última (es lo esperable). Criterio: sacar la última sílaba, 8 de 10, sin tapitas.
Cuánto y cada cuánto:
Diez minutos, tres veces por semana. Es exigente: mejor corto y seguido.
Para casa:
Cuatro palabras por día, oral y sin lápiz, de las que ya salieron en sesión.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sílabas', 'Las sílabas trabadas', 'activity', 'Segmentar y producir sílabas con dos consonantes, que son las que se simplifican al hablar y al escribir', '8-9 años', 'Para qué sirve:
Las sílabas con dos consonantes (pla, tra, bro) son las que se pierden al hablar y las que se escriben mal después. Trabajarlas como unidad, contando los sonidos de adentro, sirve para las dos cosas a la vez.
Qué necesitás:
Tapitas de dos colores, hoja y lápiz.
Cómo se presenta:
Se pone una tapita por sonido, con las dos consonantes de colores distintos, para que se vea que son dos y no una. Se dice lento y se señala cada tapita. Después rápido y pegado.
Ejercicio 1, contar los sonidos de la sílaba:
• pla: tres tapitas, p, l, a
• tra: tres, t, r, a
• bro: tres, b, r, o
Y comparar con pa (dos) y ta (dos). La diferencia hay que verla.
Ejercicio 2, palabras, dichas y escritas:
Cada palabra se dice lento, se cuenta la sílaba trabada y se escribe.
• plato, plancha, pluma, blanco, bloque
• tren, trabajo, tres, drama, cuadro
• brazo, libro, sobre, cabra, abrigo
• clase, clavo, flor, globo, regla
Ejercicio 3, la que se cae:
Se lee una lista rápido, buscando en cuál se pierde una consonante. Se marca la que falló y se practica cinco veces sola.
• plancha, cristal, trabajo, blanco, refrigerador, microscopio
Progresión:
• Si sale fácil: dictado de oraciones con cuatro sílabas trabadas y lectura en voz alta rápida.
• Si no sale: una sola familia (las con l) y palabras de dos sílabas.
Qué mirar:
Si pierde una consonante al hablar, si agrega una vocal en el medio, si al escribir omite la segunda consonante, si el error es el mismo hablando y escribiendo. Criterio: las veinte palabras dichas y escritas con dos errores como máximo.
Cuánto y cada cuánto:
Quince minutos, dos o tres veces por semana.
Para casa:
Cinco palabras por día, dichas y escritas. Y si aparece un error hablando, se anota, no se corrige en el momento.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Rimas', 'Poesías y canciones con rima', 'text', 'Instalar la sensibilidad a la rima con textos que se repiten, antes de pedir que produzca rimas', '3-5 años', 'Para qué sirve:
La rima es la primera pista de que las palabras tienen partes, y con tres o cuatro años no se enseña: se escucha muchas veces hasta que aparece. Un texto que se repite hace ese trabajo solo.
Qué necesitás:
Los textos impresos para vos, y ganas de repetirlos muchas veces.
Cómo se presenta:
Se dice completo varias veces en distintas sesiones, con ritmo y exagerando la palabra que rima. Recién cuando ya se lo sabe, se hace la pausa antes de la rima y se espera: ahí la completa él.
Ejercicio 1, los textos, dichos y repetidos:
• Sale el sol, se va la luna, duerme el gato en la cuna.
• Un sapo en el zapato, un ratón en el cajón.
• La araña se peina, la araña se baña, la araña se sube por la montaña.
Ejercicio 2, la pausa que él completa:
Se dice todo y se para antes de la última palabra.
• Sale el sol, se va la luna, duerme el gato en la...
• Un sapo en el zapato, un ratón en el...
Si no la completa, se dice y se repite dos veces más. No se insiste.
Ejercicio 3, la rima con el cuerpo:
Cada vez que aparece la palabra que rima, una palmada o un salto. Marcar la rima con el cuerpo la hace mucho más audible.
Progresión:
• Si sale fácil: elegir entre dos palabras cuál rima, y después producir una rima propia.
• Si no sale: un solo texto, repetido en muchas sesiones, sin pedir que complete nada.
Qué mirar:
Si completa la rima, si anticipa la palabra, si le sale con el cuerpo y no sentado, si pide el texto de nuevo (buena señal). Criterio: completa la rima de dos textos sin ayuda.
Cuánto y cada cuánto:
Cinco minutos, todas las sesiones. La repetición es el método.
Para casa:
Un texto elegido, dicho todos los días antes de dormir, siempre igual. Igual es la palabra clave: cambiarlo arruina el efecto.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Rimas', 'La cadena de rimas', 'game', 'Producir rimas propias, encadenando palabras que terminan igual', '6-7 años', 'Para qué sirve:
Reconocer una rima es un paso; producirla es otro bastante más difícil, porque hay que buscar en el vocabulario propio con una restricción de sonido. Es la tarea que mejor muestra si la conciencia fonológica está funcionando.
Qué necesitás:
Nada. Papel para anotar la cadena si se quiere ver crecer.
Cómo se presenta:
Armás vos una cadena de tres, en voz alta, exagerando el final. Después una juntos. Después arranca él. Si dice una palabra que no rima, no se corrige: se repiten las dos y se pregunta si terminan igual.
Ejercicio 1, decidir si rima o no:
Antes de producir, discriminar.
• gato y pato: ¿riman?
• casa y taza: ¿riman?
• mesa y silla: ¿riman?
• pelota y gaviota: ¿riman?
• sol y caracol: ¿riman?
Ejercicio 2, la cadena:
Cada uno agrega una palabra que rime con la anterior.
• Con ón: ratón, camión, jabón, melón, botón, corazón
• Con ato: gato, pato, zapato, rato
• Con ina: gallina, cocina, esquina, harina
• Con ente: gente, diente, puente, caliente
Ejercicio 3, la rima inventada:
Se permiten palabras que no existen, y eso lo hace mucho más fácil y más divertido: gato, pato, mato, sato, lato. Inventar muestra que entendió la regla del sonido, que es lo que se busca.
Progresión:
• Si sale fácil: rimas de dos sílabas finales (ventana y campana) y armar un verso de dos líneas.
• Si no sale: quedate en decidir si rima o no, con pares muy distintos.
Qué mirar:
Si produce o sólo reconoce, si repite la misma palabra, si acepta palabras inventadas, cuántos eslabones sostiene. Criterio: cuatro eslabones seguidos sin ayuda, dos veces.
Cuánto y cada cuánto:
Diez minutos, dos o tres veces por semana.
Para casa:
Jugar en el auto o caminando: una cadena de cuatro y se corta. Sin lápiz y sin corregir.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Rimas', 'Inventar una estrofa', 'activity', 'Producir un verso propio con rima, uniendo conciencia fonológica y lenguaje', '8-9 años', 'Para qué sirve:
Escribir dos líneas que rimen obliga a buscar palabras con una restricción de sonido y, a la vez, a que la frase signifique algo. Son las dos cosas juntas, y es la forma más entretenida de trabajarlas.
Qué necesitás:
Hoja y lápiz. Una lista de terminaciones frecuentes ayuda mucho.
Cómo se presenta:
Escribís vos una estrofa de dos líneas, en voz alta, mostrando cómo buscás la palabra del final: necesito algo que rime con ana... ventana, campana, mañana. Buscar en voz alta es la parte que hay que enseñar.
Ejercicio 1, el banco de rimas:
Antes de escribir, se junta material.
• ana: ventana, campana, mañana, hermana, banana
• ente: gente, diente, puente, caliente, presente
• ón: ratón, camión, jabón, corazón, botón
• illa: silla, orilla, zapatilla, semilla
Ejercicio 2, completar la segunda línea:
Le das la primera y él escribe la segunda, que tiene que rimar y tener sentido.
• Esta mañana me levanté... (temprano y fui a ver a mi hermana)
• Vi pasar un gran camión...
• Me dolía mucho un diente...
Ejercicio 3, la estrofa propia, de cuatro líneas:
Dos pares que rimen, sobre un tema que él elija. Al final se lee en voz alta, y ahí se escucha si la rima funciona: la prueba de una rima es el oído, no la vista.
Progresión:
• Si sale fácil: estrofa con rima cruzada (primera con tercera, segunda con cuarta), que es bastante más difícil.
• Si no sale: completar la segunda línea con vos escribiendo, y él sólo eligiendo la palabra final.
Qué mirar:
Si la rima es de sonido o de letra escrita (son distintas, y conviene notarlo), si la frase tiene sentido además de rimar, si usa el banco de rimas. Criterio: una estrofa de cuatro líneas con dos rimas que funcionan al oído.
Cuánto y cada cuánto:
Veinte minutos, una o dos veces por semana. Es una actividad de cierre muy buena.
Para casa:
Dos líneas por semana sobre algo que pasó. Y leerlas en voz alta a alguien, que es lo que las hace valer.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sonidos iniciales y finales', 'Con qué empieza, con qué termina', 'game', 'Aislar el primer y el último sonido de una palabra, en ese orden de dificultad', '6-7 años', 'Para qué sirve:
Aislar el primer sonido es el paso que conecta el habla con la escritura: es lo que permite saber con qué letra empieza. El último sonido es bastante más difícil y viene después, y conviene saber en qué orden van.
Qué necesitás:
Objetos o dibujos, dos cajas, y tarjetas con letras si ya las conoce.
Cómo se presenta:
Se dice la palabra estirando el primer sonido: sssssol empieza con /s/. Se dice el sonido, no el nombre de la letra, y si él contesta con el nombre, se acepta y se repite el sonido.
Ejercicio 1, el primer sonido:
Decís la palabra y él dice sólo el sonido inicial.
• sol, mesa, pan, luna, foca, dedo, casa, tomate, rama, jirafa
Ejercicio 2, clasificar por sonido inicial:
Dos cajas, una para cada sonido, y objetos o dibujos para repartir.
• Caja /m/: mesa, mano, mamá, mariposa, moto
• Caja /s/: sol, sopa, silla, sapo, semana
Veinte ensayos, anotando aciertos.
Ejercicio 3, el último sonido:
Más difícil, y va después de que el primero esté firme.
• pan termina con /n/
• sol termina con /l/
• mar termina con /r/
• pez termina con /s/
• reloj, papel, nariz, comer
Progresión:
• Si sale fácil: el sonido del medio, y asociar cada sonido con su letra escrita.
• Si no sale: quedate en el primer sonido con palabras que empiezan con sonidos que se pueden estirar (s, m, f, l), que son los más fáciles de aislar.
Qué mirar:
Si dice el sonido o el nombre de la letra, si necesita que estires, si el último sonido lo confunde con la última sílaba. Criterio: 8 de 10 en sonido inicial, dos sesiones seguidas, antes de pasar al final.
Cuánto y cada cuánto:
Diez a quince minutos, tres veces por semana.
Para casa:
El juego de yo veo algo que empieza con... en el auto o en la calle. Tres palabras y se corta.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sonidos iniciales y finales', 'Cambiar un sonido y que aparezca otra palabra', 'activity', 'Sustituir un sonido de la palabra por otro, que es la manipulación fonológica más exigente', '8-9 años', 'Para qué sirve:
Cambiar un sonido y darse cuenta de que apareció otra palabra es la tarea que más se parece a leer y escribir: es exactamente lo que hay que hacer para no confundir pasa con masa. Y es la que mejor predice cómo va a andar la ortografía.
Qué necesitás:
Tapitas de colores, una por sonido, y hoja y lápiz para la última parte.
Cómo se presenta:
Con tapitas: una por sonido, y la que se cambia se reemplaza por una de otro color. El cambio se ve y se toca, y eso es lo que lo hace posible al principio.
Ejercicio 1, cambiar el primer sonido:
• pasa, cambiá la p por m: masa
• sala, cambiá la s por m: mala
• foca, cambiá la f por b: boca
• pato, cambiá la p por g: gato
• casa, cambiá la c por t: tasa
Ejercicio 2, cambiar el último:
Más difícil.
• pan, cambiá la n por z: paz
• sol, cambiá la l por y: soy
• mar, cambiá la r por l: mal
• pez, cambiá la z por s: pes, que no es palabra: avisale que a veces pasa
Ejercicio 3, cambiar el del medio, y escribir:
• casa por cosa, cama por coma, pato por pito, mesa por misa
Cada par se escribe en la hoja, uno debajo del otro, para ver qué letra cambió. Ahí se une lo que se escucha con lo que se escribe.
Progresión:
• Si sale fácil: sin tapitas, y cadenas de tres cambios seguidos (pasa, masa, mesa).
• Si no sale: volvé a sacar sonidos en lugar de cambiarlos, y siempre con tapitas.
Qué mirar:
Si necesita las tapitas, si cambia el sonido pedido o otro, si al escribir el par identifica la letra que cambió. Criterio: 8 de 10 cambios de primer sonido sin tapitas, y cinco pares escritos bien.
Cuánto y cada cuánto:
Diez a quince minutos, tres veces por semana. Es de las tareas que más cansan.
Para casa:
Cinco cambios por día, orales, de los que ya salieron en sesión. Dos minutos.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sonidos iniciales y finales', 'El sonido escondido en la palabra', 'activity', 'Encontrar un sonido en cualquier posición de la palabra y decir en qué lugar está', '8-9 años', 'Para qué sirve:
Saber que un sonido está y saber dónde está son dos cosas distintas. La segunda es la que hace falta para escribir la palabra completa, y es donde se ven las omisiones del medio, que son las más frecuentes.
Qué necesitás:
Hoja con tres casilleros por palabra (principio, medio, final) y lápiz.
Cómo se presenta:
Se dice la palabra despacio y se marca en qué casillero está el sonido buscado. Lo hacés vos con dos palabras, estirando la palabra entera para que el sonido se ubique. Estirar es la estrategia.
Ejercicio 1, ¿está o no está?:
Buscamos el sonido /s/.
• sol, mesa, pan, casa, luna, pez, dedo, bolsa
Sólo sí o no, sin ubicarlo todavía.
Ejercicio 2, ¿en qué lugar está?:
Ahora con los tres casilleros, siempre con /s/.
• sol, principio · mesa, medio · pez, final · casa, medio · sopa, principio · autobús, final · bolsa, medio
Ejercicio 3, otro sonido y palabras largas:
Ahora con /r/, que es más difícil de ubicar.
• rama, cara, mar, tortuga, arena, comer, mariposa, refrigerador
Y la pregunta extra en las largas: ¿cuántas veces aparece?
Progresión:
• Si sale fácil: contar cuántas veces aparece un sonido en una oración, y escribir la palabra marcando ese sonido.
• Si no sale: quedate en está o no está, con sonidos que se pueden estirar.
Qué mirar:
Si ubica el sonido del medio (es el que más se pierde), si necesita que estires la palabra, si en las largas puede contar dos apariciones. Criterio: seis de siete palabras ubicadas bien con /s/, y cuatro con /r/.
Cuánto y cada cuánto:
Diez minutos, dos o tres veces por semana.
Para casa:
Buscar un sonido en cinco palabras por día, oral. Se puede hacer con lo que hay en la heladera.');

-- ─── Lenguaje ───────────────────────────────────────────────────────────────
--
-- Esta área no existía en el v1, y ahí estaba el problema: sus materiales de
-- vocabulario, narrativa, morfosintaxis y comprensión oral estaban archivados
-- adentro de "Articulación".

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'speech_therapy', 'Lenguaje', 'Vocabulario', 'Lotería de campos semánticos', 'game', 'Ampliar el vocabulario organizándolo por categorías, que es como se guarda y se recupera', '3-5 años', 'Para qué sirve:
Las palabras no se guardan de a una: se guardan en grupos. Un chico que tiene organizado el campo de los animales encuentra más rápido la palabra que busca, y aprende la siguiente con menos esfuerzo.
Qué necesitás:
Cartones hechos a mano con palabras y dibujos simples, y fichas para marcar.
Cómo se presenta:
Se juega a la lotería, pero antes se nombra la categoría en voz alta y se dicen tres ejemplos. Nombrar la categoría es lo que organiza: no es lo mismo decir manzana que decir manzana, que es una fruta.
Ejercicio 1, los cartones, por campo:
Cartón A, frutas: manzana, banana, naranja, pera, uva, sandía
Cartón B, animales: perro, gato, vaca, caballo, pájaro, pez
Cartón C, ropa: remera, pantalón, zapatilla, campera, gorro, media
Cartón D, casa: silla, mesa, cama, puerta, ventana, heladera
Ejercicio 2, la lotería con la categoría dicha:
Decís la palabra y la categoría: manzana, que es una fruta. Él marca. Cuando completa el cartón, dice la categoría entera en voz alta.
Ejercicio 3, qué no va acá:
Se dicen cuatro palabras y una no pertenece al campo. Tiene que decir cuál y por qué.
• manzana, pera, silla, banana
• perro, gato, mesa, vaca
• remera, pantalón, naranja, gorro
El por qué es la parte importante, aunque lo diga con sus palabras.
Progresión:
• Si sale fácil: categorías más finas (animales de la granja y animales del monte) y nombrar seis ejemplos sin cartón.
• Si no sale: dos campos bien distintos, con tres palabras cada uno, y objetos de verdad en lugar de dibujos.
Qué mirar:
Si nombra la categoría, cuántos ejemplos puede dar sin apoyo, si el que no pertenece lo encuentra y lo justifica, qué campo tiene más flojo. Criterio: un cartón completo con la categoría nombrada y dos de tres del último bloque.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana, un campo nuevo por semana.
Para casa:
Nombrar las categorías de lo que ya está: en la feria, las frutas; guardando la ropa, la ropa. Sin material y en el momento.'),

  (null, 'speech_therapy', 'Lenguaje', 'Vocabulario', 'El vocabulario que falta', 'activity', 'Enseñar palabras nuevas con definición, ejemplo y uso propio, en lugar de sólo nombrarlas', '6-7 años', 'Para qué sirve:
Una palabra escuchada una vez no queda. Para que quede hace falta encontrarla varias veces, en contextos distintos, y usarla uno mismo. Este es el procedimiento de cuatro pasos que hace que una palabra nueva se instale.
Qué necesitás:
Fichas o papelitos, y un cuento o un texto donde aparezcan las palabras.
Cómo se presenta:
Se eligen tres palabras por semana, no más, y de las que le sirven: las que aparecen en la escuela o en los cuentos que le leen. Cada palabra pasa por los cuatro pasos en la misma sesión.
Ejercicio 1, los cuatro pasos de cada palabra:
• Decirla y que la repita.
• Explicarla con palabras que ya tiene: enorme quiere decir muy muy grande.
• Dar dos ejemplos de la vida de él: un elefante es enorme, el edificio de la esquina es enorme.
• Que él haga un ejemplo propio. Este paso es el que decide si quedó.
Ejercicio 2, las tres palabras de la semana:
Ejemplo de un trío que funciona bien junto.
• enorme, diminuto, mediano
Y otros tríos posibles: veloz, lento, quieto; áspero, suave, resbaloso; alegre, aburrido, asustado.
Ejercicio 3, encontrarlas y usarlas:
• Buscar las tres palabras en un cuento que se lee juntos, y levantar la mano cuando aparecen.
• Contar algo usando las tres, en la misma historia.
• Y al final de la semana, la pregunta: ¿qué quería decir diminuto?
Progresión:
• Si sale fácil: cinco palabras por semana, y palabras más abstractas (paciencia, apurado, orgulloso).
• Si no sale: una palabra por semana, con objetos de verdad y muchos ejemplos.
Qué mirar:
Si puede dar un ejemplo propio, si la usa espontáneamente en otra sesión, si la definición que da es de uso o de categoría. Criterio: las tres palabras usadas en un ejemplo propio y recordadas a la semana siguiente.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana, tres palabras por semana. La repetición espaciada es lo que las fija: hay que volver a las de la semana pasada.
Para casa:
Las tres fichas en la heladera, y usarlas en la conversación de la semana. Que la familia las use, más que preguntarle qué significan.'),

  (null, 'speech_therapy', 'Lenguaje', 'Vocabulario', 'Sinónimos y antónimos', 'worksheet', 'Relacionar palabras por significado, para tener más de una manera de decir lo mismo', '8-9 años', 'Para qué sirve:
Tener sinónimos es tener salidas: el chico que sólo tiene una palabra para cada cosa se queda trabado cuando no la encuentra. Y los antónimos son la forma más rápida de fijar el significado de una palabra nueva.
Qué necesitás:
Hoja y lápiz. Fichas para el juego de la última parte.
Cómo se presenta:
Se explica con un ejemplo y una prueba: dos palabras son sinónimos si puedo cambiar una por la otra y la oración sigue queriendo decir lo mismo. Esa prueba se hace en voz alta con cada par.
Ejercicio 1, unir los sinónimos:
• lindo, bonito · rápido, veloz · contento, alegre · flaco, delgado
• enojado, furioso · miedo, temor · casa, hogar · empezar, comenzar
Y después la prueba de cambiarlos en una oración.
Ejercicio 2, los antónimos:
• alto, bajo · lleno, vacío · fácil, difícil · dormido, despierto
• antes, después · adentro, afuera · limpio, sucio · recordar, olvidar
Ejercicio 3, decir la misma oración de otra manera:
Se reescribe la oración cambiando las palabras marcadas por sinónimos.
• El nene contento corrió rápido hasta su casa.
• La tarea estaba difícil y el cuaderno estaba sucio.
Y la versión difícil: decir la misma cosa con antónimos y una negación. No estaba triste, en lugar de estaba contento.
Progresión:
• Si sale fácil: sinónimos con matiz (grande, enorme, gigante: no son iguales) y buscar en el diccionario.
• Si no sale: pares muy claros, con dibujos, y sólo antónimos, que son más fáciles.
Qué mirar:
Si hace la prueba de la sustitución, si nota que algunos sinónimos no son intercambiables, si tiene más antónimos que sinónimos (es lo habitual). Criterio: seis de ocho pares en cada bloque y una oración reescrita.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana.
Para casa:
Buscar otra manera de decir una oración por día, oral. Se puede hacer en la mesa con lo que alguien acaba de decir.'),

  (null, 'speech_therapy', 'Lenguaje', 'Vocabulario', 'Las palabras difíciles del texto', 'activity', 'Deducir el significado de una palabra desconocida por el contexto, antes de preguntar o buscar', '10-11 años', 'Para qué sirve:
En la escuela aparecen palabras nuevas todo el tiempo y no se puede preguntar por todas. Deducir por contexto es la estrategia que hace autónomo al chico, y es una estrategia enseñable en tres pasos.
Qué necesitás:
Un texto con dos o tres palabras difíciles, lápiz, y un diccionario para el final.
Cómo se presenta:
Lo hacés vos primero con una palabra, pensando en voz alta: no sé qué es, pero dice que lo usaron para cavar, así que debe ser una herramienta. Ese razonamiento es el contenido del material.
Ejercicio 1, los tres pasos, con una palabra:
• Leer la oración completa y la siguiente.
• Buscar pistas: qué se hace con eso, dónde está, con qué se parece.
• Decir una definición provisoria, aunque sea aproximada.
Ejercicio 2, el texto con palabras difíciles:
Texto: El arqueólogo usó una pala pequeña para retirar la tierra con sumo cuidado. Debajo apareció un ánfora intacta, de las que usaban para guardar aceite.
• ¿Qué es un arqueólogo? ¿Qué pistas hay?
• ¿Qué es un ánfora? ¿Qué pistas hay?
• ¿Qué quiere decir intacta? ¿Y sumo cuidado?
Ejercicio 3, comprobar en el diccionario:
Recién ahora se busca, y se compara con lo que había deducido. La comparación es lo que enseña: casi siempre estuvo cerca, y eso da confianza para la próxima.
Progresión:
• Si sale fácil: textos de estudio de sus materias y palabras técnicas, con la misma estrategia.
• Si no sale: una palabra por texto, con la pista subrayada por vos.
Qué mirar:
Si usa el contexto o adivina por el sonido de la palabra, si su definición provisoria se acerca, si tolera no saber del todo. Criterio: dos palabras deducidas con pistas señaladas y comparadas con el diccionario.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana, con textos reales de la escuela.
Para casa:
Una palabra por día de lo que lea: deducir primero, buscar después. Anotarlas en una lista propia.'),

  (null, 'speech_therapy', 'Lenguaje', 'Morfosintaxis', 'Ordenar la oración', 'worksheet', 'Construir oraciones bien ordenadas y notar cuándo una oración no está bien armada', '6-7 años', 'Para qué sirve:
El chico que dice la pelota el nene patea sabe lo que quiere decir, pero el orden no lo acompaña. Ordenar oraciones escritas o en tarjetas hace visible una estructura que hablando pasa muy rápido.
Qué necesitás:
Tarjetas con una palabra cada una, escritas a mano, y una tira de papel para armar la oración.
Cómo se presenta:
Se arman las tarjetas sobre la mesa en desorden y se leen así, tal cual están, para que suene raro. Que suene raro es la pista, y hay que dejarla sonar antes de arreglar nada.
Ejercicio 1, ordenar de tres y cuatro palabras:
• perro, el, corre
• come, Ana, manzana, una
• escuela, a, la, vamos
• pelota, la, patea, nene, el
Se lee en desorden, se ordena, y se lee otra vez ordenada.
Ejercicio 2, oraciones que crecen:
Se empieza con dos palabras y se agrega una cada vez, manteniendo el orden.
• El perro corre.
• El perro corre rápido.
• El perro negro corre rápido.
• El perro negro corre rápido por la calle.
Que agregue él la última, y que la oración siga sonando bien.
Ejercicio 3, cuál está mal armada:
De cada par, una está mal. Hay que decir cuál y arreglarla.
• La nena juega en la plaza. / La nena en la plaza juega la.
• Mi hermano tiene dos perros. / Mi hermano dos tiene perros.
• Ayer fuimos al cine. / Ayer al fuimos cine.
Progresión:
• Si sale fácil: oraciones con dos partes unidas por porque o pero, y oraciones en pasado y futuro.
• Si no sale: tres palabras, con tarjetas, y vos leyendo el desorden en voz alta.
Qué mirar:
Si el orden sale por oído o por prueba y error, si sostiene el orden en oraciones largas, si nota la mal armada. Criterio: cuatro oraciones ordenadas y dos de tres del último bloque.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana.
Para casa:
Armar tres oraciones por día con tarjetas, o corregir en voz alta oraciones desordenadas que diga un adulto a propósito.'),

  (null, 'speech_therapy', 'Lenguaje', 'Morfosintaxis', 'Los tiempos que cuentan cuándo pasó', 'activity', 'Usar pasado, presente y futuro con las formas correctas, incluidos los verbos irregulares frecuentes', '6-7 años', 'Para qué sirve:
Decir yo poní o mañana fui son errores de tiempo verbal, no de vocabulario, y se corrigen con práctica de la forma, no con explicaciones de gramática. Las irregulares son unas pocas y son casi siempre las mismas.
Qué necesitás:
Tres tarjetas grandes: ayer, ahora, mañana. Y dibujos o fotos de acciones.
Cómo se presenta:
Las tres tarjetas quedan sobre la mesa, de izquierda a derecha. Se dice la acción y se la ubica en una tarjeta: la línea de tiempo se ve y se toca, y así el tiempo verbal tiene dónde apoyarse.
Ejercicio 1, la misma acción en tres tiempos:
Vos das el presente y él pasa a pasado y futuro, señalando la tarjeta.
• comer: ahora como, ayer comí, mañana voy a comer
• jugar: ahora juego, ayer jugué, mañana voy a jugar
• correr, saltar, pintar, cantar
Ejercicio 2, las irregulares frecuentes:
Son las que más se equivocan, y se practican de memoria.
• poner: ayer puse, no poní
• hacer: ayer hice, no hací
• ir: ayer fui
• tener: ayer tuve
• venir: ayer vine
• decir: ayer dije
Cinco veces cada una, en una oración corta.
Ejercicio 3, contar lo de ayer y lo de mañana:
• Contar tres cosas que hizo ayer, todas en pasado.
• Contar tres cosas que va a hacer mañana, todas en futuro.
Si aparece un error, se repite la oración bien, entera, sin decir que estaba mal. La forma correcta dicha al lado enseña más que la corrección.
Progresión:
• Si sale fácil: sumá pasado imperfecto (yo jugaba) y condicional (yo iría), y relatos largos en un solo tiempo.
• Si no sale: quedate en presente y pasado con verbos regulares.
Qué mirar:
Cuáles irregulares falla, si mantiene el tiempo en un relato largo o lo mezcla, si se autocorrige. Criterio: las seis irregulares en oración, y tres cosas de ayer contadas todas en pasado.
Cuánto y cada cuánto:
Quince minutos, dos o tres veces por semana.
Para casa:
Contar en la cena tres cosas del día, en pasado. Y que quien escucha repita bien la oración si sale mal, sin corregir de frente.'),

  (null, 'speech_therapy', 'Lenguaje', 'Morfosintaxis', 'Unir dos ideas en una oración', 'activity', 'Usar conectores para juntar dos ideas, en lugar de decirlas como dos oraciones sueltas', '10-11 años', 'Para qué sirve:
Hablar y escribir con oraciones cortas y sueltas hace que el relato quede en lista. Los conectores son los que muestran la relación entre las ideas, y son pocos: causa, oposición, condición y tiempo.
Qué necesitás:
Tarjetas con conectores escritos, hoja y lápiz.
Cómo se presenta:
Se dicen dos ideas sueltas y se prueban tres conectores distintos para unirlas, viendo cómo cambia el sentido. Cambiar el conector y escuchar que cambia el significado es el ejercicio central.
Ejercicio 1, el mismo par con conectores distintos:
Ideas: llovió mucho / no fuimos a la plaza.
• Llovió mucho, así que no fuimos a la plaza.
• No fuimos a la plaza porque llovió mucho.
• Llovió mucho, pero fuimos a la plaza igual.
• Si llueve mucho, no vamos a la plaza.
Ejercicio 2, las cuatro familias de conectores:
• Causa: porque, ya que, así que, por eso
• Oposición: pero, aunque, sin embargo
• Condición: si, en caso de que
• Tiempo: cuando, mientras, antes de, después de
Una oración propia con uno de cada familia.
Ejercicio 3, unir en un texto:
Se le da un texto de oraciones cortas y tiene que reescribirlo uniendo con conectores.
• Me levanté tarde. Perdí el ómnibus. Llegué tarde al liceo. El profesor ya había empezado. No entendí la primera parte.
La versión unida tiene que decir lo mismo y sonar mejor.
Progresión:
• Si sale fácil: conectores de texto escrito (sin embargo, por lo tanto, en primer lugar) y un párrafo argumentativo.
• Si no sale: quedate en porque y pero, que son los dos más usados, con pares de ideas dados.
Qué mirar:
Si usa siempre el mismo conector, si el conector que elige corresponde a la relación, si al unir pierde información. Criterio: cuatro oraciones con conectores de familias distintas y el texto reescrito.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana.
Para casa:
Reescribir tres oraciones cortas de algo que escribió para la escuela, uniéndolas. Una vez por semana.'),

  (null, 'speech_therapy', 'Lenguaje', 'Narrativa', 'Qué pasó primero', 'worksheet', 'Ordenar temporalmente una secuencia y contarla usando marcadores de tiempo', '6-7 años', 'Para qué sirve:
Antes de contar una historia hay que poder ponerla en orden. Ordenar una secuencia de imágenes muestra si la noción de antes y después está, y da el andamio para el relato.
Qué necesitás:
Secuencias de tres y cuatro escenas, dibujadas a mano o recortadas.
Cómo se presenta:
Se ponen las escenas en desorden y se pregunta cuál es la primera, no que las ordene todas de una. Una por vez, con la pregunta de qué pasó después.
Ejercicio 1, secuencias de tres:
Se ordenan y después se cuentan.
• Rompe los huevos / mezcla y hornea / se come la torta.
• Planta la semilla / la riega / crece la flor.
• Se pone las zapatillas / corre / toma agua cansado.
Ejercicio 2, contarlo con las palabras de tiempo:
La misma secuencia, pero ahora hablada, con tres marcadores obligatorios.
• Primero..., después..., al final...
Y otras opciones para variar: antes de eso, mientras, entonces, por último.
Ejercicio 3, la escena que falta:
Se sacan dos escenas de una secuencia de cuatro y él tiene que decir qué pasó en el medio. Inferir lo que falta es más difícil que ordenar lo que está.
Progresión:
• Si sale fácil: secuencias de cinco escenas, y contarlas empezando por el final.
• Si no sale: dos escenas, con mucha diferencia entre una y otra, y vos contando primero.
Qué mirar:
Si ordena por la lógica o por lo que le llama la atención, si usa los marcadores de tiempo, si puede inferir la escena que falta. Criterio: dos secuencias de cuatro ordenadas y contadas con los tres marcadores.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana.
Para casa:
Contar en orden algo que hicieron juntos, con primero, después y al final. Una vez por día, en la cena.'),

  (null, 'speech_therapy', 'Lenguaje', 'Narrativa', 'Contame el cuento', 'activity', 'Recontar un cuento conocido con sus partes completas y en orden', '6-7 años', 'Para qué sirve:
Recontar es la puerta de la narrativa: si puede devolver un cuento que escuchó, con sus partes, después va a poder contar lo que le pasó a él. Y muestra con mucha claridad qué parte del relato le falta.
Qué necesitás:
Un cuento corto y conocido, y cuatro tarjetas con las partes: quién, dónde, qué pasó, cómo terminó.
Cómo se presenta:
Se lee el cuento una vez, completo. Después lo contás vos en cinco oraciones, señalando las cuatro tarjetas al pasar por cada parte. Después lo cuenta él con las tarjetas a la vista.
Ejercicio 1, las cuatro tarjetas:
Con el cuento fresco, una oración por tarjeta.
• Quién: los personajes.
• Dónde y cuándo.
• Qué pasó: el problema.
• Cómo terminó.
Ejercicio 2, el recontado completo:
Lo cuenta seguido, con las tarjetas adelante. Vos no interrumpís: anotás qué parte se saltea. Casi siempre es el dónde, o el final.
Ejercicio 3, el recontado sin tarjetas y con una pregunta:
Ahora sin apoyo. Y al terminar, una pregunta de las que no están en el cuento: ¿por qué te parece que hizo eso? La inferencia se agrega cuando el relato ya está armado.
Progresión:
• Si sale fácil: un cuento nuevo que no conocía, y recontarlo desde el punto de vista de otro personaje.
• Si no sale: un cuento de tres escenas, con imágenes, y las tarjetas siempre a la vista.
Qué mirar:
Qué parte se saltea, si respeta el orden, si usa los nombres de los personajes o dice él y ella, si el final cierra. Criterio: las cuatro partes presentes sin tarjetas, en dos cuentos seguidos.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana, con el mismo cuento durante una semana.
Para casa:
Que cuente el cuento de la sesión a alguien de la casa, dos veces en la semana. Quien escucha pregunta sólo por lo que falte.'),

  (null, 'speech_therapy', 'Lenguaje', 'Narrativa', 'Contar algo que me pasó', 'activity', 'Contar una experiencia propia con orden, contexto y desenlace, que es la narrativa que más se usa', '8-9 años', 'Para qué sirve:
Contar lo que le pasó es lo que más va a hacer en la vida: en la escuela, con los amigos, en la casa. Es más difícil que recontar un cuento porque no hay texto que lo sostenga, y tiene su propia estructura.
Qué necesitás:
Una hoja con cinco casilleros, y algo para grabar si se puede.
Cómo se presenta:
Contás vos algo que te pasó, corto, en cinco partes, y las vas señalando en la hoja. Escuchar un modelo completo es lo que más rápido mejora el relato propio.
Ejercicio 1, las cinco partes, en la hoja:
• Cuándo y dónde: el sábado, en la casa de mi abuela.
• Quiénes estaban.
• Qué pasó: el hecho.
• Qué sentí o qué pensé.
• Cómo terminó.
Ejercicio 2, el relato con la hoja:
Cuenta algo de la semana usando los cinco casilleros. Vos no interrumpís y anotás qué falta. Lo que más falta, casi siempre, es el cuándo y dónde al principio: los chicos arrancan en el medio del hecho.
Ejercicio 3, el relato para alguien que no sabe nada:
Ahora lo cuenta para alguien que no conoce a nadie de la historia. Eso obliga a presentar a los personajes: mi prima Sofía, que tiene diez años. Escribir o contar para un desconocido es lo que hace aparecer el contexto.
Progresión:
• Si sale fácil: sumar el por qué fue importante, y contar la misma historia en un minuto y en tres.
• Si no sale: tres partes en lugar de cinco, y vos preguntando por cada una.
Qué mirar:
Si arranca dando contexto o en el medio, si nombra a los personajes, si el relato tiene final o se apaga, si se entiende sin preguntas. Criterio: un relato con las cinco partes sin la hoja, entendible por alguien que no estuvo.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Grabar uno cada dos semanas para comparar.
Para casa:
Contar una cosa del día en la cena, con las cinco partes. Y que alguien pregunte lo que no entendió, que es la mejor devolución.'),

  (null, 'speech_therapy', 'Lenguaje', 'Narrativa', 'La historia con problema y solución', 'activity', 'Construir un relato con estructura completa, incluido el episodio de problema y resolución', '10-11 años', 'Para qué sirve:
A los diez u once años el relato tiene que tener un episodio: alguien quiere algo, algo se lo impide, hace algo al respecto y eso sale bien o mal. Sin eso el relato queda en una lista de hechos, y así se leen las composiciones de la escuela.
Qué necesitás:
Hoja, lápiz, y un cuento o una película que los dos conozcan.
Cómo se presenta:
Se desarma primero una historia conocida buscando sus partes: qué quería el personaje, qué lo frenó, qué hizo. Desarmar antes de armar es lo que hace visible la estructura.
Ejercicio 1, desarmar una historia conocida:
Cualquier película o cuento que él elija, con estas cinco preguntas.
• ¿Qué quería el personaje?
• ¿Qué se lo impedía?
• ¿Qué hizo para conseguirlo?
• ¿Le salió bien o mal?
• ¿Cómo quedó al final?
Ejercicio 2, armar una historia con esas partes:
Con un inicio dado por vos y el resto a cargo de él.
• Un chico llega al liceo nuevo y no conoce a nadie.
• Una gata queda encerrada arriba de un techo.
• Alguien encuentra una billetera con plata en la calle.
Primero el esquema de cinco líneas, después el texto.
Ejercicio 3, la historia con un problema que no se resuelve:
El desafío: contar una donde el personaje no consigue lo que quería, y que igual tenga final. Es más difícil y es lo que separa un relato armado de una lista.
Progresión:
• Si sale fácil: dos episodios encadenados, y agregarle lo que el personaje pensaba y sentía.
• Si no sale: quedate en desarmar historias conocidas, y armar con el esquema completo dado por vos.
Qué mirar:
Si el relato tiene problema o es sólo una secuencia, si la resolución se conecta con el problema, si aparece lo que el personaje siente. Criterio: una historia propia con las cinco partes, y una con problema sin resolver.
Cuánto y cada cuánto:
Veinte minutos, dos veces por semana.
Para casa:
Contar una película con las cinco preguntas, oral. Una por semana, y sin escribir nada.'),

  (null, 'speech_therapy', 'Lenguaje', 'Comprensión oral', 'Escuchá y hacé', 'game', 'Comprender y ejecutar consignas orales de complejidad creciente, sin repetición', '6-7 años', 'Para qué sirve:
Casi todo lo que pasa en una clase entra por el oído y una sola vez. Este juego mide y entrena eso: cuántos elementos puede sostener una consigna antes de que se caiga, y qué tipo de palabra lo pierde.
Qué necesitás:
Material de la mesa: lápices de colores, hojas, una tijera, una taza, tapitas.
Cómo se presenta:
Das la consigna una sola vez, sin gestos y sin señalar, y él ejecuta. Si falla, se repite una vez y se anota que hubo que repetir. No se ayuda con la mirada, que es lo que uno hace sin darse cuenta.
Ejercicio 1, consignas de dos elementos:
• Poné el lápiz rojo arriba de la hoja.
• Guardá la tijera y cerrá la cartuchera.
• Dame la tapita azul.
Ejercicio 2, consignas de tres y cuatro elementos:
• Poné el lápiz verde abajo de la taza y la tapita roja arriba.
• Antes de darme la hoja, dibujá un círculo.
• Dame todas las tapitas menos la azul.
• Tocá la mesa, después la silla y al final la puerta.
Ejercicio 3, las palabras que complican:
Acá se ve qué palabra le falla, que es el dato clínico del material.
• Espaciales: arriba, abajo, adentro, al lado, entre, detrás.
• Temporales: antes de, después de, mientras.
• Cuantificadores: todos, ninguno, menos, algunos, el último.
• Negación: no pongas el azul, dame el que no es rojo.
Progresión:
• Si sale fácil: cinco elementos, y consignas con dos condiciones (si es rojo poné arriba, si es azul abajo).
• Si no sale: dos elementos, con pausa en el medio, y objetos a la vista y al alcance.
Qué mirar:
Cuántos elementos sostiene, qué tipo de palabra lo pierde (casi siempre antes de y la negación), si empieza a hacer antes de que termines de hablar, si pide que repitas. Criterio: cuatro elementos ejecutados sin repetición, en tres consignas seguidas.
Cuánto y cada cuánto:
Diez a quince minutos, dos o tres veces por semana.
Para casa:
Los mandados de a tres cosas, dichos una sola vez. Y que repita la consigna antes de ir, que es la estrategia.'),

  (null, 'speech_therapy', 'Lenguaje', 'Comprensión oral', 'Consignas cada vez más largas', 'activity', 'Sostener consignas de varios pasos usando estrategias de repetición y de agrupamiento', '8-9 años', 'Para qué sirve:
En tercero y cuarto las consignas se alargan y nadie las repite. Lo que hace la diferencia no es la memoria: son dos estrategias enseñables, repetir para uno mismo y agrupar los pasos.
Qué necesitás:
Material de la mesa, hoja y lápiz.
Cómo se presenta:
Se enseñan las dos estrategias antes de exigir nada: repetir la consigna para uno mismo en voz baja, y agrupar los pasos en dos bloques. Vos las modelás en voz alta con la primera consigna.
Ejercicio 1, repetir antes de hacer:
Consignas de cuatro pasos, y la regla es que primero las repite en voz alta.
• Dibujá tres círculos, pintá el del medio, escribí tu nombre abajo y dobla la hoja.
• Guardá los lápices, cerrá la cartuchera, poné la hoja arriba del libro y sentate.
Ejercicio 2, agrupar en dos bloques:
La misma consigna, pero dividida por él en dos mitades antes de empezar. Agrupar baja la carga: cuatro pasos sueltos pesan más que dos bloques de dos.
• Recortá el cuadrado y el círculo, pegalos en la hoja, escribí la fecha y guardá la tijera.
Ejercicio 3, la consigna escrita, con verificación:
Ahora una consigna larga escrita, como en una prueba. La lee, la numera, la hace, y al final vuelve a la consigna tachando cada parte cumplida.
• Leé el texto, subrayá tres palabras difíciles, escribí qué significan y poné el título arriba.
Progresión:
• Si sale fácil: cinco o seis pasos, con una condición en el medio, y sin repetir en voz alta.
• Si no sale: tres pasos, repitiendo dos veces, y con los objetos a la vista.
Qué mirar:
Si repite antes de empezar, si agrupa, si pierde los pasos del medio, si al final vuelve a la consigna. Criterio: dos consignas de cuatro pasos completas, sin repetición externa.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana, y consignas largas a propósito en el resto de la sesión.
Para casa:
Una consigna de cuatro pasos por día, dicha una sola vez, con la repetición en voz alta como regla.'),

  (null, 'speech_therapy', 'Lenguaje', 'Comprensión oral', 'Escuchar una explicación y tomar nota', 'guide', 'Escuchar una explicación oral, quedarse con lo importante y anotarlo en pocas palabras', '12-14 años', 'Para qué sirve:
En liceo la información llega hablada y hay que anotarla mientras se escucha. Es una habilidad doble, escuchar y escribir a la vez, y casi nunca se enseña: se supone que se tiene.
Qué necesitás:
Un texto tuyo para leer en voz alta (dos o tres párrafos de una materia), hoja y lápiz.
Cómo se presenta:
Primero se enseña el formato de la nota: pocas palabras, no oraciones. Lo modelás tomando nota vos mientras alguien explica, y mostrás tu hoja: se ve que son diez palabras y no un dictado.
Ejercicio 1, las reglas de la nota:
• Palabras clave, no oraciones.
• Abreviar todo lo que se pueda, con abreviaturas propias.
• Una línea por idea, y un guion para los ejemplos.
• Dejar margen para completar después de clase.
Ejercicio 2, escuchar y anotar:
Leés dos párrafos a velocidad normal, una sola vez. Él toma nota. Después reconstruye la explicación mirando sólo su hoja.
Lo que no puede reconstruir es lo que no anotó, y ése es el dato: se compara su hoja con lo que faltó.
Ejercicio 3, las señales del que explica:
Se practica reconocer las frases que avisan que viene algo importante, y que son las mismas en cualquier clase.
• Lo importante acá es...
• Hay tres causas...
• Esto va a estar en la prueba.
• Por ejemplo...
• Es decir...
Se escucha una explicación y se anotan sólo las partes marcadas por esas señales.
Progresión:
• Si sale fácil: tomar nota de un video de clase y armar el resumen después, sin volver a verlo.
• Si no sale: párrafos más cortos, leídos más lento, y vos diciendo en voz alta qué anotarías.
Qué mirar:
Si anota palabras o intenta copiar todo, si puede reconstruir con su hoja, si reconoce las señales. Criterio: una explicación de dos párrafos reconstruida con su propia nota, dos veces seguidas.
Cuánto y cada cuánto:
Veinte minutos, una o dos veces por semana, con material de sus materias.
Para casa:
Tomar nota de una clase por semana con este formato, y completarla el mismo día. Completarla el mismo día es la mitad del método.');
