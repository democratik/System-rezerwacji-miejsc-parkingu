import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, toPublicUser } from "@/lib/users";
import { findAdminByLogin, toPublicAdmin } from "@/lib/admins";
import { setSessionCookie, setAdminSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidlowe dane" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail/login i haslo sa wymagane" },
      { status: 400 }
    );
  }

  // Najpierw sprawdzamy zwyklego uzytkownika (logowanie po e-mailu)
  const user = await findUserByEmail(email);
  if (user && user.password === password) {
    await setSessionCookie(user.id);
    return NextResponse.json({ role: "user", user: toPublicUser(user) });
  }

  // Potem sprawdzamy administratora (logowanie po loginie)
  const admin = await findAdminByLogin(email);
  if (admin && admin.password === password) {
    await setAdminSessionCookie(admin.id);
    return NextResponse.json({ role: "admin", admin: toPublicAdmin(admin) });
  }

  return NextResponse.json(
    { error: "Nieprawidlowy e-mail/login lub haslo" },
    { status: 401 }
  );
}
