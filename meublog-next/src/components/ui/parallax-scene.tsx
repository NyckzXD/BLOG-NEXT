"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

/**
 * Camada 1 = mais ao fundo, 4 = mais à frente. Quanto mais ao fundo, mais a
 * camada desce enquanto a página sobe — é isso que dá a profundidade.
 * yPercent é relativo à altura de cada camada, então os números não caem em
 * linha reta; o deslocamento real é que diminui: ~25vh, ~12vh, ~7vh, ~2vh.
 */
const LAYERS = [
  { layer: "1", yPercent: 40 }, // céu + serra distante (62vh)
  { layer: "2", yPercent: 28 }, // serra intermediária (44vh)
  { layer: "3", yPercent: 7 },  // título (100vh)
  { layer: "4", yPercent: 8 },  // serra da frente (26vh)
] as const;

/** Pontinhos do fundo — lista fixa para não quebrar a hidratação do SSR. */
const DOTS = [
  [6, 22], [13, 54], [19, 12], [24, 71], [31, 34], [37, 8], [42, 60],
  [48, 26], [53, 78], [59, 16], [64, 47], [70, 68], [76, 20], [81, 56],
  [87, 32], [92, 74], [96, 40], [9, 84], [28, 90], [67, 88],
] as const;

export function ParallaxScene({ className }: { className?: string }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    const triggerElement = root?.querySelector("[data-parallax-layers]");
    if (!root || !triggerElement) return;

    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          // "bottom bottom" casa exatamente com o fim do sticky: o scrub
          // completa no mesmo instante em que a cena para de ficar presa.
          end: "bottom bottom",
          scrub: 0,
        },
      });

      LAYERS.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(
            `[data-parallax-layer="${layerObj.layer}"]`
          ),
          { yPercent: layerObj.yPercent, ease: "none" },
          idx === 0 ? undefined : "<"
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-label="Transição visual"
      /* sem animação (motion-reduce) a cena vira uma seção normal de 100vh */
      className={cn("relative h-[200vh] w-full motion-reduce:h-screen", className)}
    >
      {/* Janela fixa: o conteúdo trava enquanto as camadas deslizam */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-bg">
        <div data-parallax-layers className="absolute inset-0">
          {/* 1 — céu, brilho do horizonte e poeira estelar */}
          <div
            data-parallax-layer="1"
            className="absolute inset-x-0 bottom-0 h-[62vh] will-change-transform"
          >
            <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(70%_100%_at_50%_100%,rgba(244,244,245,0.16),rgba(244,244,245,0.04)_45%,transparent_70%)]" />
            {DOTS.map(([left, top]) => (
              <span
                key={`${left}-${top}`}
                style={{ left: `${left}%`, top: `${top}%` }}
                className="absolute h-px w-px rounded-full bg-accent2/50 shadow-[0_0_6px_1px_rgba(244,244,245,0.35)]"
              />
            ))}
            <Ridge
              d="M0 200 L0 96 L90 132 L180 70 L268 118 L360 44 L452 108 L548 62 L640 120 L742 58 L840 116 L940 74 L1046 126 L1142 84 L1244 130 L1348 92 L1440 134 L1440 200 Z"
              fill="#1c1c1c"
              stroke="rgba(255,255,255,0.14)"
            />
          </div>

          {/* 2 — serra intermediária */}
          <div
            data-parallax-layer="2"
            className="absolute inset-x-0 bottom-0 h-[44vh] will-change-transform"
          >
            <Ridge
              d="M0 200 L0 128 L120 150 L240 110 L370 148 L500 104 L640 152 L780 116 L920 158 L1060 122 L1200 160 L1330 130 L1440 156 L1440 200 Z"
              fill="#121212"
              stroke="rgba(255,255,255,0.10)"
            />
          </div>

          {/* 3 — título */}
          <div
            data-parallax-layer="3"
            className="absolute inset-0 flex flex-col items-center justify-center px-[5%] text-center will-change-transform"
          >
            <p className="eyebrow mb-4">// em construção</p>
            <h2 className="max-w-3xl text-[clamp(2rem,6vw,4.2rem)] font-extrabold leading-[1.08] tracking-tight text-white">
              Do primeiro <span className="accent-text">commit</span>
              <br />
              ao próximo projeto
            </h2>
            <p className="mt-5 max-w-md text-[15px] text-muted">
              Cada linha de código é um passo a mais na jornada.
            </p>
          </div>

          {/* 4 — serra da frente */}
          <div
            data-parallax-layer="4"
            className="absolute inset-x-0 bottom-0 h-[26vh] will-change-transform"
          >
            <Ridge
              d="M0 200 L0 158 L160 172 L320 150 L500 178 L680 152 L860 180 L1040 158 L1220 182 L1440 162 L1440 200 Z"
              fill="#000000"
              stroke="rgba(255,255,255,0.16)"
            />
          </div>
        </div>

        {/* Emenda com a próxima seção */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>
    </section>
  );
}

function Ridge({
  d,
  fill,
  stroke,
}: {
  d: string;
  fill: string;
  stroke: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      <path d={d} fill={fill} stroke={stroke} strokeWidth={1.5} />
    </svg>
  );
}
