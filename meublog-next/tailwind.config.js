/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Uma única definição de "largura do conteúdo" para o site inteiro.
    // Antes isto estava configurado e nunca usado: cada seção repetia
    // `px-[5%]` + `mx-auto max-w-5xl` por conta própria, e o hero usava
    // `max-w-6xl`, o que desalinhava a margem dele com a das outras seções.
    //
    // O teto é 1024px (o `max-w-5xl` que três das quatro seções já usavam) em
    // vez dos 1200px que estavam aqui, para que a troca alinhe o hero com as
    // demais em vez de alargar a página toda. O gutter de 1.25rem fica perto
    // dos ~18,75px que o `px-[5%]` dava em 375px, mas é um valor fixo da
    // grade de 4px — percentual crescia sem limite junto com a viewport.
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        lg: "1024px",
      },
    },
    extend: {
      fontFamily: {
        // As variáveis vêm do next/font, declaradas no <html> em layout.tsx.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
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
