-- Fisioterapia y kinesiología: la biblioteca compartida completa de la disciplina.
--
-- Escrita contra el estándar de docs/materiales.md, con una exigencia extra que
-- se nota en todos: la dosis va escrita siempre (series, repeticiones, tiempo
-- bajo tensión, descanso y frecuencia semanal) y el criterio de progresión va en
-- número y no en sensación. Y todos llevan un apartado de cuándo parar y cuándo
-- consultar, porque acá el riesgo de un material vago es lesionar a alguien.
--
-- La biblioteca anterior tenía sus 50 materiales en "15+ años": un kinesiólogo
-- que atiende niños abría la biblioteca y no encontraba nada de lo suyo. Ahora
-- hay diez materiales pediátricos, y los pediátricos no son los mismos con menos
-- peso: en niños la dosis va envuelta en juego, en formato corto y frecuente,
-- porque el programa de casa es donde pasa la mayor parte del trabajo.
--
-- Nada de lo que está acá reemplaza la indicación del profesional que trata a la
-- persona, y varios materiales lo dicen en el texto.
--
-- Convenciones del texto, que las dibuja DocumentBody:
--   Una línea corta terminada en dos puntos y de hasta 60 caracteres es subtítulo.
--   Toda otra línea es un párrafo. Las viñetas empiezan con "• ".
--   Sin rayas, sin guiones largos y sin emoji: esto se imprime.

-- ─── Movilidad ──────────────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Movilidad de hombro en casa', 'guide', 'Recuperar y mantener el rango de movimiento del hombro con ejercicios sin equipamiento', '15+ años', 'Para qué sirve:
El hombro pierde rango rápido y lo recupera despacio, y lo que más lo hace perder es no moverlo. Esta rutina cubre las direcciones que se pierden primero y se puede hacer sin nada, lo cual es la diferencia entre que se haga y que no.
Qué necesitás:
Un palo de escoba, una pared, una mesa y una toalla.
Cómo se presenta:
Todo dentro del rango sin dolor: se llega hasta donde molesta y no más. Molestar es aceptable, doler no. Se hace después de una ducha caliente o de cinco minutos de movimiento suave, que gana rango sin esfuerzo.
Ejercicio 1, movilidad asistida con el palo:
Diez repeticiones lentas de cada una, dos series.
• Acostado boca arriba, el palo con las dos manos, llevarlo por encima de la cabeza y volver.
• Parado, el palo adelante, subirlo con los brazos estirados.
• El palo detrás de la espalda, empujarlo hacia arriba con la mano sana.
Ejercicio 2, en la pared y en la mesa:
• La mano en la pared, subirla caminando con los dedos, diez veces.
• Inclinado con la mano apoyada en la mesa, movimientos pendulares del otro brazo, treinta segundos en cada dirección.
• La toalla como si se secara la espalda, veinte segundos por lado.
Ejercicio 3, rotaciones, que son las que más se pierden:
• Codo pegado al cuerpo, girar el antebrazo hacia afuera, diez veces.
• Hacia adentro, diez veces.
• Mano a la nuca y mano a la espalda baja, sostener diez segundos cada una.
Progresión:
• Si sale fácil: sumar resistencia con banda elástica y llevar el rango hasta el final del movimiento.
• Si no sale: reducir el rango y hacerlo acostado, que saca el peso del brazo del medio.
Ojo con esto:
Dolor agudo, dolor nocturno que despierta, pérdida de fuerza o imposibilidad de levantar el brazo son motivo de consulta, no de más ejercicio. Y después de una cirugía, sólo lo que indicó quien operó.
Qué mirar:
Hasta dónde llega en cada dirección, si compensa subiendo el hombro, si aparece dolor y en qué punto, si el rango mejora semana a semana. Criterio: rango completo sin compensación, comparado con el otro lado.
Cuánto y cada cuánto:
Dos series de diez, una vez por día, todos los días. Quince minutos en total.
Para casa:
La rutina completa una vez por día, mejor después de la ducha. Y mover el brazo en el día, sin esperar el momento del ejercicio.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Movilidad de cadera, sin equipamiento', 'guide', 'Recuperar movilidad de cadera en todas sus direcciones, con ejercicios de piso', '15+ años', 'Para qué sirve:
La cadera rígida hace trabajar de más a la espalda y a la rodilla, y casi siempre se rigidiza por estar sentado muchas horas. Esta rutina cubre las cuatro direcciones y se hace en el piso, sin nada.
Qué necesitás:
Una colchoneta o una toalla en el piso, y una pared.
Cómo se presenta:
Lento y sin rebotes, dentro del rango sin dolor. Se hace mejor al final del día o después de caminar, cuando la cadera ya está caliente.
Ejercicio 1, en el piso, boca arriba:
Diez repeticiones lentas de cada una.
• Llevar una rodilla al pecho con las manos, y volver.
• Las dos rodillas al pecho.
• Rodillas flexionadas y caerlas a un lado y al otro, sin despegar los hombros.
• Una pierna estirada arriba, hacia afuera y hacia adentro.
Ejercicio 2, la rotación, que es lo que más falta:
• Sentado en el piso, piernas flexionadas, dejar caer las rodillas hacia dentro y hacia afuera, alternando, veinte veces.
• Boca abajo, rodillas flexionadas a noventa grados, dejar caer los pies hacia afuera y hacia adentro.
• Y en cuadrupedia, llevar la cadera atrás hasta sentarse en los talones, diez veces.
Ejercicio 3, en movimiento, de pie:
• Parado con apoyo en la pared, balanceos de una pierna adelante y atrás, quince por lado.
• Balanceos laterales, quince por lado.
• Y la marcha con rodillas altas en el lugar, treinta pasos.
Progresión:
• Si sale fácil: sumar rango al final del movimiento y sostener las posiciones veinte segundos.
• Si no sale: menos rango, con apoyo, y todo desde el piso.
Ojo con esto:
Dolor en la ingle que aparece siempre en el mismo punto, chasquido con dolor, o dolor que irradia a la pierna con adormecimiento son para consultar. Con prótesis de cadera, sólo los movimientos que habilitó quien operó: hay rangos prohibidos.
Qué mirar:
Rango en cada dirección comparado con el otro lado, si aparece dolor y dónde, si la espalda compensa, si mejora en tres semanas. Criterio: rodilla al pecho sin dolor y caída de rodillas simétrica.
Cuánto y cada cuánto:
Una serie de diez de cada ejercicio, una vez por día. Quince minutos.
Para casa:
La rutina de piso una vez por día. Y levantarse cada cuarenta y cinco minutos de la silla, que hace tanto como la rutina.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Movilidad de rodilla después de una cirugía', 'guide', 'Recuperar flexión y extensión de rodilla en el posoperatorio, dentro de lo indicado por quien operó', '15+ años', 'Para qué sirve:
Después de una cirugía de rodilla los primeros grados de flexión y, sobre todo, la extensión completa son lo que define el resultado. Y la extensión que no se recupera en las primeras semanas cuesta muchísimo más después.
Qué necesitás:
Una toalla enrollada, una silla, hielo, y el parte quirúrgico con las indicaciones.
Cómo se presenta:
Lo primero es leer la indicación de quien operó: qué rango está permitido, cuánto peso puede apoyar, y desde cuándo. Nada de lo que sigue va antes de eso ni en contra de eso.
Ejercicio 1, la extensión, que es la prioridad:
• Sentado con el talón apoyado en otra silla y la rodilla al aire, dejar que el peso la estire. Cinco minutos, tres veces por día.
• Boca abajo con la rodilla fuera de la cama, dejando caer la pierna. Cinco minutos.
• Contracción del cuádriceps apretando la rodilla contra la cama, diez segundos, diez veces.
Ejercicio 2, la flexión, de a poco:
• Sentado, deslizar el talón hacia atrás con la ayuda del otro pie, diez veces.
• Acostado, deslizar el talón por la cama, diez veces.
• Sentado en una silla alta, dejar caer la pierna y balancear.
Ejercicio 3, el resto de la pierna, que no se detiene:
• Bombeo de tobillo, treinta veces, varias veces por día.
• Contracción de glúteo, diez veces.
• Elevación de la pierna estirada, si está permitida, diez veces.
Progresión:
• Si sale fácil: sumar grados de flexión según la indicación, y carga progresiva cuando esté habilitada.
• Si no sale: no se fuerza el rango. Se avisa a quien indicó el tratamiento.
Ojo con esto:
Aumento del dolor, hinchazón que crece, calor y enrojecimiento, fiebre, o dolor en la pantorrilla con hinchazón son motivo de consulta inmediata. El rango permitido lo define quien operó, no la tolerancia al dolor.
Qué mirar:
Grados de extensión y de flexión, medidos y anotados cada semana. Hinchazón, temperatura de la zona, capacidad de contraer el cuádriceps. Criterio: extensión completa, que es la prioridad absoluta de las primeras semanas.
Cuánto y cada cuánto:
Los de extensión, tres veces por día. El resto, dos veces por día. Hielo veinte minutos después.
Para casa:
La posición de extensión cinco minutos tres veces por día, todos los días. Es lo que más define el resultado final.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Movilidad de tobillo todos los días', 'guide', 'Mantener y recuperar movilidad de tobillo, sobre todo la flexión dorsal', '15+ años', 'Para qué sirve:
La flexión dorsal del tobillo (llevar la punta del pie hacia la rodilla) es la que más se pierde y la que hace falta para caminar, bajar escaleras y hacer una sentadilla. Cuando falta, la compensación aparece en la rodilla o en la espalda.
Qué necesitás:
Una pared, un escalón, una toalla y una silla.
Cómo se presenta:
Se mide primero: parado frente a la pared, la punta del pie a diez centímetros, intentar tocar la pared con la rodilla sin despegar el talón. Se anota cuántos centímetros y se compara con el otro lado.
Ejercicio 1, movilidad libre:
Veinte repeticiones de cada una.
• Sentado, círculos con el pie, en los dos sentidos.
• Punta y talón, alternando.
• El pie hacia adentro y hacia afuera.
• Escribir el abecedario en el aire con el dedo gordo.
Ejercicio 2, la flexión dorsal, con carga:
• Frente a la pared, la rodilla hacia la pared con el talón apoyado, diez repeticiones sosteniendo cinco segundos.
• En un escalón, con la mitad del pie afuera, dejar caer el talón. Treinta segundos, tres veces.
• Con la toalla alrededor del pie, tirar hacia uno con la rodilla estirada, treinta segundos.
Ejercicio 3, en carga y en movimiento:
• Elevaciones de talón, quince repeticiones, tres series.
• Caminar en puntas diez metros y en talones diez metros.
• Y sentadilla poco profunda con los talones apoyados, diez repeticiones.
Progresión:
• Si sale fácil: sumar peso a las elevaciones de talón y hacerlas a una pierna.
• Si no sale: menos rango, sin carga, y más repeticiones de movilidad libre.
Ojo con esto:
Dolor que no baja después de la actividad, hinchazón que aparece siempre, o inestabilidad con sensación de que el tobillo se va son para evaluar. Después de un esguince, el trabajo es de fuerza y propiocepción además de movilidad.
Qué mirar:
Centímetros de la prueba de la pared, comparados entre lados y en el tiempo. Dolor, hinchazón, cómo camina. Criterio: la misma distancia en la prueba de la pared que del lado sano.
Cuánto y cada cuánto:
Movilidad libre, dos veces por día. Los de carga, una vez por día, cinco días por semana.
Para casa:
Los círculos de tobillo sentado, dos veces por día, y el escalón treinta segundos por lado. Cinco minutos.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'La columna que se mueve en todas sus direcciones', 'guide', 'Mantener movilidad de columna en flexión, extensión, rotación e inclinación, sin forzar', '15+ años', 'Para qué sirve:
La columna tiene cuatro direcciones de movimiento y la vida sedentaria usa una sola: estar sentado en flexión. Recuperar las otras tres es lo que más alivia la espalda que duele de estar quieta.
Qué necesitás:
Una colchoneta, una silla y una pared.
Cómo se presenta:
Rango pequeño y muchas repeticiones, sin rebotes y sin llegar al dolor. La columna responde mejor a movimiento frecuente y suave que a estiramientos fuertes.
Ejercicio 1, en cuadrupedia:
Diez repeticiones lentas de cada una.
• Gato y camello: arquear y redondear la espalda.
• Rotación: una mano a la nuca y girar el tronco, mirando el codo.
• Llevar la cola hacia los talones y volver.
Ejercicio 2, acostado:
• Rodillas flexionadas, caerlas a un lado y al otro, veinte veces.
• Rodillas al pecho, diez veces.
• Boca abajo, apoyarse en los codos y sostener treinta segundos, que es extensión suave.
Ejercicio 3, sentado y de pie:
• Sentado en la silla, rotar el tronco a cada lado, diez veces.
• Sentado, inclinarse a cada lado llevando la mano hacia el piso, diez veces.
• Parado, manos en la cintura, extensión suave hacia atrás, diez veces.
Progresión:
• Si sale fácil: sumar rango y tiempo de sostén, y agregar movimiento con carga liviana.
• Si no sale: menos rango, sólo en el piso, y sólo las direcciones que no molestan.
Ojo con esto:
Dolor que baja por la pierna con adormecimiento u hormigueo, pérdida de fuerza, alteraciones para orinar o dolor nocturno que no cede con el cambio de posición requieren evaluación médica antes de seguir. Y en osteoporosis, la flexión forzada de columna está contraindicada.
Qué mirar:
Rango en cada dirección, cuál duele y cuál alivia, si el dolor se centraliza o se extiende a la pierna, cómo está a la mañana. Criterio: las cuatro direcciones sin dolor y el alivio sostenido después de la rutina.
Cuánto y cada cuánto:
Una serie completa, dos veces por día. Diez minutos cada vez.
Para casa:
Gato y camello, y rodillas a los lados, a la mañana y a la noche. Y no pasar más de cuarenta y cinco minutos sentado.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Cuello: movilidad sin riesgo', 'guide', 'Mover el cuello en todas sus direcciones con técnica segura, evitando las maniobras que no corresponden', '15+ años', 'Para qué sirve:
El cuello se mueve poco y se carga mucho, y es la zona donde más maniobras desaconsejadas circulan. Esta rutina cubre las direcciones que hacen falta y dice explícitamente qué no hacer.
Qué necesitás:
Una silla con respaldo. Nada más.
Cómo se presenta:
Sentado, con la espalda apoyada y los hombros sueltos. Movimientos lentos, en rango sin dolor y sin llegar al final del movimiento. Si aparece mareo, se detiene.
Ejercicio 1, las cuatro direcciones:
Diez repeticiones lentas de cada una.
• Mirar hacia abajo, llevando el mentón al pecho, y volver a la posición neutra.
• Girar la cabeza a cada lado, como diciendo no.
• Inclinar la oreja hacia el hombro, a cada lado.
• Extensión suave hacia atrás, sin dejar caer la cabeza.
Ejercicio 2, la retracción, que es la que más falta:
La postura de cabeza adelantada es la que carga el cuello.
• Llevar el mentón hacia atrás, como haciendo doble mentón, sin inclinar la cabeza. Diez veces, sosteniendo tres segundos.
• Lo mismo con la espalda apoyada en la pared.
• Y sostener la retracción veinte segundos, tres veces.
Ejercicio 3, fuerza isométrica suave:
• La mano en la frente, empujar suave contra la mano sin mover la cabeza, diez segundos.
• Lo mismo en cada lado y atrás.
• Tres repeticiones de cada dirección, sin dolor.
Progresión:
• Si sale fácil: sumar tiempo de sostén en la retracción y fuerza isométrica más intensa.
• Si no sale: sólo las direcciones que no molestan, en rango muy chico.
Ojo con esto:
Nada de círculos completos de cabeza ni de movimientos forzados al final del rango. Mareo, visión borrosa, náuseas, hormigueo en los brazos, pérdida de fuerza en las manos o dolor después de un golpe o un accidente requieren evaluación médica antes de mover nada.
Qué mirar:
Rango en cada dirección, si hay un lado limitado, aparición de mareo, si la retracción se puede sostener, cómo está la postura de la cabeza. Criterio: las cuatro direcciones sin dolor y veinte segundos de retracción sostenida.
Cuánto y cada cuánto:
Dos veces por día, cinco minutos. Mejor que una vez y largo.
Para casa:
La retracción cada hora, tres veces, en el trabajo. Y la pantalla a la altura de los ojos.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Muñeca y codo para quien trabaja con las manos', 'guide', 'Mantener movilidad de muñeca, codo y dedos en quien usa las manos muchas horas', '15+ años', 'Para qué sirve:
Teclado, mouse, herramientas, peluquería, cocina: horas de la misma posición y del mismo movimiento. La movilidad y las pausas son lo que evita que eso termine en una tendinopatía o en un túnel carpiano.
Qué necesitás:
Una mesa. Nada más.
Cómo se presenta:
Se hace en pausas cortas y frecuentes, no en una sesión larga al final del día. La frecuencia es el tratamiento: tres minutos cada hora rinde más que veinte minutos una vez.
Ejercicio 1, muñeca y dedos:
Diez repeticiones de cada una.
• Flexionar y extender la muñeca, con el antebrazo apoyado.
• Desviar la muñeca a cada lado.
• Círculos de muñeca en los dos sentidos.
• Abrir y cerrar la mano fuerte, y separar los dedos.
• Tocar el pulgar con cada dedo, en ida y vuelta.
Ejercicio 2, antebrazo y codo:
• Girar el antebrazo con la palma hacia arriba y hacia abajo, veinte veces.
• Flexionar y extender el codo completo, diez veces.
• Estiramiento de los extensores: brazo estirado adelante, palma hacia abajo, llevar la mano hacia abajo con la otra. Treinta segundos.
• Estiramiento de los flexores: palma hacia arriba, llevar la mano hacia abajo. Treinta segundos.
Ejercicio 3, lo que cambia el problema de verdad:
• Pausa de dos minutos cada hora, con el reloj.
• Teclado y mouse a la altura del codo, muñeca recta y no quebrada.
• Cambiar de herramienta o de agarre cuando se puede.
• Y fuerza de agarre y de hombro, que reparten la carga.
Progresión:
• Si sale fácil: sumar fuerza excéntrica de muñeca con peso liviano, que es lo que más sirve en tendinopatía.
• Si no sale: sólo movilidad sin resistencia, y bajar la carga de trabajo en lo que se pueda.
Ojo con esto:
Adormecimiento u hormigueo en los dedos, sobre todo de noche, pérdida de fuerza o de destreza fina, o dolor que ya no se va con el descanso requieren evaluación. Y el dolor que aumenta durante el ejercicio indica que la carga es demasiada.
Qué mirar:
Rango de muñeca y antebrazo, fuerza de agarre, si hay adormecimiento y en qué dedos, si el dolor aparece en el trabajo o después. Criterio: rango completo sin dolor y una jornada de trabajo sin dolor al final.
Cuánto y cada cuánto:
Tres minutos cada hora de trabajo. Y la rutina completa una vez por día.
Para casa:
La pausa con alarma cada hora. Es la intervención con mejor resultado de toda la lista.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Mover todas las articulaciones jugando', 'game', 'Trabajar movilidad articular en niños a través del juego, con dosis y en formato corto', '6-7 años', 'Para qué sirve:
Un chico no hace diez repeticiones de movilidad de hombro porque se lo pidan, y no hace falta: el mismo rango sale en un juego. Lo que hay que conservar del ejercicio es la dosis y las direcciones, no el formato.
Qué necesitás:
Un globo, una pelota, tiza o cinta, y espacio.
Cómo se presenta:
Se juega, se cuenta en voz alta, y se nombran las partes que se mueven. Nada se presenta como ejercicio. Vos jugás también, que es lo que sostiene la cantidad de repeticiones.
Ejercicio 1, hombros y brazos:
• El globo que no toca el piso, golpeándolo bien arriba: veinte toques.
• Alcanzar marcas pegadas en la pared, cada vez más altas: diez de cada lado.
• Dibujar círculos gigantes en el aire con los dos brazos: diez en cada sentido.
• Y caminar como un oso, con las manos en el piso, cinco metros.
Ejercicio 2, caderas, rodillas y tobillos:
• Caminar como un cangrejo, en cuclillas, cinco metros.
• Saltar dentro de los cuadrados dibujados, diez saltos.
• Caminar en puntas y en talones, diez metros cada uno.
• Y la rana: salto en cuclillas, diez veces.
Ejercicio 3, columna y todo junto:
• Gato y camello, presentado como un gato que se despierta: diez veces.
• Rodar por la colchoneta, tres metros.
• Pasar por abajo de una cuerda y por arriba de otra, cinco vueltas.
• Y el circuito completo, dos veces.
Progresión:
• Si sale fácil: más repeticiones, más rango (marcas más altas, cuadrados más lejos) y con reloj.
• Si no sale: menos repeticiones y rangos más cómodos, y con vos haciéndolo al lado.
Ojo con esto:
Superficie segura y espacio libre. Si el chico tiene una condición articular, una hipermovilidad o una indicación médica específica, la rutina se ajusta a eso: acá no hay nada que se haga contra una indicación.
Qué mirar:
Rango en cada articulación comparado entre lados, si evita alguna posición, si hay dolor (y hay que preguntarlo de forma concreta: ¿te duele acá?), si se cansa muy rápido. Criterio: el circuito completo dos veces sin evitar posiciones.
Cuánto y cada cuánto:
Quince a veinte minutos, tres veces por semana. Corto y frecuente.
Para la familia:
Diez minutos de juego de movimiento por día. Parque, plaza, patio: lo que sirve es el rato, no el ejercicio.');

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongación de la cadena posterior', 'guide', 'Elongar isquiotibiales, gemelos y espalda baja con técnica segura y tiempos suficientes', '15+ años', 'Para qué sirve:
La cadena posterior acortada tira de la pelvis y carga la espalda baja, y es el acortamiento más común en quien está sentado muchas horas. Se elonga toda junta o no sirve: isquiotibiales, gemelos y espalda se tiran entre sí.
Qué necesitás:
Una colchoneta, una toalla, una silla y una pared.
Cómo se presenta:
Treinta segundos por posición como mínimo, sin rebotes, respirando. Menos de treinta segundos no cambia nada. Y se elonga después de mover o de caminar, nunca en frío.
Ejercicio 1, isquiotibiales:
Treinta segundos por lado, dos veces cada uno.
• Acostado, la toalla alrededor del pie, subir la pierna estirada.
• Sentado en el borde de la silla, una pierna estirada adelante con el talón en el piso, inclinarse desde la cadera.
• Parado con el pie en un escalón bajo, inclinarse hacia adelante con la espalda recta.
Ejercicio 2, gemelos y sóleo, que son dos:
• Gemelo: manos en la pared, pierna de atrás estirada, talón apoyado. Treinta segundos.
• Sóleo: el mismo apoyo, pero con la rodilla de atrás flexionada. Treinta segundos. Este casi nunca se hace y es el que más falta.
• Y en el escalón, dejando caer el talón, treinta segundos.
Ejercicio 3, espalda baja y cadera:
• Rodillas al pecho, treinta segundos.
• Piernas cruzadas y rodilla al pecho opuesto, treinta segundos por lado.
• Y la posición del niño, sentado en los talones con los brazos estirados adelante, un minuto.
Progresión:
• Si sale fácil: sostener sesenta segundos y agregar elongación con contracción previa del músculo.
• Si no sale: rango más chico, con apoyo, y sin buscar la posición final.
Ojo con esto:
Dolor que baja por la pierna con hormigueo o adormecimiento no es acortamiento: hay que evaluarlo antes de elongar. Y no se elonga un músculo con una lesión reciente ni se hace rebote nunca.
Qué mirar:
Rango de cada posición comparado entre lados, si aparece dolor en la espalda al elongar isquiotibiales (eso indica que la pelvis se está moviendo), si mejora en tres semanas. Criterio: pierna estirada a noventa grados acostado, sin dolor.
Cuánto y cada cuánto:
Treinta segundos por posición, dos veces cada una, una vez por día. Diez minutos.
Para casa:
La rutina completa una vez por día, después de caminar o de la ducha. Nunca lo primero de la mañana en frío.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongación de cuello y hombros para pantalla', 'guide', 'Aliviar la tensión de cuello, trapecio y pectoral en quien pasa el día frente a una pantalla', '15+ años', 'Para qué sirve:
Ocho horas de pantalla dejan el trapecio cargado, el cuello adelantado y el pectoral corto. Elongar alivia, pero sólo si también se corrige la postura y se agregan pausas: elongar y volver a la misma posición no cambia nada.
Qué necesitás:
Una silla y un marco de puerta.
Cómo se presenta:
Se hace sentado, sin llegar al dolor y sin tirar de la cabeza con fuerza. Se acompaña de la corrección de la pantalla y de la pausa: los tres juntos, si no es tiempo perdido.
Ejercicio 1, cuello y trapecio:
Treinta segundos por lado, dos veces.
• Inclinar la oreja al hombro, la mano del mismo lado apoyada suave en la cabeza, sin tirar fuerte.
• La misma posición mirando hacia la axila, que toma otra parte del músculo.
• Sentado, la mano tomando el borde de la silla y la cabeza inclinada al lado opuesto.
Ejercicio 2, pectoral y hombros:
• En el marco de la puerta: antebrazo apoyado, codo a la altura del hombro, dar un paso adelante. Treinta segundos por lado.
• Manos entrelazadas atrás, estirar los brazos hacia abajo y atrás. Treinta segundos.
• Acostado boca arriba con una toalla enrollada a lo largo de la columna, brazos abiertos en cruz. Dos minutos. El de la toalla es el mejor: usa el peso del propio brazo, así que no se fuerza.
Ejercicio 3, lo que hay que sumarle:
Elongar solo no alcanza, y conviene decirlo.
• Fuerza de remo y de omóplatos, tres veces por semana.
• La retracción de cuello, diez veces por hora.
• Pantalla a la altura de los ojos, codos apoyados.
• Y pausa de dos minutos cada cuarenta y cinco.
Progresión:
• Si sale fácil: sostener sesenta segundos, y sumar carga en el trabajo de fuerza.
• Si no sale: rango más chico, sin la mano en la cabeza, sólo con el peso de la cabeza.
Ojo con esto:
Hormigueo o adormecimiento en los brazos o las manos, pérdida de fuerza, mareos o dolor de cabeza que empeora requieren evaluación antes de insistir. Y no se tira de la cabeza con fuerza en ningún caso.
Qué mirar:
Rango y diferencia entre lados, en qué momento del día aparece la tensión, si el alivio dura, si la postura cambió. Criterio: una jornada de trabajo sin dolor de cuello al final del día.
Cuánto y cada cuánto:
La rutina completa una vez por día, y las pausas cada cuarenta y cinco minutos.
Para casa:
La toalla dos minutos por día, y la alarma de la pausa. Esas dos cosas hacen la mayor parte del trabajo.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongar el psoas, el músculo de estar sentado', 'guide', 'Elongar el flexor de cadera, que se acorta con las horas sentado y carga la espalda baja', '15+ años', 'Para qué sirve:
El psoas acortado inclina la pelvis hacia adelante y aumenta la curva lumbar, y eso es una de las causas más frecuentes de espalda baja que duele al final del día. Se acorta por estar sentado, así que casi todos lo tienen corto.
Qué necesitás:
Una colchoneta, un almohadón, y una silla o un sillón firme.
Cómo se presenta:
La técnica importa más que el rango: si la pelvis no está en posición, el estiramiento se lo lleva la espalda y el psoas no se elonga. Antes de estirar, se aprende a llevar la pelvis hacia atrás.
Ejercicio 1, la posición de la pelvis, primero:
• De rodillas con una pierna adelante, antes de avanzar: apretar el glúteo del lado de atrás y llevar el pubis hacia el ombligo.
• Se siente enseguida en la ingle del lado de atrás. Si no se siente ahí, la pelvis no está.
• Sostener treinta segundos, dos veces por lado.
Ejercicio 2, las tres variantes:
• De rodillas con una pierna adelante, con el almohadón bajo la rodilla de atrás. Treinta segundos.
• Acostado en el borde de la cama con una pierna colgando y la otra abrazada al pecho. Treinta segundos.
• Parado con el pie de atrás en una silla detrás de uno, el peso adelante. Treinta segundos.
Ejercicio 3, lo que lo complementa:
• Fuerza de glúteo, que es el antagonista, tres veces por semana.
• Movilidad de cadera en extensión.
• Y lo que más sirve: levantarse de la silla cada cuarenta y cinco minutos.
Progresión:
• Si sale fácil: sostener sesenta segundos y sumar activación de glúteo dentro de la posición.
• Si no sale: acostado en la cama, que es la versión con menos exigencia, y sin buscar rango.
Ojo con esto:
Si aparece dolor en la espalda baja durante el estiramiento, la pelvis no está en posición: se corrige antes de seguir. Y dolor irradiado a la pierna con adormecimiento es para evaluar, no para elongar.
Qué mirar:
Si siente el estiramiento en la ingle o en la espalda (tiene que ser en la ingle), diferencia entre lados, si la curva lumbar cambia, si el dolor del final del día baja. Criterio: estiramiento sentido en la ingle, treinta segundos, sin dolor lumbar.
Cuánto y cada cuánto:
Treinta segundos por lado, dos veces, una vez por día.
Para casa:
La versión de rodillas, una vez por día, y levantarse de la silla cada cuarenta y cinco minutos.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongar después de estar mucho de pie', 'guide', 'Aliviar piernas, planta del pie y espalda baja en quien trabaja muchas horas de pie', '15+ años', 'Para qué sirve:
Ocho horas de pie cargan la planta del pie, los gemelos y la espalda baja, y el problema es distinto al de estar sentado: acá hay sobrecarga por sostener, no acortamiento por posición. Lo que alivia es descargar, elongar y elevar.
Qué necesitás:
Una pelotita de tenis, una pared, un escalón, y un lugar para acostarse.
Cómo se presenta:
Se hace al final de la jornada, y también en pausas si es posible. Se empieza por el pie, que es donde empieza la cadena, y se sube.
Ejercicio 1, la planta del pie:
• Rodar la pelotita bajo la planta, dos minutos por pie, buscando los puntos que molestan.
• Estirar los dedos hacia arriba con la mano, treinta segundos por pie.
• De rodillas con los dedos flexionados apoyados, sentándose en los talones, treinta segundos.
Ejercicio 2, gemelos, isquiotibiales y cadera:
• Gemelo en la pared, treinta segundos por lado.
• Sóleo con la rodilla flexionada, treinta segundos por lado.
• Isquiotibiales con el pie en un escalón, treinta segundos por lado.
• Y glúteo: sentado, un tobillo sobre la rodilla opuesta, inclinarse adelante. Treinta segundos.
Ejercicio 3, descargar y elevar:
• Acostado con las piernas apoyadas en la pared, a noventa grados, cinco minutos.
• Bombeo de tobillos en esa posición, treinta veces.
• Y la espalda: rodillas al pecho, un minuto.
Progresión:
• Si sale fácil: sumar fuerza de pie y de gemelo, que es lo que evita la recaída.
• Si no sale: sólo la pelotita y las piernas elevadas, que son las dos que nunca fallan.
Ojo con esto:
Hinchazón de una sola pierna con dolor en la pantorrilla, o hinchazón que no baja con las piernas elevadas, requiere consulta médica. Y el dolor en el talón que es peor en el primer paso de la mañana tiene un tratamiento específico: conviene evaluarlo.
Qué mirar:
Dónde duele al final del día, si hay hinchazón y si baja con la elevación, cómo está el primer paso de la mañana, qué calzado usa. Criterio: el final de la jornada con menos dolor, sostenido dos semanas.
Cuánto y cada cuánto:
La rutina completa una vez por día, al final de la jornada. Quince minutos.
Para casa:
La pelotita dos minutos por pie y las piernas en la pared cinco minutos, todos los días. Y revisar el calzado, que resuelve más que la rutina.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongación antes de correr, y qué va después', 'guide', 'Preparar el cuerpo antes de correr con movilidad activa, y dejar la elongación sostenida para después', '15+ años', 'Para qué sirve:
Antes de correr no va estiramiento sostenido: va movilidad activa y entrada en calor. El estiramiento largo en frío y antes del esfuerzo no previene lesiones y puede bajar el rendimiento. Después, sí.
Qué necesitás:
Espacio para diez metros de ida y vuelta. Nada más.
Cómo se presenta:
Se explica la diferencia entre las dos cosas, porque es lo que casi todo el mundo hace al revés: antes, movimiento; después, estiramiento sostenido.
Ejercicio 1, antes de correr, movilidad activa:
Diez repeticiones o diez metros de cada una.
• Caminar rápido tres minutos, o trotar suave.
• Balanceos de pierna adelante y atrás, quince por lado.
• Balanceos laterales, quince por lado.
• Rodillas altas, diez metros.
• Talones a la cola, diez metros.
• Zancadas caminando, diez pasos.
• Elevaciones de talón, quince.
Ejercicio 2, la progresión del ritmo:
• Los primeros cinco minutos de la corrida, suaves de verdad.
• Después el ritmo de trabajo.
• Y un par de aceleraciones cortas antes de la parte fuerte, si va a haber.
Ejercicio 3, después de correr, ahí sí el estiramiento:
Treinta segundos por posición, dos veces.
• Gemelo y sóleo.
• Isquiotibiales.
• Cuádriceps.
• Psoas.
• Glúteo.
Progresión:
• Si sale fácil: entrada en calor más específica según el entrenamiento del día.
• Si no sale: alargar la caminata inicial y bajar el volumen de la corrida.
Ojo con esto:
Dolor que aparece siempre en el mismo punto y aumenta durante la corrida no se soluciona con más elongación: requiere evaluación. Y subir el volumen semanal más de un diez por ciento es la forma más común de lesionarse.
Qué mirar:
Si aparece dolor y en qué kilómetro, cómo está al día siguiente, si el volumen semanal sube demasiado rápido, qué calzado usa y cuántos kilómetros tiene. Criterio: entrada en calor completa antes de cada salida, y sin dolor al día siguiente.
Cuánto y cada cuánto:
La movilidad activa, antes de cada corrida, ocho minutos. El estiramiento, después de cada corrida, diez minutos.
Para casa:
El orden correcto: movimiento antes, estiramiento después. Es un cambio gratis y es el que más rinde.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Cuándo elongar y cuándo no', 'guide', 'Decidir cuándo la elongación corresponde y cuándo hay que hacer otra cosa', '15+ años', 'Para qué sirve:
Elongar no es siempre la respuesta, y en varias situaciones empeora. Esta guía es para decidir: en un músculo tenso por sobrecarga, en una lesión reciente y en una articulación inestable, elongar no es lo que corresponde.
Qué necesitás:
Nada. Es una guía de criterio.
Cómo se presenta:
Se revisa el caso con las preguntas de abajo antes de indicar una rutina de elongación. Y se explica a la persona por qué, porque la creencia de que todo se arregla estirando está muy instalada.
Ejercicio 1, cuándo sí corresponde:
• Acortamiento real: rango limitado, comparado con el otro lado, sin dolor agudo.
• Rigidez por posición mantenida: psoas y pectoral de estar sentado.
• Después de una actividad, como parte de la vuelta a la calma.
• En una recuperación, cuando la fase inflamatoria ya pasó y con indicación.
Ejercicio 2, cuándo no, y qué va en su lugar:
• Lesión reciente, inflamación, esguince agudo. Lo que va: reposo relativo, movilidad suave sin dolor, carga progresiva.
• Músculo tenso por debilidad o sobrecarga (el trapecio del que está mal sentado). Lo que va: fuerza y cambio de postura. Estirarlo alivia diez minutos y vuelve.
• Articulación inestable o hipermovilidad. Lo que va: fuerza y control, no más rango.
• Dolor irradiado con adormecimiento. Lo que va: evaluación antes de cualquier ejercicio.
• Osteoporosis con flexión de columna: contraindicado.
Ejercicio 3, la técnica que sí funciona, cuando corresponde:
• Treinta segundos como mínimo, sin rebotes.
• Después de mover o en caliente, no en frío.
• Sin llegar al dolor: molestia sí, dolor no.
• Y siempre comparado con el otro lado, que es la referencia.
Progresión:
• Si sale fácil: sumar elongación con contracción previa, que rinde más en acortamientos reales.
• Si no sale: si el rango no mejora en cuatro semanas de trabajo sostenido, el problema probablemente no es de elongación.
Ojo con esto:
Un músculo que se siente tenso no siempre está corto. Y la sensación de alivio inmediato después de estirar no prueba que sea el tratamiento correcto: casi todo alivia diez minutos.
Qué mirar:
Rango comparado con el lado sano, si el rango mejora con el tiempo, si la tensión vuelve siempre igual (eso sugiere que el problema es otro). Criterio: rango que mejora y se sostiene, no alivio momentáneo.
Cuánto y cada cuánto:
Cuando corresponde: treinta segundos por posición, dos veces, una vez por día.
Para casa:
La frase que conviene dejar: si al día siguiente está igual de tenso, no era para estirar.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongar antes y después del deporte, en la adolescencia', 'guide', 'Ordenar la entrada en calor y la vuelta a la calma en un adolescente que hace deporte', '10-11 años', 'Para qué sirve:
En el deporte infantil y juvenil la entrada en calor se hace mal o no se hace, y el estiramiento largo antes de jugar es lo más común. Ordenarlo baja lesiones y además instala un hábito que va a durar años.
Qué necesitás:
Espacio para diez metros. Y el horario de sus entrenamientos.
Cómo se presenta:
Se le enseña a él, no a la familia: a esta edad la entrada en calor la va a hacer solo o no la va a hacer. Se practica la rutina completa acá hasta que se la sepa de memoria.
Ejercicio 1, la entrada en calor, ocho minutos:
En este orden, y sin estiramiento sostenido.
• Trote suave, tres minutos.
• Rodillas altas, diez metros, dos veces.
• Talones a la cola, diez metros, dos veces.
• Zancadas caminando, diez pasos.
• Balanceos de pierna adelante y al costado, quince por lado.
• Saltos en el lugar, veinte.
• Dos aceleraciones cortas de quince metros.
Ejercicio 2, la parte específica del deporte:
Cinco minutos del gesto de su deporte, suave.
• Fútbol: pases, conducción.
• Básquet: botes, tiros cerca del aro.
• Vóley: pases suaves.
• Atletismo: técnica de carrera.
Ejercicio 3, la vuelta a la calma, después:
• Caminar tres minutos, bajando el ritmo.
• Estiramiento sostenido: gemelo, isquiotibiales, cuádriceps, glúteo, treinta segundos cada uno.
• Agua, y algo para comer si el entrenamiento fue largo.
Progresión:
• Si sale fácil: que la haga solo antes de cada entrenamiento y que la enseñe a un compañero.
• Si no sale: cinco minutos de trote y tres ejercicios, que es mejor que nada.
Ojo con esto:
En esta etapa de crecimiento hay dolores que no son lesiones y otros que sí: dolor en el talón, en la rodilla justo debajo de la rótula, o en la cadera que aparece con la actividad y no se va con el descanso son para evaluar. Y no se entrena con dolor.
Qué mirar:
Si hace la entrada en calor solo, si aparecen dolores de crecimiento localizados, cuántas horas de deporte por semana hace y si hay descanso, cómo está al día siguiente. Criterio: la rutina hecha sola antes de tres entrenamientos seguidos.
Cuánto y cada cuánto:
Ocho minutos antes de cada entrenamiento y diez después. Todos los días que entrena.
Para la familia:
Un día de descanso por semana, sin deporte. Y si hay dolor que se repite, se consulta antes de seguir entrenando.');

-- ─── Fuerza ─────────────────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Sentadillas bien hechas', 'guide', 'Aprender la sentadilla con técnica y progresión, desde la versión con apoyo hasta la completa', '15+ años', 'Para qué sirve:
La sentadilla es el movimiento de la vida diaria: levantarse de una silla, del inodoro, del piso. Entrenarla bien es lo que sostiene la autonomía, y hecha mal es una de las formas más comunes de cargar la rodilla.
Qué necesitás:
Una silla, una pared, y espacio. Después, algo de peso para sostener adelante.
Cómo se presenta:
Se empieza por la versión más accesible y se avanza cuando salen tres series de diez con forma limpia. La forma se mira en tres cosas: rodillas, espalda y talones.
Ejercicio 1, la progresión:
Tres series de diez con forma limpia antes de avanzar.
• Sentarse y levantarse de una silla alta, sin manos.
• De una silla normal.
• Sentadilla hasta tocar la silla con la cola, sin sentarse.
• Sentadilla libre, hasta donde llegue con la espalda recta.
• Sentadilla profunda.
• Con peso sostenido adelante.
Ejercicio 2, lo que hay que mirar en todas:
• Los talones apoyados todo el tiempo. Si se levantan, falta movilidad de tobillo.
• Las rodillas en línea con los pies, no hacia adentro.
• La espalda recta, el pecho arriba.
• Bajar controlado, contando tres segundos.
Ejercicio 3, las variantes según el caso:
• Si duele la rodilla: sentadilla parcial, menos rango, y más glúteo.
• Si falta equilibrio: con las manos en el respaldo de una silla.
• Si falta movilidad de tobillo: con los talones sobre un libro fino, y trabajar movilidad aparte.
• Y para más exigencia: sentadilla a una pierna con apoyo.
Progresión:
• Si sale fácil: más rango, más peso, o pasar a una pierna. Un factor por vez.
• Si no sale: subir la altura de la silla, o quedarse en la versión con apoyo de manos.
Ojo con esto:
Dolor de rodilla que aumenta durante el ejercicio, chasquido con dolor, o hinchazón después son señales de que la carga o el rango son demasiados. Con prótesis o cirugía reciente, el rango lo define quien operó.
Qué mirar:
Si los talones se levantan, si las rodillas se van hacia adentro, si la espalda se redondea, cuántas repeticiones antes de que la forma se caiga. Criterio: tres series de diez con forma limpia, y ahí se avanza.
Cuánto y cada cuánto:
Tres series de diez, tres veces por semana, con un día de descanso en el medio.
Para casa:
Levantarse de la silla sin manos, diez veces, tres veces por día. Es la misma sentadilla y no parece ejercicio.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Fuerza de tobillo después de un esguince', 'guide', 'Recuperar fuerza y estabilidad de tobillo después de un esguince, en las cuatro direcciones', '15+ años', 'Para qué sirve:
El esguince que no se rehabilita bien vuelve: más de la mitad de las personas tienen un segundo esguince del mismo tobillo. Lo que lo evita no es el reposo, es la fuerza en las cuatro direcciones y la propiocepción.
Qué necesitás:
Una banda elástica o una toalla, una pared, un escalón, y un almohadón.
Cómo se presenta:
Se empieza sin carga, con la banda, y se avanza a carga y después a inestabilidad. La regla es que se avanza cuando no hay dolor ni hinchazón al día siguiente.
Ejercicio 1, fuerza con banda, las cuatro direcciones:
Tres series de quince en cada dirección.
• Hacia abajo, empujando contra la banda.
• Hacia arriba, tirando la punta del pie hacia uno.
• Hacia afuera, que es la que más se olvida y la más importante en el esguince típico.
• Hacia adentro.
Ejercicio 2, fuerza en carga:
• Elevaciones de talón con las dos piernas, tres series de quince.
• Elevaciones de talón a una pierna, tres series de diez.
• Elevaciones de talón en el escalón, con rango completo.
• Y caminar en puntas y en talones, diez metros cada uno.
Ejercicio 3, propiocepción, que es lo que cierra:
• Parado en un pie, treinta segundos, tres veces.
• En un pie con los ojos cerrados, veinte segundos.
• En un pie sobre el almohadón, treinta segundos.
• En un pie sobre el almohadón pasándose una pelota, treinta segundos.
Progresión:
• Si sale fácil: sumar saltos a una pierna con aterrizaje controlado, y el gesto del deporte.
• Si no sale: volver a sin carga, y revisar si hay dolor o hinchazón que indique que se avanzó rápido.
Ojo con esto:
Hinchazón que vuelve después de cada sesión indica que la carga es excesiva. Inestabilidad con sensación de que el tobillo se va, o un esguince que no mejora en dos o tres semanas, requiere evaluación: puede haber lesión ligamentaria mayor o una fractura no vista.
Qué mirar:
Fuerza en las cuatro direcciones comparada con el otro lado, tiempo en un pie con ojos cerrados, hinchazón al día siguiente, confianza al caminar en terreno irregular. Criterio: treinta segundos en un pie sobre el almohadón, igual que del lado sano.
Cuánto y cada cuánto:
Fuerza, tres veces por semana. Propiocepción, todos los días, cinco minutos.
Para casa:
El pie apoyado en un pie mientras se lava los dientes, los dos lados. Y las elevaciones de talón, quince, dos veces por día.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Fuerza de glúteo, el músculo que nadie usa', 'guide', 'Activar y fortalecer el glúteo, que se debilita por estar sentado y descarga sobre la espalda y la rodilla', '15+ años', 'Para qué sirve:
El glúteo débil aparece detrás de muchos dolores de espalda baja y de rodilla, porque cuando no trabaja, otros lo suplen. Y se debilita por la misma razón que todo: horas de silla.
Qué necesitás:
Una colchoneta, una banda elástica si hay, y una silla.
Cómo se presenta:
Primero se enseña a activarlo, porque muchas personas hacen los ejercicios y el glúteo no participa: lo hace la espalda o el isquiotibial. Se busca la sensación en el glúteo y recién después se agregan repeticiones.
Ejercicio 1, activar, con la mano en el glúteo:
• Acostado boca arriba, apretar el glúteo diez segundos, sintiendo con la mano. Diez veces.
• Puente: levantar la cola apretando el glúteo, no empujando con la espalda. Tres series de quince.
• Si se siente en la espalda baja, bajar el rango y apretar más el glúteo antes de subir.
Ejercicio 2, fuerza en las tres direcciones del glúteo:
• Puente a una pierna, tres series de diez por lado.
• Acostado de costado, levantar la pierna de arriba sin rotarla, tres series de quince.
• De pie, llevar la pierna hacia atrás con la rodilla estirada, tres series de quince.
• Con banda en las rodillas, abrir las rodillas sentado o acostado, tres series de veinte.
Ejercicio 3, en carga y funcional:
• Subir un escalón, tres series de diez por pierna.
• Estocadas, tres series de ocho por pierna.
• Sentadilla a una pierna con apoyo, tres series de ocho.
• Y caminar en subida o con cuesta, veinte minutos.
Progresión:
• Si sale fácil: sumar peso, una pierna, y trabajo en carga.
• Si no sale: volver a activar con la mano y menos rango, y revisar que el movimiento no lo haga la espalda.
Ojo con esto:
Dolor en la espalda baja durante los ejercicios indica que la espalda está haciendo el trabajo: se corrige la técnica antes de sumar repeticiones. Y dolor irradiado a la pierna requiere evaluación previa.
Qué mirar:
Si siente el trabajo en el glúteo o en la espalda, diferencia entre lados, si la pelvis se cae al pararse en un pie, si el dolor de espalda o de rodilla baja en cuatro semanas. Criterio: puente a una pierna, diez repeticiones por lado, sin dolor lumbar.
Cuánto y cada cuánto:
Tres veces por semana, tres series por ejercicio, con un día de descanso.
Para casa:
El puente, tres series de quince, tres veces por semana. Y subir escaleras en lugar de ascensor.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'La estocada, bien hecha', 'guide', 'Aprender la estocada con progresión y técnica, para fuerza unilateral y control de rodilla', '15+ años', 'Para qué sirve:
La estocada entrena una pierna por vez, y eso es lo que hace falta para subir escaleras, caminar en terreno irregular y levantarse del piso. Además revela la diferencia entre lados, que en casi todos existe.
Qué necesitás:
Espacio, una silla o una pared para apoyo, y después algo de peso.
Cómo se presenta:
Se empieza con apoyo y con rango corto. El criterio para avanzar es la forma: la rodilla de adelante en línea con el pie, el tronco derecho, y la bajada controlada.
Ejercicio 1, la progresión:
Tres series de ocho por pierna con forma limpia antes de avanzar.
• Split squat con apoyo de la mano en la pared, rango corto.
• Split squat sin apoyo, rango corto.
• Split squat con rango completo, rodilla de atrás cerca del piso.
• Estocada caminando.
• Estocada hacia atrás.
• Con peso sostenido adelante o a los costados.
Ejercicio 2, lo que hay que mirar:
• La rodilla de adelante no pasa mucho la punta del pie y no se va hacia adentro.
• El tronco derecho, no inclinado adelante.
• El peso repartido, no todo en la pierna de adelante.
• Bajar contando tres segundos.
Ejercicio 3, las variantes según el caso:
• Si duele la rodilla: rango corto, estocada hacia atrás, que carga menos.
• Si falta equilibrio: pies más separados a lo ancho y apoyo de la mano.
• Y para más exigencia: el pie de atrás elevado en una silla.
Progresión:
• Si sale fácil: más rango, más peso, o pie de atrás elevado. Un factor por vez.
• Si no sale: volver al apoyo y al rango corto, y trabajar equilibrio aparte.
Ojo con esto:
Dolor de rodilla anterior que aumenta con el ejercicio indica demasiada carga o rango: se acorta. Con lesión meniscal o ligamentaria reciente, lo que corresponde lo define quien trata el caso.
Qué mirar:
Diferencia de fuerza y de control entre lados, si la rodilla se va hacia adentro, si el tronco se inclina, cuántas repeticiones antes de perder la forma. Criterio: tres series de ocho por pierna, sin apoyo y con forma limpia.
Cuánto y cada cuánto:
Tres series de ocho por pierna, dos o tres veces por semana.
Para casa:
Subir escalones de a uno con control, tres series de diez por pierna, tres veces por semana.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Fuerza sin cargar la rodilla', 'guide', 'Fortalecer el miembro inferior cuando la rodilla no tolera carga, con ejercicios en descarga', '15+ años', 'Para qué sirve:
Cuando la rodilla duele con la carga, la respuesta no es dejar de fortalecer: es fortalecer sin cargar. Perder fuerza empeora la rodilla, así que dejar de entrenar es el peor camino disponible.
Qué necesitás:
Una colchoneta, una silla, una toalla, y una banda elástica si hay.
Cómo se presenta:
Se elige el ejercicio por lo que tolera, no por lo que corresponde en general. La regla es simple: el dolor durante el ejercicio no pasa de dos o tres sobre diez, y al día siguiente no está peor.
Ejercicio 1, isométricos, que casi siempre se toleran:
• Apretar la rodilla contra la cama, contrayendo el cuádriceps, diez segundos. Diez veces.
• Con una toalla enrollada bajo la rodilla, apretar hacia abajo, diez segundos. Diez veces.
• Sentado con la rodilla estirada apoyada, apretar el cuádriceps, diez segundos. Diez veces.
• Apretar una pelota entre las rodillas, diez segundos, diez veces.
Ejercicio 2, en descarga, con movimiento:
• Sentado, estirar la rodilla hasta arriba y bajar lento, tres series de quince.
• Acostado, elevación de la pierna estirada, tres series de diez.
• De costado, abducción de cadera, tres series de quince.
• Boca abajo, flexionar la rodilla, tres series de quince.
Ejercicio 3, lo que se puede cargar igual:
Casi siempre hay algo que sí tolera.
• Glúteo con puente, que carga poco la rodilla.
• Gemelos con elevaciones de talón.
• Core.
• Y bicicleta con asiento alto y poca resistencia, o agua si hay acceso.
Progresión:
• Si sale fácil: sumar rango, después resistencia, y por último carga progresiva de pie.
• Si no sale: volver a isométricos, que se toleran casi siempre, y revisar el caso.
Ojo con esto:
Hinchazón después de cada sesión, dolor que aumenta día a día, bloqueo de la rodilla o sensación de que se va son señales de que hace falta reevaluar y no de que hace falta más ejercicio.
Qué mirar:
Dolor durante y al día siguiente, hinchazón, fuerza comparada con el otro lado, qué ejercicio tolera y cuál no. Criterio: cuatro semanas sin aumento de dolor, con fuerza que sube.
Cuánto y cada cuánto:
Isométricos, todos los días. Los de movimiento, tres veces por semana.
Para casa:
Los isométricos, tres veces por día, diez repeticiones. Se hacen sentado y en cualquier parte.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Fortalecer el pie, el que nadie entrena', 'guide', 'Fortalecer la musculatura intrínseca del pie, que sostiene el arco y amortigua', '15+ años', 'Para qué sirve:
El pie tiene músculos propios que sostienen el arco y amortiguan cada paso, y el calzado moderno los deja sin trabajo. Fortalecerlos ayuda en dolor plantar, en pie plano doloroso y en la estabilidad del tobillo.
Qué necesitás:
Una toalla, canicas o tapitas, una pelotita, y piso liso. Descalzo.
Cómo se presenta:
Todo descalzo y sin apuro: son músculos chicos y se cansan rápido. Se empieza sentado y se pasa a de pie cuando el movimiento sale bien.
Ejercicio 1, el arco, activado:
• El pie corto: sin doblar los dedos, acercar la base del dedo gordo al talón, levantando el arco. Sostener cinco segundos, diez veces. Es el ejercicio clave y cuesta entenderlo: conviene mostrarlo.
• Lo mismo de pie, diez veces.
• Y en un pie, diez veces.
Ejercicio 2, los dedos:
• Arrugar una toalla con los dedos, tirándola hacia uno, tres veces.
• Levantar canicas o tapitas con los dedos y pasarlas a un recipiente, diez cada pie.
• Levantar sólo el dedo gordo dejando los otros abajo, y después al revés. Diez de cada uno.
• Abrir y separar los dedos, diez veces.
Ejercicio 3, en carga:
• Elevaciones de talón con las dos piernas, tres series de quince.
• A una pierna, tres series de diez.
• Caminar descalzo en puntas, diez metros.
• Y caminar descalzo en terrenos distintos: pasto, arena, alfombra.
Progresión:
• Si sale fácil: el pie corto a una pierna, elevaciones de talón con peso, y saltos con aterrizaje controlado.
• Si no sale: sentado, sin carga, y trabajar sólo el pie corto y los dedos.
Ojo con esto:
Dolor en el talón que es peor en el primer paso de la mañana, o dolor que aumenta con el ejercicio, requiere evaluación: la carga y el calzado son parte del tratamiento. Con diabetes o pérdida de sensibilidad en los pies, andar descalzo requiere consulta previa.
Qué mirar:
Si puede hacer el pie corto sin doblar los dedos, si el arco se levanta, diferencia entre lados, dolor plantar en el tiempo. Criterio: el pie corto de pie, diez repeticiones, con el arco visible.
Cuánto y cada cuánto:
Cinco minutos, todos los días. Es de las rutinas más cortas y más agradecidas.
Para casa:
El pie corto sentado, diez veces, dos veces por día. Y andar descalzo en casa, si no hay contraindicación.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Fuerza de piernas jugando', 'game', 'Trabajar fuerza de miembro inferior en niños con juegos, sin cargas externas', '8-9 años', 'Para qué sirve:
Un chico no hace tres series de diez sentadillas, y no hace falta: la misma fuerza sale saltando, trepando y empujando. Lo que se conserva del entrenamiento es la cantidad y la calidad del movimiento, no el formato.
Qué necesitás:
Aros, conos, un escalón, una colchoneta, y espacio.
Cómo se presenta:
Se arma como circuito con estaciones y se cuenta en voz alta. Nada de pesos externos: a esta edad el propio peso alcanza y sobra. La técnica del aterrizaje es lo que sí hay que mirar.
Ejercicio 1, saltar, y aterrizar bien:
• Saltos dentro de aros, veinte.
• Saltar de un escalón bajo y caer con las rodillas flexionadas y quietas, diez veces.
• Saltos laterales de un lado al otro de una línea, veinte.
• Y saltos a un pie, diez por pierna.
Lo que se mira en todos: que la rodilla no se vaya hacia adentro al caer.
Ejercicio 2, empujar, trepar y sostener:
• Empujar una silla cargada, tres veces de un lado al otro.
• Carretilla: él camina con las manos y vos le sostenés las piernas, cinco metros, dos veces.
• Subir y bajar un escalón, veinte veces.
• Cuclillas para juntar objetos del piso, veinte veces, una por vez.
Ejercicio 3, el juego con fuerza adentro:
• Carreras en cuclillas, como patos.
• Saltar como rana de un lado al otro de la sala.
• Tira y afloja con una toalla.
• Y la carrera de escaleras, si hay escalera segura.
Progresión:
• Si sale fácil: más repeticiones, saltos más altos, y saltos a un pie con giro.
• Si no sale: menos repeticiones, y saltos desde el piso en lugar de desde un escalón.
Ojo con esto:
Nada de pesas ni de cargas externas a esta edad: el propio peso corporal es lo que corresponde. Superficie que amortigüe para los saltos. Y dolor localizado en la rodilla o en el talón que aparece con la actividad y no se va con el descanso es para evaluar.
Qué mirar:
Si la rodilla se va hacia adentro al aterrizar, si cae con las rodillas rígidas, diferencia entre lados, cuánto aguanta antes de cansarse. Criterio: diez aterrizajes controlados desde el escalón, con las rodillas en línea.
Cuánto y cada cuánto:
Veinte minutos, tres veces por semana, con pausas entre estaciones.
Para la familia:
Plaza, bici, trepar, saltar: una hora de juego activo por día. Eso es el programa de fuerza y no hace falta nada más.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Fuerza y crecimiento: cuidar las rodillas', 'guide', 'Entrenar fuerza en la adolescencia con criterios de seguridad, y reconocer los dolores del crecimiento', '12-14 años', 'Para qué sirve:
En el estirón hay dolores que aparecen por el crecimiento y la carga, sobre todo en la rodilla y en el talón. Entrenar fuerza ayuda, pero con criterios distintos a los de un adulto, y hay que saber cuáles.
Qué necesitás:
Espacio, una silla, un escalón, y una banda elástica si hay.
Cómo se presenta:
Se explica primero qué está pasando en el cuerpo: los huesos crecen más rápido que los músculos, y eso tira en los puntos donde el tendón se inserta. Eso hace entendible el dolor y también el plan.
Ejercicio 1, la fuerza que sí corresponde:
Con el propio peso y técnica cuidada, tres veces por semana.
• Sentadillas con peso corporal, tres series de diez.
• Estocadas hacia atrás, tres series de ocho por pierna.
• Puente de glúteo, tres series de quince.
• Elevaciones de talón, tres series de quince.
• Y bajada controlada de un escalón, tres series de diez por pierna, que es lo que más ayuda en el dolor de rodilla.
Ejercicio 2, la técnica que protege la rodilla:
• Rodilla en línea con el pie, nunca hacia adentro.
• Bajar contando tres segundos.
• Aterrizar de los saltos con las rodillas flexionadas.
• Y movilidad de tobillo, porque el tobillo rígido tira la rodilla hacia adentro.
Ejercicio 3, la carga semanal, que es el factor principal:
Casi todos estos dolores son de sobrecarga.
• Contar las horas semanales de deporte: entrenamientos, partidos, educación física.
• Un día de descanso completo por semana.
• No subir el volumen más de un diez por ciento por semana.
• Y no jugar en dos equipos de lo mismo a la vez.
Progresión:
• Si sale fácil: más repeticiones y más tiempo de bajada controlada, manteniendo el peso corporal como única carga.
• Si no sale: menos rango y menos repeticiones, y bajar las horas semanales de deporte antes que la fuerza.
Ojo con esto:
Dolor justo abajo de la rótula, en el talón, o en la cadera, que aparece con la actividad y mejora con el descanso, es típico de esta etapa y requiere evaluación y ajuste de carga: no se entrena con dolor. Dolor nocturno, hinchazón, fiebre o cojera requieren consulta médica. Y el entrenamiento con pesas se hace con supervisión y con cargas livianas y buena técnica, nunca buscando el máximo.
Qué mirar:
Dónde duele exactamente, si mejora con el descanso, cuántas horas de deporte hace por semana, si la rodilla se va hacia adentro, si hay diferencia entre lados. Criterio: cuatro semanas sin dolor durante la actividad, con la carga ajustada.
Cuánto y cada cuánto:
Tres veces por semana, con un día de descanso entre sesiones.
Para la familia:
El día de descanso semanal no es negociable, y si duele, se para. Un mes de menos deporte ahora vale mucho menos que una lesión que lo saca una temporada.');

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'physiotherapy', 'Fuerza', 'Miembro superior', 'Fuerza de brazos con banda elástica', 'guide', 'Fortalecer hombro y brazo con banda elástica, con dosis y en todas las direcciones', '15+ años', 'Para qué sirve:
La banda elástica permite trabajar el hombro en todas sus direcciones, con carga graduable y sin equipamiento. Es lo mejor que hay para rehabilitación de hombro en casa, y también lo más fácil de hacer mal.
Qué necesitás:
Una banda elástica, y una puerta o un lugar firme donde fijarla.
Cómo se presenta:
La resistencia correcta es la que permite completar las repeticiones con la técnica limpia y termina exigiendo. Si las últimas tres no cuestan, falta resistencia; si la técnica se pierde, sobra.
Ejercicio 1, las rotaciones, que son la base:
Tres series de quince por lado.
• Rotación externa: codo pegado al cuerpo, girar el antebrazo hacia afuera contra la banda.
• Rotación interna: lo mismo hacia adentro.
El codo pegado al cuerpo todo el tiempo: si se despega, el ejercicio cambia.
Ejercicio 2, empujar y tirar:
Tres series de doce.
• Remo: la banda fijada adelante, tirar los codos hacia atrás juntando los omóplatos.
• Empuje: la banda por detrás, empujar los brazos adelante.
• Elevación frontal hasta la altura del hombro, no más.
• Elevación lateral hasta la altura del hombro, con el pulgar hacia arriba.
Ejercicio 3, los omóplatos, que sostienen todo:
• Juntar los omóplatos sin encoger los hombros, sosteniendo cinco segundos, quince veces.
• Con la banda, llevar los brazos hacia atrás desde adelante, tres series de quince.
• Y la W: codos flexionados pegados al cuerpo, abrir contra la banda, tres series de quince.
Progresión:
• Si sale fácil: banda más fuerte, o más repeticiones hasta veinte y después más resistencia.
• Si no sale: banda más liviana, o menos rango. Nunca se compensa con el tronco.
Ojo con esto:
Dolor en la punta del hombro al levantar el brazo por encima del hombro, dolor nocturno, o pérdida de fuerza requieren evaluación. Después de una cirugía de hombro, sólo lo indicado por quien operó, y la rotación suele estar limitada al principio.
Qué mirar:
Si el codo se despega en las rotaciones, si encoge el hombro, si el tronco compensa, fuerza comparada con el otro lado, dolor durante y después. Criterio: tres series de quince con técnica limpia, y ahí se sube la resistencia.
Cuánto y cada cuánto:
Tres veces por semana, con un día de descanso en el medio.
Para casa:
Las rotaciones, tres series de quince, tres veces por semana. Son las que más rinden y las que más se saltean.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro superior', 'Los omóplatos que sostienen el hombro', 'guide', 'Fortalecer la musculatura escapular, que es la base sobre la que se mueve el hombro', '15+ años', 'Para qué sirve:
El hombro se mueve sobre el omóplato, y si el omóplato no está sostenido, el hombro trabaja mal por más fuerza que tenga el brazo. Casi todo dolor de hombro de quien está sentado empieza acá.
Qué necesitás:
Una banda elástica, una pared, y una colchoneta.
Cómo se presenta:
Primero se enseña el movimiento del omóplato, que casi nadie siente: juntar los omóplatos y bajarlos, sin encoger los hombros. Se corrige con la mano apoyada en el omóplato para que lo sienta.
Ejercicio 1, sentir el movimiento:
• Sentado, juntar los omóplatos y sostener cinco segundos, quince veces.
• Juntar y bajar, como guardándolos en los bolsillos de atrás, quince veces.
• Con la espalda en la pared, deslizar los brazos hacia arriba sin despegar la espalda, quince veces.
Ejercicio 2, fuerza con banda:
Tres series de quince.
• Remo bajo, codos pegados al cuerpo.
• Remo alto, codos a la altura del hombro.
• Rotación externa con los codos a noventa grados.
• Y extensión: brazos estirados adelante, llevarlos atrás contra la banda.
Ejercicio 3, en el piso, sin nada:
• Boca abajo, brazos en T, levantar los brazos juntando omóplatos, tres series de doce.
• Brazos en Y, lo mismo.
• Brazos en W, lo mismo.
• Y en cuadrupedia, empujar el piso separando los omóplatos y volver, quince veces.
Progresión:
• Si sale fácil: sumar resistencia y trabajo con el brazo por encima de la cabeza.
• Si no sale: quedarse en sentir el movimiento y en los isométricos, sin banda.
Ojo con esto:
Dolor que aumenta con el ejercicio, o dolor al levantar el brazo por encima del hombro que no mejora en cuatro semanas, requiere evaluación. Y encoger los hombros durante los ejercicios los hace inútiles: se corrige antes de sumar carga.
Qué mirar:
Si el omóplato se despega de la espalda en los ejercicios, si encoge los hombros, si la postura de los hombros cambia, si el dolor baja en cuatro semanas. Criterio: quince repeticiones en el piso sin encoger los hombros.
Cuánto y cada cuánto:
Tres veces por semana. Y el movimiento de juntar omóplatos, diez veces por hora en el trabajo.
Para casa:
Juntar los omóplatos diez veces por hora, y los ejercicios del piso tres veces por semana.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro superior', 'Flexiones adaptadas', 'guide', 'Progresar en el empuje de miembro superior desde la versión más accesible hasta la completa', '15+ años', 'Para qué sirve:
La flexión de brazos es el ejercicio de empuje más completo y no necesita nada, pero la versión completa está muy lejos para la mayoría. La progresión resuelve eso: hay una versión para cada nivel.
Qué necesitás:
Una pared, una mesa, una silla, y el piso.
Cómo se presenta:
Se avanza cuando salen tres series de diez con forma limpia, y forma limpia significa tres cosas: cuerpo derecho, codos cerca, bajada controlada.
Ejercicio 1, la progresión:
Tres series de diez antes de avanzar.
• Contra la pared, parado.
• Con las manos en una mesa.
• Con las manos en una silla.
• De rodillas en el piso.
• Completa, apoyado en punta de pies.
• Con los pies elevados.
Ejercicio 2, lo que hay que mirar en todas:
• El cuerpo derecho, sin que la cadera se hunda ni se levante.
• Los codos cerca del cuerpo, no abiertos a noventa grados.
• Bajar controlado, no dejarse caer.
• Y los omóplatos sostenidos, no despegados.
Ejercicio 3, la parte que fortalece más:
• Tres segundos para bajar y uno para subir. La bajada es lo que da fuerza.
• Y si no se puede subir todavía: bajar controlado desde la posición alta y volver con las rodillas, cinco repeticiones. Así se entrena la fuerza que falta.
Progresión:
• Si sale fácil: bajar un escalón en la lista, o agregar tiempo de bajada, o pies elevados.
• Si no sale: subir un escalón, y trabajar los omóplatos aparte.
Ojo con esto:
Si duele el hombro: codos más cerca del cuerpo, y volver un escalón atrás. Dolor en la punta del hombro o en la muñeca que no cede requiere evaluación. Con dolor de muñeca, se puede hacer apoyado en los puños o en mancuernas.
Qué mirar:
Si la cadera se hunde, si los codos se abren, cuántas repeticiones antes de perder la forma, si duele el hombro o la muñeca. Criterio: tres series de diez con forma limpia en el escalón actual.
Cuánto y cada cuánto:
Tres series, tres veces por semana, con un día de descanso.
Para casa:
El escalón actual, tres series, tres veces por semana. Y contar la bajada, que es gratis y cambia el resultado.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro superior', 'Fuerza de mano y de agarre', 'guide', 'Fortalecer la mano y el agarre, que es indicador de salud general y necesario para la vida diaria', '15+ años', 'Para qué sirve:
La fuerza de agarre se usa en todo (abrir un frasco, cargar bolsas, sostenerse de un pasamanos) y es uno de los indicadores más simples de estado general. Se recupera bien y se entrena con casi nada.
Qué necesitás:
Una pelotita de goma o de tenis, masa o plastilina, una toalla, broches de ropa, y una bolsa con peso.
Cómo se presenta:
Series cortas y frecuentes, porque la mano se cansa rápido. Y con dolor articular, se trabaja sin apretar fuerte: la masa blanda y el rango, antes que la fuerza máxima.
Ejercicio 1, agarre global:
Tres series de quince.
• Apretar la pelotita, sosteniendo tres segundos.
• Retorcer una toalla en los dos sentidos.
• Sostener una bolsa con peso al costado, treinta segundos por mano.
• Y colgarse de una barra, si es posible, diez segundos.
Ejercicio 2, la pinza y los dedos:
• Apretar un broche de ropa entre pulgar e índice, quince veces por dedo.
• Pellizcar masa con cada par de dedos, quince veces.
• Abrir los dedos contra una gomita elástica, veinte veces.
• Tocar el pulgar con cada dedo, veinte veces.
Ejercicio 3, la mano en la vida diaria:
Lo que hay que practicar es lo que se usa.
• Abrir frascos de distintos tamaños.
• Sostener y trasladar objetos de distinto peso.
• Usar la mano no dominante para tareas simples.
• Y escribir o usar herramientas, si eso es lo que necesita.
Progresión:
• Si sale fácil: pelotita más dura, más peso en la bolsa, y más tiempo colgado.
• Si no sale: masa blanda y sin apretar fuerte, con foco en el rango y no en la fuerza.
Ojo con esto:
Con artritis o dolor articular en actividad, no se busca fuerza máxima: se trabaja rango y fuerza suave, y se evita apretar con dolor. Adormecimiento u hormigueo en los dedos requiere evaluación.
Qué mirar:
Fuerza comparada con el otro lado, si puede abrir frascos y sostener peso, si aparece dolor articular, cómo resuelve las tareas de la casa. Criterio: treinta segundos sosteniendo la bolsa con cada mano, y abrir un frasco sin ayuda.
Cuánto y cada cuánto:
Tres veces por semana, series cortas. Y las tareas de la vida diaria, todos los días.
Para casa:
Apretar una pelotita quince veces, tres veces por día. Y abrir él los envases de la cocina.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro superior', 'Fuerza de brazos con el propio peso', 'activity', 'Trabajar fuerza de miembro superior en preadolescentes, con el propio peso y en formato de juego', '10-11 años', 'Para qué sirve:
A los diez u once años la fuerza de brazos se entrena con el propio peso: trepar, colgarse, empujar, arrastrarse. Es lo que hace falta para trepar en la plaza, para los deportes y para no lesionarse el hombro después.
Qué necesitás:
Una barra o un lugar seguro para colgarse, una colchoneta, una pared, y una toalla.
Cómo se presenta:
Se arma como circuito y se cuenta. Nada de pesas: el propio peso es la carga correcta a esta edad. Lo que sí se mira es la técnica, porque los hábitos que se instalan ahora duran años.
Ejercicio 1, colgarse y traccionar:
• Colgarse de la barra, veinte segundos, tres veces.
• Colgarse y encoger las piernas, cinco veces.
• Tracción con los pies apoyados en el piso y la barra baja, tres series de ocho.
• Y tira y afloja con la toalla, tres veces treinta segundos.
Ejercicio 2, empujar:
• Flexiones contra la pared, tres series de diez.
• Flexiones con las manos en una silla, tres series de ocho.
• Carretilla: camina con las manos mientras vos le sostenés las piernas, cinco metros, tres veces.
• Y empujar la pared con las dos manos, veinte segundos, tres veces.
Ejercicio 3, sostener y trasladar:
• Caminar en cuadrupedia diez metros, adelante y atrás.
• Caminar como un cangrejo, diez metros.
• Trasladar objetos con peso de un lado al otro, cinco viajes.
• Y trepar, si hay dónde: es el mejor ejercicio de la lista.
Progresión:
• Si sale fácil: más tiempo colgado, tracciones con menos ayuda de las piernas, y flexiones más bajas.
• Si no sale: menos tiempo y menos repeticiones, con más apoyo.
Ojo con esto:
Barra firme y colchoneta abajo, y un adulto presente. Nada de pesas a esta edad ni de buscar el máximo. Dolor en el hombro o en el codo que se repite requiere evaluación antes de seguir.
Qué mirar:
Cuánto tiempo se cuelga, si puede sostener el cuerpo derecho en la cuadrupedia, diferencia entre lados, si aparece dolor. Criterio: veinte segundos colgado y tres series de ocho flexiones en la silla.
Cuánto y cada cuánto:
Veinte minutos, tres veces por semana, con pausas.
Para la familia:
La plaza con trepadoras, dos veces por semana. Trepar hace todo esto junto y no necesita ningún plan.'),

  (null, 'physiotherapy', 'Fuerza', 'Core', 'Core sin abdominales clásicos', 'guide', 'Fortalecer el tronco con ejercicios de sostén, sin flexiones repetidas de columna', '15+ años', 'Para qué sirve:
El core no sirve para tener abdominales: sirve para sostener la columna mientras el resto del cuerpo se mueve. Y para eso los ejercicios de sostén funcionan mejor que las flexiones repetidas, que además cargan los discos.
Qué necesitás:
Una colchoneta. Nada más.
Cómo se presenta:
Todos estos ejercicios son de sostener posición, no de repetir. La regla es que la columna no se mueve: si se mueve, se acortó el tiempo o se bajó la exigencia.
Ejercicio 1, los tres básicos:
Tres series, sosteniendo el tiempo indicado.
• Plancha frontal apoyada en antebrazos, veinte a treinta segundos.
• Plancha lateral, veinte segundos por lado.
• Puente de glúteo sostenido, treinta segundos.
Ejercicio 2, la antirrotación y la antiextensión:
Lo que más se usa en la vida real.
• Muerto boca arriba: brazos y piernas arriba, bajar un brazo y la pierna opuesta sin que la espalda se despegue. Diez por lado.
• Cuadrupedia: estirar brazo y pierna opuestos y sostener cinco segundos, diez por lado.
• Y de rodillas, empujando una pared de costado con la mano, sin girar el tronco, veinte segundos por lado.
Ejercicio 3, lo que hay que mirar en todos:
• La espalda baja no se arquea: la panza sostiene.
• La respiración sigue: si hay que aguantar el aire, es demasiado.
• El cuerpo en línea, sin cadera hundida ni levantada.
• Y se para cuando la forma se pierde, no cuando se acaba el tiempo.
Progresión:
• Si sale fácil: más tiempo, hasta sesenta segundos, y después variantes con menos apoyo.
• Si no sale: plancha con rodillas apoyadas, menos tiempo, y el muerto con las piernas apoyadas.
Ojo con esto:
Dolor en la espalda baja durante los ejercicios indica que la técnica o la exigencia no corresponden: se baja. Con hernia de disco o dolor irradiado, el plan lo define quien trata el caso, y las flexiones repetidas de columna suelen estar contraindicadas.
Qué mirar:
Si la espalda se arquea, si aguanta la respiración, cuánto tiempo sostiene con forma limpia, si el dolor de espalda baja en cuatro semanas. Criterio: treinta segundos de plancha con la columna quieta y respirando.
Cuánto y cada cuánto:
Tres series, tres veces por semana.
Para casa:
Plancha y puente, tres series, tres veces por semana. Cinco minutos.'),

  (null, 'physiotherapy', 'Fuerza', 'Core', 'La plancha, con las variantes que sirven', 'guide', 'Hacer la plancha con técnica correcta y elegir la variante adecuada al nivel', '15+ años', 'Para qué sirve:
La plancha es el ejercicio de core más usado y el que peor se hace: cadera hundida, aguantando la respiración y contando un minuto que no sirve. Con técnica y con la variante adecuada, es de los mejores que hay.
Qué necesitás:
Una colchoneta, y una pared o una silla para las variantes.
Cómo se presenta:
Se elige la variante donde pueda sostener veinte segundos con la forma limpia, y se trabaja ahí. Veinte segundos bien valen más que un minuto mal, y esa frase conviene decirla.
Ejercicio 1, la técnica, antes de la variante:
• Antebrazos apoyados, codos abajo de los hombros.
• Cuerpo en línea recta de la cabeza a los talones.
• La panza sostenida y la espalda baja sin arquearse.
• El glúteo apretado.
• Y la respiración sigue: si hay que aguantarla, es demasiado.
Ejercicio 2, la escalera de variantes:
Veinte a treinta segundos, tres series, antes de avanzar.
• Plancha con las manos en una mesa o una silla, parado.
• Plancha con las rodillas apoyadas.
• Plancha completa en antebrazos.
• Plancha lateral con la rodilla apoyada.
• Plancha lateral completa.
• Plancha con un pie o una mano levantada.
Ejercicio 3, las variantes con movimiento:
Cuando la posición ya se sostiene.
• Plancha con toque de hombro alternado, diez por lado.
• Plancha con paso lateral de un pie, diez por lado.
• Plancha con subida a las manos, ocho veces.
Progresión:
• Si sale fácil: más tiempo hasta sesenta segundos, después variantes con movimiento o con menos apoyo.
• Si no sale: subir un escalón, o bajar a diez segundos con forma limpia.
Ojo con esto:
Dolor en la espalda baja significa que la cadera está hundida o que la variante es demasiada: se corrige o se sube un escalón. Dolor de hombro o de muñeca: apoyarse en antebrazos y revisar la posición de los codos. En embarazo y posparto, esto se adapta y conviene consultar.
Qué mirar:
Si la cadera se hunde o se levanta, si aguanta la respiración, cuántos segundos con forma limpia, si aparece dolor lumbar. Criterio: treinta segundos en la variante actual con la línea del cuerpo mantenida.
Cuánto y cada cuánto:
Tres series, tres veces por semana. No hace falta más.
Para casa:
La variante actual, tres series, tres veces por semana. Con reloj, y parando cuando la forma se cae.'),

  (null, 'physiotherapy', 'Fuerza', 'Core', 'Respirar bien es parte de la fuerza del core', 'guide', 'Coordinar la respiración diafragmática con la activación del core, que es la base de todo el trabajo de tronco', '15+ años', 'Para qué sirve:
El core no es sólo la pared abdominal: incluye el diafragma arriba y el piso pelviano abajo. Si la respiración es de pecho y el diafragma no participa, el sistema no funciona y ninguna plancha lo arregla.
Qué necesitás:
Una colchoneta, y una mano libre para sentir.
Cómo se presenta:
Se empieza acostado, sintiendo con las manos, y se pasa a sentado y de pie. Sin esta base, el resto del trabajo de core rinde mucho menos, y conviene explicarlo así.
Ejercicio 1, la respiración diafragmática, acostado:
• Una mano en la panza y otra en el pecho: al tomar aire por la nariz se mueve la de la panza.
• Diez respiraciones, con la espiración más larga que la inspiración.
• Después con las manos en los costados de las costillas: las costillas también se abren.
Ejercicio 2, coordinar la respiración con el movimiento:
• Espirar al hacer el esfuerzo: al subir en el puente, al levantar la pierna, al empujar.
• Inspirar al volver.
• Diez repeticiones de puente con la respiración coordinada.
• Y el muerto boca arriba, espirando al bajar el brazo y la pierna.
Ejercicio 3, activar sin aguantar el aire:
Este es el error más común en todo el trabajo de core.
• Sostener una plancha de veinte segundos contando en voz alta: si no puede contar, está aguantando la respiración.
• Lo mismo en el puente.
• Y en cualquier ejercicio de sostén: contar en voz alta como control.
Progresión:
• Si sale fácil: llevar la coordinación a todos los ejercicios de fuerza, y sumar trabajo de piso pelviano si corresponde.
• Si no sale: quedarse acostado con las manos, sin agregar movimiento.
Ojo con esto:
Si hay pérdidas de orina con el esfuerzo, sensación de peso en el piso pelviano, o diástasis abdominal después de un embarazo, corresponde una evaluación específica de piso pelviano antes de progresar con el core.
Qué mirar:
Si mueve la panza o el pecho, si las costillas se abren, si aguanta la respiración en los ejercicios, si puede contar en voz alta mientras sostiene. Criterio: diez respiraciones diafragmáticas acostado y una plancha de veinte segundos contando en voz alta.
Cuánto y cada cuánto:
Cinco minutos, todos los días. Y la coordinación, en todos los ejercicios de fuerza.
Para casa:
Diez respiraciones con la mano en la panza antes de dormir. Y no aguantar el aire en ningún esfuerzo.'),

  (null, 'physiotherapy', 'Fuerza', 'Core', 'Espalda que duele de estar sentado', 'guide', 'Aliviar y prevenir el dolor lumbar de origen postural, con movimiento, fuerza y cambios en el día', '15+ años', 'Para qué sirve:
La espalda que duele al final del día de trabajo casi nunca necesita reposo: necesita moverse más seguido, un poco de fuerza y algunos cambios concretos en el puesto. El reposo prolongado empeora este cuadro.
Qué necesitás:
Una silla, una colchoneta, y una alarma en el celular.
Cómo se presenta:
Se ordena en tres partes: qué hacer en el momento del dolor, qué hacer todos los días, y qué cambiar en el puesto de trabajo. Las tres, porque una sola no alcanza.
Ejercicio 1, en el momento, para aliviar:
• Caminar cinco minutos. Es lo que más alivia y lo que menos se hace.
• Gato y camello, diez veces.
• Rodillas al pecho, treinta segundos.
• Extensión suave boca abajo apoyado en los codos, treinta segundos.
• Y rodillas a los lados, veinte veces.
Ejercicio 2, la fuerza, tres veces por semana:
• Puente de glúteo, tres series de quince.
• Plancha en la variante que corresponda, tres series de veinte segundos.
• Cuadrupedia con brazo y pierna opuestos, tres series de diez por lado.
• Sentadillas con peso corporal, tres series de diez.
• Y remo con banda, tres series de quince.
Ejercicio 3, el puesto y el día:
Lo que más cambia el resultado.
• Levantarse cada cuarenta y cinco minutos, con alarma. Dos minutos de pie o caminando.
• Pantalla a la altura de los ojos, pies apoyados, espalda apoyada.
• Alternar posiciones: sentado, de pie, caminando.
• Y caminar treinta minutos por día.
Progresión:
• Si sale fácil: sumar carga a la fuerza y volver a la actividad física completa.
• Si no sale: bajar la exigencia de fuerza y priorizar el movimiento frecuente, que es lo que más alivia.
Ojo con esto:
Dolor que baja por la pierna con adormecimiento u hormigueo, pérdida de fuerza en la pierna, dificultad para orinar, pérdida de sensibilidad en la zona genital, fiebre, pérdida de peso o dolor nocturno que no cambia con la posición requieren consulta médica sin demora.
Qué mirar:
En qué momento del día duele, si alivia con el movimiento o con el reposo, si hay dolor irradiado, cuántas pausas hace de verdad. Criterio: dos semanas con las pausas hechas y el dolor del final del día más bajo.
Cuánto y cada cuánto:
Los de alivio, cuando duele y una vez por día. Los de fuerza, tres veces por semana. Las pausas, cada cuarenta y cinco minutos.
Para casa:
La alarma cada cuarenta y cinco minutos y la caminata de treinta minutos. Esas dos cosas hacen la mayor parte.'),

  (null, 'physiotherapy', 'Fuerza', 'Core', 'El core del adolescente que está todo el día sentado', 'guide', 'Trabajar tronco y postura en adolescentes con muchas horas de silla y de pantalla', '12-14 años', 'Para qué sirve:
Siete horas de liceo, más los deberes, más la pantalla: la espalda de un adolescente aguanta hoy más horas sentado que la de muchos adultos. El dolor de espalda a esta edad ya es frecuente, y se trabaja igual que en un adulto pero con otro formato.
Qué necesitás:
Una colchoneta, una banda elástica si hay, y el celular para la alarma.
Cómo se presenta:
Se le enseña a él y se le explica para qué: no es postura por estética, es que la espalda va a doler menos y va a rendir más en el deporte. Con eso se consigue que lo haga.
Ejercicio 1, la rutina de cinco minutos, todos los días:
• Gato y camello, diez veces.
• Puente de glúteo, quince.
• Plancha en la variante que le salga, tres veces veinte segundos.
• Cuadrupedia con brazo y pierna opuestos, diez por lado.
• Y juntar los omóplatos, quince veces.
Ejercicio 2, lo que compensa la silla:
• Elongación de pectoral en el marco de la puerta, treinta segundos por lado.
• Elongación de psoas de rodillas, treinta segundos por lado.
• Retracción de cuello, diez veces.
• Y la toalla enrollada a lo largo de la columna, dos minutos.
Ejercicio 3, el día, que es lo que más pesa:
• Levantarse cada cuarenta y cinco minutos mientras estudia, con alarma.
• La mochila con las dos tiras y pegada al cuerpo, no colgando de un hombro.
• Pantalla a la altura de los ojos, y no el celular sobre la panza.
• Y una hora de actividad física por día, que es la indicación general para esta edad.
Progresión:
• Si sale fácil: sumar carga a la fuerza y sostener la rutina solo, sin recordatorios.
• Si no sale: tres ejercicios en lugar de cinco, elegidos por él.
Ojo con esto:
Dolor de espalda que despierta de noche, que no cambia con la posición, que viene con fiebre o pérdida de peso, o dolor que baja por la pierna con adormecimiento requiere consulta médica. Y una curva visible en la espalda o una asimetría de hombros requiere evaluación: la escoliosis se detecta en esta etapa.
Qué mirar:
Cuándo aparece el dolor, cuántas horas sentado y cuántas de actividad física, cómo lleva la mochila, si hay asimetrías al mirar la espalda flexionada hacia adelante. Criterio: dos semanas con la rutina hecha cinco días y las pausas puestas.
Cuánto y cada cuánto:
Cinco minutos, todos los días. Y las pausas mientras estudia.
Para la familia:
La alarma de las pausas y la hora de actividad física por día. Y mirar la mochila: cuánto pesa y cómo la lleva.');

-- ─── Equilibrio y marcha ────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'physiotherapy', 'Equilibrio y marcha', 'Propiocepción', 'Entrenar el equilibrio en casa', 'guide', 'Entrenar equilibrio con una progresión segura y medible, sin equipamiento', '15+ años', 'Para qué sirve:
El equilibrio se pierde con la inactividad y se recupera entrenándolo, y en adultos mayores es lo que previene caídas. La progresión es conocida y se puede seguir en casa, con una silla al lado.
Qué necesitás:
Una silla firme o la mesada de la cocina para apoyo, un almohadón, y cronómetro.
Cómo se presenta:
Siempre con algo firme al alcance de la mano, incluso cuando ya no lo necesita. Se mide el punto de partida en segundos y se anota: el número es lo que muestra el progreso.
Ejercicio 1, la progresión, treinta segundos por escalón:
Se avanza cuando sostiene treinta segundos sin apoyo.
• Pies juntos, ojos abiertos.
• Pies juntos, ojos cerrados.
• Un pie adelante del otro, ojos abiertos.
• Un pie adelante del otro, ojos cerrados.
• Un pie solo, ojos abiertos.
• Un pie solo, ojos cerrados.
Ejercicio 2, superficie inestable:
Se vuelve dos escalones atrás y se repite sobre el almohadón.
• Pies juntos sobre el almohadón.
• Un pie adelante del otro.
• Un pie solo.
Ejercicio 3, equilibrio con una tarea encima:
• En un pie, girando la cabeza a los lados.
• En un pie, contando hacia atrás desde veinte.
• Caminar en línea recta poniendo un pie delante del otro, diez pasos.
• Caminar y girar la cabeza a la señal.
• Y levantarse de la silla sin manos, diez veces.
Progresión:
• Si sale fácil: superficie inestable con tarea agregada, y caminar en terreno irregular.
• Si no sale: bajar un escalón, con las dos manos apoyadas, y aumentar la frecuencia.
Ojo con esto:
Siempre con apoyo al alcance y sin nada en el piso alrededor. Los ejercicios con ojos cerrados, con alguien presente. Mareo, vértigo, caídas previas, o inestabilidad que apareció de golpe requieren evaluación médica: no todo desequilibrio se entrena.
Qué mirar:
Segundos en cada escalón, diferencias entre lados, si aparece mareo, si tiene miedo a caerse (que por sí mismo aumenta el riesgo), cuántas veces se levanta de la silla en treinta segundos. Criterio: treinta segundos en el escalón actual sin apoyo, y ahí se avanza.
Cuánto y cada cuánto:
Cinco a diez minutos, todos los días. La frecuencia importa más que la duración.
Para casa:
El escalón actual mientras se lava los dientes o espera que hierva el agua. Con la mesada al alcance.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Propiocepción', 'La almohada, el mejor equipo que hay en casa', 'guide', 'Usar un almohadón como superficie inestable para entrenar propiocepción sin equipamiento', '15+ años', 'Para qué sirve:
Las superficies inestables de gimnasio no hacen nada que un almohadón no haga. Un almohadón firme cambia la información que llega del pie y obliga a trabajar los ajustes, que es lo que se busca.
Qué necesitás:
Un almohadón firme, o dos apilados. Una silla al lado para apoyo.
Cómo se presenta:
Se prueba primero de pie sobre el almohadón con los dos pies y con apoyo de la mano, y de ahí se sube. La regla: el apoyo se suelta cuando la posición ya no tambalea.
Ejercicio 1, la progresión sobre el almohadón:
Treinta segundos por escalón.
• Los dos pies, con las dos manos apoyadas.
• Los dos pies, con una mano.
• Los dos pies, sin manos.
• Los dos pies, ojos cerrados.
• Un pie, con apoyo.
• Un pie, sin apoyo.
Ejercicio 2, movimiento sobre la superficie inestable:
• Sobre el almohadón, elevaciones de talón, quince.
• Sentadillas poco profundas, diez.
• Pasar el peso de un pie al otro, veinte veces.
• Y en un pie, dibujar un círculo en el aire con el otro pie.
Ejercicio 3, con tarea agregada:
• En un pie sobre el almohadón, pasarse una pelota de mano en mano.
• Girar la cabeza a los lados.
• Contar hacia atrás.
• Y recibir y devolver una pelota, diez pases.
Progresión:
• Si sale fácil: dos almohadones apilados, un pie con los ojos cerrados, y saltos con aterrizaje sobre el almohadón si la indicación lo permite.
• Si no sale: sacar el almohadón y trabajar en piso firme hasta que la progresión de piso esté completa.
Ojo con esto:
Almohadón firme y no un colchón blando que hunda el pie. Silla o mesada al alcance de la mano. Los ojos cerrados, con alguien cerca. Con vértigo, neuropatía o pérdida de sensibilidad en los pies, esto se evalúa antes.
Qué mirar:
Segundos por escalón, comparación entre lados, si tambalea siempre hacia el mismo lado, si aparece mareo. Criterio: treinta segundos en un pie sobre el almohadón, de los dos lados.
Cuánto y cada cuánto:
Cinco minutos, todos los días.
Para casa:
El almohadón al lado de la mesada, y el escalón actual mientras se cocina o se lava los platos.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Propiocepción', 'Equilibrio para adultos mayores, sin riesgo', 'guide', 'Entrenar equilibrio y fuerza para prevenir caídas, con medidas de seguridad y revisión del entorno', '15+ años', 'Para qué sirve:
Una caída puede cambiar la vida de una persona mayor, y el entrenamiento de equilibrio y fuerza es una de las pocas intervenciones que la previenen de verdad. Pero se entrena con seguridad y junto con la revisión de la casa.
Qué necesitás:
Una silla firme con respaldo, una mesada, calzado cerrado y con suela que agarre.
Cómo se presenta:
Siempre con apoyo al alcance y con calzado, nunca con medias en el piso. Se combina equilibrio con fuerza de piernas, porque la fuerza es la otra mitad de la prevención de caídas.
Ejercicio 1, equilibrio, con apoyo al alcance:
Treinta segundos por escalón, sin soltar la seguridad.
• Pies juntos.
• Un pie adelante del otro.
• Un pie solo, con la mano cerca del apoyo.
• Caminar diez pasos poniendo un pie delante del otro, al lado de la mesada.
• Y caminar girando la cabeza a los lados, diez metros.
Ejercicio 2, fuerza de piernas, que es la otra mitad:
• Levantarse de la silla sin manos, tres series de diez. Se cuenta cuántas hace en treinta segundos y se anota.
• Elevaciones de talón con apoyo, tres series de quince.
• Subir y bajar un escalón con apoyo, diez por pierna.
• Marcha con rodillas altas en el lugar, veinte pasos.
Ejercicio 3, la casa, que es donde se cae:
Esta parte previene más que los ejercicios.
• Sacar alfombras suelta y cables del paso.
• Luz en el pasillo y al lado de la cama, para la noche.
• Agarraderas en el baño y alfombra antideslizante en la ducha.
• Calzado cerrado adentro de la casa, nada de pantuflas flojas ni medias.
• Y las cosas de uso diario al alcance, sin subirse a sillas.
Progresión:
• Si sale fácil: menos apoyo, superficie inestable con supervisión, y caminata diaria más larga.
• Si no sale: más apoyo, sentado si hace falta, y priorizar la fuerza de levantarse de la silla.
Ojo con esto:
Caídas previas, mareo, vértigo, cambios de medicación, visión que empeoró o pérdida de sensibilidad en los pies requieren evaluación médica: son causas tratables de caídas. Nunca se entrena equilibrio sin apoyo al alcance ni con la persona sola en la casa.
Qué mirar:
Cuántas veces se levanta de la silla en treinta segundos, segundos de equilibrio en cada escalón, miedo a caerse, cuántas caídas o casi caídas en el último mes, qué calzado usa. Criterio: más repeticiones de levantarse de la silla y treinta segundos en el escalón actual.
Cuánto y cada cuánto:
Diez minutos, todos los días. Y la caminata diaria, treinta minutos si es posible.
Para la familia:
La revisión de la casa, hecha una vez y bien. Y la caminata acompañada, que además sostiene la rutina.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Propiocepción', 'Después del yeso: recuperar el pie', 'guide', 'Recuperar movilidad, fuerza y propiocepción después de una inmovilización', '15+ años', 'Para qué sirve:
Después de semanas de yeso o de bota el tobillo está rígido, el músculo atrofiado y la propiocepción perdida, y las tres cosas se recuperan en ese orden. Empezar por la fuerza sin recuperar movilidad no funciona.
Qué necesitás:
Una toalla, una banda elástica, un escalón, un almohadón, y la indicación médica de cuánto peso puede apoyar.
Cómo se presenta:
Lo primero es saber qué autorizó el médico: carga total, carga parcial o sin carga. Todo lo que sigue se ajusta a eso, y la piel después del yeso necesita cuidado: crema y sin fricción fuerte.
Ejercicio 1, movilidad, primera etapa:
Varias veces por día, sin dolor.
• Bombeo de tobillo, treinta veces.
• Círculos en los dos sentidos, veinte.
• Punta y talón, veinte.
• Con la toalla, tirar la punta del pie hacia uno, treinta segundos, tres veces.
• Y mover los dedos, abrirlos y cerrarlos, veinte veces.
Ejercicio 2, fuerza, segunda etapa:
Cuando la movilidad mejoró y con carga autorizada.
• Con banda, las cuatro direcciones, tres series de quince.
• Elevaciones de talón con las dos piernas, tres series de quince.
• A una pierna, cuando tolere, tres series de diez.
• Y el pie corto, diez veces, para la musculatura intrínseca.
Ejercicio 3, propiocepción, tercera etapa:
Es la que casi siempre se saltea y la que evita la recaída.
• Apoyo en un pie, treinta segundos, tres veces.
• Con los ojos cerrados, veinte segundos.
• Sobre el almohadón, treinta segundos.
• Caminar en línea, diez pasos.
• Y caminar en terreno irregular, cuando esté seguro.
Progresión:
• Si sale fácil: sumar carga, saltos con aterrizaje controlado, y el gesto del deporte o del trabajo.
• Si no sale: volver a la etapa anterior. Hinchazón o dolor al día siguiente indican que se avanzó rápido.
Ojo con esto:
La carga la autoriza quien trata la lesión. Dolor que aumenta, hinchazón que crece, calor y enrojecimiento, o dolor en la pantorrilla con hinchazón requieren consulta inmediata. Y la piel después del yeso está frágil: crema, sin raspar.
Qué mirar:
Rango comparado con el otro lado, hinchazón al final del día, fuerza en elevaciones de talón, segundos de equilibrio en un pie, cómo camina. Criterio: rango y fuerza equiparados al lado sano, y treinta segundos en un pie.
Cuánto y cada cuánto:
Movilidad, tres veces por día. Fuerza y propiocepción, una vez por día.
Para casa:
El bombeo de tobillo muchas veces por día, y el apoyo en un pie cuando ya esté autorizado. Y la pierna elevada si hay hinchazón.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Propiocepción', 'El chico que se cae mucho', 'game', 'Trabajar equilibrio y propiocepción en niños que se caen o se golpean seguido, con juegos', '3-5 años', 'Para qué sirve:
Un chico de tres o cuatro años que se cae más que el resto, se choca con todo o no se anima a las trepadoras suele necesitar trabajo de equilibrio y de información del cuerpo. Y a esta edad eso se hace jugando o no se hace.
Qué necesitás:
Almohadones, colchoneta, cinta de papel, aros, una tabla baja, y espacio.
Cómo se presenta:
Todo como recorrido de aventura, con vos al lado. Superficie blanda abajo, y la mano disponible sin ofrecerla: que la busque si la necesita.
Ejercicio 1, superficies que se mueven:
• Caminar sobre almohadones, cinco metros.
• Caminar sobre una colchoneta blanda.
• Pasar de un almohadón a otro con separación.
• Y quedarse parado sobre un almohadón, contando hasta cinco.
Ejercicio 2, equilibrio en un pie y en línea:
• Caminar por una línea de cinta, con los brazos abiertos.
• Quedarse en un pie, como flamenco, contando hasta tres.
• Caminar en puntas de pie, cinco metros.
• Saltar dentro de tres aros seguidos.
• Y las posturas de animales: el perro, el flamenco, el árbol.
Ejercicio 3, información del cuerpo, que es la otra mitad:
Actividades de carga y presión, que dan mucha información propioceptiva.
• Empujar una silla con almohadones, de un lado al otro.
• Gatear por un túnel de sillas.
• Rodar por la colchoneta.
• Saltar de un escalón bajo y caer con las rodillas flexionadas.
• Y trepar, si hay dónde, que es el mejor de todos.
Progresión:
• Si sale fácil: superficies más inestables, un pie más tiempo, y una tabla baja.
• Si no sale: superficies firmes, distancias cortas, y de la mano.
Ojo con esto:
Un chico que se cae mucho puede simplemente estar en su etapa, y también puede haber otra cosa. Si hay caídas que aumentan, torpeza que empeora, pérdida de habilidades que ya tenía, dolor, cojera o asimetría entre lados, corresponde derivación médica antes de seguir.
Qué mirar:
Segundos en un pie, si se cae siempre para el mismo lado, si evita las superficies inestables, si mira el piso todo el tiempo, si hay asimetría entre lados. Criterio: tres segundos en un pie de cada lado y el recorrido de almohadones sin caerse.
Cuánto y cada cuánto:
Quince minutos, tres veces por semana.
Para la familia:
Plaza todos los días: trepar, hamacas, tobogán, caminar por bordes bajos. Eso es el tratamiento, y no hace falta nada más.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Reeducación de la marcha', 'Volver a caminar parejo', 'guide', 'Recuperar un patrón de marcha simétrico después de una lesión o una inmovilización', '15+ años', 'Para qué sirve:
Después de una lesión la marcha queda cambiada, y esa asimetría se mantiene incluso cuando ya no hay dolor: se vuelve costumbre. Y una marcha asimétrica carga de más la otra pierna y la espalda.
Qué necesitás:
Un pasillo de diez metros, un espejo si hay, cinta para marcar, y un celular para filmar.
Cómo se presenta:
Se filma la marcha antes de empezar, de frente y de costado, y se mira juntos. Verse caminar cambia más rápido el patrón que cualquier indicación verbal.
Ejercicio 1, las partes de la marcha, por separado:
• Apoyo del talón: caminar exagerando el apoyo del talón primero, diez metros.
• Despegue del pie: caminar empujando con los dedos al final del paso, diez metros.
• Longitud del paso: caminar pisando marcas de cinta iguales, diez metros.
• Y el peso: pararse en un pie y después en el otro, sintiendo la diferencia.
Ejercicio 2, la marcha completa, con foco:
Una vuelta por cada consigna, diez metros.
• Pasos del mismo largo los dos.
• El mismo tiempo apoyado en cada pierna.
• Los brazos acompañando, alternando con las piernas.
• La mirada adelante, no en el piso.
Ejercicio 3, variaciones que exigen más:
• Caminar más rápido, diez metros.
• Caminar hacia atrás.
• Caminar y girar a la señal.
• Subir y bajar un escalón alternando.
• Y caminar por terreno irregular, si es posible.
Progresión:
• Si sale fácil: más velocidad, distancias largas, y terreno irregular o con pendiente.
• Si no sale: distancias más cortas con apoyo, y trabajar fuerza de la pierna afectada aparte.
Ojo con esto:
Si el patrón asimétrico es por dolor, el dolor se trata primero: pedirle que camine parejo con dolor no funciona. Y si hay debilidad marcada, adormecimiento o una asimetría que apareció sin lesión previa, corresponde evaluación médica.
Qué mirar:
Largo del paso de cada lado, tiempo de apoyo en cada pierna, si apoya el talón, si la cadera cae al apoyar, si hay cojera. Criterio: la filmación comparada a las cuatro semanas, con pasos de largo parecido.
Cuánto y cada cuánto:
Quince minutos, cinco días por semana. Y caminar treinta minutos por día.
Para casa:
Diez metros de ida y vuelta con una consigna por día, antes de la caminata. Y filmarse una vez por semana.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Reeducación de la marcha', 'Usar el bastón del lado correcto', 'guide', 'Enseñar el uso correcto del bastón: lado, altura y secuencia, que casi siempre se usan mal', '15+ años', 'Para qué sirve:
El bastón mal usado no sirve o empeora: del lado equivocado no descarga nada, y a la altura equivocada carga el hombro. Son tres cosas (lado, altura y secuencia) y las tres se corrigen en una sesión.
Qué necesitás:
El bastón de la persona, un pasillo, y una escalera con pasamanos.
Cómo se presenta:
Se revisan las tres cosas en orden, y se practica hasta que la secuencia salga sin pensar. Es de las intervenciones más rápidas y más agradecidas que hay.
Ejercicio 1, las tres cosas que hay que revisar:
• El lado: el bastón va del lado contrario a la pierna que duele o está débil. Si duele la rodilla derecha, el bastón va en la mano izquierda.
• La altura: parado con los brazos al costado, el puño del bastón queda a la altura de la muñeca. Así el codo queda con una flexión de unos veinte grados.
• Y el estado: la goma de la punta gastada hace que el bastón resbale. Se revisa y se cambia.
Ejercicio 2, la secuencia, practicada en el pasillo:
• En llano: bastón y pierna débil avanzan juntos, después la pierna fuerte.
• Diez metros, ida y vuelta, cinco veces, hasta que salga sin pensar.
• Y con la mirada adelante, no en el piso.
Ejercicio 3, escaleras, que es donde se cae:
La regla que hay que memorizar: la pierna fuerte sube primero y baja última.
• Para subir: pierna fuerte, después bastón y pierna débil.
• Para bajar: bastón y pierna débil, después pierna fuerte.
• Y la mano libre en el pasamanos, siempre.
Se practica con supervisión hasta que salga.
Progresión:
• Si sale fácil: evaluar si todavía necesita el bastón, o si alcanza para distancias largas solamente.
• Si no sale: evaluar si corresponde un andador en lugar del bastón, que da más base.
Ojo con esto:
Si el bastón no alcanza para caminar seguro, el dispositivo correcto es otro: eso se evalúa, no se compensa. Y las caídas, los casi caídas y el miedo a caerse se preguntan explícitamente en cada control.
Qué mirar:
De qué lado lo usa, la altura, la secuencia en llano y en escaleras, la goma de la punta, si se siente seguro. Criterio: la secuencia correcta en llano y en escalera, sin recordatorio.
Cuánto y cada cuánto:
Una sesión para enseñarlo, y revisión en cada control. La práctica, todos los días al caminar.
Para la familia:
Revisar la goma de la punta cada tanto, y no apurar el paso cuando camina acompañado.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Reeducación de la marcha', 'Caminar con andador, bien', 'guide', 'Enseñar el uso correcto del andador: altura, secuencia, giros y escalones', '15+ años', 'Para qué sirve:
El andador da más base que el bastón, y mal usado es una fuente de caídas: la persona lo empuja demasiado lejos y camina detrás de él, o se para de más. Se corrige con altura y secuencia.
Qué necesitás:
El andador de la persona, un pasillo, una silla, y espacio para girar.
Cómo se presenta:
Primero la altura, después la secuencia, y por último los giros y las transferencias, que es donde ocurren las caídas.
Ejercicio 1, la altura y la posición del cuerpo:
• Parado con los brazos al costado, el puño del andador a la altura de la muñeca.
• El cuerpo adentro del andador, no detrás: los pies entre las patas de atrás.
• La espalda derecha, no inclinada hacia adelante.
• Y las ruedas o las gomas revisadas.
Ejercicio 2, la secuencia:
• Adelantar el andador una distancia corta, un paso.
• Después la pierna débil.
• Después la pierna fuerte.
• Y nunca adelantar el andador tan lejos que haya que inclinarse para alcanzarlo.
Diez metros, ida y vuelta, cinco veces.
Ejercicio 3, los giros y las transferencias:
Acá se cae la gente.
• Girar con pasos cortos alrededor, sin cruzar los pies y sin girar el cuerpo primero.
• Sentarse: llegar de espaldas a la silla hasta sentirla en las piernas, una mano por vez al apoyabrazos, y bajar controlado.
• Levantarse: al revés, empujando de los apoyabrazos de la silla y no del andador.
• Y los escalones: con andador no se suben escalones sin entrenamiento y supervisión.
Progresión:
• Si sale fácil: evaluar si puede pasar a bastón, y trabajar fuerza de piernas para eso.
• Si no sale: revisar si el andador es el adecuado, y sumar apoyo de una persona en los traslados.
Ojo con esto:
Nunca se tira del andador para levantarse: se apoya en la silla. Los frenos de un andador con ruedas se ponen antes de sentarse. Alfombras sueltas y cables fuera del camino, y la casa revisada.
Qué mirar:
Altura, si camina adentro del andador, si se inclina, cómo gira, cómo se sienta y se levanta, cuántas caídas o casi caídas hubo. Criterio: giro y transferencia a la silla hechos con la técnica correcta, sin ayuda.
Cuánto y cada cuánto:
Una sesión para enseñarlo y práctica diaria. Revisión en cada control.
Para la familia:
Los frenos antes de sentarse, y no levantarlo tirándole de los brazos. Y la casa despejada.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Reeducación de la marcha', 'Caminar más y mejor', 'guide', 'Aumentar la cantidad y la calidad de la caminata diaria, de forma progresiva y sostenible', '15+ años', 'Para qué sirve:
Caminar es la actividad con mejor relación entre lo que cuesta y lo que deja, y la mayoría de los problemas empiezan por caminar poco. Lo que hace falta no es motivación: es una progresión razonable y una medida.
Qué necesitás:
Un calzado adecuado, y el celular o un reloj para medir.
Cómo se presenta:
Se mide primero lo que camina hoy, sin cambiar nada, durante una semana. Y se sube desde ahí: subir demasiado rápido es lo que hace que abandone o que se lesione.
Ejercicio 1, medir el punto de partida:
• Una semana anotando minutos de caminata por día, o pasos si tiene cuenta pasos.
• Se promedia.
• Y se anota cómo queda al día siguiente.
Ejercicio 2, la progresión, diez por ciento por semana:
• Subir un diez por ciento por semana sobre el promedio.
• Una semana de mantenimiento cada cuatro, sin subir.
• Y una meta razonable: treinta minutos por día, cinco días por semana.
Si un día se pasa, el siguiente se baja: la constancia importa más que el récord.
Ejercicio 3, la calidad de la caminata:
• Postura: mirada adelante, hombros sueltos, brazos acompañando.
• Ritmo: el que permite hablar pero no cantar.
• Terreno: llano al principio, después subidas y terreno irregular.
• Y el calzado, que es lo que más se descuida: suela con agarre y sin más de setecientos kilómetros.
Progresión:
• Si sale fácil: sumar subidas, intervalos de ritmo más rápido, y distancia.
• Si no sale: dividir en dos caminatas más cortas por día, que suman lo mismo y cuestan menos.
Ojo con esto:
Dolor en el pecho, falta de aire desproporcionada, mareo o dolor en las piernas que aparece siempre a la misma distancia y se va con el reposo requieren consulta médica antes de aumentar la carga. Y el dolor articular que aumenta al día siguiente indica que se subió demasiado rápido.
Qué mirar:
Minutos o pasos por semana, cómo está al día siguiente, si el dolor aparece siempre a la misma distancia, qué calzado usa y cuántos kilómetros tiene. Criterio: cuatro semanas sosteniendo la meta semanal sin dolor al día siguiente.
Cuánto y cada cuánto:
La meta acordada, cinco días por semana, con el registro semanal.
Para casa:
El registro en el celular y una caminata a la misma hora todos los días. El horario fijo sostiene más que las ganas.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Reeducación de la marcha', 'El chico que camina en puntas de pie', 'guide', 'Abordar la marcha en puntas en niños, con criterios de observación y de derivación', '3-5 años', 'Para qué sirve:
Caminar en puntas es frecuente en chicos chicos y muchas veces es un hábito que se resuelve, pero también puede tener causas que requieren evaluación. Esta guía sirve para saber qué se observa, qué se trabaja y cuándo hay que derivar.
Qué necesitás:
Espacio para caminar, un escalón, una colchoneta, y cinta para marcar.
Cómo se presenta:
Primero se observa y se mide, y en función de eso se decide. Antes de cualquier ejercicio hay que saber si el talón llega al piso en forma pasiva: eso cambia todo el plan.
Ejercicio 1, lo que hay que observar y medir:
• ¿Camina en puntas todo el tiempo o a veces?
• ¿Puede apoyar el talón si se lo pide?
• Con la rodilla estirada, ¿el tobillo llega a flexión neutra en forma pasiva? Esto se mide.
• ¿Es simétrico en los dos pies?
• ¿Cómo está el desarrollo motor en general, y el lenguaje?
Ejercicio 2, qué se trabaja si el rango pasivo está:
• Movilidad de tobillo: rodilla a la pared con talón apoyado, diez veces, tres series.
• Talón en el escalón, dejándolo caer, treinta segundos, tres veces.
• Caminar en talones, diez metros, tres veces.
• Caminar en cuclillas.
• Subir una rampa o una pendiente, que obliga a apoyar el talón.
• Y jugar en posiciones que exigen flexión de tobillo: en cuclillas, trepando.
Ejercicio 3, lo que ayuda en el día:
• Andar descalzo en superficies distintas.
• Calzado con contrafuerte firme y no muy flexible.
• Juegos de empujar, saltar y trepar, que dan información propioceptiva.
• Y evitar las correcciones verbales constantes, que no cambian el patrón y desgastan a todos.
Progresión:
• Si sale fácil: más tiempo en las posiciones que exigen flexión de tobillo, y rampas más pronunciadas.
• Si no sale: no se insiste con el rango. Se deriva y se espera la evaluación antes de seguir.
Ojo con esto:
Corresponde derivación médica si la marcha en puntas es persistente después de los dos o tres años, si hay limitación para llevar el tobillo a neutro, si es asimétrica, si hay pérdida de habilidades ya adquiridas, si hay retraso motor o del lenguaje, o si hay rigidez o debilidad. La marcha en puntas puede ser idiopática, pero también puede acompañar condiciones neurológicas u ortopédicas que hay que descartar.
Qué mirar:
Porcentaje del tiempo que camina en puntas, rango pasivo de tobillo medido, simetría, desarrollo motor general. Criterio: rango pasivo neutro alcanzado y apoyo de talón en la mayor parte de la marcha.
Cuánto y cada cuánto:
Diez a quince minutos, tres veces por semana, con juego.
Para la familia:
Los juegos en cuclillas y de trepar, la rampa, y no corregir hablando. Y la consulta médica si aparece cualquiera de las señales de arriba.');

-- ─── Pautas para casa ───────────────────────────────────────────────────────

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'La rutina de cinco minutos', 'guide', 'Sostener una rutina mínima diaria, que es la que se hace de verdad', '15+ años', 'Para qué sirve:
Una rutina de cuarenta minutos se abandona en dos semanas. Una de cinco minutos se sostiene, y cinco minutos todos los días rinden más que cuarenta una vez por semana. Esta es la rutina mínima y es la que se indica primero.
Qué necesitás:
Nada. Un lugar donde pararse y, si hay, una colchoneta.
Cómo se presenta:
Se elige el momento del día antes de elegir los ejercicios: el momento es lo que hace que se haga. Y se engancha a algo que ya pasa todos los días: después de lavarse los dientes, antes del café, después de la ducha.
Ejercicio 1, la rutina, cinco ejercicios:
Una serie de cada uno, cinco minutos en total.
• Gato y camello, diez veces.
• Puente de glúteo, quince veces.
• Sentadillas con peso corporal o levantarse de la silla, diez veces.
• Elevaciones de talón, quince veces.
• Y juntar los omóplatos, quince veces.
Ejercicio 2, las reglas que la hacen sostenible:
• Siempre en el mismo momento y en el mismo lugar.
• Si un día sale sólo la mitad, vale.
• No se agregan ejercicios hasta que la rutina lleve un mes hecha.
• Y se anota con una cruz en un calendario: ver la fila de cruces sostiene más de lo que parece.
Ejercicio 3, cómo crece, si se sostuvo un mes:
• Se suman repeticiones antes de sumar ejercicios.
• Después una segunda serie.
• Y después un ejercicio nuevo, uno solo.
Progresión:
• Si sale fácil: dos series, y después la rutina de diez minutos.
• Si no sale: tres ejercicios en lugar de cinco. Y si tampoco, uno: el que más le sirva.
Ojo con esto:
Si algún ejercicio duele, se cambia por otro, no se aguanta. Y si hay una indicación específica por una lesión, esa manda sobre esta rutina general.
Qué mirar:
Cuántos días de la semana la hizo, si el momento elegido funcionó, si aparece dolor en alguno, si después de un mes puede crecer. Criterio: cinco días por semana durante un mes, y ahí se agrega algo.
Cuánto y cada cuánto:
Cinco minutos, todos los días, en el mismo momento.
Para casa:
El calendario con las cruces, pegado donde se ve. Es la parte del tratamiento que más se subestima.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'Diez minutos al levantarse', 'guide', 'Armar una rutina de movilidad para la mañana, cuando el cuerpo está más rígido', '15+ años', 'Para qué sirve:
La rigidez de la mañana es de las molestias más comunes, y diez minutos de movilidad al levantarse la cambian. No es entrenamiento: es soltar el cuerpo antes de empezar el día.
Qué necesitás:
La cama, y un lugar para pararse.
Cómo se presenta:
Se empieza en la cama, todavía acostado, porque es donde el cuerpo está más rígido y donde hay menos excusa para no hacerlo. Después se pasa a de pie.
Ejercicio 1, en la cama, antes de levantarse:
Diez repeticiones de cada una.
• Bombeo de tobillos.
• Rodillas al pecho, de a una y las dos.
• Rodillas flexionadas cayendo a los lados.
• Brazos por encima de la cabeza y volver.
• Estirarse entero, como un bostezo, tres veces.
Ejercicio 2, sentado en el borde de la cama:
• Círculos de cuello suaves a cada lado, cinco.
• Juntar los omóplatos, diez.
• Rotar el tronco a cada lado, diez.
• Y estirar una pierna adelante con el talón en el piso, treinta segundos por lado.
Ejercicio 3, de pie:
• Caminar por la casa dos minutos.
• Elevaciones de talón, quince.
• Sentadilla poco profunda, diez.
• Extensión suave de espalda, manos en la cintura, diez.
• Y elongación de gemelo en la pared, treinta segundos por lado.
Progresión:
• Si sale fácil: sumar fuerza a la rutina de la mañana, o pasar la fuerza a otro momento del día.
• Si no sale: sólo la parte de la cama, que ya cambia bastante la primera hora.
Ojo con esto:
Si la rigidez de la mañana dura más de una hora, viene con hinchazón de varias articulaciones, o se acompaña de cansancio marcado, corresponde evaluación médica: puede no ser mecánica.
Qué mirar:
Cuánto dura la rigidez de la mañana, si la rutina la acorta, cuántos días la hizo, cómo está la primera hora del día. Criterio: dos semanas con la rutina hecha y la rigidez matinal más corta.
Cuánto y cada cuánto:
Diez minutos, todos los días, al levantarse.
Para casa:
Empezar en la cama, antes de poner los pies en el piso. Así no hay que decidir nada.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'Moverse en un día de oficina', 'guide', 'Distribuir movimiento a lo largo de una jornada sentada, con pausas y ejercicios breves', '15+ años', 'Para qué sirve:
Ocho horas sentado no se compensan con una hora de gimnasio: lo que hace daño es el tiempo continuo sentado. Lo que cambia el resultado es interrumpirlo seguido, y eso se puede planificar.
Qué necesitás:
Una alarma en el celular, y la silla y el escritorio que ya tiene.
Cómo se presenta:
Se arma el día con horarios concretos, no con la intención de moverse más. La alarma cada cuarenta y cinco minutos es la intervención principal y la que más resultado da.
Ejercicio 1, la pausa de dos minutos, cada cuarenta y cinco:
Con alarma, y se elige una de estas.
• Caminar hasta la cocina o hasta la ventana.
• Diez sentadillas o diez veces levantarse de la silla.
• Diez elevaciones de talón y diez de omóplatos.
• Extensión de espalda de pie, diez veces.
• Y retracción de cuello, diez veces.
Ejercicio 2, lo que se hace sentado y no se nota:
• Retracción de cuello, diez veces por hora.
• Juntar los omóplatos, diez veces por hora.
• Bombeo de tobillos, veinte veces por hora.
• Apretar el glúteo, diez veces.
• Y girar el tronco a cada lado, cinco veces.
Ejercicio 3, el puesto de trabajo:
Se revisa una vez y queda resuelto.
• Pantalla a la altura de los ojos.
• Codos apoyados a noventa grados, muñecas rectas.
• Pies apoyados y planos; si no llegan, un apoyapiés o una caja.
• Espalda apoyada en el respaldo.
• Y el teléfono no se sostiene con el hombro.
Progresión:
• Si sale fácil: sumar caminata en los almuerzos, o parte de la jornada de pie si es posible.
• Si no sale: la alarma cada hora en lugar de cada cuarenta y cinco, que sigue sirviendo.
Ojo con esto:
Dolor que baja por la pierna o por el brazo con adormecimiento requiere evaluación y no se resuelve con pausas. Y el dolor que empeora todas las semanas, aunque sea leve, hay que mirarlo antes de que se instale.
Qué mirar:
Cuántas pausas hace de verdad, cómo está al final del día, si el puesto quedó acomodado, cuántas horas continuas sentado. Criterio: dos semanas con al menos seis pausas por jornada, y el final del día mejor.
Cuánto y cada cuánto:
Dos minutos cada cuarenta y cinco, toda la jornada. Y el puesto revisado una vez.
Para casa:
La alarma puesta hoy, antes de salir de la sesión. Si no se pone en el momento, no se pone nunca.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'Cómo sentarse y levantarse sin lastimarse', 'guide', 'Enseñar la técnica de las transferencias, que son los movimientos más repetidos del día', '15+ años', 'Para qué sirve:
Sentarse y levantarse se hace treinta o cuarenta veces por día, y hecho mal es una fuente constante de carga para la espalda y la rodilla. Es el movimiento que más rinde corregir, porque se repite todo el día.
Qué necesitás:
Una silla firme con respaldo, una cama, y espacio.
Cómo se presenta:
Se practica con la silla y la cama reales de la persona, no con una silla de consultorio. Y se corrige mostrando: la técnica se copia mejor de lo que se explica.
Ejercicio 1, levantarse de la silla:
• Los pies bien apoyados, uno un poco más adelante que el otro.
• Acercarse al borde de la silla.
• Inclinar el tronco adelante, la nariz sobre los dedos de los pies.
• Empujar con las piernas, sin tirar con los brazos.
• Diez repeticiones, tres series.
Ejercicio 2, sentarse:
• Llegar de espaldas hasta sentir la silla en las piernas.
• Una mano por vez al apoyabrazos, si hace falta.
• Bajar controlado, contando tres, con el tronco adelante.
• Nada de dejarse caer, que es lo que más carga la columna.
• Diez repeticiones.
Ejercicio 3, de la cama y del piso:
• De la cama: girar de costado, bajar las piernas, empujar con el brazo de abajo hasta sentarse. Y al acostarse, al revés.
• Del piso: pasar por la posición de rodillas, apoyar una mano, subir una pierna y levantarse. Cinco veces.
• Y si hay dificultad, hacerlo al lado de una silla firme.
Progresión:
• Si sale fácil: sin usar las manos, y desde sillas más bajas.
• Si no sale: silla más alta, con apoyabrazos, y con las manos. Y trabajar fuerza de piernas aparte.
Ojo con esto:
Si no puede levantarse sin manos de una silla común, la prioridad es fuerza de piernas: ése es un indicador importante de riesgo de caída y de pérdida de autonomía. Y con prótesis de cadera hay rangos que respetar según lo indicado.
Qué mirar:
Cuántas veces se levanta de la silla en treinta segundos, si tira con los brazos, si se deja caer al sentarse, si puede levantarse del piso. Criterio: diez repeticiones sin manos, y levantarse del piso sin ayuda.
Cuánto y cada cuánto:
Tres series de diez, tres veces por semana. Y la técnica, todo el día.
Para casa:
Levantarse sin manos cada vez que se levanta, todo el día. Es ejercicio gratis y suma cuarenta repeticiones diarias.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'Cómo levantar peso sin lastimarse', 'guide', 'Enseñar la técnica para levantar y trasladar cargas, y qué decisiones tomar antes de levantar', '15+ años', 'Para qué sirve:
Levantar mal es una de las formas más comunes de lastimarse la espalda, y la mayor parte se resuelve con tres decisiones tomadas antes de agarrar el peso. La técnica importa; la decisión de no levantarlo solo, más.
Qué necesitás:
Cajas de distinto peso y tamaño, y espacio.
Cómo se presenta:
Se practica con cajas reales, de varios pesos, incluida una que sea demasiado pesada para que ejercite decir que no. Practicar con una caja vacía no enseña nada.
Ejercicio 1, las tres decisiones antes de levantar:
• ¿Se puede dividir en dos viajes?
• ¿Se puede acercar el objeto antes de levantarlo?
• ¿Hace falta otra persona o un carro?
Y una regla: si hay que preguntarse si se puede solo, no se levanta solo.
Ejercicio 2, la técnica:
• Pies separados, uno un poco adelante.
• Acercarse al objeto, pegado al cuerpo.
• Flexionar rodillas y caderas, la espalda recta y no redondeada.
• Agarre firme con las dos manos.
• Empujar con las piernas al subir, y espirar.
• Y el objeto pegado al cuerpo todo el camino.
Practicar diez levantadas con la caja mediana.
Ejercicio 3, los movimientos que lastiman:
Se practican bien, porque son los reales.
• Girar con el peso: nada de girar el tronco, se giran los pies.
• Levantar desde el piso hacia un estante alto: en dos tiempos, apoyando en una mesa en el medio.
• Sacar algo del baúl del auto: apoyar una mano, acercar la carga al borde primero.
• Y levantar a un chico: flexionando las piernas y pegado al cuerpo.
Progresión:
• Si sale fácil: cargas más pesadas con técnica sostenida, y fuerza específica de piernas y espalda.
• Si no sale: bajar el peso y trabajar fuerza antes de exigir técnica con carga.
Ojo con esto:
Dolor repentino al levantar, con o sin dolor irradiado a la pierna, requiere evaluación. Y la técnica no vuelve segura una carga que es demasiado pesada: eso es lo primero que hay que decir.
Qué mirar:
Si redondea la espalda, si acerca el objeto, si gira con el peso, si evalúa antes de levantar. Criterio: diez levantadas con técnica correcta y una carga rechazada por ser demasiada.
Cuánto y cada cuánto:
Una sesión para enseñarlo, y práctica en las situaciones reales de su trabajo o su casa.
Para casa:
La regla de los dos viajes, y pedir ayuda cuando corresponde. Es lo que más lesiones evita.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'Moverse con un chico, todos los días', 'guide', 'Armar un programa de movimiento diario para un niño, con la familia y sin formato de ejercicio', '6-7 años', 'Para qué sirve:
En niños el programa de casa es donde pasa la mayor parte del trabajo, y un programa de casa con formato de ejercicio no se hace. Lo que se sostiene es el juego activo diario, con dos o tres cosas específicas adentro.
Qué necesitás:
Nada comprado. Una pelota, una cuerda, tiza, y una plaza cerca si hay.
Cómo se presenta:
Se acuerda con la familia un rato fijo por día y dos o tres objetivos específicos que van adentro del juego. La familia no tiene que dirigir un entrenamiento: tiene que sostener el rato.
Ejercicio 1, el rato diario, sin formato de ejercicio:
Treinta a sesenta minutos por día, repartidos.
• Plaza: trepar, hamacas, tobogán, colgarse.
• Bici, monopatín, patines.
• Pelota: pases, patear, encestar.
• Correr, saltar, la mancha, la rayuela, las escondidas.
Ejercicio 2, los objetivos adentro del juego:
Se eligen según el caso, y se anotan en un papel para la familia.
• Si necesita equilibrio: caminar por bordes bajos, un pie en la vereda.
• Si necesita fuerza de piernas: saltar, trepar, escaleras.
• Si necesita brazos: colgarse, carretilla, trepar.
• Si necesita coordinación: pelota, saltar la soga.
Ejercicio 3, lo que hace que se sostenga:
• Un horario fijo, siempre el mismo.
• Con alguien de la familia, no solo.
• Y una planilla con una cruz por día, que la marca el chico.
• Nada de convertirlo en tarea: si se vuelve obligación, se pierde.
Progresión:
• Si sale fácil: sumar una actividad organizada (un deporte, natación) dos veces por semana.
• Si no sale: quince minutos por día, y elegidos por él. Quince es mucho mejor que cero.
Ojo con esto:
Si hay una condición médica, una indicación específica o dolor, el programa se ajusta a eso. Y si aparece dolor que se repite en el mismo lugar, se consulta antes de seguir.
Qué mirar:
Cuántos días por semana se hizo, qué actividades eligió, si aparece dolor o cansancio desproporcionado, si mejoran los objetivos elegidos. Criterio: cinco días por semana durante un mes, con la planilla marcada.
Cuánto y cada cuánto:
Treinta a sesenta minutos por día, repartidos en el día.
Para la familia:
El horario fijo y la planilla. Y la plaza, que hace todo esto junto sin que nadie tenga que organizar nada.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Cuidados post-lesión', 'Qué hacer las primeras 72 horas', 'guide', 'Manejar una lesión aguda de partes blandas en los primeros tres días, y saber cuándo consultar', '15+ años', 'Para qué sirve:
Lo que se hace en los primeros tres días después de un esguince o una distensión cambia bastante la recuperación. Y varias de las cosas que se hacen por costumbre (reposo total, calor, masaje fuerte) no corresponden en esta etapa.
Qué necesitás:
Hielo o gel frío, una venda elástica, almohadas, y un lugar para elevar la zona.
Cómo se presenta:
Se explican las cuatro medidas y las cuatro cosas que no van, que es la parte que casi nadie sabe. Y se aclara que el reposo es relativo y no absoluto: moverse suave, dentro del dolor tolerable, ayuda.
Ejercicio 1, las cuatro medidas de los primeros días:
• Protección: evitar el movimiento que duele y la carga que no tolera, sin inmovilizar del todo.
• Hielo: veinte minutos, con un paño entre el hielo y la piel, cada dos o tres horas, los primeros dos días.
• Compresión: venda elástica firme pero sin cortar la circulación, si hay hinchazón.
• Elevación: la zona por encima del nivel del corazón, varias veces por día.
Ejercicio 2, el movimiento que sí va:
El reposo absoluto retrasa la recuperación.
• Movilidad suave sin dolor, varias veces por día: bombeo de tobillo, flexión y extensión sin carga.
• Contracciones isométricas suaves, si no duelen.
• Y caminar lo que tolere, si es un miembro inferior y la carga está permitida.
Ejercicio 3, lo que no va en las primeras 72 horas:
• Calor, que aumenta la hinchazón.
• Masaje fuerte sobre la zona.
• Alcohol, que aumenta el sangrado y la hinchazón.
• Y volver a la actividad deportiva.
Progresión:
• Si sale fácil: a partir del tercer o cuarto día, movilidad progresiva y carga según tolerancia.
• Si no sale: si a las 72 horas el dolor y la hinchazón no bajaron nada, hay que evaluar.
Ojo con esto:
Corresponde consulta médica si no puede apoyar el peso, si hay deformidad evidente, si hubo un chasquido audible con inestabilidad, si el dolor es muy intenso o está localizado en el hueso, si hay adormecimiento, o si la hinchazón es muy grande y rápida. Y en pantorrilla, hinchazón con dolor y calor requiere descartar una trombosis.
Qué mirar:
Dolor y hinchazón en el tiempo, si puede apoyar el peso, rango de movimiento, color y temperatura de la zona. Criterio: a las 72 horas, dolor y hinchazón que empezaron a bajar.
Cuánto y cada cuánto:
Hielo veinte minutos cada dos o tres horas los dos primeros días. Movilidad suave, varias veces por día.
Para casa:
La zona elevada cada vez que se está sentado, y el hielo con el reloj. Nada de calor los primeros días.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Cuidados post-lesión', 'Frío o calor, cuál va cuándo', 'guide', 'Decidir entre frío y calor según la etapa y el tipo de problema, con tiempos y precauciones', '15+ años', 'Para qué sirve:
Es la pregunta que más se hace y la que más se contesta mal. La regla no es complicada: frío para lo agudo y para la hinchazón, calor para la rigidez y la contractura sin inflamación.
Qué necesitás:
Hielo o gel frío, bolsa de agua caliente o gel calentable, y paños.
Cómo se presenta:
Se decide con dos preguntas: ¿cuánto tiempo pasó desde que empezó? ¿hay hinchazón, calor o enrojecimiento? Con esas dos alcanza para elegir en la mayoría de los casos.
Ejercicio 1, cuándo va frío:
• Lesión aguda, primeras 48 a 72 horas.
• Hinchazón, calor o enrojecimiento de la zona.
• Después de una actividad que carga una zona que suele hincharse.
• En un brote de dolor articular con inflamación.
Cómo: veinte minutos, con un paño entre el hielo y la piel, cada dos o tres horas.
Ejercicio 2, cuándo va calor:
• Rigidez, sobre todo la de la mañana.
• Contractura muscular sin inflamación.
• Dolor crónico de cuello o de espalda que alivia con calor.
• Antes de la actividad o del estiramiento, para ganar rango.
Cómo: quince a veinte minutos, tibio y no caliente, con un paño de por medio.
Ejercicio 3, lo que no va, nunca:
• Hielo o calor directo sobre la piel, sin paño.
• Dormirse con la bolsa de agua caliente o con la almohadilla eléctrica.
• Calor sobre una zona inflamada, hinchada o recién lesionada.
• Frío o calor sobre una zona con la sensibilidad alterada.
• Y más de veinte minutos en cualquiera de los dos casos.
Progresión:
• Si sale fácil: usar frío después de la actividad y calor antes, que es la combinación más útil en dolor crónico.
• Si no sale: si ninguno alivia, el problema no es el que se pensaba y conviene reevaluar.
Ojo con esto:
Con diabetes, neuropatía, problemas de circulación o pérdida de sensibilidad en la zona, el frío y el calor requieren consulta previa: el riesgo de quemadura o de lesión de la piel es real y no se siente.
Qué mirar:
Si alivia y cuánto dura el alivio, el estado de la piel después, si hay hinchazón, si la persona tiene sensibilidad conservada en la zona. Criterio: alivio que dura más allá del momento de la aplicación.
Cuánto y cada cuánto:
Veinte minutos por aplicación, con dos horas de separación. Nunca más de eso.
Para casa:
Frío en lo nuevo e hinchado, calor en lo rígido y viejo. Y siempre con un paño de por medio y con reloj.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Cuidados post-lesión', 'Volver al deporte sin recaer', 'guide', 'Definir criterios objetivos para volver a la actividad deportiva después de una lesión', '15+ años', 'Para qué sirve:
La recaída casi siempre viene de volver antes o volver de golpe. Y la decisión de volver no se toma por el tiempo transcurrido ni por la ausencia de dolor: se toma con criterios que se pueden medir.
Qué necesitás:
Espacio para correr y saltar, cronómetro, y el registro de la evolución.
Cómo se presenta:
Se explican los criterios antes de que la persona pregunte cuándo puede volver, porque la respuesta es esa lista y no una fecha. Y se acuerda que la vuelta es progresiva y con etapas.
Ejercicio 1, los criterios para empezar a volver:
Todos, no algunos.
• Sin dolor en la vida diaria y sin hinchazón.
• Rango de movimiento igual al del lado sano.
• Fuerza al menos al noventa por ciento del lado sano, medida.
• Capacidad de correr, saltar y frenar sin dolor ni miedo.
• Y el gesto específico del deporte, hecho sin dolor.
Ejercicio 2, las pruebas que se pueden hacer:
Comparando siempre con el lado sano.
• Salto a una pierna, distancia. Se acepta menos del diez por ciento de diferencia.
• Saltos repetidos a una pierna en treinta segundos, contando.
• Elevaciones de talón a una pierna hasta el fallo, comparando el número.
• Y correr veinte metros y frenar, sin dolor y sin dudar.
Ejercicio 3, la vuelta progresiva, por etapas:
Cada etapa, al menos dos o tres sesiones antes de avanzar.
• Entrenamiento individual sin contacto ni cambios de dirección.
• Con cambios de dirección y a velocidad progresiva.
• Entrenamiento con el grupo, sin contacto.
• Entrenamiento completo.
• Y partido, primero una parte y después completo.
Progresión:
• Si sale fácil: avanzar una etapa cada dos o tres sesiones, con control de la respuesta al día siguiente.
• Si no sale: volver una etapa. Dolor o hinchazón al día siguiente es el indicador para bajar.
Ojo con esto:
Volver con dolor, o con el miedo de que la zona se va a lesionar de nuevo, aumenta el riesgo real de recaída: el miedo es un criterio y hay que preguntarlo. Y la altísima mayoría de las recaídas ocurre en las primeras semanas de la vuelta.
Qué mirar:
Diferencia entre lados en las pruebas, dolor e hinchazón al día siguiente de cada etapa, confianza en el gesto, cuántas semanas pasaron. Criterio: menos del diez por ciento de diferencia entre lados y las cinco condiciones cumplidas.
Cuánto y cada cuánto:
Las pruebas, una vez por semana. Las etapas, dos o tres sesiones cada una.
Para casa:
Anotar cómo está al día siguiente de cada entrenamiento. Es el dato que decide si se avanza o se espera.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Cuidados post-lesión', 'Qué esperar de la recuperación', 'guide', 'Dar expectativas realistas sobre tiempos y forma de la recuperación, y qué hacer con las recaídas', '15+ años', 'Para qué sirve:
Casi toda la angustia en una recuperación viene de no saber qué es normal. Saber que el dolor sube y baja, que hay días peores sin que nada haya empeorado, y cuánto puede tardar, cambia cómo se atraviesa.
Qué necesitás:
Una hoja para el registro semanal.
Cómo se presenta:
Se explica la forma de la curva antes de que aparezcan los días malos, porque después de un día malo la conversación es otra. Y se deja por escrito, porque lo hablado se olvida.
Ejercicio 1, la forma de la recuperación:
• No es una línea que baja: es una línea que baja con subidas.
• Un día peor no significa que algo se rompió.
• Lo que importa es la tendencia de las semanas, no el día.
• Y los primeros avances suelen ser rápidos, y los últimos, lentos.
Ejercicio 2, los tiempos, dichos de frente:
Con rangos, no con fechas exactas.
• Contractura muscular: días a dos semanas.
• Esguince leve: dos a cuatro semanas. Moderado, cuatro a ocho.
• Distensión muscular: dos a seis semanas según el grado.
• Tendinopatía: tres meses o más, y mejora con carga progresiva y no con reposo.
• Fractura: seis a doce semanas para el hueso, y después la rehabilitación.
• Posoperatorio: según la cirugía, y lo dice quien operó.
Ejercicio 3, el registro y las recaídas:
• Una línea por semana: dolor del 0 al 10, qué pudo hacer, qué no.
• Una recaída: se baja un escalón en la carga, no se para todo.
• Y se avisa si el dolor sube y se mantiene arriba más de una semana.
Progresión:
• Si sale fácil: se avanza en la carga según el plan.
• Si no sale: si a las cuatro semanas no hay ningún cambio en la tendencia, corresponde reevaluar el diagnóstico y el plan.
Ojo con esto:
Se consulta antes si aparece dolor nocturno que no cede con la posición, fiebre, pérdida de peso, adormecimiento o pérdida de fuerza, o si el dolor cambia de carácter. Un tiempo esperado no es una promesa: cada persona tiene su curso.
Qué mirar:
La tendencia semanal del dolor y de la función, qué actividades recuperó, si la persona entiende la forma de la curva, si tiene miedo de moverse. Criterio: registro semanal completo y tendencia que baja a lo largo de un mes.
Cuánto y cada cuánto:
Una línea de registro por semana, y revisión en cada consulta.
Para casa:
El registro de una línea por semana, pegado en la heladera. Y la frase que conviene dejar: un día malo no borra tres semanas buenas.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Cuidados post-lesión', 'La cicatriz y cómo tratarla', 'guide', 'Cuidar una cicatriz quirúrgica o traumática con movilización, hidratación y protección solar', '15+ años', 'Para qué sirve:
Una cicatriz adherida limita el movimiento de la zona y puede doler meses. El trabajo sobre la cicatriz es simple, se hace en casa, y cambia bastante el resultado final, tanto funcional como estético.
Qué necesitás:
Crema hidratante neutra o aceite, protector solar, y las manos.
Cómo se presenta:
No se toca la cicatriz hasta que esté completamente cerrada y con el alta de quien operó: nada de esto va antes. Cuando está cerrada, se trabaja todos los días y en poco tiempo.
Ejercicio 1, hidratación y masaje, cuando ya está cerrada:
Dos veces por día, cinco minutos.
• Crema neutra o aceite, en cantidad generosa.
• Masaje en círculos sobre la cicatriz, con presión suave al principio.
• Masaje a lo largo y a lo ancho de la cicatriz.
• Y despegar la piel suavemente, tomándola entre los dedos y moviéndola sobre el plano profundo.
Ejercicio 2, la movilidad de la zona:
La cicatriz se adhiere cuando la zona no se mueve.
• Movilidad de la articulación cercana, en todo el rango permitido.
• Estiramiento suave de la piel en las direcciones opuestas a la cicatriz.
• Y el movimiento funcional de la zona, varias veces por día.
Ejercicio 3, la protección, que es lo que más se descuida:
• Protector solar en la cicatriz durante al menos un año: el sol la oscurece de forma permanente.
• Ropa que no roce ni apriete la zona.
• Y nada de arrancar costras ni de productos sin indicación.
Progresión:
• Si sale fácil: más presión en el masaje y más rango en la movilidad.
• Si no sale: menos presión. La cicatriz no tiene que doler ni enrojecerse después del masaje.
Ojo con esto:
Enrojecimiento que aumenta, calor, dolor creciente, secreción o mal olor son signos de infección y requieren consulta inmediata. Una cicatriz que se engruesa, se eleva y crece más allá de sus bordes requiere evaluación médica: hay tratamientos específicos y cuanto antes, mejor.
Qué mirar:
Color, altura y ancho de la cicatriz, si se mueve sobre los planos profundos, si limita el rango de la articulación cercana, si duele o pica. Criterio: cicatriz que se desplaza sobre los planos profundos y no limita el rango.
Cuánto y cada cuánto:
Cinco minutos, dos veces por día, durante los primeros meses.
Para casa:
La crema y el masaje después de la ducha, dos veces por día, y el protector solar todos los días. Es de las tareas más simples y más efectivas.');
