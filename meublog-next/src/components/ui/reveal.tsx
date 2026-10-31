"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Revela o conteúdo quando ele entra na viewport (uma vez só).
 * Antes a animação disparava na montagem, o que fazia as seções de baixo
 * já chegarem animadas quando o usuário rolava até elas.
 *
 * Com menos movimento pedido, `initial={false}` desliga o estado inicial em
 * vez de animar até ele. Isso importa mais do que parece: o `opacity: 0` do
 * initial é escrito no HTML servido, então sem essa saída o conteúdo de todas
 * as seções nasce invisível e depende do JS para aparecer.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
