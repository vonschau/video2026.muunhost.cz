import type { Metadata } from "next";
import { PrivacyNotice } from "@/components/privacy-notice";
import { SiteFrame } from "@/components/site-frame";
import { EVENT_NAME } from "@/lib/event";
import { tie } from "@/lib/tie";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description: tie(
    `Informace o zpracování osobních údajů při nahrávání videí do filmu ${EVENT_NAME}.`,
  ),
};

export default function PrivacyPage() {
  return (
    <SiteFrame>
      <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
        <h1 className="text-4xl font-bold tracking-tight text-unhost-navy">
          Ochrana osobních údajů
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-ink">
          Tohle platí pro videa nahraná na těchto stránkách do filmu {EVENT_NAME}.
        </p>
        <div className="mt-10">
          <PrivacyNotice />
        </div>
      </main>
    </SiteFrame>
  );
}
