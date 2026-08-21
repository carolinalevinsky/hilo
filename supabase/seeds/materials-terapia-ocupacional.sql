-- Terapia ocupacional, hasta llegar a 50.
--
-- El v1 traía 3 de esta disciplina y materials-curados.sql agregó 8. Estos son
-- los 39 que faltaban.
--
-- Convenciones: subtítulo es una línea corta terminada en dos puntos, las
-- viñetas empiezan con •, y no hay rayas en el texto que lee la persona.

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'occupational_therapy', 'Motricidad fina', 'Agarre y pinza', 'La masa que se trabaja con los dedos', 'activity', 'Fortalecer la musculatura de la mano con resistencia graduada', '3-5 años', 'Qué necesitás:
Masa casera o plastilina. Cuanto más dura, más fuerza pide.
Las consignas:
• Hacer bolitas chiquitas, sólo con las yemas.
• Aplastar cada bolita con el pulgar.
• Hacer una víbora larga rodando con toda la palma.
• Cortarla en pedacitos pinchando con el índice.
• Esconder porotos adentro y sacarlos.
Lo de esconder objetos es lo mejor:
Obliga a abrir la masa con los dedos, que es un movimiento que casi no se hace de otro modo.
Cuánto:
Diez minutos. Si le duele la mano, era demasiado dura.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Agarre y pinza', 'La ropa colgada', 'game', 'Trabajar la fuerza de pinza con broches de ropa', '3-5 años', 'Qué necesitás:
Broches de ropa y una soga o el borde de una caja.
Las actividades:
• Colgar figuras de papel con un broche cada una.
• Colgar por color: los rojos de un lado, los azules del otro.
• Sacar un broche sin que se caiga la figura.
• Pasar bolitas de un vaso a otro apretando el broche.
Por qué el broche:
Pide exactamente la misma fuerza y la misma posición de dedos que después usa el lápiz.
Cuidado con esto:
Si los broches son muy duros, compensa con toda la mano y se pierde el ejercicio. Probá vos primero.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Agarre y pinza', 'Rasgar, arrugar y pegar', 'activity', 'Trabajar la fuerza y la coordinación de las dos manos con papel', '3-5 años', 'Las tres acciones y para qué sirve cada una:
Rasgar pide que las dos manos hagan fuerza en direcciones opuestas.
Arrugar trabaja el cierre completo de la mano.
Pegar pide precisión.
La actividad:
Un dibujo grande con zonas para rellenar. Rasga papel de colores, arruga las bolitas y las pega adentro de cada zona.
Progresión:
• Papel de diario, que se rasga solo.
• Papel de revista, más resistente.
• Tiras finas y parejas, que piden control.
Cuánto lleva:
Dos sesiones para un dibujo. Terminarlo importa.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Destreza manual', 'Abrir y cerrar de todo', 'activity', 'Practicar los distintos agarres que exige la vida diaria', '6-7 años', 'Qué necesitás:
Frascos con tapa a rosca, tuppers con traba, una botella con tapón, una lata, una cartuchera con cierre.
La actividad:
Adentro de cada uno hay una pieza de un rompecabezas. Hay que abrirlos todos para armarlo.
Los agarres que aparecen:
• Rosca: giro de muñeca con la mano abierta.
• Traba del tupper: pinza fuerte con el pulgar.
• Cierre: pinza fina.
• Tapón: tracción.
Por qué con un rompecabezas adentro:
Abrir frascos porque sí se abandona. Abrirlos para conseguir algo, no.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Destreza manual', 'La mano que no mira', 'activity', 'Reconocer objetos por el tacto, sin apoyo visual', '6-7 años', 'Qué necesitás:
Una bolsa de tela y objetos conocidos: una llave, una cuchara, un botón, una goma, una moneda.
Cómo se hace:
Mete la mano sin mirar, agarra uno y dice qué es antes de sacarlo.
Progresión:
• Objetos muy distintos entre sí.
• Objetos parecidos: una moneda y un botón.
• Buscar uno específico entre varios.
• Decir cuántos hay de un tipo sin sacarlos.
Lo que se trabaja:
La información que da la mano cuando el ojo no ayuda. Es la misma que se usa para encontrar algo en la mochila o abrocharse atrás.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Destreza manual', 'Mover el objeto dentro de la mano', 'activity', 'Trabajar la traslación de objetos sin usar la otra mano', '8-9 años', 'Qué es la traslación:
Mover algo de la palma a los dedos y al revés, con una sola mano. Se usa para juntar monedas, para acomodar el lápiz, para sacar algo del bolsillo.
Los ejercicios:
• Juntar cinco monedas del piso de a una, guardándolas en la palma sin soltar las anteriores.
• Después sacarlas de a una, de la palma a los dedos, para meterlas en una alcancía.
• Girar un lápiz para usar la goma, sin la otra mano.
• Dar vuelta una carta con los dedos de una mano.
Cuál cuesta más:
Sacar de a una de la palma. Casi todos vuelcan todo.
Cuántas:
Cinco repeticiones. Es un ejercicio corto y preciso.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Grafomotricidad', 'La postura antes del trazo', 'guide', 'Ordenar la posición del cuerpo, la hoja y el lápiz antes de escribir', '6-7 años', 'Lo que se revisa, en este orden:
• Los pies apoyados en el piso. Si cuelgan, un banquito.
• La cola contra el respaldo.
• La mesa a la altura del codo.
• La hoja apenas inclinada, acompañando el brazo que escribe.
• La otra mano sosteniendo la hoja, siempre.
El lápiz:
Entre el pulgar y el índice, apoyado en el dedo del medio. La punta a dos dedos del extremo.
La mano que sostiene la hoja:
Es la que más se olvida y la que más cambia el resultado. Sin ella, la hoja se mueve y el trazo compensa.
Cuándo se revisa:
Al empezar cada tarea de escritura, los primeros meses. Después sale solo.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Grafomotricidad', 'Del garabato a la letra', 'worksheet', 'Recorrer la secuencia de trazos previos a la escritura', '3-5 años', 'La secuencia, y el orden importa:
• Garabato libre.
• Línea vertical de arriba a abajo.
• Línea horizontal de izquierda a derecha.
• Círculo, siempre en la misma dirección.
• Cruz.
• Cuadrado.
• Diagonal.
• Triángulo.
Por qué ese orden:
Es el orden en que aparecen en el desarrollo. La diagonal es tardía y pedirla antes sólo genera frustración.
Cómo se practica cada una:
Primero en el aire con el brazo entero, después en una bandeja con arena o harina, después en papel grande, después en hoja.
Cuándo pasar a la siguiente:
Cuando la anterior sale sin modelo delante.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Grafomotricidad', 'Escribir en superficies raras', 'activity', 'Practicar el trazo con distintas resistencias y texturas', '6-7 años', 'La idea:
Cambiar la superficie cambia la información que recibe la mano, y eso ayuda a fijar el movimiento.
Las superficies:
• Arena o harina en una bandeja, con el dedo.
• Espuma de afeitar sobre la mesa.
• Papel de lija con crayón, que ofrece resistencia.
• Pizarra con tiza.
• Vidrio empañado.
• Papel apoyado sobre una alfombra fina.
Con cuál empezar:
Con la más blanda, y terminar en papel común.
Lo que hay que mirar:
Si el trazo mejora en las superficies con resistencia. Si es así, conviene usar lápiz más blando y papel más rugoso un tiempo.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Grafomotricidad', 'Recortar sin desesperar', 'guide', 'Enseñar el uso de la tijera por etapas', '3-5 años', 'La progresión:
• Cortes al aire, abriendo y cerrando sin papel.
• Tiras finas de papel, un corte por tira.
• Papel más ancho, dos o tres cortes seguidos.
• Línea recta gruesa.
• Línea recta fina.
• Curva amplia.
• Círculo.
• Figura con esquinas.
Lo que hace la otra mano:
Gira el papel. La tijera avanza derecho y el papel es el que rota. Si intenta girar la tijera, no va a salir nunca.
La tijera correcta:
Que corte de verdad. Una tijera roma que aplasta el papel enseña a hacer fuerza de más.
Cuánto tarda todo esto:
Meses. Es normal.'),

  (null, 'occupational_therapy', 'Integración sensorial', 'Regulación', 'La caja de la calma', 'guide', 'Armar un recurso propio para autorregularse antes de una tarea exigente', '6-7 años', 'Qué es:
Una caja que arma el chico con cosas que a él lo calman. No una que armás vos con lo que suele funcionar.
Cómo se arma:
Le ofrecés muchas opciones y prueba cada una en sesión. Entra a la caja sólo lo que él elige.
Opciones para ofrecer:
• Una pelota antiestrés.
• Masa o plastilina.
• Un retazo de tela suave.
• Tapones para los oídos.
• Un frasco con purpurina y agua.
• Algo para masticar.
Cuándo se usa:
Antes de la tarea difícil, no después del estallido.
Para la casa y la escuela:
Que haya una igual en cada lugar.'),

  (null, 'occupational_therapy', 'Integración sensorial', 'Regulación', 'El termómetro de la energía', 'worksheet', 'Reconocer el propio nivel de activación y qué lo cambia', '8-9 años', 'Los cuatro niveles:
Apagado, tranquilo, acelerado, explotado.
Para cada uno se define:
• Cómo se siente el cuerpo.
• Qué se puede hacer bien en ese estado.
• Qué ayuda a moverse al nivel de al lado.
Lo que suele descubrirse:
Que apagado también es un problema, no sólo acelerado. Muchos chicos que parecen tranquilos están apagados y no rinden.
Para subir de apagado:
Movimiento, agua fría, música, saltar.
Para bajar de acelerado:
Trabajo pesado, presión profunda, respirar largo, un lugar con menos ruido.
Cómo se usa en el día:
Se le pregunta en qué nivel está, tres veces por día, en momentos cualquiera.'),

  (null, 'occupational_therapy', 'Integración sensorial', 'Regulación', 'La dieta sensorial del día', 'guide', 'Repartir actividades reguladoras a lo largo de la jornada', '6-7 años', 'Qué es:
Un plan de actividades sensoriales distribuidas en el día, como se distribuyen las comidas. No es algo que se hace cuando está mal.
Un ejemplo de reparto:
• Al levantarse: saltar veinte veces, agua fría en la cara.
• Antes de salir: mochila con peso, caminar hasta la esquina.
• Media mañana: tomar agua con sorbete, apretar una pelota.
• Después de la escuela: quince minutos de movimiento fuerte.
• Antes de los deberes: diez minutos de trabajo pesado.
• Antes de dormir: presión profunda, luz baja.
Lo que hace que funcione:
Que sea todos los días y a la misma hora, no cuando ya se desbordó.
Cuánto tarda en verse:
Dos semanas para notar algo, un mes para estar seguro.'),

  (null, 'occupational_therapy', 'Integración sensorial', 'Modulación táctil', 'Texturas, de menos a más', 'activity', 'Ampliar la tolerancia táctil de forma gradual', '3-5 años', 'Importante antes de empezar:
Nunca se lo obliga a tocar algo. El objetivo es que se acerque, no que aguante.
El orden, de más tolerado a menos:
• Materiales secos y firmes: arroz, porotos, arena seca.
• Texturas suaves: tela, algodón, plumas.
• Materiales húmedos y firmes: masa, plastilina.
• Húmedos y blandos: espuma, gel, pintura de dedos.
• Pegajosos: engrudo, gelatina.
Cómo se avanza:
Primero con una herramienta, después con un dedo, después con la mano entera.
Con un trapo cerca, siempre:
Saber que se puede limpiar cuando quiera baja mucho la resistencia.
Cuánto se avanza por sesión:
Un paso. A veces menos.'),

  (null, 'occupational_therapy', 'Integración sensorial', 'Modulación táctil', 'La búsqueda en el arroz', 'game', 'Trabajar la tolerancia táctil buscando objetos escondidos', '3-5 años', 'Qué necesitás:
Una fuente honda con arroz o lentejas, y objetos chicos para esconder.
La actividad:
Encontrar los objetos escondidos, primero mirando y después sin mirar.
Progresión:
• Con una cuchara.
• Con dos dedos.
• Con la mano entera.
• Sin mirar.
• Buscando uno específico entre varios.
Lo que hace que sea tolerable:
Que la tarea tenga sentido. La mano se mete para encontrar algo, no para tocar arroz.
Variantes de textura:
Arroz, lentejas, fideos, arena, y más adelante algo húmedo.'),

  (null, 'occupational_therapy', 'Integración sensorial', 'Propiocepción', 'Trabajo pesado, para bajar un cambio', 'guide', 'Usar actividades de carga para organizar el cuerpo antes de estar quieto', '6-7 años', 'Qué es el trabajo pesado:
Cualquier actividad que empuja, tira o carga. Manda al cerebro información de músculos y articulaciones, y eso organiza.
Actividades, todas de casa:
• Llevar la bolsa de las compras.
• Empujar una silla de un lado al otro.
• Ayudar a mover el sillón.
• Colgarse de una barra.
• Cargar una mochila con libros por el pasillo.
• Amasar.
Cuándo hacerlo:
Diez minutos antes de la tarea que requiere estar quieto.
Cuánto dura el efecto:
Entre una y dos horas. Por eso se reparte y no se hace todo junto.'),

  (null, 'occupational_therapy', 'Integración sensorial', 'Propiocepción', 'Presión profunda en casa', 'guide', 'Enseñar a la familia recursos de presión profunda seguros', '6-7 años', 'Qué es y por qué calma:
La presión firme y sostenida sobre el cuerpo baja la activación. Es distinta del cosquilleo, que la sube.
Las formas:
• El sándwich: entre dos almohadones, presionando parejo.
• El burrito: envuelto firme en una manta, con la cabeza afuera.
• Abrazo fuerte y sostenido, no palmaditas.
• Apretar los brazos y las piernas de arriba hacia abajo, firme.
• Almohadón pesado sobre las piernas mientras mira algo.
Las reglas:
Siempre firme y parejo, nunca sobre la cabeza ni el cuello, y siempre se para cuando lo pide.
Cuánto:
Uno o dos minutos alcanzan.
Quién decide:
Él. Si lo pide, funciona. Si se lo imponen, deja de funcionar.'),

  (null, 'occupational_therapy', 'Integración sensorial', 'Propiocepción', 'El circuito de empujar y tirar', 'activity', 'Dar información propioceptiva intensa en formato de juego', '6-7 años', 'El circuito:
• Empujar una caja con libros de una pared a la otra.
• Arrastrarse por debajo de una mesa.
• Tirar de una soga con vos del otro lado.
• Llevar una mochila cargada y subir a un banquito.
• Diez saltos en el lugar.
• Empujar la pared con las dos manos, contando hasta diez.
Cuántas vueltas:
Dos. Con tres ya se cansa y se desorganiza, que es lo contrario de lo que se busca.
Cuándo usarlo:
Antes de una actividad que pide quietud, o cuando se lo ve acelerado sin motivo.
Lo que hay que mirar:
Cómo queda después. Si queda más acelerado, había demasiado salto y poco empuje.'),

  (null, 'occupational_therapy', 'Coordinación', 'Óculo-manual', 'Apuntar y acertar', 'game', 'Coordinar vista y mano en tareas de puntería graduadas', '6-7 años', 'Las actividades, de más fácil a más difícil:
• Meter pelotitas en un balde grande desde cerca.
• Embocar en una botella de boca ancha.
• Tirar aros a un palo.
• Derribar vasos apilados con una pelota.
• Encestar en un vaso desde un metro.
Lo que se ajusta:
La distancia primero, el tamaño del blanco después. Cambiar las dos cosas juntas confunde.
Con las dos manos:
Diez tiros con la dominante y cinco con la otra. Siempre menos con la no dominante, para que no se frustre.
Para observar:
Si sigue la pelota con la vista después de soltarla. Muchos chicos miran el blanco y sueltan sin mirar.'),

  (null, 'occupational_therapy', 'Coordinación', 'Bilateral', 'Las dos manos, cada una en lo suyo', 'activity', 'Coordinar una mano que sostiene con otra que actúa', '6-7 años', 'Qué se busca:
Que una mano estabilice mientras la otra trabaja. Es distinto de usar las dos para lo mismo.
Actividades:
• Cortar con tijera mientras la otra gira el papel.
• Abrir un frasco.
• Sacarle punta a un lápiz.
• Enhebrar.
• Poner clips en el borde de un cartón.
• Abrochar botones.
Para observar:
Si la mano que sostiene se olvida y suelta. Es la señal más clara de que la coordinación bilateral todavía no está.
Cómo ayudar sin hacerlo por él:
Poné tu mano sobre la que sostiene, sin apretar, sólo como recordatorio.'),

  (null, 'occupational_therapy', 'Coordinación', 'Bilateral', 'Las dos manos haciendo lo mismo', 'activity', 'Trabajar la coordinación simétrica antes de la asimétrica', '3-5 años', 'Por qué primero simétrica:
Las dos manos haciendo lo mismo al mismo tiempo es más fácil, y es el paso previo a que cada una haga algo distinto.
Las actividades:
• Amasar con las dos palmas.
• Aplaudir siguiendo un ritmo.
• Tirar una pelota grande con las dos manos.
• Recibirla con las dos.
• Estirar una banda elástica hacia los dos lados.
• Rodar un palo de amasar.
Después, alternado:
Tocar la mesa con una mano y después con la otra, cada vez más rápido.
Y recién después, asimétrico:
Una sostiene, la otra hace.'),

  (null, 'occupational_therapy', 'Coordinación', 'Cruce de línea media', 'Cruzar sin girar el cuerpo', 'activity', 'Practicar el cruce de la línea media del cuerpo', '6-7 años', 'Qué es la línea media:
Una línea imaginaria que divide el cuerpo en dos. Cruzarla con la mano es necesario para leer, escribir y vestirse.
Las actividades:
• Tocarse la rodilla derecha con la mano izquierda, alternando.
• Poner stickers en el brazo izquierdo y sacarlos con la mano derecha.
• Dibujar un ocho acostado, grande, con un solo brazo.
• Pasar objetos de una canasta a otra puesta del lado contrario, sin mover el cuerpo.
Lo que hay que mirar:
Si gira el tronco o cambia de mano al llegar al medio. Las dos cosas son formas de evitar el cruce.
Cómo ayudar:
Sentarlo con la espalda contra el respaldo, que hace más difícil girar.'),

  (null, 'occupational_therapy', 'Coordinación', 'Óculo-manual', 'Copiar un modelo con bloques', 'activity', 'Reproducir una construcción mirando un modelo', '6-7 años', 'Cómo se hace:
Armás una construcción con bloques y él arma una igual con los suyos.
Progresión:
• Tres bloques, el modelo a la vista.
• Cinco bloques.
• Ocho bloques con colores específicos.
• El modelo tapado después de mirarlo diez segundos.
• El modelo dibujado en papel en vez de armado.
Lo que se trabaja:
Mirar, retener y reproducir. Es la misma cadena que se usa para copiar del pizarrón.
Para observar:
Si mira el modelo una sola vez al principio o si vuelve a mirarlo mientras arma. Volver a mirar es una buena estrategia, no una debilidad.'),

  (null, 'occupational_therapy', 'Vida diaria (AVD)', 'Vestido', 'Aprender a atarse los cordones', 'guide', 'Enseñar el atado de cordones descomponiéndolo en pasos', '6-7 años', 'Antes de empezar:
Practicar sobre un zapato apoyado en la mesa, no sobre el pie puesto.
Con dos colores:
Cordones de dos colores distintos en el mismo zapato.
Los pasos:
• Cruzar y pasar uno por debajo del otro. Tirar.
• Hacer una gasita con el rojo.
• El azul rodea la gasita.
• Empujar el azul por el agujerito.
• Tirar de las dos gasitas.
Enseñar al revés:
Hacés vos todo menos el último paso, y ese lo hace él. Cuando lo tiene, le dejás los dos últimos.
Cuánto tarda:
Semanas. Es normal.'),

  (null, 'occupational_therapy', 'Vida diaria (AVD)', 'Vestido', 'Botones, cierres y broches', 'activity', 'Practicar los cierres de la ropa fuera del cuerpo primero', '3-5 años', 'Por qué fuera del cuerpo:
Abrocharse la propia camisa exige hacerlo al revés y sin ver. Sobre la mesa se aprende el movimiento; en el cuerpo se aplica.
El orden de dificultad:
• Botones grandes en ojal grande.
• Botones chicos.
• Cierre grueso ya enganchado.
• Cierre que hay que enganchar.
• Broche a presión.
• Hebilla.
Cómo se practica:
Con una prenda vieja apoyada en la mesa, primero de frente y después con la prenda dada vuelta.
Recién después, puesta:
Y empezando por los botones de abajo, que se ven.'),

  (null, 'occupational_therapy', 'Vida diaria (AVD)', 'Vestido', 'Vestirse solo, por partes', 'guide', 'Repartir la secuencia del vestido para ganar autonomía sin pelea', '3-5 años', 'La regla general:
Sacarse la ropa es más fácil que ponérsela. Se empieza por ahí.
El orden en que suele lograrse:
• Sacarse medias y zapatos.
• Sacarse el pantalón.
• Sacarse la remera.
• Ponerse el pantalón.
• Ponerse la remera.
• Ponerse las medias.
• Zapatos en el pie correcto.
El truco de la remera:
Apoyada en la cama con la etiqueta arriba, mete los brazos primero y la cabeza al final.
Para los zapatos:
Una calcomanía cortada al medio, media en cada zapato. Cuando el dibujo se completa, están bien puestos.
Cuánto tiempo darle:
Cinco minutos más de los que quisieras. La autonomía se pierde por apuro.'),

  (null, 'occupational_therapy', 'Vida diaria (AVD)', 'Alimentación', 'Usar bien los cubiertos', 'guide', 'Progresar en el uso de cubiertos según la exigencia motriz', '3-5 años', 'El orden:
• Cuchara con comida espesa: puré, yogur.
• Cuchara con comida suelta: arroz, cereales.
• Tenedor pinchando algo firme.
• Tenedor levantando algo suelto.
• Cuchillo untando.
• Cuchillo y tenedor juntos para cortar algo blando.
Lo que ayuda:
• Cubiertos del tamaño de su mano.
• Plato con borde alto, para empujar contra él.
• Un mantel antideslizante.
Cuándo cortar con cuchillo:
Alrededor de los siete años, y empezando por algo blando como una banana.
Lo que no ayuda:
Corregir el agarre en la mesa, delante de todos. Eso se trabaja en sesión.'),

  (null, 'occupational_therapy', 'Vida diaria (AVD)', 'Alimentación', 'Ampliar lo que come', 'guide', 'Acercarse a alimentos nuevos sin forzar', '3-5 años', 'La idea de fondo:
Comer es el último paso, no el primero. Antes hay muchos pasos que también cuentan como avance.
La escalera, y cada escalón es un logro:
• Que el alimento esté en la mesa.
• Que esté en su plato.
• Tocarlo con un cubierto.
• Tocarlo con el dedo.
• Acercarlo a la boca.
• Tocarlo con los labios.
• Lamerlo.
• Morder y escupir.
• Morder y tragar.
Cuánto se avanza:
Un escalón por semana, o menos.
Lo que retrocede todo:
Insistir, negociar con postre, o quedarse mirando. La comida vuelve a ser una pelea y se pierden meses.
Cuántos alimentos a la vez:
Uno.'),

  (null, 'occupational_therapy', 'Vida diaria (AVD)', 'Autonomía', 'La rutina de la mañana, en imágenes', 'worksheet', 'Sostener la secuencia de la mañana sin depender de un adulto', '6-7 años', 'Qué se arma:
Una tira con las cosas de la mañana en orden, en dibujos o fotos.
La secuencia típica:
Levantarse, ir al baño, vestirse, desayunar, lavarse los dientes, mochila, salir.
Cómo se hace bien:
• Las fotos son de él haciendo cada cosa, no dibujos genéricos.
• El orden lo arma él.
• Se cuelga donde empieza la rutina.
Cómo se usa:
Al principio le señalás la tira en vez de decirle qué sigue. Después la mira solo. Después ya no la necesita.
Para qué sirve de verdad:
Corta la discusión de todas las mañanas. La consigna deja de venir de una persona.'),

  (null, 'occupational_therapy', 'Vida diaria (AVD)', 'Autonomía', 'Preparar la mochila solo', 'guide', 'Ganar autonomía en la preparación de los materiales del día', '8-9 años', 'Cómo se arma el sistema:
Una lista con lo que va todos los días y un espacio para lo que cambia según el día.
Dónde se pone:
Al lado de la mochila, no en la cocina.
Cuándo se prepara:
La noche anterior, siempre. A la mañana no hay tiempo ni cabeza.
El paso que se saltea:
Revisar contra la lista al final. Se arma la mochila y no se chequea. Ese chequeo es el que hay que instalar.
Lo que hace el adulto:
Al principio revisa con él. Después pregunta si revisó. Después nada.
Cuando se olvida algo:
Se deja que pase. Un olvido con consecuencia enseña más que veinte recordatorios.'),

  (null, 'occupational_therapy', 'Vida diaria (AVD)', 'Autonomía', 'El escritorio donde se puede trabajar', 'guide', 'Organizar el espacio de tarea para sostener la atención', '8-9 años', 'Lo que se saca:
Todo lo que no se usa en esa tarea. La regla es que sobre el escritorio quede sólo lo que hace falta ahora.
Lo que se agrega:
• Una lámpara del lado contrario a la mano que escribe, para no hacer sombra.
• Un lugar fijo para cada cosa.
• Un reloj o un cronómetro a la vista.
La silla:
Pies apoyados, rodillas en noventa grados, mesa a la altura del codo.
El ruido:
Si hay ruido variable, tapones o música instrumental constante. El silencio total incomoda a algunos.
Lo que más ayuda y menos se hace:
Que sea siempre el mismo lugar. Un lugar fijo se vuelve la señal de que es hora de trabajar.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Destreza manual', 'Construir con piezas chicas', 'activity', 'Sostener la precisión manual en una tarea larga y motivante', '6-7 años', 'Con qué:
Bloques de encastre chicos, un mecano, piezas de armar.
Por qué sirve tanto:
Pide precisión, fuerza de pinza, las dos manos coordinadas y planificación, todo junto y durante un rato largo. Pocos ejercicios juntan tanto.
Cómo se gradúa:
• Piezas grandes, construcción libre.
• Piezas chicas, construcción libre.
• Con instrucciones dibujadas.
• Copiando un modelo armado.
Lo que hay que mirar:
Si busca la pieza con la vista antes de estirar la mano, o si tantea. Buscar primero es más eficiente y se puede enseñar.
Cuánto:
Quince minutos. Es de las pocas actividades donde se puede sostener tanto.'),

  (null, 'occupational_therapy', 'Coordinación', 'Óculo-manual', 'Seguir el laberinto con el dedo y después con el lápiz', 'worksheet', 'Trabajar el control del trazo dentro de un límite', '6-7 años', 'La progresión:
• Recorrer el laberinto con el dedo.
• Con el dedo, más rápido.
• Con un lápiz, camino ancho.
• Camino más angosto.
• Sin apoyar la mano en la hoja.
Lo que se trabaja:
Frenar el movimiento antes del borde. Es control, no puntería.
Para observar:
Si sale del camino siempre en las curvas o siempre en las rectas. En las curvas es control de la muñeca; en las rectas es velocidad.
Si sale mucho:
Camino más ancho, no laberinto más corto. La dificultad está en el ancho.'),

  (null, 'occupational_therapy', 'Integración sensorial', 'Regulación', 'Antes del ruido fuerte', 'guide', 'Preparar a un chico sensible al sonido para un ambiente ruidoso', '6-7 años', 'La situación:
Cumpleaños, acto escolar, supermercado, feria. Lugares que no se pueden evitar del todo.
Lo que se hace antes:
• Avisar qué va a pasar, con detalle: cuánta gente, cuánto ruido, cuánto dura.
• Acordar una señal para decir necesito salir, sin hablar.
• Acordar dónde se va cuando use la señal.
• Llevar los tapones o los auriculares, y que los tenga él.
Durante:
Salidas cortas y frecuentes antes de que se desborde, no después.
Después:
Un rato tranquilo, sin preguntas ni evaluación de cómo estuvo.
Lo que hace la diferencia:
Que la salida esté acordada de antes. Saber que se puede ir suele ser suficiente para quedarse.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Agarre y pinza', 'Los goteros y las jeringas', 'activity', 'Trabajar la fuerza sostenida de los dedos con control fino', '6-7 años', 'Qué necesitás:
Goteros, jeringas sin aguja, agua con colorante, y una bandeja con huecos o una cubetera.
Las actividades:
• Llenar cada hueco con un gotero.
• Mezclar colores gota a gota.
• Con la jeringa, llenar hasta una marca exacta.
• Pasar agua de un vaso a otro sin derramar.
Por qué funciona:
El gotero pide apretar y sostener, que es distinto de apretar y soltar. Esa fuerza sostenida es la que después mantiene el lápiz.
Cuidado:
Es sucio. Bandeja abajo y trapo al lado, o se corta el ejercicio a los dos minutos.'),

  (null, 'occupational_therapy', 'Coordinación', 'Bilateral', 'Enhebrar, de grueso a fino', 'activity', 'Coordinar las dos manos en una tarea de precisión creciente', '3-5 años', 'La progresión, y respetarla importa:
• Aros grandes en un palo parado.
• Cuentas grandes en un cordón grueso con la punta dura.
• Cuentas medianas en un cordón fino.
• Fideos tipo rigatoni en un hilo.
• Mostacillas en hilo de coser.
Lo que se trabaja:
Una mano sostiene y la otra hace. Esa división de tareas es lo que después sostiene cortar con tijera y escribir apoyando la hoja.
Si abandona rápido:
El paso es demasiado difícil. Volvé uno atrás sin comentarlo.
Para darle sentido:
Que arme un collar para alguien.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Grafomotricidad', 'El lápiz que no se agarra bien', 'guide', 'Corregir el agarre del lápiz sin pelear por él', '6-7 años', 'Lo primero:
Un agarre distinto no siempre es un problema. Se corrige si cansa, si duele, o si el trazo no sale.
Los apoyos que sirven:
• Lápiz corto, del largo de un dedo. Obliga a la pinza sola.
• Una bolita de papel apretada con los dedos anular y meñique.
• Adaptadores de goma, si le resultan cómodos.
• Escribir en una superficie vertical.
Lo que no sirve:
Corregirle la mano cada vez que escribe. Se vuelve una lucha y escribir empieza a caer mal.
Cuánto se corrige por vez:
Un minuto de escritura con el agarre nuevo, después el suyo. Se va alargando el minuto.
Cuándo ya no se corrige:
Después de los ocho o nueve años el agarre ya está fijado, y conviene trabajar la resistencia en vez de la forma.'),

  (null, 'occupational_therapy', 'Integración sensorial', 'Propiocepción', 'Masticar y chupar para regularse', 'guide', 'Usar la entrada oral como recurso de regulación', '6-7 años', 'Por qué la boca:
Masticar, chupar y soplar dan información propioceptiva fuerte, y son socialmente aceptables casi en cualquier lado.
Las opciones:
• Tomar agua con sorbete, cuanto más fino mejor.
• Un batido espeso con sorbete, que pide más fuerza.
• Chicle sin azúcar.
• Alimentos crocantes: zanahoria, manzana, tostada.
• Alimentos que piden masticar mucho: carne, pan duro.
Cuándo:
Antes o durante una tarea que pide concentración.
Lo que se evita:
Morder la ropa o los lápices. Esas conductas suelen ser esto mismo buscado sin herramienta. Dar la herramienta las hace desaparecer.'),

  (null, 'occupational_therapy', 'Vida diaria (AVD)', 'Autonomía', 'El reloj que se ve', 'guide', 'Hacer visible el paso del tiempo para chicos que no lo registran', '8-9 años', 'El problema:
Faltan diez minutos no significa nada para un chico que no percibe el tiempo. Y apurarlo tampoco.
Lo que funciona:
• Un reloj de arena del tiempo real de la tarea.
• Un cronómetro visual, de los que se van vaciando de color.
• Una alarma intermedia además de la final.
Cómo se usa:
Se muestra al empezar y se lo deja a la vista, sin comentarlo durante.
Para tareas largas:
Se parte en tramos con su propio reloj cada uno.
Lo que más ayuda:
Anticipar cuánto va a tardar antes de empezar, y comparar al final con lo que tardó de verdad. Con repetición, la estimación mejora.'),

  (null, 'occupational_therapy', 'Coordinación', 'Cruce de línea media', 'Los ochos grandes', 'activity', 'Automatizar el cruce de línea media con un movimiento continuo', '6-7 años', 'Cómo se hace:
Un ocho acostado, grande, dibujado en el aire, en una pizarra o en papel de kiosco pegado a la pared.
Con qué:
• Primero con el brazo dominante entero.
• Después con el otro.
• Después con los dos juntos, en espejo.
• Después con los dos agarrados, siguiendo el mismo recorrido.
Los ojos:
Que sigan la mano sin mover la cabeza. Esa es la mitad del ejercicio.
Cuántos:
Diez ochos por variante. Es corto.
Para qué sirve:
Es un cruce de línea media continuo y sin decisión, así que se automatiza más rápido que las actividades donde hay que pensar cada movimiento.');
