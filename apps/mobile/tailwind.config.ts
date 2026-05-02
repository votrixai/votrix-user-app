import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#0a0a0a",
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#737373",
        },
        primary: {
          DEFAULT: "#171717",
          foreground: "#fafafa",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          foreground: "#0a0a0a",
        },
        accent: {
          DEFAULT: "#f5f5f5",
          foreground: "#0a0a0a",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#fafafa",
        },
        border: "#e5e5e5",
        input: "#d4d4d4",
        ring: "#171717",
      },
      fontWeight: {
        light: "300",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
    },
  },
  plugins: [],
} satisfies Config;
