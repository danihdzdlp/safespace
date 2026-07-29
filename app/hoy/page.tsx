// Path del dia. Componente de servidor, los datos llegan ya listos
// y la interactividad vive en ListaTareas (componente de cliente).
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { fechaOficial, estadoDelForo, formatoRestante } from "@/lib/foro";
import { generarPathDelDia } from "@/app/acciones";
import Nav from "@/components/Nav";
import Encabezado from "@/components/Encabezado";
import ListaTareas, { type TareaDelDia } from "./ListaTareas";

export const dynamic = "force-dynamic";

export default async function Hoy() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: perfil } = await supabase.from("perfiles").select("seudonimo, racha").eq("id", user.id).maybeSingle();
  if (!perfil) redirect("/cuestionario");

  // Genera el path si aun no existe hoy. La restriccion UNIQUE hace la operacion idempotente.
  await generarPathDelDia();

  const hoy = fechaOficial();
  const { data: asignacion } = await supabase
    .from("asignaciones")
    .select("id, asignacion_tareas(id, completada, catalogo_tareas(titulo, categoria, minutos))")
    .eq("usuaria_id", user.id)
    .eq("fecha", hoy)
    .maybeSingle();

  const tareas: TareaDelDia[] = ((asignacion?.asignacion_tareas ?? []) as any[])
    .map((f) => ({
      id: f.id,
      completada: f.completada,
      titulo: f.catalogo_tareas?.titulo ?? "",
      categoria: f.catalogo_tareas?.categoria ?? "",
      minutos: f.catalogo_tareas?.minutos ?? 0,
    }))
    .sort((a, b) => a.id - b.id);

  const foro = estadoDelForo();

  return (
    <main>
      <Encabezado seudonimo={perfil.seudonimo} racha={perfil.racha} />
      <section className="space-y-4 px-5 pt-2">
        <h1 className="font-serif text-2xl">Tu path de hoy</h1>
        <ListaTareas tareas={tareas} />
        <Link
          href="/circulo"
          className={`block rounded-2xl border p-4 ${foro.abierto ? "border-lamp/50 bg-lamp/10" : "border-white/10 bg-dusk"}`}
        >
          <p className="text-sm font-bold">{foro.abierto ? "El circulo esta encendido" : "El circulo abre a las 8:00 pm"}</p>
          <p className="text-xs text-faint">
            {foro.abierto ? `Cierra en ${formatoRestante(foro.restanteSeg)}` : `Todos los dias de 8:00 a 9:30 pm`}
          </p>
        </Link>
        <Link href="/lecturas" className="block rounded-2xl border border-white/10 bg-dusk p-4">
          <p className="text-sm font-bold">Una lectura para ti</p>
          <p className="text-xs text-faint">Textos de 3 a 5 minutos elegidos segun tu perfil</p>
        </Link>
      </section>
      <Nav />
    </main>
  );
}
