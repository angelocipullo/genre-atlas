import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0b0d11",
        surface: {
          DEFAULT: "#12151b",
          2: "#171b22",
        },
        wire: "#262b34",
        ink: {
          DEFAULT: "#eceef1",
          muted: "#98a0ab",
          faint: "#5c6470",
        },
        accent: "#4fa3d1",
        dot: "#1c2028",
      },
      gridTemplateColumns: {
        "16": "repeat(16, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};

export default config;
