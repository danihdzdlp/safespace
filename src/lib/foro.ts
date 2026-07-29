// ============================================================
// Logica de la ventana horaria del foro. Modulo puro, sin efectos,
// para poder probarlo de forma aislada (tests/foro.test.ts).
//
// Decision de diseno (documento, seccion 3.2): el estado del foro
// no se almacena, se deriva del reloj del SERVIDOR contra la zona
// oficial. El reloj del cliente solo pinta la interfaz.
// ============================================================

export const ZONA_OFICIAL = "America/Mexico_City";
export const APERTURA_MIN = 20 * 60; // 20:00
export const CIERRE_MIN = 21 * 60 + 30; // 21:30

export interface EstadoForo {
  abierto: boolean;
  /** segundos hacia el cierre si esta abierto, hacia la apertura si esta cerrado */
  restanteSeg: number;
  temaDelDia: string;
}

const TEMAS_DIA = [
  "Qué te ayudó esta semana, aunque fuera pequeño",
  "Lo que me cuesta decir en voz alta",
  "Un miedo que quiero soltar",
  "Cómo se ve un buen día para mí",
  "Lo que aprendí de un mal momento",
  "Sesión libre, comparte lo que traes hoy",
  "Algo que quiero agradecerme a mí",
];

/** Hora local del centro de Mexico para un instante dado. Usa la base IANA, no desplazamientos fijos. */
export function horaEnMexico(instante: Date): { h: number; m: number; s: number; diaDelMes: number; mes: number } {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA_OFICIAL,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).formatToParts(instante);
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value ?? 0);
  // Intl puede devolver hora 24 para medianoche, se normaliza a 0
  return { h: valor("hour") % 24, m: valor("minute"), s: valor("second"), diaDelMes: valor("day"), mes: valor("month") };
}

/** Fecha YYYY-MM-DD en la zona oficial. El dia de la app corta a medianoche del centro de Mexico. */
export function fechaOficial(instante: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_OFICIAL }).format(instante);
}

export function estadoDelForo(instante: Date = new Date()): EstadoForo {
  const { h, m, s, diaDelMes, mes } = horaEnMexico(instante);
  const seg = h * 3600 + m * 60 + s;
  const apertura = APERTURA_MIN * 60;
  const cierre = CIERRE_MIN * 60;
  const abierto = seg >= apertura && seg < cierre;
  const restanteSeg = abierto
    ? cierre - seg
    : seg < apertura
      ? apertura - seg
      : 86400 - seg + apertura;
  const temaDelDia = TEMAS_DIA[(diaDelMes + mes) % TEMAS_DIA.length];
  return { abierto, restanteSeg, temaDelDia };
}

export function formatoRestante(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  const dd = (n: number) => String(n).padStart(2, "0");
  return `${dd(h)}:${dd(m)}:${dd(s)}`;
}
