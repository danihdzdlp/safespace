import { describe, expect, it } from "vitest";
import { AFIRMACIONES, fraseDeLaHora } from "../src/lib/frases";

const cdmx = (h: number) => new Date(Date.UTC(2026, 6, 28, h + 6, 15, 0));

describe("fraseDeLaHora", () => {
  it("es la misma dentro de la misma hora", () => {
    expect(fraseDeLaHora(cdmx(10))).toBe(fraseDeLaHora(cdmx(10)));
  });
  it("cambia al cambiar la hora", () => {
    expect(fraseDeLaHora(cdmx(10))).not.toBe(fraseDeLaHora(cdmx(11)));
  });
  it("siempre entrega una frase valida del catalogo", () => {
    for (let h = 0; h < 24; h++) expect(AFIRMACIONES).toContain(fraseDeLaHora(cdmx(h)));
  });
});
