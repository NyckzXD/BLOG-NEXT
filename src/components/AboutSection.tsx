import { Code2, LayoutGrid, Cpu, GitBranch, Database } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const SKILLS = [
  { icon: Code2, label: "Python" },
  { icon: LayoutGrid, label: "HTML/CSS" },
  { icon: Cpu, label: "C++" },
  { icon: GitBranch, label: "Git" },
  { icon: Database, label: "SQL" },
];

const PARAGRAPHS = [
  <>Sou um desenvolvedor em formação, atualmente cursando <strong>Sistemas de Informação</strong> na Anhanguera.</>,
  <>Minha jornada começou pela curiosidade em entender como as coisas funcionam por dentro. Hoje, combino aprendizado acadêmico com experiência prática para construir soluções reais.</>,
  <>Meu objetivo é me tornar um desenvolvedor completo — dominando back-end, front-end, banco de dados e, futuramente, segurança da informação.</>,
];

export default function AboutSection() {
  return (
    <section id="sobre" className="px-[5%] py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="// 01. Sobre"
          title="Sobre mim"
          description="Um pouco da minha trajetória e do que me move como desenvolvedor."
        />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <Reveal delay={0.1}>
            <div className="flex flex-col gap-4">
              {PARAGRAPHS.map((text, i) => (
                <p key={i} className="text-[#cfcbef]">{text}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                Tecnologias
              </p>
              <div className="flex flex-wrap content-start gap-2.5">
                {SKILLS.map((skill) => (
                  <div key={skill.label} className="skill-tag">
                    <skill.icon size={15} className="text-accent" />
                    {skill.label}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
