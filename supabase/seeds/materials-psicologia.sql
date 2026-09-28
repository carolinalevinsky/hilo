-- Psicología: la biblioteca compartida completa de la disciplina.
--
-- Escrita contra el estándar de docs/materiales.md. El molde de casi todos es el
-- de una ficha de terapia cognitivo conductual: psicoeducación breve, ejemplo
-- resuelto, práctica propia, y tarea entre sesiones. Con adolescentes, el
-- experimento conductual con la predicción escrita antes de probar, porque una
-- predicción específica se puede desmentir y una vaga no.
--
-- Nada de esto diagnostica ni concluye: un material describe lo que se observa.
-- Y los que trabajan con adolescentes dicen explícitamente cuándo lo que apareció
-- en la hoja deja de ser tarea de una ficha.
--
-- Convenciones del texto, que las dibuja DocumentBody:
--   Una línea corta terminada en dos puntos y de hasta 60 caracteres es subtítulo.
--   Toda otra línea es un párrafo. Las viñetas empiezan con "• ".
--   Sin rayas, sin guiones largos y sin emoji: esto se imprime.

-- ─── Emociones ──────────────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'El monstruo de colores, versión propia', 'activity', 'Asociar cada emoción con un color y un lugar del cuerpo, para poder nombrarla sin palabras difíciles', '3-5 años', 'Para qué sirve:
Con tres o cuatro años las emociones se mezclan y no tienen nombre: todo es estoy mal. Ponerle un color a cada una da una forma de nombrarlas antes de tener las palabras, y de ahí en adelante se puede hablar de ellas.
Qué necesitás:
Hojas, lápices o témperas de colores, frascos o vasos transparentes, y lana o papel de colores.
Cómo se presenta:
Se elige un color por emoción, y los elige él, no vos. Después se dibuja cada una y se cuenta una situación en la que apareció. La secuencia es color, dibujo, situación: de lo concreto a lo que le pasó.
Ejercicio 1, elegir el color de cada emoción:
Cinco emociones, ni una más.
• Alegría.
• Tristeza.
• Enojo.
• Miedo.
• Tranquilidad.
Que diga por qué ese color, aunque la razón sea rara: la razón es suya.
Ejercicio 2, los frascos y la mezcla:
• Un frasco por emoción, con lana o papelitos del color que eligió.
• Un frasco vacío para los días en que está todo mezclado, que es como se siente casi siempre.
• Cada día, poner un papelito del color que siente en el frasco del día.
Ejercicio 3, cuándo me pasó cada una:
Para cada color, una situación concreta y reciente, contada por él.
• El rojo fue cuando mi hermano me sacó el juguete.
• El azul fue cuando se fue la abuela.
Y una pregunta más: ¿qué hizo tu cuerpo ahí? Dónde la sintió importa tanto como el nombre.
Progresión:
• Si sale fácil: sumar dos emociones nuevas (vergüenza, entusiasmo) y mezclas de dos colores.
• Si no sale: tres emociones (alegría, enojo, tristeza), y trabajar sobre dibujos o fotos antes de sus propias situaciones.
Qué mirar:
Si distingue las cinco, si puede dar una situación propia, si ubica la emoción en el cuerpo, si alguna emoción no aparece nunca. Criterio: cinco emociones nombradas con su color y una situación propia en tres de ellas.
Cuánto y cada cuánto:
Quince minutos, una o dos veces por semana. Los frascos se usan todos los días, en casa.
Para la familia:
Nombrar los colores en el día: parece que estás en rojo. Y nombrar los propios también, que es lo que más enseña: yo hoy estoy medio azul.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'El termómetro de las emociones', 'worksheet', 'Diferenciar la intensidad de una emoción, no sólo su nombre', '3-5 años', 'Para qué sirve:
Un chico que sólo tiene enojado no puede avisar antes: o está bien o explotó. El termómetro agrega la intensidad, y con la intensidad aparece la posibilidad de decir algo cuando todavía se puede hacer algo.
Qué necesitás:
Cartulina, lápices de colores, y un clip o un broche que se mueva por la escala.
Cómo se presenta:
Se dibuja un termómetro grande con tres niveles, y cada nivel se dibuja y se nombra con sus palabras. Lo importante es que el nivel del medio tenga nombre: es el que sirve para avisar.
Ejercicio 1, los tres niveles, dibujados:
• Un poquito: me molesta, puedo seguir jugando.
• Bastante: ya me cuesta, necesito algo.
• Mucho: no aguanto más, exploto.
Para cada nivel, cómo se le pone la cara y qué hace el cuerpo.
Ejercicio 2, ubicar situaciones en el termómetro:
Se cuentan situaciones y él mueve el clip.
• Se te cayó la torre que estabas armando.
• Tu hermano te sacó el juguete.
• Te dijeron que no podés ver la tele.
• Te perdiste en el supermercado un minuto.
• Se te rompió algo que querías mucho.
Ejercicio 3, qué hago en cada nivel:
Dos cosas por nivel, elegidas por él y dibujadas al costado del termómetro.
• Un poquito: respiro, sigo.
• Bastante: aviso, tomo agua, pido ayuda.
• Mucho: voy al rincón tranquilo, abrazo fuerte, no hablo todavía.
Progresión:
• Si sale fácil: cinco niveles y el mismo termómetro para otras emociones (miedo, entusiasmo).
• Si no sale: dos niveles, bien y mal, y trabajar sólo el reconocimiento.
Qué mirar:
Si ubica las situaciones con coherencia, si reconoce el nivel del medio (es el que cuesta), si puede avisar antes del tercero. Criterio: cinco situaciones ubicadas y un aviso hecho en el nivel del medio, en la vida real.
Cuánto y cada cuánto:
Quince minutos, una o dos veces por semana, y el termómetro colgado en casa.
Para la familia:
Preguntar en qué número está en lugar de preguntar qué le pasa. Y cuando avisa en el nivel del medio, responder rápido: eso es lo que hace que la próxima vez avise.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'El diario de las tres caras', 'worksheet', 'Registrar la emoción del día con su situación, para poder ver un patrón en lugar de un episodio', '6-7 años', 'Para qué sirve:
Una emoción suelta no dice mucho; veinte registros sí. El diario sirve para que aparezca el patrón, y para que el chico vea que las emociones tienen causas y no le caen encima de la nada.
Qué necesitás:
Una hoja por semana con siete filas, lápices de colores, y un lugar fijo donde guardarlo.
Cómo se presenta:
Se hace en la sesión las dos primeras semanas, para que quede claro el formato, y después se lleva a casa. Una fila por día, tres cosas por fila: la cara, qué pasó, y qué hice.
Ejercicio 1, la fila de cada día:
• La cara: la dibuja él, con la boca que corresponde.
• Qué pasó: una frase corta, o un dibujo si no escribe.
• Qué hice: una palabra.
Nada más. Si la fila es más larga, no se completa.
Ejercicio 2, buscar el patrón, al final de la semana:
Se mira la hoja completa y se buscan tres cosas.
• ¿Qué cara apareció más veces?
• ¿Hay un día de la semana que siempre es igual?
• ¿Hay una situación que se repite?
Ejercicio 3, el día que fue distinto:
Se elige el mejor día de la semana y se pregunta qué lo hizo distinto. Buscar lo que funcionó es tan útil como buscar el problema, y casi nunca se hace.
Progresión:
• Si sale fácil: sumar la intensidad del uno al cinco, y una cuarta columna con qué me ayudó.
• Si no sale: tres días por semana en lugar de siete, y sólo la cara y el dibujo.
Qué mirar:
Si completa el registro, si las emociones que anota se corresponden con lo que se ve, si aparece un patrón por día o por situación, si alguna emoción no aparece nunca. Criterio: dos semanas de registro con al menos cinco filas por semana.
Cuánto y cada cuánto:
Dos minutos por día en casa, y diez minutos por sesión para mirarlo juntos.
Para la familia:
Se completa a la misma hora, siempre, y sin corregir lo que puso. Si dice que estuvo bien un día que la familia vio difícil, se anota igual: la hoja es suya.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'Cara, cuerpo y situación', 'worksheet', 'Reconocer emociones en otros usando las tres fuentes de información: la cara, el cuerpo y el contexto', '6-7 años', 'Para qué sirve:
Reconocer lo que siente otro no se hace sólo mirando la cara: el cuerpo y la situación dicen la mitad. Un chico que sólo mira la cara se confunde seguido, y esto le da dos fuentes más.
Qué necesitás:
Fotos de revistas o impresas, hojas, y un espejo.
Cómo se presenta:
Se trabaja con las tres fuentes por separado y después juntas. La regla que hay que instalar es la de mirar tres cosas antes de decidir, y se dice en voz alta cada vez.
Ejercicio 1, sólo la cara:
Cinco fotos, tapando el cuerpo.
• ¿Qué emoción es? ¿Qué parte de la cara te lo dice?
• Las cejas, la boca y los ojos, señalados de a uno.
• Y en el espejo, poner él esa misma cara.
Ejercicio 2, sólo el cuerpo:
Ahora tapando la cara.
• Hombros caídos, puños cerrados, cuerpo encogido, brazos abiertos.
• ¿Qué emoción puede ser?
• Y actuarla él, con el cuerpo y la cara neutra.
Ejercicio 3, la situación que decide:
La misma cara en dos situaciones distintas, y la emoción cambia.
• Una cara de sorpresa en un cumpleaños, y la misma cara en un examen.
• Alguien llorando cuando ganó, y alguien llorando cuando perdió.
Acá se ve que la situación manda, y es la información que más se ignora.
Progresión:
• Si sale fácil: emociones mezcladas y caras ambiguas, y adivinar qué pasó antes de la foto.
• Si no sale: tres emociones básicas, con fotos muy claras, y trabajar primero con las caras que él mismo hace en el espejo.
Qué mirar:
Si usa las tres fuentes o sólo la cara, cuáles emociones confunde (enojo y miedo es lo más común), si puede actuarlas. Criterio: cuatro de cinco fotos con la emoción nombrada y la pista señalada.
Cuánto y cada cuánto:
Quince minutos, una o dos veces por semana.
Para casa:
En una serie o una película, parar y preguntar qué le pasa a ese, y por qué lo sabés. Dos veces por capítulo alcanza.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'El diccionario de emociones propio', 'worksheet', 'Ampliar el vocabulario emocional más allá de las cuatro palabras de siempre', '8-9 años', 'Para qué sirve:
Con cuatro palabras (bien, mal, enojado, triste) no se puede pensar lo que se siente. Cada palabra nueva es una distinción nueva: estar fastidiado no es lo mismo que estar furioso, y poder decirlo cambia lo que se hace con eso.
Qué necesitás:
Un cuaderno chico o fichas, y lápiz.
Cómo se presenta:
Se arma de a tres palabras por semana, y cada una entra con cuatro cosas: qué es, cuándo me pasó, cómo se siente en el cuerpo, y qué me ayuda. Las escribe él, aunque escriba poco.
Ejercicio 1, las familias de palabras:
Se arranca por una familia y se ordenan por intensidad.
• Enojo: fastidiado, molesto, enojado, furioso.
• Tristeza: desanimado, triste, angustiado.
• Miedo: inquieto, nervioso, asustado, aterrado.
• Alegría: contento, entusiasmado, eufórico.
Ejercicio 2, la ficha de cada palabra:
Tres palabras por semana, una ficha cada una.
• Qué quiere decir, con sus palabras.
• Una vez que me pasó.
• Dónde lo sentí en el cuerpo.
• Qué me ayudó, o qué habría ayudado.
Ejercicio 3, usarlas durante la semana:
• Al empezar la sesión, elegir una palabra del diccionario para describir la semana.
• Y buscar una palabra nueva cuando ninguna de las que tiene alcanza.
Progresión:
• Si sale fácil: palabras de emociones mezcladas y sociales (culpa, vergüenza, orgullo, celos, alivio).
• Si no sale: una palabra por semana, y dos familias solamente.
Qué mirar:
Cuántas palabras usa espontáneamente, si distingue intensidades dentro de una familia, si alguna familia le resulta ajena, si puede dar un ejemplo propio. Criterio: nueve fichas hechas y tres palabras usadas espontáneamente.
Cuánto y cada cuánto:
Diez minutos por sesión, tres palabras por semana, con repaso de las anteriores.
Para casa:
Una palabra nueva usada por semana en la mesa, y que los adultos usen las suyas también: hoy estoy fastidiada, no enojada con vos.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'El cuerpo como aviso', 'worksheet', 'Mapear dónde se siente cada emoción en el propio cuerpo, para reconocerla antes de que sea grande', '10-11 años', 'Para qué sirve:
El cuerpo avisa antes que la cabeza. Un chico que reconoce el calor en la cara puede hacer algo con eso; uno que sólo nota que ya gritó, no. El mapa corporal es la herramienta más directa para eso.
Qué necesitás:
Una silueta del cuerpo grande dibujada en una hoja, lápices de colores, y una segunda copia para guardar.
Cómo se presenta:
Se dibuja la silueta grande, se elige un color por emoción, y se pinta dónde la siente. Vos hacés la tuya al mismo tiempo y la mostrás: que un adulto también tenga nervios en la panza saca la idea de que esto es un problema suyo.
Ejercicio 1, pintar el mapa:
Un color por emoción, y se puede pintar más de un lugar.
• Nervios.
• Enojo.
• Tristeza.
• Alegría.
• Vergüenza.
• Miedo.
Ejercicio 2, lo que se descubre mirando el mapa:
• Casi todas tienen un lugar, y casi siempre los mismos: los nervios en la panza, el enojo en la cara y en las manos, la vergüenza en las orejas.
• ¿Cuál se siente primero en el cuerpo?
• ¿Hay alguna que no aparezca en ninguna parte?
Ejercicio 3, la señal temprana:
Se elige la emoción que más le complica y se busca su primera señal corporal, la más chiquita.
• ¿Qué es lo primero que pasa, antes de todo lo demás?
• ¿A qué se parece?
• Y la práctica: durante la semana, avisar cuando aparece esa señal. No hacer nada más, sólo avisar.
Progresión:
• Si sale fácil: agregar la intensidad con distintos tonos del mismo color, y registrar la señal temprana durante una semana.
• Si no sale: quedate en dos emociones, las más claras, y trabajá con sensaciones del cuerpo antes que con nombres.
Qué mirar:
Si puede ubicar sensaciones, si encuentra una señal temprana, si la reconoce durante la semana, si alguna emoción está ausente del cuerpo. Criterio: el mapa completo con cuatro emociones ubicadas y una señal temprana identificada.
Cuánto y cada cuánto:
Veinte minutos para armarlo, y se repite la misma consigna a los tres meses para comparar. Cambia más de lo que parece.
Para casa:
Avisar cuando aparece la señal temprana, sin que nadie tenga que hacer nada con eso. Sólo nombrarla.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'Emociones mezcladas', 'activity', 'Reconocer que dos emociones opuestas pueden estar juntas, y que eso no es una contradicción', '12-14 años', 'Para qué sirve:
En la adolescencia casi nada se siente de una sola manera: querer irse y tener miedo, extrañar y estar enojado, alegrarse por alguien y tener celos. El que cree que tiene que elegir una se siente falso o confundido, y eso se puede desarmar.
Qué necesitás:
Hoja y lápiz. Dos colores para la parte del círculo.
Cómo se presenta:
Se arranca por ejemplos ajenos, no propios, porque los propios cuestan más: situaciones de películas, de series, de otras personas. Después vienen los suyos.
Ejercicio 1, las mezclas frecuentes, en situaciones ajenas:
Para cada una, nombrar las dos emociones.
• Se va de viaje con amigos por primera vez.
• Su mejor amigo se cambió de liceo y le está yendo bien.
• Terminó una relación que él mismo quiso terminar.
• Lo eligieron para algo importante y tiene que hablar en público.
Ejercicio 2, el círculo de dos colores:
Para una situación propia, un círculo dividido según cuánto hay de cada emoción.
• Nombrar las dos.
• Pintar la proporción.
• Y la pregunta: ¿se puede sentir las dos sin que ninguna sea mentira?
Ejercicio 3, la mezcla propia de esta semana:
Una situación de la semana con dos emociones, escrita en dos columnas.
• Lo que sentí de un lado.
• Lo que sentí del otro.
• Qué hice, y qué habría hecho si sólo hubiera sentido una de las dos.
Progresión:
• Si sale fácil: tres emociones a la vez, y trabajar la culpa por lo que se siente, que es el paso siguiente.
• Si no sale: quedate en situaciones ajenas, y en pares muy claros.
Ojo con esto:
Si en este trabajo aparece algo que excede la ficha (ideas de lastimarse, desesperanza sostenida, algo que le pasó y no había contado), eso pasa a primer plano y el material se deja de lado. Y se evalúa con quién más hay que hablar.
Qué mirar:
Si tolera la ambivalencia o necesita resolverla eligiendo una, si aparece culpa por lo que siente, si puede nombrar las dos sin justificarse. Criterio: una situación propia con dos emociones nombradas y sostenidas.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana.
Para casa:
Registrar una mezcla por semana, en dos líneas. Sin conclusión: sólo las dos cosas anotadas.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'El rincón para bajar un cambio', 'guide', 'Armar un lugar y un procedimiento para calmarse, que no sea un castigo ni un rincón de pensar', '3-5 años', 'Para qué sirve:
Un chico desbordado no puede razonar ni negociar: primero baja el cuerpo, y después se habla. El rincón es ese lugar, y la diferencia con el rincón de castigo es toda: acá no se lo manda, acá se lo acompaña.
Qué necesitás:
Un rincón de la casa, almohadones, una manta, algo para apretar, un libro, y una caja chica.
Cómo se presenta:
Se arma con él, en un momento tranquilo, y se le pone un nombre que elija él. Se explica para qué es con una frase corta: es para cuando el cuerpo está muy fuerte y hay que bajarlo.
Ejercicio 1, armar el lugar:
• Un rincón tranquilo, con poca luz y poco ruido.
• Almohadones y una manta, para meterse abajo.
• Una caja con tres o cuatro cosas que elija él: algo para apretar, un libro, un peluche, un frasco con purpurina.
• Y nada de pantallas.
Ejercicio 2, los tres pasos, ensayados en frío:
Se practican tres veces cuando está tranquilo, como un juego.
• Voy al rincón.
• Hago una cosa de la caja.
• Cuando el cuerpo está más flojo, salgo.
Ejercicio 3, el acompañamiento del adulto:
Lo que hace el adulto es la mitad del recurso.
• Se queda cerca, sin hablar mucho.
• No pregunta qué pasó todavía.
• No pide disculpas todavía.
• Cuando ya bajó, ahí sí: una frase corta y seguir con el día.
Progresión:
• Si sale fácil: que vaya solo cuando lo necesita, y armar una versión chica para la escuela.
• Si no sale: el adulto lo acompaña y hace la actividad con él, sin pedirle que vaya solo.
Ojo con esto:
Esto no es el rincón de pensar y no se usa como castigo, porque entonces deja de funcionar como refugio. No se lo deja encerrado ni se lo obliga a quedarse.
Qué mirar:
Si lo usa, cuánto tarda en bajar, si empieza a ir solo, si los desbordes son más cortos aunque sigan apareciendo. Criterio: tres usos del rincón con el procedimiento completo, y uno de ellos por iniciativa suya.
Cuánto y cada cuánto:
Se arma en una sesión, se ensaya en tres, y se usa cuando hace falta.
Para la familia:
El rincón está disponible siempre y nunca es una consecuencia. Y la conversación sobre lo que pasó va después, cuando el cuerpo ya bajó: antes, no entra.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'El semáforo, sin el cartel', 'guide', 'Instalar una pausa entre el impulso y la acción, con tres pasos que se puedan usar sin material', '6-7 años', 'Para qué sirve:
Entre lo que siente y lo que hace hay un lugar donde se puede meter algo, y ese algo tiene que ser corto y siempre igual. El semáforo es eso, y la meta es que termine funcionando sin cartel y sin que nadie lo diga.
Qué necesitás:
Nada, después de la primera sesión. Al principio, una hoja con el semáforo dibujado.
Cómo se presenta:
Se practica en frío muchas veces, con situaciones de mentira, antes de esperar que aparezca en caliente. Y lo modelás vos primero, en voz alta, con una situación tuya.
Ejercicio 1, los tres pasos:
• Rojo: paro el cuerpo. Las manos quietas, la boca cerrada.
• Amarillo: ¿qué me está pasando? ¿qué quiero hacer? ¿qué va a pasar si lo hago?
• Verde: elijo y hago.
Ejercicio 2, ensayar en frío, con situaciones actuadas:
Se actúan y se practica el semáforo completo en cada una.
• Alguien te sacó algo de la mano.
• Perdiste un juego que querías ganar.
• Te dijeron que no.
• Un compañero te empujó sin querer.
• Te tocó esperar y no querés esperar.
Ejercicio 3, el amarillo, que es el que decide:
El rojo es fácil y el verde también; el amarillo es donde está el trabajo. Para cada situación, dos opciones distintas de qué hacer, y elegir una.
• Qué puedo hacer que no me traiga un problema.
• Y qué pasa después de cada opción.
Progresión:
• Si sale fácil: el semáforo para adentro, sin decirlo, y en situaciones reales de la escuela.
• Si no sale: sólo el rojo. Parar el cuerpo dos segundos ya es el objetivo, y es mucho.
Qué mirar:
Si para, si el amarillo tiene contenido o es una fórmula vacía, si lo usa cuando nadie lo mira, cuánto bajan los episodios. Criterio: el semáforo usado en una situación real, contado por él o visto por un adulto.
Cuánto y cada cuánto:
Se practica en frío diez minutos por sesión, dos veces por semana, durante varias semanas.
Para la familia y la escuela:
Nombrar el semáforo en lugar de retar: acordate del rojo. Y cuando lo usa, decirlo: vi que paraste.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'La escala del uno al diez', 'activity', 'Medir la intensidad de lo que siente, para poder elegir una estrategia del tamaño del problema', '8-9 años', 'Para qué sirve:
Sin escala, todo es igual de grave: perder un juego y perder a alguien están en el mismo lugar. La escala permite dos cosas: elegir una estrategia proporcionada, y darse cuenta de cuándo está subiendo.
Qué necesitás:
Hoja con una escala del uno al diez dibujada, lápiz, y tarjetas con situaciones.
Cómo se presenta:
Primero se calibra la escala con situaciones concretas, de menos a más, para que los números signifiquen algo. Una escala sin calibrar no sirve: hay que anclar el 2, el 5 y el 9 en situaciones reales suyas.
Ejercicio 1, calibrar la escala:
Ubicar situaciones, y que las ponga él.
• Se te rompió la punta del lápiz.
• Te dijeron que hoy no hay postre.
• Perdiste el partido.
• Te acusaron de algo que no hiciste.
• Se te perdió algo importante.
• Te quedaste afuera de un cumpleaños.
Ejercicio 2, la estrategia del tamaño del problema:
Se decide qué hacer en cada tramo, y lo decide él.
• Del 1 al 3: respiro y sigo.
• Del 4 al 6: aviso, me muevo, tomo agua, hago otra cosa un rato.
• Del 7 al 10: me voy del lugar, no hablo todavía, busco a un adulto.
Ejercicio 3, medirse tres veces por semana:
• Un número al llegar a la sesión.
• Un número en el medio de algo difícil.
• Y un número después de usar una estrategia, para ver si bajó.
Bajar dos puntos ya es un resultado, y conviene decirlo: la meta no es llegar a cero.
Progresión:
• Si sale fácil: anticipar (voy en cuatro y subiendo) y elegir la estrategia antes de llegar al siete.
• Si no sale: escala de tres niveles en lugar de diez.
Qué mirar:
Si sus números son coherentes entre sí, si puede medirse en el momento, si elige la estrategia del tramo, si baja dos puntos con alguna. Criterio: tres mediciones propias en una sesión, con una estrategia elegida y un descenso registrado.
Cuánto y cada cuánto:
Se usa en todas las sesiones, tres mediciones cada una.
Para casa:
Preguntar el número en lugar de preguntar qué pasa. Y cuando dice un número alto, no se discute el número.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'La caja de estrategias', 'activity', 'Armar un repertorio propio de estrategias probadas, en lugar de depender de una sola', '8-9 años', 'Para qué sirve:
Respirá no alcanza, y además no le sirve a todos. Lo que sirve es tener seis o siete cosas probadas, saber cuál va con cuál problema, y haberlas practicado antes de necesitarlas.
Qué necesitás:
Fichas o papelitos, una caja o un sobre, y lápiz.
Cómo se presenta:
Se prueban las estrategias en la sesión, de verdad, una por una, y él puntúa cada una. Sólo entran a la caja las que él puntuó bien: una estrategia que no eligió no se usa nunca.
Ejercicio 1, probar y puntuar:
Cada una se prueba un minuto y se puntúa de 1 a 5.
• Respirar contando: cuatro para adentro, cuatro afuera.
• Moverse: saltar veinte veces, correr hasta la esquina.
• Apretar algo fuerte, o apretar los puños y soltar.
• Agua: tomar un vaso despacio, lavarse la cara.
• Hablarlo con alguien.
• Escribir o dibujar lo que pasó.
• Hacer otra cosa un rato y volver después.
• Poner música.
Ejercicio 2, armar la caja:
• Entran las cinco o seis mejor puntuadas, una por ficha, escritas por él.
• En cada ficha, cuándo usarla: para cuando estoy en siete, para cuando estoy aburrido, para cuando estoy triste.
• Y la caja va a un lugar accesible.
Ejercicio 3, probarlas en situaciones reales y anotar:
Durante dos semanas, cada vez que usa una, anota en la ficha si funcionó. Al final se sacan las que no funcionaron nunca. La caja se depura, no se guarda.
Progresión:
• Si sale fácil: que elija la estrategia sin mirar la caja, y que arme una versión para la escuela.
• Si no sale: dos estrategias, las que mejor puntuó, y practicarlas en frío muchas veces.
Qué mirar:
Cuáles elige, si las usa cuando hace falta o después, si distingue qué estrategia para qué problema, cuáles resultaron inútiles. Criterio: dos estrategias usadas por su cuenta en la semana, con el resultado anotado.
Cuánto y cada cuánto:
Veinte minutos para armarla, y cinco minutos por sesión para revisar lo que anotó.
Para casa:
La caja en un lugar visible, y ofrecerla sin insistir: querés mirar la caja. Si dice que no, no se insiste.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'El termómetro del enojo', 'worksheet', 'Reconocer la escalada del enojo y encontrar el punto donde todavía se puede hacer algo', '8-9 años', 'Para qué sirve:
El enojo no aparece de golpe, sube. Lo que parece una explosión de la nada tiene tres o cuatro escalones antes, y esos escalones se pueden aprender a ver. Eso es lo que convierte al enojo en algo manejable.
Qué necesitás:
Hoja con un termómetro de cinco niveles, lápices de colores, y un episodio reciente para reconstruir.
Cómo se presenta:
Se reconstruye un episodio real hacia atrás, desde la explosión: ¿y antes de eso qué pasó? ¿y antes? Hasta llegar al primer momento. Ese recorrido hacia atrás es la parte que enseña.
Ejercicio 1, reconstruir un episodio, hacia atrás:
• Qué pasó al final, lo que se vio.
• Qué pasó un minuto antes.
• Cinco minutos antes.
• Y qué había pasado ese día: hambre, sueño, algo en la escuela.
Ejercicio 2, los cinco niveles del termómetro:
Con las palabras y las señales de él.
• 1, tranquilo.
• 2, algo me molesta. Qué se siente en el cuerpo.
• 3, ya estoy enojado. Qué hace la cara, las manos, la voz.
• 4, me está costando mucho.
• 5, explotó.
Y una marca en el número donde todavía puede hacer algo, que casi siempre es el 3.
Ejercicio 3, el plan por nivel:
• En 2: avisar, moverse, tomar agua.
• En 3: salir del lugar, respirar, decir necesito un minuto.
• En 4: irse sin pedir permiso, a un lugar acordado.
• En 5: no se habla, no se negocia, sólo bajar.
Progresión:
• Si sale fácil: detectar los disparadores frecuentes y trabajar la anticipación.
• Si no sale: tres niveles, y sólo el reconocimiento, sin plan todavía.
Qué mirar:
Si reconoce los escalones, cuál es su señal del 3, si puede actuar en el 3 en la vida real, si los episodios de 5 son menos o más cortos. Criterio: un episodio detenido en el 3, contado por él o visto por un adulto.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana, y reconstruir cada episodio nuevo que aparezca.
Para la familia:
Cuando está en 4 o en 5, no se habla del tema ni se pide disculpas: se acompaña y se espera. La conversación va después, y en frío.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'Antes, durante y después del enojo', 'worksheet', 'Analizar un episodio completo para encontrar en qué punto conviene intervenir', '10-11 años', 'Para qué sirve:
Mirar un episodio en sus tres tiempos muestra algo que en caliente no se ve: que el antes casi siempre existía. Con eso, el trabajo deja de ser aguantar el enojo y pasa a ser prevenirlo donde se puede.
Qué necesitás:
Hoja dividida en tres columnas, lápiz, y un episodio de la última semana.
Cómo se presenta:
Se elige un episodio concreto, no el enojo en general. Y se aclara algo antes de empezar: esto no es para ver quién tuvo razón. Sin eso, la hoja se convierte en un juicio y no se puede trabajar.
Ejercicio 1, las tres columnas:
• Antes: qué venía pasando, cómo estaba el cuerpo, qué había pasado ese día.
• Durante: qué pasó exactamente, qué pensé, qué hice.
• Después: qué pasó con el otro, cómo quedé, qué me costó arreglar.
Ejercicio 2, buscar el punto de intervención:
Con la hoja llena, tres preguntas.
• ¿Cuál fue el primer momento en que se podía hacer algo distinto?
• ¿Qué se podía hacer ahí?
• ¿Qué habría cambiado en la columna del después?
Ejercicio 3, el patrón de tres episodios:
Se hacen tres hojas de tres episodios distintos y se comparan.
• ¿Qué se repite en la columna del antes?
• ¿Hay un horario, un lugar, una persona, un estado del cuerpo?
• Y una decisión concreta sobre eso: si el antes es siempre tener hambre a las seis, hay una solución que no tiene nada que ver con el enojo.
Progresión:
• Si sale fácil: anticipar un episodio antes de que pase, y probar la intervención elegida.
• Si no sale: sólo la columna del durante, sin análisis, hasta que pueda contar un episodio sin justificarse.
Qué mirar:
Si puede describir sin justificar, si encuentra el punto de intervención, si aparece un patrón, si el después le importa. Criterio: tres episodios analizados y un patrón del antes identificado por él.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana, con episodios reales.
Para la familia:
No usar la hoja como prueba en una discusión. Y si en el antes aparece algo de la casa (poco sueño, hambre, un horario imposible), eso se cambia: es lo más rápido que hay.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'Qué hago con el aburrimiento', 'activity', 'Tolerar el aburrimiento y usarlo, en lugar de resolverlo siempre con una pantalla', '10-11 años', 'Para qué sirve:
El aburrimiento se volvió insoportable porque siempre hay una pantalla a treinta centímetros. Poder estar aburrido diez minutos sin resolverlo es una habilidad, y es la misma que después permite esperar, sostener una tarea larga y estar solo.
Qué necesitás:
Hoja y lápiz, y un reloj.
Cómo se presenta:
Se nombra primero sin juzgar: el aburrimiento es una sensación física y molesta, no un problema moral. Y se explica para qué sirve aguantarlo un rato, que es lo que nadie explica.
Ejercicio 1, la lista de las cincuenta cosas:
Se arma una lista larga, con él, de cosas que se pueden hacer sin pantalla. La lista tiene que ser larga y suya.
• Cosas con el cuerpo: pelota, bici, saltar, caminar.
• Cosas con las manos: dibujar, armar, cocinar, ordenar algo.
• Cosas con otros: llamar a alguien, un juego de mesa.
• Cosas de estar solo: leer, escuchar música, no hacer nada.
Ejercicio 2, el experimento de los diez minutos:
• Diez minutos sin hacer nada y sin pantalla, con el reloj a la vista.
• Antes de empezar: ¿qué creés que va a pasar? Se escribe.
• Después: ¿qué pasó? ¿en qué minuto fue lo peor?
Casi siempre lo peor es el minuto tres y después baja, y descubrir eso vale más que cualquier explicación.
Ejercicio 3, el aburrimiento que sirve:
• ¿Qué se te ocurrió mientras estabas aburrido?
• Y una semana de registro: en qué momentos se aburre, y qué hizo con eso.
• La regla propuesta: antes de la pantalla, una cosa de la lista.
Progresión:
• Si sale fácil: estirar a veinte minutos, y probar una tarde sin pantalla planificada por él.
• Si no sale: tres minutos en lugar de diez, y con vos en la misma habitación.
Qué mirar:
Cuánto tolera, si el malestar baja o sube con el tiempo, si usa la lista, si aparece algo creativo en el aburrimiento. Criterio: diez minutos tolerados y dos usos de la lista antes de la pantalla.
Cuánto y cada cuánto:
Diez minutos por sesión, una vez por semana, y la práctica en casa.
Para la familia:
No resolver el aburrimiento ajeno. Y una conversación aparte sobre los horarios de pantalla de la casa, que es de lo que esto depende más.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'La ansiedad antes de una prueba', 'guide', 'Manejar la activación antes y durante una evaluación, con técnicas probadas en frío', '15+ años', 'Para qué sirve:
Saber la materia y no poder mostrarlo es de las cosas más frustrantes que hay. La ansiedad ante exámenes tiene tres momentos (antes, al empezar, durante) y cada uno tiene su técnica, que hay que probar antes y no el día de la prueba.
Qué necesitás:
Hoja y lápiz, y el calendario de pruebas real.
Cómo se presenta:
Se separan dos cosas que suelen venir juntas: la ansiedad y la preparación. Si el estudio no alcanzó, la ansiedad tiene razón y lo que hay que trabajar es el estudio. Eso se revisa primero, con honestidad.
Ejercicio 1, separar preparación de ansiedad:
• ¿Cuántas horas estudió y con qué método?
• ¿Pudo explicar el tema en voz alta sin mirar?
• Si la respuesta es no, el plan es de estudio y no de ansiedad.
• Si la respuesta es sí y igual se bloquea, seguimos.
Ejercicio 2, las técnicas de los tres momentos:
Cada una se practica en sesión, no se explica nada más.
• La noche anterior: dejar de estudiar una hora antes de dormir, rutina de sueño, y todo listo (documento, lapicera, hora de salida).
• Al empezar: respiración larga (cuatro para adentro, seis para afuera) cinco veces, leer todo el examen antes de escribir, y empezar por lo que sí sabe.
• Durante, si se bloquea: soltar la lapicera, pies al piso, tres respiraciones, y volver a la pregunta más fácil. Dos minutos perdidos, no veinte.
Ejercicio 3, el ensayo en condiciones parecidas:
• Una prueba de práctica, con reloj, en una mesa, sin apuntes.
• Con la técnica del comienzo aplicada.
• Y después, qué pasó: qué funcionó, en qué momento subió.
El ensayo es la parte que más sirve y la que casi nadie hace.
Progresión:
• Si sale fácil: sumar exposición gradual a las situaciones que evita (hablar en clase, dar oral).
• Si no sale: técnica de respiración sola, muy practicada, y un ensayo más corto.
Ojo con esto:
Si hay ataques de pánico, vómitos antes de cada prueba, faltas repetidas los días de examen o desesperanza sostenida, esto excede una ficha: corresponde evaluarlo con más detalle y, si hace falta, articular con quien corresponda.
Qué mirar:
Si la técnica baja la activación, cuánto se bloquea, si evita presentarse, cómo le resulta el ensayo comparado con la prueba real. Criterio: una prueba dada con la técnica del comienzo aplicada, y contada después.
Cuánto y cada cuánto:
Veinte minutos por sesión, una vez por semana, más un ensayo antes de cada período de pruebas.
Para casa:
Practicar la respiración todos los días, dos minutos, cuando no hay ansiedad. Una técnica que se estrena el día del examen no funciona.')
on conflict (title) where practitioner_id is null do update set
  discipline = excluded.discipline, area = excluded.area, focus = excluded.focus,
  kind = excluded.kind, objective = excluded.objective,
  age_range = excluded.age_range, content = excluded.content;

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'La torre que se cae', 'game', 'Tolerar que algo salga mal y volver a intentarlo, en un juego donde caerse es parte del juego', '3-5 años', 'Para qué sirve:
A los tres o cuatro años la frustración se trabaja en el cuerpo y en el juego, no hablando. Una torre que se cae da diez oportunidades por sesión de que algo salga mal y se pueda seguir, con vos al lado modelando cómo se hace.
Qué necesitás:
Bloques, cubos o vasos de plástico. Algo que se caiga y no se rompa.
Cómo se presenta:
Vos también construís, y a vos también se te cae, y reaccionás en voz alta como querés que él reaccione: se me cayó, la hago de nuevo. El modelo del adulto es el contenido principal del material.
Ejercicio 1, la torre de los dos:
• Cada uno arma su torre, al lado del otro.
• Se cuentan los bloques al final: no se compara quién hizo más alto.
• Cuando se cae, la frase: se cayó, la empiezo otra vez.
Ejercicio 2, la torre que se cae a propósito:
• Se arma y se tira, de una, con risa.
• Se cuenta hasta tres y se tira los dos juntos.
• Que tirar sea parte del juego saca el drama de que se caiga sin querer.
Ejercicio 3, la torre más alta posible:
Acá aparece la frustración de verdad, porque el objetivo es alto.
• Se construye hasta que se cae, y se anota cuántos bloques llegó.
• Se intenta de nuevo para pasar ese número.
• Tres intentos, y se festeja el número, no la torre.
Progresión:
• Si sale fácil: juegos con más azar y con turnos, y juegos donde se puede perder contra otro.
• Si no sale: torres de tres bloques, y vos armando la mayor parte.
Qué mirar:
Qué hace cuando se cae (tira todo, llora, se va, lo intenta), si acepta empezar de nuevo, si pide ayuda, cuánto tarda en recuperarse, si le sirve tu modelo. Criterio: tres caídas seguidas con un nuevo intento, sin ayuda para volver.
Cuánto y cada cuánto:
Diez a quince minutos, dos veces por semana.
Para la familia:
Cuando algo se cae o sale mal, nombrarlo sin dramatizar y volver a empezar delante de él. Y evitar arreglárselo antes de que lo intente.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'Esperar el turno', 'game', 'Tolerar la espera en el juego, con apoyos concretos que hacen visible cuánto falta', '3-5 años', 'Para qué sirve:
Esperar es de las cosas más difíciles a esta edad, y es la base de casi todo lo demás: compartir, jugar con otros, escuchar. Con apoyos visuales la espera se vuelve posible, y después se van sacando.
Qué necesitás:
Un juego de turnos simple, un objeto que marque el turno (un muñeco, una pulsera), y un reloj de arena.
Cómo se presenta:
El turno se hace visible con un objeto: quien tiene el muñeco juega. Y la espera se hace visible con el reloj de arena. Dos apoyos concretos, porque a los tres años ya me toca no significa nada.
Ejercicio 1, turnos cortos y visibles:
• Un juego de tirar el dado y mover, con el muñeco marcando de quién es el turno.
• Turnos de diez segundos al principio, no más.
• Y la frase, siempre igual: ahora es mi turno, después el tuyo.
Ejercicio 2, la espera con reloj de arena:
• Reloj de arena de un minuto, a la vista.
• Mientras espera, algo que hacer: contar, mirar la arena, apretar algo.
• Se va estirando: un minuto, dos, tres.
Ejercicio 3, la espera sin apoyo:
• Se saca el reloj y se avisa con palabras: faltan dos turnos.
• Después se saca el objeto del turno.
• Y la versión difícil: esperar cuando otro está haciendo algo que él quiere hacer.
Progresión:
• Si sale fácil: juegos de más jugadores y turnos más largos, y esperar en situaciones reales (la fila, el semáforo).
• Si no sale: turnos de cinco segundos, con el reloj siempre, y con vos al lado haciendo la espera con él.
Qué mirar:
Cuánto espera, si los apoyos ayudan, qué hace cuando no aguanta (arrebata, se va, grita), si puede volver al juego después de perder el turno. Criterio: cinco turnos esperados con el reloj y tres sin él.
Cuánto y cada cuánto:
Diez minutos, dos o tres veces por semana.
Para la familia:
Un juego de turnos por día, corto. Y aprovechar las esperas reales de la vida como práctica, avisando cuánto falta en lugar de decir ya va.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'El juego que se pierde a propósito', 'game', 'Practicar perder en un contexto seguro, con la reacción del adulto como modelo', '6-7 años', 'Para qué sirve:
El chico que no tolera perder deja de jugar, y dejar de jugar lo saca de los grupos. Se practica perdiendo muchas veces en un lugar donde perder no cuesta nada, con alguien que muestra cómo se hace.
Qué necesitás:
Juegos cortos y con azar: dados, cartas, memotest, carreras.
Cómo se presenta:
Se eligen juegos cortos y con suerte, porque una derrota en tres minutos se tolera mucho mejor que una en veinte, y el azar saca el tema de la capacidad. Y vos jugás para ganar de a ratos: dejarlo ganar siempre no entrena nada.
Ejercicio 1, partidas cortas, muchas:
• Cinco partidas de tres minutos, en lugar de una de quince.
• Lleva la cuenta de las ganadas y las perdidas en una hoja.
• Al final, mirar la hoja: casi siempre hay de las dos, y eso ya es información.
Ejercicio 2, la frase para cuando se pierde:
Se elige una frase, se practica y se usa siempre. Que sea suya.
• Perdí esta, juego la otra.
• Qué mala suerte, de nuevo.
• Ganaste vos, felicitaciones.
Se practican en voz alta cinco veces, antes de necesitarlas.
Ejercicio 3, perder a propósito y mirarlo:
Se juega una partida donde él va a perder seguro, avisado de antes.
• ¿Qué pasó en el cuerpo cuando perdiste?
• ¿En qué número del termómetro estuviste?
• ¿Qué hiciste con eso?
Y lo mismo cuando pierde vos: que vea tu cuerpo y tu frase.
Progresión:
• Si sale fácil: juegos más largos, con habilidad en lugar de azar, y jugar con otros chicos.
• Si no sale: juegos de cooperación, donde se gana o se pierde juntos, y volver a la competencia después.
Qué mirar:
Qué hace al perder (abandona, acusa de trampa, tira las piezas, llora), si usa la frase, si acepta jugar otra, cuánto tarda en recuperarse. Criterio: tres derrotas seguidas con una partida nueva empezada, y la frase dicha.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Y un juego en familia por semana.
Para la familia:
Jugar de verdad, sin dejarlo ganar siempre, y mostrar cómo se pierde. Un adulto que se enoja cuando pierde enseña mucho más que cualquier consigna.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'Lo que sale bien a la quinta', 'activity', 'Sostener el esfuerzo en una tarea que no sale de entrada, y ver el progreso entre intentos', '6-7 años', 'Para qué sirve:
Muchos chicos abandonan al primer intento porque creen que si no sale ya, no va a salir. Lo que cambia eso es una experiencia concreta: algo que al quinto intento sale, con el registro de los cinco intentos a la vista.
Qué necesitás:
Tareas de habilidad motriz o de destreza que mejoren con la práctica, y una hoja para anotar los intentos.
Cómo se presenta:
Se elige una tarea que no le salga la primera vez pero que sea alcanzable, y se anuncia el plan: vamos a hacer cinco intentos y anotarlos, no importa cómo salgan. Que los cinco estén garantizados de antemano saca el miedo al primero.
Ejercicio 1, elegir la tarea y hacer cinco intentos:
Tareas que sirven.
• Encestar cinco pelotitas seguidas.
• Apilar diez monedas.
• Hacer rebotar una pelota diez veces sin que se caiga.
• Armar un rompecabezas contra reloj.
• Un nudo, un truco de cartas, una figura de papel.
Ejercicio 2, la hoja de los cinco intentos:
• Un número por intento, o una carita.
• Se anota siempre, aunque salga mal.
• Y al final, la pregunta: ¿cuál fue el mejor? ¿fue el primero?
Casi nunca es el primero, y eso es el aprendizaje entero.
Ejercicio 3, la frase del entremedio:
Lo que se dice a sí mismo entre intento e intento.
• Todavía no me sale.
• Me falta practicar.
• Voy a probar de otra manera.
Se eligen dos y se practican en voz alta durante los intentos.
Progresión:
• Si sale fácil: tareas más difíciles, diez intentos, y llevar el registro por su cuenta durante una semana.
• Si no sale: tareas de tres intentos, más fáciles, y que el primero salga bien para que el plan se entienda.
Qué mirar:
Si sostiene los cinco intentos, qué dice después de fallar, si mira la hoja, si puede reconocer la mejora. Criterio: cinco intentos completados sin abandonar, y la mejora reconocida por él.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana.
Para casa:
Una cosa difícil por semana, con la hoja de los cinco intentos. Y que la familia cuente sus propios intentos fallidos, que es lo que más ayuda.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'Lo difícil, en tres niveles', 'activity', 'Elegir el nivel de dificultad propio y aprender a pedir el que corresponde', '8-9 años', 'Para qué sirve:
Un chico que elige siempre lo fácil no está siendo cómodo: está evitando la frustración. Y uno que elige siempre lo imposible también. Aprender a elegir el nivel del medio es una habilidad, y se entrena eligiendo.
Qué necesitás:
Tres versiones de la misma tarea, en tres niveles, en tarjetas separadas.
Cómo se presenta:
Se presentan los tres niveles a la vez y elige él, sin que vos sugieras. Y se explica el criterio: el bueno es el que te cuesta pero te sale. Ese es el desafío justo, y hay que nombrarlo.
Ejercicio 1, elegir entre tres niveles:
Con tareas concretas.
• Fácil: diez cuentas que ya sabe, un rompecabezas de veinte piezas, encestar desde un metro.
• Medio: cuentas nuevas, cincuenta piezas, desde dos metros.
• Difícil: cuentas de dos pasos, cien piezas, desde cuatro metros.
Se anota qué nivel eligió cada vez.
Ejercicio 2, probar el nivel de arriba:
• Se hace el nivel elegido, y después uno del nivel de arriba.
• ¿Cómo fue? ¿Salió? ¿Cuánto costó?
• Y la pregunta central: ¿cuál te dejó más contento?
Casi siempre es el difícil que salió, y eso vale más que cualquier explicación sobre el esfuerzo.
Ejercicio 3, pedir el nivel que corresponde:
Se practica la frase para pedir en la escuela y en la casa.
• Este me sale muy fácil, dame uno más difícil.
• Este es muy difícil para mí solo, ¿me ayudás con la primera parte?
Pedir ayuda con la primera parte, y no abandonar, es la versión útil de pedir ayuda.
Progresión:
• Si sale fácil: elegir el nivel medio por su cuenta y sostenerlo sin que se lo propongan.
• Si no sale: dos niveles en lugar de tres, y empezar por el fácil para que la elección no dé miedo.
Qué mirar:
Qué nivel elige, si cambia con las semanas, qué hace en el nivel de arriba, si puede pedir el nivel que le sirve. Criterio: tres elecciones del nivel medio y una tarea del nivel de arriba terminada.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana. Y ofrecer niveles en el resto de las tareas de la sesión.
Para la escuela:
Lo que se puede pedir: que le den la opción de un ejercicio más difícil cuando termina, y que le permitan pedir ayuda por la primera parte sin que eso sea no saber.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'Cuando algo sale mal, qué me digo', 'worksheet', 'Identificar lo que se dice a sí mismo después de un error y probar una versión más exacta', '12-14 años', 'Para qué sirve:
Después de un error hay una frase automática, y esa frase decide si vuelve a intentar o no. Casi siempre es una exageración (soy un inútil, siempre me pasa lo mismo), y cambiarla por algo más exacto es un trabajo concreto y breve.
Qué necesitás:
Hoja dividida en tres columnas, lápiz.
Cómo se presenta:
Se empieza por registrar, no por corregir. Primero se escucha la frase automática tal cual es, sin discutirla: si se la discute enseguida, deja de contarla.
Ejercicio 1, registrar la frase automática:
Tres situaciones recientes en las que algo salió mal, y qué se dijo.
• Qué pasó.
• Qué me dije, textual.
• Qué hice después.
Ejercicio 2, las tres preguntas para revisarla:
Para cada frase, no se pregunta si es negativa: se pregunta si es exacta.
• ¿Es verdad siempre, o fue esta vez?
• ¿Qué diría alguien que me quiere y vio lo que pasó?
• ¿Qué parte fue mía, qué parte no, y qué puedo cambiar?
Ejercicio 3, la versión exacta, escrita:
No se cambia por una frase positiva, que no se cree nadie. Se cambia por una más exacta.
• En lugar de soy un inútil: me salió mal esta prueba, no estudié esta parte.
• En lugar de siempre me pasa lo mismo: pasó tres veces este mes, y las tres fueron en la misma materia.
• En lugar de nadie me quiere: me peleé con dos personas esta semana.
Y una comprobación: ¿qué harías distinto con esta versión?
Progresión:
• Si sale fácil: registrar durante la semana en el momento, y pasar al material de reestructuración.
• Si no sale: quedate en registrar sin revisar, hasta que las frases aparezcan solas.
Ojo con esto:
Si las frases automáticas incluyen ideas de lastimarse, de no querer estar, o si aparece desesperanza sostenida, eso se trabaja directamente y no con esta ficha, y corresponde evaluar el riesgo y hablar con la familia.
Qué mirar:
Qué tipo de frase aparece (sobre él, sobre los demás, sobre el futuro), si puede encontrar la versión exacta, si la exacta cambia lo que hace. Criterio: tres frases registradas y dos reescritas en versión exacta.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana.
Para casa:
Anotar una frase automática por día, sin revisarla. Una línea, en el celular o en un papel.')
on conflict (title) where practitioner_id is null do update set
  discipline = excluded.discipline, area = excluded.area, focus = excluded.focus,
  kind = excluded.kind, objective = excluded.objective,
  age_range = excluded.age_range, content = excluded.content;

-- ─── Habilidades sociales ───────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychology', 'Habilidades sociales', 'Empatía', 'Los animales y lo que sienten', 'activity', 'Reconocer emociones en otros a través de personajes, que es más fácil que en personas reales', '3-5 años', 'Para qué sirve:
Hablar de lo que siente otro chico es difícil y expone; hablar de lo que siente un perro de un cuento, no. Los personajes son el puente, y por eso se empieza ahí y no por las situaciones propias.
Qué necesitás:
Muñecos o animalitos de plástico, y cuentos con imágenes.
Cómo se presenta:
Vos hacés hablar a los muñecos, con voz y con cuerpo, y preguntás qué le pasa a este. No se corrige la respuesta: se amplía. Si dice está enojado y parece triste, se acepta y se agrega la otra posibilidad.
Ejercicio 1, el animal que le pasa algo:
Con los muñecos, escenas cortas actuadas por vos.
• Al perro le sacaron el hueso.
• El gato se quedó solo en la casa.
• El caballo ganó la carrera.
• Al conejo le dijeron que no puede jugar.
Para cada uno: ¿qué le pasa? ¿cómo te das cuenta?
Ejercicio 2, qué necesita:
Después de nombrar la emoción, qué se puede hacer.
• ¿Qué necesita el perro?
• ¿Quién lo puede ayudar?
• Y que lo haga él con los muñecos: que uno consuele al otro.
Ejercicio 3, el cuento y las caras:
Con un libro de imágenes.
• Señalar un personaje y preguntar qué siente.
• Buscar en la imagen qué se lo dice.
• Y en el final: ¿cómo quedó? ¿se arregló?
Progresión:
• Si sale fácil: situaciones con dos personajes que sienten cosas distintas, y pasar a situaciones de chicos de verdad.
• Si no sale: emociones básicas con caras muy claras, y vos nombrando primero.
Qué mirar:
Si nombra emociones en otros, si distingue lo que siente él de lo que siente el personaje, si puede proponer qué necesita, si alguna emoción no reconoce nunca. Criterio: cuatro escenas con la emoción nombrada y dos con una acción de ayuda.
Cuánto y cada cuánto:
Quince minutos, dos veces por semana.
Para casa:
En los cuentos de la noche, una pregunta por página: ¿qué le pasa a este? Sin convertirlo en examen.'),

  (null, 'psychology', 'Habilidades sociales', 'Empatía', 'Qué haría un buen amigo', 'worksheet', 'Reconocer qué conductas concretas hacen a un buen amigo, y compararlas con lo que uno hace', '6-7 años', 'Para qué sirve:
Ser buen amigo no es un valor abstracto: son cinco o seis conductas concretas que se pueden nombrar, ver y practicar. Cuando están nombradas, el chico puede compararse con algo, y eso es mucho más útil que decirle que sea bueno.
Qué necesitás:
Hoja con dos columnas, lápiz, y tarjetas con situaciones.
Cómo se presenta:
Se arranca por situaciones en las que otro chico es el protagonista, y él decide qué haría un buen amigo. Recién después aparece la columna de qué hago yo, y esa aparece sin juicio.
Ejercicio 1, las situaciones:
Para cada una, qué haría un buen amigo.
• Un compañero se cayó en el recreo.
• Alguien está solo en un rincón del patio.
• Tu amigo perdió el juego y está enojado.
• Un compañero se olvidó la merienda.
• Se están riendo de alguien de la clase.
• Tu amigo cumple años.
Ejercicio 2, las conductas, nombradas:
De las respuestas se sacan las conductas y se hace la lista, con sus palabras.
• Preguntar qué le pasa.
• Invitar a jugar.
• Compartir.
• Defender.
• Escuchar sin interrumpir.
• Acordarse de lo que le importa.
Ejercicio 3, la columna de qué hago yo:
Sin retos y sin culpa.
• De esta lista, ¿cuál hago seguido?
• ¿Cuál me cuesta?
• Y elegir una para probar esta semana, una sola.
Progresión:
• Si sale fácil: situaciones donde ser buen amigo cuesta algo (defender a alguien delante de otros) y qué hace uno ahí.
• Si no sale: tres situaciones muy claras, y sólo la primera columna.
Qué mirar:
Si puede nombrar conductas concretas o se queda en portarse bien, si reconoce lo que le cuesta, si prueba la que eligió. Criterio: la lista de conductas armada por él y una probada en la semana, contada después.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana.
Para casa:
Preguntar una vez por semana qué hizo alguien por él y qué hizo él por alguien. Dos preguntas, sin evaluación.'),

  (null, 'psychology', 'Habilidades sociales', 'Empatía', 'Qué le pasa al otro', 'activity', 'Inferir lo que siente y lo que piensa otra persona a partir de su conducta y del contexto', '8-9 años', 'Para qué sirve:
Entender qué le pasa al otro es lo que permite responder bien: sin eso, un chico reacciona a la conducta (me empujó) y no a lo que había detrás (estaba apurado). Se entrena con situaciones ambiguas, que son las de la vida real.
Qué necesitás:
Tarjetas con situaciones escritas, hoja y lápiz.
Cómo se presenta:
Se usa siempre la misma secuencia de tres preguntas, para que se vuelva un hábito: qué hizo, qué puede estar sintiendo, y qué otra explicación hay. La tercera es la más importante.
Ejercicio 1, las situaciones ambiguas:
Para cada una, las tres preguntas.
• Un compañero no te contesta cuando lo saludás.
• Alguien se ríe cuando te equivocás leyendo.
• Tu amiga no te invitó a su casa el sábado.
• Un compañero no te quiso pasar la pelota.
• El maestro te contestó mal.
Ejercicio 2, tres explicaciones posibles:
Para una de esas situaciones, tres explicaciones distintas, y ninguna tiene que ser sobre él.
• Una que sea sobre mí.
• Una que sea sobre el otro (estaba cansado, distraído, mal de antes).
• Una que sea sobre la situación (no me escuchó, no me vio).
Y la pregunta: ¿cuál es la más probable? ¿cómo lo podría averiguar?
Ejercicio 3, preguntar en lugar de suponer:
Se practica la frase para averiguar, que es la que resuelve de verdad.
• Te vi raro hoy, ¿pasó algo?
• ¿Estabas enojado conmigo o era otra cosa?
Se ensaya tres veces, actuado.
Progresión:
• Si sale fácil: situaciones en las que el otro tiene razón y él no, y situaciones con dos personas que sienten cosas opuestas.
• Si no sale: situaciones muy claras con una sola explicación posible, y trabajar primero el reconocimiento de emociones.
Qué mirar:
Si genera más de una explicación, si todas sus explicaciones son sobre él (es un patrón frecuente e importante), si puede pensar en preguntar. Criterio: tres explicaciones distintas para una situación, y una frase de averiguación ensayada.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana.
Para casa:
Cuando cuente algo que le pasó con alguien, una sola pregunta: ¿se te ocurre otra razón por la que hizo eso? Sin dar la respuesta.'),

  (null, 'psychology', 'Habilidades sociales', 'Empatía', 'La misma escena, dos versiones', 'activity', 'Reconstruir un conflicto desde el punto de vista del otro, con la misma seriedad que el propio', '10-11 años', 'Para qué sirve:
En un conflicto cada uno tiene una versión y las dos son parciales. Escribir la del otro en primera persona, bien, es de los ejercicios que más mueven: no para darle la razón, sino para poder resolverlo.
Qué necesitás:
Hoja dividida en dos columnas, lápiz, y un conflicto real reciente.
Cómo se presenta:
Primero se escribe la versión propia, completa y sin discutirla. Que su versión esté escrita y respetada es la condición para que después pueda escribir la otra; si se siente cuestionado, no va a poder.
Ejercicio 1, la versión propia:
En la columna izquierda, en primera persona.
• Qué pasó.
• Qué sentí.
• Qué pensé del otro.
• Qué hice.
Ejercicio 2, la versión del otro, en primera persona:
En la columna derecha, escrita como si fuera él. Esto es lo difícil.
• Qué pasó, desde su lugar.
• Qué pudo haber sentido.
• Qué pudo haber pensado de mí.
• Por qué hizo lo que hizo.
La regla: tiene que ser una versión que el otro firmaría. Si es una caricatura, no cuenta.
Ejercicio 3, lo que se ve con las dos columnas:
• ¿Hay algo en la columna de la derecha que no habías pensado?
• ¿Qué parte del problema es de cada uno?
• ¿Qué haría falta para arreglarlo?
Progresión:
• Si sale fácil: hacerlo con un conflicto en curso, y después hablar con la otra persona.
• Si no sale: hacerlo con un conflicto ajeno (de una serie, de otros dos compañeros), y volver al propio después.
Qué mirar:
Si la versión del otro es honesta o una caricatura, si aparece algo nuevo, si puede reconocer una parte propia sin hundirse. Criterio: una versión del otro que él mismo reconozca como creíble.
Cuánto y cada cuánto:
Veinte minutos, cuando hay un conflicto real. No sirve inventado.
Para casa:
Nada escrito. Si acaso, una pregunta en la mesa: ¿cómo lo habrá visto el otro? Y aceptar la respuesta que venga.'),

  (null, 'psychology', 'Habilidades sociales', 'Empatía', 'Escuchar sin preparar la respuesta', 'activity', 'Escuchar de verdad, sin interrumpir ni armar la respuesta mientras el otro habla', '12-14 años', 'Para qué sirve:
Casi nadie escucha: se espera el turno mientras se arma la respuesta. En la adolescencia eso se nota en todas las conversaciones difíciles, y es una habilidad que se puede entrenar en veinte minutos y practicar toda la vida.
Qué necesitás:
Nada. Un reloj y dos sillas.
Cómo se presenta:
Se hace en vivo, con vos, y se invierten los roles. Se explica la regla y se cumple al pie de la letra: mientras el otro habla, no se interrumpe y no se prepara nada.
Ejercicio 1, dos minutos de escuchar y devolver:
• Vos hablás dos minutos de algo real, sin parar.
• Él escucha sin interrumpir y sin tomar nota.
• Al final, devuelve lo que entendió, incluida la emoción: entendí que te pasó esto y que te dejó así.
• Y vos decís si acertó, y qué faltó.
Después al revés.
Ejercicio 2, las tres cosas que arruinan la escucha:
Se nombran y después se hacen a propósito, para verlas.
• Interrumpir para contar lo propio: a mí me pasó algo parecido.
• Dar consejos antes de que termine: lo que tenés que hacer es.
• Minimizar: no es para tanto, ya se te va a pasar.
Se hacen las tres, exageradas, y se pregunta qué se siente del otro lado.
Ejercicio 3, las tres cosas que sí ayudan:
• Preguntar algo más antes de opinar: ¿y cómo siguió?
• Devolver la emoción: debe haber sido un plomo.
• Aguantar el silencio sin llenarlo.
Se practican en una conversación de dos minutos.
Progresión:
• Si sale fácil: usarlo en una conversación difícil real y contarla después.
• Si no sale: un minuto en lugar de dos, y sólo la devolución de los hechos, sin la emoción.
Qué mirar:
Si interrumpe, si su devolución incluye la emoción o sólo los hechos, si aguanta el silencio, si nota la diferencia cuando lo escuchan a él. Criterio: dos minutos escuchados con una devolución que incluya la emoción.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana. Es una habilidad que mejora rápido.
Para casa:
Una conversación por semana en la que sólo escucha, elegida por él. Y si se anima, contarle a la otra persona lo que estaba practicando.'),

  (null, 'psychology', 'Habilidades sociales', 'Resolución de conflictos', 'Pedir perdón de verdad', 'activity', 'Reparar un daño con una disculpa que incluya el reconocimiento y la reparación', '8-9 años', 'Para qué sirve:
Un perdón obligado y de una palabra no arregla nada y encima enseña que pedir perdón es un trámite. Una disculpa que sirve tiene tres partes, y las tres se pueden aprender y practicar.
Qué necesitás:
Hoja y lápiz, y una situación real reciente.
Cómo se presenta:
Primero se separan dos cosas: lo que hizo y lo que siente por lo que hizo. Se puede pedir perdón sin sentir culpa, y se puede sentir culpa y no repararlo. Lo que se trabaja acá es la reparación.
Ejercicio 1, las tres partes de una disculpa:
• Qué hice, dicho concreto y sin peros: te saqué el cuaderno y lo rompí.
• Qué le pasó al otro por eso: te quedaste sin el trabajo de toda la semana.
• Qué voy a hacer: lo vuelvo a escribir con vos, o te presto el mío.
Y lo que no va: el pero es que él antes me había, que borra las tres partes.
Ejercicio 2, mejorar disculpas que no sirven:
Se leen y se arreglan.
• Perdón, pero vos también.
• Ya te pedí perdón, ¿qué más querés?
• Perdón si te ofendiste.
• Fue sin querer.
Para cada una: qué le falta, y cómo sería completa.
Ejercicio 3, la propia, escrita y dicha:
Con una situación real.
• Se escribe con las tres partes.
• Se dice en voz alta, ensayada, dos veces.
• Y se decide si la va a decir de verdad, cuándo y a quién. Esa decisión es de él.
Progresión:
• Si sale fácil: disculpas en situaciones donde el otro también hizo algo, sin que eso anule la propia.
• Si no sale: trabajar primero el reconocimiento del daño, sin pedir la disculpa.
Qué mirar:
Si puede nombrar lo que hizo sin justificarlo, si reconoce el efecto en el otro, si la reparación es concreta, si se hunde en la culpa (y ahí hay que trabajar otra cosa). Criterio: una disculpa propia con las tres partes, escrita y dicha.
Cuánto y cada cuánto:
Veinte minutos, cuando hay una situación real.
Para la familia:
No obligar a pedir perdón en el momento, que produce el perdón de trámite. Se espera a que baje y se acompaña la reparación, que es la parte que enseña.'),

  (null, 'psychology', 'Habilidades sociales', 'Resolución de conflictos', 'Tres formas de decir lo mismo', 'activity', 'Distinguir la respuesta pasiva, la agresiva y la asertiva, y elegir la tercera', '10-11 años', 'Para qué sirve:
Entre aguantar y explotar hay una tercera opción, y casi nadie la muestra. Verla al lado de las otras dos, en la misma situación, es lo que la hace evidente y practicable.
Qué necesitás:
Hoja con tres columnas, lápiz, y situaciones en tarjetas.
Cómo se presenta:
Se actúan las tres versiones de la misma situación, vos primero, exagerando las dos primeras. Verlas actuadas vale mucho más que leerlas: la diferencia está en el cuerpo y en la voz, no sólo en las palabras.
Ejercicio 1, las tres versiones de una situación:
Situación: un compañero te copia la tarea sin pedirte permiso.
• Pasiva: no digo nada y me quedo con la bronca.
• Agresiva: le grito, lo insulto, le rompo la hoja.
• Asertiva: no me gusta que copies mi tarea sin preguntarme.
Para cada una, qué pasa después.
Ejercicio 2, las cuatro situaciones:
Escribir las tres versiones de cada una.
• Alguien se te adelanta en la fila.
• Un amigo te deja plantado otra vez.
• Te dicen un apodo que no te gusta.
• Te acusan de algo que no hiciste.
Ejercicio 3, la fórmula asertiva y el cuerpo:
La fórmula, en tres partes.
• Cuando pasa esto (el hecho, sin adjetivos).
• Yo me siento así.
• Te pido esto.
Y el cuerpo, que es la mitad: voz que no sube, cuerpo que no se achica, mirada sostenida. Se practica con las cuatro situaciones.
Progresión:
• Si sale fácil: situaciones con un adulto (un profesor, un entrenador) y situaciones donde ya hubo varias veces.
• Si no sale: quedate en distinguir las tres versiones cuando las ve, sin producirlas todavía.
Qué mirar:
A qué versión tiende por defecto, si puede producir la asertiva, si el cuerpo acompaña las palabras, si sostiene cuando el otro insiste. Criterio: la versión asertiva producida en tres situaciones, con el cuerpo acompañando.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana.
Para casa:
Una situación por semana resuelta con la fórmula, y contarla después. Aunque salga mal.'),

  (null, 'psychology', 'Habilidades sociales', 'Resolución de conflictos', 'El acuerdo escrito', 'activity', 'Resolver un conflicto repetido con un acuerdo concreto, escrito y revisable', '10-11 años', 'Para qué sirve:
Los conflictos que se repiten (con un hermano, con un compañero) no se arreglan con una conversación: se arreglan con un acuerdo concreto sobre una cosa. Escribirlo lo hace revisable y saca la discusión sobre lo que se había dicho.
Qué necesitás:
Hoja, lápiz, y las dos partes si es posible. Si no, se prepara con uno solo.
Cómo se presenta:
Se elige un conflicto concreto y chico, no el problema general de la relación. Un acuerdo sobre quién usa la consola y cuándo es posible; un acuerdo sobre respetarse, no.
Ejercicio 1, definir el conflicto en una frase:
• Qué pasa, concreto y observable.
• Cada cuánto pasa.
• Qué hace cada uno cuando pasa.
Nada de adjetivos sobre el otro: la frase tiene que poder ser firmada por los dos.
Ejercicio 2, qué necesita cada uno:
Dos columnas, y lo que cada uno necesita y no lo que quiere que el otro deje de hacer.
• Yo necesito.
• El otro necesita.
• Y buscar en qué se pueden cruzar las dos cosas.
Ejercicio 3, el acuerdo, con fecha de revisión:
Escrito y firmado por los dos, con cuatro partes.
• Qué va a hacer cada uno, concreto.
• Qué pasa si alguien no lo cumple.
• Cuándo lo volvemos a mirar: una semana.
• Y las firmas.
Progresión:
• Si sale fácil: acuerdos más complejos, y que él lo proponga y lo escriba solo.
• Si no sale: un acuerdo de una sola línea y de una sola persona: sólo lo que él va a hacer.
Qué mirar:
Si puede definir el conflicto sin acusar, si puede nombrar lo que necesita, si el acuerdo es concreto y cumplible, si se cumplió a la semana. Criterio: un acuerdo escrito y cumplido durante una semana.
Cuánto y cada cuánto:
Veinte minutos para armarlo, y diez para revisarlo a la semana.
Para la familia:
Si el conflicto es entre hermanos, los adultos no son jueces: son los que sostienen la revisión. Y el acuerdo se revisa en la fecha, aunque esté yendo bien.'),

  (null, 'psychology', 'Habilidades sociales', 'Resolución de conflictos', 'Cuando se pelean dos amigos', 'guide', 'Sostener una amistad después de una pelea, y decidir qué hacer cuando no se arregla', '10-11 años', 'Para qué sirve:
A los diez u once años una pelea con el mejor amigo se vive como algo definitivo, y casi nunca lo es. Tener un procedimiento, y también un plan para cuando no se arregla, hace toda la diferencia.
Qué necesitás:
Hoja y lápiz.
Cómo se presenta:
Se escucha la versión completa primero, sin apurar ninguna conclusión y sin decirle que se va a arreglar. Después se ordena lo que pasó y se decide qué quiere él, que es la pregunta que nadie le hace.
Ejercicio 1, ordenar lo que pasó:
• Qué pasó, por orden.
• Qué dijo cada uno.
• Qué parte fue del momento y qué parte venía de antes.
• Y algo importante: ¿hubo alguien más metido en el medio?
Ejercicio 2, qué quiere él:
Tres opciones, y ninguna es la correcta.
• Arreglarlo y volver a como estaba.
• Arreglarlo pero distinto: seguir siendo amigos con otro límite.
• No arreglarlo por ahora.
Se elige una y se trabaja sobre esa.
Ejercicio 3, cómo se hace cada una:
• Para arreglarlo: qué le va a decir, dónde, y cuándo. Ensayado dos veces acá.
• Para arreglarlo distinto: qué límite va a poner y con qué palabras.
• Para no arreglarlo: cómo se comporta en la clase mientras tanto, con quién se junta, y qué hace si el otro lo busca.
Y en los tres casos, lo mismo: qué hace si el otro no responde como espera.
Progresión:
• Si sale fácil: sostener lo que eligió durante una semana, y revisarlo.
• Si no sale: quedate en ordenar lo que pasó, sin decidir todavía.
Ojo con esto:
Si lo que hay no es una pelea sino hostigamiento sostenido de un grupo, esto no alcanza y no corresponde tratarlo como un conflicto entre dos: hay que hablar con la familia y con la escuela, y el chico no tiene que resolverlo solo.
Qué mirar:
Si puede contar la parte propia, qué opción elige, si sostiene lo que eligió, cómo está en el grupo mientras dura. Criterio: una opción elegida por él y una acción concreta hecha en la semana.
Cuánto y cada cuánto:
Veinte minutos por sesión mientras dure, con revisión semanal.
Para la familia:
No llamar a la familia del otro chico sin hablarlo con él. Y no minimizar: para él es de las cosas más importantes que le están pasando.'),

  (null, 'psychology', 'Habilidades sociales', 'Resolución de conflictos', 'Negociar sin que gane uno solo', 'activity', 'Buscar acuerdos donde las dos partes obtienen algo, distinguiendo la posición del interés', '12-14 años', 'Para qué sirve:
Casi todas las discusiones se pelean sobre posiciones (yo quiero esto, yo quiero lo otro) cuando lo que se puede negociar son los intereses de atrás. Verlo una vez cambia bastante cómo se discute en casa y con los amigos.
Qué necesitás:
Hoja y lápiz, y una discusión real en curso.
Cómo se presenta:
Se enseña la diferencia con un ejemplo antes de aplicarla: la posición es quiero volver a las tres de la mañana; el interés es quiero estar con mis amigos hasta el final y que no me traten como a un nene. Con los intereses sobre la mesa aparecen opciones que con las posiciones no existían.
Ejercicio 1, posición e interés, en tres discusiones:
Para cada una, la posición de los dos y el interés de atrás.
• La hora de volver.
• El uso del celular.
• Los estudios y el tiempo libre.
Ejercicio 2, generar opciones antes de decidir:
Con los intereses de los dos escritos, cinco opciones posibles, sin descartar ninguna todavía.
• Generar primero, evaluar después: mezclarlo mata las opciones buenas.
• Después se marcan las que sirven a los dos intereses.
Ejercicio 3, la propuesta, armada y ensayada:
• Se elige una opción y se arma la propuesta: qué pide, qué ofrece, y cómo se va a verificar.
• Se ensaya acá, con vos haciendo de la otra parte, incluido decir que no.
• Y se acuerda un plazo de prueba, que es lo que hace que una propuesta sea aceptable: probemos dos semanas y lo revisamos.
Progresión:
• Si sale fácil: llevar la propuesta a una negociación real y volver con lo que pasó.
• Si no sale: quedate en identificar intereses, que ya es la mitad, y sin negociar todavía.
Qué mirar:
Si distingue posición de interés, si puede nombrar el interés del otro, si genera opciones o se queda en una, cómo reacciona cuando le dicen que no. Criterio: una propuesta armada con las tres partes y presentada de verdad.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana, con discusiones reales.
Para la familia:
Cuando llegue con una propuesta armada, escucharla completa antes de contestar. Y si la respuesta es no, decir el interés propio y no sólo la posición.'),

  (null, 'psychology', 'Habilidades sociales', 'Asertividad', 'Entrar en un grupo que ya está jugando', 'activity', 'Aprender los pasos concretos para sumarse a un juego en curso, que es donde muchos chicos quedan afuera', '6-7 años', 'Para qué sirve:
Muchos chicos quedan solos en el recreo no porque los rechacen, sino porque no saben cómo entrar. Entrar tiene pasos, y los pasos se pueden practicar: mirar un rato, acercarse, hacer lo que están haciendo, y después hablar.
Qué necesitás:
Muñecos o figuras para actuar las escenas, y después el patio o un grupo real.
Cómo se presenta:
Se actúa primero con muñecos, para sacar la exposición. Vos hacés el grupo y él hace el que entra, y después se cambian los roles: hacer de grupo es lo que le muestra cómo se ve desde afuera.
Ejercicio 1, los cuatro pasos:
• Mirar un rato desde cerca, sin decir nada. Ver qué están jugando y cuáles son las reglas.
• Acercarse y quedarse al lado.
• Hacer algo parecido a lo que están haciendo.
• Y después preguntar: ¿puedo jugar?
El error más común es preguntar primero, desde lejos, sin haber mirado.
Ejercicio 2, lo que sí y lo que no funciona:
Se actúan las dos versiones.
• Funciona: preguntar cuando hay una pausa, sumarse a lo que ya se está haciendo, aceptar el papel que sobra.
• No funciona: cambiar el juego al llegar, criticar cómo están jugando, insistir cuando dijeron que no.
Ejercicio 3, qué hacer si dicen que no:
Esta es la parte que más falta y la que más miedo da.
• Preguntar cuándo se puede: ¿y en el próximo?
• Buscar otro grupo, que casi siempre hay.
• Y una frase para el momento, ensayada, que no sea quedarse ahí parado.
Se practican tres rechazos actuados.
Progresión:
• Si sale fácil: probar en el patio real, y después con un grupo que no conoce.
• Si no sale: practicar con un solo chico en lugar de un grupo, o con un hermano.
Qué mirar:
Si puede esperar antes de hablar, en qué paso se traba, qué hace ante un no, si tiene un grupo alternativo. Criterio: los cuatro pasos hechos en una situación real, contada por él o vista por un adulto.
Cuánto y cada cuánto:
Quince minutos, una vez por semana, con actuación siempre.
Para la familia y la escuela:
Lo que ayuda es una actividad con otros chicos, chica y con una tarea clara. Y en la escuela, que un adulto lo acerque una vez, sin que quede en evidencia.'),

  (null, 'psychology', 'Habilidades sociales', 'Asertividad', 'Pedir lo que necesito', 'worksheet', 'Formular un pedido claro, en lugar de esperar que el otro se dé cuenta', '10-11 años', 'Para qué sirve:
Muchos chicos no piden: esperan que alguien se dé cuenta, y cuando no pasa se enojan. Pedir es una habilidad con una forma concreta, y se entrena escribiendo el pedido antes de hacerlo.
Qué necesitás:
Hoja y lápiz.
Cómo se presenta:
Se empieza por distinguir tres cosas que se confunden: quejarse, insinuar y pedir. Se dan ejemplos de las tres para la misma necesidad, y se ve cuál tiene alguna chance de funcionar.
Ejercicio 1, quejarse, insinuar y pedir:
Misma necesidad, tres versiones.
• Queja: nadie me ayuda nunca con nada.
• Insinuación: uf, cuánta tarea tengo.
• Pedido: ¿me podés explicar este ejercicio cuando termines lo tuyo?
Se hace con tres necesidades más, propias.
Ejercicio 2, la forma del pedido:
Cuatro partes, y la última es la que casi siempre falta.
• A quién se le pide (a la persona que puede darlo).
• Qué se pide, concreto.
• Cuándo.
• Y aceptar que puede decir que no.
Ejercicio 3, cuatro pedidos escritos y ensayados:
Pedidos reales de su vida.
• Uno a un adulto de la casa.
• Uno a un compañero.
• Uno a un maestro o profesor.
• Uno a un amigo.
Se escriben, se dicen en voz alta acá, y se elige uno para hacer esta semana.
Progresión:
• Si sale fácil: pedidos más difíciles, y pedir por segunda vez cuando la primera no funcionó.
• Si no sale: un pedido muy fácil, con alta probabilidad de un sí, para que la experiencia sea buena.
Qué mirar:
Si pide o insinúa, si elige bien a quién pedirle, si tolera un no, si vuelve a pedir. Criterio: un pedido hecho en la vida real, contado después, sin importar la respuesta.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana.
Para la familia:
Cuando hace un pedido claro, responderlo rápido, aunque sea con un no. Un pedido que se ignora enseña a no pedir.'),

  (null, 'psychology', 'Habilidades sociales', 'Asertividad', 'Cuando alguien se pasa de la raya', 'guide', 'Reconocer cuándo algo dejó de ser una broma y aprender qué hacer y a quién decirle', '10-11 años', 'Para qué sirve:
Los chicos aguantan mucho antes de contar, porque no saben si lo que les pasa es para tanto y porque contar tiene costos. Este material da un criterio para decidir y un plan para actuar, y eso es lo que baja el aguante silencioso.
Qué necesitás:
Hoja y lápiz, y privacidad.
Cómo se presenta:
Se explica el criterio antes de preguntar nada, en general y no sobre él, para que no tenga que exponerse de entrada. Y se dice claro que contar no es ser buchón, que es la creencia que más lo frena.
Ejercicio 1, el criterio para saber si se pasó:
Tres preguntas, y basta con una.
• ¿Se repite, aunque ya hayas dicho que no te gusta?
• ¿Te da miedo o vergüenza ir a algún lugar por esto?
• ¿Se ríen de vos y no con vos?
Si alguna es sí, se pasó de la raya y no es una broma.
Ejercicio 2, el plan, en orden:
• Decirlo en el momento, claro y corto: no me gusta, pará.
• Irse, si sigue. Irse no es perder.
• Contarle a un adulto, y elegir cuál acá mismo: nombre y apellido.
• Anotar qué pasó, cuándo y quién estaba, aunque sea en el celular.
• Y no quedarse solo en los momentos donde pasa: con quién se junta.
Ejercicio 3, elegir a los adultos y ensayar la frase:
• Dos adultos concretos: uno de la casa y uno de la escuela.
• Qué les va a decir, ensayado acá dos veces.
• Y qué hacer si el primero no lo escucha: ir al segundo. Eso hay que decirlo explícitamente.
Progresión:
• Si sale fácil: sostener la frase en el momento, y revisar cada semana cómo viene.
• Si no sale: el foco pasa a que hable con un adulto, y no a que resuelva solo.
Ojo con esto:
Si lo que hay es hostigamiento sostenido, un grupo contra uno, contenido en redes, o cualquier situación de riesgo, esto deja de ser un material de habilidades sociales: corresponde hablar con la familia y con la escuela, y activar lo que haga falta. Al chico no se le pide que lo resuelva con asertividad.
Qué mirar:
Si puede usar el criterio, si tiene adultos disponibles, si aparece miedo a las consecuencias de contar, cómo viene la situación semana a semana. Criterio: los dos adultos identificados y una conversación tenida con uno de ellos.
Cuánto y cada cuánto:
Veinte minutos, y seguimiento en todas las sesiones mientras dure.
Para la familia:
Creerle y actuar rápido, y no prometer que no va a hablar con nadie. Lo que sí se puede prometer es contarle a él qué se va a hacer antes de hacerlo.'),

  (null, 'psychology', 'Habilidades sociales', 'Asertividad', 'Decir que no sin pelear', 'activity', 'Sostener una negativa firme y sin agresión, incluso cuando el otro insiste', '12-14 años', 'Para qué sirve:
En la adolescencia decir que no es la habilidad que más cuesta y más protege: sirve para la tarea que le quieren copiar, para el plan al que no quiere ir y para las situaciones que pueden terminar mal.
Qué necesitás:
Nada. Espacio para actuar las escenas.
Cómo se presenta:
Se da la fórmula en tres partes y se practica actuada, con vos insistiendo de verdad. Insistir es parte del ejercicio: un no que no se practicó contra la insistencia no existe.
Ejercicio 1, la fórmula, en tres partes:
• Entiendo lo que me pedís.
• No puedo, o no quiero.
• Y si va, una alternativa.
Sin explicaciones largas: explicar de más abre la negociación de nuevo.
Ejercicio 2, las escenas, actuadas:
Se hace cada una, con vos insistiendo dos veces.
• Un amigo te pide la tarea para copiarla.
• Te invitan a algo que no querés y te dicen que no seas aburrido.
• Alguien te pide plata otra vez.
• Te ofrecen algo que no querés tomar.
• Te piden que guardes un secreto que te incomoda.
Ejercicio 3, el cuerpo y la segunda insistencia:
• La voz que no sube, el cuerpo que no se achica, la mirada sostenida.
• Y la técnica para la insistencia: repetir lo mismo, igual, sin agregar nada.
• Y lo que más cuesta: aguantar el silencio incómodo de después. Se practica también.
Progresión:
• Si sale fácil: escenas con presión de grupo, donde varios insisten a la vez.
• Si no sale: escenas de bajo costo (decir que no a algo chico) y con una sola insistencia.
Ojo con esto:
Si en las escenas aparecen situaciones de riesgo real (sustancias, presión sexual, alguien mayor involucrado), eso pasa a ser el tema y se trabaja con lo que corresponda, incluida la conversación con la familia.
Qué mirar:
Si sostiene la negativa en la segunda insistencia, si el cuerpo acompaña, si explica de más, si tolera el silencio. Criterio: tres escenas sostenidas con dos insistencias cada una.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana. La actuación es indispensable: hablado no se traslada.
Para casa:
Nada escrito. Si hay una situación real, contarla después, y sin evaluar si lo hizo bien.'),

  (null, 'psychology', 'Habilidades sociales', 'Asertividad', 'Poner un límite en una relación', 'guide', 'Poner un límite en un vínculo que importa, sosteniéndolo en el tiempo y no una sola vez', '15+ años', 'Para qué sirve:
Poner un límite con un desconocido es fácil; con alguien que importa, no. Y a los quince o dieciséis empiezan los vínculos donde eso se juega en serio: parejas, amistades de años, familia. Lo que hace falta no es una frase: es sostenerla.
Qué necesitás:
Hoja y lápiz, y privacidad.
Cómo se presenta:
Se empieza por lo más difícil de todo, que no es la conversación: es identificar qué le molesta. Muchos adolescentes aguantan situaciones que no pueden nombrar, y sin nombrarlas no hay límite posible.
Ejercicio 1, identificar el límite:
• Qué pasa, concreto: qué hace la otra persona y con qué frecuencia.
• Cómo queda él después.
• ¿Ya lo dijo alguna vez? ¿Qué pasó?
• Y la pregunta difícil: ¿qué teme que pase si lo dice?
Ejercicio 2, armar el límite en tres partes:
• El hecho, sin adjetivos sobre la persona.
• Lo que va a hacer él, no lo que el otro tiene que dejar de hacer: si vuelve a pasar, me voy.
• Y nada de ultimátum que no piensa cumplir: un límite que no se sostiene enseña que no hay límites.
Ejercicio 3, la conversación y el después:
• Dónde y cuándo, en un momento tranquilo y no en medio de una pelea.
• Ensayo acá, dos veces, con vos haciendo de la otra persona, incluida la reacción mala.
• Qué hace si el otro se enoja, se hace la víctima o promete y no cumple.
• Y el plan para la segunda vez, que es donde el límite se sostiene o se cae.
Progresión:
• Si sale fácil: sostener el límite dos semanas y revisar qué cambió en el vínculo.
• Si no sale: empezar por un límite más chico en el mismo vínculo, o por otro vínculo más fácil.
Ojo con esto:
Si en el vínculo hay violencia, control, amenazas, presión sexual o aislamiento, esto no es una cuestión de asertividad: es una situación de riesgo, y corresponde evaluarla, hablar de seguridad y articular con la familia y con quien haga falta. El límite no se pone solo ni se sostiene solo.
Qué mirar:
Si puede nombrar lo que le molesta, si el límite está formulado sobre lo que él va a hacer, si lo sostiene la segunda vez, cómo queda después. Criterio: un límite dicho y sostenido una vez que el otro insistió.
Cuánto y cada cuánto:
Veinte minutos por sesión, una vez por semana mientras dure.
Para casa:
Nada escrito, y nada que se pueda leer. Si vive en la misma casa que la persona del límite, eso se tiene en cuenta al planificar dónde y cuándo.')
on conflict (title) where practitioner_id is null do update set
  discipline = excluded.discipline, area = excluded.area, focus = excluded.focus,
  kind = excluded.kind, objective = excluded.objective,
  age_range = excluded.age_range, content = excluded.content;

-- ─── Técnicas ───────────────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychology', 'Técnicas', 'Respiración', 'La respiración de la abeja', 'guide', 'Enseñar una respiración larga a chicos muy chicos, con un sonido que la hace fácil de sostener', '3-5 años', 'Para qué sirve:
A los tres o cuatro años no se puede pedir respirá profundo: no se entiende y se hace al revés. Con el zumbido de la abeja la espiración se alarga sola, porque para hacer el sonido hay que soltar el aire despacio.
Qué necesitás:
Nada. Un dibujo de una abeja o una flor ayuda a presentarlo.
Cómo se presenta:
Lo hacés vos primero y le da risa, que es lo que hay que buscar. Se juega dos o tres veces y se corta: a esta edad la técnica se instala por repetición en situaciones tranquilas, nunca en el medio de un llanto.
Ejercicio 1, la abeja:
• Aire por la nariz, y al soltarlo hacer mmmmm como una abeja, todo lo que dure.
• Cinco abejas.
• Con las manos tapando las orejas, que hace que se escuche por dentro y le encanta.
Ejercicio 2, las otras dos versiones:
Para variar, porque a esta edad la misma cosa se aburre.
• La vela: soplar una vela imaginaria despacio, sin apagarla del todo.
• La flor: oler una flor por la nariz y soplar una plumita por la boca.
• Cinco de cada una.
Ejercicio 3, cuándo se usa:
Se elige un momento fijo del día, tranquilo, y se hace ahí todos los días.
• Antes de dormir, acostado.
• Cuando vuelve de la escuela.
• Y se agrega, más adelante, cuando está empezando a enojarse, no cuando ya explotó.
Progresión:
• Si sale fácil: sumar el conteo (aire para adentro contando tres) y usarla en un momento de malestar leve.
• Si no sale: hacerlo sólo vos al lado, sin pedirle nada, hasta que se sume por imitación.
Qué mirar:
Si alarga la espiración, si se marea (ahí se corta y se acortan las repeticiones), si la hace en un momento tranquilo, si alguna vez la usa sola. Criterio: cinco abejas hechas con la espiración larga, dos sesiones seguidas.
Cuánto y cada cuánto:
Dos o tres minutos, todos los días, siempre en el mismo momento.
Para la familia:
Hacerla con él, no pedírsela. Y nunca usarla como corrección en medio de un desborde: ahí no entra nada.'),

  (null, 'psychology', 'Técnicas', 'Respiración', 'Respirar con la panza', 'guide', 'Instalar la respiración diafragmática con apoyos concretos que la hacen visible', '6-7 años', 'Para qué sirve:
Respirar con el pecho y los hombros mantiene el cuerpo alerta; respirar con la panza lo baja. Con un peluche apoyado en la panza la diferencia se ve, y eso convierte una instrucción abstracta en algo concreto.
Qué necesitás:
Un peluche o un libro liviano, una colchoneta o el piso, y algo para apoyar la cabeza.
Cómo se presenta:
Se hace acostado la primera vez, que es donde sale más fácil. El peluche sobre la panza sube y baja, y eso es toda la explicación que hace falta: se trata de hacer subir al peluche.
Ejercicio 1, acostado, con el peluche:
• Peluche en la panza, manos al costado.
• Aire por la nariz: el peluche sube.
• Aire por la boca, despacio: el peluche baja.
• Diez respiraciones, contando el peluche.
Ejercicio 2, el conteo:
Una vez que la panza se mueve, se agrega el ritmo.
• Tres tiempos para adentro, cinco para afuera.
• La regla: soltar tiene que durar más que tomar. Eso es lo que baja el cuerpo.
• Diez respiraciones así.
Ejercicio 3, sentado y de pie:
• Sentado, con una mano en la panza y otra en el pecho: la de la panza se mueve, la del pecho casi nada.
• Parado, igual.
• Y la versión discreta: sin manos, sin que nadie note nada. Esa es la que va a usar en la escuela.
Progresión:
• Si sale fácil: usarla en un momento de malestar leve y anotar si bajó algo, y llevarla a la escuela.
• Si no sale: quedate acostado con el peluche, sin conteo, varias sesiones.
Qué mirar:
Si mueve la panza o el pecho, si levanta los hombros, si la espiración es más larga que la inspiración, si se marea (menos repeticiones), si la puede hacer sentado. Criterio: diez respiraciones sentado con la panza moviéndose, dos sesiones seguidas.
Cuánto y cada cuánto:
Cinco minutos, todos los días, en un momento tranquilo. La práctica en frío es la que hace que sirva en caliente.
Para casa:
Cinco respiraciones con el peluche antes de dormir, todas las noches. Con alguien al lado haciéndolas también.'),

  (null, 'psychology', 'Técnicas', 'Respiración', 'Respirar en cuadrado', 'guide', 'Usar una respiración con conteo parejo para bajar la activación en momentos de tensión', '8-9 años', 'Para qué sirve:
El cuadrado le da a la respiración una forma que se puede seguir con el dedo, y eso resuelve el problema de las técnicas de respiración con chicos: que se olvidan en el momento en que hacen falta. Un cuadrado se dibuja en el aire.
Qué necesitás:
Nada. Una hoja con un cuadrado dibujado para la primera vez.
Cómo se presenta:
Se dibuja el cuadrado y se recorre con el dedo mientras se respira, un lado por tiempo. Se hace junto con vos las primeras veces, contando en voz alta, y después en silencio.
Ejercicio 1, el cuadrado con el dedo:
Cuatro lados, cuatro tiempos de cuatro segundos.
• Lado de arriba: tomar aire, contando cuatro.
• Lado derecho: sostener, cuatro.
• Lado de abajo: soltar, cuatro.
• Lado izquierdo: esperar, cuatro.
Cuatro vueltas completas.
Ejercicio 2, el cuadrado sin hoja:
• Con el dedo en el aire.
• Con el dedo en la pierna, que no se ve.
• Y sólo con el conteo, sin dedo.
Cuatro vueltas de cada versión.
Ejercicio 3, cuándo usarlo, practicado en frío:
Se eligen tres momentos concretos y se practica ahí, sin malestar.
• Antes de una prueba.
• Cuando empieza a subir el enojo, en el número tres o cuatro del termómetro.
• Antes de dormir.
Progresión:
• Si sale fácil: sostener seis segundos por lado, y usarlo en una situación real de tensión.
• Si no sale: sacar el sostener y quedarse con tomar y soltar, dos lados en lugar de cuatro.
Ojo con esto:
Si sostener el aire le resulta molesto o le da mareo, se saca: la versión de dos lados funciona igual. Y si aparece hiperventilación o mucha incomodidad, se pasa a respiración con la panza sin conteo.
Qué mirar:
Si mantiene el conteo, si se marea, si baja algo en la escala del uno al diez después de cuatro vueltas, si lo usa solo. Criterio: cuatro vueltas completas sin hoja y un descenso de dos puntos en la escala.
Cuánto y cada cuánto:
Tres minutos, todos los días, en frío. Una técnica estrenada en caliente no funciona.
Para casa:
Cuatro vueltas antes de dormir, todas las noches, durante dos semanas. Después queda disponible.'),

  (null, 'psychology', 'Técnicas', 'Respiración', 'Respirar cuando no se puede parar', 'guide', 'Manejar un momento de mucha activación o un ataque de pánico, con una técnica que funciona rápido', '12-14 años', 'Para qué sirve:
Cuando la activación es muy alta, las técnicas lentas no entran: el cuerpo está en alarma y no va a hacer una respiración de cuatro tiempos. Lo que sirve ahí es otra cosa, y hay que tenerlo escrito y practicado de antes.
Qué necesitás:
Una tarjeta chica para la billetera o una nota en el celular, y agua fría si hay.
Cómo se presenta:
Se explica primero qué está pasando en el cuerpo, porque entender baja el miedo al miedo: el corazón rápido y la falta de aire son una alarma, no un peligro, y la alarma se apaga sola en unos minutos. Eso se dice con claridad.
Ejercicio 1, la respiración que funciona en alta activación:
• Soltar el aire primero, largo, antes de tomar. Casi siempre está el pecho lleno.
• Después: tomar cuatro, soltar seis. La espiración más larga es lo que activa el freno.
• Y no forzar aire de más: en pánico sobra aire, no falta.
Diez respiraciones, practicadas en frío.
Ejercicio 2, las anclas del cuerpo:
• Agua fría en la cara o en las manos, o un cubito de hielo en la mano.
• Pies apoyados y empujar el piso fuerte, veinte segundos.
• Nombrar cinco cosas que ve, cuatro que escucha, tres que toca.
• Caminar, si se puede.
Ejercicio 3, la tarjeta, escrita por él:
Tres líneas, en la billetera o en el celular, con letra propia.
• Qué me está pasando: es una alarma, se pasa.
• Qué hago: soltar el aire, cuatro y seis, pies al piso.
• Y a quién puedo escribirle.
Progresión:
• Si sale fácil: practicarlo en situaciones de activación media, y trabajar la exposición a lo que evita.
• Si no sale: quedarse sólo en las anclas del cuerpo, que no piden coordinación fina.
Ojo con esto:
Si los episodios son frecuentes, si empezó a evitar lugares o actividades, si hay dolor en el pecho, desmayos, o si aparece algo que hace pensar en una causa médica, corresponde una consulta médica y una evaluación más amplia. Y si aparecen ideas de lastimarse, eso es prioridad y se habla con la familia.
Qué mirar:
Cuánto dura el episodio, si la técnica lo acorta, qué evita después, si lleva la tarjeta. Criterio: un episodio manejado con la tarjeta y contado después.
Cuánto y cada cuánto:
Cinco minutos de práctica en frío, todos los días, dos semanas.
Para la familia:
Qué hacer si pasa delante de ellos: quedarse, hablar poco y bajo, no decir tranquilizate, no llevarlo a la guardia si ya se sabe qué es, y recordarle su tarjeta.'),

  (null, 'psychology', 'Técnicas', 'Relajación', 'Apretar y soltar, de los pies a la cabeza', 'guide', 'Aprender a reconocer la diferencia entre un músculo tenso y uno suelto, y poder soltarlo a voluntad', '8-9 años', 'Para qué sirve:
Muchos chicos viven con el cuerpo tenso y no lo saben, porque no tienen con qué comparar. Apretar a propósito y después soltar da la comparación, y con la comparación aparece la posibilidad de soltar cuando hace falta.
Qué necesitás:
Una colchoneta o el piso, un lugar tranquilo, y unos diez minutos sin interrupciones.
Cómo se presenta:
Se hace acostado y guiado por tu voz, lento. Cada grupo muscular se aprieta cinco segundos y se suelta diez, y se nombra la diferencia: sentí cómo quedó distinto. Nombrar la diferencia es el contenido.
Ejercicio 1, el recorrido, de abajo hacia arriba:
Cinco segundos apretando, diez soltando, en cada uno.
• Los pies: apretar los dedos como si agarraran arena.
• Las piernas: estirarlas fuerte.
• La panza: ponerla dura como una piedra.
• Las manos: puños apretados.
• Los brazos: pegarlos al cuerpo con fuerza.
• Los hombros: subirlos hasta las orejas.
• La cara: apretar los ojos y arrugar la nariz.
Ejercicio 2, el repaso final:
• Apretar todo el cuerpo a la vez, cinco segundos.
• Soltar todo de golpe.
• Y quedarse quieto veinte segundos, sintiendo el cuerpo pesado.
Ejercicio 3, la versión corta, para usar en cualquier parte:
Tres grupos, sentado, sin que se note.
• Manos: puños y soltar, tres veces.
• Hombros: subir y soltar, tres veces.
• Piernas: apretar y soltar, tres veces.
Progresión:
• Si sale fácil: soltar sin apretar primero, que es el objetivo final, y usar la versión corta en clase.
• Si no sale: tres grupos musculares en lugar de siete, y con vos apretando y soltando al mismo tiempo.
Ojo con esto:
No se aprieta ninguna zona donde haya dolor o lesión. Y si acostado con los ojos cerrados le resulta incómodo, se hace sentado y con los ojos abiertos.
Qué mirar:
Si distingue tenso de suelto, si puede soltar de verdad o queda a medias, dónde tiene más tensión, si el cuerpo se queda quieto al final. Criterio: el recorrido completo con la diferencia nombrada en tres grupos.
Cuánto y cada cuánto:
Diez minutos, tres veces por semana, siempre en frío.
Para casa:
El recorrido completo antes de dormir, tres veces por semana, con alguien leyendo la guía o solo si ya lo sabe.'),

  (null, 'psychology', 'Técnicas', 'Relajación', 'El lugar tranquilo', 'guide', 'Construir una imagen mental detallada a la que se pueda volver para bajar la activación', '8-9 años', 'Para qué sirve:
Una imagen mental muy detallada ocupa la cabeza y baja el cuerpo, y tiene una ventaja sobre todo lo demás: está disponible en cualquier parte y nadie se da cuenta. La clave es el detalle, y el detalle se construye antes.
Qué necesitás:
Hoja y lápices de colores para dibujarlo, y un lugar tranquilo para armarlo.
Cómo se presenta:
El lugar lo elige él, y puede ser real o inventado. Se construye con los cinco sentidos, uno por uno, y se dibuja. Lo que hace que funcione no es la imagen linda: es que tenga sonidos, olores y temperatura.
Ejercicio 1, elegir el lugar y ponerle los cinco sentidos:
• ¿Dónde es? Real o inventado.
• Qué se ve: tres cosas concretas.
• Qué se escucha.
• Qué se huele.
• Qué se siente en la piel: temperatura, viento, el piso.
• Y si hay alguien o está solo, que también lo decide él.
Ejercicio 2, dibujarlo y escribirlo:
• El dibujo en una hoja, con los detalles.
• Y al costado, las cinco cosas de los sentidos escritas.
• La hoja se guarda en la carpeta, y se puede mirar cuando cuesta imaginarlo.
Ejercicio 3, ir y volver, guiado y solo:
• Guiado por tu voz, dos minutos, con los ojos cerrados o mirando un punto.
• Solo, un minuto.
• Y la parte que casi nunca se enseña: cómo se vuelve. Tres respiraciones, mover los pies y las manos, abrir los ojos.
Progresión:
• Si sale fácil: usarlo en un momento de malestar leve, y en un lugar con gente alrededor.
• Si no sale: mirar el dibujo en lugar de imaginarlo, o usar una foto de un lugar real.
Qué mirar:
Si puede sostener la imagen, si aparecen los sentidos o sólo lo visual, si baja algo en la escala, si vuelve bien. Criterio: dos minutos sostenidos solo, con un descenso en la escala.
Cuánto y cada cuánto:
Cinco minutos, tres veces por semana, en frío.
Para casa:
Dos minutos antes de dormir, con el dibujo al lado de la cama.'),

  (null, 'psychology', 'Técnicas', 'Relajación', 'La rutina para dormir', 'guide', 'Armar una rutina de sueño con pasos fijos, que es lo que más rápido mejora el ánimo y la conducta', '6-7 años', 'Para qué sirve:
Dormir mal empeora todo: la tolerancia, la atención, el ánimo y la conducta. Y la mayoría de las dificultades para dormir de esta edad se resuelven con una rutina fija y con dos o tres cambios en la casa, no con técnicas.
Qué necesitás:
Una hoja para dibujar los pasos, y la información de la familia sobre cómo son las noches.
Cómo se presenta:
Primero se mira qué pasa hoy, hora por hora, desde la cena hasta que se duerme. Se cambian tres cosas, no diez, y se dan dos semanas antes de evaluar.
Ejercicio 1, los pasos de la rutina, siempre iguales:
Cuatro o cinco pasos, en el mismo orden todas las noches.
• Baño.
• Pijama y dientes.
• Un cuento o una charla corta, en la cama.
• Cinco respiraciones o el lugar tranquilo.
• Luz baja y a dormir.
Se dibuja la secuencia y se cuelga en el cuarto.
Ejercicio 2, los tres cambios de la casa:
Los que más efecto tienen.
• Pantallas apagadas una hora antes, todas, incluida la de los adultos.
• Misma hora de acostarse todos los días, con menos de una hora de diferencia el fin de semana.
• Luz baja en la última media hora.
• Y la cama sólo para dormir: los deberes y los juegos, afuera.
Ejercicio 3, qué hacer si se despierta o no se puede dormir:
• Si no se duerme en veinte minutos, levantarse, hacer algo aburrido con luz baja, y volver.
• Si se despierta a la noche, volverlo a su cama con la menor interacción posible.
• Y si aparece miedo a la oscuridad, luz tenue y un objeto que lo acompañe: no se discute el miedo.
Progresión:
• Si sale fácil: sacar de a un paso la presencia del adulto, hasta que se duerma solo.
• Si no sale: quedarse en la puerta del cuarto, y alejarse de a poco a lo largo de las semanas.
Ojo con esto:
Si ronca fuerte, si tiene pausas al respirar, si se despierta muchas veces con sueño de día, o si hay terrores nocturnos frecuentes, corresponde una consulta médica: hay causas del sueño que no se arreglan con rutina.
Qué mirar:
Cuánto tarda en dormirse, cuántas veces se despierta, cómo está a la mañana, si la rutina se cumple. Criterio: dos semanas con la rutina completa y una mejora en el tiempo que tarda en dormirse.
Cuánto y cada cuánto:
Todas las noches. Se arma en una sesión y se revisa a las dos semanas.
Para la familia:
Los mismos pasos, en el mismo orden, todas las noches, incluso los fines de semana. Lo que hace efecto es la repetición exacta, no el contenido de los pasos.'),

  (null, 'psychology', 'Técnicas', 'Relajación', 'Los cinco sentidos, para volver al presente', 'guide', 'Usar una técnica de anclaje sensorial para cortar la rumiación o la disociación', '12-14 años', 'Para qué sirve:
Cuando la cabeza se va (a lo que pasó, a lo que puede pasar, o a ninguna parte) las técnicas de respiración a veces no alcanzan. El anclaje sensorial trae la atención al presente por la puerta de los sentidos, que es más difícil de ignorar.
Qué necesitás:
Nada. Algo con olor fuerte o textura marcada ayuda al principio.
Cómo se presenta:
Se practica en frío, sin malestar, hasta que sale de memoria. Se explica para qué sirve sin prometer que hace desaparecer nada: no saca el problema, corta el círculo.
Ejercicio 1, el cinco cuatro tres dos uno:
En voz alta la primera vez, en silencio después.
• Cinco cosas que veo, nombradas con detalle.
• Cuatro que escucho.
• Tres que toco.
• Dos que huelo.
• Una que saboreo.
Ejercicio 2, las versiones cortas:
Para cuando no hay tiempo ni privacidad.
• Tres cosas que veo, tres que escucho, tres que toco.
• Los pies contra el piso, la espalda contra la silla, las manos sobre la mesa.
• Un objeto con textura en el bolsillo, y describirlo con el tacto.
Ejercicio 3, cuándo usarlo, con sus propias situaciones:
Se hace la lista de los momentos en que la cabeza se va.
• A la noche, antes de dormir.
• En una clase que no le interesa.
• Después de una discusión.
• Y en clase, la versión discreta: pies, espalda, manos.
Progresión:
• Si sale fácil: usarlo en situaciones de activación más alta, y combinarlo con la respiración.
• Si no sale: quedarse en las anclas físicas (pies, espalda, manos), que no piden nombrar nada.
Ojo con esto:
Si lo que aparece es disociación frecuente, recuerdos intrusivos de algo que pasó, o desconexión que dura, esta técnica es un recurso de emergencia y no el tratamiento: eso se evalúa aparte y con el tiempo que necesite.
Qué mirar:
Si la técnica corta el círculo, cuánto tarda, si la usa sola, en qué momentos le sirve más. Criterio: dos usos propios en la semana, con el resultado contado.
Cuánto y cada cuánto:
Dos minutos, todos los días, en frío, durante dos semanas.
Para casa:
La versión corta antes de dormir. Y el objeto con textura en el bolsillo, si le sirve.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'Los pensamientos que aparecen solos', 'activity', 'Registrar pensamientos automáticos y distinguirlos de los hechos', '12-14 años', 'Para qué sirve:
Un pensamiento automático se vive como un hecho: si la cabeza dice nadie te quiere, eso se siente cierto. Separar el pensamiento del hecho es el primer paso de todo el trabajo cognitivo, y es un paso que se puede hacer en una sesión.
Qué necesitás:
Hoja con tres columnas, lápiz. Y el celular, para registrar durante la semana.
Cómo se presenta:
Se empieza por una situación reciente y se busca el pensamiento exacto, textual, no un resumen. La palabra exacta importa: siempre y nunca no significan lo mismo que a veces, y ahí está el trabajo.
Ejercicio 1, las tres columnas:
Para una situación concreta.
• Situación: qué pasó, sólo hechos observables.
• Pensamiento: qué me dijo la cabeza, textual y entre comillas.
• Emoción: qué sentí, y del uno al diez.
Ejercicio 2, separar el hecho del pensamiento:
Con una lista mezclada, decidir cuál es cuál.
• Me sacó 4 en la prueba: hecho.
• Soy un desastre en matemática: pensamiento.
• No me contestó el mensaje: hecho.
• Está enojada conmigo: pensamiento.
• Me equivoqué dos veces: hecho.
• Todos se dieron cuenta: pensamiento.
Ejercicio 3, el registro de la semana:
Tres situaciones por semana, con las tres columnas, anotadas en el momento o esa misma noche.
• En el celular o en un papel.
• Sin analizar nada todavía: sólo registrar.
Registrar sin analizar es la tarea, y conviene decirlo, porque el impulso es discutirlo enseguida.
Progresión:
• Si sale fácil: pasar a discutir los pensamientos, con el material siguiente.
• Si no sale: una situación por semana, y hacerla acá en lugar de en casa.
Ojo con esto:
Si en el registro aparecen pensamientos sobre lastimarse, sobre no querer estar, o desesperanza sostenida, eso es lo que se trabaja y se evalúa, y se habla con la familia. El registro deja de ser una tarea y pasa a ser información clínica urgente.
Qué mirar:
Si puede identificar el pensamiento textual, si distingue hechos de pensamientos, qué tipo de pensamientos repite, si el registro se sostiene. Criterio: tres registros propios con el pensamiento textual escrito.
Cuánto y cada cuánto:
Veinte minutos por sesión, una vez por semana, y tres registros en la semana.
Para casa:
Tres registros, tres líneas cada uno. Nada más: si la tarea es larga, no se hace.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'El pensamiento que se puede discutir', 'worksheet', 'Poner a prueba un pensamiento automático con evidencia, en lugar de aceptarlo o negarlo', '12-14 años', 'Para qué sirve:
Un pensamiento automático se puede examinar como se examina una afirmación cualquiera: con evidencia a favor y en contra. No se trata de pensar en positivo, que no funciona, sino de pensar con más exactitud.
Qué necesitás:
Hoja con cinco partes, lápiz, y un registro de pensamientos de la semana.
Cómo se presenta:
Se elige un pensamiento del registro, uno que se repita. Y se aclara algo antes: no se busca que el pensamiento sea falso. A veces es verdad, y entonces el trabajo es otro: qué hago con esto.
Ejercicio 1, las cinco partes:
Para un pensamiento del registro.
• El pensamiento, textual.
• Cuánto lo creo, del uno al diez.
• Evidencia a favor: hechos, no interpretaciones.
• Evidencia en contra: hechos también, y acá hay que buscar de verdad.
• Una versión más exacta del pensamiento, y cuánto la creo.
Ejercicio 2, las preguntas que ayudan a buscar evidencia:
Cuando no aparece evidencia en contra, estas cuatro la destraban.
• ¿Qué diría alguien que me quiere y vio todo?
• ¿Le diría esto mismo a un amigo en mi lugar?
• ¿Hay alguna vez que no haya pasado así?
• ¿Qué es lo peor que puede pasar, y cómo lo manejaría?
Ejercicio 3, el pensamiento que sí es verdad:
Si la evidencia a favor gana, el trabajo cambia y hay que decirlo.
• ¿Qué parte puedo cambiar?
• ¿Qué necesito para eso?
• ¿Y qué parte no puedo cambiar, y qué hago con eso?
Progresión:
• Si sale fácil: hacerlo en el momento, mentalmente, y pasar a experimentos conductuales.
• Si no sale: quedarse en registrar y en buscar sólo una evidencia en contra.
Ojo con esto:
No se discute un pensamiento sobre algo que efectivamente está pasando y es grave: si hay violencia, hostigamiento o una situación real de riesgo, el pensamiento no es distorsionado y lo que hay que cambiar es la situación.
Qué mirar:
Si encuentra evidencia en contra, si la creencia baja aunque sea un punto, si puede tolerar que a veces el pensamiento sea cierto. Criterio: un pensamiento trabajado con las cinco partes y un descenso de dos puntos en cuánto lo cree.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana, con un pensamiento por vez.
Para casa:
Una hoja de cinco partes por semana, sobre un pensamiento que se repita. Y si no aparece ninguno, no se inventa.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'Lo peor, lo mejor y lo probable', 'worksheet', 'Desarmar la anticipación catastrófica comparándola con el escenario probable', '12-14 años', 'Para qué sirve:
La cabeza ensaya el peor escenario con mucho detalle y el probable con ninguno. Escribir los tres y compararlos muestra la desproporción, y de paso deja un plan para el peor, que es lo que saca el miedo de encima.
Qué necesitás:
Hoja dividida en tres, lápiz, y una situación que esté por venir.
Cómo se presenta:
Se elige algo concreto que le preocupa y que va a pasar pronto, no un miedo general. La comparación de los tres escenarios funciona con una situación con fecha.
Ejercicio 1, los tres escenarios:
• Lo peor que puede pasar, con todo el detalle que quiera.
• Lo mejor que puede pasar.
• Y lo más probable, que casi siempre queda en el medio y es aburrido.
Y una pregunta después: ¿en cuál de los tres estaba pensando hasta ahora?
Ejercicio 2, el plan para lo peor:
Esta es la parte que hace la diferencia, porque lo que asusta no es lo peor: es no saber qué haría.
• Si pasara lo peor, ¿qué haría al día siguiente?
• ¿A quién le pediría ayuda?
• ¿Lo viví antes? ¿Cómo lo pasé?
• ¿Cuánto duraría?
Ejercicio 3, la predicción escrita y la comprobación:
• Antes de la situación: qué predice que va a pasar, escrito y con fecha.
• Después: qué pasó en realidad.
• Y la comparación de las dos, guardada.
Con tres o cuatro comparaciones guardadas, la evidencia es propia y ya no hace falta discutir nada.
Progresión:
• Si sale fácil: usarlo con situaciones más grandes, y hacer la predicción mentalmente.
• Si no sale: quedarse en el plan para lo peor, que suele aliviar solo.
Ojo con esto:
Si el escenario temido incluye algo que efectivamente puede pasar y es serio, esto no se usa para minimizar: se trabaja el plan real y, si corresponde, se habla con la familia y con quien haga falta.
Qué mirar:
Si puede describir el probable, si el plan para lo peor le baja la ansiedad, si sus predicciones se cumplen (casi nunca, y eso es el dato). Criterio: tres predicciones escritas y comparadas con lo que pasó.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana, con una situación con fecha.
Para casa:
La predicción escrita antes de cada situación que le preocupa, y la comparación después. Dos líneas cada una.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'Separar los hechos de lo que me contó la cabeza', 'worksheet', 'Distinguir con precisión los hechos de las interpretaciones en una situación cargada', '15+ años', 'Para qué sirve:
En una situación cargada los hechos y las interpretaciones vienen mezclados, y se actúa sobre la mezcla. Separarlos en dos columnas es un ejercicio breve y muy concreto, y casi siempre cambia lo que uno decide hacer.
Qué necesitás:
Hoja con dos columnas, lápiz, y una situación de esta semana.
Cómo se presenta:
Se define hecho con precisión: algo que una cámara habría registrado. Todo lo demás, por más obvio que parezca, va a la otra columna. Esa definición es lo que hace posible el ejercicio.
Ejercicio 1, la prueba de la cámara:
Se clasifica cada frase de la situación.
• Hecho: lo que registraría una cámara, incluidas las palabras dichas.
• Interpretación: intenciones, motivos, lo que el otro pensaba, lo que va a pasar.
• Y las sensaciones propias, que son hechos: me latía fuerte el corazón es un hecho.
Ejercicio 2, la situación de esta semana:
En dos columnas, la situación completa.
• Izquierda: sólo lo que registraría una cámara.
• Derecha: todo lo que la cabeza agregó.
Y una pregunta: si sólo hubieran pasado las cosas de la izquierda, ¿qué habrías hecho?
Ejercicio 3, chequear una interpretación:
Se elige la interpretación más importante y se busca cómo verificarla.
• ¿Cómo podría averiguar si es así?
• ¿Qué pregunta concreta se lo diría?
• ¿Qué haría si la respuesta es que no es así?
• Y qué haría si es exactamente como pensaba.
Progresión:
• Si sale fácil: hacerlo mentalmente en el momento, y pasar a verificar interpretaciones en la vida real.
• Si no sale: trabajar con una situación ajena primero, y con una interpretación por vez.
Ojo con esto:
Separar hechos de interpretaciones no sirve para poner en duda lo que alguien vivió: si hubo violencia, maltrato o abuso, lo que se relata son hechos y el trabajo es otro. Esta ficha se usa en situaciones ambiguas, no en esas.
Qué mirar:
Si la columna de hechos queda limpia, si aparecen más interpretaciones de las que esperaba, si la decisión cambia con los hechos solos. Criterio: una situación separada en dos columnas sin ayuda, y una interpretación verificada.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana.
Para casa:
Una situación por semana en dos columnas. Y antes de reaccionar a un mensaje que molestó, la pregunta: ¿esto es hecho o es lo que agregué?'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'El pensamiento de todo o nada', 'activity', 'Identificar los patrones de pensamiento rígido más frecuentes y ampliar el rango', '15+ años', 'Para qué sirve:
Hay formas de pensar que se repiten y hacen daño solas: todo o nada, siempre o nunca, si no es perfecto no sirve. Nombrarlas es la mitad del trabajo, porque una vez que tienen nombre se reconocen en el momento.
Qué necesitás:
Hoja y lápiz, y sus propios registros de pensamientos.
Cómo se presenta:
Se presentan los patrones con ejemplos generales y él busca los propios en sus registros. Buscar los propios es lo que hace que sirva: la lista ajena no se aplica sola.
Ejercicio 1, los patrones, con nombre:
Los cinco más frecuentes.
• Todo o nada: o soy el mejor o soy un desastre.
• Sobregeneralización: siempre me pasa lo mismo.
• Leer la mente: seguro está pensando que soy un plomo.
• Catastrofizar: esto va a terminar mal.
• Y los debería: tendría que poder con todo.
Ejercicio 2, encontrar los propios:
Con los registros de las últimas semanas.
• ¿Cuál aparece más veces?
• ¿En qué tema aparece: estudio, amistades, cuerpo, familia?
• Y ponerle un nombre corto propio al que más aparece, para poder decirlo en el momento.
Ejercicio 3, ampliar el rango:
Para el patrón de todo o nada, la escala del medio.
• Poner la situación en una escala del 0 al 100, en lugar de en dos casilleros.
• Buscar tres puntos intermedios: qué sería un 40, un 60, un 80.
• Y la pregunta que ordena: ¿cuál es el mínimo aceptable, no el ideal?
Progresión:
• Si sale fácil: reconocerlo en el momento y nombrarlo en voz alta, y trabajar los debería, que son los más resistentes.
• Si no sale: un solo patrón, el más frecuente, durante varias semanas.
Ojo con esto:
Los patrones se nombran para reconocerlos, no para usarlos contra uno mismo: si el trabajo termina en otra vez pensé mal, se está haciendo al revés y conviene decirlo.
Qué mirar:
Si reconoce sus patrones, si aparecen en un tema en particular, si puede encontrar puntos intermedios, si se reta por tener el patrón. Criterio: un patrón propio identificado y tres puntos intermedios encontrados en una situación.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana.
Para casa:
Nombrar el patrón cuando aparece, sin hacer nada más. Sólo nombrarlo.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'Qué le diría a alguien que quiero', 'worksheet', 'Usar la perspectiva compasiva hacia otro para revisar el propio diálogo interno', '15+ años', 'Para qué sirve:
Casi nadie se habla a sí mismo como le hablaría a alguien que quiere. La diferencia entre las dos versiones es enorme y se ve en un minuto, y esa diferencia es en sí misma el material de trabajo.
Qué necesitás:
Hoja dividida en dos, lápiz, y una situación propia reciente donde se trató mal.
Cómo se presenta:
Se elige una situación concreta en la que se habló duro a sí mismo. Y se pide algo específico: escribir lo que le diría a un amigo o a un hermano en exactamente la misma situación, con sus palabras, completo.
Ejercicio 1, las dos versiones:
• Izquierda: lo que me dije. Textual.
• Derecha: lo que le diría a alguien que quiero, en la misma situación. También textual y completo.
Y después, leer las dos en voz alta, una detrás de la otra.
Ejercicio 2, las tres preguntas sobre la diferencia:
• ¿Por qué con el otro sí y conmigo no?
• ¿Le sirve a alguien que me hable así? ¿Me hace hacer las cosas mejor?
• ¿Qué pasaría si me hablara como en la columna de la derecha?
Ejercicio 3, quedarse con una frase y usarla:
• Se elige una frase de la columna derecha, corta.
• Se escribe en el celular o en un papel.
• Y se usa durante la semana, en el momento en que aparece la voz dura.
No se discute la voz dura: se agrega la otra al lado.
Progresión:
• Si sale fácil: usarlo en situaciones más cargadas, y notar si baja la evitación de cosas difíciles.
• Si no sale: hacerlo sobre una situación de otro primero, y volver a la propia después.
Ojo con esto:
Si el diálogo interno incluye ideas de lastimarse o de no querer estar, esto no es una ficha de autocompasión: es una evaluación de riesgo, y se hace en el momento.
Qué mirar:
Si puede escribir la columna derecha completa, cuánta diferencia hay entre las dos, si aparece resistencia (a mí eso no me sirve, es hacerse el tonto), si usa la frase. Criterio: las dos columnas escritas y una frase usada en la semana.
Cuánto y cada cuánto:
Veinte minutos, una vez por semana.
Para casa:
La frase elegida, a mano, y usarla una vez por día. Y nada más, porque alcanza.')
on conflict (title) where practitioner_id is null do update set
  discipline = excluded.discipline, area = excluded.area, focus = excluded.focus,
  kind = excluded.kind, objective = excluded.objective,
  age_range = excluded.age_range, content = excluded.content;
