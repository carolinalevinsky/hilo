import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Términos y Condiciones · Hilo' }

/**
 * Transcribed from `legacy/index.html:1849`. The wording is the product's, not
 * boilerplate — it was written for Uruguayan practice and it names the right
 * law. Rewriting it would only lose that.
 *
 * As markup, not a string of HTML: v1 built these with `innerHTML`, which is the
 * habit that produced its XSS surface. Here React escapes everything by default.
 */
export default function TermsPage() {
  return (
    <>
      <h1>Términos y Condiciones de uso</h1>

      <p>
        <b>1. Aceptación.</b> Al crear una cuenta y usar Hilo (“la Herramienta”, operada por
        Hepic) aceptás estos Términos y la Política de Privacidad. Si no estás de acuerdo, no
        la uses.
      </p>
      <p>
        <b>2. Qué es Hilo.</b> Hilo es una herramienta digital de gestión y asistencia para
        profesionales de la salud y la educación.{' '}
        <b>
          No reemplaza el juicio profesional, no brinda diagnóstico ni tratamiento, y no
          constituye asesoramiento médico, psicológico ni legal.
        </b>
      </p>
      <p>
        <b>3. Rol de las partes.</b> El/la profesional es el/la <b>responsable</b> del
        tratamiento de los datos de sus pacientes y del contenido clínico. Hilo es únicamente
        el proveedor de la herramienta. El criterio y la firma de todo documento son siempre
        del/de la profesional.
      </p>
      <p>
        <b>4. Inteligencia artificial.</b> Algunas funciones generan borradores con IA.{' '}
        <b>
          Son borradores para revisar, corregir y firmar por el/la profesional
        </b>
        , que es responsable del contenido final. La IA puede cometer errores u omisiones.
        Para generar los borradores, los textos ingresados pueden procesarse con proveedores
        de IA (ver Política de Privacidad).
      </p>
      <p>
        <b>5. Obligaciones del/de la profesional.</b> Usar la Herramienta conforme a la ley y
        a su ética profesional; contar con la habilitación correspondiente;{' '}
        <b>
          obtener el consentimiento informado de la familia o del paciente antes de cargar
          datos
        </b>
        ; ingresar datos veraces; usar una contraseña segura y no compartir su acceso;
        revisar y validar todo contenido antes de usarlo.
      </p>
      <p>
        <b>6. Uso aceptable.</b> No usar la Herramienta para fines ilícitos, ni cargar datos
        de terceros sin base legal o consentimiento.
      </p>
      <p>
        <b>7. Sin garantías.</b> La Herramienta se ofrece “tal cual” y “según
        disponibilidad”, sin garantía de funcionamiento ininterrumpido ni de ausencia de
        errores.
      </p>
      <p>
        <b>8. Límite de responsabilidad.</b> En la máxima medida permitida por la ley, Hepic
        no será responsable por daños indirectos, incidentales, pérdida de datos o lucro
        cesante, ni por el contenido clínico, las decisiones profesionales o los documentos
        generados y/o firmados por el/la profesional. La responsabilidad total, de existir,
        se limita al monto abonado por el servicio en los tres (3) meses previos.
      </p>
      <p>
        <b>9. Indemnidad.</b> El/la profesional mantendrá indemne a Hepic frente a reclamos
        de terceros (familias, pacientes, instituciones u organismos) derivados de su uso de
        la Herramienta, del contenido que carga o genera, o del incumplimiento de sus
        obligaciones, incluida la falta de consentimiento.
      </p>
      <p>
        <b>10. Datos personales.</b> El tratamiento de datos se rige por la Política de
        Privacidad y por la Ley N.º 18.331 (Uruguay).
      </p>
      <p>
        <b>11. Propiedad intelectual.</b> La Herramienta y su software pertenecen a Hepic. El
        contenido cargado por el/la profesional es de su titularidad.
      </p>
      <p>
        <b>12. Pagos.</b> Los cobros a las familias se realizan directamente entre el/la
        profesional y la familia; Hilo solo facilita el medio (por ejemplo, Mercado Pago) y
        no es parte de esa relación ni retiene los fondos.
      </p>
      <p>
        <b>13. Baja y suspensión.</b> Podés darte de baja cuando quieras. Podemos suspender
        cuentas ante incumplimientos de estos Términos.
      </p>
      <p>
        <b>14. Cambios.</b> Podemos actualizar estos Términos; los cambios relevantes se
        comunicarán dentro de la Herramienta.
      </p>
      <p>
        <b>15. Ley y jurisdicción.</b> Se rigen por las leyes de la República Oriental del
        Uruguay, ante sus tribunales competentes.
      </p>
      <p>
        <b>16. Contacto.</b> [correo de contacto de Hepic].
      </p>
    </>
  )
}
