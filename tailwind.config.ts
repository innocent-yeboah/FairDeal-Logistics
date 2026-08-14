import type { Config } from "tailwindcss";

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
        // Primary — Deep Navy (#1A1A2E at 600)
        brand: {
          50: "#F2F2F7",
          100: "#DEDEEB",
          200: "#B9B9D1",
          300: "#8E8EB0",
          400: "#63638D",
          500: "#3B3B60",
          600: "#1A1A2E",
          700: "#141423",
          800: "#0E0E19",
          900: "#07070D",
        },
        // Secondary — Gold (#D4AF37 at 400)
        gold: {
          50: "#FBF7E8",
          100: "#F4EAC2",
          200: "#EAD989",
          300: "#DFC65C",
          400: "#D4AF37",
          500: "#B3922B",
          600: "#8C7221",
          700: "#665317",
          800: "#40340E",
          900: "#201A07",
        },
        // Accent — Warm Terracotta (#E8A87C at 300)
        terracotta: {
          50: "#FDF6F0",
          100: "#F8E4D3",
          200: "#F0C6A8",
          300: "#E8A87C",
          400: "#DE8F5C",
          500: "#D27741",
        },
        // Errors / destructive
        rose: {
          50: "#FDF2F2",
          100: "#FAE0E0",
          200: "#F4A9A8",
          300: "#EE8180",
          400: "#E45F5E",
          500: "#C74544",
        },
        ink: "#1A1A1A",
        cream: "#F7F7F9",
        line: "#E5E5EA",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,26,46,0.05), 0 8px 24px rgba(26,26,46,0.07)",
        pop: "0 20px 40px -20px rgba(26, 26, 46, 0.45)",
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
