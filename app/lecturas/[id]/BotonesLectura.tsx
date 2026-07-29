"use client";
import { useState, useTransition } from "react";
import { marcarLectura } from "@/app/acciones";

export default function BotonesLectura({ lecturaId, leida: l0, guardada: g0 }: { lecturaId: number; leida: boolean; guardada: boolean }) {
  const [leida, setLeida] = useState(l0);
  const [guardada, setGuardada] = useState(g0);
  const [pendiente, startTransition] = useTransition();

  const marcar = (campo: "leida" | "guardada", valor: boolean) => {
    campo === "leida" ? setLeida(valor) : setGuardada(valor);
    startTransition(async () => {
      const res = await marcarLectura(lecturaId, campo, valor);
      if (!res.ok) campo === "leida" ? setLeida(!valor) : setGuardada(!valor);
    });
  };

  return (
    <div className="mt-6 flex gap-3">
      <button
        onClick={() => marcar("leida", !leida)}
        disabled={pendiente}
        className={`flex-1 rounded-xl py-3.5 font-bold ${leida ? "border border-sage/50 bg-sage/10 text-sage" : "bg-lamp text-night"}`}
      >
        {leida ? "Marcada como leída" : "Marcar como leída"}
      </button>
      <button
        onClick={() => marcar("guardada", !guardada)}
        disabled={pendiente}
        className={`rounded-xl border px-4 font-bold ${guardada ? "border-lamp bg-lamp/15 text-lamp" : "border-white/10 text-mist"}`}
      >
        {guardada ? "Guardada" : "Guardar"}
      </button>
    </div>
  );
}
