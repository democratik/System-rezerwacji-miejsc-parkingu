import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail, toPublicUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d][\d\s\-()]{5,}$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidlowe dane" }, { status: 400 });
  }

  const { email, name, phone, password } = (body ?? {}) as {
    email?: string;
    name?: string;
    phone?: string;
    password?: string;
  };

  if (!email || !name || !phone || !password) {
    return NextResponse.json(
      { error: "Wszystkie pola sa wymagane" },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      { error: "Nieprawidlowy adres e-mail" },
      { status: 400 }
    );
  }

  if (name.trim().length < 2) {
    return NextResponse.json(
      { error: "Imie musi miec co najmniej 2 znaki" },
      { status: 400 }
    );
  }

  if (!PHONE_REGEX.test(phone.trim())) {
    return NextResponse.json(
      { error: "Nieprawidlowy numer telefonu" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Haslo musi miec co najmniej 6 znakow" },
      { status: 400 }
    );
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "Uzytkownik z tym adresem e-mail juz istnieje" },
      { status: 409 }
    );
  }

  const user = await createUser({ email, name, phone, password });
  await setSessionCookie(user.id);

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}
