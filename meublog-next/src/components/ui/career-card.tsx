"use client";

import { motion } from "motion/react";
import { Briefcase } from "lucide-react";

import { useTilt } from "@/components/ui/use-tilt";

export interface CareerCardProps {
  title: string;
  dates: string;
}

/**
 * Card de experiência com a mesma inclinação 3D do card de projeto.
 *
 * A inclinação é menor aqui (5° contra 9°) e a perspectiva, mais longa: este
 * card ocupa a largura inteira do container, e um ângulo que fica discreto num
 * card de 300px vira um tombo numa faixa de 1024px — a borda distante some do
 * plano enquanto a próxima ainda está reta.
 *
 * Cores, borda e raio continuam os do `.career-card`; o que entra é só o
 * movimento.
 */
export function CareerCard({ title, dates }: CareerCardProps) {
  const { wrapperStyle, cardProps, lift } = useTilt(5, 1600);

  return (
    <div style={wrapperStyle}>
      <motion.article {...cardProps} className="career-card group">
        {/* Nada clicável dentro do card, então o conteúdo inteiro pode subir
            em Z — diferente do card de projeto, onde o stretched link prende o
            texto ao plano. */}
        <div className="flex items-center gap-4" style={lift(30)}>
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent/20">
            <Briefcase size={18} />
          </span>
          <div>
            <h3 className="text-base font-semibold text-accent2">{title}</h3>
            <div className="font-mono text-sm text-muted">{dates}</div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
