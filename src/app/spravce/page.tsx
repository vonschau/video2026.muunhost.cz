import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminGate } from "@/components/admin-gate";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = {
  title: "Správa videí",
  robots: { index: false, follow: false },
};

export default function SpravcePage({
  searchParams,
}: {
  searchParams: Promise<{ chyba?: string }>;
}) {
  return (
    <SiteFrame>
      <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
        <Suspense fallback={<p className="text-ink">Načítám správu…</p>}>
          <AdminGate searchParams={searchParams} />
        </Suspense>
      </main>
    </SiteFrame>
  );
}
