import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Tied } from "@/components/tied";
import { EVENT_NAME } from "@/lib/event";

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex h-3 w-full" aria-hidden="true">
        <span className="flex-[2] bg-unhost-blue" />
        <span className="flex-1 bg-unhost-gold" />
        <span className="flex-[2] bg-unhost-green" />
        <span className="flex-1 bg-unhost-gold" />
        <span className="flex-[2] bg-unhost-blue" />
      </div>

      <header className="border-b border-unhost-navy/10">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-6 py-5">
          <Link href="/" className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-unhost-blue">
            <Image
              src="/znak-mesta.jpg"
              alt="Znak města Unhošť"
              width={720}
              height={720}
              priority
              className="h-16 w-16 object-contain"
            />
          </Link>
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-unhost-blue uppercase">
              Město Unhošť
            </p>
            <Link href="/" className="text-lg font-bold leading-tight tracking-tight text-unhost-navy sm:text-xl">
              {EVENT_NAME}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <Tied>{children}</Tied>
      </div>

      <footer className="border-t border-unhost-navy/10 px-6 py-8 text-sm leading-6 text-unhost-navy/80">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>Město Unhošť, Václavské náměstí 44, 273 51 Unhošť</p>
          <p>
            <Link href="/ochrana-udaju" className="underline decoration-unhost-blue/40 underline-offset-4 hover:decoration-unhost-blue">
              Ochrana osobních údajů
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
