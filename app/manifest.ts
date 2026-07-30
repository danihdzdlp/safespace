// La app se puede instalar en el telefono con su propio icono,
// como una aplicacion nativa. Next genera el manifest desde aqui.
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SafeSpace",
    short_name: "SafeSpace",
    description: "Un lugar para no cargar en soledad lo que sientes.",
    start_url: "/hoy",
    display: "standalone",
    background_color: "#12202F",
    theme_color: "#12202F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
