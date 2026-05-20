import { NextResponse } from "next/server";
import { getSessionUser, getAdminSessionUser } from "@/lib/session";
import { toPublicUser } from "@/lib/users";
import { toPublicAdmin } from "@/lib/admins";

export async function GET() {
  const user = await getSessionUser();
  const admin = await getAdminSessionUser();
  return NextResponse.json({
    user: user ? toPublicUser(user) : null,
    admin: admin ? toPublicAdmin(admin) : null,
  });
}
