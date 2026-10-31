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

/**
 * Quanto a tela muda por pixel de scroll dentro de uma cena presa, quando a
 * própria cena não diz. Ver sceneSegments.
 */
const DEFAULT_SCENE_WEIGHT = 0.2;

type Segment = { from: number; to: number; weight: number };

/**
 * Trechos de scroll em que a página rola mas a tela quase não muda.
 *
 * A cena do parallax (`[data-sticky-scene]`) tem 200svh de altura com o
 * conteúdo em `sticky`: durante uma viewport inteira de scroll o que se vê
 * fica preso no lugar, mexendo só o arrasto das camadas. Rolando na roda do
 * mouse isso é o efeito pretendido; numa âncora, que atravessa o trecho em
 * velocidade máxima, o movimento aparente despencava ~15x e voltava de
 * supetão — o "travamento" no meio da transição.
 *
 * O número no atributo é o peso: 0.2 quer dizer que 1px de scroll ali vale
 * 0.2px de movimento na tela.
 */
function sceneSegments(): Segment[] {
  const viewport = window.innerHeight;

  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-sticky-scene]")
  )
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const from = rect.top + window.scrollY;
      const weight = Number(el.dataset.stickyScene);
      return {
        from,
        // A cena só fica presa enquanto sobra altura dela abaixo da viewport.
        to: from + rect.height - viewport,
        weight: weight > 0 ? weight : DEFAULT_SCENE_WEIGHT,
      };
    })
    .filter((segment) => segment.to > segment.from)
    .sort((a, b) => a.from - b.from);
}

/**
 * Monta o easing do trajeto em cima do movimento aparente, não do scroll.
 *
 * O ease-in-out passa a reger quanto a *tela* muda; onde a cena está presa,
 * o scroll corre mais rápido para compensar. Assim a transição não para no
 * meio — e, como o custo total ignora o que não se vê, a duração também não
 * infla por causa dos 200svh da cena.
 */
function buildAnchorTravel(from: number, to: number) {
  const distance = to - from;
  const span = Math.abs(distance);
  const low = Math.min(from, to);
  const high = Math.max(from, to);

  // Trajeto fatiado em trechos de peso 1 (normal) e peso da cena.
  const segments: Segment[] = [];
  let cursor = low;
  for (const scene of sceneSegments()) {
    const start = Math.max(low, scene.from);
    const end = Math.min(high, scene.to);
    if (end <= start) continue;
    if (start > cursor) segments.push({ from: cursor, to: start, weight: 1 });
    segments.push({ from: start, to: end, weight: scene.weight });
    cursor = end;
  }
  if (cursor < high) segments.push({ from: cursor, to: high, weight: 1 });
  // Os trechos saem em ordem de posição; a viagem pode ser para cima.
  if (distance < 0) segments.reverse();

  const cost = segments.reduce(
    (total, segment) => total + (segment.to - segment.from) * segment.weight,
    0
  );

  if (span === 0 || cost === 0) {
    return { duration: anchorDuration(span), easing: anchorEasing };
  }

  return {
    duration: anchorDuration(cost),
    /** t (tempo) -> fração da distância já percorrida. */
    easing: (t: number) => {
      let remaining = anchorEasing(t) * cost;
      let travelled = 0;

      for (const segment of segments) {
        const length = segment.to - segment.from;
        const segmentCost = length * segment.weight;
        if (remaining >= segmentCost) {
          remaining -= segmentCost;
          travelled += length;
          continue;
        }
        travelled += remaining / segment.weight;
        remaining = 0;
        break;
      }

      return Math.min(1, travelled / span);
    },
  };
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

      // Âncoras marcadas com data-native-anchor ficam de fora (hoje, o skip
      // link). O preventDefault abaixo cancela a navegação de fragmento do
      // navegador, e é ela que move o foco do teclado para o alvo — sem isso
      // o skip link rolaria a página e deixaria o foco para trás, na
      // navegação, que é exatamente o que ele existe para evitar. Um salto
      // instantâneo também é o comportamento esperado de um atalho desses.
      if (anchor?.hasAttribute("data-native-anchor")) return;

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
      const { duration, easing } = buildAnchorTravel(lenis.scroll, destination);

      setAnchorScrolling(true);
      // Rede de segurança: se o usuário interromper com a roda do mouse o
      // onComplete não chega, e o sinal não pode ficar preso em true.
      anchorFallbackTimer = setTimeout(
        () => setAnchorScrolling(false),
        duration * 1000 + 400
      );

      lenis.scrollTo(destination, {
        duration,
        easing,
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
