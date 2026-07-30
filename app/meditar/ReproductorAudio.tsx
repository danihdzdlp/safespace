"use client";
// Reproductor de los audios grabados con voz humana. Usa el elemento
// de audio nativo por confiabilidad en todos los dispositivos, con
// carga diferida para no descargar nada hasta que la usuaria le da play,
// y un aviso amable si el archivo aun no se ha subido al almacen.
import { useState } from "react";

export default function ReproductorAudio({ src }: { src: string }) {
  const [falta, setFalta] = useState(false);

  if (falta) {
    return <p className="mt-2 text-xs text-faint">Este audio estará disponible muy pronto.</p>;
  }
  return (
    <audio
      controls
      preload="none"
      src={src}
      onError={() => setFalta(true)}
      className="mt-3 h-10 w-full"
    />
  );
}
