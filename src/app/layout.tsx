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
    "Stránka pro nahrávání videí k promítání v Unhošti v roce 2026 se připravuje.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${libreFranklin.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
