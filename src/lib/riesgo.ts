// ============================================================
// Evaluacion de riesgo en el contenido (documento, seccion 3.7).
// El sistema marca y acompana, nunca censura de forma automatica.
// Se asume que este clasificador fallara en ambas direcciones,
// por eso nunca es el unico mecanismo, conviven el reporte manual
// y el boton de emergencia siempre visible.
// Nota, en produccion el diccionario vive fuera del repositorio
// publico y lo mantiene la persona moderadora.
// ============================================================

const PATRONES = [
  "no quiero seguir",
  "quiero desaparecer",
  "no puedo mas",
  "hacerme dano",
  "lastimarme",
  "quitarme la vida",
  "ya no quiero vivir",
  "no vale la pena vivir",
];

function normalizar(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function evaluarRiesgo(texto: string): "bajo" | "alto" {
  const n = normalizar(texto);
  return PATRONES.some((p) => n.includes(p)) ? "alto" : "bajo";
}
