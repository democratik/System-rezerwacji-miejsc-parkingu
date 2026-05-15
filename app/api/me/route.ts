import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { toPublicUser } from "@/lib/users";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: toPublicUser(user) });
}
