// ============================================================
// Cuestionario inicial (Anexo C del documento) y construccion
// del perfil. Modulo puro y probado en tests/perfil.test.ts.
// El cuestionario personaliza, nunca diagnostica.
// ============================================================

export type Respuestas = Record<number, string | number | string[]>;

export interface PerfilCalculado {
  objetivos: string[];
  categorias: string[];
  nivelDificultad: 1 | 2 | 3;
  invitacionForo: "activa" | "suave";
  animoBase: number;
  mostrarApoyo: boolean;
}

export interface Pregunta {
  n: number;
  texto: string;
  tipo: "escala" | "uno" | "multi";
  ops?: string[];
  max?: number;
  low?: string;
  high?: string;
}

export const PREGUNTAS: Pregunta[] = [
  { n: 1, texto: "¿Qué te trae a SafeSpace?", tipo: "multi", max: 3, ops: ["Manejar la ansiedad", "Mejorar mi estado de ánimo", "Sentirme menos sola o solo", "Mejorar mis relaciones", "Conocerme mejor"] },
  { n: 2, texto: "En las últimas dos semanas, ¿cómo describirías tu estado de ánimo general?", tipo: "escala", low: "Muy bajo", high: "Muy bien" },
  { n: 3, texto: "¿Qué tan seguido sientes estrés o ansiedad?", tipo: "uno", ops: ["Casi nunca", "Algunas veces por semana", "Casi todos los días", "Varias veces al día"] },
  { n: 4, texto: "¿Cómo has dormido en las últimas semanas?", tipo: "uno", ops: ["Bien", "Regular", "Mal"] },
  { n: 5, texto: "¿Cuánta energía tienes en un día típico?", tipo: "escala", low: "Muy poca", high: "Mucha" },
  { n: 6, texto: "Cuando te sientes mal, ¿con quién cuentas?", tipo: "multi", max: 4, ops: ["Familia", "Amistades", "Pareja", "Por ahora con nadie"] },
  { n: 7, texto: "¿Qué tan cómoda o cómodo te sientes hablando de tus emociones?", tipo: "escala", low: "Nada", high: "Mucho" },
  { n: 8, texto: "¿Qué actividades te ayudan a sentirte mejor?", tipo: "multi", max: 6, ops: ["Escribir", "Mover el cuerpo", "Respirar o meditar", "Leer", "Crear algo", "Hablar con alguien"] },
  { n: 9, texto: "¿Cuánto tiempo real puedes dedicar a tu bienestar cada día?", tipo: "uno", ops: ["5 minutos", "De 10 a 15 minutos", "De 20 a 30 minutos", "Más de 30 minutos"] },
  { n: 10, texto: "¿En qué momento del día prefieres hacer tus actividades?", tipo: "uno", ops: ["Mañana", "Tarde", "Noche"] },
  { n: 11, texto: "¿Has usado antes alguna app o herramienta de bienestar?", tipo: "uno", ops: ["Sí y me funcionó", "Sí pero la dejé", "Nunca"] },
  { n: 12, texto: "¿Llevas actualmente un proceso con un profesional de la salud mental?", tipo: "uno", ops: ["Si", "No", "Lo estoy considerando"] },
  { n: 13, texto: "¿Qué tanto te presionas cuando no cumples lo que te propones?", tipo: "escala", low: "Casi nada", high: "Muchisimo" },
  { n: 14, texto: "Del 1 al 5, ¿qué tan sobrecargada o sobrecargado te sientes en este momento de tu vida?", tipo: "escala", low: "Nada", high: "Al límite" },
  { n: 15, texto: "¿Qué te gustaría poder decir dentro de un mes?", tipo: "uno", ops: ["Me siento más tranquila o tranquilo", "Tengo habitos que me sostienen", "Me siento menos sola o solo", "Me conozco mejor"] },
];

const MAPA_OBJETIVOS: Record<string, string> = {
  "Manejar la ansiedad": "ansiedad",
  "Mejorar mi estado de ánimo": "animo",
  "Sentirme menos sola o solo": "conexion",
  "Mejorar mis relaciones": "relaciones",
  "Conocerme mejor": "autoconocimiento",
};
const MAPA_META: Record<string, string> = {
  "Me siento más tranquila o tranquilo": "ansiedad",
  "Tengo habitos que me sostienen": "animo",
  "Me siento menos sola o solo": "conexion",
  "Me conozco mejor": "autoconocimiento",
};
const MAPA_CATS: Record<string, string> = {
  Escribir: "escritura",
  "Mover el cuerpo": "movimiento",
  "Respirar o meditar": "respiracion",
  Leer: "lectura",
  "Crear algo": "creatividad",
  "Hablar con alguien": "conexion",
};

export function construirPerfil(r: Respuestas): PerfilCalculado {
  const objetivos = new Set<string>();
  for (const op of (r[1] as string[]) ?? []) if (MAPA_OBJETIVOS[op]) objetivos.add(MAPA_OBJETIVOS[op]);
  const meta = MAPA_META[r[15] as string];
  if (meta) objetivos.add(meta);
  if (r[4] === "Mal") objetivos.add("descanso");
  if (objetivos.size === 0) { objetivos.add("animo"); objetivos.add("autoconocimiento"); }

  // La dificultad inicial se gana con senales, y la sobrecarga manda sobre todo lo demas
  let puntos = 0;
  if (Number(r[5] ?? 3) >= 4) puntos++;
  if (r[9] === "De 20 a 30 minutos" || r[9] === "Más de 30 minutos") puntos++;
  if (r[11] === "Sí y me funcionó") puntos++;
  if (Number(r[14] ?? 3) >= 4) puntos = 0;
  const nivelDificultad = (1 + Math.min(puntos, 2)) as 1 | 2 | 3;

  const categorias = ((r[8] as string[]) ?? []).map((o) => MAPA_CATS[o]).filter(Boolean);
  const sinRed = ((r[6] as string[]) ?? []).includes("Por ahora con nadie");
  const invitacionForo: "activa" | "suave" = Number(r[7] ?? 3) <= 2 ? "suave" : "activa";
  const animoBase = Number(r[2] ?? 3);

  // Regla de cuidado, no bloquea ni etiqueta, solo acerca apoyo desde el primer minuto
  const mostrarApoyo = animoBase <= 2 && Number(r[14] ?? 3) >= 4;

  return {
    objetivos: Array.from(sinRed ? objetivos.add("conexion") : objetivos),
    categorias,
    nivelDificultad,
    invitacionForo,
    animoBase,
    mostrarApoyo,
  };
}
