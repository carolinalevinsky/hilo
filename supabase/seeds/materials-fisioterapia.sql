-- Fisioterapia, hasta llegar a 50.
--
-- El v1 no traía ninguno. materials.curated.sql agregó 21 y estos son los 29
-- que faltaban.
--
-- Casi todos son pautas para llevarse a casa, que es el formato que más se usa
-- en esta disciplina: la sesión es una vez por semana y el trabajo pasa en los
-- otros seis días.
--
-- Convenciones: subtítulo es una línea corta terminada en dos puntos, las
-- viñetas empiezan con •, y no hay rayas en el texto que lee la persona.

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Movilidad de tobillo todos los días', 'guide', 'Sostener el rango de tobillo, que se pierde rápido y cuesta recuperar', '15+ años', 'Los movimientos:
• Punta y talón: subir y bajar el pie. Veinte veces.
• Círculos con el pie, diez para cada lado.
• Llevar la punta hacia adentro y hacia afuera. Quince veces.
• Sentado, la rodilla estirada, tirar de la punta con una toalla. Treinta segundos.
Cuándo:
Sentado, en cualquier momento del día. No necesita ropa deportiva ni espacio.
Cuántas veces:
Dos por día. El tobillo pierde rango rápido si no se mueve.
Lo que hay que sentir:
Tirón en el gemelo al llevar la punta hacia arriba. Si no se siente nada, falta rango.
Cuándo consultar:
Si el tobillo cruje con dolor, o si se hincha después.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'La columna que se mueve en todas sus direcciones', 'guide', 'Recorrer los movimientos de la columna para mantener movilidad general', '15+ años', 'Los cuatro movimientos:
• Adelante y atrás: gato y vaca, en cuatro apoyos. Diez veces.
• De costado: parado, deslizar la mano por el costado de la pierna. Diez por lado.
• Rotación: sentado, girar el tronco mirando hacia atrás. Diez por lado.
• Elongación: acostado, estirar los brazos hacia arriba y los pies hacia abajo. Cinco veces, cinco segundos.
Cuándo:
A la mañana. La columna amanece rígida y esto la despierta.
Lo que se busca:
Movilidad, no fuerza. Se hace despacio y sin llegar al final del rango.
Si duele:
Ese movimiento se saca de la lista y se avisa. Los otros tres se pueden seguir haciendo.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Movilidad de muñeca y codo para quien trabaja con las manos', 'guide', 'Prevenir la rigidez en trabajos manuales repetitivos', '15+ años', 'Para quién:
Quien pasa el día tecleando, cosiendo, cocinando o usando herramientas.
Los movimientos:
• Muñeca arriba y abajo, veinte veces.
• Muñeca de lado a lado, veinte veces.
• Círculos con la muñeca, diez para cada lado.
• Palma arriba y palma abajo, con el codo pegado al cuerpo. Veinte veces.
• Abrir y cerrar la mano fuerte, quince veces.
Cada cuánto:
Cada dos horas, un minuto. La frecuencia importa más que la duración.
El estiramiento que más alivia:
Brazo estirado adelante, palma hacia afuera, y con la otra mano tirar suave de los dedos hacia atrás. Veinte segundos por lado.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongar el psoas, el músculo de estar sentado', 'guide', 'Elongar el flexor de cadera, acortado en la vida sedentaria', '15+ años', 'Por qué este músculo:
Va de la columna baja al fémur y se acorta con las horas sentado. Cuando está corto, tira de la zona lumbar y aparece dolor de espalda que parece de espalda y viene de la cadera.
El estiramiento:
De rodillas, una pierna adelante en ángulo recto. Se empuja la cadera hacia adelante manteniendo el tronco derecho.
Lo que hay que sentir:
Tirón adelante de la cadera de la pierna de atrás, no en la ingle de la de adelante.
Para intensificar:
Levantar el brazo del mismo lado de la pierna atrasada y estirarlo hacia arriba.
Cuánto:
Treinta segundos por lado, dos veces.
Cuándo:
Al final del día, o después de estar mucho sentado.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongación de pectoral para hombros adelantados', 'guide', 'Compensar la postura cerrada de hombros', '15+ años', 'Por qué:
Los hombros que se van hacia adelante acortan el pectoral, y eso a su vez tira más hacia adelante. Se corta estirando adelante y fortaleciendo atrás.
Los estiramientos:
• En el marco de una puerta: antebrazo apoyado, codo a la altura del hombro, dar un paso adelante. Treinta segundos por lado.
• Manos entrelazadas atrás, estirar los brazos hacia abajo y atrás. Treinta segundos.
• Acostado boca arriba con un rollo de toalla a lo largo de la columna, brazos abiertos en cruz. Dos minutos.
El de la toalla es el mejor:
Usa el peso del propio brazo, así que no se fuerza, y se puede hacer mirando el techo sin contar nada.
Y lo que hay que sumarle:
Fuerza de remo. Estirar solo no alcanza.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Cuándo elongar y cuándo no', 'guide', 'Aclarar cuándo la elongación ayuda y cuándo no corresponde', '15+ años', 'Cuándo sí:
• Después de la actividad física.
• Al final del día.
• Sobre músculo entrado en calor.
• Cuando hay acortamiento y no dolor agudo.
Cuándo no:
• Sobre un músculo recién lesionado, en las primeras 72 horas.
• Antes de una actividad que necesita potencia.
• Si el estiramiento duele de forma aguda o punzante.
• Sobre una articulación inestable, salvo indicación expresa.
La sensación correcta:
Tirón moderado, tolerable, que baja mientras se sostiene. Si aumenta, es demasiado.
Cuánto:
Treinta segundos. Menos de veinte no alcanza y más de sesenta no agrega.
Con rebotes:
Nunca. El rebote activa un reflejo que contrae el músculo, que es lo contrario de lo que se busca.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Fuerza de glúteo, el músculo que nadie usa', 'guide', 'Activar el glúteo medio, clave para la estabilidad de la cadera y la rodilla', '15+ años', 'Por qué importa:
El glúteo medio estabiliza la pelvis al caminar. Cuando está débil, la rodilla se mete hacia adentro y aparece dolor de rodilla que en realidad viene de la cadera.
Los ejercicios:
• Almeja: de costado, rodillas dobladas, abrir la de arriba sin girar la pelvis. Quince por lado.
• Elevación lateral: de costado, la pierna estirada sube y baja. Quince por lado.
• Puente en un pie: acostado, una pierna estirada, subir la cadera. Diez por lado.
• Paso lateral con banda en los tobillos, diez pasos para cada lado.
Lo que hay que sentir:
Ardor en el costado de la cadera. Si se siente en la parte baja de la espalda, la pelvis se está girando.
Cuántas veces:
Tres por semana.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'La estocada, bien hecha', 'guide', 'Fortalecer la pierna con un movimiento funcional', '15+ años', 'El movimiento:
Un paso largo adelante, bajar el cuerpo doblando las dos rodillas hasta que la de atrás casi toque el piso, y volver.
Lo que hay que mirar:
• El tronco derecho, no inclinado adelante.
• La rodilla de adelante alineada con el pie, sin meterse hacia adentro.
• El peso repartido entre las dos piernas.
• El talón de adelante siempre apoyado.
Si tambalea:
Apoyar una mano en la pared. Es un ejercicio de fuerza y también de equilibrio, y separarlos ayuda.
Progresión:
• Estocada estática, sin mover los pies.
• Estocada caminando.
• Estocada hacia atrás, que carga menos la rodilla.
• Con peso en las manos.
Cuántas:
Tres series de ocho por pierna.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Fuerza sin cargar la rodilla', 'guide', 'Fortalecer el cuádriceps cuando la rodilla no tolera peso', '15+ años', 'Para quién:
Rodilla dolorosa, artrosis, o etapa temprana después de una lesión.
Los ejercicios, todos sin apoyar:
• Isométrico: sentado con la pierna estirada, apretar el cuádriceps cinco segundos. Quince veces.
• Elevación de pierna recta: acostado, subir la pierna estirada treinta centímetros. Quince veces.
• Apretar una almohada entre las rodillas cinco segundos. Quince veces.
• Sentado, estirar la rodilla hasta arriba y bajar despacio. Quince veces.
El de la pierna recta es el más importante:
Fortalece el cuádriceps sin que la rodilla se doble, así que no genera fricción en la articulación.
Cuántas veces:
Todos los días. Al no cargar, se tolera diariamente.
Cuándo pasar a sentadillas:
Cuando estos salen sin dolor y con las tres series completas.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro superior', 'Los omóplatos que sostienen el hombro', 'guide', 'Fortalecer la musculatura escapular, base de todo movimiento de hombro', '15+ años', 'Por qué el omóplato:
El hombro se mueve sobre el omóplato. Si el omóplato no está estabilizado, el hombro trabaja mal por más que se fortalezca el brazo.
Los ejercicios:
• Juntar los omóplatos: sentado, llevar los hombros atrás y abajo, sostener cinco segundos. Quince veces.
• Remo con banda elástica. Quince repeticiones.
• Contra la pared: apoyar los antebrazos y deslizarlos hacia arriba manteniendo el contacto. Diez veces.
• En cuatro apoyos, empujar el piso separando los omóplatos y después juntarlos. Quince veces.
Lo que hay que evitar:
Que el hombro suba hacia la oreja. Es la compensación más común y anula el ejercicio.
Cuántas veces:
Tres por semana, o todos los días si el objetivo es postural.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro superior', 'Flexiones adaptadas', 'guide', 'Progresar en el empuje de miembro superior desde lo más accesible', '15+ años', 'La progresión, y se avanza cuando salen tres series de diez:
• Contra la pared, parado.
• Con las manos en una mesa.
• Con las manos en una silla.
• De rodillas en el piso.
• Completa, apoyado en punta de pies.
• Con los pies elevados.
Lo que hay que mirar en todas:
• El cuerpo derecho, sin que la cadera se hunda ni se levante.
• Los codos cerca del cuerpo, no abiertos a noventa grados.
• Bajar controlado, no dejarse caer.
Bajar es lo que fortalece:
Tres segundos para bajar y uno para subir.
Si duele el hombro:
Codos más cerca del cuerpo, y volver un escalón atrás.'),

  (null, 'physiotherapy', 'Fuerza', 'Core', 'Respirar bien es parte de la fuerza del core', 'guide', 'Coordinar la respiración diafragmática con la activación abdominal', '15+ años', 'Por qué está acá:
El diafragma es parte del core. Quien respira sólo con el pecho no activa bien la faja abdominal, y ningún ejercicio lo compensa.
El ejercicio base:
Acostado con las rodillas dobladas, una mano en el pecho y otra en la panza. Al inhalar sube sólo la de la panza.
Después se agrega la activación:
• Inhalar dejando que la panza suba.
• Al exhalar, meter suave el ombligo hacia adentro sin apretar los glúteos.
• Sostener esa activación mientras se cuentan cinco respiraciones.
Cuántas:
Diez ciclos, dos veces por día.
Cómo se sabe que está bien:
Se puede hablar mientras se sostiene la activación. Si hay que contener la respiración, se está apretando de más.'),

  (null, 'physiotherapy', 'Fuerza', 'Core', 'La plancha, con las variantes que sirven', 'guide', 'Progresar en la plancha sin cargar la zona lumbar', '15+ años', 'La progresión:
• De rodillas y antebrazos.
• Antebrazos y punta de pies, veinte segundos.
• Lo mismo, cuarenta segundos.
• Plancha levantando un pie.
• Plancha levantando un brazo.
• Plancha con desplazamiento lateral.
Lo que hay que mirar:
• La cadera no se hunde ni se levanta.
• Los hombros justo encima de los codos.
• La mirada al piso, el cuello alineado.
Cuánto tiempo tiene sentido:
Más de sesenta segundos no agrega. Si aguanta un minuto, conviene pasar a una variante más difícil en vez de estirar el tiempo.
Si duele la espalda baja:
La cadera se está hundiendo. Volvé a la versión de rodillas.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Propiocepción', 'La almohada, el mejor equipo que hay en casa', 'guide', 'Usar una superficie inestable para entrenar propiocepción sin comprar nada', '15+ años', 'Por qué una almohada:
Cualquier superficie que se hunde obliga al tobillo y a la cadera a corregir todo el tiempo. Eso es exactamente lo que entrena la propiocepción.
La progresión:
• Los dos pies sobre la almohada, treinta segundos.
• Los dos pies, ojos cerrados.
• Un pie, ojos abiertos.
• Un pie, pasándose una pelota de mano a mano.
• Un pie, ojos cerrados.
Siempre al lado de algo:
Una mesada, una pared, el respaldo de una silla.
Cuántas veces:
Todos los días, cinco minutos.
Cuándo se nota:
A las dos o tres semanas, y se nota primero al bajar escaleras o al caminar en terreno irregular.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Propiocepción', 'Equilibrio para adultos mayores, sin riesgo', 'guide', 'Entrenar la estabilidad reduciendo el riesgo de caída durante el propio ejercicio', '15+ años', 'Dónde se hace:
En la cocina, con las dos manos sobre la mesada. Siempre.
Los ejercicios:
• Pararse en puntas de pie, diez veces.
• Pararse en talones, diez veces.
• Caminar diez pasos poniendo un pie delante del otro, apoyado en la mesada.
• Pararse en un pie, diez segundos por lado.
• Sentarse y levantarse de la silla sin usar las manos, cinco veces.
El último es el que más predice:
Levantarse de una silla sin manos es de los mejores indicadores de autonomía, y mejora rápido con práctica.
Cuántas veces:
Todos los días.
Lo que hay que sacar de la casa además:
Alfombras sueltas, cables en el paso, y la luz apagada en el camino al baño de noche.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Reeducación de la marcha', 'Caminar más y mejor', 'guide', 'Instalar la caminata como hábito con progresión razonable', '15+ años', 'La progresión:
Semana 1: diez minutos, tres veces.
Semana 2: quince minutos, tres veces.
Semana 3: veinte minutos, cuatro veces.
Semana 4: treinta minutos, cuatro veces.
Cómo tiene que sentirse:
Se puede hablar pero no cantar. Ese es el ritmo correcto.
La técnica:
• Talón primero, después la planta, después la punta.
• Los brazos acompañan, sueltos.
• La mirada al frente, no al piso.
• Pasos parejos.
El calzado:
Suela flexible en la punta y firme en el talón. Un calzado que se dobla al medio no sostiene.
Cuándo parar:
Dolor en el pecho, mareo, o dolor articular que aumenta al caminar.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Reeducación de la marcha', 'Caminar con andador, bien', 'guide', 'Corregir el uso del andador, que casi siempre se usa mal', '15+ años', 'La altura:
Parado con los brazos al costado, el mango a la altura de la muñeca. Un andador demasiado alto empuja los hombros hacia arriba y desestabiliza.
Cómo se camina:
• Se adelanta el andador un paso.
• Se apoya bien, con las cuatro patas en el piso.
• Se avanza la pierna más débil.
• Después la más fuerte.
El error más común:
Caminar detrás del andador, con el cuerpo lejos. Hay que quedar adentro del rectángulo que forma, no atrás.
Para sentarse:
Se retrocede hasta tocar la silla con las piernas, se sueltan las manos del andador y se agarran los apoyabrazos.
Nunca:
Usarlo para levantarse tirando de él. Se vuelca.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'Diez minutos al levantarse', 'guide', 'Una rutina matinal breve para movilidad general', '15+ años', 'La rutina:
• Estirar todo el cuerpo en la cama, treinta segundos.
• Rodillas al pecho, treinta segundos.
• Rotación de columna con rodillas dobladas, treinta segundos por lado.
• Sentado al borde de la cama, círculos de tobillo y de muñeca.
• Parado, círculos de hombro y de cadera.
• Diez sentadillas suaves.
• Estiramiento de gemelo contra la pared, treinta segundos por lado.
Por qué a la mañana:
El cuerpo amanece rígido, y esto acorta el rato en que cuesta moverse.
Lo que hace que se sostenga:
Que sean diez minutos y siempre los mismos. Una rutina que cambia se abandona.
Si un día no sale:
Se sigue al día siguiente, sin recuperar.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'Moverse en un día de oficina', 'guide', 'Repartir movimiento a lo largo de una jornada sentada', '15+ años', 'La regla base:
Cada cuarenta y cinco minutos, dos minutos de pie. Con alarma, porque solo no pasa.
Lo que se hace en esos dos minutos:
• Caminar hasta otro lado y volver.
• Diez sentadillas suaves.
• Estirar el cuello a los dos lados.
• Abrir el pecho en el marco de una puerta.
Y una vez por día:
Estiramiento de psoas, treinta segundos por lado.
La silla y la pantalla:
Pies apoyados, rodillas a la altura de la cadera, borde superior de la pantalla a la altura de los ojos.
Lo que más cambia y menos se hace:
Atender el teléfono caminando.
Lo que no compensa:
Una hora de gimnasio no compensa nueve horas sentado. La distribución importa más que el total.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Cuidados post-lesión', 'Frío o calor, cuál va cuándo', 'guide', 'Elegir entre frío y calor según el momento de la lesión', '15+ años', 'Frío:
• Las primeras 72 horas de una lesión.
• Cuando hay hinchazón.
• Después de una actividad que inflamó la zona.
Veinte minutos, con un paño en el medio, cada dos o tres horas.
Calor:
• Después de las 72 horas.
• En contracturas y rigidez muscular.
• Antes de elongar.
• En dolores crónicos sin inflamación.
Quince a veinte minutos, tibio, nunca hirviendo.
La regla simple:
Si está hinchado y caliente, frío. Si está duro y tirante, calor.
Nunca:
• Calor sobre una zona hinchada.
• Frío sobre piel con poca sensibilidad.
• Ninguno de los dos directamente sobre la piel.
Si hay dudas:
El frío es el más seguro de los dos.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Cuidados post-lesión', 'Qué esperar de la recuperación', 'guide', 'Anticipar el curso de una recuperación para que la impaciencia no la arruine', '15+ años', 'Lo que casi nadie dice y conviene saber:
• La recuperación no es lineal. Hay días peores sin motivo.
• El dolor baja antes de que el tejido esté curado. Sentirse bien no es estar bien.
• Volver a la actividad de a poco es más rápido que volver de golpe y recaer.
• Las tres primeras semanas se avanza mucho y después parece frenarse. Eso es normal.
La regla de las 24 horas:
Lo que importa no es cómo se siente durante el ejercicio, sino cómo amanece al otro día. Si amanece igual o mejor, la carga fue correcta.
Cuándo preocuparse de verdad:
• Dolor que aumenta semana a semana.
• Dolor que despierta de noche.
• Pérdida de fuerza o sensibilidad.
• Hinchazón que no baja.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Cuello: movilidad sin riesgo', 'guide', 'Mover el cuello de forma segura en dolor cervical', '15+ años', 'Los movimientos, todos despacio:
• Mentón al pecho y volver. Diez veces.
• Girar la cabeza a un lado y al otro. Diez por lado.
• Oreja al hombro. Diez por lado.
• Llevar el mentón hacia atrás como haciendo papada, sostener tres segundos. Quince veces.
El de la papada es el mejor:
Corrige la cabeza adelantada, que es la causa de la mayoría de los dolores de cuello de oficina. Y es el que nadie hace porque queda feo.
Lo que no se hace nunca:
Círculos completos con la cabeza. Comprimen las articulaciones de atrás.
Hasta dónde:
Hasta donde no duele. El cuello no se fuerza.
Cuándo consultar sin esperar:
Si hay hormigueo en el brazo o la mano, o mareo al girar la cabeza.'),

  (null, 'physiotherapy', 'Fuerza', 'Core', 'Ejercicios para hacer en la cama', 'guide', 'Mantener actividad en personas con movilidad muy reducida', '15+ años', 'Para quién:
Alguien en reposo prolongado, después de una cirugía, o con dificultad para levantarse.
Los ejercicios, todos acostado:
• Bombeo de tobillos: punta y talón, veinte veces cada hora. Previene trombosis.
• Apretar el cuádriceps con la pierna estirada, cinco segundos. Quince veces.
• Apretar los glúteos, cinco segundos. Quince veces.
• Deslizar el talón acercando la rodilla al pecho. Diez por pierna.
• Puente: subir la cadera con las rodillas dobladas. Diez veces.
• Abrir y cerrar los brazos en cruz. Quince veces.
El bombeo de tobillos es el más importante:
Es el que previene la complicación más seria del reposo, y se puede hacer sin ayuda y sin esfuerzo.
Cada cuánto:
Tres veces por día, y el bombeo cada hora estando despierto.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Propiocepción', 'Después del yeso: recuperar el pie', 'guide', 'Devolverle sensibilidad y control al pie tras una inmovilización', '15+ años', 'Por qué hace falta:
Un pie que estuvo semanas quieto pierde la información que le manda al cerebro. La fuerza vuelve antes que esa información, y esa distancia es la que hace que se tuerza de nuevo.
Los ejercicios, sentado:
• Escribir el abecedario en el aire con el dedo gordo.
• Juntar una toalla del piso agarrándola con los dedos.
• Levantar tapitas con los dedos y pasarlas a un vaso.
• Rodar una pelota de tenis bajo la planta, un minuto.
Después, parado:
• Repartir el peso entre los dos pies y sentir dónde apoya más.
• Pararse en un pie, primero con los ojos abiertos.
Cuántas veces:
Dos veces por día, diez minutos.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'Cómo sentarse y levantarse sin lastimarse', 'guide', 'Enseñar el patrón seguro para una transferencia frecuente', '15+ años', 'Para levantarse:
• Acercar la cola al borde de la silla.
• Poner los pies bien atrás, debajo de las rodillas.
• Inclinar el tronco hacia adelante, la nariz sobre las puntas de los pies.
• Empujar con las piernas, no tirar con los brazos.
Para sentarse:
• Retroceder hasta tocar la silla con las piernas.
• Inclinar el tronco adelante y bajar controlado.
• Nunca dejarse caer.
El paso que casi todos saltean:
Inclinar el tronco adelante. Sin eso, el peso queda atrás y hay que hacer el triple de fuerza.
Para practicarlo:
Cinco veces seguidas, dos veces por día. Es fuerza de pierna y es la transferencia más usada del día.
Si no puede sin manos:
Con manos está bien. La técnica del tronco vale igual.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongar después de estar mucho de pie', 'guide', 'Aliviar la sobrecarga de quien trabaja parado todo el día', '15+ años', 'Para quién:
Quien está de pie ocho horas. Peluquería, comercio, cocina, docencia.
Al final del día:
• Piernas apoyadas contra la pared, acostado, diez minutos. Es lo que más alivia.
• Elongación de gemelo contra la pared, treinta segundos por lado.
• Rodar una pelota de tenis bajo la planta del pie, dos minutos por pie.
• Rodillas al pecho, treinta segundos.
• Elongación de psoas, treinta segundos por lado.
Durante el día:
Cambiar el peso de un pie al otro, y si se puede apoyar un pie en un escalón bajo y alternar.
El calzado:
Suela con amortiguación y que no apriete. Y si es posible, dos pares que se alternen día por medio.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Fortalecer el pie, el que nadie entrena', 'guide', 'Trabajar la musculatura intrínseca del pie', '15+ años', 'Por qué:
El pie tiene músculos propios que sostienen el arco. Con calzado rígido todo el día se atrofian, y eso se paga arriba, en rodilla y cadera.
Los ejercicios, descalzo:
• El pie corto: sin doblar los dedos, acercar la base del dedo gordo al talón levantando el arco. Sostener cinco segundos, quince veces.
• Levantar sólo el dedo gordo dejando los otros abajo. Y al revés.
• Juntar una toalla con los dedos.
• Separar los dedos entre sí.
El pie corto es el ejercicio clave:
Cuesta al principio y muchos no lo logran en las primeras sesiones. Vale insistir con un espejo o mirando el pie.
Cuántas veces:
Todos los días, cinco minutos, mientras se hace otra cosa.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Cuidados post-lesión', 'La cicatriz y cómo tratarla', 'guide', 'Cuidar una cicatriz quirúrgica para que no limite el movimiento', '15+ años', 'Cuándo empezar:
Cuando la herida está completamente cerrada y sin costras, y con el visto bueno del cirujano.
Qué se hace:
• Masaje con crema neutra, en círculos, cinco minutos, dos veces por día.
• Movilizar la piel alrededor de la cicatriz en todas las direcciones.
• Levantar suave la piel entre dos dedos, a lo largo del recorrido.
Por qué importa:
Una cicatriz que se adhiere a los planos profundos limita el movimiento de la articulación cercana, y eso se resuelve mucho mejor en los primeros meses que después.
Protección solar:
Un año. Una cicatriz nueva expuesta al sol queda oscura para siempre.
Cuándo consultar:
Si se pone roja, caliente, dolorosa, o si crece por fuera de sus bordes.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro superior', 'Fuerza de agarre y su importancia', 'guide', 'Trabajar la fuerza de la mano, indicador general de salud', '15+ años', 'Por qué se mide tanto:
La fuerza de agarre es uno de los indicadores más simples del estado muscular general, y se puede mejorar a cualquier edad.
Los ejercicios:
• Apretar una pelota blanda, sostener cinco segundos. Quince veces por mano.
• Colgarse de una barra, o sostenerse con las manos de algo firme. Diez a treinta segundos.
• Llevar una bolsa con peso, caminando, un minuto por mano.
• Abrir la mano contra una gomita, quince veces.
La caminata cargada es la mejor:
Trabaja agarre, hombro y core al mismo tiempo, y es exactamente lo que se hace con las compras.
Cuántas veces:
Tres por semana.
Lo que también hay que hacer:
Abrir, no sólo cerrar. La mano que sólo agarra se desequilibra.');
