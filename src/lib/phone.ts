const COUNTRY_PREFIX = "420";

/** Devět číslic bez předvolby. +420 a 00420 se oříznou, když je někdo vloží. */
export function nationalPhoneDigits(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith(COUNTRY_PREFIX) && digits.length > 9) {
    digits = digits.slice(COUNTRY_PREFIX.length);
  }
  return digits.slice(0, 9);
}

export function formatNationalPhone(digits: string): string {
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(
    (part) => part.length > 0,
  );
  return parts.join(" ");
}

/** Uložený tvar je +420 a devět číslic. Bez nich vrací null. */
export function czechPhone(input: string): string | null {
  const digits = nationalPhoneDigits(input);
  if (digits.length !== 9) return null;
  return `+${COUNTRY_PREFIX} ${formatNationalPhone(digits)}`;
}
