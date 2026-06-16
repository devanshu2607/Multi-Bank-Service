/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "rgba(var(--brand-bg), <alpha-value>)",
          surface: "rgba(var(--brand-surface), <alpha-value>)",
          glass: "rgba(var(--brand-glass), <alpha-value>)",
          primary: "rgba(var(--brand-primary), <alpha-value>)",
          secondary: "rgba(var(--brand-secondary), <alpha-value>)",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          muted: "rgba(var(--brand-muted), <alpha-value>)",
          border: "rgba(var(--brand-border), <alpha-value>)",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "3xl": "24px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
}
