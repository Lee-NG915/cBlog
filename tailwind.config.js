/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E6F3F1",
          100: "#CFE9E5",
          200: "#9DD1C9",
          300: "#6AB9AD",
          400: "#3AA194",
          500: "#178B7E",
          600: "#0F766E",
          700: "#0B5F59",
          800: "#084B47",
          900: "#053B38",
        },
        background: {
          light: "#F7F4ED",
          dark: "#181818",
        },
        surface: {
          light: "#FFFDF8",
          dark: "#242424",
        },
        ink: {
          DEFAULT: "#1F2933",
          muted: "#687076",
          soft: "#8B949E",
        },
        line: {
          light: "#E5DFD3",
          dark: "#3A3A3A",
        },
      },
      transitionProperty: {
        colors: "color, background-color, border-color",
      },
    },
  },
  plugins: [],
};
