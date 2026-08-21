-- Materiales escritos para Hilo, no heredados del v1.
--
-- El v1 traía 45, y repartidos de una forma que dejaba dos profesiones enteras
-- sin nada: psicomotricidad en cero y fisioterapia en cero. Una psicomotricista
-- que se registraba abría la biblioteca y no veía un solo material.
--
-- Este archivo llena esos huecos y empareja el resto. Se carga aparte de
-- materials.generated.sql porque aquel se genera desde legacy/index.html y no se
-- edita a mano; este sí es escrito, y se edita acá.
--
-- Convenciones del contenido, iguales a las del generado:
--   Una línea corta terminada en dos puntos se ve como subtítulo.
--   El resto son párrafos.
--   Las viñetas empiezan con •
--
-- Sin rayas ni guiones largos en el texto que lee la persona.
--
-- practitioner_id en null es lo que los hace compartidos: la política de lectura
-- de materials deja ver esas filas a todo el mundo, y ninguna política de
-- escritura permite tocarlas.

insert into materials
  (practitioner_id, discipline, area, focus, title, kind, objective, age_range, content)
values
  (null, 'psychomotricity', 'Esquema corporal', 'Reconocimiento', 'El cuerpo dibujado en el piso', 'activity', 'Reconocer y nombrar las partes del cuerpo sobre la propia silueta', '3-5 años', 'Qué necesitás:
Papel de kiosco o varias hojas pegadas, marcadores gruesos.
Cómo se hace:
El chico se acuesta sobre el papel y vos dibujás su contorno. Después se levanta y mira su silueta de cuerpo entero.
Consignas para ir dándole:
• Pintá dónde va la cabeza.
• Poné dos ojos y una boca.
• Dibujá las manos. ¿Cuántos dedos tiene cada una?
• Marcá dónde tenés las rodillas.
Para observar:
Si salteás una parte y no la reclama, anotalo. Las que no aparecen suelen ser las que todavía no integró.'),

  (null, 'psychomotricity', 'Esquema corporal', 'Reconocimiento', 'Simón dice, versión cuerpo', 'game', 'Localizar partes del cuerpo por consigna verbal, sin modelo visual', '3-5 años', 'Cómo se juega:
Das la consigna sin hacerla vos. Si mirás tu propia mano, el chico copia en vez de buscar en su cuerpo.
Consignas en orden de dificultad:
• Tocate la nariz.
• Tocate una oreja.
• Tocate el codo.
• Tocate el codo con la otra mano.
• Tocate la rodilla derecha.
Cuándo parar:
Cuando empieza a dudar mucho o a mirarte buscando la respuesta. Ahí ya está trabajando de más y conviene volver una consigna atrás.'),

  (null, 'psychomotricity', 'Esquema corporal', 'Imagen corporal', 'El espejo que copia', 'activity', 'Ajustar la propia postura tomando otro cuerpo como referencia', '6-7 años', 'Cómo se hace:
Se paran uno enfrente del otro. Vos hacés una postura y la sostenés. El chico la copia y la sostiene también.
Empezá simple:
Un brazo arriba. Las dos manos en la cintura. Un pie adelante.
Después complicá:
Brazo derecho arriba y mano izquierda en la rodilla. Sentado con las piernas cruzadas y los brazos abiertos.
Y después se dan vuelta los roles:
Que proponga él y copies vos. Ahí se ve si puede sostener una postura mientras mira si la estás haciendo bien.'),

  (null, 'psychomotricity', 'Esquema corporal', 'Imagen corporal', 'Cómo me veo, cómo me dibujo', 'worksheet', 'Comparar la representación gráfica del cuerpo con el cuerpo real', '6-7 años', 'Consigna:
Dibujate de cuerpo entero en una hoja. Tomate el tiempo que quieras.
Después del dibujo, mirar juntos:
• ¿Están las dos manos? ¿Cuántos dedos tienen?
• ¿El cuello une la cabeza con el cuerpo?
• ¿Los brazos salen de los hombros?
• ¿Las piernas llegan al piso?
Sin corregir el dibujo:
La idea no es que quede lindo. Es que mire su dibujo y su cuerpo y encuentre las diferencias solo.
Para guardar:
Repetí la misma consigna dentro de tres meses y compará los dos dibujos.'),

  (null, 'psychomotricity', 'Equilibrio', 'Estático', 'La estatua de un pie', 'game', 'Sostener el equilibrio sobre una base de apoyo reducida', '3-5 años', 'Cómo se juega:
Suena música y bailan. Cuando la música para, hay que quedarse quieto en un pie hasta que vuelva a sonar.
Progresión:
• Un pie, con los brazos abiertos.
• Un pie, con los brazos pegados al cuerpo.
• Un pie, contando hasta cinco en voz alta.
• Un pie, con los ojos cerrados.
Ojo con esto:
Los ojos cerrados es mucho más difícil de lo que parece. Si se tambalea enseguida, quedate en el paso anterior unas cuantas sesiones.'),

  (null, 'psychomotricity', 'Equilibrio', 'Estático', 'Aguantar la pose', 'activity', 'Mantener posturas variadas con control postural sostenido', '6-7 años', 'Cómo se hace:
Elegís una postura, la sostiene diez segundos, descansa, y va la siguiente.
Las posturas:
• El árbol: un pie apoyado en la pantorrilla contraria, manos juntas arriba.
• La tabla: apoyado en manos y punta de pies, cuerpo derecho.
• El avión: un pie en el piso, el otro atrás, brazos abiertos, tronco inclinado.
• La silla invisible: espalda contra la pared, rodillas dobladas como si estuviera sentado.
Para hacerlo más largo:
Cronometrá y anotá cuántos segundos aguanta cada una. La semana siguiente compite contra su propio número.'),

  (null, 'psychomotricity', 'Equilibrio', 'Dinámico', 'La cuerda floja', 'activity', 'Sostener el equilibrio mientras el cuerpo se desplaza', '3-5 años', 'Qué necesitás:
Una cinta de papel pegada al piso, o una soga estirada. Tres metros alcanzan.
Cómo se hace:
Caminar sobre la línea sin pisar afuera.
Progresión:
• Caminar mirando el piso.
• Caminar mirando al frente.
• Caminar de talón a punta, un pie tocando al otro.
• Caminar para atrás.
• Caminar llevando un vaso con agua.
El vaso es el que más muestra:
Cuando tiene que ocuparse del vaso, el equilibrio deja de ser voluntario y se ve cómo está de verdad.'),

  (null, 'psychomotricity', 'Equilibrio', 'Dinámico', 'Circuito de obstáculos', 'game', 'Ajustar el equilibrio ante cambios de superficie y de altura', '6-7 años', 'Qué necesitás:
Almohadones, sillas, cinta, un banquito. Lo que haya.
El circuito:
• Caminar sobre almohadones sin tocar el piso.
• Pasar por debajo de una silla.
• Subir y bajar de un banquito.
• Saltar dentro de tres aros o círculos de cinta.
• Caminar en línea recta hasta el final.
Cómo usarlo:
La primera vuelta despacio, para aprenderlo. La segunda un poco más rápido. La tercera cronometrada.
Para observar:
Dónde se frena. Ese punto del circuito es el que hay que trabajar aparte.'),

  (null, 'psychomotricity', 'Coordinación', 'Óculo-manual', 'La pelota que rebota una vez', 'game', 'Coordinar la vista con la mano en una tarea de recepción', '6-7 años', 'Qué necesitás:
Una pelota que pique bien. Una de goma mediana anda perfecto.
Cómo se juega:
Se pasan la pelota, pero tiene que picar una sola vez entre los dos.
Progresión:
• Pasar y recibir con las dos manos.
• Recibir sólo con la derecha.
• Recibir sólo con la izquierda.
• Aplaudir una vez antes de recibirla.
Si le cuesta:
Achicá la distancia antes de bajar la exigencia. Muchas veces el problema no es la coordinación sino que la pelota le llega demasiado rápido.'),

  (null, 'psychomotricity', 'Coordinación', 'Óculo-podal', 'Fútbol de precisión', 'game', 'Dirigir el pie hacia un objetivo con control de la fuerza', '6-7 años', 'Qué necesitás:
Una pelota y dos botellas de plástico como arco.
Cómo se juega:
Patear desde una marca en el piso y meter la pelota entre las botellas.
Progresión:
• Patear con el pie dominante desde cerca.
• Patear con el otro pie.
• Alejar la marca un paso cada vez que mete dos seguidas.
• Achicar el arco.
Lo que se trabaja acá:
No es la puntería sola. Es graduar la fuerza: si patea con todo, se va afuera aunque apunte bien.'),

  (null, 'psychomotricity', 'Coordinación', 'Coordinación global', 'Saltar la soga, por etapas', 'activity', 'Coordinar salto y giro de brazos en un movimiento continuo', '8-9 años', 'Por qué por etapas:
Saltar la soga junta tres cosas: girar los brazos, saltar en el momento justo, y sostener el ritmo. Enseñarlas juntas es lo que hace que muchos chicos se frustren y abandonen.
Etapa 1:
Girar la soga con las dos manos, sin saltar. Que suene contra el piso siempre en el mismo lugar.
Etapa 2:
Saltar en el lugar sin soga, con ritmo parejo. Contá vos en voz alta.
Etapa 3:
La soga quieta en el piso. Saltarla para adelante y para atrás.
Etapa 4:
Todo junto, empezando con la soga atrás.
Cuánto tiempo:
Cada etapa puede llevar varias sesiones. Pasar antes de tiempo es volver al principio.'),

  (null, 'psychomotricity', 'Coordinación', 'Coordinación global', 'Cruzar gateando', 'activity', 'Recuperar el patrón cruzado en un desplazamiento global', '3-5 años', 'Qué se busca:
El patrón cruzado es mover el brazo de un lado con la pierna del otro. Aparece al gatear y sostiene después la marcha y la escritura.
Cómo se hace:
Gatear por debajo de sillas o de una mesa, despacio, mirando al frente.
Para mirar mientras gatea:
¿Mueve mano derecha con rodilla izquierda? ¿O mueve el mismo lado junto?
Si va del mismo lado:
Ponele marcas de colores: una cinta roja en la mano derecha y otra roja en la rodilla izquierda. Que las rojas se muevan juntas.
Después:
El mismo cruce parado, tocándose la rodilla con el codo del otro lado.'),

  (null, 'psychomotricity', 'Lateralidad', 'Definición lateral', 'Qué mano, qué pie, qué ojo', 'guide', 'Observar cuál es el lado dominante en mano, pie y ojo', '6-7 años', 'Para qué sirve:
No es un test. Es una observación ordenada para saber desde dónde partís, y se hace una vez.
Mano:
Dale una crayola en el medio de la mesa y pedile que dibuje. Repetilo tres veces en momentos distintos.
Pie:
Poné una pelota y pedile que la patee, sin avisar cuál usar.
Ojo:
Que mire por un tubo de cartón. El ojo que elige es el dominante.
Qué anotar:
Si los tres coinciden del mismo lado, la lateralidad está definida. Si no coinciden, no es un problema por sí solo, pero conviene tenerlo escrito.
Cuándo repetirlo:
No antes de los seis meses. Esto cambia despacio.'),

  (null, 'psychomotricity', 'Lateralidad', 'Orientación espacial', 'Derecha, izquierda, y el otro', 'game', 'Distinguir izquierda y derecha en el propio cuerpo y en el de enfrente', '6-7 años', 'Primera parte, en el propio cuerpo:
• Levantá la mano derecha.
• Tocate la oreja izquierda.
• Pisá fuerte con el pie derecho.
Segunda parte, y acá se complica:
Te parás enfrente y le pedís que toque tu mano derecha. Tu derecha está del lado de su izquierda.
Para ayudar con eso:
Que se ponga al lado tuyo mirando para el mismo lado. Ahí coinciden. Después volvés a enfrentarlo.
A qué edad esperarlo:
En el propio cuerpo, alrededor de los seis. En el cuerpo del otro, más cerca de los ocho.'),

  (null, 'psychomotricity', 'Lateralidad', 'Orientación espacial', 'El tesoro escondido', 'game', 'Seguir consignas espaciales de dirección y de posición', '6-7 años', 'Cómo se juega:
Escondés algo en la sala y lo guiás sólo con palabras.
Las palabras que se usan:
Adelante, atrás, arriba, abajo, a la derecha, a la izquierda, adentro, afuera, debajo de, arriba de, entre.
Reglas:
No señalás. No mirás hacia donde está. Sólo hablás.
Después se invierte:
Esconde él y te guía a vos. Esa parte es la más difícil y la que más muestra, porque tiene que armar la consigna desde el lugar donde estás parado vos.'),

  (null, 'psychomotricity', 'Esquema corporal', 'Reconocimiento', 'Dónde me tocaron', 'activity', 'Localizar un estímulo táctil sin mirar', '3-5 años', 'Cómo se hace:
Se sienta de espaldas o con los ojos cerrados. Le tocás una parte del cuerpo y tiene que decir cuál es y después tocársela él.
Empezá por donde es más fácil:
Manos, pies, cabeza, panza.
Después seguí con:
Codo, hombro, muñeca, tobillo, nuca.
Una vuelta más difícil:
Dos toques seguidos, y los nombra en orden.
Para observar:
Las partes que confunde suelen ser las que menos nombra en el dibujo de la figura humana. Las dos actividades se miran juntas.'),

  (null, 'psychomotricity', 'Equilibrio', 'Dinámico', 'Caminar de distintas maneras', 'activity', 'Adaptar el patrón de marcha a consignas variadas', '3-5 años', 'Cómo se hace:
Recorrer la sala caminando distinto cada vez.
Las formas:
• En puntas de pie, como si no quisieras hacer ruido.
• En talones.
• Con pasos gigantes.
• Con pasos chiquititos.
• Como un gigante pesado.
• Como si el piso quemara.
Para qué sirve además de divertir:
Cada forma cambia la base de apoyo y obliga a reacomodar el equilibrio. En puntas y en talones son las dos que más cuestan.
Para cerrar:
Volver a caminar normal y preguntarle cuál le costó más.'),

  (null, 'psychomotricity', 'Coordinación', 'Óculo-manual', 'Encestar de lejos y de cerca', 'game', 'Graduar la fuerza del lanzamiento según la distancia', '6-7 años', 'Qué necesitás:
Un balde o una caja, y pelotitas de papel o medias hechas un bollo.
Cómo se juega:
Tres marcas en el piso: cerca, medio, lejos. Tres tiros desde cada una.
Lo que hay que mirar:
Si tira siempre con la misma fuerza. Desde cerca se le va largo y desde lejos se le queda corto.
Para ayudar:
Antes de cada tiro preguntale: ¿este va suave o fuerte? Que lo diga en voz alta. Anticiparlo con palabras es lo que después se vuelve automático.
Variante:
Con la mano no dominante, sólo desde la marca de cerca.'),

  (null, 'psychomotricity', 'Esquema corporal', 'Imagen corporal', 'Pasar por el agujero', 'game', 'Ajustar la postura al tamaño real del propio cuerpo', '6-7 años', 'Qué necesitás:
Un aro, o una caja abierta de los dos lados, o dos sillas con una distancia entre ellas.
Cómo se juega:
Pasar del otro lado sin tocar los bordes.
Cómo se pone difícil:
Vas achicando el espacio. Acercás las sillas, bajás el aro, girás la caja.
Lo que se trabaja:
Calcular cuánto ocupa el propio cuerpo antes de moverlo. Un chico que no lo tiene armado se choca todo, y no es torpeza: es que no sabe dónde termina.
Para observar:
Si se tira primero y calcula después, o si se queda mirando y planifica.'),

  (null, 'psychomotricity', 'Coordinación', 'Coordinación global', 'El ritmo con el cuerpo', 'activity', 'Reproducir una secuencia rítmica con movimientos del cuerpo', '8-9 años', 'Cómo se hace:
Hacés una secuencia corta y la repite.
Las secuencias, de menor a mayor:
• Dos palmas.
• Palma, palma, pisada.
• Palma, pisada, palma, pisada.
• Palma, dos pisadas, palma en las rodillas.
• Palma, rodillas, hombros, palma.
Sin decir los nombres:
Se lo mostrás, no se lo cantás. Tiene que mirar y repetir.
Para hacerlo más largo:
Que invente él una y la copies vos. Inventar una secuencia y sostenerla es más difícil que repetirla.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Movilidad de hombro en casa', 'guide', 'Sostener el rango de movimiento del hombro entre sesiones', '15+ años', 'Cuándo hacerlos:
Una vez por día, preferentemente a la misma hora. Tres veces por semana ya sirve, todos los días es mejor.
Los movimientos:
• Péndulo: inclinado hacia adelante, el brazo colgando suelto, círculos chicos. Diez para cada lado.
• Subir por la pared: de frente, los dedos caminan hacia arriba hasta donde llegue sin dolor. Sostener cinco segundos. Cinco repeticiones.
• Manos en la nuca: llevar los codos hacia afuera despacio. Diez repeticiones.
• Toalla en la espalda: una mano por arriba y otra por abajo, subir y bajar como cuando te secás. Diez repeticiones.
Hasta dónde:
Hasta donde molesta, nunca hasta donde duele. Un tirón suave está bien. Un dolor agudo significa parar.
Cuándo llamar al profesional:
Si el dolor aparece antes que en la sesión anterior, o si dura más de dos horas después de hacer los ejercicios.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Movilidad de cadera, sin equipamiento', 'guide', 'Recuperar rango de cadera con el propio peso del cuerpo', '15+ años', 'Antes de empezar:
Cinco minutos de caminata. El músculo frío se estira peor y se lastima más fácil.
Los movimientos:
• Rodilla al pecho: acostado, una rodilla se abraza y se lleva al pecho. Sostener veinte segundos. Tres por lado.
• Figura cuatro: acostado, el tobillo apoyado sobre la rodilla contraria, empujar suave hacia afuera. Veinte segundos por lado.
• Puente: acostado con las rodillas dobladas, levantar la cola. Sostener cinco segundos. Diez repeticiones.
• Zancada suave: un pie adelante, bajar el cuerpo, sentir el estiramiento adelante de la cadera de atrás. Veinte segundos por lado.
Respirar:
Ninguno de estos se hace conteniendo el aire. Si te encontrás aguantando la respiración, es que estás forzando.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongación de la cadena posterior', 'guide', 'Elongar isquiotibiales, gemelos y espalda baja en una rutina corta', '15+ años', 'Cuándo:
Después de caminar o al final del día. Nunca sobre músculo frío.
Los estiramientos:
• Isquiotibiales sentado: una pierna estirada, la otra doblada, llevar el pecho hacia la rodilla. Treinta segundos por lado.
• Gemelo contra la pared: las manos en la pared, una pierna atrás con el talón apoyado, empujar. Treinta segundos por lado.
• Espalda baja: acostado, las dos rodillas al pecho, mecerse despacio. Treinta segundos.
• Rotación: acostado, las rodillas dobladas caen para un costado, los hombros quedan apoyados. Treinta segundos por lado.
La regla de los treinta segundos:
Menos de veinte no alcanza para que el músculo ceda. Más de sesenta no agrega. Treinta es el número que conviene.
Cuántas veces por semana:
Cinco días alcanzan para ver cambios en tres semanas.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Sentadillas bien hechas', 'guide', 'Fortalecer cuádriceps y glúteos con técnica correcta', '15+ años', 'Cómo se hace:
Parado, los pies al ancho de los hombros, las puntas apenas hacia afuera. Bajar como si te fueras a sentar en una silla que está atrás.
Lo que hay que mirar:
• Las rodillas no pasan la punta de los pies.
• Las rodillas no se meten para adentro.
• El peso queda en los talones, no en la punta.
• La espalda derecha, la mirada al frente.
Con una silla de verdad:
Si recién empezás, poné una silla atrás y tocala con la cola antes de subir. Eso marca la profundidad y da seguridad.
Cuántas:
Tres series de diez, descansando un minuto. Si las diez salen fáciles, bajá más despacio antes de agregar repeticiones.
Cuándo parar:
Dolor en la rodilla, en cualquier momento. Cansancio muscular está bien, dolor articular no.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Fuerza de tobillo después de un esguince', 'guide', 'Recuperar fuerza y estabilidad del tobillo por etapas', '15+ años', 'Importante:
Estas etapas se avanzan cuando la anterior sale sin dolor, no cuando pasó una cantidad de días. Apurarlo es lo que hace que el tobillo se vuelva a torcer.
Etapa 1, sin mover la articulación:
Empujar el pie contra la pared en las cuatro direcciones, sin que el pie se mueva. Sostener cinco segundos. Diez veces cada dirección.
Etapa 2, con banda elástica:
Los mismos cuatro movimientos, ahora sí moviendo el pie contra la resistencia. Quince repeticiones.
Etapa 3, con el peso del cuerpo:
Pararse en puntas de pie. Veinte repeticiones. Después en un solo pie.
Etapa 4, equilibrio:
Pararse en un pie treinta segundos. Después con los ojos cerrados. Después sobre una almohada.
La etapa 4 es la que más se saltea:
Y es la que evita que se repita. La fuerza vuelve sola; la propiocepción hay que entrenarla.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro superior', 'Fuerza de brazos con banda elástica', 'guide', 'Fortalecer hombro y brazo con resistencia progresiva', '15+ años', 'Qué necesitás:
Una banda elástica. Si no tenés, una toalla sirve para los isométricos.
Los ejercicios:
• Remo: la banda enganchada al frente, tirar los codos hacia atrás juntando los omóplatos. Quince repeticiones.
• Rotación externa: el codo pegado al cuerpo doblado en noventa grados, llevar el antebrazo hacia afuera. Quince por lado.
• Elevación frontal: la banda pisada, subir el brazo estirado hasta la altura del hombro. Doce por lado.
• Extensión de tríceps: la banda por encima del hombro, estirar el codo. Quince por lado.
El error más común:
Subir el hombro hacia la oreja. Si eso pasa, la banda está demasiado dura. Aflojá la tensión antes que la técnica.
Cuántas veces por semana:
Tres, con un día de descanso en el medio.'),

  (null, 'physiotherapy', 'Fuerza', 'Core', 'Core sin abdominales clásicos', 'guide', 'Activar la musculatura profunda del tronco sin cargar la columna', '15+ años', 'Por qué no abdominales comunes:
El abdominal clásico flexiona la columna una y otra vez. Para una espalda que duele, eso suele empeorarlo. Estos ejercicios activan lo mismo sin doblar.
Los ejercicios:
• Plancha: apoyado en antebrazos y puntas de pie, el cuerpo derecho. Veinte segundos, tres veces. Si duele la espalda, apoyá las rodillas.
• Plancha lateral: de costado, apoyado en un antebrazo. Quince segundos por lado.
• Bicho muerto: acostado boca arriba, brazos y piernas arriba, bajás un brazo y la pierna contraria sin despegar la espalda del piso. Diez por lado.
• Pájaro perro: en cuatro apoyos, estirar un brazo y la pierna contraria. Sostener cinco segundos. Diez por lado.
La señal de que está bien hecho:
La espalda baja no se despega del piso, y podés hablar mientras lo hacés. Si contenés la respiración, estás compensando.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Propiocepción', 'Entrenar el equilibrio en casa', 'guide', 'Mejorar la estabilidad para reducir el riesgo de caídas', '15+ años', 'Dónde hacerlo:
Al lado de una mesada o del respaldo de una silla, siempre con algo para agarrarse. La idea es no usarlo, pero que esté.
La progresión:
• Pararse en un pie, treinta segundos por lado.
• Lo mismo con los ojos cerrados.
• Pararse sobre una almohada, los dos pies.
• Sobre la almohada, un pie.
• Caminar poniendo un pie delante del otro, diez pasos.
Cuántas veces:
Todos los días. Es de los pocos que conviene hacer a diario, porque el equilibrio se pierde rápido y vuelve rápido.
Cuánto tarda en notarse:
Dos o tres semanas de práctica diaria. Se nota primero al bajar escaleras.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Reeducación de la marcha', 'Volver a caminar parejo', 'guide', 'Recuperar un patrón de marcha simétrico después de una lesión', '15+ años', 'De qué se trata:
Después de una lesión el cuerpo aprende a evitar el dolor, y esa manera de caminar queda aunque el dolor ya no esté. Esto la desarma.
Delante de un espejo o de un vidrio:
Caminar mirándose, buscando que los dos pasos midan lo mismo y duren lo mismo.
Con marcas en el piso:
Poné cintas a la misma distancia y caminá pisando cada una. Fuerza a que los dos pasos sean iguales.
Contando en voz alta:
Un dos, un dos, con la misma duración cada uno. Cojear es que un tiempo dura menos que el otro.
En la escalera:
Subir empezando siempre con la pierna sana. Bajar empezando con la afectada.
Cuánto por vez:
Cinco minutos. Es corto a propósito: cuando se cansa vuelve al patrón viejo y se refuerza justo lo que queremos sacar.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'La rutina de cinco minutos', 'guide', 'Sostener el trabajo entre sesiones con una rutina breve y realista', '15+ años', 'Por qué cinco minutos:
Una rutina de media hora se abandona en la primera semana. Una de cinco minutos se hace. Y una que se hace todos los días le gana a una perfecta que no se hace nunca.
La rutina:
• Un minuto de movilidad de cuello y hombros.
• Un minuto de rotación de tronco, sentado.
• Un minuto de puente, acostado.
• Un minuto de elongación de la pierna que más lo necesite.
• Un minuto de respiración, con la mano en la panza.
Cuándo:
Enganchada a algo que ya hacés todos los días. Después de lavarte los dientes, antes del café. Eso es lo que hace que no se olvide.
Si un día no salió:
No se recupera al día siguiente haciendo el doble. Se sigue.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Cuidados post-lesión', 'Qué hacer las primeras 72 horas', 'guide', 'Orientar el manejo inicial de una lesión aguda de tejido blando', '15+ años', 'Lo primero:
Esto es para un golpe, una torcedura o un tirón sin fractura ni deformidad. Si el miembro quedó torcido, no podés apoyarlo, o el dolor es insoportable, se va a una guardia.
Las primeras 72 horas:
• Reposo relativo. No inmovilidad total: mover suave lo que no duela.
• Hielo veinte minutos, cada dos o tres horas. Siempre con un paño en el medio, nunca directo sobre la piel.
• Compresión con venda elástica, firme pero sin que se duerma ni se ponga violeta.
• Elevación por encima del nivel del corazón cuando estés en reposo.
Lo que conviene evitar en esas horas:
Calor, alcohol, masajes fuertes, y correr a probar si ya podés.
Cuándo consultar igual:
Si a las 72 horas no mejoró nada, o si el dolor aumenta en vez de bajar.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongación de cuello para pantalla', 'guide', 'Aliviar la tensión cervical de quien pasa horas sentado', '15+ años', 'Cuándo:
Cada dos horas de pantalla, o al final del día. Toma tres minutos.
Los movimientos:
• Oreja al hombro, la mano ayuda apenas. Treinta segundos por lado.
• Mentón al pecho, las manos en la nuca sin tirar. Treinta segundos.
• Mirar sobre el hombro, girando despacio. Treinta segundos por lado.
• Encoger los hombros hasta las orejas y soltar de golpe. Diez veces.
Ninguno de estos incluye:
Girar la cabeza en círculos completos. Ese movimiento comprime y no elonga.
Lo que importa más que el ejercicio:
La altura de la pantalla. El borde de arriba tiene que quedar a la altura de los ojos. Si mirás para abajo ocho horas, ningún estiramiento alcanza.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro inferior', 'Subir escalones como ejercicio', 'guide', 'Fortalecer la pierna con un movimiento de la vida diaria', '15+ años', 'Qué necesitás:
Un escalón. El de la entrada de casa sirve.
Cómo se hace:
Subir con una pierna, apoyar la otra arriba, bajar con la misma con la que subiste.
La regla:
La pierna que trabaja es la que sube primero y baja última. La otra sólo acompaña.
Cuántas:
Diez con cada pierna. Tres series.
Lo que hay que mirar:
• La rodilla que sube no se mete para adentro.
• El cuerpo no se tira hacia adelante para tomar impulso.
• Bajar controlado, sin dejarse caer.
Para hacerlo más difícil:
Un escalón más alto, o bajar más despacio contando hasta tres.
Bajar es lo que más fortalece:
Y es lo que la mayoría hace rápido para terminar antes.'),

  (null, 'physiotherapy', 'Fuerza', 'Core', 'Espalda que duele de estar sentado', 'guide', 'Aliviar y prevenir el dolor lumbar de la vida sedentaria', '15+ años', 'Lo que más ayuda no es un ejercicio:
Es levantarse. Cada cuarenta y cinco minutos, dos minutos de pie. Ninguna rutina compensa ocho horas sin moverse.
Para hacer en el momento en que duele:
• Gato y vaca: en cuatro apoyos, arquear y hundir la espalda despacio. Diez veces.
• Rodillas al pecho, acostado. Treinta segundos.
• Rotación con las rodillas dobladas hacia un lado. Treinta segundos por lado.
Para que no vuelva:
Los ejercicios de core sin flexión de columna, tres veces por semana.
La silla:
Los pies apoyados en el piso, las rodillas a la altura de la cadera, la espalda contra el respaldo. Si los pies cuelgan, un banquito debajo.
Cuándo consultar:
Si el dolor baja por la pierna, si hay hormigueo, o si te despierta de noche.'),

  (null, 'physiotherapy', 'Movilidad', 'Rango articular', 'Movilidad de rodilla después de una cirugía', 'guide', 'Recuperar flexión y extensión de rodilla de forma progresiva', '15+ años', 'Antes que nada:
Esto acompaña lo que te indicó tu cirujano, no lo reemplaza. Los tiempos los marca él.
Para recuperar la extensión:
• Talón sobre una toalla enrollada, la rodilla colgando, dejar que baje sola por el peso. Cinco minutos.
• Sentado con el talón apoyado en otra silla, empujar la rodilla suave hacia abajo. Diez veces.
Para recuperar la flexión:
• Sentado en el borde de la cama, dejar caer la pierna y ayudarla con la otra. Diez veces.
• Deslizar el talón sobre la cama acercándolo a la cola. Quince veces.
La extensión primero:
Una rodilla que no estira del todo cambia la forma de caminar y trae dolor de cadera y de espalda. Se recupera antes que la flexión, aunque la flexión se sienta más urgente.
Hielo después:
Quince minutos al terminar. Es normal que se hinche un poco al principio.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Ejercicios diarios', 'Cómo levantar peso sin lastimarse', 'guide', 'Enseñar el patrón de levantamiento seguro para la vida diaria', '15+ años', 'La regla de siempre:
Doblar las rodillas y no la espalda. Se dice mucho y se hace poco, así que acá va el detalle.
Paso a paso:
• Acercate al objeto hasta que lo toques con las canillas. La distancia es lo que más carga la espalda.
• Separá los pies al ancho de los hombros.
• Bajá doblando rodillas y cadera, la espalda derecha.
• Agarrá firme y pegá el objeto al cuerpo.
• Subí empujando con las piernas, sin girar el tronco.
Para girar:
Movés los pies. Nunca la cintura con el peso arriba.
Si es muy pesado:
Se pide ayuda. No hay técnica que compense un peso que no podés.
Lo que más lesiona:
No es el mueble pesado que levantás con cuidado. Es la caja liviana que agarrás doblado y de apuro.'),

  (null, 'physiotherapy', 'Fuerza', 'Miembro superior', 'Fuerza de mano y muñeca', 'guide', 'Recuperar fuerza de agarre y movilidad de muñeca', '15+ años', 'Qué necesitás:
Una pelota blanda, una gomita ancha, y una botella pequeña.
Los ejercicios:
• Apretar la pelota y sostener cinco segundos. Quince veces.
• Abrir los dedos contra una gomita puesta alrededor de todos. Quince veces.
• Con el antebrazo apoyado y la mano afuera, subir y bajar la muñeca con la botella. Quince en cada sentido.
• Girar la palma para arriba y para abajo, el codo pegado al cuerpo. Veinte veces.
Abrir es tan importante como cerrar:
Casi todo el día usamos la mano para agarrar. Los músculos que abren quedan débiles, y eso desequilibra la muñeca.
Cuándo hacerlo:
Dos veces por día. Si aparece hormigueo en los dedos, parar y avisar.'),

  (null, 'physiotherapy', 'Equilibrio y marcha', 'Reeducación de la marcha', 'Usar el bastón del lado correcto', 'guide', 'Corregir el uso del bastón, que casi siempre se lleva del lado equivocado', '15+ años', 'La regla, y sorprende a casi todos:
El bastón va en la mano del lado sano. Del lado contrario a la pierna que duele.
Por qué:
Al caminar, el brazo de un lado avanza con la pierna del otro. Si el bastón está del lado sano, apoya al mismo tiempo que la pierna afectada y le saca peso de encima. Del mismo lado, no descarga nada.
La altura:
Parado con los brazos al costado, el mango tiene que quedar a la altura de la muñeca. El codo apenas doblado.
Cómo se camina:
Bastón y pierna afectada avanzan juntos. Después la pierna sana.
En escaleras:
Para subir, primero la pierna sana. Para bajar, primero el bastón y la afectada.
Para acordarse:
Sube el bueno, baja el malo.'),

  (null, 'physiotherapy', 'Movilidad', 'Elongación', 'Elongación antes de correr', 'guide', 'Preparar el cuerpo para correr sin perder rendimiento', '15+ años', 'Lo que cambió:
Antes se estiraba sostenido antes de correr. Hoy sabemos que eso baja la potencia del músculo justo cuando la necesitás. Sostenido va después.
Antes de correr, en movimiento:
• Caminar levantando rodillas, veinte pasos.
• Talones a la cola, veinte pasos.
• Zancadas caminando, diez por lado.
• Círculos de cadera, diez para cada lado.
• Trote suave, cinco minutos.
Después de correr, sostenido:
Cuádriceps, isquiotibiales, gemelos y glúteos. Treinta segundos cada uno.
La señal de que entraste en calor:
Empezás a transpirar apenas y la respiración se acelera un poco. Recién ahí el cuerpo está listo.'),

  (null, 'physiotherapy', 'Pautas para casa', 'Cuidados post-lesión', 'Volver al deporte sin recaer', 'guide', 'Decidir cuándo y cómo retomar la actividad después de una lesión', '15+ años', 'La pregunta equivocada:
Cuántas semanas pasaron. El tejido no cuenta días, responde a lo que puede hacer.
Las cuatro señales de que estás listo:
• Sin dolor en la vida diaria hace por lo menos una semana.
• El rango de movimiento igual al del lado sano.
• Fuerza pareja entre los dos lados.
• Poder saltar, frenar y girar sin miedo ni molestia.
Si falta alguna, todavía no.
Cómo volver:
Al cincuenta por ciento de lo que hacías. Si no duele ni se hincha en las 24 horas siguientes, subís un poco la próxima. Cada escalón, tres sesiones antes de subir.
La regla de las 24 horas:
Lo que importa no es cómo te sentís durante. Es cómo amanecés al otro día.
Lo que más hace recaer:
Volver al nivel de antes en la primera semana porque el dolor ya no está.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Agarre y pinza', 'La pinza que junta de todo', 'activity', 'Fortalecer la pinza índice pulgar con objetos de distinto tamaño', '3-5 años', 'Qué necesitás:
Pompones, botones grandes, fideos secos, pinzas de ropa, una cubetera.
Cómo se hace:
Pasar los objetos de un recipiente a otro, uno por uno, usando sólo el índice y el pulgar.
De más fácil a más difícil:
• Pompones grandes con los dedos.
• Botones con los dedos.
• Fideos con los dedos.
• Pompones con una pinza de ropa.
• Fideos con una pinza de depilar.
Poner cada uno en un huequito de la cubetera:
Suma precisión al agarre, porque no alcanza con levantarlo: hay que soltarlo en el lugar justo.
Para observar:
Si usa el dedo del medio para ayudarse. Es una compensación común y conviene señalarla con humor, sin retarlo.'),

  (null, 'occupational_therapy', 'Motricidad fina', 'Grafomotricidad', 'Antes de escribir: el trazo grande', 'activity', 'Preparar el gesto gráfico con movimientos amplios de hombro y codo', '3-5 años', 'Por qué grande primero:
La escritura sale del hombro antes que de los dedos. Empezar por la hoja chica saltea dos articulaciones.
En la pared o en un caballete:
Papel grande pegado vertical. Trazos con crayón grueso, el brazo entero.
Los trazos, en orden:
• Líneas de arriba a abajo, bien largas.
• Líneas de izquierda a derecha.
• Círculos grandes en las dos direcciones.
• Zigzag.
• Bucles seguidos, como olas.
Después el mismo trazo, más chico:
En una hoja apoyada en la mesa. Y recién después, entre dos renglones.
Por qué vertical:
La muñeca queda estirada sola, que es la posición desde la que después se escribe.'),

  (null, 'psychology', 'Emociones', 'Reconocer emociones', 'El diario de las tres caras', 'worksheet', 'Registrar el estado emocional del día con un sistema simple y sostenible', '6-7 años', 'Qué es:
Una hoja por semana. Cada día, una carita: contento, más o menos, mal.
Cómo se completa:
Marca la cara y escribe o dibuja una sola cosa que pasó ese día.
Por qué sólo tres caras:
Con diez emociones para elegir, se abandona en tres días. Con tres, se completa. Las palabras finas vienen después, cuando el hábito ya está.
Qué se hace con la hoja:
Se mira junta al final de la semana. La pregunta no es por qué, es qué tenían en común los días de la cara del medio.
Cuándo empezar a afinar:
Cuando el registro ya se sostiene solo, agregás una cuarta cara y le ponés nombre entre los dos.'),

  (null, 'psychology', 'Emociones', 'Regulación emocional', 'El termómetro del enojo', 'worksheet', 'Reconocer la intensidad del enojo antes de que llegue al límite', '8-9 años', 'Qué se dibuja:
Un termómetro con cinco niveles, del 1 al 5. Cada nivel lo describe él con sus palabras y con lo que siente en el cuerpo.
Un ejemplo de cómo suele quedar:
1, tranquilo. 2, algo me molesta. 3, la cara caliente. 4, ganas de gritar. 5, exploto.
La pregunta que importa:
En qué número todavía podés hacer algo. Casi siempre es el 3, y casi nunca lo están mirando cuando pasan por ahí.
Qué hacer en ese número:
Elige dos cosas concretas. Salir del cuarto, tomar agua, apretar la pelota. Se escriben al lado del 3, en el mismo papel.
Cómo se usa en la semana:
Se le pregunta en qué número está, en momentos neutros. Ponerle número cuando no está enojado es lo que lo hace posible cuando sí lo está.'),

  (null, 'psychology', 'Emociones', 'Tolerancia a la frustración', 'El juego que se pierde a propósito', 'game', 'Practicar la respuesta a perder en un contexto seguro', '6-7 años', 'De qué se trata:
Jugar algo corto y de azar, donde perder no dependa de la habilidad. Cartas, dados, la escalera.
Por qué de azar:
Si pierde por falta de habilidad, la frustración se mezcla con vergüenza. Con dados, perder no dice nada de él.
Lo que se trabaja:
• Antes de empezar: qué vamos a hacer si perdemos.
• Durante: nombrar lo que aparece, sin frenar el juego.
• Al final: cómo salió eso que dijimos.
Que también pierdas vos:
Y que muestres en voz alta lo que hacés con eso. Uy, perdí. Me da rabia. Bueno, otra.
Cuándo se ve el progreso:
No cuando deja de enojarse. Cuando se enoja y sigue jugando igual.'),

  (null, 'psychology', 'Habilidades sociales', 'Empatía', 'Qué le pasa al otro', 'activity', 'Practicar la lectura de estados emocionales ajenos', '8-9 años', 'Qué necesitás:
Fotos de caras, o escenas de una revista, o capturas de una serie sin sonido.
Cómo se hace:
Mirar la escena y responder tres preguntas.
Las tres preguntas:
• ¿Qué le está pasando a esta persona?
• ¿En qué se nota? ¿Qué parte de la cara o del cuerpo te lo dice?
• ¿Qué le habrá pasado antes para estar así?
Lo importante es la segunda:
Ahí se ve si lee señales o si adivina. Las cejas, la boca, los hombros.
Una vuelta más:
Que invente qué pasa después. Eso conecta la emoción con lo que la persona va a hacer, que es lo que más cuesta.
Sin sonido a propósito:
Con las palabras, la cara deja de mirarse.'),

  (null, 'psychology', 'Técnicas', 'Respiración', 'Respirar en cuadrado', 'guide', 'Bajar la activación con un patrón respiratorio simple de recordar', '8-9 años', 'Cómo es:
Cuatro tiempos iguales, como los cuatro lados de un cuadrado.
El patrón:
Inhalar contando hasta cuatro. Sostener cuatro. Exhalar cuatro. Esperar cuatro. Y de nuevo.
Con el dedo:
Que dibuje el cuadrado en el aire o sobre la mesa mientras respira, un lado por tiempo. El dedo hace que no se pierda la cuenta.
Cuántas vueltas:
Cuatro alcanzan. Más empieza a marear a algunos chicos.
Cuándo practicarlo:
Todos los días en un momento tranquilo. Una técnica aprendida en calma es la única que aparece en el momento difícil.
Si le cuesta sostener:
Bajá a tres tiempos. Nada obliga a que sean cuatro.'),

  (null, 'psychology', 'Técnicas', 'Relajación', 'Apretar y soltar, de los pies a la cabeza', 'guide', 'Reconocer la diferencia entre tensión y relajación en el propio cuerpo', '8-9 años', 'De qué se trata:
Apretar un grupo de músculos cinco segundos y soltarlos de golpe. La relajación se siente por contraste.
El recorrido:
• Los pies, como si agarraras algo con los dedos.
• Las piernas, estirándolas fuerte.
• La panza, como si fueras a recibir un golpe.
• Las manos, puños apretados.
• Los brazos, pegándolos al cuerpo.
• Los hombros, hasta las orejas.
• La cara, arrugando todo.
Después de cada uno:
Diez segundos de soltar, y una pregunta: ¿qué se siente distinto ahora?
Cuánto dura:
Diez minutos. Con chicos más chicos, sólo manos, hombros y cara.
Dónde se nota primero:
En los hombros. Muchos chicos descubren ahí que los tenían tensos hacía rato.'),

  (null, 'psychology', 'Técnicas', 'Reestructuración cognitiva', 'El pensamiento que se puede discutir', 'worksheet', 'Identificar un pensamiento automático y buscarle evidencia en contra', '12-14 años', 'Los cuatro casilleros:
• Qué pasó. Los hechos, sin interpretación.
• Qué pensé. La frase exacta que apareció en la cabeza.
• Qué evidencia hay a favor de ese pensamiento.
• Qué evidencia hay en contra.
Y al final:
Una frase más ajustada, escrita por él. No una positiva: una más precisa.
Un ejemplo:
Pasó que no me contestó el mensaje. Pensé que está enojada conmigo. A favor: tardó más que otras veces. En contra: la semana pasada tardó igual y no pasaba nada, y tiene examen. Frase nueva: puede estar ocupada, y si sigo preocupado le pregunto.
El error frecuente:
Confundir buscar evidencia en contra con pensar en positivo. No se trata de que todo esté bien, se trata de mirar completo.
Cuándo se completa:
Después del momento, no durante. En el medio no se puede pensar así.');
