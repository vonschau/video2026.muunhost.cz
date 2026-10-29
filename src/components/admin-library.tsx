"use client";

import { useState } from "react";
import { Tied } from "@/components/tied";
import { formatBytes } from "@/lib/video";

export type AdminVideo = {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  fileName: string;
  byteSize: number;
  completedAt: string;
};

type LinkState =
  | { status: "idle" }
  | { status: "loading"; id: string; purpose: "play" | "download" }
  | { status: "ready"; id: string; playUrl: string; downloadUrl: string }
  | { status: "error"; id: string; message: string };

export function AdminLibrary({ videos }: { videos: AdminVideo[] }) {
  const [link, setLink] = useState<LinkState>({ status: "idle" });

  async function open(id: string, purpose: "play" | "download") {
    if (
      purpose === "download" &&
      link.status === "ready" &&
      link.id === id &&
      link.downloadUrl
    ) {
      openUrl(link.downloadUrl);
      return;
    }

    setLink({ status: "loading", id, purpose });
    try {
      const playUrl = await requestUrl(id, "play");
      const downloadUrl = await requestUrl(id, "download");
      setLink({ status: "ready", id, playUrl, downloadUrl });
      if (purpose === "download") openUrl(downloadUrl);
    } catch (error) {
      setLink({
        status: "error",
        id,
        message: error instanceof Error ? error.message : "Odkaz se nepodařilo vytvořit.",
      });
    }
  }

  if (videos.length === 0) {
    return (
      <Tied>
        <p className="rounded-2xl border border-dashed border-unhost-navy/20 px-6 py-12 text-center text-ink">
          Zatím nepřišlo žádné dokončené video.
        </p>
      </Tied>
    );
  }

  return (
    <Tied>
    <ul className="space-y-4">
      {videos.map((video) => {
            const active = link.status !== "idle" && link.id === video.id;
        return (
          <li key={video.id} className="rounded-2xl border border-unhost-navy/10 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-unhost-navy">{video.fileName}</h2>
                <p className="mt-1 text-sm text-ink">
                  {formatBytes(video.byteSize)} · {formatWhen(video.completedAt)}
                </p>
                {video.description ? (
                  <p className="mt-3 whitespace-pre-wrap leading-6 text-ink">{video.description}</p>
                ) : null}
                <p className="mt-3 font-semibold text-unhost-navy">{video.name}</p>
                <p className="text-sm leading-6">
                  <a className="underline decoration-unhost-blue/40 underline-offset-4" href={`mailto:${video.email}`}>
                    {video.email}
                  </a>
                  <span aria-hidden="true"> · </span>
                  <a className="underline decoration-unhost-blue/40 underline-offset-4" href={`tel:${video.phone.replace(/\s/g, "")}`}>
                    {video.phone}
                  </a>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => open(video.id, "play")}
                  className="rounded-full bg-unhost-blue px-4 py-2 text-sm font-semibold text-white hover:bg-unhost-navy"
                >
                  Přehrát
                </button>
                <button
                  type="button"
                  onClick={() => open(video.id, "download")}
                  className="rounded-full border border-unhost-navy px-4 py-2 text-sm font-semibold text-unhost-navy"
                >
                  Stáhnout
                </button>
              </div>
            </div>

            {active && link.status === "loading" ? (
              <p className="mt-4 text-sm text-ink">Připravuji odkaz…</p>
            ) : null}
            {active && link.status === "error" ? (
              <p role="alert" className="mt-4 text-sm text-red-900">
                {link.message}
              </p>
            ) : null}
            {active && link.status === "ready" ? (
              <div className="mt-4">
                <video
                  key={link.playUrl}
                  className="aspect-video w-full rounded-xl bg-black"
                  controls
                  playsInline
                  preload="metadata"
                  src={link.playUrl}
                  onError={() =>
                    setLink({
                      status: "error",
                      id: video.id,
                      message: "Video se nepodařilo přehrát. Odkaz platí 30 minut, zkuste ho obnovit.",
                    })
                  }
                />
                <p className="mt-2 text-xs text-unhost-navy/70">
                  Odkaz na přehrání i stažení platí 30 minut.
                </p>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
    </Tied>
  );
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function requestUrl(id: string, purpose: "play" | "download"): Promise<string> {
  const response = await fetch("/api/spravce/odkaz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, purpose }),
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : "Odkaz se nepodařilo vytvořit.";
    throw new Error(message);
  }
  if (typeof data === "object" && data !== null && "url" in data && typeof data.url === "string") {
    return data.url;
  }
  throw new Error("Odkaz se nepodařilo vytvořit.");
}

function openUrl(url: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
