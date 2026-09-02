"use client";

import { useEffect, useRef } from "react";
import { Github, Instagram } from "lucide-react";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { FlowButton } from "@/components/ui/flow-button";

const CODE_LINES = [
  {
    raw: 'const dev = {',
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
    raw: '  café: true,',
    html: '  <span class="c-prop">café</span>: <span class="c-bool">true</span>,',
  },
  { raw: '};', html: '};' },
];

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const SOCIALS = [
  { href: "https://github.com/NyckzXD", icon: Github, label: "GitHub" },
  { href: "https://www.instagram.com/nycolasfe_/", icon: Instagram, label: "Instagram" },
];

export default function HeroSection() {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = codeRef.current;
    if (!el) return;

    let lineIdx = 0;
    let charIdx = 0;
    const done: string[] = [];
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    function render() {
      if (!el) return;
      const partial = escHtml(CODE_LINES[lineIdx].raw.slice(0, charIdx));
      el.innerHTML = [...done, partial + '<span class="code-cursor"></span>'].join('\n');
    }

    function tick() {
      if (cancelled) return;
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
          if (el) el.innerHTML = done.join('\n') + '<span class="code-cursor"></span>';
          timer = setTimeout(() => {
            if (cancelled) return;
            lineIdx = 0; charIdx = 0; done.length = 0;
            tick();
          }, 5000);
        }
      }
    }

    tick();
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  return (
    <FloatingPathsBackground
      position={-1}
      className="min-h-screen bg-[linear-gradient(rgba(200,190,250,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(200,190,250,0.05)_1px,transparent_1px)] bg-[length:44px_44px]"
    >
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-14 px-[5%] pb-20 pt-32 lg:flex-row">
        {/* Left: content */}
        <div className="min-w-0 flex-1">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-green/20 bg-green/10 px-3.5 py-1.5 text-[0.82rem] tracking-wide text-green">
            <span className="inline-block h-[7px] w-[7px] animate-pulse2 rounded-full bg-green" />
            Aberto a oportunidades
          </p>

          <h1 className="mb-4 text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold leading-[1.12] tracking-tight text-white">
            Oi, eu sou
            <br />
            <span className="accent-text">Nycolas Fernandes</span>
          </h1>

          <p className="mb-5 font-mono text-[0.88rem] text-muted">
            Desenvolvedor Júnior <span className="mx-1 opacity-40">·</span> Estudante de SI{" "}
            <span className="mx-1 opacity-40">·</span> 20 anos
          </p>

          <p className="mb-9 max-w-[480px] text-[1.05rem] text-[#cfcbef]">
            Apaixonado por resolver problemas com código. Atualmente estudando na{" "}
            <strong>Faculdade Anhanguera</strong>.
          </p>

          <div className="mb-10 flex flex-wrap gap-3">
            <FlowButton href="#projetos" text="Ver projetos" />
            <FlowButton href="mailto:nycolas.tec@gmail.com" text="Falar comigo" />
          </div>

          <div className="flex gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-border bg-bg3 text-muted transition-all duration-200 hover:border-accent2/40 hover:bg-accent/10 hover:text-accent2"
              >
                <s.icon size={17} />
              </a>
            ))}
          </div>
        </div>

        {/* Right: code window */}
        <div className="w-full max-w-[380px] flex-none lg:w-[380px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-bg2 shadow-card shadow-glow-lg">
            <div className="flex items-center gap-[7px] border-b border-border bg-bg3 px-4 py-3">
              <span className="inline-block h-3 w-3 rounded-full bg-red" />
              <span className="inline-block h-3 w-3 rounded-full bg-yellow" />
              <span className="inline-block h-3 w-3 rounded-full bg-green" />
              <span className="ml-2 font-mono text-[0.78rem] text-muted">nycolas.js</span>
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
