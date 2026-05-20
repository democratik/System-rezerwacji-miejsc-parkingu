import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  ADMIN_SESSION_COOKIE_NAME,
  PUBLIC_PAGES,
  PUBLIC_API,
} from "@/lib/auth-constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPage = PUBLIC_PAGES.has(pathname);
  const isPublicApi = PUBLIC_API.has(pathname);
  const hasUserSession = request.cookies.has(SESSION_COOKIE_NAME);
  const hasAdminSession = request.cookies.has(ADMIN_SESSION_COOKIE_NAME);
  const hasAnySession = hasUserSession || hasAdminSession;

  const isAdminArea =
    pathname === "/AdminPanel" || pathname.startsWith("/AdminPanel/");

  // Zalogowany uzytkownik nie powinien widziec stron logowania/rejestracji
  if (hasAnySession && isPublicPage) {
    const dest = hasAdminSession ? "/AdminPanel" : "/";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Panel administratora - dostepny wylacznie dla administratora
  if (isAdminArea) {
    if (!hasAdminSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Pozostale chronione strony - wymagana dowolna sesja
  if (!hasAnySession && !isPublicPage && !isPublicApi) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Pomijamy pliki statyczne, ikony i zasoby Next.js
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
