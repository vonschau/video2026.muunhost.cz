import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex h-3 w-full" aria-hidden="true">
        <span className="flex-[2] bg-unhost-blue" />
        <span className="flex-1 bg-unhost-gold" />
        <span className="flex-[2] bg-unhost-green" />
        <span className="flex-1 bg-unhost-gold" />
        <span className="flex-[2] bg-unhost-blue" />
      </div>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <Image
          src="/znak-mesta.jpg"
          alt="Znak města Unhošť"
          width={720}
          height={720}
          priority
          className="h-auto w-48 sm:w-56"
        />
        <p className="mt-8 text-sm font-semibold tracking-[0.18em] text-unhost-blue uppercase">
          Promítání 2026
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-unhost-navy sm:text-5xl">
          Stránka se připravuje
        </h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-ink">
          Připravujeme místo, kam budete moci nahrát video pro promítání
          v&nbsp;Unhošti v&nbsp;roce 2026.
        </p>
      </main>

      <footer className="px-6 py-6 text-center text-sm text-unhost-navy/70">
        Město Unhošť
      </footer>
    </div>
  );
}
