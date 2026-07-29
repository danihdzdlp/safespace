"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { registrarEventoEmergencia } from "@/app/acciones";

export default function BotonEmergencia() {
  const ruta = usePathname();
  if (ruta === "/emergencia") return null;
  return (
    <Link
      href="/emergencia"
      aria-label="Boton de emergencia SOS"
      prefetch
      onClick={() => void registrarEventoEmergencia()}
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-rose text-[10px] font-extrabold text-night shadow-lg shadow-rose/40"
    >
      SOS
    </Link>
  );
}
