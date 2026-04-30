import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#061b31",
        muted: {
          DEFAULT: "#f6f9fc",
          foreground: "#64748d",
        },
        primary: {
          DEFAULT: "#533afd",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f6f9fc",
          foreground: "#061b31",
        },
        accent: {
          DEFAULT: "#f6f9fc",
          foreground: "#061b31",
        },
        destructive: {
          DEFAULT: "#ea2261",
          foreground: "#ffffff",
        },
        border: "#e5edf5",
        input: "#d4dce8",
        ring: "#533afd",
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
