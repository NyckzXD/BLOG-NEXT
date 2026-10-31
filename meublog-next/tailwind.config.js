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
      // Escala tipográfica única, no lugar dos 11 tamanhos arbitrários que
      // existiam espalhados pelo JSX (0.78 / 0.8 / 0.82 / 0.83 / 0.85 / 0.88
      // / 0.95 / 1.05rem, 15px e dois clamp), nenhum derivado de escala.
      //
      // Os passos de 12 a 36px batem com os padrões do Tailwind; o que muda
      // aqui é a entrelinha. Os passos de corpo (sm, base, lg) carregam ~1.7,
      // que é o line-height do body e o que esses textos já herdavam quando o
      // tamanho vinha de `text-[...]` — os padrões do Tailwind os apertariam
      // para ~1.4, o que seria uma regressão de legibilidade disfarçada de
      // refatoração.
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.7" }],
        base: ["1rem", { lineHeight: "1.7" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.3" }],
        "3xl": ["1.875rem", { lineHeight: "1.2" }],
        "4xl": ["2.25rem", { lineHeight: "1.15" }],
        // Os dois títulos fluidos. Estavam como `text-[clamp(...)]` +
        // `leading-[...]` escritos à mão no JSX.
        // O teto caiu de 3.8rem para 3.5rem. Com o container do item 8 a
        // coluna de texto do hero passou a ter 548px, e "Nycolas Fernandes"
        // a 60,8px pede 553px — quebrava em três linhas, desfazendo a
        // composição de duas que o <br/> do HeroSection declara. A 56px pede
        // 508px e sobra folga.
        display: ["clamp(2.2rem, 5vw, 3.5rem)", { lineHeight: "1.12" }],
        "display-lg": ["clamp(2rem, 6vw, 4.2rem)", { lineHeight: "1.08" }],
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
        // O "corpo secundário": era `text-[#cacaca]` repetido no hero, no
        // sobre e na carreira. Fica entre o text-main (#f5f5f5) e o muted
        // (#a1a1aa) — 12,81:1 sobre o preto.
        "text-soft": "#cacaca",
        green: "#4ade80",
        red: "#f87171",
        yellow: "#fbbf24",
        // Paleta do bloco de código do hero. É uma paleta à parte de
        // propósito (realce de sintaxe não é cor de interface), mas vinha
        // como hex cru dentro do globals.css.
        syntax: {
          keyword: "#e4e4e7",
          var: "#93c5fd",
          prop: "#f472b6",
          str: "#86efac",
          bool: "#fcd34d",
        },
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
