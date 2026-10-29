import type { Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import { DEADLINE_LABEL } from "@/lib/deadline";
import { EVENT_NAME } from "@/lib/event";
import { tie } from "@/lib/tie";
import "./globals.css";

const libreFranklin = Libre_Franklin({
  subsets: ["latin", "latin-ext"],
  variable: "--font-libre",
});

export const metadata: Metadata = {
  title: {
    default: EVENT_NAME,
    template: "%s | Město Unhošť",
  },
  description: tie(
    `${EVENT_NAME}. Pošlete video. Výzva platí do ${DEADLINE_LABEL}. Film se 1. ledna 2027 promítá na náměstí.`,
  ),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${libreFranklin.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
