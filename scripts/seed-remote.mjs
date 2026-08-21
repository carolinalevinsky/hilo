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

import { execFileSync, execSync } from 'node:child_process'
import { closeSync, mkdtempSync, openSync, readSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const DIR = 'supabase/seeds'

const missing = ['PGHOST', 'PGUSER'].filter((name) => !process.env[name])
if (missing.length > 0) {
  console.error(`✗ Faltan variables de conexión: ${missing.join(', ')}\n`)
  console.error('  Los datos están en Supabase, en el botón "Connect" del proyecto.')
  console.error('  Después, en la terminal:\n')
  console.error('    export PGHOST=<el host>')
  console.error('    export PGUSER=<el usuario>')
  console.error('    export PGDATABASE=postgres\n')
  console.error('  La contraseña te la pregunta este script; no hace falta exportarla.\n')
  process.exit(1)
}

/**
 * La contraseña se pregunta acá, no se lee de una variable.
 *
 * Pasarla por `read -rs` y una variable de entorno falló seis veces seguidas
 * contra un proyecto donde el CLI de Supabase, preguntando él mismo, entró a la
 * primera. Nunca se aisló qué se rompía en el camino —el valor viaja por zsh,
 * por `docker run --env` y por el entorno del contenedor— y no hace falta
 * saberlo: el camino que falla se puede sacar del medio.
 *
 * Lo que sí se corrige de paso es el `\r` del final. Un salto de línea de
 * Windows pegado adentro de la contraseña la rompe sin dejar rastro visible, y
 * el error que devuelve Postgres es el mismo que el de una contraseña mal
 * escrita.
 */
function preguntarContrasena() {
  if (process.env.PGPASSWORD) return process.env.PGPASSWORD

  process.stdout.write('Contraseña de la base (no se ve mientras la pegás): ')

  let modoPrevio = null
  try {
    modoPrevio = execSync('stty -g < /dev/tty', { shell: '/bin/sh' }).toString().trim()
    execSync('stty -echo < /dev/tty', { shell: '/bin/sh' })
  } catch {
    // Sin terminal de verdad no se puede ocultar. Se sigue igual: es preferible
    // que funcione y se vea, a que no funcione.
  }

  const bytes = []
  const uno = Buffer.alloc(1)
  const tty = openSync('/dev/tty', 'r')
  try {
    while (readSync(tty, uno, 0, 1, null) === 1) {
      if (uno[0] === 0x0a) break
      bytes.push(uno[0])
    }
  } finally {
    closeSync(tty)
    if (modoPrevio) execSync(`stty ${modoPrevio} < /dev/tty`, { shell: '/bin/sh' })
    process.stdout.write('\n')
  }

  return Buffer.from(bytes).toString('utf8').replace(/\r$/, '')
}

const PGPASSWORD = preguntarContrasena()
if (!PGPASSWORD) {
  console.error('\n✗ No escribiste nada.\n')
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
    env: { ...process.env, PGPASSWORD, PGPORT: String(port), PGCONNECT_TIMEOUT: '15' },
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
    console.error(`✗ Esa contraseña (${PGPASSWORD.length} caracteres) no es la de esta base.\n`)
    console.error(
      PUERTOS.length > 1
        ? `  Probé los puertos ${PUERTOS.join(' y ')}, y los dos la rechazaron.`
        : `  El puerto ${PUERTOS[0]} la rechazó.`,
    )
    console.error('\n  Reseteala en Supabase: Project Settings → Database → Reset database')
    console.error('  password. Copiala con el botón y volvé a correr esto mismo.\n')
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

// Todo en una transacción. Si el sexto archivo falla, los cinco anteriores se
// deshacen solos y la base queda como estaba. La alternativa es una biblioteca a
// medio cargar y un reintento que duplica lo que ya había entrado.
//
// Va a un archivo temporal y se corre con `-f`, no con `-c`. `-c` acepta un solo
// comando con barra invertida: con ocho `\i` corría el primero y descartaba los
// otros siete **sin decir nada**, y el script informaba éxito. Cargó 49 de 301 y
// dio el visto bueno.
const lista = join(mkdtempSync(join(tmpdir(), 'hilo-seed-')), 'todos.sql')
writeFileSync(lista, files.map((name) => `\\i ${join(DIR, name)}`).join('\n') + '\n')

try {
  psql(['--single-transaction', '-f', lista])
} catch (error) {
  console.error('✗ Se cortó cargando los materiales.\n')
  console.error(String(error.stderr ?? error.message).trim())
  console.error('\n  La transacción se deshizo: la base quedó como estaba, sin nada a medias.\n')
  process.exit(1)
}

// Contar y *comprobar*, no contar y pedirle a quien mira que compruebe. El
// mensaje anterior decía "cada profesión tiene que tener 50 o más" arriba de una
// tabla que tenía 2 — y como era una frase y no una condición, el script daba el
// visto bueno igual.
const MINIMO = 50
const DISCIPLINAS = 6

const filas = psql([
  '-t',
  '-A',
  '-F',
  '\t',
  '-c',
  'select discipline, count(*) from materials group by discipline order by discipline',
])
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((linea) => {
    const [discipline, count] = linea.split('\t')
    return { discipline, count: Number(count) }
  })

console.log()
for (const fila of filas) {
  const ok = fila.count >= MINIMO
  console.log(`  ${ok ? '✓' : '✗'} ${fila.discipline.padEnd(22)} ${fila.count}`)
}

const flojas = filas.filter((fila) => fila.count < MINIMO)
if (filas.length < DISCIPLINAS || flojas.length > 0) {
  console.error(`\n✗ Quedó incompleto.\n`)
  if (filas.length < DISCIPLINAS) {
    console.error(`  Hay ${filas.length} profesiones cargadas y tienen que ser ${DISCIPLINAS}.`)
  }
  for (const fila of flojas) {
    console.error(`  ${fila.discipline} tiene ${fila.count} y el mínimo es ${MINIMO}.`)
  }
  console.error('\n  Vaciá y volvé a intentar:\n')
  console.error('    delete from materials where practitioner_id is null;\n')
  process.exit(1)
}

console.log(`\n✓ ${filas.reduce((total, fila) => total + fila.count, 0)} materiales cargados.`)
