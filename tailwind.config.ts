import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        "surface-overlay": "var(--surface-overlay)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        // Violet — primary accent (data color)
        violet: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // Keep indigo for backwards compat with existing components
        indigo: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Cascadia Code", "monospace"],
      },
      // ── Mathematical precision: tight border radii ─────────────────────
      borderRadius: {
        none: "0px",
        sm:   "2px",
        DEFAULT: "3px",
        md:   "4px",
        lg:   "6px",
        xl:   "8px",
        "2xl": "10px",
        full: "9999px",
      },
      // ── Tight letter-spacing for headings ─────────────────────────────
      letterSpacing: {
        tightest: "-0.05em",
        tighter:  "-0.04em",
        tight:    "-0.025em",
        normal:   "-0.01em",
        wide:     "0.04em",
        wider:    "0.08em",
        widest:   "0.14em",
      },
      animation: {
        "fade-in":    "fade-in 0.15s ease-out",
        "slide-up":   "slide-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(139,92,246,0.20)" },
          "50%":      { boxShadow: "0 0 0 1px rgba(139,92,246,0.45), 0 0 16px rgba(139,92,246,0.12)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
