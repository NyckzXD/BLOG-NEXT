"use client";

import { useEffect, useState } from "react";
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

function SkeletonCard() {
  return (
    <div className="repo-card animate-pulse">
      <div className="h-4 w-2/3 rounded bg-bg3" />
      <div className="h-3 w-full rounded bg-bg3" />
      <div className="h-3 w-4/5 rounded bg-bg3" />
      <div className="mt-1 flex gap-3">
        <div className="h-3 w-10 rounded bg-bg3" />
        <div className="h-3 w-10 rounded bg-bg3" />
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.github.com/users/NyckzXD/repos?sort=updated&per_page=6")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<Repo[]>;
      })
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <section id="projetos" className="border-y border-border bg-bg2 px-[5%] py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="// 02. Projetos"
          title="Projetos no GitHub"
          description="Repositórios públicos mais recentes, atualizados automaticamente."
        />

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {error && (
            <p className="col-span-full py-10 text-center text-muted">
              Erro ao carregar repositórios.
            </p>
          )}

          {repos.map((repo, i) => (
            <Reveal key={repo.id} delay={(i % 3) * 0.08}>
              <div className="repo-card h-full">
                <div className="flex items-center gap-2 text-[0.95rem] font-semibold text-accent2">
                  <BookOpen size={15} className="text-muted" />
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline"
                  >
                    {repo.name}
                  </a>
                  <ArrowUpRight size={13} className="ml-auto flex-none text-muted" />
                </div>
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
              </div>
            </Reveal>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://github.com/NyckzXD"
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
