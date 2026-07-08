/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F6F2",
        panel: "#FFFFFF",
        ink: "#182420",
        forest: {
          50: "#EAF1EE",
          100: "#CBDDD5",
          300: "#5F9384",
          500: "#1F5C55",
          600: "#184A44",
          700: "#123832",
        },
        grain: {
          200: "#F1DFAF",
          400: "#E3BE6C",
          500: "#D9A441",
          600: "#B9852B",
        },
        berry: {
          400: "#A55066",
          500: "#7A3B4E",
          600: "#5E2D3C",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(18, 56, 50, 0.18)",
        card: "0 2px 10px -4px rgba(18, 56, 50, 0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
}
