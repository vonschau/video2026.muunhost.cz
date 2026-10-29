"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  adminPassword,
  createSessionToken,
  passwordsMatch,
  sessionCookieOptions,
} from "@/lib/auth";

export async function login(formData: FormData): Promise<void> {
  const given = String(formData.get("password") ?? "");
  const expected = adminPassword();

  if (!expected) {
    redirect("/spravce?chyba=nastaveni");
  }

  if (!passwordsMatch(given, expected)) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    redirect("/spravce?chyba=heslo");
  }

  (await cookies()).set(COOKIE_NAME, createSessionToken(), sessionCookieOptions());
  redirect("/spravce");
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: COOKIE_NAME, path: "/" });
  redirect("/spravce");
}
