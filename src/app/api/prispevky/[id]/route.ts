import { citizenMessage, jsonError, noStoreJson } from "@/lib/http";
import { completeSubmission, deleteDraft, readDraft } from "@/lib/records";
import { isSubmissionId } from "@/lib/submission";

export const maxDuration = 60;

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteParams): Promise<Response> {
  const { id } = await context.params;
  if (!isSubmissionId(id)) return jsonError("Příspěvek neexistuje.", 404);

  let pathname = "";
  try {
    const body: unknown = await request.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "pathname" in body &&
      typeof body.pathname === "string"
    ) {
      pathname = body.pathname;
    }
  } catch {
    return jsonError("Dokončení nahrání se nepovedlo.", 400);
  }

  if (!pathname) return jsonError("Chybí nahrané video.", 400);

  try {
    await completeSubmission(id, pathname);
  } catch (error) {
    console.error(error);
    return jsonError(
      citizenMessage(error, "Video se nahrálo, ale nepodařilo se ho zařadit. Zkuste dokončení znovu."),
      400,
    );
  }

  return noStoreJson({ ok: true });
}

export async function DELETE(_request: Request, context: RouteParams): Promise<Response> {
  const { id } = await context.params;
  if (!isSubmissionId(id)) return jsonError("Příspěvek neexistuje.", 404);

  const draft = await readDraft(id);
  if (!draft) return noStoreJson({ ok: true });

  try {
    await deleteDraft(draft);
  } catch (error) {
    console.error(error);
    return jsonError("Rozpracované nahrání se nepodařilo smazat.", 500);
  }

  return noStoreJson({ ok: true });
}
