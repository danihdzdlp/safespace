"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/hoy", label: "Hoy" },
  { href: "/ruta", label: "Mi ruta" },
  { href: "/circulo", label: "Circulo" },
  { href: "/lecturas", label: "Lecturas" },
];

export default function Nav() {
  const ruta = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-white/10 bg-night/95 backdrop-blur">
      <div className="flex">
        {TABS.map((t) => {
          const activo = ruta.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex-1 py-4 text-center text-sm ${activo ? "font-bold text-lamp" : "text-faint"}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
