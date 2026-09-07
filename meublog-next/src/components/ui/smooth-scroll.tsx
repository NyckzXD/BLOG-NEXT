"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenisInstance: Lenis | null = null;

/** Instância global do Lenis (null se o usuário pediu menos movimento). */
export function getLenis() {
  return lenisInstance;
}

/**
 * Scroll suave do site inteiro + sincronia com o ScrollTrigger do GSAP.
 * Montado uma única vez no layout raiz.
 */
export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Sem Lenis para quem prefere menos movimento: volta ao scroll nativo.
    if (reduceMotion) {
      document.documentElement.style.scrollBehavior = "smooth";
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenisInstance = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Âncoras (#sobre, #projetos, ...) precisam passar pelo Lenis,
    // senão o navegador dá um salto que briga com o scroll suave.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = href === "#" ? 0 : document.querySelector(href);
      if (href !== "#" && !target) return;

      e.preventDefault();
      lenis.scrollTo(target as HTMLElement | 0, { offset: -72, duration: 1.2 });
      if (href !== "#") history.replaceState(null, "", href);
    };
    document.addEventListener("click", onClick);

    // A lista de repositórios chega por fetch e muda a altura da página:
    // sem esse refresh o ScrollTrigger fica com as marcações antigas.
    let refreshTimer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    observer.observe(document.body);

    return () => {
      document.removeEventListener("click", onClick);
      observer.disconnect();
      clearTimeout(refreshTimer);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
