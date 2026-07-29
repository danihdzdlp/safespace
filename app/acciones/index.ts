"use server";
// ============================================================
// Server Actions de SafeSpace. Toda la validacion de negocio
// ocurre aqui, del lado del servidor. El cliente solo pinta.
// Cada accion devuelve { ok, error? } para que la interfaz
// muestre errores con claridad en lugar de romperse.
// ============================================================
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { estadoDelForo, fechaOficial } from "@/lib/foro";
import { construirPerfil, PREGUNTAS, type Respuestas } from "@/lib/perfil";
import { seleccionarTareas, nuevaRacha, type Tarea } from "@/lib/path";
import { evaluarRiesgo } from "@/lib/riesgo";

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

async function usuariaActual() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// ---------- Cuestionario ----------
const esquemaRespuestas = z.record(
  z.string(),
  z.union([z.string().max(80), z.number().int().min(1).max(5), z.array(z.string().max(80)).max(6)])
);

export async function guardarCuestionario(seudonimo: string, respuestas: Respuestas): Promise<Resultado<{ mostrarApoyo: boolean }>> {
  const { supabase, user } = await usuariaActual();
  if (!user) return { ok: false, error: "Tu sesion expiro, vuelve a entrar." };

  const nombre = seudonimo.trim();
  if (nombre.length < 2 || nombre.length > 18) return { ok: false, error: "El seudonimo debe tener entre 2 y 18 caracteres." };
  const parseo = esquemaRespuestas.safeParse(respuestas);
  if (!parseo.success) return { ok: false, error: "Hay respuestas con un formato invalido." };
  const faltantes = PREGUNTAS.filter((p) => respuestas[p.n] == null || (Array.isArray(respuestas[p.n]) && (respuestas[p.n] as string[]).length === 0));
  if (faltantes.length > 0) return { ok: false, error: `Falta responder la pregunta ${faltantes[0].n}.` };

  const perfil = construirPerfil(respuestas);

  const { error: e1 } = await supabase.from("perfiles").upsert({
    id: user.id,
    seudonimo: nombre,
    nivel_dificultad: perfil.nivelDificultad,
    animo_base: perfil.animoBase,
    invitacion_foro: perfil.invitacionForo,
  });
  if (e1) return { ok: false, error: "No se pudo guardar tu perfil. Intenta de nuevo." };

  const filas = Object.entries(respuestas).map(([pregunta, respuesta]) => ({
    usuaria_id: user.id,
    pregunta: Number(pregunta),
    respuesta,
  }));
  await supabase.from("cuestionario_respuestas").upsert(filas);
  await supabase.from("objetivos_usuaria").delete().eq("usuaria_id", user.id);
  await supabase.from("objetivos_usuaria").insert(perfil.objetivos.map((objetivo) => ({ usuaria_id: user.id, objetivo })));
  await supabase.from("categorias_pref").delete().eq("usuaria_id", user.id);
  if (perfil.categorias.length > 0) {
    await supabase.from("categorias_pref").insert(perfil.categorias.map((categoria) => ({ usuaria_id: user.id, categoria })));
  }
  revalidatePath("/hoy");
  return { ok: true, data: { mostrarApoyo: perfil.mostrarApoyo } };
}

// ---------- Path del dia ----------
export async function generarPathDelDia(): Promise<Resultado> {
  const { supabase, user } = await usuariaActual();
  if (!user) return { ok: false, error: "Sin sesion." };
  const hoy = fechaOficial();

  // Idempotencia por restriccion UNIQUE, si ya existe no se genera de nuevo
  const { data: existente } = await supabase.from("asignaciones").select("id").eq("usuaria_id", user.id).eq("fecha", hoy).maybeSingle();
  if (existente) return { ok: true };

  const [{ data: perfil }, { data: objetivos }, { data: categorias }, { data: catalogo }] = await Promise.all([
    supabase.from("perfiles").select("nivel_dificultad").eq("id", user.id).single(),
    supabase.from("objetivos_usuaria").select("objetivo").eq("usuaria_id", user.id),
    supabase.from("categorias_pref").select("categoria").eq("usuaria_id", user.id),
    supabase.from("catalogo_tareas").select("*"),
  ]);
  if (!perfil || !catalogo) return { ok: false, error: "No se pudo cargar tu perfil." };

  // No repetir tareas de los ultimos 14 dias y detectar abandono para la regla compasiva
  const hace14 = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const { data: previas } = await supabase
    .from("asignaciones")
    .select("id, fecha, asignacion_tareas(tarea_id, completada)")
    .eq("usuaria_id", user.id)
    .gte("fecha", hace14)
    .order("fecha", { ascending: false });

  const recientes = new Set<number>();
  let sinCompletar = 0;
  let contando = true;
  for (const a of previas ?? []) {
    const filas = (a.asignacion_tareas ?? []) as { tarea_id: number; completada: boolean }[];
    filas.forEach((f) => recientes.add(f.tarea_id));
    if (contando) {
      if (filas.length > 0 && filas.every((f) => !f.completada)) sinCompletar++;
      else contando = false;
    }
  }

  const seleccion = seleccionarTareas(catalogo as Tarea[], {
    objetivos: (objetivos ?? []).map((o) => o.objetivo),
    categorias: (categorias ?? []).map((c) => c.categoria),
    nivelDificultad: perfil.nivel_dificultad,
  }, { recientes, reduccionCompasiva: sinCompletar >= 3, semilla: hoy });

  const { data: asignacion, error } = await supabase
    .from("asignaciones")
    .insert({ usuaria_id: user.id, fecha: hoy })
    .select("id")
    .single();
  // Si dos peticiones simultaneas chocan, la restriccion UNIQUE gana y esta rama simplemente termina
  if (error || !asignacion) return { ok: true };

  await supabase.from("asignacion_tareas").insert(seleccion.map((t) => ({ asignacion_id: asignacion.id, tarea_id: t.id })));
  revalidatePath("/hoy");
  return { ok: true };
}

export async function marcarTarea(asignacionTareaId: number, completada: boolean): Promise<Resultado<{ racha: number }>> {
  const { supabase, user } = await usuariaActual();
  if (!user) return { ok: false, error: "Sin sesion." };

  const { error } = await supabase
    .from("asignacion_tareas")
    .update({ completada, completada_en: completada ? new Date().toISOString() : null })
    .eq("id", asignacionTareaId);
  if (error) return { ok: false, error: "No se pudo guardar el cambio." };

  // Si el dia quedo completo, la racha premia volver
  const hoy = fechaOficial();
  const ayer = fechaOficial(new Date(Date.now() - 86400000));
  const { data: asignacion } = await supabase
    .from("asignaciones")
    .select("id, asignacion_tareas(completada)")
    .eq("usuaria_id", user.id)
    .eq("fecha", hoy)
    .single();
  const filas = (asignacion?.asignacion_tareas ?? []) as { completada: boolean }[];
  let racha = 0;
  if (filas.length > 0 && filas.every((f) => f.completada)) {
    const { data: perfil } = await supabase.from("perfiles").select("racha, ultimo_dia_completo").eq("id", user.id).single();
    if (perfil) {
      racha = nuevaRacha(perfil.racha, perfil.ultimo_dia_completo, hoy, ayer);
      await supabase.from("perfiles").update({ racha, ultimo_dia_completo: hoy }).eq("id", user.id);
    }
  }
  revalidatePath("/hoy");
  return { ok: true, data: { racha } };
}

export async function registrarAnimo(valor: number): Promise<Resultado> {
  const { supabase, user } = await usuariaActual();
  if (!user) return { ok: false, error: "Sin sesion." };
  const v = z.number().int().min(1).max(5).safeParse(valor);
  if (!v.success) return { ok: false, error: "Valor invalido." };
  await supabase.from("animo_diario").upsert({ usuaria_id: user.id, fecha: fechaOficial(), valor });
  revalidatePath("/ruta");
  return { ok: true };
}

// ---------- Foro ----------
const esquemaTexto = z.string().trim().min(1, "Escribe algo antes de compartir.").max(2000, "Maximo 2000 caracteres.");

export async function publicarMensaje(salaId: string, texto: string): Promise<Resultado<{ riesgo: boolean }>> {
  const { supabase, user } = await usuariaActual();
  if (!user) return { ok: false, error: "Sin sesion." };

  // Validacion 1, ventana horaria, siempre en el servidor
  const estado = estadoDelForo();
  if (!estado.abierto) return { ok: false, error: "El circulo esta cerrado. Tu texto se conserva como borrador para la proxima sesion." };

  // Validacion 2, integridad del contenido
  const parseo = esquemaTexto.safeParse(texto);
  if (!parseo.success) return { ok: false, error: parseo.error.issues[0].message };

  // Validacion 3, limite de frecuencia para no inundar la sala
  const hace60s = new Date(Date.now() - 60000).toISOString();
  const { count } = await supabase
    .from("publicaciones")
    .select("id", { count: "exact", head: true })
    .eq("usuaria_id", user.id)
    .gte("creada_en", hace60s);
  if ((count ?? 0) >= 5) return { ok: false, error: "Vas muy rapido. Espera un momento antes de publicar de nuevo." };

  // Validacion 4, riesgo. Nunca bloquea, marca y acompana
  const riesgo = evaluarRiesgo(parseo.data);

  const { data: perfil } = await supabase.from("perfiles").select("seudonimo").eq("id", user.id).single();
  const { error } = await supabase.from("publicaciones").insert({
    sala_id: salaId,
    usuaria_id: user.id,
    seudonimo: perfil?.seudonimo ?? "Alguien",
    texto: parseo.data,
    nivel_riesgo: riesgo,
  });
  if (error) return { ok: false, error: "No se pudo publicar. Intenta de nuevo." };
  return { ok: true, data: { riesgo: riesgo === "alto" } };
}

export async function responderMensaje(publicacionId: number, texto: string): Promise<Resultado> {
  const { supabase, user } = await usuariaActual();
  if (!user) return { ok: false, error: "Sin sesion." };
  const estado = estadoDelForo();
  if (!estado.abierto) return { ok: false, error: "El circulo esta cerrado, vuelve en la proxima sesion." };
  const parseo = z.string().trim().min(1).max(500).safeParse(texto);
  if (!parseo.success) return { ok: false, error: "La respuesta debe tener entre 1 y 500 caracteres." };
  const { data: perfil } = await supabase.from("perfiles").select("seudonimo").eq("id", user.id).single();
  const { error } = await supabase.from("respuestas").insert({
    publicacion_id: publicacionId,
    usuaria_id: user.id,
    seudonimo: perfil?.seudonimo ?? "Alguien",
    texto: parseo.data,
  });
  return error ? { ok: false, error: "No se pudo responder." } : { ok: true };
}

export interface PublicacionConRespuestas {
  id: number;
  seudonimo: string;
  texto: string;
  nivel_riesgo: string;
  creada_en: string;
  respuestas: { id: number; seudonimo: string; texto: string }[];
}

export async function listarPublicaciones(salaId: string): Promise<Resultado<PublicacionConRespuestas[]>> {
  const { supabase, user } = await usuariaActual();
  if (!user) return { ok: false, error: "Sin sesion." };
  const { data, error } = await supabase
    .from("publicaciones")
    .select("id, seudonimo, texto, nivel_riesgo, creada_en, respuestas(id, seudonimo, texto)")
    .eq("sala_id", salaId)
    .order("creada_en", { ascending: false })
    .limit(30);
  if (error) return { ok: false, error: "No se pudieron cargar las publicaciones." };
  return { ok: true, data: (data ?? []) as PublicacionConRespuestas[] };
}

// ---------- Lecturas ----------
export async function marcarLectura(lecturaId: number, campo: "leida" | "guardada", valor: boolean): Promise<Resultado> {
  const { supabase, user } = await usuariaActual();
  if (!user) return { ok: false, error: "Sin sesion." };
  const { data: actual } = await supabase.from("lecturas_usuaria").select("leida, guardada").eq("usuaria_id", user.id).eq("lectura_id", lecturaId).maybeSingle();
  await supabase.from("lecturas_usuaria").upsert({
    usuaria_id: user.id,
    lectura_id: lecturaId,
    leida: campo === "leida" ? valor : actual?.leida ?? false,
    guardada: campo === "guardada" ? valor : actual?.guardada ?? false,
  });
  revalidatePath("/lecturas");
  return { ok: true };
}

// ---------- Emergencia ----------
export async function registrarEventoEmergencia(): Promise<void> {
  // Registro anonimo y nunca bloqueante, si falla no afecta a la pantalla de recursos
  try {
    const { supabase, user } = await usuariaActual();
    const { createHash } = await import("crypto");
    const hash = user ? createHash("sha256").update(user.id).digest("hex").slice(0, 16) : null;
    await supabase.from("eventos_emergencia").insert({ usuaria_hash: hash });
  } catch {
    // silencio deliberado, la prioridad es la pantalla de recursos
  }
}
