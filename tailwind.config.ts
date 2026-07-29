import type { Config } from "tailwindcss";

// Paleta nocturna de SafeSpace, la misma del prototipo y del documento de planeacion
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#1F1930",
        dusk: "#2A2342",
        veil: "#372C55",
        lamp: "#F5B971",
        sage: "#9BC4A8",
        rose: "#E8788A",
        linen: "#F3EEE7",
        mist: "#ADA3C9",
        faint: "#786F99",
      },
    },
  },
  plugins: [],
};
export default config;
