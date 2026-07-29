// ============================================================
// El arbol personal. No guarda estado propio, la etapa se
// deriva del total de tareas completadas, asi nunca se
// desincroniza con la realidad. Probado en tests/arbol.test.ts.
// ============================================================

export const ETAPAS = [
  { min: 0, nombre: "Semilla" },
  { min: 1, nombre: "Brote" },
  { min: 5, nombre: "Retoño" },
  { min: 12, nombre: "Arbolito" },
  { min: 25, nombre: "Árbol joven" },
  { min: 50, nombre: "Árbol frondoso" },
] as const;

export interface EstadoArbol {
  etapa: number;
  nombre: string;
  completadas: number;
  /** pasos que faltan para la siguiente etapa, null si ya es la ultima */
  faltan: number | null;
  siguiente: string | null;
}

export function etapaDelArbol(completadas: number): EstadoArbol {
  const c = Math.max(0, Math.floor(completadas));
  let etapa = 0;
  for (let i = 0; i < ETAPAS.length; i++) if (c >= ETAPAS[i].min) etapa = i;
  const sig = etapa + 1 < ETAPAS.length ? ETAPAS[etapa + 1] : null;
  return {
    etapa,
    nombre: ETAPAS[etapa].nombre,
    completadas: c,
    faltan: sig ? sig.min - c : null,
    siguiente: sig ? sig.nombre : null,
  };
}

export type Clima = "lluvia" | "nublado" | "solnubes" | "sol" | "neutro";

/** El paisaje refleja el animo registrado hoy, sin juzgarlo.
 *  1 y 2 llueve tranquilo, 3 nublado, 4 sol entre nubes, 5 sol pleno. */
export function climaPorAnimo(valor: number | null | undefined): Clima {
  if (valor == null) return "neutro";
  if (valor <= 2) return "lluvia";
  if (valor === 3) return "nublado";
  if (valor === 4) return "solnubes";
  return "sol";
}
