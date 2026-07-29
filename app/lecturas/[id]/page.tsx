import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import BotonesLectura from "./BotonesLectura";

export const dynamic = "force-dynamic";

export default async function Lectura({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) notFound();

  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const [{ data: lectura }, { data: marca }] = await Promise.all([
    supabase.from("lecturas").select("id, titulo, tema, minutos, cuerpo").eq("id", id).maybeSingle(),
    supabase.from("lecturas_usuaria").select("leida, guardada").eq("usuaria_id", user.id).eq("lectura_id", id).maybeSingle(),
  ]);
  if (!lectura) notFound();

  return (
    <main className="px-6 py-8">
      <Link href="/lecturas" className="text-sm text-faint">Volver al panel</Link>
      <p className="mt-4 text-[11px] uppercase tracking-wide text-faint">{lectura.tema}, {lectura.minutos} min</p>
      <h1 className="mt-1 font-serif text-2xl leading-snug">{lectura.titulo}</h1>
      <div className="mt-5 space-y-4">
        {(lectura.cuerpo as string[]).map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-mist">{p}</p>
        ))}
      </div>
      <BotonesLectura lecturaId={lectura.id} leida={marca?.leida ?? false} guardada={marca?.guardada ?? false} />
    </main>
  );
}
