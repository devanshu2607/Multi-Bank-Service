/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#090E1A",
          surface: "#111827",
          glass: "rgba(17, 24, 39, 0.65)",
          primary: "#7C5CFF",
          secondary: "#4F8CFF",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          muted: "#94A3B8",
          border: "rgba(255, 255, 255, 0.08)",
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
