// ============================================================
// Afirmacion de la hora. Cambia cada hora en punto, hora del
// centro de Mexico, y es la misma para todas las personas en
// esa hora, deterministica y probada en tests/frases.test.ts.
// Tono cuidado, acompanan sin exigir ni prometer de mas.
// ============================================================
import { horaEnMexico } from "./foro";

export const AFIRMACIONES = [
  "Está bien estar mal. No tienes que fingir lo contrario.",
  "Vales mucho y mereces amor, también el tuyo.",
  "No tienes que poder con todo hoy. Con algo alcanza.",
  "Lo que sientes es válido, aunque nadie más lo vea.",
  "Pedir ayuda es de valientes.",
  "Hoy cuenta, aunque solo hayas respirado hondo.",
  "No eres tus peores pensamientos.",
  "Puedes empezar de nuevo las veces que haga falta.",
  "Ir lento también es avanzar.",
  "Mereces el mismo cariño que le das a los demás.",
  "Tu ritmo es tu ritmo. No hay carrera.",
  "Las emociones son olas, ninguna se queda para siempre.",
  "Descansar no es rendirse.",
  "Hoy no tiene que ser perfecto para valer la pena.",
  "Eres más fuerte de lo que ese pensamiento dice.",
  "Un paso pequeño sigue siendo un paso.",
  "Está bien decir que no.",
  "No estás sola en esto, aunque a veces lo parezca.",
  "Lo que hoy pesa tanto no va a pesar igual siempre.",
  "Tratarte con cuidado también es cuidar tu futuro.",
  "Sentir mucho no es un defecto.",
  "Mañana se construye con lo poquito de hoy.",
  "Tu presencia ya suma, no tienes que demostrar nada.",
  "Volver siempre cuenta, sin importar cuántas veces te fuiste.",
];

export function fraseDeLaHora(instante: Date = new Date()): string {
  const { h, diaDelMes } = horaEnMexico(instante);
  return AFIRMACIONES[(diaDelMes * 24 + h) % AFIRMACIONES.length];
}
