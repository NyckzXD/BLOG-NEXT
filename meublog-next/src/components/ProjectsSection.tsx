import { ArrowRight } from "lucide-react";
import { OriginButton } from "@/components/ui/origin-button";
import { ProjectCard } from "@/components/ui/project-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

const GITHUB_USER = "NyckzXD";
const PROFILE_URL = `https://github.com/${GITHUB_USER}`;

/**
 * Busca no servidor, com cache de uma hora.
 *
 * Antes isso rodava no cliente, dentro de um useEffect: cada visita gastava
 * uma das 60 requisições/hora que a API pública do GitHub concede por IP — e
 * quem estivesse atrás de um IP compartilhado via a seção falhar. Agora é uma
 * requisição por hora para o site inteiro e o HTML já sai com os
 * repositórios dentro, o que também acaba com a mudança de altura da página
 * depois do carregamento.
 *
 * O User-Agent não é opcional: fora do navegador a API do GitHub responde 403
 * sem ele.
 */
async function getRepos(): Promise<Repo[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": `${GITHUB_USER}-portfolio`,
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    return (await res.json()) as Repo[];
  } catch {
    return null;
  }
}

/** Erro e lista vazia dividem a mesma caixa; só muda o texto. */
function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <Reveal className="mb-8">
      <p className="rounded-xl border border-border bg-bg p-10 text-center text-muted">
        {children}
      </p>
    </Reveal>
  );
}

export default async function ProjectsSection() {
  const repos = await getRepos();

  return (
    <section
      id="projetos"
      aria-labelledby="projetos-titulo"
      className="border-y border-border bg-bg2 py-24"
    >
      <div className="container">
        <SectionHeading
          eyebrow="// 02. Projetos"
          title="Projetos no GitHub"
          titleId="projetos-titulo"
          description="Repositórios públicos mais recentes, atualizados automaticamente."
        />

        {repos === null ? (
          <Aviso>
            Não foi possível carregar os repositórios agora. Eles continuam
            acessíveis{" "}
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-accent2 underline underline-offset-4"
            >
              direto no GitHub
            </a>
            .
          </Aviso>
        ) : repos.length === 0 ? (
          <Aviso>Ainda não há repositórios públicos para mostrar aqui.</Aviso>
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, i) => (
              <Reveal key={repo.id} delay={(i % 3) * 0.08} className="h-full">
                <ProjectCard
                  name={repo.name}
                  description={repo.description}
                  url={repo.html_url}
                  stars={repo.stargazers_count}
                  forks={repo.forks_count}
                  language={repo.language}
                />
              </Reveal>
            ))}
          </div>
        )}

        {/* Era o único `.btn-ghost` do projeto, de outra família visual que o
            "Ver projetos" e o "Entrar em contato" logo acima e abaixo. */}
        <div className="text-center">
          <OriginButton variant="dark" href={PROFILE_URL} target="_blank" rel="noreferrer">
            Ver todos no GitHub <ArrowRight size={16} />
          </OriginButton>
        </div>
      </div>
    </section>
  );
}
