// Panel de lecturas. Las sugerencias se ordenan por afinidad con
// los objetivos del perfil, la consulta trae todo en una sola ida.
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import Encabezado from "@/components/Encabezado";

export const dynamic = "force-dynamic";

export default async function Lecturas() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: perfil } = await supabase.from("perfiles").select("seudonimo, racha").eq("id", user.id).maybeSingle();
  if (!perfil) redirect("/cuestionario");

  const [{ data: lecturas }, { data: objetivos }, { data: marcadas }] = await Promise.all([
    supabase.from("lecturas").select("id, titulo, tema, minutos").neq("tema", "meditacion"),
    supabase.from("objetivos_usuaria").select("objetivo").eq("usuaria_id", user.id),
    supabase.from("lecturas_usuaria").select("lectura_id, leida, guardada").eq("usuaria_id", user.id),
  ]);

  const objs = new Set((objetivos ?? []).map((o) => o.objetivo));
  const estado = new Map((marcadas ?? []).map((m) => [m.lectura_id, m]));
  const afinidad = (tema: string) =>
    objs.has(tema) || tema === "basicos" || tema === "meditacion" || (tema === "conexion" && objs.has("relaciones")) ? 1 : 0;

  const orden = (lecturas ?? [])
    .filter((l) => l.tema !== "meditacion") // las meditaciones tienen su propia seccion
    .map((l) => ({ ...l, ...estado.get(l.id), afin: afinidad(l.tema) }))
    .sort((a, b) => Number(a.leida ?? false) - Number(b.leida ?? false) || b.afin - a.afin || a.minutos - b.minutos);

  return (
    <main>
      <Encabezado seudonimo={perfil.seudonimo} racha={perfil.racha} />
      <section className="space-y-3 px-5 pt-2">
        <h1 className="font-serif text-2xl">Panel de lecturas</h1>
        <p className="text-sm text-mist">Textos de 3 a 5 minutos, primero los que conectan con tu perfil.</p>
        <ul className="space-y-3">
          {orden.map((l) => (
            <li key={l.id}>
              <Link href={`/lecturas/${l.id}`} className="block rounded-2xl border border-white/10 bg-dusk p-4">
                <p className={`font-serif ${l.leida ? "text-mist" : "text-linen"}`}>{l.titulo}</p>
                <p className="mt-1 text-xs text-faint">
                  {l.tema}, {l.minutos} min{l.leida ? ", leída" : ""}{l.guardada ? ", guardada" : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Nav />
    </main>
  );
}
