"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowButton } from "@/components/ui/flow-button";

const NAV_LINKS = [
  { href: "#sobre", label: "sobre" },
  { href: "#projetos", label: "projetos" },
  { href: "#carreira", label: "carreira" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-[100] flex h-16 items-center justify-between border-b px-[5%] transition-colors duration-300",
        scrolled
          ? "border-border bg-bg/85 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      <a href="#" className="font-mono text-[1.05rem] font-medium tracking-tight text-white">
        nycolas<span className="text-accent">.</span>dev
      </a>

      <div className="hidden items-center gap-1 sm:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-md px-3.5 py-1.5 font-mono text-[0.82rem] text-muted transition-colors duration-200 hover:bg-bg3 hover:text-text-main"
          >
            {link.label}
          </a>
        ))}

        <FlowButton
          href="mailto:nycolas.tec@gmail.com"
          text="contato"
          className="ml-2 px-5 py-2 text-xs"
        />
      </div>

      <button
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuOpen}
        className="flex h-11 w-11 items-center justify-center text-text-main sm:hidden"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-x-0 top-16 flex flex-col gap-1 border-b border-border bg-bg2 px-[5%] py-4 shadow-card sm:hidden"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2.5 font-mono text-sm text-muted hover:bg-bg3 hover:text-text-main"
              >
                {link.label}
              </a>
            ))}
            <FlowButton
              href="mailto:nycolas.tec@gmail.com"
              text="contato"
              onClick={() => setMenuOpen(false)}
              className="mt-1 w-fit px-5 py-2 text-xs"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
