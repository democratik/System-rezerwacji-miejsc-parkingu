import { NextResponse } from "next/server";
import { clearSessionCookie, clearAdminSessionCookie } from "@/lib/session";

export async function POST() {
  // Czyscimy obie sesje - uzytkownika i administratora
  await clearSessionCookie();
  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
