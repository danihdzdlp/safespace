"use client";
import { useState, useTransition } from "react";
import { registrarAnimo } from "@/app/acciones";

const CARAS = ["1", "2", "3", "4", "5"];

export default function AnimoDelDia({ inicial, base }: { inicial: number | null; base: number }) {
  const [valor, setValor] = useState(inicial);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const marcar = (v: number) => {
    setError(null);
    const previo = valor;
    setValor(v);
    startTransition(async () => {
      const res = await registrarAnimo(v);
      if (!res.ok) { setValor(previo); setError(res.error); }
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-dusk p-4">
      <p className="mb-3 text-xs tracking-wide text-faint">COMO TE SIENTES HOY, DEL 1 AL 5</p>
      <div className="flex gap-2">
        {CARAS.map((c, i) => (
          <button
            key={c}
            onClick={() => marcar(i + 1)}
            disabled={pendiente}
            className={`flex-1 rounded-xl border py-3 text-lg font-bold ${valor === i + 1 ? "border-lamp bg-lamp/15 text-lamp" : "border-white/10 text-mist"}`}
          >
            {c}
          </button>
        ))}
      </div>
      {valor && <p className="mt-2 text-xs text-faint">Registrado. Tu punto de partida fue {base} de 5, cada registro dibuja tu evolucion.</p>}
      {error && <p className="mt-2 text-sm text-rose">{error}</p>}
    </div>
  );
}
