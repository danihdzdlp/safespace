"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatoRestante } from "@/lib/foro";
import { listarPublicaciones, publicarMensaje, responderMensaje, type PublicacionConRespuestas } from "@/app/acciones";

interface Estado { abierto: boolean; restanteSeg: number; temaDelDia: string }

export default function Circulo({ salas, estadoInicial }: { salas: { id: string; nombre: string }[]; estadoInicial: Estado }) {
  const [sala, setSala] = useState(salas[0]?.id ?? "ansiedad");
  const [estado, setEstado] = useState(estadoInicial);
  const [posts, setPosts] = useState<PublicacionConRespuestas[] | null>(null);
  const [texto, setTexto] = useState("");
  const [respondiendo, setRespondiendo] = useState<number | null>(null);
  const [textoResp, setTextoResp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [avisoApoyo, setAvisoApoyo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const montada = useRef(true);

  // Cuenta regresiva local. Solo pinta, la decision real siempre es del servidor.
  useEffect(() => {
    const t = setInterval(() => {
      setEstado((e) => {
        const restante = Math.max(e.restanteSeg - 1, 0);
        return restante === 0 ? { ...e, abierto: !e.abierto, restanteSeg: e.abierto ? 0 : 90 * 60 } : { ...e, restanteSeg: restante };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const cargar = useCallback(async (salaId: string) => {
    const res = await listarPublicaciones(salaId);
    if (montada.current && res.ok) setPosts(res.data ?? []);
    if (montada.current && !res.ok) setError(res.error);
  }, []);

  // Carga inicial de la sala y sondeo cada 10 s solo con la pestana visible,
  // para no desperdiciar red ni bateria (optimizacion manual documentada).
  useEffect(() => {
    montada.current = true;
    setPosts(null);
    void cargar(sala);
    const t = setInterval(() => {
      if (!document.hidden) void cargar(sala);
    }, 10000);
    return () => { montada.current = false; clearInterval(t); };
  }, [sala, cargar]);

  const compartir = async () => {
    setError(null);
    setEnviando(true);
    const res = await publicarMensaje(sala, texto);
    setEnviando(false);
    if (!res.ok) return setError(res.error);
    setTexto("");
    if (res.data?.riesgo) setAvisoApoyo(true);
    void cargar(sala);
  };

  const responder = async (id: number) => {
    setError(null);
    const res = await responderMensaje(id, textoResp);
    if (!res.ok) return setError(res.error);
    setTextoResp("");
    setRespondiendo(null);
    void cargar(sala);
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 ${estado.abierto ? "border-lamp/50 bg-lamp/10" : "border-white/10 bg-dusk"}`}>
        <p className="text-sm font-bold">{estado.abierto ? "Sesión en curso" : "Sesión cerrada"}</p>
        <p className="text-xs text-faint">
          {estado.abierto ? `Cierra en ${formatoRestante(estado.restanteSeg)}` : `Abre en ${formatoRestante(estado.restanteSeg)}, todos los días de 8:00 a 9:30 pm`}
        </p>
        <div className="mt-3 rounded-xl bg-night p-3">
          <p className="text-[10px] tracking-wide text-faint">TEMA DE HOY, PROPUESTO POR MODERACIÓN</p>
          <p className="font-serif">{estado.temaDelDia}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {salas.map((s) => (
          <button
            key={s.id}
            onClick={() => setSala(s.id)}
            className={`rounded-full border px-4 py-2 text-sm ${sala === s.id ? "border-lamp bg-lamp/15 text-lamp" : "border-white/10 text-mist"}`}
          >
            {s.nombre}
          </button>
        ))}
      </div>

      {estado.abierto ? (
        <div className="rounded-2xl border border-white/10 bg-dusk p-4">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value.slice(0, 2000))}
            rows={3}
            placeholder="Comparte lo que traes hoy. Las demás personas escuchan primero, aconsejan solo si lo pides."
            className="w-full resize-none bg-transparent text-sm text-linen outline-none placeholder:text-faint"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-faint">{texto.length} / 2000</span>
            <button
              onClick={compartir}
              disabled={!texto.trim() || enviando}
              className="rounded-xl bg-lamp px-4 py-2 text-sm font-bold text-night disabled:opacity-40"
            >
              {enviando ? "Enviando..." : "Compartir"}
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl border border-white/10 bg-dusk p-4 text-sm leading-relaxed text-mist">
          Fuera de horario el círculo queda en modo lectura, como un cuaderno abierto de la comunidad.
        </p>
      )}

      {avisoApoyo && (
        <div className="rounded-2xl border border-rose/40 bg-rose/10 p-4">
          <p className="text-sm font-bold">Gracias por confiar esto aquí</p>
          <p className="mt-1 text-sm leading-relaxed text-mist">
            Lo que compartiste suena a que estás pasando por algo muy pesado. Tu publicación sigue visible y una
            persona moderadora la verá con prioridad. Si lo que sientes se vuelve demasiado, el botón SOS conecta
            con alguien disponible ahora mismo.
          </p>
          <button onClick={() => setAvisoApoyo(false)} className="mt-2 text-sm text-faint underline">
            Estoy bien por ahora
          </button>
        </div>
      )}

      {error && <p className="text-sm text-rose">{error}</p>}

      {posts === null ? (
        <p className="py-6 text-center text-sm text-faint">Cargando el círculo...</p>
      ) : posts.length === 0 ? (
        <p className="py-6 text-center text-sm text-faint">Aún no hay compartires en esta sala. El primero puede ser el tuyo.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="rounded-2xl border border-white/10 bg-dusk p-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-bold text-sage">{p.seudonimo}</span>
                <span className="text-faint">
                  {new Date(p.creada_en).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City" })}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{p.texto}</p>
              {p.respuestas.length > 0 && (
                <ul className="mt-3 space-y-2 border-l-2 border-veil pl-3">
                  {p.respuestas.map((r) => (
                    <li key={r.id}>
                      <span className="text-xs font-bold text-sage">{r.seudonimo}</span>
                      <p className="text-sm text-mist">{r.texto}</p>
                    </li>
                  ))}
                </ul>
              )}
              {estado.abierto &&
                (respondiendo === p.id ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={textoResp}
                      onChange={(e) => setTextoResp(e.target.value.slice(0, 500))}
                      placeholder="Escucha primero, responde con cuidado"
                      className="flex-1 rounded-xl border border-white/10 bg-night px-3 py-2 text-sm outline-none focus:border-lamp"
                    />
                    <button onClick={() => responder(p.id)} className="rounded-xl bg-lamp px-3 text-sm font-bold text-night">
                      Enviar
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setRespondiendo(p.id); setTextoResp(""); }} className="mt-2 text-xs text-faint underline">
                    Escuchar y responder
                  </button>
                ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
