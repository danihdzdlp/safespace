// El arbol con su paisaje a color. El cielo cambia de tono y de clima
// segun el animo registrado hoy, el pasto es verde, el sol amarillo y
// las nubes van de blancas a grises segun el dia. Los colores de la
// escena son propios de la ilustracion, no de la paleta de la interfaz.
type Clima = "sereno" | "lluvia" | "nublado" | "claros" | "mediosol" | "sol";

function climaDelAnimo(animo: number | null): Clima {
  if (animo == null) return "sereno";
  if (animo <= 1) return "lluvia";
  if (animo === 2) return "nublado";
  if (animo === 3) return "claros";
  if (animo === 4) return "mediosol";
  return "sol";
}

const CIELOS: Record<Clima, string> = {
  sereno: "#1C2C42",
  lluvia: "#54677C",
  nublado: "#7590A8",
  claros: "#6FA3CF",
  mediosol: "#79B2DE",
  sol: "#82BEEA",
};

function Nube({ x, y, escala = 1, color }: { x: number; y: number; escala?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`} fill={color}>
      <ellipse cx="0" cy="0" rx="13" ry="7" />
      <ellipse cx="10" cy="-3" rx="9" ry="6" />
      <ellipse cx="-10" cy="-2" rx="8" ry="5" />
    </g>
  );
}

export default function Arbol({ etapa, animo }: { etapa: number; animo: number | null }) {
  const clima = climaDelAnimo(animo);
  const TRONCO = "#8A6B4F";
  const COPA = "#5CAB77";
  const COPA_SOMBRA = "#4C9163";
  const SOL = "#F7CF6E";

  return (
    <svg viewBox="0 0 150 112" className="h-32 w-44 shrink-0" aria-hidden="true">
      {/* cielo segun el clima */}
      <rect x="0" y="0" width="150" height="106" rx="14" fill={CIELOS[clima]} />

      {clima === "sereno" && (
        <g>
          <circle cx="122" cy="22" r="8" fill="#F2E9C8" />
          <circle cx="125" cy="19" r="7" fill={CIELOS.sereno} />
          <circle cx="30" cy="16" r="1.4" fill="#F2E9C8" opacity="0.9" />
          <circle cx="52" cy="26" r="1.1" fill="#F2E9C8" opacity="0.7" />
          <circle cx="88" cy="14" r="1.2" fill="#F2E9C8" opacity="0.8" />
          <circle cx="104" cy="38" r="1" fill="#F2E9C8" opacity="0.6" />
          <circle cx="20" cy="38" r="1" fill="#F2E9C8" opacity="0.6" />
        </g>
      )}

      {clima === "lluvia" && (
        <g>
          <Nube x={110} y={22} escala={1.15} color="#5E6E80" />
          <Nube x={38} y={16} escala={0.8} color="#75859A" />
          <g stroke="#BBD4EC" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
            <path d="M100 34 L97 43" /><path d="M110 35 L107 44" />
            <path d="M120 34 L117 43" /><path d="M130 33 L127 42" />
          </g>
        </g>
      )}

      {clima === "nublado" && (
        <g>
          <Nube x={112} y={22} escala={1.1} color="#C7D2DD" />
          <Nube x={44} y={16} escala={0.9} color="#DCE4EB" />
          <Nube x={78} y={32} escala={0.7} color="#AEBDCB" />
        </g>
      )}

      {clima === "claros" && (
        <g>
          <circle cx="124" cy="18" r="8" fill={SOL} />
          <Nube x={112} y={24} escala={1.05} color="#EAF0F6" />
          <Nube x={40} y={16} escala={0.7} color="#DCE6EE" />
        </g>
      )}

      {clima === "mediosol" && (
        <g>
          <circle cx="118" cy="22" r="10" fill={SOL} />
          <Nube x={102} y={32} escala={0.75} color="#F2F6FA" />
        </g>
      )}

      {clima === "sol" && (
        <g>
          <circle cx="118" cy="24" r="11" fill={SOL} />
          <g stroke={SOL} strokeWidth="2" strokeLinecap="round">
            <path d="M118 6 L118 11" /><path d="M118 37 L118 42" />
            <path d="M100 24 L95 24" /><path d="M136 24 L141 24" />
            <path d="M105 11 L108 14" /><path d="M131 34 L128 31" />
            <path d="M131 14 L128 17" /><path d="M105 37 L108 34" />
          </g>
        </g>
      )}

      {/* pasto verde, mas apagado cuando llueve */}
      <ellipse cx="75" cy="99" rx="48" ry="8" fill={clima === "lluvia" ? "#3E7454" : "#4B9160"} />
      <ellipse cx="46" cy="102" rx="26" ry="5" fill={clima === "lluvia" ? "#356348" : "#3F7D52"} />

      {/* arbol, centrado en el paisaje */}
      <g transform="translate(15 0)">
        {etapa === 0 && (
          <g>
            <ellipse cx="60" cy="96" rx="7" ry="9" fill="#E3AE5E" />
            <path d="M60 87 q4 -6 0 -10" stroke={COPA} fill="none" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
        {etapa === 1 && (
          <g>
            <path d="M60 99 L60 78" stroke={COPA} strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="52" cy="76" rx="8" ry="4.5" fill={COPA} transform="rotate(-30 52 76)" />
            <ellipse cx="68" cy="72" rx="8" ry="4.5" fill={COPA} transform="rotate(28 68 72)" />
          </g>
        )}
        {etapa === 2 && (
          <g>
            <path d="M60 99 L60 62" stroke={TRONCO} strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="50" cy="72" rx="9" ry="5" fill={COPA} transform="rotate(-32 50 72)" />
            <ellipse cx="70" cy="66" rx="9" ry="5" fill={COPA} transform="rotate(30 70 66)" />
            <ellipse cx="60" cy="56" rx="6.5" ry="9" fill={COPA} />
          </g>
        )}
        {etapa === 3 && (
          <g>
            <path d="M60 99 L60 58" stroke={TRONCO} strokeWidth="6" strokeLinecap="round" />
            <circle cx="60" cy="45" r="19" fill={COPA} />
            <circle cx="52" cy="50" r="9" fill={COPA_SOMBRA} />
          </g>
        )}
        {etapa === 4 && (
          <g>
            <path d="M60 99 L60 52 M60 66 L46 56 M60 62 L74 52" stroke={TRONCO} fill="none" strokeWidth="6" strokeLinecap="round" />
            <circle cx="44" cy="46" r="14" fill={COPA_SOMBRA} />
            <circle cx="76" cy="42" r="14" fill={COPA} />
            <circle cx="60" cy="32" r="16" fill={COPA} />
          </g>
        )}
        {etapa >= 5 && (
          <g>
            <path d="M60 99 L60 50 M60 66 L42 54 M60 60 L78 48" stroke={TRONCO} fill="none" strokeWidth="7" strokeLinecap="round" />
            <circle cx="38" cy="46" r="14" fill={COPA_SOMBRA} />
            <circle cx="82" cy="44" r="14" fill={COPA_SOMBRA} />
            <circle cx="60" cy="28" r="18" fill={COPA} />
            <circle cx="49" cy="36" r="13" fill={COPA} />
            <circle cx="71" cy="34" r="13" fill={COPA} />
            <circle cx="46" cy="42" r="2.5" fill={SOL} />
            <circle cx="63" cy="26" r="2.5" fill={SOL} />
            <circle cx="78" cy="40" r="2.5" fill={SOL} />
          </g>
        )}
      </g>
    </svg>
  );
}
