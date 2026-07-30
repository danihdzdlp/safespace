// Pagina de bienvenida publica. Quien llega sin sesion conoce SafeSpace
// antes del formulario, quien ya tiene cuenta pasa directo a su espacio.
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Portada() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/hoy");

  return (
    <main className="flex min-h-dvh flex-col justify-center gap-6 px-6 py-12">
      <div>
        <p className="text-xs font-bold tracking-widest text-lamp">SAFESPACE</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight">
          Un lugar para no cargar en soledad lo que sientes.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mist">
          Apoyo emocional entre pares para personas jóvenes. Anónimo, cuidado y a tu ritmo.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-dusk p-4">
          <p className="text-sm font-bold text-linen">Tu path de cada día</p>
          <p className="mt-1 text-sm leading-relaxed text-mist">
            Tres pasos pequeños a tu medida, con guías de cómo hacerlos, y un árbol que crece con tu constancia.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-dusk p-4">
          <p className="text-sm font-bold text-linen">El círculo, dos veces al día</p>
          <p className="mt-1 text-sm leading-relaxed text-mist">
            Un espacio escrito y moderado para compartir y escuchar, de 3:00 a 5:00 y de 8:00 a 10:00 pm.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-dusk p-4">
          <p className="text-sm font-bold text-linen">Meditaciones con voz humana</p>
          <p className="mt-1 text-sm leading-relaxed text-mist">
            Una biblioteca de audios y afirmaciones para calmar la mente, enfocarte o dormir mejor.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/entrar" className="block rounded-xl bg-lamp py-3.5 text-center font-bold text-night">
          Crear mi cuenta gratis
        </Link>
        <Link href="/entrar" className="block rounded-xl border border-white/15 py-3.5 text-center font-bold text-linen">
          Ya tengo cuenta
        </Link>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-faint">
        SafeSpace es apoyo entre pares y no sustituye atención profesional.
        El botón SOS conecta en todo momento con líneas de atención.
      </p>
    </main>
  );
}
