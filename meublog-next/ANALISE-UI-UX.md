# Análise UI/UX — nycolas.dev

Auditoria do portfólio em `meublog-next/` usando o plugin **ui-ux-pro-max v2.6.2**
(`cli/assets/scripts/search.py`), seguindo a ordem de prioridade do skill
(1 Acessibilidade → 10 Dados). Cada achado cita a regra do plugin que ele viola.

## Perfil retornado pelo plugin

```
python scripts/search.py "developer portfolio personal site dark minimal" --design-system
```

| Dimensão | Recomendação do plugin | O que o projeto faz |
|---|---|---|
| Pattern | **Portfolio Grid** — Hero → Grid de projetos → Sobre → Contato | Hero → Sobre → Parallax → Projetos → Carreira (sem seção de contato) |
| Estilo | **Motion-Driven** (parallax, scroll anim, microinterações) | ✅ Bate exatamente — Lenis + GSAP + Motion |
| Perf/A11y do estilo | ⚠ `Good` / ⚠ exige `prefers-reduced-motion` | Parcial — ver §1.2 |
| CTA | Hover do card de projeto + contato no footer | Card não é clicável; footer não tem CTA |
| Cor | Fundo neutro, acento mínimo | ✅ Monocromático neutro |

O estilo escolhido está **certo** para o tipo de produto. Os problemas são de
execução, não de direção.

## Status

**Os 12 itens da tabela de prioridade foram aplicados**, em 31/10/2026, e
verificados no navegador (`npx next build` passa; as medições estão em cada
seção). O item 4 resolveu junto o 11 (§7.1 e §7.2), que dependia do mesmo
componente.

Seguem em aberto os achados que **não** viraram item de tabela — estão
marcados seção por seção abaixo. Os principais: o typewriter do hero continua
rodando em loop para quem não pediu menos movimento (§3.4); as três
bibliotecas de animação continuam no bundle (§3.3); o menu mobile não fecha no
`Escape` nem ao clicar fora (§1.5); não existe feedback de pressionado em
touch (§2.3); a borda dos cards tem 1,27:1 contra o preto, abaixo do 3:1 que
o WCAG pede para limites de UI (§6); o `.career-card:hover` ainda usa o
padrão de translate que não renderiza (§2.2b); e a pasta `public/` não existe
— sem favicon, sem imagem OG, sem `metadataBase`.

---

## 1. Acessibilidade (CRÍTICO)

### 1.1 ✅ CORRIGIDO — O anel de foco dos botões principais era invisível — `focus-states`

`src/components/ui/origin-button.tsx:237` aplica `focus-visible:outline-none` e
o substitui por `ring-2 ring-[var(--color-ring)]`. Os valores de `--ic-ring`
são translúcidos demais:

| Variante | Anel resultante | vs. fundo do botão | WCAG 2.4.11 |
|---|---|---|---|
| `dark` — `rgba(246,243,236,0.18)` sobre `#171716` | `#3f3f3d` | **1.70:1** | ❌ exige 3:1 |
| `light` — `rgba(17,17,17,0.16)` sobre `#ffffff` | `#d9d9d9` | **1.41:1** | ❌ exige 3:1 |

Como o `outline-none` também cancela o fallback global de `globals.css`
(`:focus-visible { outline: 2px solid accent }`), quem navega por teclado **não
vê onde está** nos CTAs principais do site ("Ver projetos", "Falar comigo",
"contato", "Entrar em contato"). É o achado mais grave da auditoria.

**Aplicado:** removidas as classes `focus-visible:outline-none`/`ring-*` de
`origin-button.tsx`, deixando o `:focus-visible` global do `globals.css` agir.
Como ele desenha o outline 3px **fora** do botão, o indicador contrasta com o
fundo da página e não com o preenchimento — o que resolve as duas variantes de
uma vez e elimina de quebra o `ring-offset` apontado para a cor errada.

Verificado com Tab real no navegador, foco em "Ver projetos":

```
matchesFocusVisible: true
outline: rgb(212, 212, 216) solid 2px   // #d4d4d8 = 14,21:1 sobre #000000 ✅
outlineOffset: 3px
boxShadow: none                          // o ring quebrado não existe mais
```

### 1.2 ✅ CORRIGIDO — `prefers-reduced-motion` não cobria as animações pequenas

Já estava tratado em `smooth-scroll.tsx:189`, `parallax-scene.tsx:39` e
`floating-paths.tsx`. Faltava em `ui/reveal.tsx`, no typewriter do
`HeroSection` e no `.code-cursor`. O `animate-pulse` do `SkeletonCard` saiu
sozinho quando a seção virou Server Component (§3.2).

**Aplicado:**

- `ui/reveal.tsx` — `useReducedMotion()` (mesmo idioma do `floating-paths`),
  com `initial={false}` e sem `whileInView`. **Esse é o detalhe que importa:**
  o `opacity: 0` do `initial` é escrito no HTML servido, então um guard mal
  feito aqui deixaria o conteúdo de todas as seções invisível em vez de
  apenas parado.
- `HeroSection` — a digitação é pulada e o bloco é pintado pronto
  (`CODE_LINES.map(l => l.html)`). Era a única animação do site que rodava
  para sempre.
- `globals.css` — `@media (prefers-reduced-motion: reduce)` zera o `blink`.
  Na prática o cursor nem chega a ser renderizado nesse caminho; a regra fica
  porque a classe é global.

Verificado forçando o ramo reduzido no navegador (o painel não emula essa
media feature, então a condição foi forçada no código via HMR e revertida
depois — confirmei que não sobrou marca de teste):

```
blocoEstavel: true            // o código não muda em 1,5s: sem loop de digitação
temCursor: false
textoCompleto: true           // "café" e "};" presentes, bloco inteiro
elementosComOpacidadeBaixa: 0 // nada preso em opacity 0 em #sobre/#projetos/#carreira
```

E com movimento normal, depois de reverter: `voltouADigitar: true`,
`temCursor: true`.

Segue em aberto o outro lado da regra `excessive-motion`: com movimento
normal o hero ainda anima 36 paths SVG + typewriter + cursor ao mesmo tempo.
Isso é o §3.4, que o item 5 **não** resolve — ele só tira o custo de quem
pediu menos movimento.

### 1.3 ✅ CORRIGIDO — Falta skip link — `skip-links`

Com navbar fixa e uma página longa de âncoras, não existia "pular para o
conteúdo": quem navega por teclado passava pelos cinco controles da navegação,
a cada visita, antes de alcançar o primeiro conteúdo.

**Aplicado:** `<a href="#conteudo" class="skip-link">` como primeiro elemento
do `<body>` (`layout.tsx`), `<main id="conteudo" tabIndex={-1}>` em `page.tsx`,
e o estilo `.skip-link` em `globals.css` — fora da tela por
`translateY(-200%)`, visível no `:focus`, `z-index: 200` para ficar acima da
navbar (que é `z-[100]`).

Dois detalhes sem os quais o link existiria sem funcionar:

1. **O `<main>` precisa de `tabIndex={-1}`.** Sem isso o alvo do fragmento não
   é focável: a página rola e o foco do teclado fica para trás, na navegação —
   exatamente o que o link existe para pular.
2. **O `SmoothScroll` interceptava o clique.** `smooth-scroll.tsx` dá
   `preventDefault()` em *todo* `a[href^="#"]` para delegar ao Lenis, e é a
   navegação de fragmento nativa que move o foco. O skip link ganhou
   `data-native-anchor` e o handler passou a ignorá-lo. O salto instantâneo
   também é o comportamento esperado de um atalho desses — 1,1s de scroll
   animado num "pular para o conteúdo" seria o oposto do objetivo.

Verificado com teclado de verdade (`Tab` e `Enter` reais, não `.focus()`):

```
Tab    → .skip-link, primeiro focável do documento, visível em top: 16px, à frente da navbar
Enter  → document.activeElement = MAIN#conteudo
Tab    → "Ver projetos", dentro do main — os 5 controles da navbar foram pulados
```

E as âncoras normais seguem no caminho do Lenis: clicar em "carreira" ainda
para a seção a 72px do topo (o `NAV_OFFSET`), não em 0.

**Observação para quando §5.4 for mexido:** o `<main>` recebe o outline de foco
global (`solid 2px`, offset 3px), hoje invisível porque o `overflow-x: hidden`
do `html` corta as bordas laterais e a de cima. Se esse `overflow-x` sair, vai
aparecer um retângulo de 2px em volta da página inteira — aí o outline precisa
ser escopado para fora do alvo do skip link.

### 1.4 ✅ CORRIGIDO — Hierarquia de headings quebra nos cards — `heading-hierarchy`

`h1` no hero e `h2` nos `SectionHeading` estavam certos, mas os títulos dos
cards eram `div`, não `h3` — leitor de tela não conseguia navegar a lista de
projetos por headings, só lendo card por card. As `<section>` também não tinham
`aria-labelledby` ligando ao próprio `h2`, então não eram anunciadas como
região nem apareciam na lista de landmarks.

**Aplicado:**

- `ProjectsSection.tsx` — nome do repositório virou `h3`, e o card virou
  `<article>`, acompanhando o que o `CareerSection` já fazia.
- `CareerSection.tsx` — cargo virou `h3`.
- `SectionHeading` ganhou a prop `titleId`; as três seções passaram a ter
  `aria-labelledby` apontando para o próprio `h2`.

O Tailwind zera tamanho e peso dos headings no preflight, então nada mudou
visualmente — medido: o título do repo continua em 15.2px/600, o da carreira em
16px/600, `margin: 0` nos dois.

Outline resultante, lido do DOM:

```
H1 Oi, eu sou Nycolas Fernandes
  H2 #sobre-titulo     Sobre mim
  H2                   Do primeiro commit ao próximo projeto   (cena de parallax, decorativa)
  H2 #projetos-titulo  Projetos no GitHub
    H3 × 6               um por repositório
  H2 #carreira-titulo  Carreira profissional
    H3 × 2               um por cargo
```

Nenhum nível pulado, e as três `<section>` resolvem para o nome certo
(`section#sobre → "Sobre mim"`, e assim por diante).

### 1.5 Menu mobile sem rotas de escape — `escape-routes`, `modal-escape`, `focus-management`

`Navbar.tsx:69` tem `aria-label` e `aria-expanded` ✅, mas falta: `aria-controls`
(e o painel não tem `id`), fechar no `Escape`, fechar ao clicar fora, e mover o
foco para dentro do painel ao abrir.

---

## 2. Toque e Interação (CRÍTICO)

### 2.1 ✅ CORRIGIDO (exceto o card) — Alvos de toque abaixo de 44×44px — `touch-target-size`

| Elemento | Antes | Depois (medido no navegador) |
|---|---|---|
| Ícone GitHub do footer (`Footer.tsx:11`) | ~18×18px (ícone sem padding) | **44×44** ✅ |
| Ícones sociais do hero (`HeroSection.tsx:192`) | `h-10 w-10` = 40×40 | **44×44** ✅ |
| Links da navbar desktop (`Navbar.tsx:53`) | ~34px de altura | **44** ✅ |
| CTA "contato" da navbar (`Navbar.tsx:62`) | `h-9` = 36px | **44** ✅ |
| Links do menu mobile (`Navbar.tsx:92,100`) | ~40px | **44** ✅ |
| Hambúrguer (`Navbar.tsx:73`) | `h-11 w-11` = 44×44 | já estava ✅ |
| Link do título do repo (`ProjectsSection.tsx:77`) | altura da linha, ~22px | ⏳ sai junto com §2.2 |

O CTA "contato" da navbar não estava no levantamento original: o `h-9` no
`className` sobrescrevia o `h-12` padrão do `OriginButton`. Apareceu ao medir.

Em 375px não há scroll horizontal (`scrollWidth === innerWidth === 375`).

### 2.2 ✅ CORRIGIDO — O card de projeto parecia clicável mas não era — `hover-vs-tap`

`.repo-card:hover` muda a borda e a sombra, sugerindo que o card inteiro é um
link — mas só o texto do título era `<a>`. Clicar em qualquer outro ponto não
fazia nada. O plugin recomenda justamente "Project Card Hover" como CTA
primário deste pattern.

**Aplicado:** stretched link — o card ganhou `relative` e o `<a>` do título
ganhou `after:absolute after:inset-0`. Preferido a envolver o card inteiro num
`<a>` porque mantém o nome acessível do link curto (só o nome do repositório,
não a descrição + estrelas + linguagem).

Um detalhe que quebra essa técnica em silêncio: o `truncate` **saiu do `<a>`**
e foi para um `<span>` interno. `truncate` traz `overflow: hidden`, que
recortaria o `::after` no tamanho do texto e anularia a área estendida.

Verificado amostrando quatro pontos do card (294×246px) com
`document.elementFromPoint`:

```
topoEsq: abre o repo | meio: abre o repo | statsRodape: abre o repo | cantoInfDir: abre o repo
::after → position: absolute, inset 0 0 0 0
truncamento preservado: overflow hidden + text-overflow ellipsis no <span>
```

Isso também resolve a última linha de §2.1: o alvo do título saiu de ~22px de
altura para o card inteiro.

**Paridade de teclado:** `.repo-card:focus-within` foi somado ao `:hover`.
Agora que o card inteiro é o link, quem chega pelo teclado recebe o mesmo
retorno visual de quem chega pelo mouse (medido: hover e foco produzem
exatamente o mesmo transform e a mesma sombra).

### 2.2b 🐛 Achado novo — o "levanta no hover" nunca acontecia

Ao verificar a paridade acima, o card não se movia nem no hover nem no foco.
Não era regressão: as utilities de translate do Tailwind montam o transform a
partir de custom properties (`translate(var(--tw-translate-x), …)`), e
interpolar isso a partir de `transform: none` com `transition-all` travava.
Medido no navegador:

```
:hover e :focus-within  → matrix(1, 0, 0, 1, 0, 0)   // identidade, sem deslocamento
mesma regra, transition desligada → matrix(1, 0, 0, 1, 0, -4)  // os 4px existem
```

Corrigido em `.repo-card` trocando `-translate-y-1` por `translateY(0)` no
estado base e `translateY(-4px)` no hover/foco — valores diretos interpolam
normalmente. Confirmado depois: `0 → -3.5 → -4px` ao longo da transição, e o
topo do card sobe de 260,7 para 256,7.

**Ainda em aberto:** `.career-card:hover` segue com o padrão antigo baseado em
variáveis, então o deslocamento dele também não renderiza. (`.btn-ghost` e
`.btn-primary` tinham o mesmo problema; os dois deixaram de existir no
item 10.)

### 2.3 Feedback só no hover

`.repo-card`, `.skill-tag`, `.career-card` e os links da nav definem apenas
`:hover`. Em touch não existe estado de pressionado (`press-feedback`). Só o
`OriginButton` trata `pointerdown` corretamente.

---

## 3. Performance (ALTO)

### 3.1 ✅ CORRIGIDO — A fonte era carregada duas vezes, de forma bloqueante — `font-loading`, `critical-css`

A mesma URL do Google Fonts aparece em dois lugares:

- `src/app/globals.css:1` — `@import url(...)` (**render-blocking**, e dentro do
  CSS do Tailwind, o pior caso: o navegador só descobre a fonte depois de baixar
  e parsear o CSS)
- `src/app/layout.tsx:28` — `<link rel="stylesheet">` para a mesma coisa

Resultado: requisição duplicada + bloqueio de render. O projeto é Next 14 com
App Router e **não usa `next/font`**, que resolveria tudo isso: self-hosting,
`font-display: swap` automático, preload do subset correto e zero requisição
externa (dispensando também os dois `preconnect` de `layout.tsx:25-26`).

**Aplicado:** `next/font/google` em `layout.tsx` com as variáveis `--font-sans`
e `--font-mono` no `<html>`; `@import` removido de `globals.css:1`; os dois
`preconnect` removidos (não têm mais função); `tailwind.config.js` passou a ler
as variáveis. Inter e JetBrains Mono são variable fonts, então não se declara
`weight` — todos os pesos vêm do mesmo arquivo.

Verificado no navegador após reload:

```
bodyFont: "__Inter_d8ebd1, __Inter_Fallback_d8ebd1, system-ui, sans-serif"
monoFont: "__JetBrains_Mono_4dc837, __JetBrains_Mono_Fallback_4dc837, monospace"
googleFontLinks: []        // nenhuma requisição sai para fonts.googleapis.com
```

O `__Inter_Fallback_*` é a fonte de fallback com métricas ajustadas que o
next/font gera sozinho — ela também remove o layout shift da troca de fonte,
que era o segundo item de `font-loading`.

### 3.2 ✅ CORRIGIDO — Os repositórios eram buscados no cliente, sem cache — `content-jumping`, `lazy-loading`

`ProjectsSection.tsx:38` faz `fetch("https://api.github.com/...")` dentro de um
`useEffect`:

- **Rate limit**: a API do GitHub sem autenticação permite 60 req/h **por IP**.
  Visitantes atrás de um NAT compartilhado veem "Erro ao carregar repositórios."
- **Sem cache**: toda visita refaz a chamada.
- **CLS**: o skeleton tem altura fixa; os cards reais variam com o tamanho da
  descrição. O próprio `smooth-scroll.tsx:254-269` tem um `ResizeObserver`
  dedicado a consertar o `ScrollTrigger` *depois* que essa mudança de altura
  acontece — ou seja, o problema já foi diagnosticado e mitigado, não removido.
- `ProjectsSection` é `"use client"` só por causa disso.

**Aplicado:** `ProjectsSection` virou um Server Component assíncrono com
`next: { revalidate: 3600 }`. Saíram o `"use client"`, os três `useState`, o
`useEffect` e o `SkeletonCard` inteiro — o HTML já chega com os repositórios
dentro, então não existe mais estado de carregamento para exibir.

Um detalhe que só aparece ao mover a chamada para o servidor: **a API do
GitHub responde 403 sem `User-Agent`**. No navegador ele ia automaticamente;
em Node, não. O header foi adicionado explicitamente.

Verificado com build limpo (`rm -rf .next && npx next build`):

```
.next/prerender-manifest.json   → "/" : initialRevalidateSeconds = 3600
.next/cache/fetch-cache/f86ee…  → revalidate = 3600, url = api.github.com/users/NyckzXD/repos
.next/server/app/index.html     → contém "FootballPredictor"   // repos no HTML estático
```

E no navegador: 6 cards renderizados, **nenhuma** requisição a
`api.github.com` saindo do cliente, JS da rota caindo de 53,4 kB → **52,3 kB**.

Resultado: uma requisição por hora para o site inteiro, em vez de uma por
visitante — o rate limit de 60/h deixa de ser alcançável pelo tráfego.

O `ResizeObserver` de `smooth-scroll.tsx:254-269` **foi mantido**: a causa que
o motivou desapareceu, mas ele ainda cobre outras mudanças de altura (fonte,
barra de endereço no mobile). Removê-lo é decisão à parte, com risco de
regressão no `ScrollTrigger`.

### 3.3 Três bibliotecas de animação no bundle

`motion` (Framer v11) + `gsap` + `lenis`. GSAP entra só pelo `ScrollTrigger`
(parallax e sincronia do Lenis) e Motion pelo `Reveal`/`AnimatePresence`. O
`Reveal` é um fade-up de 28px disparado por viewport — dá para fazer com
`IntersectionObserver` + a keyframe `fade-up` que **já existe** em
`tailwind.config.js:60`, removendo o Motion do caminho crítico das seções.

### 3.4 O typewriter reescreve `innerHTML` indefinidamente — `main-thread-budget`

`HeroSection.tsx:103-151`: um `setTimeout` de ~40ms que reescreve o `innerHTML`
do bloco de código, em loop eterno. Cada reescrita força recálculo de estilo e
layout. Os comentários no arquivo (linhas 62-69) documentam a briga por thread
principal com o parallax, resolvida com um sistema de pausa (`pausedRef` +
`useAnchorScrolling` + `IntersectionObserver`) — muita engenharia para um efeito
decorativo. Alternativa: animar via CSS (`steps()` + `ch`) ou rodar só uma vez
em vez de em loop.

---

## 4. Estilo e Consistência (ALTO)

### 4.1 ✅ CORRIGIDO — Dois sistemas de token que não se falam — `color-semantic`, `elevation-consistent`

Coexistiam no projeto:

1. Tokens do Tailwind (`tailwind.config.js`): `bg`, `bg2`, `bg3`, `accent`,
   `accent2`, `muted`, `text-main`.
2. Os ~46 CSS vars `--ic-*`/`--color-*` embutidos em `origin-button.tsx`,
   com paleta própria.

E as paletas **divergiam**: o botão usava `#f6f3ec` (creme quente) e `#111111`,
enquanto o site usa `#f5f5f5` (neutro) sobre `#000000`. Os CTAs principais
puxavam para o quente num site frio/neutro. O botão também trazia
`--ic-chart-1..5` e `--ic-destructive`, que nada no projeto usava.

**Aplicado:** as três cadeias gigantes de classe saíram — a de mapeamento
(`--ic-*` → `--color-*`) e as duas de tema. **Das 46 variáveis, o componente
lia sete**; o resto era inventário do kit de origem (`--ic-chart-1..5`,
`--ic-brand`, `--ic-paper`, `--ic-popover-foreground`, `--ic-destructive`,
`--ic-shadow-soft`, `--ic-surface-border`…). O `--ic-ring` já tinha ficado
órfão quando o anel de foco saiu no item 1.

No lugar, duas listas curtas com os tokens do próprio site — sem camada de
variável no meio, porque não havia reuso que justificasse a indireção:

| | Antes | Depois |
|---|---|---|
| **light** fundo / texto / borda | `#ffffff` / `#111111` / `#e3e7ec` | `accent2` / `bg` / `accent` |
| **dark** fundo / texto / borda | `#171716` / `#f6f3ec` / `#2b2a25` | `bg3` / `text-main` / `border` |
| preenchimento do hover | `--color-foreground` / `bg-neutral-50` | `bg` / `accent2` |
| texto sobre o preenchimento | `--color-background` / `text-neutral-950` | `accent2` / `bg` |

As duas últimas linhas eram um detalhe à parte: a variante escura nem usava a
paleta do botão ali, usava `neutral-50`/`neutral-950` do Tailwind padrão.

Verificado no navegador, nos cinco CTAs da página: light computa
`rgb(244,244,245)` sobre texto `rgb(0,0,0)`; dark, `rgb(33,33,33)` com texto
`rgb(245,245,245)` e borda `rgba(255,255,255,0.12)`. O preenchimento circular
do hover continua funcionando nas duas variantes (medido: light pinta
`rgb(0,0,0)` e o texto vira `rgb(244,244,245)`; dark faz o inverso), e o anel
de foco do item 1 segue em `rgb(212,212,216)`, 2px, offset 3px.

A variante escura ficou um pouco mais clara que antes (`#212121` contra
`#171716`): é o `bg3`, o token de superfície elevada que a `.skill-tag` e o
hover da navbar já usavam. Contraste do texto sobre ela: **14,6:1**.

### 4.2 ✅ CORRIGIDO — Dois sistemas de botão

`globals.css` definia `.btn-primary` e `.btn-ghost`; existe também o
`OriginButton`. `.btn-primary` **não era usado em lugar nenhum** (código
morto); `.btn-ghost` aparecia só uma vez, no "Ver todos no GitHub", enquanto
todos os outros CTAs usavam `OriginButton` — o botão ficava visualmente de
outra família que o "Ver projetos" logo acima. Regra `consistency`.

**Aplicado:** os dois saíram do `globals.css` e o "Ver todos no GitHub" virou
`OriginButton variant="dark"`. Agora os cinco CTAs da página vêm do mesmo
componente.

Dois efeitos colaterais:

- `shadow-glow` e `shadow-glow-lg` saíram do `tailwind.config.js`. O
  `.btn-primary` era o único consumidor dos dois — e era código morto.
- O `-translate-y-0.5` que os dois tinham no hover nunca renderizava, pelo
  mesmo motivo do §2.2b. Some com eles.

O bundle da rota caiu de **52,3 kB para 51,6 kB**: as cadeias de classe do
botão eram string no bundle do cliente.

### 4.3 ✅ CORRIGIDO — Hex cru dentro de componentes

`text-[#cacaca]` repetido em `HeroSection.tsx`, `AboutSection.tsx` e
`CareerSection.tsx` — é o token "texto de corpo secundário", que não existia
na config. Idem `#1c1c1c`/`#121212`/`#000000` em `parallax-scene.tsx` e as
cores de sintaxe (`.c-keyword`, `.c-var`, …) em `globals.css`.

**Aplicado:**

- `#cacaca` virou o token **`text-soft`**, entre o `text-main` (#f5f5f5) e o
  `muted` (#a1a1aa). Os três usos agora são `text-text-soft`.
- As três serras da `ParallaxScene` passaram a usar a rampa de fundo que já
  existia: `fill-bg3` atrás, `fill-bg2` no meio, `fill-bg` na frente. Os três
  traços, que tinham alfas de branco diferentes (0,14 / 0,10 / 0,16), viraram
  o token `border`. As diferenças são de 1 a 5 pontos de hex — saem cinco
  valores fora da paleta sem mudança perceptível. O `Ridge` deixou de receber
  `fill`/`stroke` como string e passou a receber `className`.
- As cinco cores de sintaxe viraram um grupo `syntax` na config
  (`keyword`, `var`, `prop`, `str`, `bool`), lidas no `globals.css` via
  `theme('colors.syntax.*')` — o mesmo idioma que o arquivo já usava para
  `theme('colors.accent')`. Continuam uma paleta à parte de propósito: realce
  de sintaxe não é cor de interface.

Verificado no navegador: as serras computam `rgb(33,33,33)`, `rgb(20,20,20)` e
`rgb(0,0,0)` com traço `rgba(255,255,255,0.12)`; as cinco cores de sintaxe
seguem idênticas; `text-soft` resolve para `rgb(202,202,202)`.

**Ficou de fora:** os `rgba(244,244,245, …)` do brilho do horizonte e do halo
das estrelas, em `parallax-scene.tsx`. São o `accent2` com alfa dentro de um
`radial-gradient` e de um `box-shadow` arbitrários — mexer neles é reescrever
os dois efeitos, não trocar um token.

### 4.4 Configuração morta

- `darkMode: ["class"]` (`tailwind.config.js:3`) — **zero** ocorrências de
  `dark:` ou de troca de classe no projeto. O site é dark-only.
- ~~`theme.container` (linhas 10-16: center, padding 1.25rem, 1200px) —
  **zero** usos de `className="container"`. Todas as seções usam `px-[5%]` +
  `max-w-*`.~~ ✅ resolvido pelo item 8 (§5.2): agora é a única definição de
  largura de conteúdo do site, com o teto ajustado para 1024px.
- As keyframes `fade-up` e `pulse2` e suas animações
  (`tailwind.config.js:50-72`) — **zero** usos de `animate-fade-up` /
  `animate-pulse2` no projeto. Só `blink` é usada, e por CSS direto no
  `.code-cursor`, não pela classe `animate-blink`. Encontrado ao varrer as
  animações para o item 5.

---

## 5. Layout e Responsivo (ALTO)

### 5.1 ✅ CORRIGIDO — O hero não alinha com as outras seções — `container-width`

- `HeroSection.tsx` → `max-w-6xl` (1152px)
- `AboutSection.tsx`, `ProjectsSection.tsx`, `CareerSection.tsx` → `max-w-5xl` (1024px)

**Correção do diagnóstico original.** Esta seção dizia "o hero é mais largo" e
"um degrau de 64px por lado". Ao medir, os dois pontos saíram diferentes:

O hero não era mais largo — era **mais estreito**. O `px-[5%]` ficava *dentro*
do `max-w-6xl` dele, enquanto nas outras seções o mesmo `px-[5%]` ficava *fora*
do `max-w-5xl`. Então o padding comia a largura do hero e não a das seções.

E o degrau não era fixo: crescia com a viewport, porque o percentual crescia
enquanto os `max-w` não. Reproduzindo as duas regras antigas no navegador:

| Viewport | Conteúdo do hero | Conteúdo das seções | Degrau na margem esquerda |
|---|---|---|---|
| 1432px | 1008,8px | 1024px | 7,6px |
| 2560px | 896,8px | 1024px | 63,6px |

Ou seja: o número 64px valia só perto de 2560px; em 1440px o desalinhamento
era de 7,6px. A conclusão de que havia desalinhamento estava certa, o tamanho
dele não.

**Aplicado:** as quatro seções, a navbar e o footer passaram a usar o mesmo
`container`. Medido em 1440px, todas as bordas esquerdas do conteúdo caem em
**224px** — logo da navbar, `h1` do hero, os três `h2` de seção e o texto do
footer — e a borda direita do footer fecha em 1208px, igual à do container.

### 5.2 ✅ CORRIGIDO — Gutter percentual em vez da escala de espaçamento — `spacing-scale`

`px-[5%]` em 7 arquivos. Percentual significa gutter que cresce indefinidamente
com a viewport (5% de 2560px = 128px) e encolhe no mobile (18,75px em 375px),
sem relação com a grade de 4/8px. É o papel do `theme.container`, que estava
configurado e ignorado (§4.4).

**Aplicado:** `theme.container` virou a única definição de largura de conteúdo
do site — `center`, `padding: 1.25rem`, teto em `lg: 1024px`. Os sete
`px-[5%]` saíram:

- `HeroSection`, `AboutSection`, `ProjectsSection`, `CareerSection`, `Navbar` e
  `Footer` → `container`.
- O painel do menu mobile (`Navbar`) e a camada de título da `ParallaxScene` →
  `px-5`. As duas sangram de ponta a ponta de propósito, e `px-5` é exatamente
  o mesmo `1.25rem` do gutter do container.

O teto ficou em **1024px**, não nos 1200px que estavam na config: assim a troca
alinha o hero com as seções em vez de alargar a página inteira. O conteúdo
passa de 1024px para 984px no desktop (o container inclui o padding, com
`box-sizing: border-box`), e o gutter mobile de 18,75px para 20px — um valor
fixo da grade de 4px.

Nas seções com fundo próprio (`ProjectsSection` tem `border-y` e `bg-bg2`) e
nas barras (navbar, footer), o `container` foi para um `div` interno: o fundo
e as bordas continuam sangrando, só o conteúdo é que fica contido.

Em 375px: gutter de 20px dos dois lados, conteúdo de 335px e
`scrollWidth === innerWidth === 375` — sem scroll horizontal.

### 5.3 ✅ CORRIGIDO — Sem escala tipográfica — `font-scale`

11 tamanhos arbitrários distintos, nenhum derivado de escala: `0.78rem`,
`0.8rem`, `0.82rem`, `0.83rem`, `0.85rem`, `0.88rem`, `0.95rem`, `1.05rem`,
`15px`, e dois `clamp()`. O plugin pede escala consistente (ex.:
12/14/16/18/24/32). A descrição do repositório ficava em `0.85rem` = **13,6px**
de texto corrido, abaixo do recomendado (`readable-font-size`).

**Aplicado:** `theme.fontSize` passou a declarar a escala do projeto, e os
nove valores arbitrários de corpo colapsaram em quatro passos:

| Antes | Depois |
|---|---|
| 0,78rem (12,48px), 0,8rem (12,8px) | `text-xs` — 12px |
| 0,82rem (13,12px), 0,83rem (13,28px), 0,85rem (13,6px), 0,88rem (14,08px) | `text-sm` — 14px |
| 0,95rem (15,2px), 15px | `text-base` — 16px |
| 1,05rem (16,8px) | `text-lg` — 18px |
| `clamp(2.2rem,5vw,3.8rem)` + `leading-[1.12]` | `text-display` |
| `clamp(2rem,6vw,4.2rem)` + `leading-[1.08]` | `text-display-lg` |

Medido depois, em 1280px, a página inteira usa **sete** tamanhos: 12, 14, 16,
18, 36, 56 e 67,2px — os quatro passos de corpo, o `4xl` dos títulos de seção
e os dois fluidos. A descrição do repositório subiu para 14px, resolvendo o
`readable-font-size`.

**A entrelinha foi a parte delicada.** Os passos do Tailwind vêm com
line-height embutido (`text-sm` = 1,25rem, ou ~1,43). Mas esses textos não
declaravam entrelinha nenhuma: herdavam o **1,7** do body. Trocar
`text-[0.85rem]` por `text-sm` puro teria apertado o corpo de 1,7 para 1,43 —
uma regressão de legibilidade disfarçada de refatoração, justo no item que o
§6 elogiava. Por isso a escala declara entrelinha explícita: 1,7 nos passos de
corpo (`sm`, `base`), 1,6 no `lg`, e valores progressivamente menores nos
títulos.

**Uma regressão do item 8 que apareceu aqui.** Com o container, a coluna de
texto do hero passou a ter 548px. O `h1` a 60,8px pede 553px para "Nycolas
Fernandes", então quebrava em **três** linhas — desfazendo a composição de
duas que o `<br/>` do `HeroSection` declara explicitamente. Não dava para ver
nos números do item 8; só apareceu ao olhar o hero de novo. O teto do
`text-display` caiu de 3.8rem para **3.5rem** (56px, que pede 508px), e as
duas linhas voltaram. Em 375px o piso do clamp não mudou.

**Também saiu daqui:** o `text-[0.82rem]` do skip link, que eu mesmo
introduzi no item 7, virou `text-sm`.

**Ficou de propósito:** o `leading-[1.9]` do bloco de código do hero. É
entrelinha, não tamanho, e 1,9 num bloco de código é escolha deliberada — a
escala não deve sobrescrevê-la.

### 5.4 `overflow-x: hidden` no `html`

`globals.css` aplica `overflow-x: hidden` em `html`. Isso mascara overflow em
vez de corrigir a origem e, em alguns engines, cria um contexto de scroll que
quebra `position: sticky` em descendentes — exatamente a técnica de que a
`ParallaxScene` depende (`sticky top-0`). Funciona hoje; é frágil.

---

## 6. Tipografia e Cor (MÉDIO)

**O contraste de texto está bom** — vale registrar, porque é o erro mais comum
em tema escuro e aqui não existe:

| Par | Ratio | WCAG AA |
|---|---|---|
| `#cacaca` sobre `#000000` | 12.81:1 | ✅ |
| `muted #a1a1aa` sobre `bg2 #141414` | 7.19:1 | ✅ |
| `accent #d4d4d8` sobre `#000000` | 14.21:1 | ✅ |

O único par que falha é de **componente**, não de texto: a borda
`rgba(255,255,255,0.12)` sobre `#000000` dá **1.27:1**, abaixo do 3:1 que o WCAG
1.4.11 pede para limites de UI. Os cards praticamente não têm contorno
perceptível no fundo preto — o que empurra a hierarquia para a sombra, que no
preto também não aparece. Vale subir para ~0.20 nas bordas que carregam
estrutura (cards, inputs) e manter 0.12 nos divisores decorativos.

`line-height: 1.7` no body ✅ (regra pede 1.5–1.75).

---

## 7. Formulários e Feedback (MÉDIO)

### 7.1 ✅ CORRIGIDO (junto com §3.2) — Estado de erro sem recuperação — `error-recovery`, `error-clarity`

**Aplicado:** a mensagem passou a oferecer caminho de saída — "Não foi possível
carregar os repositórios agora. Eles continuam acessíveis **direto no
GitHub**", com link para o perfil. Num Server Component não existe "tentar de
novo" no cliente para oferecer: o caminho de recuperação *é* o link externo,
e o próprio ISR se recupera sozinho na revalidação seguinte.

O texto original dizia:

`ProjectsSection.tsx:66-70` mostrava "Erro ao carregar repositórios." e parava
aí: sem causa, sem botão de tentar de novo, sem link alternativo. Dado o rate limit
de 60 req/h do §3.2, é um caminho que visitantes reais vão encontrar.

### 7.2 ✅ CORRIGIDO (junto com §3.2) — Nenhum estado vazio — `empty-states`

Antes, se a API devolvesse `[]`, caía em `loading=false`, `error=false`,
`repos=[]` → a grade renderizava **nada**, sem explicação.

**Aplicado:** sem o flag de carregamento, erro e lista vazia viraram dois
ramos explícitos (`repos === null` e `repos.length === 0`), cada um com seu
texto. O vazio agora diz "Ainda não há repositórios públicos para mostrar
aqui." Os dois dividem o mesmo componente `Aviso`, então a seção nunca
renderiza um buraco.

### 7.3 Sem contato real — recomendação do pattern

O plugin coloca "Contato" como quarta seção do Portfolio Grid, com CTA no
footer. Hoje todo contato é `mailto:nycolas.tec@gmail.com` (4 ocorrências) e o
footer não tem CTA nenhum. `mailto:` falha silenciosamente para quem usa webmail
sem handler registrado.

---

## 8. Navegação (ALTO)

### 8.1 ✅ CORRIGIDO — Sem indicação de seção atual — `nav-state-active`

Os três links (`#sobre`, `#projetos`, `#carreira`) nunca mudavam de estado.
Numa one-page longa com parallax, o visitante não tinha referência de onde
estava. Faltava scroll-spy + `aria-current="location"`.

**Aplicado:** o listener de scroll que a navbar já tinha (para a barra ficar
opaca) passou a calcular também a seção ativa, em vez de um segundo listener.

**A regra é "a última seção cuja borda superior já passou pela navbar", não "a
que está visível".** A diferença importa por causa da cena de parallax: ela
fica entre "sobre" e "projetos", ocupa a tela inteira e não é seção nenhuma.
Com a regra do visível, nenhum link ficaria aceso durante a travessia e o
estado piscaria. Medido com rolagem de verdade:

```
scrollY    0 → nenhum      (hero)
scrollY  800 → sobre
scrollY 1800 → sobre       ← dentro da cena de parallax, o estado se mantém
scrollY 2800 → sobre       (#projetos começa em 2964)
scrollY 3800 → projetos    (#carreira começa em 3978)
scrollY 4212 → carreira
```

O estado ativo é cor **mais** uma barra de 1px embaixo do link, não só cor
(`color-not-only`). A barra existe sempre e só troca de opacidade, para a
altura do link não mudar quando a seção muda. No painel mobile, onde não cabe
barra, o papel é de um ponto à direita. Verificado: só o link ativo tem
`aria-current="location"`, texto `#f5f5f5` e barra em opacidade 1; os outros
ficam em `#a1a1aa` com a barra em 0.

**Um bug que só apareceu ao verificar.** Logo depois de clicar em "carreira" a
navbar ainda acendia "sobre". As posições das seções eram medidas uma vez, na
montagem — e a altura do documento ainda muda depois disso (troca da fonte de
fallback pela real, barra de endereço no mobile), então o cache nascia errado.
Um `resize` qualquer corrigia sozinho, o que mascarava o problema. Agora um
`ResizeObserver` no `body` remede quando a altura muda, com a mesma guarda de
altura que o `SmoothScroll` já usava, e `document.fonts.ready` cobre a troca
de fonte.

Medir uma vez e remedir sob demanda, em vez de ler `getBoundingClientRect` a
cada frame, é de propósito: com o Lenis o evento de scroll chega a cada frame,
e este projeto já teve briga por thread principal (§3.4).

### 8.2 ✅ CORRIGIDO — O offset da navbar só existe no caminho do Lenis

`smooth-scroll.tsx` intercepta **todo** clique em `a[href^="#"]` com
`preventDefault()` e delega ao Lenis. Com `prefers-reduced-motion` ativo o
`SmoothScroll` retorna antes e cai no `scroll-behavior: smooth` nativo ✅. Mas
o `NAV_OFFSET = -72` que compensa a navbar fixa **só existia no caminho do
Lenis** — com motion reduzido, ou antes da hidratação, o alvo parava atrás da
navbar de 64px.

**Aplicado:** `scroll-margin-top` nas `<section>` e no `<main>`, que funciona
nos dois caminhos.

E o número deixou de existir em dois lugares. Ele agora mora em um
`--nav-offset: 72px` no `:root`; o `scroll-margin-top` lê a variável direto, e
o `SmoothScroll` e a navbar leem pelo helper `navOffset()`, que faz
`parseFloat` do valor computado. Antes havia o risco clássico: alguém mudar a
altura da navbar, ajustar um dos dois e deixar o outro para trás.

Verificado nos dois caminhos, com o `#carreira`:

```
clique na navbar (Lenis)        → topo da seção em 72px
carregar /#carreira direto      → topo da seção em 72px   ← o caminho nativo
```

O segundo é o que estava quebrado: antes da hidratação quem resolve o
fragmento é o navegador, e ele não conhecia o `NAV_OFFSET`.

---

## Prioridade sugerida

| # | Ação | Arquivo | Esforço | Status |
|---|---|---|---|---|
| 1 | Anel de foco visível nos botões (§1.1) | `ui/origin-button.tsx:237` | baixo | ✅ feito |
| 2 | Alvos de toque ≥44px (§2.1) | `Footer.tsx`, `HeroSection.tsx:192`, `Navbar.tsx:53,62,92,100` | baixo | ✅ feito |
| 3 | `next/font` e remover o `@import` duplicado (§3.1) | `layout.tsx`, `globals.css:1`, `tailwind.config.js` | baixo | ✅ feito |
| 4 | Repos via Server Component com `revalidate` (§3.2) | `ProjectsSection.tsx` | médio | ✅ feito |
| 5 | `reduced-motion` no `Reveal` e no typewriter (§1.2) | `ui/reveal.tsx`, `HeroSection.tsx`, `globals.css` | baixo | ✅ feito |
| 6 | Card de projeto clicável inteiro (§2.2, §2.2b) | `ProjectsSection.tsx`, `globals.css` | baixo | ✅ feito |
| 7 | Títulos de card como `h3` + skip link (§1.3, §1.4) | cards, `layout.tsx`, `page.tsx`, `ui/section-heading.tsx`, `ui/smooth-scroll.tsx`, `globals.css` | baixo | ✅ feito |
| 8 | Unificar `max-w` e trocar `px-[5%]` pelo `container` (§5.1, §5.2) | `tailwind.config.js`, todas as seções, `Navbar.tsx`, `Footer.tsx`, `ui/parallax-scene.tsx` | baixo | ✅ feito |
| 9 | Escala tipográfica + token para `#cacaca` (§4.3, §5.3) | `tailwind.config.js`, todos os componentes, `globals.css` | médio | ✅ feito |
| 10 | Alinhar a paleta do `OriginButton` e remover `.btn-*` mortos (§4.1, §4.2) | `ui/origin-button.tsx`, `globals.css`, `ProjectsSection.tsx`, `tailwind.config.js` | médio | ✅ feito |
| 11 | Estado vazio + recuperação nos projetos (§7.1, §7.2) | `ProjectsSection.tsx` | baixo | ✅ saiu junto com o 4 |
| 12 | Scroll-spy na navbar + `scroll-margin-top` (§8.1, §8.2) | `Navbar.tsx`, `globals.css`, `ui/smooth-scroll.tsx` | médio | ✅ feito |

## Fora do escopo do plugin, mas adjacente

- **Sem `public/`**: nenhum favicon, nenhum ícone, nenhuma imagem OG. O
  `metadata.openGraph` em `layout.tsx:9-16` não tem `images` nem `metadataBase`
  — compartilhar o link no LinkedIn/WhatsApp gera um card sem imagem. Falta
  `icons`, `twitter`, `robots` e `canonical`.
- **Estrutura de pastas**: o app está em `C:\BLOG\meublog-next\meublog-next\`
  (duplicado), e o git mostra os arquivos do nível de cima como deletados — um
  commit não terminado. Vale resolver antes de mexer no código.
- `&copy; 2026` fixo em `Footer.tsx:8` — usar `new Date().getFullYear()`.
