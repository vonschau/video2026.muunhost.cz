import { login } from "@/app/spravce/actions";
import { Tied } from "@/components/tied";

export function LoginForm({ error }: { error: string | null }) {
  return (
    <Tied>
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold tracking-tight text-unhost-navy">Správa videí</h1>
      <p className="mt-3 leading-7 text-ink">
        Sem vidí Antonín Mittelbach, Martin Cajthaml a úřad.
      </p>
      <form action={login} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block font-semibold text-unhost-navy">Heslo</span>
          <input
            className="w-full rounded-lg border border-unhost-navy/20 px-3 py-3 text-base outline-none focus:border-unhost-blue focus:ring-2 focus:ring-unhost-blue/30"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>
        {error ? (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="rounded-full bg-unhost-navy px-5 py-3 text-base font-semibold text-white hover:bg-unhost-blue"
        >
          Vstoupit
        </button>
      </form>
    </section>
    </Tied>
  );
}
