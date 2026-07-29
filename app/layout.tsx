import type { Metadata, Viewport } from "next";
import "./globals.css";
import BotonEmergencia from "@/components/BotonEmergencia";

export const metadata: Metadata = {
  title: "SafeSpace",
  description: "Un lugar para no cargar sola lo que sientes. Apoyo emocional entre pares.",
};
export const viewport: Viewport = { themeColor: "#12202F" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>
        <div className="mx-auto min-h-dvh w-full max-w-md relative pb-24">
          {children}
          {/* El boton de emergencia vive en el layout raiz, fuera del arbol de rutas
              protegidas, para estar visible en toda pantalla con o sin sesion */}
          <BotonEmergencia />
        </div>
      </body>
    </html>
  );
}
