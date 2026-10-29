"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { PrivacyNotice } from "@/components/privacy-notice";
import { Tied } from "@/components/tied";
import { CONSENT_VERSION, consentFields, type ConsentKey } from "@/lib/consent";
import {
  ACCEPTED_EXTENSIONS,
  formatBytes,
  MAX_VIDEO_BYTES,
  videoFileName,
} from "@/lib/video";
import { czechPhone, formatNationalPhone, nationalPhoneDigits } from "@/lib/phone";
import { MAX_DESCRIPTION_LENGTH, validateDraft, type DraftInput } from "@/lib/submission";

const fieldClass =
  "w-full rounded-lg border border-unhost-navy/20 bg-white px-3 py-3 text-base text-ink outline-none focus:border-unhost-blue focus:ring-2 focus:ring-unhost-blue/30";

type UploadPhase = "idle" | "uploading" | "finishing" | "done";

type PendingFinish = {
  id: string;
  pathname: string;
};

export function UploadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({
    age: false,
    personalData: false,
    license: false,
    rights: false,
  });
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [percent, setPercent] = useState(0);
  const [pendingFinish, setPendingFinish] = useState<PendingFinish | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = phase === "uploading" || phase === "finishing";

  function chooseFile(next: File | null) {
    setError(null);
    setPendingFinish(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (!videoFileName(next.name)) {
      setFile(null);
      setError("Video nahrajte jako MP4, MOV, WebM, MKV, AVI, MPEG nebo 3GP.");
      return;
    }
    if (next.size > MAX_VIDEO_BYTES) {
      setFile(null);
      setError("Video může mít nejvýše 2 GB.");
      return;
    }
    setFile(next);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files;
    if (dropped.length > 1) {
      setError("Nahrajte jedno video.");
      return;
    }
    chooseFile(dropped.item(0));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!file) {
      setError("Vyberte video.");
      return;
    }

    const faxField = new FormData(event.currentTarget).get("fax");
    const fax = typeof faxField === "string" ? faxField : "";
    const input = draftInput(file, { name, email, phone, description, consents });
    const problem = validateDraft(input);
    if (problem) {
      setError(problem);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setPendingFinish(null);
    setLoaded(0);
    setTotal(file.size);
    setPercent(0);
    setPhase("uploading");

    let submissionId: string | null = null;
    let uploadedPath: string | null = null;

    try {
      const draft = await createDraft(input, fax, controller.signal);
      submissionId = draft.id;
      const blob = await upload(draft.pathname, file, {
        access: "private",
        handleUploadUrl: "/api/upload",
        contentType: draft.contentType,
        multipart: file.size > 4 * 1024 * 1024,
        clientPayload: JSON.stringify({ submissionId: draft.id }),
        abortSignal: controller.signal,
        onUploadProgress: ({ loaded: nextLoaded, total: nextTotal, percentage }) => {
          setLoaded(nextLoaded);
          setTotal(nextTotal);
          setPercent(Math.round(percentage));
        },
      });
      uploadedPath = blob.pathname;
      setPhase("finishing");
      await finishSubmission(draft.id, blob.pathname, controller.signal);
      setPhase("done");
    } catch (caught) {
      if (controller.signal.aborted) {
        if (submissionId) await discardDraft(submissionId);
        setPhase("idle");
        setError("Nahrávání je zrušené. Video jsme neuložili.");
        return;
      }

      if (submissionId && uploadedPath) {
        setPendingFinish({ id: submissionId, pathname: uploadedPath });
        setPhase("idle");
        setError(
          "Video se nahrálo, ale nepodařilo se ho zařadit. Nezavírejte stránku a zkuste dokončení znovu.",
        );
        return;
      }

      if (submissionId) await discardDraft(submissionId);
      setPhase("idle");
      setError(uploadErrorMessage(caught));
    } finally {
      abortRef.current = null;
    }
  }

  async function retryFinish() {
    if (!pendingFinish) return;
    setError(null);
    setPhase("finishing");
    try {
      await finishSubmission(pendingFinish.id, pendingFinish.pathname);
      setPendingFinish(null);
      setPhase("done");
    } catch (caught) {
      setPhase("idle");
      setError(caught instanceof Error ? caught.message : "Dokončení se nepovedlo.");
    }
  }

  function cancelUpload() {
    abortRef.current?.abort();
  }

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setDescription("");
    setFile(null);
    setConsents({ age: false, personalData: false, license: false, rights: false });
    setError(null);
    setPendingFinish(null);
    setPhase("idle");
    setPercent(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (phase === "done") {
    return (
      <Tied>
      <section className="rounded-2xl border border-unhost-green/30 bg-unhost-green/10 p-6 sm:p-8" aria-live="polite">
        <h2 className="text-2xl font-bold text-unhost-navy">Video je u města</h2>
        <p className="mt-3 max-w-xl leading-7 text-ink">
          Díky. Podíváme se na něj a když se bude hodit, Tonda Mittelbach ho
          zařadí do souhrnného videa. Ne každý záběr se do filmu vejde. Když
          budeme potřebovat něco upřesnit, ozveme se na e-mail nebo telefon,
          který jste uvedli.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex rounded-full bg-unhost-navy px-5 py-3 text-base font-semibold text-white hover:bg-unhost-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-unhost-blue"
        >
          Nahrát další video
        </button>
      </section>
      </Tied>
    );
  }

  return (
    <Tied>
    <form onSubmit={onSubmit} noValidate className="relative space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block font-semibold text-unhost-navy">Jméno a příjmení</span>
          <input
            className={fieldClass}
            name="name"
            autoComplete="name"
            value={name}
            disabled={busy}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-semibold text-unhost-navy">E-mail</span>
          <input
            className={fieldClass}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            disabled={busy}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-semibold text-unhost-navy">Telefon</span>
          <div
            className={`flex overflow-hidden rounded-lg border border-unhost-navy/20 bg-white focus-within:border-unhost-blue focus-within:ring-2 focus-within:ring-unhost-blue/30 ${busy ? "opacity-70" : ""}`}
          >
            <span className="flex items-center border-r border-unhost-navy/15 bg-unhost-navy/[0.04] px-3 font-semibold tracking-wide text-unhost-navy">
              +420
            </span>
            <input
              className="w-full bg-transparent px-3 py-3 text-base text-ink outline-none disabled:cursor-not-allowed"
              type="tel"
              name="phone"
              autoComplete="tel-national"
              inputMode="tel"
              placeholder="123 456 789"
              value={phone}
              disabled={busy}
              onChange={(event) =>
                setPhone(formatNationalPhone(nationalPhoneDigits(event.target.value)))
              }
              required
            />
          </div>
        </label>
      </div>

      <div>
        <p className="mb-2 font-semibold text-unhost-navy">Video</p>
        <label
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-unhost-gold bg-unhost-gold/20"
              : "border-unhost-blue/40 bg-unhost-blue/[0.04] hover:border-unhost-blue"
          } ${busy ? "pointer-events-none opacity-70" : ""}`}
        >
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept={`${ACCEPTED_EXTENSIONS},video/*`}
            disabled={busy}
            onChange={(event) => chooseFile(event.target.files?.item(0) ?? null)}
          />
          {file ? (
            <>
              <span className="text-lg font-semibold text-unhost-navy">{file.name}</span>
              <span className="mt-1 text-ink">{formatBytes(file.size)}</span>
              <span className="mt-4 text-sm font-semibold text-unhost-blue">Vybrat jiné video</span>
            </>
          ) : (
            <>
              <span className="text-lg font-semibold text-unhost-navy">
                Přetáhněte video sem
              </span>
              <span className="mt-2 text-ink">nebo ho vyberte z telefonu či počítače</span>
              <span className="mt-4 text-sm text-unhost-navy/70">
                MP4, MOV, WebM, MKV, AVI, MPEG, 3GP · nejvýše {formatBytes(MAX_VIDEO_BYTES)}
              </span>
            </>
          )}
        </label>
        {file ? (
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-unhost-navy underline decoration-unhost-navy/30 underline-offset-4"
            onClick={() => {
              chooseFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            disabled={busy}
          >
            Odebrat soubor
          </button>
        ) : null}
      </div>

      <label className="block">
        <span className="mb-2 block font-semibold text-unhost-navy">Popis videa</span>
        <textarea
          className={`${fieldClass} min-h-28 resize-y`}
          name="description"
          rows={3}
          maxLength={MAX_DESCRIPTION_LENGTH}
          placeholder={"Den dětí u\u00A0Bulharu, Masopust, …"}
          value={description}
          disabled={busy}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </label>

      <div hidden aria-hidden="true">
        <label>
          Fax
          <input
            tabIndex={-1}
            autoComplete="off"
            name="fax"
            defaultValue=""
          />
        </label>
      </div>

      <div className="rounded-2xl border border-unhost-navy/10 bg-unhost-navy/[0.03] p-5 sm:p-6">
        <h2 className="text-lg font-bold text-unhost-navy">Než video odešlete</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
          <li>Správce je město Unhošť, Václavské náměstí 44. Pověřenec: muunhost.dpo@keystonecompany.cz.</li>
          <li>Video slouží k posouzení, případnému střihu a promítnutí 1.&nbsp;ledna 2027 na náměstí. Ne každé se do filmu dostane.</li>
          <li>
            Surovou nahrávku uvidí úřad, Antonín Mittelbach a Martin Cajthaml,
            tvůrce této stránky. Veřejně na internetu neleží.
          </li>
          <li>Soubor se ukládá v EU (Frankfurt nad Mohanem) u Vercel Inc. Firma sídlí v USA, proto může jít o předání mimo EU, kryté EU-US Data Privacy Framework a standardními smluvními doložkami.</li>
          <li>Kontakt, popis a video mažeme do 31.&nbsp;března 2027. Souhlas můžete odvolat. Už proběhlé promítání vzít zpět nejde.</li>
        </ul>
        <details className="mt-4">
          <summary className="cursor-pointer font-semibold text-unhost-blue">
            Celé informace o zpracování osobních údajů
          </summary>
          <div className="mt-5">
            <PrivacyNotice />
          </div>
        </details>
      </div>

      <fieldset className="space-y-4" disabled={busy}>
        <legend className="text-lg font-bold text-unhost-navy">Potvrzení</legend>
        <p className="text-sm leading-6 text-ink">
          Čtyři samostatné věci: že formulář můžete vyplnit, souhlas se
          zpracováním údajů, licence k videu a prohlášení, že k záznamu máte
          práva. Všechna jsou nutná, jinak video nepřijmeme. Žádné není předem
          zaškrtnuté.
        </p>
        {consentFields.map((field) => (
          <label key={field.key} className="flex items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0 accent-unhost-blue"
              checked={consents[field.key]}
              onChange={(event) =>
                setConsents((current) => ({ ...current, [field.key]: event.target.checked }))
              }
            />
            <span>{field.text}</span>
          </label>
        ))}
      </fieldset>

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
          {error}
        </p>
      ) : null}

      {phase === "uploading" || phase === "finishing" ? (
        <div aria-live="polite">
          <div className="flex items-end justify-between gap-4">
            <p className="text-4xl font-bold tabular-nums text-unhost-navy">
              {phase === "finishing" ? "…" : `${percent}\u00a0%`}
            </p>
            <p className="text-sm text-ink">
              {phase === "finishing"
                ? "Video je nahrané, ukládáme k němu vaše údaje."
                : `${formatBytes(loaded)} z ${formatBytes(total || file?.size || 0)}`}
            </p>
          </div>
          <div
            className="mt-3 h-3 overflow-hidden rounded-full bg-unhost-navy/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={phase === "finishing" ? 100 : percent}
            aria-label="Průběh nahrávání"
          >
            <div
              className="h-full bg-unhost-blue motion-reduce:transition-none transition-[width] duration-200"
              style={{ width: `${phase === "finishing" ? 100 : percent}%` }}
            />
          </div>
          {phase === "uploading" ? (
            <button
              type="button"
              onClick={cancelUpload}
              className="mt-4 text-sm font-semibold text-unhost-navy underline decoration-unhost-navy/30 underline-offset-4"
            >
              Zrušit nahrávání
            </button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="inline-flex rounded-full bg-unhost-gold px-6 py-3 text-base font-bold text-unhost-navy hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-unhost-navy"
          >
            Odeslat video
          </button>
          {pendingFinish ? (
            <button
              type="button"
              onClick={retryFinish}
              className="inline-flex rounded-full border border-unhost-navy px-5 py-3 text-base font-semibold text-unhost-navy"
            >
              Dokončit zařazení
            </button>
          ) : null}
        </div>
      )}
    </form>
    </Tied>
  );
}

function draftInput(
  file: File,
  values: {
    name: string;
    email: string;
    phone: string;
    description: string;
    consents: Record<ConsentKey, boolean>;
  },
): DraftInput {
  return {
    name: values.name,
    email: values.email,
    phone: czechPhone(values.phone) ?? values.phone,
    description: values.description,
    originalName: file.name,
    fileSize: file.size,
    consentVersion: CONSENT_VERSION,
    consents: values.consents,
  };
}

async function createDraft(
  input: DraftInput,
  fax: string,
  signal: AbortSignal,
): Promise<{ id: string; pathname: string; contentType: string }> {
  const response = await fetch("/api/prispevky", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, fax }),
    signal,
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(readError(data, "Příspěvek se nepodařilo založit."));
  }
  if (!isDraftResponse(data)) {
    throw new Error("Příspěvek se nepodařilo založit.");
  }
  return data;
}

async function finishSubmission(id: string, pathname: string, signal?: AbortSignal): Promise<void> {
  const response = await fetch(`/api/prispevky/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pathname }),
    signal,
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(readError(data, "Video se nahrálo, ale nepodařilo se ho zařadit."));
  }
}

async function discardDraft(id: string): Promise<void> {
  await fetch(`/api/prispevky/${id}`, { method: "DELETE" }).catch(() => undefined);
}

function uploadErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Nahrání se nepovedlo. Zkuste to prosím znovu.";
  if (error.name === "AbortError") return "Nahrávání je zrušené. Video jsme neuložili.";
  if (/^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(error.message) && !/token|blob|vercel/i.test(error.message)) {
    return error.message;
  }
  return "Nahrání se nepovedlo. Zkontrolujte připojení a zkuste to znovu.";
}

function readError(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "error" in data && typeof data.error === "string") {
    return data.error;
  }
  return fallback;
}

function isDraftResponse(
  value: unknown,
): value is { id: string; pathname: string; contentType: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "pathname" in value &&
    "contentType" in value &&
    typeof value.id === "string" &&
    typeof value.pathname === "string" &&
    typeof value.contentType === "string"
  );
}
