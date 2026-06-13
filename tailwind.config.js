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
      fontFamily: {
        sans: [
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Noto Sans SC",
          "Source Han Sans SC",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "Songti SC",
          "STSong",
          "Noto Serif SC",
          "Source Han Serif SC",
          "serif",
        ],
        display: [
          "Songti SC",
          "STSong",
          "Noto Serif SC",
          "Source Han Serif SC",
          "serif",
        ],
      },
      colors: {
        primary: {
          50: "#F8EAE4",
          100: "#F1D6CC",
          200: "#E4AF9D",
          300: "#D4866A",
          400: "#C76E4C",
          500: "#B95832",
          600: "#9C4527",
          700: "#7E351F",
          800: "#60291B",
          900: "#462017",
        },
        accent: {
          sage: "#667A54",
          blue: "#315F72",
          gold: "#C08B2C",
          rose: "#9D4D4D",
        },
        background: {
          light: "#F6F1EA",
          dark: "#191715",
        },
        surface: {
          light: "#FFFAF3",
          strong: "#F2E7D8",
          dark: "#24211E",
        },
        ink: {
          DEFAULT: "#22201D",
          muted: "#5F574E",
          soft: "#83796E",
        },
        line: {
          light: "#DED2C1",
          strong: "#C8B8A2",
          dark: "#403A34",
        },
      },
      boxShadow: {
        editorial: "0 18px 50px rgba(72, 52, 35, 0.12)",
        "editorial-sm": "0 10px 28px rgba(72, 52, 35, 0.08)",
      },
      transitionProperty: {
        colors: "color, background-color, border-color",
      },
    },
  },
  plugins: [],
};
