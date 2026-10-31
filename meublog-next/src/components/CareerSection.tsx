import { Sparkles } from "lucide-react";
import { CareerCard } from "@/components/ui/career-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { OriginButton } from "@/components/ui/origin-button";

const CAREER_CARDS = [
  { title: "Assistente de T.I", dates: "Nov 2025 – Atual" },
  { title: "Assistente Administrativo", dates: "Mar 2024 – Out 2025" },
];

const SKILLS_LIST = [
  <>
    Estudante de <strong>Sistemas de Informação</strong> — Faculdade Anhanguera
  </>,
  <>
    Experiência com <strong>Python, JavaScript, HTML/CSS, C++</strong> e Git
  </>,
  <>Interesse em algoritmos, lógica e desafios técnicos</>,
  <>Buscando crescimento contínuo com cursos e projetos práticos</>,
  <>Aberto a colaborações e networking na área de tecnologia</>,
];

export default function CareerSection() {
  return (
    <section
      id="carreira"
      aria-labelledby="carreira-titulo"
      className="py-24"
    >
      <div className="container">
        <SectionHeading
          eyebrow="// 03. Carreira"
          title="Carreira profissional"
          titleId="carreira-titulo"
          description="Experiências e formação até aqui."
        />

        <div className="mb-10 flex flex-col gap-3">
          {CAREER_CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08}>
              <CareerCard title={card.title} dates={card.dates} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <ul className="mb-10 flex flex-col gap-3">
            {SKILLS_LIST.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-base text-text-soft"
              >
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
