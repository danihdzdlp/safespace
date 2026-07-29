export default function Encabezado({ seudonimo, racha }: { seudonimo: string; racha: number }) {
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-2">
      <div>
        <p className="text-sm font-bold">{seudonimo}</p>
        <p className="text-xs text-faint">
          {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Mexico_City" })}
        </p>
      </div>
      {/* Solo informativo. Antes era el enlace de salir y las usuarias
          lo tocaban por curiosidad y perdian la sesion, hallazgo de pruebas reales */}
      <span className="rounded-full bg-lamp/15 px-3 py-1.5 text-sm font-bold text-lamp" title="Racha actual">
        {racha} días
      </span>
    </header>
  );
}
