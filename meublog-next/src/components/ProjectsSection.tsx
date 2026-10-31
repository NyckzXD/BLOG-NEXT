import { BookOpen, Star, GitFork, ArrowRight, ArrowUpRight } from "lucide-react";
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
      className="border-y border-border bg-bg2 px-[5%] py-24"
    >
      <div className="mx-auto max-w-5xl">
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
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, i) => (
              <Reveal key={repo.id} delay={(i % 3) * 0.08}>
                <article className="repo-card relative h-full">
                  {/*
                    h3 porque o h2 da seção vem do SectionHeading: assim a
                    lista de projetos fica navegável por headings no leitor de
                    tela, que era a única forma de pular de repositório em
                    repositório sem passar por todo o conteúdo de cada card.
                    O Tailwind já zera tamanho e peso dos headings no
                    preflight, então o visual não muda.
                  */}
                  <h3 className="flex items-center gap-2 text-[0.95rem] font-semibold text-accent2">
                    <BookOpen size={15} className="text-muted" />
                    {/*
                      Stretched link: o ::after cobre o card inteiro, então
                      clicar em qualquer ponto abre o repositório — antes só o
                      texto do título era clicável, embora o card inteiro se
                      levantasse no hover.

                      O `truncate` saiu do <a> e foi para o <span> de dentro
                      de propósito: `truncate` traz `overflow: hidden`, que
                      recortaria o ::after no tamanho do próprio texto e
                      anularia a área estendida.
                    */}
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 after:absolute after:inset-0 hover:underline"
                    >
                      <span className="block truncate">{repo.name}</span>
                    </a>
                    <ArrowUpRight size={13} className="ml-auto flex-none text-muted" />
                  </h3>
                  <p className="flex-1 text-[0.85rem] leading-relaxed text-muted">
                    {repo.description || "Sem descrição"}
                  </p>
                  <div className="flex gap-4 font-mono text-[0.8rem] text-muted">
                    <span className="flex items-center gap-1.5">
                      <Star size={13} /> {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GitFork size={13} /> {repo.forks_count}
                    </span>
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {repo.language}
                      </span>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <div className="text-center">
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            Ver todos no GitHub <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
