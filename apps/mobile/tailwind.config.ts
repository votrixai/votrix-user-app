import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#252525",
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#737373",
        },
        primary: {
          DEFAULT: "#171717",
          foreground: "#FAFAFA",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FAFAFA",
        },
        border: "#E5E5E5",
        input: "#E5E5E5",
        ring: "#171717",
      },
    },
  },
  plugins: [],
} satisfies Config;
