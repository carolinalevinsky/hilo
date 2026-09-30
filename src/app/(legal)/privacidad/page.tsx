import type { Metadata } from 'next'
import { pageTitle } from '@/lib/brand'

export const metadata: Metadata = { title: pageTitle('Política de Privacidad') }

/**
 * Transcribed from `legacy/index.html:1867`.
 *
 * One line of it is a promise the architecture now actually keeps: "cada
 * profesional accede únicamente a sus propios pacientes (aislamiento por usuario
 * a nivel de base de datos)." In v1 that was aspirational. In v2 it is Row Level
 * Security, and there is a test that fails the build if it stops being true.
 *
 * ─── Lo que esta página no puede prometer ──────────────────────────────────
 *
 * Decía "Con quién se comparten: con nadie", mientras el texto clínico viajaba a
 * Anthropic, en Estados Unidos, y los datos se guardaban fuera del país. Decía
 * que se recolectaba "documento", que no existe en la base, y que después del
 * tratamiento los datos "se suprimen o anonimizan", que nada hace. Cada frase de
 * acá tiene que poder señalarse en el código; si una deja de ser cierta, se
 * cambia la frase o se cambia el código, en el mismo commit.
 */
export default function PrivacyPage() {
  return (
    <>
      <h1>Política de Privacidad</h1>

      <p>
        <b>Responsable del tratamiento.</b> El/la profesional que usa Ombúa es el/la
        responsable del tratamiento de los datos de sus pacientes. Ombúa (Hepic) es la
        herramienta que utiliza para gestionarlos.
      </p>
      <p>
        <b>Qué datos se tratan.</b> Datos identificatorios del paciente y su familia (nombre,
        fecha de nacimiento, contacto), datos de salud (motivo, evaluaciones, objetivos,
        evolución, informes) que son datos sensibles según la Ley N.º 18.331, y datos
        administrativos (institución, mutualista, honorarios).
      </p>
      <p>
        <b>Finalidad.</b> Seguimiento clínico del paciente, elaboración de informes y gestión
        de la práctica profesional. No se usan con fines publicitarios ni se venden a
        terceros.
      </p>
      <p>
        <b>Base legal.</b> Consentimiento previo, expreso e informado de la familia (art. 18)
        y habilitación de los profesionales de la salud a tratar datos de sus pacientes bajo
        secreto profesional (art. 19).
      </p>
      <p>
        <b>Uso de inteligencia artificial.</b> Para generar borradores de informes,
        evaluaciones y notas, Ombúa envía el contexto clínico necesario (edad, escolaridad,
        objetivos, notas de sesión) a Anthropic, un proveedor de IA con servidores en
        Estados Unidos. <b>El nombre del paciente no se envía:</b> viaja reemplazado por un
        marcador y Ombúa lo vuelve a poner en el texto que recibe. Anthropic no usa estos
        datos para entrenar sus modelos. Lo que devuelve la IA es siempre un borrador que el/la
        profesional revisa y firma; mientras no esté firmado, la hoja impresa dice
        «Borrador · sin firmar».
      </p>
      <p>
        <b>Archivos enviados a la IA.</b> Al subir un material propio (un PDF o una imagen)
        y pedir que Ombúa lo describa, ese archivo se envía al proveedor de IA para poder
        leerlo. La pantalla de carga lo advierte antes de elegir el archivo y
        recomienda que no contenga datos de ningún paciente. La descripción que devuelve la
        IA queda como borrador editable y no se guarda hasta que el/la profesional la
        confirma.
      </p>
      <p>
        <b>Dictado por voz.</b> El botón de dictar usa el reconocimiento de voz del propio
        navegador. Para convertir la voz en texto, el navegador envía el audio a su servicio
        de dictado —en Chrome, el de Google; en Safari, el de Apple— y devuelve el texto. Ese
        audio no pasa por los servidores de Ombúa ni queda guardado en Ombúa: lo que se recibe
        y se guarda es únicamente el texto, y sólo cuando el/la profesional lo confirma. Si
        preferís que el audio no salga del dispositivo, escribí a mano o usá el dictado del
        teclado de tu teléfono, que procesa la voz en el propio equipo.
      </p>
      <p>
        <b>Dónde se guardan y cómo se protegen.</b> Los datos se almacenan en servidores con
        cifrado en tránsito y en reposo. El acceso es por cuenta y contraseña, y cada
        profesional accede únicamente a sus propios pacientes (aislamiento por usuario a
        nivel de base de datos).
      </p>
      <p>
        <b>Proveedores que intervienen.</b> Ombúa no vende ni cede datos. Para funcionar usa
        estos proveedores, que tratan los datos sólo para prestar el servicio:
      </p>
      <ul>
        <li>
          <b>Supabase</b> — la base de datos y los archivos.
        </li>
        <li>
          <b>Vercel</b> — los servidores donde corre la aplicación.
        </li>
        <li>
          <b>Anthropic</b> — la inteligencia artificial, sin el nombre del paciente (ver
          arriba).
        </li>
        <li>
          <b>Resend</b> — el envío de correos. Los correos sólo avisan (una reserva nueva,
          un resumen con cantidades) y no llevan contenido clínico.
        </li>
        <li>
          <b>Google Calendar</b> — sólo si el/la profesional lo conecta. Las sesiones se ven
          en su calendario con el nombre, las iniciales o sólo «Ocupado», según lo que elija
          en su perfil.
        </li>
      </ul>
      <p>
        <b>Transferencia internacional.</b> Estos proveedores tienen sus servidores fuera de
        Uruguay (en Brasil y en Estados Unidos). Por eso el consentimiento que firma la
        familia lo menciona de forma expresa (Ley N.º 18.331, art. 23).
      </p>
      <p>
        <b>Con quién más se comparten.</b> Con nadie, salvo autorización expresa de la familia
        (por ejemplo, entregar un informe al colegio o a la mutualista) o requerimiento
        legal.
      </p>
      <p>
        <b>Conservación.</b> La historia clínica se conserva por los plazos que exigen las
        obligaciones profesionales y legales. Por eso nada clínico se borra de forma
        definitiva: lo que se borra en Ombúa va a una papelera desde donde se puede recuperar,
        un informe firmado no se modifica (se corrige con una versión nueva) y, si hay que
        dejarlo sin efecto, se anula indicando el motivo.
      </p>
      <p>
        <b>Derechos.</b> La familia puede acceder, rectificar, actualizar o solicitar la
        supresión de los datos. Desde la ficha del paciente, el/la profesional puede{' '}
        <b>exportar</b> todos los datos —en una página para leer o imprimir, y en un archivo
        completo— o <b>borrar al paciente</b>: deja de aparecer en Ombúa y sus datos no se
        vuelven a usar ni a enviar a nadie, y se conservan sólo por las obligaciones legales
        de la historia clínica. Ante reclamos, el organismo de control es la Unidad
        Reguladora y de Control de Datos Personales (URCDP).
      </p>
      <p>
        <b>Contacto.</b> [correo de contacto de Hepic].
      </p>
    </>
  )
}
