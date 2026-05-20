"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
};

export type AuthAdmin = {
  id: string;
  login: string;
  createdAt: string;
};

export type AuthRole = "user" | "admin";

type LoginResult =
  | { ok: true; role: AuthRole }
  | { ok: false; error: string };

type RegisterResult = { ok: true } | { ok: false; error: string };

type AuthContextType = {
  user: AuthUser | null;
  admin: AuthAdmin | null;
  loading: boolean;
  register: (input: {
    email: string;
    name: string;
    phone: string;
    password: string;
  }) => Promise<RegisterResult>;
  login: (login: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [admin, setAdmin] = useState<AuthAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setUser(data.user ?? null);
          setAdmin(data.admin ?? null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setAdmin(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(
    async (input: {
      email: string;
      name: string;
      phone: string;
      password: string;
    }): Promise<RegisterResult> => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error ?? "Blad rejestracji" };
      }
      setUser(data.user);
      setAdmin(null);
      return { ok: true };
    },
    []
  );

  const login = useCallback(
    async (loginValue: string, password: string): Promise<LoginResult> => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginValue, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error ?? "Blad logowania" };
      }
      if (data.role === "admin") {
        setAdmin(data.admin);
        setUser(null);
        return { ok: true, role: "admin" };
      }
      setUser(data.user);
      setAdmin(null);
      return { ok: true, role: "user" };
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    setAdmin(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, admin, loading, register, login, logout }),
    [user, admin, loading, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
