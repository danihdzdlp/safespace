"use client";
// Meditacion guiada con voz. Usa el sintetizador de voz del propio
// dispositivo, sin archivos ni servicios externos, lee cada paso
// despacio y deja una pausa de respiracion entre parrafos.
// Si el navegador no soporta voz, el componente no aparece.
// En el roadmap, versiones grabadas con voz humana calida.
import { useEffect, useRef, useState } from "react";

export default function ReproductorMeditacion({ parrafos }: { parrafos: string[] }) {
  const [soportado, setSoportado] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [paso, setPaso] = useState(0);
  const pausaRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hay = typeof window !== "undefined" && "speechSynthesis" in window;
    setSoportado(hay);
    if (hay) window.speechSynthesis.getVoices(); // precarga las voces
    return () => {
      if (pausaRef.current) clearTimeout(pausaRef.current);
      if (hay) window.speechSynthesis.cancel();
    };
  }, []);

  const detener = () => {
    if (pausaRef.current) clearTimeout(pausaRef.current);
    window.speechSynthesis.cancel();
    setReproduciendo(false);
    setPaso(0);
  };

  const hablarPaso = (i: number) => {
    if (i >= parrafos.length) {
      setReproduciendo(false);
      setPaso(0);
      return;
    }
    setPaso(i + 1);
    const u = new SpeechSynthesisUtterance(parrafos[i]);
    u.lang = "es-MX";
    u.rate = 0.82; // mas lento que el habla normal, ritmo de meditacion
    u.pitch = 0.95;
    const voz = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.toLowerCase().startsWith("es"));
    if (voz) u.voice = voz;
    // pausa de respiracion entre pasos antes de continuar
    u.onend = () => {
      pausaRef.current = setTimeout(() => hablarPaso(i + 1), 2000);
    };
    window.speechSynthesis.speak(u);
  };

  const reproducir = () => {
    window.speechSynthesis.cancel();
    setReproduciendo(true);
    hablarPaso(0);
  };

  if (!soportado) return null;

  return (
    <div className="mt-5 rounded-2xl border border-lamp/40 bg-lamp/10 p-4">
      <p className="text-sm font-bold text-lamp">Meditación guiada con voz</p>
      <p className="mt-1 text-xs leading-relaxed text-mist">
        Ponte cómoda, usa audífonos si puedes, y deja que la voz te lleve paso a paso.
        Es la voz de tu dispositivo, respira con su ritmo.
      </p>
      <div className="mt-3 flex items-center gap-3">
        {reproduciendo ? (
          <button onClick={detener} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-linen">
            Detener
          </button>
        ) : (
          <button onClick={reproducir} className="rounded-xl bg-lamp px-4 py-2.5 text-sm font-bold text-night">
            Reproducir
          </button>
        )}
        {reproduciendo && (
          <span className="text-xs text-faint">
            Guiando paso {paso} de {parrafos.length}
          </span>
        )}
      </div>
    </div>
  );
}
