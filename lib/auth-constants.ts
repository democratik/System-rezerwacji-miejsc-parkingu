// Stale wspoldzielone przez serwerowy kod sesji oraz middleware.
// Trzymamy je w osobnym pliku, zeby middleware (Edge runtime) nie
// musial importowac modulow z node:fs ani next/headers.

export const SESSION_COOKIE_NAME = "parking_session";
export const ADMIN_SESSION_COOKIE_NAME = "parking_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dni

export const PUBLIC_PAGES: ReadonlySet<string> = new Set([
  "/login",
  "/register",
]);

export const PUBLIC_API: ReadonlySet<string> = new Set([
  "/api/login",
  "/api/register",
  "/api/me",
  "/api/logout",
]);
