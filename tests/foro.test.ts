// Pruebas de la ventana horaria. Se prueban los limites exactos,
// publicar a las 21:29:59 debe ser valido y a las 21:30:00 no.
// Los instantes se construyen en UTC equivalentes a la hora del
// centro de Mexico (UTC-6 sin horario de verano desde 2023).
import { describe, expect, it } from "vitest";
import { estadoDelForo, fechaOficial, formatoRestante, horaEnMexico } from "../src/lib/foro";

// helper, un instante cuya hora en America/Mexico_City es h:m:s
const cdmx = (h: number, m: number, s: number) => new Date(Date.UTC(2026, 6, 27, h + 6, m, s));

describe("estadoDelForo", () => {
  it("cerrado justo antes de la sesion de la tarde", () => {
    const e = estadoDelForo(cdmx(14, 59, 59));
    expect(e.abierto).toBe(false);
    expect(e.restanteSeg).toBe(1);
  });
  it("abre exactamente a las 15:00:00", () => {
    expect(estadoDelForo(cdmx(15, 0, 0)).abierto).toBe(true);
  });
  it("sigue abierto a las 16:59:59 y cierra a las 17:00:00", () => {
    expect(estadoDelForo(cdmx(16, 59, 59)).abierto).toBe(true);
    expect(estadoDelForo(cdmx(17, 0, 0)).abierto).toBe(false);
  });
  it("entre sesiones, el restante corre hacia las 20:00", () => {
    const e = estadoDelForo(cdmx(17, 0, 0));
    expect(e.restanteSeg).toBe(3 * 3600);
  });
  it("abre exactamente a las 20:00:00", () => {
    expect(estadoDelForo(cdmx(20, 0, 0)).abierto).toBe(true);
  });
  it("sigue abierto a las 21:59:59 y cierra a las 22:00:00", () => {
    expect(estadoDelForo(cdmx(21, 59, 59)).abierto).toBe(true);
    expect(estadoDelForo(cdmx(22, 0, 0)).abierto).toBe(false);
  });
  it("despues del ultimo cierre, la proxima apertura es manana a las 15:00", () => {
    const e = estadoDelForo(cdmx(23, 0, 0));
    expect(e.abierto).toBe(false);
    expect(e.restanteSeg).toBe(16 * 3600);
  });
  it("siempre entrega un tema del dia", () => {
    expect(estadoDelForo(cdmx(12, 0, 0)).temaDelDia.length).toBeGreaterThan(3);
  });
});

describe("utilidades de tiempo", () => {
  it("convierte a hora del centro de Mexico", () => {
    expect(horaEnMexico(cdmx(20, 15, 30))).toMatchObject({ h: 20, m: 15, s: 30 });
  });
  it("la fecha oficial corta a medianoche de Mexico, no de UTC", () => {
    // 23:30 en CDMX del 27 de julio son las 05:30 UTC del 28
    expect(fechaOficial(cdmx(23, 30, 0))).toBe("2026-07-27");
  });
  it("formatea el restante como hh:mm:ss", () => {
    expect(formatoRestante(3671)).toBe("01:01:11");
  });
});
