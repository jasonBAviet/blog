import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: {
          light: "#FAF9F7",
          dark: "#1A1A1A",
        },
        ink: {
          light: "#2D2D2D",
          dark: "#E0E0E0",
        },
        muted: {
          light: "#6B6B6B",
          dark: "#A0A0A0",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif-vn)", "serif"],
        sans: ["var(--font-sans-vn)", "sans-serif"],
      },
      maxWidth: {
        prose: "720px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "720px",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
