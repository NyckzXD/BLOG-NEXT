<div align="center">

# nycolas.dev

**Portfólio pessoal de Nycolas Fernandes — desenvolvedor e estudante de Sistemas de Informação.**

[![Acessar site](https://img.shields.io/badge/Acessar-nycolas.dev-7c3aed?style=for-the-badge&logo=googlechrome&logoColor=white)](https://nycolas.dev)

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?style=flat-square&logo=greensock&logoColor=black)

**[https://nycolas.dev](https://www.nycolas.dev/)**

</div>

---

## Sobre o projeto

Site de portfólio desenvolvido com **Next.js (App Router)** e **TypeScript**, com foco em uma apresentação limpa, performática e com animações suaves. Reúne minha trajetória, as tecnologias com que trabalho, meus projetos públicos no GitHub e minha experiência profissional.

## Funcionalidades

- **Hero animado** — janela de código com efeito de digitação e fundo com linhas flutuantes em SVG.
- **Projetos dinâmicos** — os repositórios mais recentes são carregados em tempo real pela API pública do GitHub, com skeleton de carregamento e tratamento de erro.
- **Cena em parallax** — camadas com profundidade controladas por GSAP ScrollTrigger.
- **Rolagem suave** — integração com Lenis.
- **Animações de entrada** — seções reveladas conforme a rolagem, usando Motion.
- **Navbar responsiva** — fundo com blur ao rolar e menu mobile animado.
- **SEO** — metadados e Open Graph configurados em `pt_BR`.
- **Layout responsivo** — do celular ao desktop.

## Tecnologias

| Categoria   | Ferramentas                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Framework   | [Next.js 14](https://nextjs.org/) (App Router), React 18                                               |
| Linguagem   | TypeScript                                                                                             |
| Estilização | Tailwind CSS, PostCSS, `clsx`, `tailwind-merge`, CVA                                                   |
| Animações   | [GSAP](https://gsap.com/), [Motion](https://motion.dev/), [Lenis](https://lenis.darkroom.engineering/) |
| Ícones      | [Lucide](https://lucide.dev/)                                                                          |
| Dados       | GitHub REST API                                                                                        |

## Estrutura

```text
src/
├── app/
│   ├── layout.tsx          # Layout raiz, fontes e metadados
│   ├── page.tsx            # Página inicial (composição das seções)
│   └── globals.css         # Estilos globais e tokens
├── components/
│   ├── Navbar.tsx
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── ProjectsSection.tsx # Consome a API do GitHub
│   ├── CareerSection.tsx
│   ├── Footer.tsx
│   └── ui/                 # Componentes reutilizáveis
│       ├── floating-paths.tsx
│       ├── origin-button.tsx
│       ├── parallax-scene.tsx
│       ├── reveal.tsx
│       ├── section-heading.tsx
│       └── smooth-scroll.tsx
└── lib/
    └── utils.ts            # Helper cn()
```

## Como rodar localmente

**Pré-requisitos:** Node.js 18.17 ou superior e npm.

```bash
git clone https://github.com/NyckzXD/BLOG-NEXT.git
```

```bash
cd BLOG-NEXT
```

```bash
npm install
```

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Scripts

| Comando         | Descrição                            |
| --------------- | ------------------------------------ |
| `npm run dev`   | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção             |
| `npm run start` | Serve o build de produção            |
| `npm run lint`  | Executa o ESLint                     |

## Deploy

O site está publicado em **[nycolas.dev](https://nycolas.dev)**. Por ser uma aplicação Next.js padrão, pode ser hospedado em qualquer plataforma compatível (Vercel, Netlify, etc.) apontando o domínio personalizado para o deploy.

## Contato

- Site: [nycolas.dev](https://nycolas.dev)
- GitHub: [@NyckzXD](https://github.com/NyckzXD)
- Instagram: [@nycolasfe\_](https://www.instagram.com/nycolasfe_/)
- E-mail: [nycolas.tec@gmail.com](mailto:nycolas.tec@gmail.com)

---

<div align="center">

Feito por **Nycolas Fernandes** &copy; 2026

</div>
