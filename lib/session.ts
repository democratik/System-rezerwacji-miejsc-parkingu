import { cookies } from "next/headers";
import { findUserById, type User } from "./users";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "./auth-constants";

export { SESSION_COOKIE_NAME };

export async function setSessionCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: userId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;
  return findUserById(sessionId);
}
