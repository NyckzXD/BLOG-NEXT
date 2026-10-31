"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { OriginButton } from "@/components/ui/origin-button";
import { navOffset } from "@/components/ui/smooth-scroll";

const NAV_LINKS = [
  { href: "#sobre", label: "sobre" },
  { href: "#projetos", label: "projetos" },
  { href: "#carreira", label: "carreira" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    // Com o Lenis o evento de scroll chega a cada frame. Sem essas guardas era
    // um setState por frame durante toda a animação das âncoras.
    let lastScrolled: boolean | null = null;
    let lastActive: string | null | undefined;

    /**
     * Topo de cada seção, medido uma vez e remedido no resize.
     * Ler `getBoundingClientRect` das três a cada frame funcionaria, mas
     * força o cálculo de layout justamente durante o scroll — que é onde
     * este projeto já teve briga por thread principal (ver HeroSection).
     */
    let tops: { href: string; top: number }[] = [];

    function measure() {
      tops = NAV_LINKS.map((link) => {
        const el = document.getElementById(link.href.slice(1));
        return {
          href: link.href,
          top: el
            ? el.getBoundingClientRect().top + window.scrollY
            : Number.POSITIVE_INFINITY,
        };
      });
    }

    function onScroll() {
      const nextScrolled = window.scrollY > 8;
      if (nextScrolled !== lastScrolled) {
        lastScrolled = nextScrolled;
        setScrolled(nextScrolled);
      }

      /**
       * Vale a última seção cujo topo já passou pela linha da navbar — não
       * a que está visível. A diferença importa por causa da cena de
       * parallax, que fica entre "sobre" e "projetos" e ocupa a tela
       * inteira sem ser seção nenhuma: com a regra do "visível" nenhum link
       * ficaria aceso durante a travessia dela, e o estado piscaria. Assim,
       * "sobre" continua aceso até "projetos" de fato começar.
       */
      const linha = window.scrollY + navOffset() + 1;
      let next: string | null = null;
      for (const secao of tops) {
        if (secao.top <= linha) next = secao.href;
      }
      if (next !== lastActive) {
        lastActive = next;
        setActive(next);
      }
    }

    function remeasure() {
      measure();
      onScroll();
    }

    remeasure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });

    /**
     * Medir só na montagem não basta, e isso apareceu na verificação: logo
     * depois de um clique em "carreira" a navbar ainda acendia "sobre",
     * porque as posições do cache eram as de antes da página assentar. A
     * altura do documento ainda muda depois da montagem — troca da fonte de
     * fallback pela real, barra de endereço no mobile. O observer refaz a
     * medição quando ela muda; a guarda de altura evita reagir a mudanças de
     * caixa que não movem seção nenhuma, como o parallax animando.
     */
    let lastHeight = document.body.scrollHeight;
    const observer = new ResizeObserver(() => {
      if (document.body.scrollHeight === lastHeight) return;
      lastHeight = document.body.scrollHeight;
      remeasure();
    });
    observer.observe(document.body);

    document.fonts?.ready.then(remeasure).catch(() => undefined);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      observer.disconnect();
    };
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
        <a href="#" className="font-mono text-lg font-medium tracking-tight text-white">
          nycolas<span className="text-accent">.</span>dev
        </a>

        <div className="hidden items-center gap-1 sm:flex">
          {/* O estado ativo é cor + uma barra embaixo, não só cor: `color-not-only`.
              A barra existe sempre e só troca de opacidade, para não mudar a
              altura do link quando a seção muda. */}
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={active === link.href ? "location" : undefined}
              className={cn(
                "relative inline-flex h-11 items-center rounded-md px-3.5 font-mono text-sm transition-colors duration-200 hover:bg-bg3 hover:text-text-main",
                "after:absolute after:inset-x-3.5 after:bottom-1.5 after:h-px after:bg-accent after:transition-opacity after:duration-200",
                active === link.href
                  ? "text-text-main after:opacity-100"
                  : "text-muted after:opacity-0"
              )}
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
                aria-current={active === link.href ? "location" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-3 font-mono text-sm hover:bg-bg3 hover:text-text-main",
                  active === link.href ? "bg-bg3 text-text-main" : "text-muted"
                )}
              >
                {link.label}
                {/* No painel não cabe barra embaixo; o ponto faz o mesmo
                    papel de não deixar a cor sozinha. */}
                {active === link.href && (
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-accent"
                  />
                )}
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
