import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, toPublicUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/session";

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
      { error: "E-mail i haslo sa wymagane" },
      { status: 400 }
    );
  }

  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    return NextResponse.json(
      { error: "Nieprawidlowy e-mail lub haslo" },
      { status: 401 }
    );
  }

  await setSessionCookie(user.id);
  return NextResponse.json({ user: toPublicUser(user) });
}
