/** Jednopísmenná slova a datum „1. ledna“ drží u následujícího slova. */
const SINGLE_LETTER =
  /(^|[\s\u00A0„"(])([AIKOSUVZaikosuvz])[ \t\n\r\f\v]+/g;
const ORDINAL = /(\d+)\.[ \t\n\r\f\v]+/g;

export function tie(text: string): string {
  return text.replace(SINGLE_LETTER, "$1$2\u00A0").replace(ORDINAL, "$1.\u00A0");
}
