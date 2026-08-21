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
 *   export PGHOST=... PGUSER=... PGDATABASE=postgres
 *   printf 'Contraseña: ' && read -rs PGPASSWORD && export PGPASSWORD && echo ok
 *   ./dx npm run db:seed:remote
 *
 * Los datos van en las variables estándar de psql y no en una cadena
 * `postgresql://…`. Una cadena mete la contraseña adentro de una URL, y ahí una
 * contraseña con `@`, `/` o `#` la parte al medio salvo que la codifiques a
 * mano. psql lee estas variables sin interpretar nada.
 *
 * Y `read -rs` mantiene la contraseña fuera del historial de la shell y fuera
 * de `ps`, que es la otra razón para que no sea un argumento.
 */

import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'supabase/seeds'

const missing = ['PGHOST', 'PGUSER', 'PGPASSWORD'].filter((name) => !process.env[name])
if (missing.length > 0) {
  console.error(`✗ Faltan variables de conexión: ${missing.join(', ')}\n`)
  console.error('  Los datos están en Supabase: Project Settings → Database.')
  console.error('  Después, en la terminal:\n')
  console.error('    export PGHOST=<el host>')
  console.error('    export PGUSER=<el usuario>')
  console.error('    export PGDATABASE=postgres')
  console.error("    printf 'Contraseña: ' && read -rs PGPASSWORD && export PGPASSWORD && echo ok\n")
  process.exit(1)
}

const files = readdirSync(DIR)
  .filter((name) => name.endsWith('.sql'))
  .sort()

if (files.length === 0) {
  console.error(`✗ No hay archivos .sql en ${DIR}/`)
  process.exit(1)
}

/**
 * El pooler de Supabase atiende en dos puertos y no siempre en los dos: 6543 es
 * el modo transacción y 5432 el modo sesión. Cuál está abierto depende del
 * proyecto, y equivocarse devuelve *el mismo texto* que una contraseña mal
 * puesta: "password authentication failed". Eso mandó a resetear la contraseña
 * tres veces cuando la contraseña nunca había estado mal.
 *
 * Así que se prueban los dos y se distingue una cosa de la otra antes de
 * escribir nada.
 */
const PUERTOS = process.env.PGPORT ? [process.env.PGPORT] : ['6543', '5432']

let PORT = null

function psql(args, port = PORT) {
  return execFileSync('psql', ['-v', 'ON_ERROR_STOP=1', '-X', '-q', ...args], {
    encoding: 'utf8',
    env: { ...process.env, PGPORT: String(port), PGCONNECT_TIMEOUT: '15' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

const fallos = []
for (const puerto of PUERTOS) {
  try {
    psql(['-t', '-A', '-c', 'select 1'], puerto)
    PORT = puerto
    break
  } catch (error) {
    fallos.push({ puerto, texto: String(error.stderr ?? error.message) })
  }
}

if (!PORT) {
  const auth = fallos.every((f) => /password authentication failed/i.test(f.texto))

  if (auth) {
    console.error('✗ La contraseña no es la actual de esta base.\n')
    console.error(
      PUERTOS.length > 1
        ? `  Probé los puertos ${PUERTOS.join(' y ')}, y los dos la rechazaron.`
        : `  El puerto ${PUERTOS[0]} la rechazó.`,
    )
    console.error('  Reseteala en Supabase (Project Settings → Database → Reset database')
    console.error('  password), copiala con el botón, y sin cerrar el cartel corré:\n')
    console.error("    printf 'Pegá: ' && read -rs PGPASSWORD && export PGPASSWORD && echo ok\n")
  } else {
    console.error('✗ No pude conectarme a la base.\n')
    for (const f of fallos) {
      console.error(`  Puerto ${f.puerto}: ${f.texto.trim().split('\n')[0]}`)
    }
    console.error(`\n  Host: ${process.env.PGHOST}`)
    console.error(`  Usuario: ${process.env.PGUSER}`)
    console.error('\n  Verificá esos dos contra el botón "Connect" del proyecto en Supabase.\n')
  }
  process.exit(1)
}

// Decir en voz alta a qué base se está por escribir. El error caro acá no es
// que falle: es que funcione contra la base equivocada.
console.log(`Base: ${process.env.PGUSER}@${process.env.PGHOST}:${PORT}\n`)

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
  try {
    psql(['-f', join(DIR, name)])
  } catch (error) {
    console.log('falló')
    console.error(`\n✗ Se cortó cargando ${name}.\n`)
    console.error(String(error.stderr ?? error.message).trim())
    console.error(
      '\n  Los archivos anteriores sí entraron. Antes de reintentar, vaciá lo cargado:\n',
    )
    console.error('    delete from materials where practitioner_id is null;\n')
    process.exit(1)
  }
  const total = Number(psql(['-t', '-A', '-c', 'select count(*) from materials']).trim())
  console.log(`${total} en total`)
}

const porDisciplina = psql([
  '-c',
  'select discipline, count(*) from materials group by discipline order by discipline',
])

console.log(`\n${porDisciplina}`)
console.log('✓ Listo. Cada profesión tiene que tener 50 o más.')
