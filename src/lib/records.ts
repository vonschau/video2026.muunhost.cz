import {
  BlobNotFoundError,
  del,
  get,
  head,
  list,
  put,
} from "@vercel/blob";
import {
  draftPath,
  isSubmissionId,
  isSubmissionRecord,
  submissionPath,
  type SubmissionRecord,
} from "@/lib/submission";
import { MAX_VIDEO_BYTES } from "@/lib/video";

const DRAFT_TTL_MS = 48 * 60 * 60 * 1000;
const PRIVATE = { access: "private" as const };

export async function saveDraft(record: SubmissionRecord): Promise<void> {
  await put(draftPath(record.id), JSON.stringify(record), {
    ...PRIVATE,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: false,
  });
}

export async function readDraft(id: string): Promise<SubmissionRecord | null> {
  if (!isSubmissionId(id)) return null;
  return readRecord(draftPath(id));
}

export async function readSubmission(id: string): Promise<SubmissionRecord | null> {
  if (!isSubmissionId(id)) return null;
  return readRecord(submissionPath(id));
}

export async function deleteDraft(record: SubmissionRecord): Promise<void> {
  if (record.status !== "pending") return;
  await removeIfExists(record.pathname);
  await removeIfExists(draftPath(record.id));
}

export async function discardIfUnclaimed(id: string, pathname: string): Promise<void> {
  if (await readSubmission(id)) return;
  if (await readDraft(id)) return;
  await removeIfExists(pathname);
}

export async function deleteExpiredDrafts(): Promise<void> {
  const now = Date.now();
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: "drafts/", cursor, limit: 1000 });
    for (const blob of page.blobs) {
      if (now - blob.uploadedAt.getTime() < DRAFT_TTL_MS) continue;
      const id = blob.pathname.slice("drafts/".length, -".json".length);
      const draft = await readDraft(id);
      if (draft?.status === "pending") {
        await deleteDraft(draft);
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
}

export async function completeSubmission(
  id: string,
  pathname: string,
): Promise<SubmissionRecord> {
  const existing = await readSubmission(id);
  if (existing?.status === "complete" && existing.pathname === pathname) {
    return existing;
  }

  const draft = await readDraft(id);
  if (!draft || draft.status !== "pending") {
    throw new Error("Příspěvek neexistuje nebo už byl odeslaný.");
  }
  if (draft.pathname !== pathname) {
    throw new Error("Nahraný soubor k příspěvku nepatří.");
  }
  if (Date.now() - Date.parse(draft.createdAt) > DRAFT_TTL_MS) {
    await deleteDraft(draft);
    throw new Error("Čas na nahrání vypršel. Odešlete formulář znovu.");
  }

  const meta = await head(pathname);
  if (meta.size <= 0 || meta.size > MAX_VIDEO_BYTES) {
    throw new Error("Video může mít nejvýše 2 GB.");
  }
  if (meta.contentType !== draft.contentType && !meta.contentType.startsWith("video/")) {
    throw new Error("Nahraný soubor není video.");
  }

  const complete: SubmissionRecord = {
    ...draft,
    status: "complete",
    completedAt: new Date().toISOString(),
    byteSize: meta.size,
    contentType: meta.contentType || draft.contentType,
  };

  await put(submissionPath(id), JSON.stringify(complete), {
    ...PRIVATE,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  await removeIfExists(draftPath(id));
  return complete;
}

export async function listCompleteSubmissions(): Promise<SubmissionRecord[]> {
  const records: SubmissionRecord[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: "submissions/", cursor, limit: 1000 });
    const loaded = await mapPool(page.blobs, 8, async (blob) => {
      const id = blob.pathname.slice("submissions/".length, -".json".length);
      return readSubmission(id);
    });
    for (const record of loaded) {
      if (record?.status === "complete") records.push(record);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  records.sort((left, right) => {
    const leftTime = Date.parse(left.completedAt ?? left.createdAt);
    const rightTime = Date.parse(right.completedAt ?? right.createdAt);
    return rightTime - leftTime;
  });

  return records;
}

async function readRecord(pathname: string): Promise<SubmissionRecord | null> {
  try {
    const result = await get(pathname, PRIVATE);
    if (!result || result.statusCode !== 200) return null;
    const text = await new Response(result.stream).text();
    const parsed: unknown = JSON.parse(text);
    return isSubmissionRecord(parsed) ? parsed : null;
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

async function removeIfExists(pathname: string): Promise<void> {
  try {
    await del(pathname);
  } catch (error) {
    if (error instanceof BlobNotFoundError) return;
    const message = error instanceof Error ? error.message : "";
    if (/not found/i.test(message)) return;
    throw error;
  }
}

async function mapPool<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const current = next;
      next += 1;
      const item = items[current];
      if (item === undefined) continue;
      results[current] = await fn(item);
    }
  }

  const workers = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}
