/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#14b8a6", // Teal 500
        secondary: "#334155", // Slate 700
        background: "#0f172a", // Slate 900
        surface: "#1e293b", // Slate 800
        textPrimary: "#f8fafc", // Slate 50
        textSecondary: "#94a3b8", // Slate 400
      }
    },
  },
  plugins: [],
}
