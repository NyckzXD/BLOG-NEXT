import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="pt-br" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
