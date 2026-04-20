/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary: warm terracotta
        accent: "#B85C38",
        "accent-light": "#FAE8D8",
        "accent-dark": "#7A3A20",

        // Nature green — bird health, status
        forest: "#1E7A4F",
        "forest-light": "#D4EEE0",
        "forest-dark": "#124F30",

        // Gold — competitions, wins
        gold: "#C48A0E",
        "gold-light": "#FBF0C4",
        "gold-dark": "#7A5500",

        // Warm gray scale (replaces clinical cold grays)
        gray: {
          50: "#FAF6F0",
          100: "#F2E8DC",
          200: "#E4D4BE",
          300: "#C8B49E",
          400: "#A08878",
          500: "#7A6456",
          600: "#5C4A3C",
          700: "#3D2E22",
          800: "#2A1E14",
          900: "#1C1209",
        },
      },
      fontFamily: {
        display: ["Lora", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
