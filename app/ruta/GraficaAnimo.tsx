// Grafica de la evolucion del animo, ultimas dos semanas.
// SVG dibujado en el servidor, sin bibliotecas, los huecos de dias
// sin registro se respetan en lugar de inventarse.
interface Punto {
  dia: string;
  valor: number | null;
}

const COLORES = ["", "#8795A6", "#9AA9B8", "#8FB8DD", "#F0C97A", "#F7CF6E"];

export default function GraficaAnimo({ puntos }: { puntos: Punto[] }) {
  const registrados = puntos.filter((p) => p.valor != null).length;
  if (registrados < 2) {
    return (
      <p className="text-sm leading-relaxed text-mist">
        Registra tu ánimo unos días y aquí vas a ver tu evolución dibujada.
      </p>
    );
  }

  const W = 300;
  const H = 88;
  const x = (i: number) => 12 + (i * (W - 24)) / (puntos.length - 1);
  const y = (v: number) => H - 14 - ((v - 1) * (H - 32)) / 4;

  // segmentos continuos entre dias registrados consecutivos
  const lineas: string[] = [];
  let seg: string[] = [];
  puntos.forEach((p, i) => {
    if (p.valor != null) seg.push(`${x(i)},${y(p.valor)}`);
    else {
      if (seg.length > 1) lineas.push(seg.join(" "));
      seg = [];
    }
  });
  if (seg.length > 1) lineas.push(seg.join(" "));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[1, 3, 5].map((v) => (
        <line key={v} x1="10" x2={W - 10} y1={y(v)} y2={y(v)} stroke="#25394F" strokeWidth="1" />
      ))}
      {lineas.map((pts, i) => (
        <polyline key={i} points={pts} fill="none" stroke="#8FB8DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      ))}
      {puntos.map((p, i) =>
        p.valor != null ? <circle key={i} cx={x(i)} cy={y(p.valor)} r="3.4" fill={COLORES[p.valor]} /> : null
      )}
      <text x="10" y={y(5) - 6} fontSize="8" fill="#77879B">5</text>
      <text x="10" y={y(1) + 12} fontSize="8" fill="#77879B">1</text>
    </svg>
  );
}
