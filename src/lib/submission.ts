import { CONSENT_VERSION, consentFields, type ConsentKey } from "@/lib/consent";
import { closedMessage, submissionsClosed } from "@/lib/deadline";
import { czechPhone } from "@/lib/phone";
import { MAX_VIDEO_BYTES, videoFileName } from "@/lib/video";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SubmissionStatus = "pending" | "complete";

export const MAX_DESCRIPTION_LENGTH = 1000;

export type SubmissionRecord = {
  recordVersion: 1;
  id: string;
  status: SubmissionStatus;
  createdAt: string;
  completedAt: string | null;
  name: string;
  email: string;
  phone: string;
  description: string;
  consentVersion: string;
  consentText: Record<ConsentKey, string>;
  userAgent: string;
  fileName: string;
  contentType: string;
  declaredSize: number;
  pathname: string;
  byteSize: number | null;
};

export type DraftInput = {
  name: string;
  email: string;
  phone: string;
  description: string;
  originalName: string;
  fileSize: number;
  consentVersion: string;
  consents: Record<ConsentKey, boolean>;
};

export function isSubmissionId(value: string): boolean {
  return UUID.test(value);
}

export function draftPath(id: string): string {
  return `drafts/${id}.json`;
}

export function submissionPath(id: string): string {
  return `submissions/${id}.json`;
}

export function videoPath(id: string, fileName: string): string {
  return `videos/${id}/${fileName}`;
}

export function validateDraft(input: DraftInput): string | null {
  if (submissionsClosed()) return closedMessage();

  const name = cleanName(input.name);
  if (name.length < 2) return "Napište jméno a příjmení.";
  if (name.length > 120) return "Jméno je příliš dlouhé.";

  const email = input.email.trim().toLowerCase();
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Napište e-mail, na který se vám dá ozvat.";
  }

  const phone = czechPhone(input.phone);
  if (!phone) return "Napište telefon, na který se vám dá ozvat.";

  const description = cleanDescription(input.description);
  if (description.length < 3) return "Napište, co je na videu.";
  if (description.length > MAX_DESCRIPTION_LENGTH) return "Popis videa je příliš dlouhý.";

  if (!videoFileName(input.originalName)) {
    return "Video nahrajte jako MP4, MOV, WebM, MKV, AVI, MPEG nebo 3GP.";
  }

  if (!Number.isFinite(input.fileSize) || input.fileSize <= 0) {
    return "Soubor je prázdný.";
  }

  if (input.fileSize > MAX_VIDEO_BYTES) {
    return "Video může mít nejvýše 2 GB.";
  }

  if (input.consentVersion !== CONSENT_VERSION) {
    return "Stránka se mezitím změnila. Obnovte ji a odešlete formulář znovu.";
  }

  for (const field of consentFields) {
    if (input.consents[field.key] !== true) {
      return "Bez všech čtyř potvrzení video nemůžeme přijmout.";
    }
  }

  return null;
}

export function normalizeDraft(input: DraftInput): Omit<
  SubmissionRecord,
  "id" | "createdAt" | "userAgent" | "pathname" | "status" | "completedAt" | "byteSize"
> {
  const file = videoFileName(input.originalName);
  if (!file) {
    throw new Error("Neplatný soubor.");
  }

  const phone = czechPhone(input.phone);
  if (!phone) throw new Error("Napište telefon, na který se vám dá ozvat.");

  return {
    recordVersion: 1,
    name: cleanName(input.name),
    email: input.email.trim().toLowerCase(),
    phone,
    description: cleanDescription(input.description),
    consentVersion: CONSENT_VERSION,
    consentText: Object.fromEntries(
      consentFields.map((field) => [field.key, field.text]),
    ) as Record<ConsentKey, string>,
    fileName: file.fileName,
    contentType: file.contentType,
    declaredSize: input.fileSize,
  };
}

export function isSubmissionRecord(value: unknown): value is SubmissionRecord {
  if (!isRecord(value)) return false;
  if (value.recordVersion !== 1) return false;
  if (typeof value.id !== "string" || !isSubmissionId(value.id)) return false;
  if (value.status !== "pending" && value.status !== "complete") return false;
  if (typeof value.createdAt !== "string") return false;
  if (value.completedAt !== null && typeof value.completedAt !== "string") return false;
  if (typeof value.name !== "string") return false;
  if (typeof value.email !== "string") return false;
  if (typeof value.phone !== "string") return false;
  if (typeof value.description !== "string") return false;
  if (typeof value.consentVersion !== "string") return false;
  if (!isRecord(value.consentText)) return false;
  if (typeof value.userAgent !== "string") return false;
  if (typeof value.fileName !== "string") return false;
  if (typeof value.contentType !== "string") return false;
  if (typeof value.declaredSize !== "number") return false;
  if (typeof value.pathname !== "string") return false;
  if (value.byteSize !== null && typeof value.byteSize !== "number") return false;
  return true;
}

export function cleanName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function cleanDescription(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
