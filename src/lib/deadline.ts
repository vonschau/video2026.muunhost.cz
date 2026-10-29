/** Konec 30. listopadu 2026, středoevropský čas (po skončení letního času). */
export const SUBMISSION_DEADLINE = "2026-11-30T23:59:59.999+01:00";

export const DEADLINE_LABEL = "30.\u00A0listopadu\u00A02026";

export function submissionsClosed(now = Date.now()): boolean {
  return now > Date.parse(SUBMISSION_DEADLINE);
}

export function closedMessage(): string {
  return `Výzva skončila ${DEADLINE_LABEL}. Další videa už nepřijímáme.`;
}
