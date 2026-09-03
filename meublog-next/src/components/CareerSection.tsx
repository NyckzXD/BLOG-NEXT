import { Briefcase, Sparkles } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { OriginButton } from "@/components/ui/origin-button";

const CAREER_CARDS = [
  { title: "Assistente de T.I", dates: "Nov 2024 – Atual" },
  { title: "Estagiário em Desenvolvimento Web", dates: "Mar 2024 – Out 2024" },
];

const SKILLS_LIST = [
  <>Estudante de <strong>Sistemas de Informação</strong> — Faculdade Anhanguera</>,
  <>Experiência com <strong>Python, JavaScript, HTML/CSS, C++</strong> e Git</>,
  <>Interesse em algoritmos, lógica e desafios técnicos</>,
  <>Buscando crescimento contínuo com cursos e projetos práticos</>,
  <>Aberto a colaborações e networking na área de tecnologia</>,
];

export default function CareerSection() {
  return (
    <section id="carreira" className="px-[5%] py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="// 03. Carreira"
          title="Carreira profissional"
          description="Experiências e formação até aqui."
        />

        <div className="mb-10 flex flex-col gap-3">
          {CAREER_CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08}>
              <article className="career-card flex items-center gap-4">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Briefcase size={18} />
                </span>
                <div>
                  <div className="text-base font-semibold text-accent2">{card.title}</div>
                  <div className="font-mono text-[0.83rem] text-muted">{card.dates}</div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <ul className="mb-10 flex flex-col gap-3">
            {SKILLS_LIST.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[0.95rem] text-[#cacaca]">
                <Sparkles size={15} className="mt-1 flex-none text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="text-center">
            <OriginButton variant="light" href="mailto:nycolas.tec@gmail.com">
              Entrar em contato
            </OriginButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
