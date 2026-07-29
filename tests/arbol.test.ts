import { describe, expect, it } from "vitest";
import { climaPorAnimo, etapaDelArbol } from "../src/lib/arbol";

describe("etapaDelArbol", () => {
  it("empieza como semilla con cero completadas", () => {
    const e = etapaDelArbol(0);
    expect(e.nombre).toBe("Semilla");
    expect(e.faltan).toBe(1);
    expect(e.siguiente).toBe("Brote");
  });
  it("brota con la primera tarea completada", () => {
    expect(etapaDelArbol(1).nombre).toBe("Brote");
  });
  it("respeta los umbrales exactos de cada etapa", () => {
    expect(etapaDelArbol(4).nombre).toBe("Brote");
    expect(etapaDelArbol(5).nombre).toBe("Retoño");
    expect(etapaDelArbol(12).nombre).toBe("Arbolito");
    expect(etapaDelArbol(25).nombre).toBe("Árbol joven");
  });
  it("el arbol frondoso es la ultima etapa y ya no pide mas", () => {
    const e = etapaDelArbol(80);
    expect(e.nombre).toBe("Árbol frondoso");
    expect(e.faltan).toBeNull();
    expect(e.siguiente).toBeNull();
  });
});

describe("climaPorAnimo", () => {
  it("mapea el animo del dia al paisaje sin juzgar", () => {
    expect(climaPorAnimo(null)).toBe("neutro");
    expect(climaPorAnimo(1)).toBe("lluvia");
    expect(climaPorAnimo(2)).toBe("lluvia");
    expect(climaPorAnimo(3)).toBe("nublado");
    expect(climaPorAnimo(4)).toBe("solnubes");
    expect(climaPorAnimo(5)).toBe("sol");
  });
});
