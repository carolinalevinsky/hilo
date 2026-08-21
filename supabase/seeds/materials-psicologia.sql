-- Psicología, hasta llegar a 50.
--
-- materials-curados.sql trajo los primeros 8 de esta disciplina. Estos son el
-- resto. A partir de acá cada profesión tiene su archivo, que es más fácil de
-- revisar que un archivo largo con las seis mezcladas.
--
-- Convenciones: subtítulo es una línea corta terminada en dos puntos, las
-- viñetas empiezan con •, y no hay rayas en el texto que lee la persona.

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'El monstruo de colores, versión propia', 'activity', 'Asociar cada emoción con un color elegido por el chico', '3-5 años', 'Cómo se hace:
Seis frascos vacíos y papelitos de colores. Cada emoción se lleva un color, y lo elige él.
Las emociones para empezar:
Alegría, tristeza, enojo, miedo, calma.
La consigna:
Contame algo que te haya pasado y poné un papelito del color que corresponde en el frasco.
Al final de la semana:
Se mira qué frasco tiene más papeles. No para corregirlo, para hablarlo.
Por qué él elige los colores:
Si el enojo es rojo porque el libro dice rojo, el sistema es del libro. Si el enojo es negro porque él lo eligió, es suyo y lo va a recordar.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'Cara, cuerpo y situación', 'worksheet', 'Vincular la emoción con sus señales corporales y con lo que la provoca', '6-7 años', 'Tres columnas en una hoja:
Qué pasó. Qué sentí. Dónde lo sentí en el cuerpo.
Ejemplos para empezar juntos:
Me dejaron afuera del juego. Tristeza. En la garganta.
Se me perdió la mochila. Susto. En la panza.
Gané en el recreo. Alegría. En todo el cuerpo.
La columna que más cuesta:
La tercera. Casi ningún chico la tiene registrada al principio, y es la que después permite darse cuenta antes.
Cuántas por sesión:
Dos o tres. No es un formulario para completar entero.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'Las emociones que no son las cinco de siempre', 'activity', 'Ampliar el vocabulario emocional más allá de las emociones básicas', '10-11 años', 'De qué se trata:
Casi todos los chicos nombran cinco emociones. La vida tiene más, y no poder nombrarlas hace que todo se sienta igual de intenso.
Las palabras para trabajar:
Frustración, vergüenza, celos, alivio, orgullo, culpa, ansiedad, decepción, entusiasmo, nostalgia.
Cómo se trabaja cada una:
• Qué situación te haría sentir eso.
• En qué se parece a otra emoción y en qué se diferencia.
• Cómo se te vería la cara.
La diferencia que más sirve:
Entre enojo y frustración. El enojo es con alguien; la frustración es con algo que no sale. Distinguirlas cambia qué se hace después.
Dos palabras por sesión:
Diez de una vez no queda ninguna.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'El cuerpo como aviso', 'worksheet', 'Mapear dónde se siente cada emoción en el propio cuerpo', '10-11 años', 'Qué se dibuja:
Una silueta del cuerpo, grande, en una hoja.
La consigna:
Pintá con un color dónde sentís cada emoción. Podés pintar más de un lugar.
Las emociones para mapear:
Nervios, enojo, tristeza, alegría, vergüenza, miedo.
Lo que se descubre:
Que casi todas tienen un lugar. Los nervios en la panza, el enojo en la cara y en las manos, la vergüenza en las orejas.
Para qué sirve:
El cuerpo avisa antes que la cabeza. Un chico que reconoce el calor en la cara puede hacer algo con eso; uno que sólo nota que ya gritó, no.
Se guarda y se vuelve a mirar:
A los tres meses, con otra hoja. Cambia más de lo que parece.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'Emociones mezcladas', 'activity', 'Reconocer que se pueden sentir dos cosas opuestas a la vez', '12-14 años', 'La idea:
Casi todas las situaciones importantes producen más de una emoción, y a veces contradictorias. Poder sostenerlas juntas evita mucho lío.
Las situaciones que sirven:
• Terminar la escuela.
• Que un amigo se mude.
• Ganar algo que un amigo quería.
• Que se separen los padres de alguien cercano.
La consigna:
Nombrá dos emociones que se puedan sentir al mismo tiempo acá, y que sean distintas.
Lo que suele costar:
Aceptar que sentir alivio y tristeza a la vez no significa que una sea falsa.
La frase que ayuda:
Las dos son verdad al mismo tiempo.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'El diccionario de emociones propio', 'worksheet', 'Construir definiciones personales de cada emoción', '8-9 años', 'Qué se arma:
Un cuaderno chico. Una emoción por hoja.
Cada hoja tiene:
• La palabra, escrita grande.
• Un dibujo de la cara.
• Una situación en la que la sintió.
• Qué le pasa en el cuerpo.
• Qué le ayuda cuando la siente.
Cuántas por sesión:
Una. Se hace despacio y queda mejor.
Por qué un cuaderno y no una hoja:
Se puede volver a leer. Cuando aparece una emoción que le cuesta nombrar, busca en el cuaderno y muchas veces la encuentra ahí.
Al final del proceso:
Tiene entre ocho y doce hojas, y es material suyo, no una fotocopia.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'El semáforo, sin el cartel', 'guide', 'Instalar la secuencia parar, pensar, actuar', '6-7 años', 'La secuencia:
Rojo, me paro. Amarillo, pienso qué puedo hacer. Verde, hago una de esas cosas.
Por qué sin el cartel colgado:
Un cartel en la pared se vuelve parte del decorado en dos semanas. Esto se practica en el cuerpo, con la mano: puño cerrado para rojo, mano abierta para amarillo, dedo señalando para verde.
Cómo se ensaya:
Con situaciones inventadas, en calma. Diez veces. Después con situaciones de la semana.
En el momento real:
Vos hacés el gesto sin decir nada. Es menos invasivo que una consigna hablada y no lo expone delante de otros.
Cuándo se ve que funcionó:
Cuando hace el gesto solo.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'La caja de estrategias', 'activity', 'Construir un repertorio propio de recursos de regulación', '8-9 años', 'Qué se arma:
Tarjetas, una por estrategia, escritas por él.
Las categorías:
• Para el cuerpo: respirar, tomar agua, caminar, apretar algo.
• Para la cabeza: contar hasta diez, pensar en otra cosa, decirme una frase.
• Con otros: pedir ayuda, contarle a alguien, pedir un rato solo.
Cómo se prueban:
Una por semana, en situaciones reales, y se marca si sirvió o no.
Las que no sirven se sacan:
Eso es la mitad del ejercicio. Una estrategia que no le funciona a él pero está en la caja porque se la dieron es una estrategia que va a fallar el día que la necesite.
Al final:
Quedan cuatro o cinco. Esas son las suyas.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'Antes, durante y después del enojo', 'worksheet', 'Distinguir las tres fases de un episodio de desregulación', '10-11 años', 'Las tres preguntas, sobre algo que pasó:
• Antes: qué estaba pasando en el rato previo. Cansancio, hambre, algo que venía molestando.
• Durante: qué sentí y qué hice.
• Después: cómo quedé y qué pasó con los demás.
La que importa es la primera:
Casi siempre hay algo antes. Descubrir que el enojo del martes empezó el lunes cambia el foco de controlarse a cuidarse.
Qué se hace con eso:
Se buscan dos cosas concretas para el antes. Dormir más, comer algo a media tarde, avisar cuando algo empieza a molestar.
Cuándo se completa:
Al menos un día después. En caliente no se puede mirar.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'El rincón para bajar un cambio', 'guide', 'Armar un espacio físico para la autorregulación, no para el castigo', '3-5 años', 'La diferencia que hace todo:
No es un rincón de penitencia. No se manda ahí, se ofrece, y se puede ir solo cuando quiera.
Qué tiene adentro:
Almohadones, algo suave, un libro, algo para apretar. Nada de pantallas.
Cómo se presenta:
Se arma juntos, en un día tranquilo, y se le pone un nombre que elija él.
Cómo se usa:
La primera vez vas con él. Después se lo ofrecés. Después va solo.
La regla del adulto:
No se lo saca de ahí para hablar. Se espera a que salga.
Cuánto tarda en funcionar:
Semanas. Y sólo funciona si nunca se usó como castigo, ni una vez.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'Qué hago con el aburrimiento', 'activity', 'Tolerar el aburrimiento sin recurrir de inmediato a la pantalla', '10-11 años', 'Por qué trabajarlo:
El aburrimiento es incómodo y se corta enseguida con una pantalla. El problema no es la pantalla: es que nunca llega a pasar el rato incómodo, que es donde aparecen las ideas.
El experimento:
Diez minutos sin nada. Ni pantalla, ni libro, ni charla.
Después:
• ¿En qué momento fue peor?
• ¿Qué se te ocurrió mientras tanto?
• ¿Cuánto pensás que duró?
Lo que casi siempre pasa:
Los primeros tres minutos son horribles y después baja.
Para la casa:
Diez minutos, tres veces en la semana. Anotar lo que se le ocurrió cada vez.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'La escala del uno al diez', 'activity', 'Cuantificar la intensidad emocional para poder hablar de ella', '8-9 años', 'De qué se trata:
Ponerle número a lo que se siente. No para medirlo bien, para poder compararlo.
Las preguntas:
• Del uno al diez, ¿cuánto te enojaste?
• ¿Y la vez anterior?
• ¿Qué habría hecho que fuera dos números menos?
Lo que se descubre:
Que no todo es diez. Muchos chicos viven todo con la misma intensidad porque nunca lo separaron.
Para la semana:
Al final del día, un número para el momento más intenso, y una palabra de por qué.
Lo que se hace con los números:
Se miran juntos al final de la semana. Los días de ocho o nueve suelen tener algo en común.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'La torre que se cae', 'game', 'Sostener la tarea después de un error inevitable', '3-5 años', 'Cómo se juega:
Construir una torre lo más alta posible con bloques o vasos. Se va a caer. Ese es el punto.
Lo que se trabaja:
Qué pasa en el cuerpo cuando se cae y qué hace después.
Tu parte:
Construir vos también y que se te caiga. Mostrar en voz alta lo que hacés con eso, sin dramatizarlo.
Lo que no se hace:
Sostener la torre para que no se caiga. Evitarle la frustración le saca la única parte útil del juego.
Progreso:
Al principio se enoja y abandona. Después se enoja y sigue. Después se ríe. Ese es el orden y lleva su tiempo.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'Lo difícil, en tres niveles', 'activity', 'Graduar la dificultad para que el esfuerzo sea tolerable', '8-9 años', 'De qué se trata:
Una misma tarea preparada en tres niveles: fácil, justo y difícil. Él elige con cuál empieza.
El punto:
Que note que puede elegir el nivel, y que elegir el difícil a propósito no es lo mismo que fracasar en el fácil.
La conversación después:
• ¿Cuál elegiste primero y por qué?
• ¿En qué momento pensaste en dejarlo?
• ¿Qué te hizo seguir?
Lo que suele aparecer:
Que elige siempre el fácil por miedo, o siempre el difícil para probarse. Las dos cosas se trabajan.
Con qué tareas:
Rompecabezas, laberintos, un juego de cartas, armar algo. Nada escolar al principio.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'Cuando algo sale mal, ¿qué me digo?', 'worksheet', 'Identificar y cambiar el diálogo interno ante el error', '12-14 años', 'Primera parte:
Escribí las tres frases que te pasan por la cabeza cuando algo te sale mal. Las reales, no las que habría que pensar.
Lo que suele aparecer:
Soy un desastre. Nunca me sale nada. Todos van a pensar que soy tonto.
Segunda parte, sobre cada una:
• ¿Se la dirías a un amigo en la misma situación?
• Si no, ¿qué le dirías a él?
• ¿Por qué a vos te decís otra cosa?
Tercera parte:
Escribí la frase que le dirías a un amigo, y guardala.
Para la semana:
Cuando aparezca la frase vieja, acordarse de la nueva. No reemplazarla de golpe: primero notarla.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'Esperar el turno', 'game', 'Sostener la espera en un contexto de juego', '3-5 años', 'Con qué se juega:
Cualquier juego de turnos. Cartas, dados, un juego de mesa simple.
Lo que se trabaja:
El rato entre un turno y el otro, que para un chico de esta edad es larguísimo.
Cómo se ayuda al principio:
• Turnos cortos.
• Decir en voz alta a quién le toca.
• Darle algo para hacer mientras espera: contar en voz alta, mover una ficha.
Y después se saca la ayuda:
Turnos más largos, sin anuncios.
Lo que se mira:
Si puede quedarse, no si le gusta esperar. A nadie le gusta.
Si se levanta:
Se lo invita a volver sin reto. Levantarse a los tres años no es una falta de respeto.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'Lo que sale bien a la quinta', 'activity', 'Experimentar que la mejora requiere repetición', '6-7 años', 'La actividad:
Algo que no sale la primera vez y sí sale con práctica. Encestar desde lejos, hacer rebotar una pelota diez veces, apilar diez vasos.
Cómo se hace:
Cinco intentos, anotando cuánto logró en cada uno.
Lo importante:
No es que llegue. Es que vea el número subiendo.
La pregunta al final:
¿Cómo te fue del primero al quinto? Y que lo diga él, mirando los números.
La frase que queda:
Todavía no me sale. El todavía cambia la frase entera y se puede instalar con repetición.
Para la casa:
Elegir una cosa que quiera lograr y anotar cinco intentos por semana.'),

  (null, 'psychology', 'Habilidades sociales', 'Empatía', 'La misma escena, dos versiones', 'activity', 'Reconocer que un mismo hecho se vive distinto según quién lo cuenta', '10-11 años', 'Cómo se hace:
Contás una situación y él la cuenta desde los dos lados, primero uno y después el otro.
Situaciones que funcionan:
• Dos chicos quieren el mismo lugar en el banco.
• Uno le presta algo a otro y se lo devuelven roto.
• Un grupo arma un plan y no invita a alguien.
Las preguntas para cada lado:
Qué quería. Qué sintió. Qué pensó del otro.
Lo que aparece:
Que los dos tenían una razón. No que uno tenía razón.
Para cerrar:
¿Qué habría hecho falta para que esto terminara distinto? Y ahí él propone.'),

  (null, 'psychology', 'Habilidades sociales', 'Empatía', 'Escuchar sin preparar la respuesta', 'activity', 'Practicar la escucha atenta sin interrumpir ni aconsejar', '12-14 años', 'La consigna:
Uno habla dos minutos de algo que le importa. El otro sólo escucha. No pregunta, no aconseja, no cuenta algo parecido.
Después:
El que escuchó cuenta lo que entendió. El que habló dice si estuvo bien o si faltó algo.
Y se invierte.
Lo que se descubre:
Que escuchar sin planear la respuesta es más difícil de lo que parece, y que se nota cuando el otro lo hace.
La trampa más común:
Contar algo parecido propio. Se siente como acompañar y funciona como cambiar de tema.
Para llevarse:
Probar una vez en la semana, con alguien de la casa.'),

  (null, 'psychology', 'Habilidades sociales', 'Empatía', 'Cómo se ve desde afuera', 'activity', 'Anticipar el efecto de la propia conducta en los demás', '8-9 años', 'Cómo se hace:
Se actúa una escena corta donde él hace algo habitual: interrumpir, hablar fuerte, quedarse callado.
Después se recuerda y se pregunta:
• Si fueras el otro, ¿qué pensarías de esta persona?
• ¿Qué habrá sentido?
• ¿Qué te habría gustado que hiciera distinto?
Sin juicio previo:
No se le anticipa que estuvo mal. La observación tiene que ser suya.
Lo que se busca:
No que se avergüence, sino que note que su conducta produce algo en el otro. Esa conexión no es obvia a esta edad.
Después:
Se actúa la misma escena con el cambio que él propuso.'),

  (null, 'psychology', 'Habilidades sociales', 'Empatía', 'Los animales y lo que sienten', 'activity', 'Practicar la lectura emocional en un contexto menos exigente', '3-5 años', 'Por qué con animales:
Leer emociones en personas puede resultar amenazante para un chico chico. Un perro asustado es más fácil de mirar.
Qué necesitás:
Fotos de animales en distintos estados. Un perro con la cola entre las patas, un gato erizado, un caballo tranquilo.
Las preguntas:
• ¿Cómo está este animal?
• ¿En qué se nota?
• ¿Qué le habrá pasado?
• ¿Qué haría falta para que esté mejor?
La última pregunta es la que más suma:
Pasa de reconocer a querer hacer algo, que es lo que después se traslada a las personas.
Después:
Las mismas preguntas con fotos de chicos.'),

  (null, 'psychology', 'Habilidades sociales', 'Resolución de conflictos', 'Tres formas de decir lo mismo', 'activity', 'Distinguir respuestas pasivas, agresivas y asertivas ante un conflicto', '10-11 años', 'La situación:
Un compañero le sacó algo sin pedir. Se plantea así, en concreto.
Las tres respuestas:
• Pasiva: no decir nada y quedarse mal.
• Agresiva: gritarle o sacárselo de vuelta.
• Asertiva: decirle que eso era suyo y que le gustaría que le pida.
Cómo se trabaja:
Las actúan las tres, y él dice cómo se sintió en cada una y qué habría hecho el otro.
Lo que suele aparecer:
Que la asertiva se siente rara al principio. Vale nombrarlo: es rara porque es nueva, no porque esté mal.
Con situaciones propias:
Cuando el mecanismo se entiende, se pasa a algo que le pasó de verdad esta semana.'),

  (null, 'psychology', 'Habilidades sociales', 'Resolución de conflictos', 'El acuerdo escrito', 'activity', 'Cerrar un conflicto con un acuerdo concreto y verificable', '10-11 años', 'Cuándo se usa:
Después de trabajar el conflicto, no en el medio.
Los cuatro puntos, escritos:
• Qué pasó, en una frase que los dos acepten.
• Qué va a hacer distinto cada uno.
• Qué pasa si vuelve a ocurrir.
• Cuándo lo revisamos.
Por qué escrito:
Un acuerdo hablado se recuerda distinto por cada uno a la semana siguiente. Uno escrito se lee.
Lo que hace que funcione:
Que los compromisos sean chicos y observables. Voy a portarme bien no sirve. Voy a avisar antes de agarrar algo suyo sí.
La revisión:
Fecha concreta, corta. Una semana.'),

  (null, 'psychology', 'Habilidades sociales', 'Resolución de conflictos', 'Cuando se pelean dos amigos', 'guide', 'Orientar a un chico que queda en el medio de un conflicto ajeno', '10-11 años', 'La situación:
Dos amigos peleados y él en el medio, presionado para elegir.
Lo que se trabaja:
• Que no tiene que elegir.
• Que puede decirlo con palabras.
• Que llevar mensajes de uno a otro lo pone peor.
Las frases para ensayar:
Los quiero a los dos y no quiero estar en el medio.
Si tenés algo para decirle, decíselo vos.
Prefiero no hablar de esto con vos, hablalo con él.
Lo que suele pasar:
Al principio se enojan con él. Vale anticiparlo, para que no lo tome como que hizo algo mal.
Lo que se pregunta al final:
¿Qué necesitás vos de todo esto? Casi nunca se lo preguntaron.'),

  (null, 'psychology', 'Habilidades sociales', 'Resolución de conflictos', 'Negociar sin que gane uno solo', 'activity', 'Buscar soluciones donde las dos partes obtengan algo', '12-14 años', 'El planteo:
Un conflicto donde los dos quieren cosas incompatibles a primera vista.
Los pasos:
• Cada uno dice qué quiere.
• Cada uno dice para qué lo quiere. Esta pregunta es la que abre todo.
• Se buscan tres soluciones, sin evaluarlas.
• Se elige una y se prueba.
Por qué la segunda pregunta:
Dos personas pueden querer lo mismo por razones distintas, y ahí aparecen soluciones que no se veían. El ejemplo clásico: los dos quieren la última naranja, uno para el jugo y el otro para la cáscara.
Las tres soluciones sin evaluar:
Si se juzga cada idea al aparecer, no salen más de dos.
Para practicar:
Primero con conflictos inventados. Después con uno real.'),

  (null, 'psychology', 'Habilidades sociales', 'Asertividad', 'Decir que no sin pelear', 'activity', 'Practicar la negativa firme y sin agresión', '12-14 años', 'La fórmula, en tres partes:
Entiendo lo que me pedís. No puedo o no quiero. Y si va, una alternativa.
Ejemplos para ensayar:
• Un amigo te pide la tarea para copiarla.
• Te invitan a algo que no querés y insisten.
• Alguien te pide plata otra vez.
Lo que se practica además de las palabras:
La voz que no sube, el cuerpo que no se achica, y sostener la mirada.
La segunda vez que insisten:
Repetir lo mismo, igual, sin agregar explicaciones. Explicar de más abre la negociación de nuevo.
Lo que cuesta:
Aguantar el silencio incómodo de después. Se ensaya también.'),

  (null, 'psychology', 'Habilidades sociales', 'Asertividad', 'Pedir lo que necesito', 'worksheet', 'Formular pedidos claros en vez de esperar que el otro se dé cuenta', '10-11 años', 'El problema que resuelve:
Esperar que el otro se dé cuenta, no decir nada, y enojarse cuando no pasa.
La estructura del pedido:
Cuando pasa esto, yo siento esto, y me gustaría esto otro.
Ejemplos:
Cuando te reís de lo que digo delante de los demás, me da vergüenza, y me gustaría que si te parece gracioso me lo digas después.
Lo que no va adentro del pedido:
Siempre, nunca, y todo lo que empiece con vos sos.
Para practicar:
Tres situaciones de la semana, escritas con esa estructura, sin decírselas a nadie todavía.
La semana siguiente:
Elige una y la dice de verdad. Se conversa cómo salió.'),

  (null, 'psychology', 'Habilidades sociales', 'Asertividad', 'Cuando alguien se pasa de la raya', 'guide', 'Reconocer y responder a situaciones de hostigamiento', '10-11 años', 'Lo primero, distinguir:
Una broma pesada de una vez es distinto de algo que se repite y que él no puede parar. Lo segundo tiene nombre y se avisa a un adulto.
Las tres preguntas para distinguir:
• ¿Pasó una vez o pasa siempre?
• ¿La otra persona sabe que te hace mal?
• Cuando pediste que pare, ¿paró?
Lo que se ensaya:
Decir basta una vez, fuerte y corto. Irse. Contarle a un adulto.
Lo que hay que sacar de la cabeza:
Que contarlo es ser buchón. Contarlo es pedir ayuda cuando algo te supera, y eso lo hacen también los adultos.
Con quién:
Que nombre dos adultos concretos a los que podría contarle. Que sean dos, por si uno no está.'),

  (null, 'psychology', 'Habilidades sociales', 'Asertividad', 'Entrar en un grupo que ya está jugando', 'activity', 'Practicar la entrada a un grupo, que es donde más se traba la inclusión', '6-7 años', 'Por qué esto:
Muchos chicos que quedan afuera no es porque los rechacen: es que se paran al lado y esperan que los inviten.
Lo que funciona, en orden:
• Mirar un rato qué están jugando.
• Acercarse y hacer lo mismo, en paralelo.
• Decir algo sobre el juego, no sobre uno mismo.
• Recién ahí, pedir entrar.
Lo que no funciona:
Preguntar puedo jugar de entrada. Es fácil decir que no.
Cómo se ensaya:
Con muñecos, o con vos y otra persona jugando a algo y él entrando.
Si le dicen que no:
También se ensaya. Buscar otro grupo, sin insistir, no es un fracaso.'),

  (null, 'psychology', 'Técnicas', 'Respiración', 'Respirar con la panza', 'guide', 'Aprender respiración diafragmática, base de casi todas las técnicas', '6-7 años', 'Cómo se enseña:
Acostado, un peluche sobre la panza. La consigna es hacer que el peluche suba y baje.
Por qué acostado:
Sentado, casi todos respiran con el pecho sin darse cuenta. Acostado sale solo.
Los pasos:
• Aire por la nariz, el peluche sube.
• Aire por la boca, despacio, el peluche baja.
• Que baje más lento de lo que subió.
Cuántas veces:
Cinco respiraciones. Después se descansa.
Cuando ya sale acostado:
Sentado, con la mano en la panza en vez del peluche. Y después parado.
Lo que importa:
Que la exhalación sea más larga que la inhalación. Ahí está el efecto calmante, no en respirar hondo.'),

  (null, 'psychology', 'Técnicas', 'Respiración', 'Respirar cuando no se puede parar', 'guide', 'Una técnica breve que se puede usar sin que nadie lo note', '12-14 años', 'Para qué:
Para el aula, el ómnibus, el pasillo. Momentos donde no se puede cerrar los ojos ni acostarse.
La técnica:
Inhalar contando cuatro. Exhalar contando ocho. Cuatro veces.
Por qué la exhalación doble:
Es lo que activa la respuesta de calma. Respirar hondo y rápido hace lo contrario.
Cómo hacerlo invisible:
Por la nariz, sin mover los hombros, la mirada en cualquier lado.
Cuándo practicarlo:
En momentos neutros, todos los días. Una técnica que se estrena en el momento difícil no funciona.
Si marea:
Bajá a tres y seis. La proporción importa más que los números.'),

  (null, 'psychology', 'Técnicas', 'Respiración', 'La respiración de la abeja', 'guide', 'Alargar la exhalación usando el sonido como guía', '3-5 años', 'Cómo se hace:
Tomar aire por la nariz y soltarlo haciendo mmmmm, como una abeja, hasta que se acabe.
Por qué con sonido:
Un chico chico no puede contar hasta ocho mientras exhala. El zumbido hace lo mismo sin necesidad de contar, y además se escucha, así que se sabe cuándo se terminó.
Cuántas:
Cinco abejas.
Variantes:
• Abeja fuerte y abeja despacito.
• Con los dedos tapando apenas las orejas, que hace que se sienta la vibración.
• Una abeja larguísima, a ver cuánto dura.
Cuándo:
Antes de dormir, o cuando algo lo puso nervioso. Y también en momentos tranquilos, para que sea familiar.'),

  (null, 'psychology', 'Técnicas', 'Relajación', 'El lugar tranquilo', 'guide', 'Construir una imagen mental de calma a la que poder volver', '8-9 años', 'Primero se construye:
Con los ojos cerrados, que imagine un lugar donde esté tranquilo. Puede ser real o inventado.
Las preguntas que lo hacen sólido:
• ¿Qué ves alrededor?
• ¿Qué se escucha?
• ¿Qué olor hay?
• ¿Qué temperatura hace?
• ¿Estás solo o hay alguien?
Cuantos más sentidos, mejor:
Una imagen sólo visual se desarma rápido. Con sonido y temperatura se sostiene.
Después se le pone nombre:
Y ese nombre es el atajo. Decir la playa alcanza para volver, sin repetir todo el ejercicio.
Cuándo practicarlo:
Dos veces por semana en calma, un minuto.'),

  (null, 'psychology', 'Técnicas', 'Relajación', 'Los cinco sentidos, para volver al presente', 'guide', 'Cortar la rumiación anclando la atención en lo que hay alrededor', '12-14 años', 'Cuándo se usa:
Cuando la cabeza está dando vueltas sobre algo que ya pasó o que todavía no pasó.
El ejercicio:
• Cinco cosas que puedas ver.
• Cuatro que puedas tocar.
• Tres que puedas escuchar.
• Dos que puedas oler.
• Una que puedas saborear.
En voz alta o en la cabeza:
Las dos sirven. En voz alta funciona mejor al principio.
Por qué funciona:
La atención no puede estar en dos lugares. Buscar cinco cosas concretas ocupa el lugar que estaba ocupando la preocupación.
Lo que no hace:
No resuelve el problema. Baja la intensidad para poder pensarlo después, que es distinto.'),

  (null, 'psychology', 'Técnicas', 'Relajación', 'La rutina para dormir', 'guide', 'Ordenar el momento previo al sueño en chicos que tardan en dormirse', '6-7 años', 'Lo que más cambia:
La misma secuencia todas las noches, en el mismo orden. El cuerpo aprende la secuencia, no la hora.
Una secuencia posible:
Baño, pijama, dientes, dos cuentos, luz baja, un rato juntos en silencio.
Las tres reglas:
• Sin pantallas la hora anterior.
• Luz cada vez más baja a medida que avanza.
• Termina siempre en la cama, no en el sillón.
Si tarda igual:
Un rato de charla corta y previsible, siempre lo mismo: qué fue lo mejor de hoy y qué te espera mañana.
Lo que no funciona:
Cansarlo con actividad antes de dormir. Sube la activación en vez de bajarla.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'Los pensamientos que aparecen solos', 'activity', 'Reconocer los pensamientos automáticos como pensamientos y no como hechos', '12-14 años', 'La idea de fondo:
Un pensamiento es algo que aparece, no algo que es verdad. Notar esa diferencia es la mitad del trabajo.
El ejercicio de las hojas:
Escribí en papelitos los pensamientos que aparecen seguido. Ponelos sobre la mesa y miralos desde afuera.
Las preguntas:
• ¿Cuál aparece más veces?
• ¿Desde cuándo lo tenés?
• Si un amigo tuviera este pensamiento, ¿qué le dirías?
La frase que ayuda:
Estoy teniendo el pensamiento de que no le importo. En vez de: no le importo. La distancia que agrega esa frase es real.
Cuándo pasar al registro completo:
Cuando ya puede notarlos.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'Lo peor, lo mejor y lo probable', 'worksheet', 'Poner en perspectiva una preocupación anticipatoria', '12-14 años', 'Las tres preguntas, sobre algo que le preocupa que pase:
• ¿Qué es lo peor que podría pasar?
• ¿Qué es lo mejor?
• ¿Qué es lo que probablemente pase?
Y una cuarta, sobre lo peor:
Si pasara, ¿qué harías?
Por qué esa cuarta importa:
La ansiedad no vive en el desastre, vive en la sensación de que no habría nada que hacer. Contestar qué haría desarma eso aunque el desastre siga siendo posible.
Lo que no se hace:
Decirle que no va a pasar. Nadie lo sabe, y decirlo le enseña a no traer sus preocupaciones.
Después del evento:
Se vuelve a leer la hoja y se compara con lo que pasó de verdad.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'Separar los hechos de lo que me contó la cabeza', 'worksheet', 'Distinguir el dato objetivo de la interpretación', '15+ años', 'Dos columnas:
Lo que pasó. Lo que me dije sobre lo que pasó.
Ejemplos para arrancar:
Pasó: no me contestó en dos horas. Me dije: está enojada.
Pasó: me corrigieron un trabajo. Me dije: piensan que no sirvo.
Pasó: se rieron cuando entré. Me dije: se reían de mí.
La regla para la primera columna:
Sólo lo que una cámara habría grabado. Si una cámara no lo registra, va en la segunda.
Lo que suele descubrirse:
Que la primera columna es corta y la segunda es larga.
Después:
Sobre la segunda columna, ¿qué otra explicación entra? No la más optimista: otra que también encaje con la primera columna.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'El pensamiento de todo o nada', 'activity', 'Reconocer y matizar el pensamiento dicotómico', '15+ años', 'Cómo suena:
O me sale perfecto o es un desastre. Si no soy el mejor, no sirvo. Nadie me habla nunca.
El ejercicio de la regla:
Se dibuja una línea del cero al cien y se le pide que ubique la situación real.
Lo que pasa:
Casi nunca está en los extremos. Ubicarlo en sesenta cambia la conversación entera.
Las palabras que lo delatan:
Siempre, nunca, todo, nada, nadie, todos. Cuando aparecen, vale la pena frenar y mirarlas.
Para la semana:
Anotar cada vez que aparezca una de esas palabras en la propia cabeza. Sin cambiar nada todavía, sólo anotar.
Por qué sólo anotar:
Notarlo es lo difícil. Una vez que se nota, matizarlo sale casi solo.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'Qué le diría a alguien que quiero', 'worksheet', 'Usar la perspectiva del otro para ablandar la autoexigencia', '15+ años', 'La consigna:
Escribí la situación como si le hubiera pasado a tu mejor amigo. Después escribí qué le dirías.
Y después:
Leé lo que escribiste y preguntate por qué a vos te decís otra cosa.
Lo que aparece casi siempre:
Que con el otro es comprensivo y con uno mismo no. Y que la diferencia no tiene ninguna razón que se sostenga.
La pregunta que cierra:
Si a él le sirve escuchar eso, ¿por qué a vos no?
Para guardar:
La carta al amigo se guarda y se relee cuando vuelva la situación. Funciona mejor releída que recordada.');
