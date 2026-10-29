import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { citizenMessage, jsonError } from "@/lib/http";
import {
  completeSubmission,
  deleteDraft,
  discardIfUnclaimed,
  readDraft,
} from "@/lib/records";
import { isSubmissionId } from "@/lib/submission";
import { ALLOWED_CONTENT_TYPES, MAX_VIDEO_BYTES } from "@/lib/video";

export const maxDuration = 60;

const TOKEN_MS = 3 * 60 * 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return jsonError("Nahrání se nepodařilo zahájit.", 400);
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const submissionId = readSubmissionId(clientPayload);
        const draft = await readDraft(submissionId);
        if (!draft || draft.status !== "pending") {
          throw new Error("Příspěvek neexistuje nebo už byl odeslaný.");
        }
        if (pathname !== draft.pathname) {
          throw new Error("Neplatná cesta souboru.");
        }
        if (Date.now() - Date.parse(draft.createdAt) > 48 * 60 * 60 * 1000) {
          await deleteDraft(draft);
          throw new Error("Čas na nahrání vypršel. Odešlete formulář znovu.");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          validUntil: Date.now() + TOKEN_MS,
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60 * 60,
          tokenPayload: JSON.stringify({ submissionId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const submissionId = readSubmissionId(tokenPayload);
        try {
          await completeSubmission(submissionId, blob.pathname);
        } catch (error) {
          await discardIfUnclaimed(submissionId, blob.pathname);
          if (await readDraft(submissionId)) throw error;
        }
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error(error);
    return jsonError(
      citizenMessage(error, "Nahrání se nepodařilo zahájit."),
      400,
    );
  }
}

function readSubmissionId(payload: string | null | undefined): string {
  if (!payload) throw new Error("Chybí identifikátor příspěvku.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error("Chybí identifikátor příspěvku.");
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("submissionId" in parsed) ||
    typeof parsed.submissionId !== "string" ||
    !isSubmissionId(parsed.submissionId)
  ) {
    throw new Error("Chybí identifikátor příspěvku.");
  }
  return parsed.submissionId;
}
