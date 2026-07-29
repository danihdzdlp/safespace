// El arbol con su paisaje. El cielo refleja el animo registrado hoy,
// lluvia, nublado, claros, medio sol o sol pleno, y un cielo estrellado
// sereno cuando aun no hay registro. Componente de servidor puro.
type Clima = "sereno" | "lluvia" | "nublado" | "claros" | "mediosol" | "sol";

function climaDelAnimo(animo: number | null): Clima {
  if (animo == null) return "sereno";
  if (animo <= 1) return "lluvia";
  if (animo === 2) return "nublado";
  if (animo === 3) return "claros";
  if (animo === 4) return "mediosol";
  return "sol";
}

function Nube({ x, y, escala = 1, tono = "fill-faint" }: { x: number; y: number; escala?: number; tono?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`} className={tono}>
      <ellipse cx="0" cy="0" rx="13" ry="7" />
      <ellipse cx="10" cy="-3" rx="9" ry="6" />
      <ellipse cx="-10" cy="-2" rx="8" ry="5" />
    </g>
  );
}

export default function Arbol({ etapa, animo }: { etapa: number; animo: number | null }) {
  const clima = climaDelAnimo(animo);
  return (
    <svg viewBox="0 0 150 112" className="h-32 w-44 shrink-0" aria-hidden="true">
      {/* cielo */}
      <rect x="0" y="0" width="150" height="106" rx="14" className="fill-night" />

      {clima === "sereno" && (
        <g>
          <circle cx="122" cy="22" r="8" className="fill-linen" opacity="0.9" />
          <circle cx="125" cy="19" r="7" className="fill-night" />
          <circle cx="30" cy="16" r="1.4" className="fill-linen" opacity="0.8" />
          <circle cx="52" cy="26" r="1.1" className="fill-linen" opacity="0.6" />
          <circle cx="88" cy="14" r="1.2" className="fill-linen" opacity="0.7" />
          <circle cx="104" cy="38" r="1" className="fill-linen" opacity="0.5" />
          <circle cx="20" cy="38" r="1" className="fill-linen" opacity="0.5" />
        </g>
      )}

      {clima === "lluvia" && (
        <g>
          <Nube x={110} y={22} escala={1.15} />
          <Nube x={38} y={16} escala={0.8} tono="fill-veil" />
          <g className="stroke-mist" strokeWidth="1.6" strokeLinecap="round" opacity="0.8">
            <path d="M100 34 L97 43" /><path d="M110 35 L107 44" />
            <path d="M120 34 L117 43" /><path d="M130 33 L127 42" />
          </g>
        </g>
      )}

      {clima === "nublado" && (
        <g>
          <Nube x={112} y={22} escala={1.1} />
          <Nube x={44} y={16} escala={0.9} tono="fill-mist" />
          <Nube x={78} y={32} escala={0.7} tono="fill-veil" />
        </g>
      )}

      {clima === "claros" && (
        <g>
          <circle cx="124" cy="18" r="8" className="fill-lamp" />
          <Nube x={112} y={24} escala={1.05} />
          <Nube x={40} y={16} escala={0.7} tono="fill-veil" />
        </g>
      )}

      {clima === "mediosol" && (
        <g>
          <circle cx="118" cy="22" r="10" className="fill-lamp" />
          <Nube x={102} y={32} escala={0.75} />
        </g>
      )}

      {clima === "sol" && (
        <g>
          <circle cx="118" cy="24" r="11" className="fill-lamp" />
          <g className="stroke-lamp" strokeWidth="2" strokeLinecap="round">
            <path d="M118 6 L118 11" /><path d="M118 37 L118 42" />
            <path d="M100 24 L95 24" /><path d="M136 24 L141 24" />
            <path d="M105 11 L108 14" /><path d="M131 34 L128 31" />
            <path d="M131 14 L128 17" /><path d="M105 37 L108 34" />
          </g>
        </g>
      )}

      {/* suelo */}
      <ellipse cx="75" cy="99" rx="48" ry="8" className="fill-veil" />

      {/* arbol, centrado en el paisaje */}
      <g transform="translate(15 0)">
        {etapa === 0 && (
          <g>
            <ellipse cx="60" cy="96" rx="7" ry="9" className="fill-lamp" />
            <path d="M60 87 q4 -6 0 -10" className="stroke-sage fill-none" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
        {etapa === 1 && (
          <g>
            <path d="M60 99 L60 78" className="stroke-sage" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="52" cy="76" rx="8" ry="4.5" className="fill-sage" transform="rotate(-30 52 76)" />
            <ellipse cx="68" cy="72" rx="8" ry="4.5" className="fill-sage" transform="rotate(28 68 72)" />
          </g>
        )}
        {etapa === 2 && (
          <g>
            <path d="M60 99 L60 62" className="stroke-sage" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="50" cy="72" rx="9" ry="5" className="fill-sage" transform="rotate(-32 50 72)" />
            <ellipse cx="70" cy="66" rx="9" ry="5" className="fill-sage" transform="rotate(30 70 66)" />
            <ellipse cx="60" cy="56" rx="6.5" ry="9" className="fill-sage" />
          </g>
        )}
        {etapa === 3 && (
          <g>
            <path d="M60 99 L60 58" className="stroke-faint" strokeWidth="6" strokeLinecap="round" />
            <circle cx="60" cy="45" r="19" className="fill-sage" />
          </g>
        )}
        {etapa === 4 && (
          <g>
            <path d="M60 99 L60 52 M60 66 L46 56 M60 62 L74 52" className="stroke-faint fill-none" strokeWidth="6" strokeLinecap="round" />
            <circle cx="44" cy="46" r="14" className="fill-sage" />
            <circle cx="76" cy="42" r="14" className="fill-sage" />
            <circle cx="60" cy="32" r="16" className="fill-sage" />
          </g>
        )}
        {etapa >= 5 && (
          <g>
            <path d="M60 99 L60 50 M60 66 L42 54 M60 60 L78 48" className="stroke-faint fill-none" strokeWidth="7" strokeLinecap="round" />
            <circle cx="38" cy="46" r="14" className="fill-sage" />
            <circle cx="82" cy="44" r="14" className="fill-sage" />
            <circle cx="60" cy="28" r="18" className="fill-sage" />
            <circle cx="49" cy="36" r="13" className="fill-sage" />
            <circle cx="71" cy="34" r="13" className="fill-sage" />
            <circle cx="46" cy="42" r="2.5" className="fill-lamp" />
            <circle cx="63" cy="26" r="2.5" className="fill-lamp" />
            <circle cx="78" cy="40" r="2.5" className="fill-lamp" />
          </g>
        )}
      </g>
    </svg>
  );
}
