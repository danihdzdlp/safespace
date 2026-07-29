import type { Config } from "tailwindcss";

// Paleta nocturna de SafeSpace, la misma del prototipo y del documento de planeacion
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Azul pizarra sereno, pensado para leer de noche sin fatiga,
        // acentos con poca saturacion y texto marfil en lugar de blanco puro.
        night: "#12202F",
        dusk: "#1A2B3D",
        veil: "#25394F",
        lamp: "#8FB8DD",
        sage: "#8AC6B1",
        rose: "#E58296",
        linen: "#E9EEF3",
        mist: "#AFBFCE",
        faint: "#77879B",
      },
    },
  },
  plugins: [],
};
export default config;
