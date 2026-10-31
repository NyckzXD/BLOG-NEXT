import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import "./globals.css";

/**
 * Fontes servidas pelo próprio domínio, via next/font.
 *
 * Antes a mesma folha do Google Fonts era pedida duas vezes: um @import no
 * topo do globals.css — que bloqueia o render e só é descoberto depois de
 * baixar e parsear o CSS do Tailwind — e um <link> aqui no <head>. Agora os
 * arquivos entram no build, com font-display: swap e preload do subset já
 * aplicados, e nenhuma requisição sai para fora. Os dois preconnect deixaram
 * de ter função e saíram junto.
 *
 * Inter e JetBrains Mono são variable fonts: não se declara `weight`, todos
 * os pesos usados no site vêm do mesmo arquivo.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nycolas Fernandes | Desenvolvedor",
  description:
    "Portfólio de Nycolas Fernandes, desenvolvedor em formação e estudante de Sistemas de Informação.",
  openGraph: {
    title: "Nycolas Fernandes | Desenvolvedor",
    description:
      "Portfólio de Nycolas Fernandes, desenvolvedor em formação e estudante de Sistemas de Informação.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {/*
          Primeiro elemento focável do documento. Com navbar fixa e uma página
          longa de âncoras, quem navega por teclado tinha de passar pelos cinco
          controles da navegação a cada visita antes de alcançar o conteúdo.
          Fica fora da tela até receber foco (ver `.skip-link` em globals.css).

          `data-native-anchor` pede ao SmoothScroll que não intercepte este
          clique: o foco só se move pela navegação de fragmento nativa, que o
          preventDefault dele cancelaria — ver o comentário lá.
        */}
        <a href="#conteudo" data-native-anchor className="skip-link">
          Pular para o conteúdo
        </a>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
