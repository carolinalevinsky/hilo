-- Fonoaudiología, hasta llegar a 50.
--
-- El v1 traía 11 y materials-curados.sql agregó 6. Estos son los 33 que faltaban.
--
-- Convenciones: subtítulo es una línea corta terminada en dos puntos, las
-- viñetas empiezan con •, y no hay rayas en el texto que lee la persona.

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'speech_therapy', 'Articulación', 'Praxias orofaciales', 'Praxias con espejo, la rutina corta', 'activity', 'Trabajar la movilidad de labios, lengua y mejillas en cinco minutos diarios', '3-5 años', 'Con espejo, siempre:
Sin verse, no puede corregir lo que hace.
Labios:
• Beso y sonrisa, alternando. Diez veces.
• Inflar los cachetes y pasar el aire de uno al otro.
• Sostener una cuchara con el labio de arriba.
Lengua:
• Sacar y meter, rápido.
• Tocar la nariz y el mentón.
• Pasar la lengua por los dientes de arriba, como limpiándolos.
• Ruido de caballo.
Cuánto:
Cinco minutos. Es más de lo que parece si se hace todos los días.
Para que no aburra:
Una tarjeta por ejercicio y que saque una al azar.'),

  (null, 'speech_therapy', 'Articulación', 'Praxias orofaciales', 'Praxias con comida', 'activity', 'Trabajar la movilidad orofacial con estímulos que motivan', '3-5 años', 'Por qué con comida:
Un chico que se cansa de las praxias frente al espejo hace lo mismo veinte veces si hay algo rico.
Las actividades:
• Untar dulce en el labio de arriba y sacarlo con la lengua.
• Un cereal pegado en el paladar, sacarlo con la punta de la lengua.
• Chupar un chupetín moviéndolo a los costados.
• Tomar algo espeso con sorbete fino.
• Sostener una galletita entre los labios sin morderla.
Lo que se trabaja en cada una:
Elevación de lengua, lateralización, fuerza labial, succión.
Con qué cuidado:
Consultar alergias antes, y nunca con un chico con dificultades de deglución sin evaluación previa.'),

  (null, 'speech_therapy', 'Articulación', 'Praxias orofaciales', 'La lengua que sube', 'activity', 'Lograr la elevación de la punta de la lengua, base de varios fonemas', '6-7 años', 'Por qué importa:
Los fonemas /l/, /r/, /d/, /t/ y /n/ necesitan la punta de la lengua arriba, detrás de los dientes. Sin ese movimiento, no salen.
Los ejercicios, en orden:
• Tocar con la lengua el punto detrás de los dientes, señalado con un poco de dulce.
• Sostenerla ahí cinco segundos.
• Sostenerla ahí con la boca abierta.
• Sostenerla ahí y decir aaaa al mismo tiempo.
• Chasquear la lengua contra el paladar, boca abierta.
El de la boca abierta es el que importa:
Si sólo lo logra con la boca casi cerrada, está ayudándose con la mandíbula.
Cuántas:
Diez repeticiones, dos veces por día.'),

  (null, 'speech_therapy', 'Articulación', 'Fonema /r/', 'La r que vibra, paso a paso', 'guide', 'Construir la vibrante múltiple desde movimientos previos', '6-7 años', 'Por qué cuesta tanto:
La r múltiple necesita que la lengua esté en el lugar justo y que pase aire suficiente para hacerla vibrar sola. No se puede vibrar a propósito.
Paso 1, encontrar el punto:
Que diga la, la, la y sienta dónde toca la lengua.
Paso 2, la t y la d rápidas:
Repetir tada, tada, tada cada vez más rápido.
Paso 3, la vibración sin palabra:
Soplar fuerte con la lengua apoyada ahí, floja. Si sale un ruido de motor, ya está.
Paso 4, con vocal:
Rrrr, rrra, rrre.
Paso 5, en palabra:
Primero al principio: rata, remo, rulo. Después en el medio: perro, carro.
Lo que no ayuda:
Pedirle que ponga la lengua fuerte. Una lengua tensa no vibra.'),

  (null, 'speech_therapy', 'Articulación', 'Fonema /r/', 'La r suave, la de cara y pera', 'activity', 'Trabajar la vibrante simple, que precede a la múltiple', '6-7 años', 'Cuál es:
La de cara, pera, aro. Un solo golpe de lengua, no una vibración.
Por qué antes que la otra:
Es más fácil y muchas veces alcanza para que el habla se entienda. La múltiple puede venir meses después.
La secuencia:
• Decir eda, eda, eda rápido. El movimiento es casi el mismo.
• Cambiar a era, era, era.
• Entre vocales: ara, ere, iri, oro, uru.
• En palabras cortas: cara, pera, aro, oreja.
• En palabras con la r al final de sílaba: mar, por, ser.
Lo que hay que escuchar:
Que sea un golpe y no una l. Confundirlas es lo más común.'),

  (null, 'speech_therapy', 'Articulación', 'Fonema /r/', 'La r adentro de un grupo', 'activity', 'Trabajar la r en grupos consonánticos, el paso que más se resiste', '8-9 años', 'Cuándo se trabaja:
Cuando la r sola ya sale bien y sostenida. Antes no.
El orden de los grupos, de más fácil a más difícil:
• Con oclusivas sordas al principio: pr, tr, cr.
• Con sonoras: br, dr, gr.
• Con f: fr.
Las palabras:
Prado, primo, tren, trabajo, crema, cruz, brazo, broma, drama, gris, grande, fruta, frío.
El truco de la vocal intermedia:
Decir peradoo y después ir acortando la vocal del medio hasta que desaparezca. Prado sale de ahí.
Lo que hay que evitar:
Corregir en habla espontánea antes de que salga en repetición. Se instala vergüenza y baja la producción.'),

  (null, 'speech_therapy', 'Articulación', 'Fonemas /s/ y /l/', 'La s que no se escapa', 'guide', 'Corregir el sigmatismo, la s que sale por los costados', '6-7 años', 'Qué se escucha:
Una s que suena mojada o que se escapa por los costados de la lengua.
El punto correcto:
Los dientes casi juntos, la lengua detrás de los de abajo o de los de arriba según el chico, y el aire saliendo por el medio en un canal.
Cómo se encuentra el canal:
• Soplar sobre el dedo puesto delante de la boca y sentir dónde sale el aire.
• Poner un sorbete delante de los dientes: el aire tiene que entrar por ahí.
• Sonreír con los dientes juntos y soplar.
La secuencia después:
Sssss sola, después sa, se, si, so, su, después palabras con s al principio, y por último con s en el medio y al final.
Lo que más tarda:
La s al final de palabra. Es la última y a veces lleva meses.'),

  (null, 'speech_therapy', 'Articulación', 'Fonemas /s/ y /l/', 'La l bien apoyada', 'activity', 'Lograr el punto articulatorio de la l', '3-5 años', 'El movimiento:
Punta de lengua arriba, detrás de los dientes, y el aire sale por los costados. Es lo contrario de la s.
Cómo se enseña:
• Boca abierta, lengua arriba, sostener.
• Con la lengua arriba, decir aaaa y bajarla de golpe. Sale la.
• Repetir la, le, li, lo, lu.
• Palabras con l al principio: luna, lápiz, lobo.
• Palabras con l en el medio: pelota, helado, molino.
• Palabras con l al final: papel, sol, árbol.
Si la reemplaza por d:
Es porque no deja salir el aire por los costados. Que sostenga la lengua arriba y sople antes de agregar la vocal.'),

  (null, 'speech_therapy', 'Articulación', 'Grupos consonánticos', 'Los grupos con l', 'activity', 'Trabajar bl, cl, fl, gl y pl', '6-7 años', 'El orden:
• pl, bl: pluma, plato, blanco, blusa.
• cl, gl: clase, clavo, globo, iglesia.
• fl: flor, flaco, flecha.
El método de la vocal que se achica:
Palato, palato, plato. Se dice con la vocal intermedia y se va acortando hasta que desaparece.
Lo que hay que escuchar:
Si dice pato en vez de plato, falta la l. Si dice palato, falta acortar.
Cuántas palabras por sesión:
Cinco, muy repetidas, y siempre las mismas cinco durante toda la semana. Cambiarlas todos los días impide que se automaticen.
Cuándo pasar al habla espontánea:
Cuando salen bien diez veces seguidas en repetición.'),

  (null, 'speech_therapy', 'Articulación', 'Grupos consonánticos', 'Las palabras largas que se comen sílabas', 'activity', 'Trabajar la estructura silábica en palabras de tres y cuatro sílabas', '6-7 años', 'Qué se escucha:
Tefono por teléfono. Pital por hospital. Se pierden sílabas del medio.
Cómo se trabaja:
• Palmear la palabra sílaba por sílaba, despacio.
• Decirla mientras se camina, un paso por sílaba.
• Poner una ficha por sílaba sobre la mesa y tocarlas al decirla.
• Sacar una ficha y notar que falta.
Las palabras que sirven:
Teléfono, mariposa, elefante, bicicleta, hospital, computadora, refrigerador.
La clave:
No es un problema de sonidos, es de estructura. Trabajar los fonemas sueltos no lo arregla.
Cuándo se resuelve:
Cuando puede decir la palabra entera sin apoyo motor.'),

  (null, 'speech_therapy', 'Habla y voz', 'Soplo y respiración', 'Juegos de soplo con propósito', 'game', 'Trabajar el control y la duración del soplo', '3-5 años', 'Para soplo largo:
• Mover una pelotita de papel por la mesa hasta una meta.
• Hacer burbujas en un vaso con sorbete, sin parar.
• Empañar un espejo y dibujar antes de que se borre.
Para soplo corto y fuerte:
• Apagar velas imaginarias, una por una.
• Volar un papelito de un solo soplido.
Para soplo fino:
• Mover una plumita sin que se caiga de la mesa.
• Sostener una pelotita de telgopor en el aire.
Cuidado con esto:
Máximo cinco minutos. Soplar mucho seguido marea, y un chico mareado no vuelve a querer.'),

  (null, 'speech_therapy', 'Habla y voz', 'Soplo y respiración', 'Respirar para hablar', 'guide', 'Coordinar la respiración con la producción del habla', '8-9 años', 'El problema que resuelve:
Chicos que se quedan sin aire a mitad de la frase, o que hablan mientras toman aire.
Los pasos:
• Respiración con la panza, acostado, cinco veces.
• Tomar aire y decir aaaa hasta que se acabe. Cronometrar.
• Tomar aire y contar hasta donde llegue.
• Tomar aire y decir una frase corta.
• Tomar aire y decir una frase larga, marcando dónde conviene volver a respirar.
Los números de referencia:
A los ocho años, sostener una vocal diez segundos es razonable. Menos de seis vale mirarlo.
Dónde respirar en una frase:
Se marca con una barra en el texto escrito, y después se saca.'),

  (null, 'speech_therapy', 'Habla y voz', 'Fluidez del habla', 'Hablar despacio, jugando', 'activity', 'Bajar la velocidad del habla sin señalar la disfluencia', '6-7 años', 'La regla de fondo:
No se le pide que hable bien. Se le propone un juego donde hablar lento es parte del juego.
Los juegos:
• Hablar como una tortuga. Vos también.
• Contar algo mientras caminás despacio, una palabra por paso.
• Decir una frase estirando las vocales.
• Turnos de tres segundos antes de contestar. Los dos.
Lo que no se hace:
Decirle tranquilo, respirá, empezá de nuevo.
Lo que sí ayuda:
Que vos también bajes la velocidad, todo el tiempo.
Para la familia:
La casa que habla más lento hace más que cualquier ejercicio.'),

  (null, 'speech_therapy', 'Habla y voz', 'Fluidez del habla', 'Qué hace la familia con la tartamudez', 'guide', 'Orientar a la familia sobre qué ayuda y qué empeora', '6-7 años', 'Lo que ayuda:
• Bajar la velocidad al hablarle, todos.
• Esperar a que termine, sin completar la frase.
• Mirarlo mientras habla, igual que siempre.
• Hacer menos preguntas y más comentarios.
• Un rato por día de charla sin apuro, de a dos.
Lo que empeora:
• Decirle respirá, pensá antes, empezá de nuevo.
• Terminarle las palabras.
• Pedirle que hable delante de visitas.
• Mostrarle preocupación en la cara.
Lo que se puede decir si él lo nombra:
A veces las palabras salen trabadas y está bien, acá nadie tiene apuro.
Cuándo consultar sin esperar:
Si dura más de seis meses, si hay tensión en la cara, o si empieza a evitar hablar.'),

  (null, 'speech_therapy', 'Habla y voz', 'Voz', 'Cuidar la voz que se usa gritando', 'guide', 'Reducir el abuso vocal en chicos con disfonía', '8-9 años', 'De dónde viene:
Gritar en el recreo, hablar fuerte en casa con la tele prendida, forzar la voz en el deporte.
Lo que se cambia:
• Tomar agua seguido, todo el día.
• En vez de gritar de lejos, acercarse.
• Bajar el volumen de la tele para no competir.
• No hablar susurrando: fuerza igual o más que hablar fuerte.
• No carraspear. Tomar agua o tragar en vez de eso.
Lo del carraspeo es lo más importante:
Es el que más daña y el que menos se registra.
Cómo se mide el avance:
Que la voz esté mejor los lunes que los viernes es señal de que la escuela es el foco.
Cuándo derivar:
Toda disfonía de más de un mes necesita una mirada otorrinolaringológica antes de seguir.'),

  (null, 'speech_therapy', 'Habla y voz', 'Voz', 'Hablar sin forzar la garganta', 'activity', 'Encontrar una emisión relajada y proyectada', '10-11 años', 'Antes de la voz, el cuerpo:
Hombros sueltos, mandíbula floja, cuello sin tensión. Una voz apretada casi siempre viene de un cuerpo apretado.
Los ejercicios:
• Bostezar y suspirar, sacando sonido al final.
• Decir mmmm sintiendo la vibración en los labios y en la nariz.
• Vibración de labios, como un motor, subiendo y bajando el tono.
• Con la mano en el pecho, decir una frase y sentir la vibración ahí.
Lo que indica que está bien:
Vibra la cara y el pecho, no la garganta.
Cuánto:
Cinco minutos. La voz se cansa y practicar de más es contraproducente.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sílabas', 'Contar sílabas con el cuerpo', 'game', 'Segmentar palabras en sílabas usando movimiento', '3-5 años', 'Cómo se hace:
Cada sílaba es un movimiento. Se dice la palabra separándola y se hace el movimiento en cada parte.
Los movimientos:
• Una palmada.
• Un salto.
• Un paso.
• Un golpe en la mesa.
• Un dedo que se levanta.
Las palabras, en orden:
Dos sílabas primero: mano, gato, pelo. Después tres: ventana, zapato. Después una: sol, pan, luz.
La de una sílaba es la más difícil:
Muchos chicos hacen dos palmadas para sol.
El paso siguiente:
Preguntarle cuántas fueron, sin decirla de nuevo.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sílabas', 'Sacar y agregar sílabas', 'activity', 'Manipular sílabas dentro de la palabra', '6-7 años', 'Los tres niveles, en orden:
• Contar sílabas.
• Sacar una sílaba: mesa sin me es sa.
• Agregar una sílaba: sa con me adelante es mesa.
• Cambiar una sílaba: mesa cambiando me por ca es casa.
Cuál se trabaja cuándo:
Sacar la primera es lo más fácil. Sacar la última cuesta más. Cambiar la del medio en una palabra de tres es el techo.
Con apoyo al principio:
Fichas sobre la mesa, una por sílaba. Se saca la ficha físicamente.
Y después sin fichas:
Sólo en la cabeza. Ese salto es el que importa.
Por qué se trabaja:
Es de lo que mejor predice cómo va a andar la lectura al año siguiente.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Rimas', 'La cadena de rimas', 'game', 'Reconocer y producir rimas en cadena', '6-7 años', 'Cómo se juega:
Uno dice una palabra, el otro dice una que rime, y sigue el primero. La cadena se corta cuando alguien no encuentra.
Reglas que ayudan:
• Valen las palabras inventadas, siempre que rimen.
• Vale pedir una pista.
• No vale repetir una que ya salió.
Si le cuesta empezar:
Dale dos opciones y que elija cuál rima.
Un escalón más:
Vos decís tres palabras y él dice cuál no rima con las otras dos.
Para qué sirve:
La rima es de los primeros indicadores de conciencia fonológica.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Rimas', 'Poesías y canciones con rima', 'text', 'Trabajar la rima desde el juego con el lenguaje oral', '3-5 años', 'Cómo se usa:
Se lee o se canta varias veces y después se deja el hueco de la rima para que lo complete él.
Un ejemplo para armar propio:
Salió el sol,
me puse el ...
Debajo de la cama
hay una ...
Por qué funciona mejor que preguntar:
Completar el hueco de una canción conocida es casi automático. Preguntar qué rima con sol es abstracto y a esta edad muchos chicos no pueden.
Después de completar:
Preguntarle en qué se parecen las dos palabras. Ahí aparece la conciencia de que comparten el final.
Con qué material:
Canciones que ya conoce. No hace falta buscar nada nuevo.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sonidos iniciales y finales', 'Con qué empieza, con qué termina', 'game', 'Aislar el primer y el último sonido de una palabra', '6-7 años', 'El orden de dificultad:
• Reconocer el sonido inicial entre dos opciones.
• Decir el sonido inicial solo.
• Buscar objetos que empiecen con ese sonido.
• Reconocer el sonido final.
• Decir el sonido final solo.
Por qué el final es más difícil:
Hay que sostener toda la palabra en la cabeza para llegar hasta el final. El inicial se agarra de entrada.
Los sonidos con los que conviene empezar:
Los que se pueden estirar: mmmm, sssss, ffff, llll. Los que no se pueden estirar, como la p o la t, son más difíciles de aislar.
Un juego para la casa:
Veo veo, pero con sonidos en vez de colores.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sonidos iniciales y finales', 'Cambiar un sonido y que aparezca otra palabra', 'activity', 'Manipular fonemas dentro de la palabra', '8-9 años', 'De qué se trata:
Cambiar un solo sonido y ver qué palabra sale. Es el nivel más alto de conciencia fonológica.
Los ejercicios:
• Cambiar el primero: casa por masa, pato por gato.
• Cambiar el último: pan por paz, sol por sos.
• Cambiar el del medio: pato por peto, mesa por misa.
• Sacar un sonido: plato sin la l es pato.
Con fichas de colores:
Una ficha por sonido. Se cambia una ficha de color y se dice la palabra nueva.
Cuándo se hace:
Cuando ya domina sílabas. Saltearse ese paso hace que esto no salga.
Por qué importa tanto:
Es exactamente la habilidad que se usa para leer y escribir palabras nuevas.'),

  (null, 'speech_therapy', 'Articulación', 'Praxias orofaciales', 'La boca cerrada y la respiración nasal', 'guide', 'Trabajar el cierre labial en chicos que respiran por la boca', '6-7 años', 'Antes que nada:
Un chico que respira por la boca todo el tiempo necesita una consulta otorrinolaringológica. Si hay una obstrucción, ningún ejercicio la resuelve.
Los ejercicios, si ya está descartado:
• Sostener un botón atado a un hilo con los labios, mientras alguien tira suave.
• Sostener un palito de helado entre los labios, sin dientes.
• Inflar los cachetes y mantener treinta segundos.
• Tomar agua con sorbete, con los labios bien cerrados.
• Un minuto de boca cerrada respirando por la nariz, mirando el reloj.
Por qué importa:
La boca abierta permanente cambia el apoyo de la lengua y con el tiempo la posición de los dientes.
Cuánto:
Dos veces por día, cinco minutos.'),

  (null, 'speech_therapy', 'Articulación', 'Fonemas /s/ y /l/', 'La s y la z, y la r y la l', 'activity', 'Discriminar pares de fonemas que se confunden', '6-7 años', 'Por qué antes de producir:
Un chico que no distingue dos sonidos al escucharlos no los va a producir distinto. La discriminación viene primero.
Los pares:
• s y z.
• r y l.
• t y d.
• p y b.
• f y j.
Los ejercicios:
• Decís dos palabras y él dice si son iguales o distintas, sin mirarte la boca.
• Decís una palabra y él señala cuál de dos dibujos es. Pera o pela. Caro o calo.
• Decís tres palabras y él dice cuál no va con las otras.
Sin mirarte la boca:
Es la parte clave. Si te mira, está leyendo labios y no discriminando.'),

  (null, 'speech_therapy', 'Habla y voz', 'Fluidez del habla', 'El habla lenta que se practica leyendo', 'activity', 'Practicar velocidad controlada con apoyo del texto', '8-9 años', 'Por qué leyendo:
Al leer no hay que pensar qué decir, así que toda la atención puede ir a cómo se dice.
La progresión:
• Leer en voz alta muy despacio, estirando las vocales.
• Leer despacio con velocidad pareja.
• Leer con velocidad normal pero sin acelerar en las frases largas.
• Contar algo con la misma velocidad de la lectura.
Con un metrónomo o palmeando:
Una palabra por golpe al principio.
Lo que se busca:
Que registre a qué velocidad va. Muchos chicos con disfluencia no perciben que están acelerando.
Con qué textos:
Algo que le interese y que ya conozca. Un texto difícil agrega carga y traba más.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sílabas', 'La sílaba que se repite', 'game', 'Reconocer sílabas comunes entre palabras', '6-7 años', 'Cómo se juega:
Se ponen tres palabras y hay que encontrar qué sílaba comparten.
Ejemplos:
Mesa, mano, mapa. Comparten ma o me.
Zapato, pato, patín. Comparten pa.
Camisa, cama, camión. Comparten ca.
El nivel siguiente:
Buscar palabras que empiecen con la misma sílaba que su propio nombre.
Y el que sigue:
Encadenar palabras donde la última sílaba de una sea la primera de la siguiente. Mesa, saco, cocina, nariz.
Ese último es un juego de sobremesa:
Se puede jugar en el auto, sin materiales, y la familia lo puede sostener sola.'),

  (null, 'speech_therapy', 'Articulación', 'Grupos consonánticos', 'Del sonido a la conversación', 'guide', 'Llevar un fonema logrado hasta el habla espontánea', '8-9 años', 'El problema clásico:
El sonido sale perfecto en la sesión y desaparece en el recreo. Faltan los pasos del medio.
La escalera completa:
• El sonido solo.
• En sílaba.
• En palabra, al principio.
• En palabra, en el medio y al final.
• En frase corta hecha.
• En frase que él inventa.
• Respondiendo preguntas.
• Contando algo.
• En conversación en sesión.
• Fuera de la sesión.
Cuántos escalones por semana:
Uno. A veces medio.
El escalón que más se saltea:
Del habla dirigida a la espontánea. Ahí conviene quedarse el doble de tiempo.
Cómo se mide:
Contando aciertos sobre diez, en cada escalón. Se pasa con ocho de diez, dos sesiones seguidas.'),

  (null, 'speech_therapy', 'Habla y voz', 'Soplo y respiración', 'El soplo que dirige', 'game', 'Trabajar la direccionalidad del soplo, no sólo la fuerza', '3-5 años', 'La diferencia:
Soplar fuerte es una cosa. Soplar hacia donde uno quiere es otra, y es la que sirve para hablar.
Las actividades:
• Un circuito dibujado en una hoja y una pelotita de papel que hay que llevar por el camino.
• Pintura líquida sobre papel, soplada con sorbete para hacer ramas.
• Un partido de fútbol soplado, con dos arcos.
• Mover una vela sin apagarla.
Lo que hay que mirar:
Si sopla con los labios en punta o con la boca abierta. En punta dirige; abierta dispersa.
Cuánto:
Cinco minutos como máximo.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sonidos iniciales y finales', 'El sonido escondido en la palabra', 'activity', 'Detectar la presencia de un fonema en cualquier posición', '8-9 años', 'La consigna:
Voy a decir palabras. Levantá la mano cuando escuches la que tenga el sonido /s/, esté donde esté.
Por qué en cualquier posición:
Detectar el sonido al principio es fácil. En el medio es mucho más difícil y es lo que hace falta para escribir.
La progresión:
• El sonido está al principio.
• Está al final.
• Está en el medio.
• Puede estar en cualquier lado.
• Decir en qué parte estaba.
Los sonidos que conviene usar:
Los continuos primero: s, m, f, l, r. Después los oclusivos.
Cuántas palabras por vuelta:
Diez, de las cuales cuatro o cinco tienen el sonido.'),

  (null, 'speech_therapy', 'Articulación', 'Fonema /r/', 'Cuando la r no llega y hay que decidir', 'guide', 'Criterios para insistir con la r o dejarla para más adelante', '8-9 años', 'La pregunta:
Cuánto tiempo se trabaja una r que no aparece.
Lo que conviene mirar:
• Si la r simple ya sale. Si sale, el habla se entiende y la múltiple puede esperar.
• Si hay movilidad de lengua suficiente.
• Si hay algún componente estructural, como un frenillo corto, que necesite otra mirada.
• Cómo lo está viviendo el chico.
Cuándo hacer una pausa:
Después de tres o cuatro meses sin ningún avance, conviene descansar dos meses y volver. La maduración a veces resuelve lo que la repetición no.
Lo que no conviene:
Insistir todas las sesiones durante un año. El costo emocional supera al beneficio.
Qué se trabaja mientras tanto:
Todo lo demás. Casi nunca la r es lo único.'),

  (null, 'speech_therapy', 'Habla y voz', 'Voz', 'La voz después de un pólipo o un nódulo', 'guide', 'Pautas de reposo y recuperación vocal', '15+ años', 'Lo primero:
Esto acompaña la indicación médica, no la reemplaza.
El reposo vocal bien entendido:
• Hablar poco, y cuando se habla, en volumen normal.
• No susurrar. Fuerza tanto o más que hablar.
• No carraspear ni toser a propósito.
• Nada de gritar, cantar ni hablar en ambientes ruidosos.
La hidratación:
Dos litros de agua por día, y vapor de agua diez minutos, dos veces.
Lo que hay que sacar mientras tanto:
Cigarrillo, alcohol, y las comidas que producen reflujo si hay reflujo.
Cuánto dura:
Lo que indique el médico. Volver antes es lo que hace que reaparezca.
La vuelta:
Gradual. Primero en casa, después en el trabajo, y por último en ambientes ruidosos.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Rimas', 'Inventar una estrofa', 'activity', 'Producir rimas propias dentro de una estructura', '8-9 años', 'La consigna:
Escribir cuatro versos donde el segundo rime con el cuarto.
Con la estructura dada:
Se le da el primer y el tercer verso, y él completa los otros dos.
Un ejemplo de andamio:
Ayer me fui a jugar
y encontré un ...
Estaba todo mojado
y quedó ...
Por qué con andamio:
Inventar cuatro versos de cero es demasiado. Completar dos es alcanzable y produce el mismo trabajo con la rima.
Después:
Que invente los cuatro.
Lo que se trabaja además:
Buscar una palabra que rime y que además tenga sentido en la frase obliga a recorrer el vocabulario, que es un ejercicio en sí mismo.'),

  (null, 'speech_therapy', 'Articulación', 'Fonemas /s/ y /l/', 'Trabalenguas graduados', 'text', 'Automatizar un fonema con textos que lo repiten', '8-9 años', 'Cómo se usan:
No como desafío de velocidad. Se dicen despacio y bien, y recién cuando salen bien se acelera.
Para la s:
Susana sale sola sin sombrero.
Seis sillas sucias secan al sol.
Para la r simple:
Para para el carro, Clara.
Miren, quieren pera y no quieren peras.
Para la r múltiple:
El perro de Ramón corre por el carril.
Ramiro riega el romero con la regadera.
Para la l:
La luna limpia la loma con la lluvia.
Lola le lleva el lápiz a Lucas.
La regla de oro:
Bien y despacio, diez veces. Rápido y mal, ninguna. Un trabalenguas dicho mal a toda velocidad refuerza el error.'),

  (null, 'speech_therapy', 'Articulación', 'Fonemas /s/ y /l/', 'Los fonemas /k/ y /g/, que se hacen atrás', 'activity', 'Lograr el punto articulatorio velar, que no se ve desde afuera', '6-7 años', 'Por qué son distintos:
La /k/ y la /g/ se hacen con la parte de atrás de la lengua contra el paladar blando. No se ven, así que el espejo no ayuda como con los otros.
Cómo se encuentra el punto:
• Acostado boca arriba: la lengua cae hacia atrás sola y el sonido sale más fácil.
• Hacer gárgaras con un poquito de agua y sentir dónde toca.
• Toser suave: la tos usa el mismo punto.
• Con un bajalenguas apoyando la punta de la lengua abajo, para que no suba.
Lo que suele pasar:
Que la reemplace por /t/ y /d/, que se hacen adelante. Casa por tasa, gato por dato.
La secuencia:
Sonido solo, después ka, ke, ki, ko, ku, después palabras que empiezan con /k/, y por último en el medio, que es donde más cuesta.'),

  (null, 'speech_therapy', 'Habla y voz', 'Voz', 'Hablar fuerte sin gritar', 'activity', 'Trabajar la intensidad de la voz con apoyo respiratorio', '8-9 años', 'La diferencia:
Gritar sale de la garganta. Proyectar sale del aire. Se escuchan parecido y el cuerpo las vive muy distinto.
Los ejercicios:
• Decir una frase a alguien que está a un metro. Después a tres. Después a cinco.
• En cada distancia, la mano en la panza: tiene que moverse más, no apretarse más la garganta.
• Contar del uno al diez subiendo el volumen de a poco, sin que suba el tono.
Lo que hay que evitar:
Que suba el tono junto con el volumen. Es la señal de que está forzando.
Un truco:
Imaginar que la voz sale por la frente y no por la boca.
Cuánto:
Cinco minutos. La voz se cansa.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sílabas', 'Las sílabas trabadas', 'activity', 'Trabajar la estructura de dos consonantes seguidas', '8-9 años', 'Qué son:
Las que tienen dos consonantes juntas antes de la vocal: pla, tri, cre, blo.
Por qué se trabajan aparte:
Son la estructura silábica más difícil del castellano y la última en aparecer. Un chico puede tener todos los fonemas bien y aun así comerse una consonante acá.
Los ejercicios:
• Palmear la palabra separando: pla to.
• Decir la sílaba estirando la primera consonante.
• Escribirla con fichas, una por sonido, y notar que hay dos antes de la vocal.
• Buscar la diferencia entre pares: pato y plato, cavo y clavo.
Los pares mínimos son lo mejor:
Cambiar el significado con un solo sonido es lo que hace que se note por qué importa.'),

  (null, 'speech_therapy', 'Habla y voz', 'Fluidez del habla', 'Contar un cuento con apoyo de imágenes', 'activity', 'Sostener una narración larga con menos carga de planificación', '6-7 años', 'Por qué con imágenes:
Narrar exige decidir qué contar y cómo decirlo al mismo tiempo. Las imágenes resuelven la primera mitad y liberan atención para la segunda.
Cómo se hace:
Cuatro o cinco imágenes en orden. Cuenta la historia mirándolas.
La progresión:
• Con las imágenes a la vista y en orden.
• Con las imágenes desordenadas, que él las ordene primero.
• Con las imágenes dadas vuelta después de mirarlas.
• Sin imágenes.
Lo que se mira:
Si aparecen los conectores. Y después. Entonces. Al final. Un relato sin conectores es una lista.
Para la casa:
Contar la película que vio, con las mismas cuatro partes.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Sonidos iniciales y finales', 'Comprender consignas cada vez más largas', 'activity', 'Trabajar la comprensión oral con instrucciones encadenadas', '6-7 años', 'Por qué está acá:
Un chico que no entiende la consigna no puede hacer el ejercicio, y a veces se confunde una dificultad de comprensión con una de articulación.
La progresión:
• Una acción: agarrá el lápiz.
• Dos acciones: agarrá el lápiz y ponelo en la caja.
• Con un adjetivo: agarrá el lápiz rojo.
• Con dos: agarrá el lápiz rojo y el papel chico.
• Con negación: agarrá todo menos el lápiz.
• Con condición: si hay tres lápices, dame dos.
Sin repetir la consigna:
La primera vez se dice una sola vez. Si no salió, se repite y se anota que hizo falta.
Dónde se traba:
La negación y la condición son las dos que más cuestan y las últimas en llegar.'),

  (null, 'speech_therapy', 'Conciencia fonológica', 'Rimas', 'El vocabulario que falta', 'activity', 'Ampliar el vocabulario agrupando por campos', '6-7 años', 'Por qué por campos:
Las palabras sueltas se olvidan. Agrupadas por tema quedan enganchadas entre sí y se recuperan más fácil.
Los campos que sirven:
La casa, la ropa, los alimentos, los animales, el cuerpo, la escuela, los transportes.
Para cada campo:
• Nombrar todo lo que se le ocurra, en un minuto.
• Agregar vos tres que no dijo.
• Agrupar dentro del campo: animales de la casa, de la granja, del monte.
• Decir para qué sirve cada uno.
La categorización es lo que más suma:
Poder decir que un perro es un animal y una silla es un mueble organiza el vocabulario entero.
Para observar:
Si nombra muchos pero no puede agrupar, el problema no es de cantidad.');
