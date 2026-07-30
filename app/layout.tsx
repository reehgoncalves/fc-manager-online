import type { Metadata } from "next";
import "./globals.css";
import "./experience.css";
import "./light-skin.css";
import "./live-match.css";
import "./social-skin.css";
import "./landing-skin.css";
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
        <link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
