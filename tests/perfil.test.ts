// Pruebas del cuestionario a perfil, la sobrecarga manda sobre
// cualquier otra senal y la regla de cuidado se activa correctamente.
import { describe, expect, it } from "vitest";
import { construirPerfil } from "../src/lib/perfil";

describe("construirPerfil", () => {
  it("mapea objetivos y suma descanso si el sueno es malo", () => {
    const p = construirPerfil({ 1: ["Manejar la ansiedad"], 4: "Mal", 15: "Me conozco mejor" });
    expect(p.objetivos).toContain("ansiedad");
    expect(p.objetivos).toContain("autoconocimiento");
    expect(p.objetivos).toContain("descanso");
  });
  it("nadie inicia arriba de nivel 3 y las senales suman", () => {
    const p = construirPerfil({ 5: 5, 9: "Más de 30 minutos", 11: "Sí y me funcionó" });
    expect(p.nivelDificultad).toBe(3);
  });
  it("la sobrecarga alta manda sobre todo lo demas", () => {
    const p = construirPerfil({ 5: 5, 9: "Más de 30 minutos", 11: "Sí y me funcionó", 14: 5 });
    expect(p.nivelDificultad).toBe(1);
  });
  it("activa la pantalla de apoyo con animo bajo y sobrecarga alta", () => {
    expect(construirPerfil({ 2: 1, 14: 5 }).mostrarApoyo).toBe(true);
    expect(construirPerfil({ 2: 4, 14: 5 }).mostrarApoyo).toBe(false);
  });
  it("con comodidad baja para hablar la invitacion al foro es suave", () => {
    expect(construirPerfil({ 7: 1 }).invitacionForo).toBe("suave");
  });
  it("sin respuestas utiles entrega un perfil por defecto seguro", () => {
    const p = construirPerfil({});
    expect(p.objetivos.length).toBeGreaterThan(0);
    expect(p.nivelDificultad).toBe(1);
  });
});
