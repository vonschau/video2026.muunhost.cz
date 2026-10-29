import { BlobAccessError, BlobStoreNotFoundError } from "@vercel/blob";
import { tie } from "@/lib/tie";

export function jsonError(message: string, status: number): Response {
  return Response.json(
    { error: tie(message) },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function noStoreJson(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function citizenMessage(error: unknown, fallback: string): string {
  if (error instanceof BlobStoreNotFoundError || error instanceof BlobAccessError) {
    return "Úložiště videí teď není dostupné. Napište prosím na městský úřad.";
  }

  if (!(error instanceof Error)) return fallback;

  if (/token|secret|blob_|oidc|store id|vercel/i.test(error.message)) {
    return "Úložiště videí teď není dostupné. Napište prosím na městský úřad.";
  }

  if (/^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9„"]/.test(error.message)) {
    return error.message;
  }

  return fallback;
}
