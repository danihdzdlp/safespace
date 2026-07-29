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
  { n: 1, texto: "Que te trae a SafeSpace?", tipo: "multi", max: 3, ops: ["Manejar la ansiedad", "Mejorar mi estado de animo", "Sentirme menos sola o solo", "Mejorar mis relaciones", "Conocerme mejor"] },
  { n: 2, texto: "En las ultimas dos semanas, como describirias tu estado de animo general?", tipo: "escala", low: "Muy bajo", high: "Muy bien" },
  { n: 3, texto: "Que tan seguido sientes estres o ansiedad?", tipo: "uno", ops: ["Casi nunca", "Algunas veces por semana", "Casi todos los dias", "Varias veces al dia"] },
  { n: 4, texto: "Como has dormido en las ultimas semanas?", tipo: "uno", ops: ["Bien", "Regular", "Mal"] },
  { n: 5, texto: "Cuanta energia tienes en un dia tipico?", tipo: "escala", low: "Muy poca", high: "Mucha" },
  { n: 6, texto: "Cuando te sientes mal, con quien cuentas?", tipo: "multi", max: 4, ops: ["Familia", "Amistades", "Pareja", "Por ahora con nadie"] },
  { n: 7, texto: "Que tan comoda o comodo te sientes hablando de tus emociones?", tipo: "escala", low: "Nada", high: "Mucho" },
  { n: 8, texto: "Que actividades te ayudan a sentirte mejor?", tipo: "multi", max: 6, ops: ["Escribir", "Mover el cuerpo", "Respirar o meditar", "Leer", "Crear algo", "Hablar con alguien"] },
  { n: 9, texto: "Cuanto tiempo real puedes dedicar a tu bienestar cada dia?", tipo: "uno", ops: ["5 minutos", "De 10 a 15 minutos", "De 20 a 30 minutos", "Mas de 30 minutos"] },
  { n: 10, texto: "En que momento del dia prefieres hacer tus actividades?", tipo: "uno", ops: ["Manana", "Tarde", "Noche"] },
  { n: 11, texto: "Has usado antes alguna app o herramienta de bienestar?", tipo: "uno", ops: ["Si y me funciono", "Si pero la deje", "Nunca"] },
  { n: 12, texto: "Llevas actualmente un proceso con un profesional de la salud mental?", tipo: "uno", ops: ["Si", "No", "Lo estoy considerando"] },
  { n: 13, texto: "Que tanto te presionas cuando no cumples lo que te propones?", tipo: "escala", low: "Casi nada", high: "Muchisimo" },
  { n: 14, texto: "Del 1 al 5, que tan sobrecargada o sobrecargado te sientes en este momento de tu vida?", tipo: "escala", low: "Nada", high: "Al limite" },
  { n: 15, texto: "Que te gustaria poder decir dentro de un mes?", tipo: "uno", ops: ["Me siento mas tranquila o tranquilo", "Tengo habitos que me sostienen", "Me siento menos sola o solo", "Me conozco mejor"] },
];

const MAPA_OBJETIVOS: Record<string, string> = {
  "Manejar la ansiedad": "ansiedad",
  "Mejorar mi estado de animo": "animo",
  "Sentirme menos sola o solo": "conexion",
  "Mejorar mis relaciones": "relaciones",
  "Conocerme mejor": "autoconocimiento",
};
const MAPA_META: Record<string, string> = {
  "Me siento mas tranquila o tranquilo": "ansiedad",
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
  if (r[9] === "De 20 a 30 minutos" || r[9] === "Mas de 30 minutos") puntos++;
  if (r[11] === "Si y me funciono") puntos++;
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
