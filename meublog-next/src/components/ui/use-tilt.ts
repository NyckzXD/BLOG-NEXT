"use client";

import {
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import type { CSSProperties, MouseEvent } from "react";

/**
 * Inclinação 3D acompanhando o ponteiro, compartilhada pelos cards de projeto
 * e de carreira.
 *
 * O ponteiro alimenta dois motion values normalizados (-0.5 a 0.5) que viram
 * `rotateX`/`rotateY`; a mola é que faz o card voltar ao plano sozinho quando
 * o mouse sai, sem transição de CSS no meio — e é por isso que nenhum dos dois
 * cards pode ter `transform` vindo do CSS: o inline do motion sempre venceria,
 * e a regra sobraria valendo só no modo de menos movimento, onde justamente
 * não deveria haver movimento nenhum.
 *
 * `perspective` só age sobre os filhos diretos de quem a declara, então ela
 * mora no `wrapper` devolvido aqui, e não no próprio card.
 */
export function useTilt(maxTilt = 9, perspective = 1200) {
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 220, damping: 20 });
  const springY = useSpring(y, { stiffness: 220, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const transform = useMotionTemplate`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  function onMouseMove(event: MouseEvent<HTMLElement>) {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return {
    /** Vai no elemento de fora, que não se mexe: é ele que abre a perspectiva. */
    wrapperStyle: shouldReduceMotion ? undefined : ({ perspective: `${perspective}px` } as CSSProperties),
    /** Vai no card. `preserve-3d` para os filhos poderem usar `lift()`. */
    cardProps: shouldReduceMotion
      ? {}
      : {
          onMouseMove,
          onMouseLeave,
          style: { transform, transformStyle: "preserve-3d" as const },
        },
    /**
     * Profundidade para um filho do card. Só use em elementos sem nada
     * clicável dentro: o `::after` de um stretched link herdaria o translado
     * e a área clicável sairia do tamanho do card.
     */
    lift: (depth: number): CSSProperties | undefined =>
      shouldReduceMotion ? undefined : { transform: `translateZ(${depth}px)` },
  };
}
