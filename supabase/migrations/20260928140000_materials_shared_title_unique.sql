-- El título, único entre los materiales compartidos.
--
-- La biblioteca compartida es contenido del producto, y el contenido se
-- reescribe. Hasta ahora volver a cargarla en un ambiente que ya la tenía
-- duplicaba todo: estos INSERT no tenían ninguna clave natural contra la cual
-- chocar, así que el script de carga se negaba a correr dos veces y la única
-- forma de actualizar producción era borrar antes las filas compartidas.
--
-- Borrarlas tiene un costo que no se ve: `session_plan_items.material_id` es
-- `on delete set null`, así que cada planificación que apuntaba a un material
-- se queda sin él, en silencio, y el ítem sobrevive sólo porque guarda su
-- propio título.
--
-- Con un título único entre las filas compartidas, el INSERT tiene contra qué
-- chocar y la recarga pasa a ser un upsert: las filas se actualizan en su lugar,
-- conservan su id, y las planificaciones siguen apuntando a donde apuntaban.
--
-- El índice es parcial a propósito. Dos profesionales pueden tener cada una su
-- propio "Praxias con espejo", y una profesional puede tener el suyo aunque la
-- biblioteca tenga uno con ese nombre: eso no es un conflicto, son materiales
-- distintos de personas distintas. Lo único que no puede repetirse es un título
-- adentro de la biblioteca compartida, que es lo que hace que un material tenga
-- una identidad estable entre ambientes.

create unique index materials_shared_title_key
  on materials (title)
  where practitioner_id is null;
