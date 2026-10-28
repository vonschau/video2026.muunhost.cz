import type { Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import "./globals.css";

const libreFranklin = Libre_Franklin({
  subsets: ["latin", "latin-ext"],
  variable: "--font-libre",
});

export const metadata: Metadata = {
  title: "Video 2026 | Město Unhošť",
  description:
    "Stránka pro nahrávání osobních videí o životě v Unhošti v roce 2026 se připravuje. Videa se mohou zařadit do promítání 1. ledna 2027 na náměstí.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${libreFranklin.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
