// Pruebas del motor del path, no repeticion, diversidad de
// categorias, regla compasiva y relajacion de filtros.
import { describe, expect, it } from "vitest";
import { seleccionarTareas, nuevaRacha, type Tarea } from "../src/lib/path";

const catalogo: Tarea[] = [
  { id: 1, titulo: "a", objetivo: "ansiedad", categoria: "respiracion", dificultad: 1, minutos: 5 },
  { id: 2, titulo: "b", objetivo: "ansiedad", categoria: "escritura", dificultad: 2, minutos: 10 },
  { id: 3, titulo: "c", objetivo: "ansiedad", categoria: "movimiento", dificultad: 1, minutos: 5 },
  { id: 4, titulo: "d", objetivo: "animo", categoria: "escritura", dificultad: 1, minutos: 10 },
  { id: 5, titulo: "e", objetivo: "animo", categoria: "creatividad", dificultad: 3, minutos: 15 },
  { id: 6, titulo: "f", objetivo: "conexion", categoria: "conexion", dificultad: 1, minutos: 5 },
];
const perfil = { objetivos: ["ansiedad", "animo"], categorias: ["escritura"], nivelDificultad: 2 };

describe("seleccionarTareas", () => {
  it("entrega 3 tareas con categorias distintas", () => {
    const sel = seleccionarTareas(catalogo, perfil, { recientes: new Set(), reduccionCompasiva: false, semilla: "2026-07-27" });
    expect(sel).toHaveLength(3);
    expect(new Set(sel.map((t) => t.categoria)).size).toBe(3);
  });
  it("respeta el nivel de dificultad maximo", () => {
    const sel = seleccionarTareas(catalogo, perfil, { recientes: new Set(), reduccionCompasiva: false, semilla: "x" });
    expect(sel.every((t) => t.dificultad <= 2)).toBe(true);
  });
  it("no repite tareas recientes cuando hay alternativas suficientes", () => {
    const sel = seleccionarTareas(catalogo, perfil, { recientes: new Set([1]), reduccionCompasiva: false, semilla: "x" });
    expect(sel.some((t) => t.id === 1)).toBe(false);
  });
  it("cuando no alcanzan las nuevas, prefiere las no recientes y completa el dia", () => {
    const sel = seleccionarTareas(catalogo, perfil, { recientes: new Set([1, 2]), reduccionCompasiva: false, semilla: "x" });
    expect(sel).toHaveLength(3);
    expect(sel.map((t) => t.id)).toContain(3);
    expect(sel.map((t) => t.id)).toContain(4);
  });
  it("relaja filtros antes que devolver un dia vacio", () => {
    const sel = seleccionarTareas(catalogo, perfil, { recientes: new Set([1, 2, 3, 4, 5, 6]), reduccionCompasiva: false, semilla: "x" });
    expect(sel).toHaveLength(3);
  });
  it("la regla compasiva baja a una sola tarea de dificultad 1", () => {
    const sel = seleccionarTareas(catalogo, perfil, { recientes: new Set(), reduccionCompasiva: true, semilla: "x" });
    expect(sel).toHaveLength(1);
    expect(sel[0].dificultad).toBe(1);
  });
  it("es determinista para la misma semilla", () => {
    const opciones = () => ({ recientes: new Set<number>(), reduccionCompasiva: false, semilla: "2026-07-27" });
    const a = seleccionarTareas(catalogo, perfil, opciones()).map((t) => t.id);
    const b = seleccionarTareas(catalogo, perfil, opciones()).map((t) => t.id);
    expect(a).toEqual(b);
  });
});

describe("nuevaRacha", () => {
  it("suma cuando el ultimo dia completo fue ayer", () => {
    expect(nuevaRacha(4, "2026-07-26", "2026-07-27", "2026-07-26")).toBe(5);
  });
  it("reinicia a 1 cuando hubo hueco, sin castigar con cero", () => {
    expect(nuevaRacha(9, "2026-07-20", "2026-07-27", "2026-07-26")).toBe(1);
  });
  it("no cambia si el dia de hoy ya estaba contado", () => {
    expect(nuevaRacha(3, "2026-07-27", "2026-07-27", "2026-07-26")).toBe(3);
  });
});
