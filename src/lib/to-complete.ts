/**
 * La marca de lo que falta escribir en un borrador de emergencia.
 *
 * La pone el borrador que se arma cuando la IA no responde, en cada sección que
 * es criterio clínico. Mientras quede una, el documento no se firma: un
 * "[A completar]" impreso con firma y fecha es peor que un informe que llega un
 * día tarde. Vive en `src/lib/` porque la usan el servidor (que lo impide) y el
 * editor (que lo avisa).
 */
export const TO_COMPLETE = '[A completar]'
