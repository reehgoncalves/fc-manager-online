import type { Metadata } from "next";
import "./globals.css";
import "./game-atmosphere.css";

export const metadata: Metadata = {
  title: "FC Manager Online | Gerencie sua lenda",
  description: "Monte o elenco, escale a tática e dispute em tempo real contra managers do mundo todo. Jogue grátis agora.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@400;500;600;700;800;900&family=Sofia+Sans+Condensed:wght@400;500;600;700;800&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
