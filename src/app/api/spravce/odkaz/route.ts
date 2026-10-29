import { getDownloadUrl, issueSignedToken, presignUrl } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import { jsonError, noStoreJson } from "@/lib/http";
import { readSubmission } from "@/lib/records";
import { isSubmissionId } from "@/lib/submission";

const LINK_MS = 30 * 60 * 1000;

type Purpose = "play" | "download";

export async function POST(request: Request): Promise<Response> {
  if (!(await isAdmin())) return jsonError("Přihlaste se znovu.", 401);

  let id = "";
  let purpose: Purpose = "play";
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      return jsonError("Chybí video.", 400);
    }
    if ("id" in body && typeof body.id === "string") id = body.id;
    if ("purpose" in body && body.purpose === "download") purpose = "download";
    if ("purpose" in body && body.purpose !== "play" && body.purpose !== "download") {
      return jsonError("Neznámý požadavek.", 400);
    }
  } catch {
    return jsonError("Chybí video.", 400);
  }

  if (!isSubmissionId(id)) return jsonError("Video neexistuje.", 404);

  const submission = await readSubmission(id);
  if (!submission || submission.status !== "complete") {
    return jsonError("Video neexistuje.", 404);
  }

  try {
    const validUntil = Date.now() + LINK_MS;
    const token = await issueSignedToken({
      pathname: submission.pathname,
      operations: ["get"],
      validUntil,
    });
    const { presignedUrl } = await presignUrl(token, {
      operation: "get",
      access: "private",
      pathname: submission.pathname,
      validUntil,
    });

    const url = purpose === "download" ? getDownloadUrl(presignedUrl) : presignedUrl;
    return noStoreJson({ url });
  } catch (error) {
    console.error(error);
    return jsonError("Odkaz na video se nepodařilo vytvořit.", 500);
  }
}
