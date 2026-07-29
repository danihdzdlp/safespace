// ============================================================
// Motor del path personalizado (documento, seccion 3.4).
// Funcion pura de seleccion, la idempotencia real la garantiza
// la restriccion UNIQUE(usuaria_id, fecha) en la base de datos.
// Probado en tests/path.test.ts.
// ============================================================

export interface Tarea {
  id: number;
  titulo: string;
  objetivo: string;
  categoria: string;
  dificultad: number;
  minutos: number;
  guia?: string | null;
}

export interface PerfilPath {
  objetivos: string[];
  categorias: string[];
  nivelDificultad: number;
}

interface Opciones {
  /** ids asignados en los ultimos 14 dias, para no repetir */
  recientes: Set<number>;
  /** true cuando hay 3 o mas dias con asignacion y cero completadas, regla compasiva */
  reduccionCompasiva: boolean;
  /** semilla estable por fecha para que el desempate cambie cada dia */
  semilla: string;
}

function hashEstable(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
  return h;
}

export function seleccionarTareas(catalogo: Tarea[], perfil: PerfilPath, opts: Opciones): Tarea[] {
  const k = opts.reduccionCompasiva ? 1 : 3;
  const difMax = opts.reduccionCompasiva ? 1 : perfil.nivelDificultad;

  // Relajacion progresiva de candidatas, nunca se devuelve un dia vacio
  const porObjetivo = catalogo.filter((t) => perfil.objetivos.includes(t.objetivo) && t.dificultad <= difMax);
  let elegibles = porObjetivo;
  if (elegibles.length < k) elegibles = catalogo.filter((t) => t.dificultad <= difMax);
  if (elegibles.length < k) elegibles = catalogo;

  // Puntaje ponderado, determinista y auditable (se descarto ML por explicabilidad, doc 3.4).
  // Lo reciente no se descarta de golpe, se castiga fuerte, asi solo entra
  // cuando no alcanzan las tareas nuevas para completar el dia.
  const puntuadas = elegibles
    .map((t) => ({
      t,
      s:
        (perfil.objetivos.includes(t.objetivo) ? 0.5 : 0) +
        (perfil.categorias.includes(t.categoria) ? 0.3 : 0) +
        (hashEstable(`${opts.semilla}:${t.id}`) % 100) / 500 -
        (opts.recientes.has(t.id) ? 10 : 0),
    }))
    .sort((a, b) => b.s - a.s || a.t.id - b.t.id);

  // Primera pasada, diversidad de categorias solo con tareas no recientes.
  // Segunda pasada de relleno por puntaje, donde lo reciente entra al final
  // unicamente si no alcanzo con lo nuevo.
  const seleccion: Tarea[] = [];
  const cats = new Set<string>();
  for (const { t } of puntuadas) {
    if (seleccion.length >= k) break;
    if (!opts.recientes.has(t.id) && !cats.has(t.categoria)) { seleccion.push(t); cats.add(t.categoria); }
  }
  for (const { t } of puntuadas) {
    if (seleccion.length >= k) break;
    if (!seleccion.some((x) => x.id === t.id)) seleccion.push(t);
  }
  return seleccion;
}

/** La racha premia volver, no castiga romperse (doc 3.4) */
export function nuevaRacha(rachaActual: number, ultimoDiaCompleto: string | null, hoy: string, ayer: string): number {
  if (ultimoDiaCompleto === hoy) return rachaActual;
  return ultimoDiaCompleto === ayer ? rachaActual + 1 : 1;
}
