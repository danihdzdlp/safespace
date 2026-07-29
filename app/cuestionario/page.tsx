"use client";
// Cuestionario inicial de 15 preguntas en 3 pantallas (Anexo C del documento).
// Guardado al final via server action, con validacion estricta en el servidor.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PREGUNTAS, type Respuestas } from "@/lib/perfil";
import { guardarCuestionario } from "@/app/acciones";

export default function Cuestionario() {
  const router = useRouter();
  const [pagina, setPagina] = useState(0);
  const [seudonimo, setSeudonimo] = useState("");
  const [r, setR] = useState<Respuestas>({});
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [apoyo, setApoyo] = useState(false);

  const paginas = useMemo(() => [PREGUNTAS.slice(0, 5), PREGUNTAS.slice(5, 10), PREGUNTAS.slice(10, 15)], []);
  const actuales = paginas[pagina];

  const responder = (n: number, v: string | number) => setR((prev) => ({ ...prev, [n]: v }));
  const toggleMulti = (n: number, op: string, max: number) =>
    setR((prev) => {
      const arr = (prev[n] as string[]) ?? [];
      if (arr.includes(op)) return { ...prev, [n]: arr.filter((x) => x !== op) };
      if (arr.length >= max) return prev;
      return { ...prev, [n]: [...arr, op] };
    });

  const paginaCompleta = actuales.every((p) =>
    p.tipo === "multi" ? ((r[p.n] as string[]) ?? []).length > 0 : r[p.n] != null
  );
  // El seudonimo es requisito desde la primera pantalla. En las pruebas con
  // usuarias reales todo el mundo se lo saltaba y quedaba bloqueado al final.
  const puedeAvanzar = pagina === 0 ? paginaCompleta && seudonimo.trim().length >= 2 : paginaCompleta;
  const listaParaEnviar = paginaCompleta && seudonimo.trim().length >= 2;

  const enviar = async () => {
    setGuardando(true);
    setError(null);
    const res = await guardarCuestionario(seudonimo, r);
    setGuardando(false);
    if (!res.ok) return setError(res.error);
    if (res.data?.mostrarApoyo) return setApoyo(true);
    router.push("/hoy");
    router.refresh();
  };

  if (apoyo) {
    return (
      <main className="flex min-h-dvh flex-col justify-center gap-4 px-6">
        <h1 className="font-serif text-2xl leading-snug">Gracias por responder con honestidad</h1>
        <p className="text-sm leading-relaxed text-mist">
          Por lo que contaste, parece que estás cargando mucho en este momento. SafeSpace va a acompañarte
          con pasos muy pequeños, y también queremos recordarte que hablar con un profesional puede ayudarte
          más de lo que imaginas. El botón SOS está siempre visible.
        </p>
        <button onClick={() => { router.push("/hoy"); router.refresh(); }} className="rounded-xl bg-lamp py-3.5 font-bold text-night">
          Continuar a mi espacio
        </button>
      </main>
    );
  }

  return (
    <main className="px-6 py-8">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-faint">Cuestionario inicial</span>
        <span className="font-bold text-lamp">{pagina + 1} de 3</span>
      </div>
      <div className="mb-6 h-1.5 rounded-full bg-veil">
        <div className="h-1.5 rounded-full bg-lamp transition-all" style={{ width: `${((pagina + 1) / 3) * 100}%` }} />
      </div>

      {pagina === 0 && (
        <label className="mb-6 block rounded-2xl border border-lamp/50 bg-lamp/10 p-4">
          <span className="block font-serif text-lg text-linen">Primero, elige tu seudónimo</span>
          <span className="mt-1 block text-xs leading-relaxed text-mist">
            Así te verán en el círculo, tu nombre real nunca aparece. Este paso es necesario para continuar.
          </span>
          <input
            value={seudonimo}
            onChange={(e) => setSeudonimo(e.target.value.slice(0, 18))}
            placeholder="Por ejemplo, Luna"
            className="mt-3 w-full rounded-xl border border-white/15 bg-night px-4 py-3.5 text-linen outline-none focus:border-lamp"
          />
        </label>
      )}

      <div className="space-y-7">
        {actuales.map((p) => (
          <div key={p.n}>
            <p className="mb-3 font-serif text-lg leading-snug">
              <span className="mr-2 text-lamp">{p.n}.</span>
              {p.texto}
            </p>
            {p.tipo === "escala" && (
              <div>
                <div className="flex justify-center gap-2.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => responder(p.n, v)}
                      className={`h-12 w-12 rounded-xl border text-lg font-bold ${r[p.n] === v ? "border-lamp bg-lamp/15 text-lamp" : "border-white/10 text-mist"}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-faint">
                  <span>{p.low}</span>
                  <span>{p.high}</span>
                </div>
              </div>
            )}
            {(p.tipo === "uno" || p.tipo === "multi") && (
              <div className="flex flex-wrap gap-2">
                {p.ops!.map((op) => {
                  const activo = p.tipo === "uno" ? r[p.n] === op : ((r[p.n] as string[]) ?? []).includes(op);
                  return (
                    <button
                      key={op}
                      onClick={() => (p.tipo === "uno" ? responder(p.n, op) : toggleMulti(p.n, op, p.max ?? 6))}
                      className={`rounded-full border px-3.5 py-2 text-sm ${activo ? "border-lamp bg-lamp/15 text-lamp" : "border-white/10 text-mist"}`}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-rose">{error}</p>}
      {pagina === 2 && paginaCompleta && seudonimo.trim().length < 2 && (
        <p className="mt-4 text-sm text-lamp">Te falta elegir tu seudónimo, está en la primera pantalla.</p>
      )}
      {/* Hallazgo de prueba en produccion, el boton final se apagaba sin explicar por que.
          Este aviso le dice a la usuaria exactamente que falta. */}
      {pagina === 2 && paginaCompleta && seudonimo.trim().length < 2 && (
        <p className="mt-4 text-sm text-lamp">
          Solo falta una cosa, regresa a la primera pantalla y elige tu seudonimo para poder crear tu path.
        </p>
      )}
      <div className="mt-8 flex gap-3">
        {pagina > 0 && (
          <button onClick={() => setPagina(pagina - 1)} className="rounded-xl border border-white/10 px-5 py-3.5 text-mist">
            Atrás
          </button>
        )}
        <button
          onClick={() => (pagina < 2 ? setPagina(pagina + 1) : enviar())}
          disabled={(pagina < 2 && !puedeAvanzar) || (pagina === 2 && (!listaParaEnviar || guardando))}
          className="flex-1 rounded-xl bg-lamp py-3.5 font-bold text-night disabled:opacity-40"
        >
          {guardando ? "Creando tu path..." : pagina < 2 ? "Siguiente" : "Crear mi path"}
        </button>
      </div>
    </main>
  );
}
