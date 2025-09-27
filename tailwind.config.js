import { config as loadEnv } from "dotenv";
import type { Config } from "tailwindcss";

loadEnv();

/** @type {import('tailwindcss').Config} */

const config = {
  darkMode: ["selector", "class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: "true",
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        first: {
          DEFAULT: `#${process.env.COLOR_FIRST_DEFAULT || "firstDefaultColor"}`,
          80: process.env.COLOR_FIRST_80 || "#defaultColor80",
          50: process.env.COLOR_FIRST_50 || "#defaultColor50",
          30: process.env.COLOR_FIRST_30 || "#defaultColor30",
        },
        second: {
          DEFAULT: `#${
            process.env.COLOR_SECOND_DEFAULT || "secondDefaultColor"
          }`,
          80: process.env.COLOR_SECOND_80 || "#defaultColor80",
          50: process.env.COLOR_SECOND_50 || "#defaultColor50",
          30: process.env.COLOR_SECOND_30 || "#defaultColor30",
        },
        third: {
          DEFAULT: `#${process.env.COLOR_THIRD_DEFAULT || "thirdDefaultColor"}`,
          80: process.env.COLOR_THIRD_80 || "#defaultColor80",
          50: process.env.COLOR_THIRD_50 || "#defaultColor50",
          30: process.env.COLOR_THIRD_30 || "#defaultColor30",
        },
        fourth: {
          DEFAULT: `#${
            process.env.COLOR_FOURTH_DEFAULT || "fourthDefaultColor"
          }`,
          80: process.env.COLOR_FOURTH_80 || "#defaultColor80",
          50: process.env.COLOR_FOURTH_50 || "#defaultColor50",
          30: process.env.COLOR_FOURTH_30 || "#defaultColor30",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}satisfies Config;

export default config;
