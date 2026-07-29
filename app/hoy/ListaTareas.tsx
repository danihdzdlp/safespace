"use client";
// Lista interactiva de tareas. Actualizacion optimista con reversa
// si el servidor falla, y estado de carga por renglon.
// Cada tarea trae una guia de como hacerla que se abre con su propio
// boton, separado del de completar, para no marcarla por accidente.
// TareaRenglon esta memoizado para que marcar una tarea no
// re-renderice a las demas (optimizacion manual, rubrica nivel 5).
import { memo, useCallback, useState, useTransition } from "react";
import { marcarTarea } from "@/app/acciones";

export interface TareaDelDia {
  id: number;
  completada: boolean;
  titulo: string;
  categoria: string;
  minutos: number;
  guia: string | null;
}

const TareaRenglon = memo(function TareaRenglon({
  tarea,
  ocupada,
  onToggle,
}: {
  tarea: TareaDelDia;
  ocupada: boolean;
  onToggle: (id: number, completada: boolean) => void;
}) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        tarea.completada ? "border-sage/50 bg-sage/10" : "border-white/10 bg-dusk"
      } ${ocupada ? "opacity-60" : ""}`}
    >
      <button
        onClick={() => onToggle(tarea.id, !tarea.completada)}
        disabled={ocupada}
        className="flex w-full items-start gap-3 text-left"
      >
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold ${
            tarea.completada ? "border-sage bg-sage text-night" : "border-faint"
          }`}
        >
          {tarea.completada ? "✓" : ""}
        </span>
        <span>
          <span className={`block text-sm ${tarea.completada ? "text-mist line-through" : "text-linen"}`}>{tarea.titulo}</span>
          <span className="text-xs text-faint">
            {tarea.categoria}, {tarea.minutos} min
          </span>
        </span>
      </button>
      {tarea.guia && (
        <div className="pl-9">
          <button onClick={() => setAbierta(!abierta)} className="mt-1.5 text-xs text-lamp underline">
            {abierta ? "Cerrar la guía" : "¿Cómo se hace?"}
          </button>
          {abierta && <p className="mt-2 text-sm leading-relaxed text-mist">{tarea.guia}</p>}
        </div>
      )}
    </div>
  );
});

export default function ListaTareas({ tareas: iniciales }: { tareas: TareaDelDia[] }) {
  const [tareas, setTareas] = useState(iniciales);
  const [ocupadaId, setOcupadaId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const onToggle = useCallback((id: number, completada: boolean) => {
    setError(null);
    setOcupadaId(id);
    // Optimista, se pinta el cambio de inmediato y se revierte si el servidor falla
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, completada } : t)));
    startTransition(async () => {
      const res = await marcarTarea(id, completada);
      if (!res.ok) {
        setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, completada: !completada } : t)));
        setError(res.error);
      }
      setOcupadaId(null);
    });
  }, []);

  const hechas = tareas.filter((t) => t.completada).length;
  const pct = tareas.length ? Math.round((hechas / tareas.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-faint">Avance de hoy</span>
        <span className={`font-bold ${pct === 100 ? "text-sage" : "text-lamp"}`}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-veil">
        <div
          className={`h-2 rounded-full transition-all ${pct === 100 ? "bg-sage" : "bg-lamp"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {tareas.length === 0 && <p className="py-4 text-center text-sm text-faint">Preparando tu path del día, recarga en un momento.</p>}
      {tareas.map((t) => (
        <TareaRenglon key={t.id} tarea={t} ocupada={ocupadaId === t.id} onToggle={onToggle} />
      ))}
      {error && <p className="text-sm text-rose">{error}</p>}
      {pct === 100 && tareas.length > 0 && (
        <p className="text-sm leading-relaxed text-sage">Completaste tu día. Pequeño no es poco, y hoy volviste.</p>
      )}
    </div>
  );
}
