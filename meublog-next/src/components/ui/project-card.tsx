"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowRight, ArrowUpRight, BookOpen, GitFork, Star } from "lucide-react";

export interface ProjectCardProps {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
}

/** Inclinação máxima, em graus, nas duas direções. */
const MAX_TILT = 9;

/**
 * Card de repositório com inclinação 3D acompanhando o ponteiro.
 *
 * O ponteiro alimenta dois motion values normalizados (-0.5 a 0.5) que viram
 * `rotateX`/`rotateY`; a mola é que faz o card voltar ao plano sozinho quando
 * o mouse sai, sem transição de CSS no meio.
 *
 * A perspectiva vive no wrapper de fora, não no card: `perspective` só age
 * sobre os filhos diretos do elemento que a declara, então declarar no próprio
 * card não inclinaria nada. É também por isso que o wrapper fica aqui dentro e
 * não no grid — o `Reveal` que envolve cada card escreve `transform` próprio e
 * criaria um contexto 3D no meio do caminho.
 */
export function ProjectCard({
  name,
  description,
  url,
  stars,
  forks,
  language,
}: ProjectCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 220, damping: 20 });
  const springY = useSpring(y, { stiffness: 220, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]);
  const transform = useMotionTemplate`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="h-full" style={{ perspective: "1200px" }}>
      <motion.article
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={
          shouldReduceMotion
            ? undefined
            : { transform, transformStyle: "preserve-3d" }
        }
        className="repo-card group relative h-full"
      >
        {/*
          Translado em Z só no ícone. O título carrega o stretched link, e o
          `::after` dele herdaria o translado junto — a área clicável sairia
          do tamanho do card. O ícone não tem nada clicável dentro, então é
          onde a profundidade sai de graça.
        */}
        <div
          className="flex items-center gap-3"
          style={shouldReduceMotion ? undefined : { transform: "translateZ(38px)" }}
        >
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl border border-border bg-bg3 text-accent2 shadow-sm transition-all duration-500 group-hover:border-accent2/40 group-hover:bg-accent2 group-hover:text-bg group-hover:shadow-card">
            <BookOpen size={20} strokeWidth={1.6} />
          </div>
          <ArrowUpRight
            size={16}
            className="ml-auto flex-none text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent2"
          />
        </div>

        {/*
          h3 porque o h2 da seção vem do SectionHeading: assim a lista de
          projetos fica navegável por headings no leitor de tela.

          Stretched link: o ::after cobre o card inteiro, então clicar em
          qualquer ponto abre o repositório. O `truncate` fica no <span> de
          dentro de propósito: `truncate` traz `overflow: hidden`, que
          recortaria o ::after no tamanho do próprio texto e anularia a área
          estendida.
        */}
        <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="block min-w-0 after:absolute after:inset-0"
          >
            <span className="block truncate">{name}</span>
          </a>
        </h3>

        <p className="mt-2 line-clamp-3 text-sm text-muted">
          {description || "Sem descrição"}
        </p>

        <div className="mt-5 flex gap-4 font-mono text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Star size={13} /> {stars}
          </span>
          <span className="flex items-center gap-1.5">
            <GitFork size={13} /> {forks}
          </span>
          {language && (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {language}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center pt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent2">
          <span className="relative">
            Ver repositório
            {/* `origin-left` + scale-x: o sublinhado cresce da esquerda em vez
                de aparecer inteiro. */}
            <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent2 transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none" />
          </span>
          <ArrowRight
            size={14}
            className="ml-2 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </div>
      </motion.article>
    </div>
  );
}
