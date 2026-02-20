import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://boardroomai.app"),
  title: "BoardRoom AI — Multi-Agent Decision Engine",
  description:
    "6 AI board members analyze your project, debate disagreements, and deliver a structured decision report. Powered by LLMs.",
  openGraph: {
    title: "BoardRoom AI — Multi-Agent Decision Engine",
    description:
      "Your AI-powered executive committee. Submit a decision, watch 6 board members debate in real-time.",
    url: "https://boardroomai.app",
    siteName: "BoardRoom AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BoardRoom AI — Multi-Agent Decision Engine",
    description:
      "Your AI-powered executive committee. Submit a decision, watch 6 board members debate in real-time.",
    creator: "@evolved_monkey_",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="scanlines min-h-screen">{children}</body>
    </html>
  );
}
