"use client";

import { useEffect, useRef, useState } from "react";
import { Github, Instagram, ArrowRight, Mail } from "lucide-react";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { OriginButton } from "@/components/ui/origin-button";
import { useAnchorScrolling } from "@/components/ui/smooth-scroll";

const CODE_LINES = [
  {
    raw: "const dev = {",
    html: '<span class="c-keyword">const</span> <span class="c-var">dev</span> = {',
  },
  {
    raw: '  nome: "Nycolas Fernandes",',
    html: '  <span class="c-prop">nome</span>: <span class="c-str">"Nycolas Fernandes"</span>,',
  },
  {
    raw: '  stack: ["Python", "JS", "SQL"],',
    html: '  <span class="c-prop">stack</span>: [<span class="c-str">"Python"</span>, <span class="c-str">"JS"</span>, <span class="c-str">"SQL"</span>],',
  },
  {
    raw: '  foco: "Full-Stack",',
    html: '  <span class="c-prop">foco</span>: <span class="c-str">"Full-Stack"</span>,',
  },
  {
    raw: '  estudando: "Sistemas de Info",',
    html: '  <span class="c-prop">estudando</span>: <span class="c-str">"Sistemas de Info"</span>,',
  },
  {
    raw: "  café: true,",
    html: '  <span class="c-prop">café</span>: <span class="c-bool">true</span>,',
  },
  { raw: "};", html: "};" },
];

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Linha vazia de reserva. O nbsp garante altura de linha de verdade — sem ele
 * o navegador descarta a quebra final e a caixa encolhe.
 */
const FILLER = " ";

const SOCIALS = [
  { href: "https://github.com/NyckzXD", icon: Github, label: "GitHub" },
  {
    href: "https://www.instagram.com/nycolasfe_/",
    icon: Instagram,
    label: "Instagram",
  },
];

export default function HeroSection() {
  const codeRef = useRef<HTMLElement>(null);
  const anchorScrolling = useAnchorScrolling();
  const [onScreen, setOnScreen] = useState(true);
  const pausedRef = useRef(false);

  /**
   * A digitação reescreve o innerHTML da caixa de código a cada ~40ms, e cada
   * reescrita obriga o navegador a recalcular estilo e layout daquele bloco.
   * Durante o scroll das âncoras isso disputa a thread principal com o
   * parallax e aparece como engasgo. Parar a digitação nessa 1s e pouco é
   * invisível (ela continua exatamente de onde parou), e fora da tela o
   * trabalho não serve para nada.
   */
  useEffect(() => {
    pausedRef.current = anchorScrolling || !onScreen;
  }, [anchorScrolling, onScreen]);

  useEffect(() => {
    const el = codeRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = codeRef.current;
    if (!el) return;

    /**
     * Quem pediu menos movimento recebe o bloco pronto, sem digitação e sem
     * cursor piscando. Era a única animação do site que ficava rodando para
     * sempre — reescrevendo o innerHTML a cada ~40ms e recomeçando a cada 5s
     * — e a que mais pesava na thread principal.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.innerHTML = CODE_LINES.map((line) => line.html).join("\n");
      return;
    }

    let lineIdx = 0;
    let charIdx = 0;
    const done: string[] = [];
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    /**
     * Pinta sempre CODE_LINES.length linhas, completando com linhas vazias.
     * A caixa de código precisa ter altura constante: no mobile o hero empilha
     * e cada linha nova mudava a altura da página inteira, o que disparava o
     * ResizeObserver do SmoothScroll, refazia o ScrollTrigger e fazia a cena
     * de parallax saltar a cada ~1s.
     */
    function paint(lines: string[]) {
      if (!el) return;
      const missing = Math.max(0, CODE_LINES.length - lines.length);
      el.innerHTML = [...lines, ...Array(missing).fill(FILLER)].join("\n");
    }

    function render() {
      const partial = escHtml(CODE_LINES[lineIdx].raw.slice(0, charIdx));
      paint([...done, partial + '<span class="code-cursor"></span>']);
    }

    function tick() {
      if (cancelled) return;
      if (pausedRef.current) {
        timer = setTimeout(tick, 200);
        return;
      }
      const line = CODE_LINES[lineIdx];
      if (charIdx < line.raw.length) {
        charIdx++;
        render();
        timer = setTimeout(tick, 38 + Math.random() * 22);
      } else {
        done.push(line.html);
        charIdx = 0;
        lineIdx++;
        if (lineIdx < CODE_LINES.length) {
          timer = setTimeout(tick, 160);
        } else {
          const full = [...done];
          full[full.length - 1] += '<span class="code-cursor"></span>';
          paint(full);
          timer = setTimeout(() => {
            if (cancelled) return;
            lineIdx = 0;
            charIdx = 0;
            done.length = 0;
            tick();
          }, 5000);
        }
      }
    }

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <FloatingPathsBackground position={-1} className="min-h-screen">
      {/* `container` no lugar de `mx-auto w-full max-w-6xl px-[5%]`.
          O `max-w-6xl` não deixava o hero mais largo: o `px-[5%]` ficava
          *dentro* dele, enquanto nas outras seções ficava fora do
          `max-w-5xl`. Resultado medido em 2560px: conteúdo do hero com
          896,8px contra 1024px das seções, e a margem esquerda 63,6px
          adiante. O degrau crescia com a viewport, porque o percentual
          crescia e os max-w não. */}
      <section className="container flex min-h-screen flex-col items-center justify-center gap-14 pb-20 pt-32 lg:flex-row">
        {/* Left: content */}
        <div className="min-w-0 flex-1">
          <h1 className="mb-4 text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold leading-[1.12] tracking-tight text-white">
            Oi, eu sou
            <br />
            <span className="accent-text">Nycolas Fernandes</span>
          </h1>

          <p className="mb-5 font-mono text-[0.88rem] text-muted">
            Desenvolvedor Júnior <span className="mx-1 opacity-40">·</span>{" "}
            Estudante de SI <span className="mx-1 opacity-40">·</span> 20 anos
          </p>

          <p className="mb-9 max-w-[480px] text-[1.05rem] text-[#cacaca]">
            Apaixonado por resolver problemas com código. Atualmente estudando
            na <strong>Faculdade Anhanguera</strong>.
          </p>

          <div className="mb-10 flex flex-wrap gap-3">
            <OriginButton variant="light" href="#projetos">
              Ver projetos <ArrowRight size={16} />
            </OriginButton>
            <OriginButton variant="dark" href="mailto:nycolas.tec@gmail.com">
              <Mail size={16} />
              Falar comigo
            </OriginButton>
          </div>

          <div className="flex gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-border bg-bg3 text-muted transition-all duration-200 hover:border-accent2/40 hover:bg-accent/10 hover:text-accent2"
              >
                <s.icon size={17} />
              </a>
            ))}
          </div>
        </div>

        {/* Right: code window */}
        <div className="w-full max-w-[380px] flex-none lg:w-[380px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-bg2 shadow-card">
            <div className="flex items-center gap-[7px] border-b border-border bg-bg3 px-4 py-3">
              <span className="inline-block h-3 w-3 rounded-full bg-red" />
              <span className="inline-block h-3 w-3 rounded-full bg-yellow" />
              <span className="inline-block h-3 w-3 rounded-full bg-green" />
              <span className="ml-2 font-mono text-[0.78rem] text-muted">
                nycolas.js
              </span>
            </div>

            <pre className="overflow-x-auto whitespace-pre px-6 py-5 font-mono text-[0.88rem] leading-[1.9]">
              <code ref={codeRef} />
            </pre>
          </div>
        </div>
      </section>
    </FloatingPathsBackground>
  );
}
