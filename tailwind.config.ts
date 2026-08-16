import type { Config } from "tailwindcss";

/**
 * Fair Deal brand palette — Ghana × Nigeria × China, blended for commerce:
 * - Forest green (Ghana / Nigeria) as primary
 * - Warm gold (Ghana star / China) as premium accent
 * - Crimson red (Ghana / China) for urgency & deals
 * - Clean ivory white (Nigeria) for surfaces
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Primary — Forest green (Ghana / Nigeria)
        brand: {
          50: "#F1F8F4",
          100: "#D9EEE2",
          200: "#B0DCC4",
          300: "#7BC29C",
          400: "#429B6E",
          500: "#1F7A4D",
          600: "#0B6B3A",
          700: "#085530",
          800: "#064026",
          900: "#042A19",
        },
        // Secondary — Shared gold (Ghana / China)
        gold: {
          50: "#FFF9E8",
          100: "#FFF0C2",
          200: "#FFE08A",
          300: "#FCD34D",
          400: "#F5C518",
          500: "#D4A017",
          600: "#A87B12",
          700: "#7A5A0E",
          800: "#4D3909",
          900: "#2A1F05",
        },
        // Accent — Crimson (Ghana / China), used for deals & emphasis
        terracotta: {
          50: "#FEF2F2",
          100: "#FCE4E4",
          200: "#F7B6B6",
          300: "#EF7A7A",
          400: "#E23B3B",
          500: "#CE1126",
        },
        // Errors / destructive (aligned with crimson family)
        rose: {
          50: "#FEF2F2",
          100: "#FCE4E4",
          200: "#F7B6B6",
          300: "#EF7A7A",
          400: "#E23B3B",
          500: "#B91C1C",
        },
        ink: "#122016",
        cream: "#F7F8F4",
        line: "#DCE5DE",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,107,58,0.06), 0 8px 24px rgba(11,107,58,0.08)",
        pop: "0 20px 40px -20px rgba(11, 107, 58, 0.4)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 240ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
