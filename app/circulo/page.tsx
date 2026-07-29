// El circulo. El estado de la ventana se calcula en el servidor
// y el cliente solo pinta la cuenta regresiva y sondea las
// publicaciones nuevas cada 10 segundos dentro de la sesion
// (decision documentada, sondeo en lugar de websockets, plan de recorte 2.4).
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { estadoDelForo } from "@/lib/foro";
import Nav from "@/components/Nav";
import Encabezado from "@/components/Encabezado";
import Circulo from "./Circulo";

export const dynamic = "force-dynamic";

export default async function PaginaCirculo() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: perfil } = await supabase.from("perfiles").select("seudonimo, racha").eq("id", user.id).maybeSingle();
  if (!perfil) redirect("/cuestionario");

  const { data: salas } = await supabase.from("salas").select("id, nombre").order("id");
  const estado = estadoDelForo();

  return (
    <main>
      <Encabezado seudonimo={perfil.seudonimo} racha={perfil.racha} />
      <section className="px-5 pt-2">
        <h1 className="mb-4 font-serif text-2xl">El circulo</h1>
        <Circulo
          salas={salas ?? []}
          estadoInicial={{ abierto: estado.abierto, restanteSeg: estado.restanteSeg, temaDelDia: estado.temaDelDia }}
        />
      </section>
      <Nav />
    </main>
  );
}
