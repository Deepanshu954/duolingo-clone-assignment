import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        duo: {
          green: "#58cc02",
          "green-dark": "#46a302",
          "green-light": "#61e002",
          blue: "#1cb0f6",
          "blue-dark": "#1488c9",
          red: "#ff4b4b",
          "red-dark": "#ea2b2b",
          orange: "#ff9600",
          yellow: "#ffc800",
          purple: "#ce82ff",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
