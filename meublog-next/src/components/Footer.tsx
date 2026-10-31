import { Heart, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 text-sm text-muted">
      {/* A borda do topo sangra; o conteúdo segue o container das seções. */}
      <div className="container flex flex-col flex-wrap items-center justify-between gap-3 sm:flex-row">
        <p className="flex items-center gap-1.5 text-center">
          Feito com <Heart size={13} className="text-accent" /> por{" "}
          <strong>Nycolas Fernandes</strong> &copy; 2026
        </p>
        <div className="flex gap-3">
          <a
            href="https://github.com/NyckzXD"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-bg3 hover:text-accent2"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
