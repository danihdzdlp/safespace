// Vista de la ruta. Semana visual, animo del dia y proximas etapas.
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { fechaOficial } from "@/lib/foro";
import Nav from "@/components/Nav";
import Encabezado from "@/components/Encabezado";
import AnimoDelDia from "./AnimoDelDia";
import Arbol from "@/components/Arbol";
import GraficaAnimo from "./GraficaAnimo";
import { etapaDelArbol } from "@/lib/arbol";

export const dynamic = "force-dynamic";

export default async function Ruta() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: perfil } = await supabase.from("perfiles").select("seudonimo, racha, animo_base").eq("id", user.id).maybeSingle();
  if (!perfil) redirect("/cuestionario");

  const hoy = fechaOficial();
  const hace7 = fechaOficial(new Date(Date.now() - 6 * 86400000));
  const hace14 = fechaOficial(new Date(Date.now() - 13 * 86400000));
  const [{ data: asignaciones }, { data: animoHoy }, { count: totalCompletadas }, { data: animos }] = await Promise.all([
    supabase
      .from("asignaciones")
      .select("fecha, asignacion_tareas(completada)")
      .eq("usuaria_id", user.id)
      .gte("fecha", hace7),
    supabase.from("animo_diario").select("valor").eq("usuaria_id", user.id).eq("fecha", hoy).maybeSingle(),
    supabase.from("asignacion_tareas").select("id", { count: "exact", head: true }).eq("completada", true),
    supabase.from("animo_diario").select("fecha, valor").eq("usuaria_id", user.id).gte("fecha", hace14),
  ]);
  const animoPorDia = new Map((animos ?? []).map((a) => [a.fecha as string, a.valor as number]));
  const puntosAnimo = Array.from({ length: 14 }, (_, i) => {
    const clave = fechaOficial(new Date(Date.now() - (13 - i) * 86400000));
    return { dia: clave, valor: animoPorDia.get(clave) ?? null };
  });
  const arbol = etapaDelArbol(totalCompletadas ?? 0);

  const porFecha = new Map<string, { total: number; hechas: number }>();
  for (const a of asignaciones ?? []) {
    const filas = (a.asignacion_tareas ?? []) as { completada: boolean }[];
    porFecha.set(a.fecha as string, { total: filas.length, hechas: filas.filter((f) => f.completada).length });
  }

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const clave = fechaOficial(d);
    const info = porFecha.get(clave);
    const estado = !info || info.total === 0 ? "vacio" : info.hechas === info.total ? "completo" : info.hechas > 0 ? "parcial" : "pendiente";
    return { clave, letra: "DLMMJVS"[d.getDay()], num: d.getDate(), estado, esHoy: clave === hoy };
  });

  return (
    <main>
      <Encabezado seudonimo={perfil.seudonimo} racha={perfil.racha} />
      <section className="space-y-4 px-5 pt-2">
        <h1 className="font-serif text-2xl">Mi ruta</h1>

        <div className="rounded-2xl border border-white/10 bg-dusk p-4">
          <p className="mb-2 text-xs tracking-wide text-faint">TU ÁRBOL</p>
          <div className="flex items-center gap-4">
            <Arbol etapa={arbol.etapa} animo={animoHoy?.valor ?? null} />
            <div>
              <p className="font-serif text-lg">{arbol.nombre}</p>
              {arbol.etapa === 0 ? (
                <p className="mt-1 text-sm italic leading-relaxed text-mist">
                  No tienes que florecer hoy. Solo quédate aquí. Nosotros cuidaremos este espacio contigo.
                </p>
              ) : (
                <p className="mt-1 text-sm leading-relaxed text-mist">
                  {arbol.completadas} pasos completados.
                  {arbol.siguiente
                    ? ` A ${arbol.faltan} de convertirse en ${arbol.siguiente.toLowerCase()}.`
                    : " Tu constancia lo hizo crecer completo."}
                </p>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-faint">El paisaje refleja el ánimo que registras abajo, del día lluvioso al sol pleno.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-dusk p-4">
          <p className="mb-3 text-xs tracking-wide text-faint">TU SEMANA</p>
          <div className="flex justify-between">
            {dias.map((d) => (
              <div key={d.clave} className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] text-faint">{d.letra}</span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                    d.estado === "completo"
                      ? "bg-sage text-night"
                      : d.estado === "parcial"
                        ? "bg-sage/20 text-sage"
                        : d.esHoy
                          ? "border border-lamp bg-lamp/15 text-lamp"
                          : "bg-night text-faint"
                  }`}
                >
                  {d.estado === "completo" ? "✓" : d.num}
                </span>
              </div>
            ))}
          </div>
        </div>

        <AnimoDelDia inicial={animoHoy?.valor ?? null} base={perfil.animo_base ?? 3} />

        <div className="rounded-2xl border border-white/10 bg-dusk p-4">
          <p className="mb-3 text-xs tracking-wide text-faint">TU ÁNIMO, ÚLTIMAS DOS SEMANAS</p>
          <GraficaAnimo puntos={puntosAnimo} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-dusk p-4">
          <p className="mb-2 text-xs tracking-wide text-faint">PRÓXIMAS ETAPAS</p>
          <ul className="space-y-2 text-sm text-mist">
            <li><span className="font-bold text-lamp">Mañana.</span> Tu path se adapta a lo que completes hoy.</li>
            <li><span className="font-bold text-lamp">Día 7.</span> Primera revisión de ritmo, tu constancia decide si sube el nivel.</li>
            <li><span className="font-bold text-lamp">Día 30.</span> Retomamos tu meta del cuestionario.</li>
          </ul>
        </div>

        <a href="/salir" className="block pt-2 pb-1 text-center text-sm text-faint underline">
          Cerrar sesión
        </a>
      </section>
      <Nav />
    </main>
  );
}
