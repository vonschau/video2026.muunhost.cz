import { consentFields, type ConsentKey } from "@/lib/consent";
import { citizenMessage, jsonError, noStoreJson } from "@/lib/http";
import { deleteExpiredDrafts, saveDraft } from "@/lib/records";
import {
  isSubmissionId,
  normalizeDraft,
  validateDraft,
  videoPath,
  type DraftInput,
} from "@/lib/submission";

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Formulář se nepodařilo přečíst.", 400);
  }

  if (isFilledHoneypot(payload)) {
    return jsonError("Formulář se nepodařilo odeslat.", 400);
  }

  const input = parseDraft(payload);
  if (!input) return jsonError("Formulář není kompletní.", 400);

  const problem = validateDraft(input);
  if (problem) return jsonError(problem, 400);

  const id = crypto.randomUUID();
  if (!isSubmissionId(id)) return jsonError("Příspěvek se nepodařilo založit.", 500);

  const normalized = normalizeDraft(input);
  const record = {
    ...normalized,
    id,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    completedAt: null,
    userAgent: (request.headers.get("user-agent") ?? "").slice(0, 300),
    pathname: videoPath(id, normalized.fileName),
    byteSize: null,
  };

  try {
    await saveDraft(record);
    try {
      await deleteExpiredDrafts();
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
    return jsonError(
      citizenMessage(error, "Příspěvek se nepodařilo založit. Zkuste to prosím znovu."),
      503,
    );
  }

  return noStoreJson({
    id: record.id,
    pathname: record.pathname,
    contentType: record.contentType,
  });
}

function isFilledHoneypot(value: unknown): boolean {
  return isRecord(value) && typeof value.fax === "string" && value.fax.trim() !== "";
}

function parseDraft(value: unknown): DraftInput | null {
  if (!isRecord(value)) return null;
  if (!isRecord(value.consents)) return null;

  const consents = {} as Record<ConsentKey, boolean>;
  for (const field of consentFields) {
    consents[field.key] = value.consents[field.key] === true;
  }

  if (
    typeof value.name !== "string" ||
    typeof value.email !== "string" ||
    typeof value.phone !== "string" ||
    typeof value.originalName !== "string" ||
    typeof value.fileSize !== "number" ||
    typeof value.consentVersion !== "string"
  ) {
    return null;
  }

  return {
    name: value.name,
    email: value.email,
    phone: value.phone,
    originalName: value.originalName,
    fileSize: value.fileSize,
    consentVersion: value.consentVersion,
    consents,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
