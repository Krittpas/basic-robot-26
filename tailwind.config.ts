import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070F1C",
          900: "#0B1526",
          800: "#0F1E36",
          700: "#152846",
          600: "#1E3760",
        },
        teal: {
          400: "#1ABC9C",
          500: "#16A085",
        },
        gold: { 400: "#F39C12", 500: "#E67E22" },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        sans: ['"IBM Plex Sans Thai"', '"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(26,188,156,.25), 0 8px 32px -8px rgba(26,188,156,.35)",
      },
    },
  },
  plugins: [],
};
export default config;
