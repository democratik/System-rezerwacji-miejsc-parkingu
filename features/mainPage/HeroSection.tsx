"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/authContext";

export default function HeroSection() {
  const { user, admin, loading, logout } = useAuth();

  return (
    <section className="bg-blue-600 text-white py-16 px-8 md:py-24 relative">
      <div className="absolute top-4 right-4 md:top-6 md:right-8 flex items-center gap-2">
        {loading ? null : admin ? (
          <>
            <span className="text-sm text-blue-100 hidden sm:inline">
              Administrator:{" "}
              <span className="font-semibold">{admin.login}</span>
            </span>
            <Link
              href="/AdminPanel"
              className="text-sm bg-white text-blue-600 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg transition-colors">
              Panel administratora
            </Link>
            <button
              onClick={() => logout()}
              className="text-sm bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
              Wyloguj
            </button>
          </>
        ) : user ? (
          <>
            <span className="text-sm text-blue-100 hidden sm:inline">
              Witaj, <span className="font-semibold">{user.name}</span>
            </span>
            <button
              onClick={() => logout()}
              className="text-sm bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
              Wyloguj
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors">
              Zaloguj sie
            </Link>
            <Link
              href="/register"
              className="text-sm bg-white text-blue-600 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg transition-colors">
              Zarejestruj sie
            </Link>
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
          Rezerwacja miejsc na parkingu uniwersyteckim
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl">
          Zarezerwuj miejsce online — szybko i wygodnie
        </p>

        <div className="mt-4">
          <a
            href="#map"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-blue-50 transition-colors duration-200">
            Przejdz do mapy parkingu
          </a>
        </div>
      </div>
    </section>
  );
}
