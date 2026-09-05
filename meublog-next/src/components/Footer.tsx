import { Heart, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="flex flex-col flex-wrap items-center justify-between gap-3 border-t border-border px-[5%] py-8 text-[0.85rem] text-muted sm:flex-row">
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
          className="text-muted transition-colors duration-200 hover:text-accent2"
        >
          <Github size={18} />
        </a>
      </div>
    </footer>
  );
}
