import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Política de Privacidad · Hilo' }

/**
 * Transcribed from `legacy/index.html:1867`.
 *
 * One line of it is a promise the architecture now actually keeps: "cada
 * profesional accede únicamente a sus propios pacientes (aislamiento por usuario
 * a nivel de base de datos)." In v1 that was aspirational. In v2 it is Row Level
 * Security, and there is a test that fails the build if it stops being true.
 */
export default function PrivacyPage() {
  return (
    <>
      <h1>Política de Privacidad</h1>

      <p>
        <b>Responsable del tratamiento.</b> El/la profesional que usa Hilo es el/la
        responsable del tratamiento de los datos de sus pacientes. Hilo (Hepic) es la
        herramienta que utiliza para gestionarlos.
      </p>
      <p>
        <b>Qué datos se tratan.</b> Datos identificatorios del paciente y su familia (nombre,
        edad, documento, contacto), datos de salud (motivo, evaluaciones, objetivos,
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
        evaluaciones y notas, los textos ingresados pueden enviarse a un proveedor de IA que
        los procesa para devolver el borrador. Se recomienda minimizar los datos
        identificatorios innecesarios. El contenido final siempre lo revisa y valida el/la
        profesional.
      </p>
      <p>
        <b>Dónde se guardan y cómo se protegen.</b> Los datos se almacenan en servidores con
        cifrado en tránsito y en reposo. El acceso es por cuenta y contraseña, y cada
        profesional accede únicamente a sus propios pacientes (aislamiento por usuario a
        nivel de base de datos).
      </p>
      <p>
        <b>Con quién se comparten.</b> Con nadie, salvo autorización expresa de la familia
        (por ejemplo, enviar un informe al colegio o a la mutualista) o requerimiento legal.
      </p>
      <p>
        <b>Conservación.</b> Mientras dure el tratamiento y por los plazos que exijan las
        obligaciones profesionales y legales; luego se suprimen o anonimizan.
      </p>
      <p>
        <b>Derechos.</b> La familia puede acceder, rectificar, actualizar o solicitar la
        supresión de los datos. Desde la ficha del paciente, el/la profesional puede{' '}
        <b>exportar</b> todos los datos o <b>borrarlos</b>. Ante reclamos, el organismo de
        control es la Unidad Reguladora y de Control de Datos Personales (URCDP).
      </p>
      <p>
        <b>Contacto.</b> [correo de contacto de Hepic].
      </p>
    </>
  )
}
