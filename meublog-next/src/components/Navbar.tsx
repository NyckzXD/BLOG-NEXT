"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { OriginButton } from "@/components/ui/origin-button";

const NAV_LINKS = [
  { href: "#sobre", label: "sobre" },
  { href: "#projetos", label: "projetos" },
  { href: "#carreira", label: "carreira" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Com o Lenis o evento de scroll chega a cada frame. Sem essa guarda era
    // um setState por frame durante toda a animação das âncoras.
    let current: boolean | null = null;

    function onScroll() {
      const next = window.scrollY > 8;
      if (next === current) return;
      current = next;
      setScrolled(next);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-[100] h-16 border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-bg/85 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      {/* A barra sangra de ponta a ponta (borda e fundo), mas o conteúdo dela
          segue o mesmo container das seções — senão o logo não alinha com o
          título da seção logo abaixo. */}
      <div className="container flex h-full items-center justify-between">
        <a href="#" className="font-mono text-[1.05rem] font-medium tracking-tight text-white">
          nycolas<span className="text-accent">.</span>dev
        </a>

        <div className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex h-11 items-center rounded-md px-3.5 font-mono text-[0.82rem] text-muted transition-colors duration-200 hover:bg-bg3 hover:text-text-main"
            >
              {link.label}
            </a>
          ))}

          <OriginButton
            variant="dark"
            href="mailto:nycolas.tec@gmail.com"
            className="ml-2 h-11 gap-1.5 rounded-lg px-4 text-sm"
          >
            <Mail size={14} />
            contato
          </OriginButton>
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 items-center justify-center text-text-main sm:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            // px-5 = o mesmo 1.25rem do gutter do container. Abaixo de 640px
            // o container não tem teto, então os dois coincidem exatamente.
            className="absolute inset-x-0 top-16 flex flex-col gap-1 border-b border-border bg-bg2 px-5 py-4 shadow-card sm:hidden"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-3 font-mono text-sm text-muted hover:bg-bg3 hover:text-text-main"
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:nycolas.tec@gmail.com"
              onClick={() => setMenuOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-md px-2 py-3 font-mono text-sm text-accent2"
            >
              <Mail size={14} />
              contato
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
