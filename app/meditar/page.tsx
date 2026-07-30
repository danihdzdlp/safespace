// Seccion propia de meditacion. Lista las guias con voz,
// separadas del panel de lecturas por peticion de las usuarias.
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import Encabezado from "@/components/Encabezado";
import ReproductorAudio from "./ReproductorAudio";
import { AUDIOS, BASE_AUDIOS } from "@/lib/audios";

export const dynamic = "force-dynamic";

export default async function Meditar() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: perfil } = await supabase.from("perfiles").select("seudonimo, racha").eq("id", user.id).maybeSingle();
  if (!perfil) redirect("/cuestionario");

  const { data: meditaciones } = await supabase
    .from("lecturas")
    .select("id, titulo, minutos")
    .eq("tema", "meditacion")
    .order("minutos");

  return (
    <main>
      <Encabezado seudonimo={perfil.seudonimo} racha={perfil.racha} />
      <section className="space-y-3 px-5 pt-2">
        <h1 className="font-serif text-2xl">Meditar</h1>
        <p className="text-sm leading-relaxed text-mist">
          Un momento para bajar el ritmo. Elige una guía, busca una postura cómoda, y si quieres,
          deja que la voz te acompañe paso a paso.
        </p>
        <p className="pt-2 text-xs tracking-widest text-faint">CON LA VOZ DE SAFESPACE</p>
        <ul className="space-y-3">
          {AUDIOS.map((a) => (
            <li key={a.archivo} className="rounded-2xl border border-white/10 bg-dusk p-4">
              <p className="font-serif text-linen">{a.titulo}</p>
              <p className="mt-1 text-xs text-faint">{a.duracion} min, voz humana</p>
              <ReproductorAudio src={`${BASE_AUDIOS}/${a.archivo}`} />
            </li>
          ))}
        </ul>

        <p className="pt-3 text-xs tracking-widest text-faint">GUÍAS PARA LEER O ESCUCHAR CON LA VOZ DEL DISPOSITIVO</p>
        <ul className="space-y-3">
          {(meditaciones ?? []).map((m) => (
            <li key={m.id}>
              <Link href={`/lecturas/${m.id}`} className="block rounded-2xl border border-white/10 bg-dusk p-4">
                <p className="font-serif text-linen">{m.titulo}</p>
                <p className="mt-1 text-xs text-faint">{m.minutos} min, guía con voz</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="pt-1 text-xs leading-relaxed text-faint">
          Consejo, la de respiración funciona en cualquier momento del día, el escaneo del
          cuerpo es para la cama, y la caminata es para cuando estar quieta desespera.
        </p>
      </section>
      <Nav />
    </main>
  );
}
