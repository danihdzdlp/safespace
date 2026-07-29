"use client";
// Registro e inicio de sesion con Supabase Auth.
// Validacion en cliente para retroalimentacion inmediata,
// Supabase valida de nuevo en el servidor.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Entrar() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setError(null);
    if (!/.+@.+\..+/.test(correo)) return setError("Escribe un correo válido.");
    if (clave.length < 8) return setError("La contraseña necesita al menos 8 caracteres.");
    setCargando(true);
    const supabase = supabaseBrowser();
    const { error: e } =
      modo === "crear"
        ? await supabase.auth.signUp({ email: correo, password: clave })
        : await supabase.auth.signInWithPassword({ email: correo, password: clave });
    setCargando(false);
    if (e) return setError(modo === "crear" ? "No se pudo crear la cuenta. Puede que el correo ya exista." : "Correo o contraseña incorrectos.");
    router.push(modo === "crear" ? "/cuestionario" : "/hoy");
    router.refresh();
  };

  return (
    <main className="flex min-h-dvh flex-col justify-center gap-4 px-6">
      <p className="text-xs font-bold tracking-widest text-lamp">SAFESPACE</p>
      <h1 className="font-serif text-3xl leading-tight">Un lugar para no cargar sola lo que sientes.</h1>
      <p className="text-sm text-mist">Entras con seudónimo, nadie sabe quién eres.</p>

      <div className="mt-2 flex gap-2">
        {(["entrar", "crear"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setModo(m)}
            className={`rounded-full border px-4 py-2 text-sm ${modo === m ? "border-lamp bg-lamp/15 text-lamp" : "border-white/10 text-mist"}`}
          >
            {m === "entrar" ? "Ya tengo cuenta" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <input
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="Correo electrónico"
        className="rounded-xl border border-white/10 bg-dusk px-4 py-3.5 text-linen outline-none focus:border-lamp"
      />
      <input
        type="password"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        placeholder="Contraseña, mínimo 8 caracteres"
        className="rounded-xl border border-white/10 bg-dusk px-4 py-3.5 text-linen outline-none focus:border-lamp"
      />
      {error && <p className="text-sm text-rose">{error}</p>}
      <button
        onClick={enviar}
        disabled={cargando}
        className="rounded-xl bg-lamp py-3.5 font-bold text-night disabled:opacity-50"
      >
        {cargando ? "Un momento..." : modo === "crear" ? "Crear mi cuenta" : "Entrar"}
      </button>
      <p className="text-[11px] leading-relaxed text-faint">
        Al crear tu cuenta aceptas que SafeSpace es apoyo entre pares y no sustituye atención profesional.
        El botón SOS conecta en todo momento con líneas de atención.
      </p>
    </main>
  );
}
