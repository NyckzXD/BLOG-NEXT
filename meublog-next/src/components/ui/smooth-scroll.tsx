"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenisInstance: Lenis | null = null;

/** Instância global do Lenis (null se o usuário pediu menos movimento). */
export function getLenis() {
  return lenisInstance;
}

/** Altura da navbar fixa: a seção precisa parar logo abaixo dela. */
const NAV_OFFSET = -72;

/**
 * Ease-in-out cúbico para o scroll das âncoras.
 *
 * O easing do Lenis (expo-out, abaixo) é certo para a roda do mouse — a
 * inércia tem que começar na velocidade do gesto e desacelerar. Para um
 * clique em âncora ele é péssimo: entrega ~97% da distância na primeira
 * metade do tempo, então o primeiro frame dá um salto grande (num trajeto de
 * 3000px, centenas de pixels de uma vez) e o resto chega rastejando a 1px por
 * frame. Os dois extremos é que se sentiam como travamento. O in-out arranca
 * do zero e chega no zero, sem salto nem arrasto.
 */
const anchorEasing = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Duração proporcional à distância, em vez de fixa.
 *
 * Com duração fixa o mesmo 1.2s tinha que cobrir um pulo curto e a travessia
 * inteira da página — o que deixa o trajeto longo numa velocidade média
 * absurda (~2600px/s) e o curto lento demais. ~2200px/s, com piso e teto.
 */
function anchorDuration(distance: number) {
  return Math.min(1.4, Math.max(0.65, Math.abs(distance) / 2200));
}

// Quem quiser pausar trabalho pesado enquanto a página viaja até a seção
// (ver HeroSection) observa este sinal.
let anchorScrolling = false;
const anchorListeners = new Set<(value: boolean) => void>();
let anchorFallbackTimer: ReturnType<typeof setTimeout> | undefined;

function setAnchorScrolling(value: boolean) {
  clearTimeout(anchorFallbackTimer);
  if (anchorScrolling === value) return;
  anchorScrolling = value;
  anchorListeners.forEach((listener) => listener(value));
}

/** true enquanto um clique em âncora está levando a página até a seção. */
export function useAnchorScrolling() {
  const [value, setValue] = useState(anchorScrolling);

  useEffect(() => {
    setValue(anchorScrolling);
    anchorListeners.add(setValue);
    return () => {
      anchorListeners.delete(setValue);
    };
  }, []);

  return value;
}

/**
 * Scroll suave do site inteiro + sincronia com o ScrollTrigger do GSAP.
 * Montado uma única vez no layout raiz.
 */
export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // No mobile, mostrar/esconder a barra de endereço muda a viewport e o
    // ScrollTrigger refazia as marcações no meio do scroll — o que aparece
    // como a cena de parallax "teleportando". Isso aqui ignora esse resize.
    ScrollTrigger.config({ ignoreMobileResize: true });

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

      const target = href === "#" ? null : document.querySelector(href);
      if (href !== "#" && !target) return;

      e.preventDefault();

      // Posição final em pixels, calculada aqui para dar a duração do
      // trajeto ao Lenis em vez de um valor fixo.
      const destination =
        target === null
          ? 0
          : (target as HTMLElement).getBoundingClientRect().top +
            window.scrollY +
            NAV_OFFSET;
      const duration = anchorDuration(destination - lenis.scroll);

      setAnchorScrolling(true);
      // Rede de segurança: se o usuário interromper com a roda do mouse o
      // onComplete não chega, e o sinal não pode ficar preso em true.
      anchorFallbackTimer = setTimeout(
        () => setAnchorScrolling(false),
        duration * 1000 + 400
      );

      lenis.scrollTo(destination, {
        duration,
        easing: anchorEasing,
        onComplete: () => setAnchorScrolling(false),
      });

      if (href !== "#") history.replaceState(null, "", href);
    };
    document.addEventListener("click", onClick);

    // A lista de repositórios chega por fetch e muda a altura da página:
    // sem esse refresh o ScrollTrigger fica com as marcações antigas.
    // Mas o observer dispara em qualquer mudança de caixa, inclusive largura
    // e conteúdo animado — e um refresh no meio do scroll faz as camadas do
    // parallax saltarem. Então só reage a mudança real de altura.
    let refreshTimer: ReturnType<typeof setTimeout>;
    let lastHeight = document.body.scrollHeight;
    const observer = new ResizeObserver(() => {
      if (document.body.scrollHeight === lastHeight) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        lastHeight = document.body.scrollHeight;
        ScrollTrigger.refresh();
      }, 250);
    });
    observer.observe(document.body);

    return () => {
      document.removeEventListener("click", onClick);
      observer.disconnect();
      clearTimeout(refreshTimer);
      setAnchorScrolling(false);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
