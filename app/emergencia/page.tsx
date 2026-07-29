// Pagina de emergencia. Prioridad numero uno del sistema.
// No depende de sesion, de la ventana horaria ni de datos remotos,
// los recursos viven en el codigo. Mostrar primero, registrar despues.
import Link from "next/link";

// Cien por ciento estatica, sin sesion, sin base de datos, sin red.
// Es la pantalla que debe funcionar cuando todo lo demas falla.
export const dynamic = "force-static";

export default function Emergencia() {
  return (
    <main className="flex min-h-dvh flex-col justify-center gap-5 px-6 py-10">
      <div className="mx-auto h-16 w-16 rounded-full bg-rose/20 p-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-rose" />
      </div>
      <h1 className="text-center font-serif text-2xl leading-snug">
        No tienes que atravesar esto en soledad.
      </h1>
      <p className="text-center text-sm leading-relaxed text-mist">
        Hay personas capacitadas disponibles ahora mismo, de forma gratuita y confidencial.
        Mientras decides, respira lento siguiendo el punto de arriba.
      </p>
      <a href="tel:8009112000" className="rounded-2xl bg-rose py-4 text-center text-base font-extrabold text-night">
        Llamar a la Línea de la Vida
      </a>
      <p className="text-center text-lg font-bold tracking-wide text-linen">800 911 2000</p>
      <a href="tel:911" className="rounded-2xl border border-white/15 bg-dusk py-4 text-center text-base font-bold text-linen">
        Emergencias, 911
      </a>
      <Link href="/hoy" className="pt-2 text-center text-sm text-faint">
        Volver a mi espacio
      </Link>
      <p className="pt-6 text-center text-[11px] leading-relaxed text-faint">
        SafeSpace no sustituye la atención de un profesional de la salud mental.
      </p>
    </main>
  );
}
