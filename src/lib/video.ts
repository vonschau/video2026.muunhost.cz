export const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;

const EXTENSION_TYPES = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  "3gp": "video/3gpp",
} as const;

type VideoExtension = keyof typeof EXTENSION_TYPES;

export const ALLOWED_CONTENT_TYPES = [
  ...new Set(Object.values(EXTENSION_TYPES)),
];

export const ACCEPTED_EXTENSIONS = Object.keys(EXTENSION_TYPES)
  .map((extension) => `.${extension}`)
  .join(",");

export function videoFileName(
  original: string,
): { fileName: string; contentType: string } | null {
  const base = original.split(/[/\\]/).pop()?.normalize("NFKC").trim() ?? "";
  const match = /\.([A-Za-z0-9]+)$/.exec(base);
  if (!match?.[1]) return null;

  const extension = match[1].toLowerCase();
  if (!isVideoExtension(extension)) return null;

  const stem = base
    .slice(0, -(extension.length + 1))
    .replace(/[^0-9A-Za-zÀ-ž._ -]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  return {
    fileName: `${stem.length > 0 ? stem : "video"}.${extension}`,
    contentType: EXTENSION_TYPES[extension],
  };
}

function isVideoExtension(value: string): value is VideoExtension {
  return Object.prototype.hasOwnProperty.call(EXTENSION_TYPES, value);
}

export function formatBytes(bytes: number): string {
  const units = ["B", "kB", "MB", "GB"] as const;
  let value = bytes;
  let unit: (typeof units)[number] = "B";

  for (const next of units) {
    unit = next;
    if (next === "GB" || value < 1024) break;
    value /= 1024;
  }

  const digits = value >= 10 ? 0 : 1;
  return `${new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: digits }).format(value)}\u00a0${unit}`;
}
