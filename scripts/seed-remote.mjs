/**
 * Carga la biblioteca compartida de materiales en una base remota.
 *
 * ─── Por qué esto no es `supabase db push --include-seed` ───────────────────
 *
 * Esa bandera carga todo lo que figura en `sql_paths` del config, y ahí adentro
 * está `seed.sql`, que es la demo local: inventa una fonoaudióloga con tres
 * pacientes y **una contraseña escrita en el repositorio**. Publicada, en un
 * repositorio, para que cualquiera pueda levantar el proyecto y mirarlo.
 *
 * En local eso es exactamente lo que querés. En una base con historias clínicas
 * es una cuenta con credencial conocida. No hay bandera que separe una cosa de
 * la otra, así que la separación vive acá: este script carga `supabase/seeds/`
 * y nunca `seed.sql`.
 *
 * ─── Por qué los materiales sí van a producción ─────────────────────────────
 *
 * No son datos de nadie: son contenido del producto, con `practitioner_id` en
 * null, iguales en todos los ambientes. Un ambiente sin ellos es un ambiente
 * roto, no un ambiente limpio.
 *
 * ─── Uso ────────────────────────────────────────────────────────────────────
 *
 *   printf 'Cadena de conexión: ' && read -rs SUPABASE_DB_URL && export SUPABASE_DB_URL && echo ok
 *   ./dx npm run db:seed:remote
 *
 * `read -rs` mantiene la contraseña fuera del historial de la shell y fuera de
 * `ps`. Por eso la cadena entra por una variable de entorno y no como argumento.
 */

import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'supabase/seeds'

const url = process.env.SUPABASE_DB_URL
if (!url) {
  console.error('✗ Falta SUPABASE_DB_URL.\n')
  console.error('  Sacala de Supabase: Project Settings → Database → Connection string.')
  console.error('  Después, en la terminal:\n')
  console.error("    printf 'Cadena de conexión: ' && read -rs SUPABASE_DB_URL && export SUPABASE_DB_URL && echo ok\n")
  process.exit(1)
}

// Una salvaguarda barata contra el error caro: apuntar a la base equivocada.
// No prueba que sea la correcta, pero descarta el caso de pegar cualquier cosa.
if (!/^postgres(ql)?:\/\//.test(url)) {
  console.error('✗ SUPABASE_DB_URL no parece una cadena de conexión.')
  console.error('  Tiene que empezar con postgresql://')
  process.exit(1)
}

const files = readdirSync(DIR)
  .filter((name) => name.endsWith('.sql'))
  .sort()

if (files.length === 0) {
  console.error(`✗ No hay archivos .sql en ${DIR}/`)
  process.exit(1)
}

function psql(args) {
  return execFileSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-X', '-q', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  })
}

// Si ya hay materiales, cargar otra vez los duplica: estos INSERT no tienen
// clave natural sobre la que chocar. Ya pasó una vez, con catorce duplicados
// que aparecieron porque alguien sospechó, no porque algo avisara.
const before = Number(psql(['-t', '-A', '-c', 'select count(*) from materials']).trim())
if (before > 0) {
  console.error(`✗ Esa base ya tiene ${before} materiales.`)
  console.error('  Cargar de nuevo los duplicaría, porque estos INSERT no chocan con nada.')
  console.error('  Si querés reemplazarlos, borralos primero a propósito:\n')
  console.error("    delete from materials where practitioner_id is null;\n")
  process.exit(1)
}

console.log(`Cargando ${files.length} archivos en la base remota…\n`)

for (const name of files) {
  process.stdout.write(`  ${name} … `)
  psql(['-f', join(DIR, name)])
  const total = Number(psql(['-t', '-A', '-c', 'select count(*) from materials']).trim())
  console.log(`${total} en total`)
}

const porDisciplina = psql([
  '-c',
  'select discipline, count(*) from materials group by discipline order by discipline',
])

console.log(`\n${porDisciplina}`)
console.log('✓ Listo. Cada profesión tiene que tener 50 o más.')
