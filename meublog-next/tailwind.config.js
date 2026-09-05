/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        bg: "#000000",
        bg2: "#141414",
        bg3: "#212121",
        border: "rgba(255,255,255,0.12)",
        accent: "#d4d4d8",
        accent2: "#f4f4f5",
        muted: "#a1a1aa",
        "text-main": "#f5f5f5",
        green: "#4ade80",
        red: "#f87171",
        yellow: "#fbbf24",
      },
      borderRadius: {
        DEFAULT: "12px",
        xl2: "20px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.5)",
        glow: "0 0 40px rgba(212,212,216,0.18)",
        "glow-lg": "0 0 80px rgba(212,212,216,0.14)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        blink: {
          "50%": { opacity: 0 },
        },
        pulse2: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease both",
        blink: "blink 0.9s step-end infinite",
        pulse2: "pulse2 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
