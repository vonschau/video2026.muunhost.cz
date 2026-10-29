import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { UploadForm } from "@/components/upload-form";
import { DEADLINE_LABEL } from "@/lib/deadline";
import { EVENT_NAME } from "@/lib/event";
import { tie } from "@/lib/tie";

export const metadata: Metadata = {
  description: tie(
    `${EVENT_NAME}. Pošlete video. Výzva platí do ${DEADLINE_LABEL}. Film se 1. ledna 2027 promítá na náměstí.`,
  ),
};

const steps = [
  "Nahrajete video a necháte na sebe kontakt.",
  "Tonda Mittelbach z příspěvků sestříhá film.",
  "1. ledna 2027 se promítá na náměstí.",
];

export default function Home() {
  return (
    <SiteFrame>
      <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
        <p className="text-sm font-semibold tracking-[0.16em] text-unhost-blue uppercase">
          Výzva pro obyvatele
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-unhost-navy sm:text-5xl">
          {EVENT_NAME}
        </h1>
        <p className="mt-6 rounded-2xl bg-unhost-gold px-5 py-4 text-lg font-bold leading-snug text-unhost-navy sm:text-xl">
          Výzva platí do {DEADLINE_LABEL}
        </p>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            Hledáme záběry z akcí, ulic, zahrad, obyčejných dnů i z domů.
            Nemusí být profesionální, hodí se i záznam z telefonu. Z
            vybraných příspěvků Tonda Mittelbach sestříhá souhrnné video, které
            se 1. ledna 2027 tradičně promítá na náměstí.
          </p>
          <p>
            Jedno video může mít nejvýše 2&nbsp;GB. Videa přijímáme do {DEADLINE_LABEL}.
            Ne každý záběr se do filmu vejde. Surové nahrávky nezveřejňujeme.
          </p>
        </div>

        <ol className="mt-10 flex list-none flex-col p-0 sm:flex-row">
          {steps.map((text, index) => {
            const last = index === steps.length - 1;
            return (
              <li
                key={text}
                className="flex flex-1 items-center gap-4 pb-8 last:pb-0 sm:flex-col sm:gap-3 sm:pb-0 sm:text-center"
              >
                <div className="relative flex w-12 shrink-0 justify-center sm:w-full sm:items-center">
                  <span
                    aria-hidden="true"
                    className={`hidden h-0.5 flex-1 sm:block ${index === 0 ? "bg-transparent" : "bg-unhost-blue"}`}
                  />
                  <span className="relative z-10 flex size-12 items-center justify-center rounded-full border-4 border-unhost-gold bg-unhost-navy text-base font-bold text-white">
                    {index + 1}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`hidden h-0.5 flex-1 sm:block ${last ? "bg-transparent" : "bg-unhost-blue"}`}
                  />
                  {last ? null : (
                    <span
                      aria-hidden="true"
                      className="absolute top-12 -bottom-8 left-1/2 w-0.5 -translate-x-1/2 bg-unhost-blue sm:hidden"
                    />
                  )}
                </div>
                <p className="flex min-h-12 items-center text-sm leading-6 text-ink sm:block sm:min-h-0 sm:px-3">
                  {text}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-unhost-navy">Nahrát video</h2>
          <p className="mt-2 font-semibold text-unhost-navy">
            Výzva platí do {DEADLINE_LABEL}.
          </p>
          <div className="mt-6">
            <UploadForm />
          </div>
        </div>
      </main>
    </SiteFrame>
  );
}
