import fs from "fs/promises";
import path from "path";

export type Admin = {
  id: string;
  login: string;
  password: string; // plain text - bez szyfrowania (zgodnie z wymaganiami)
  createdAt: string;
};

export type PublicAdmin = Omit<Admin, "password">;

const ADMINS_FILE = path.join(process.cwd(), "data", "admins.json");

export async function readAdmins(): Promise<Admin[]> {
  try {
    const raw = await fs.readFile(ADMINS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function findAdminByLogin(login: string): Promise<Admin | null> {
  const admins = await readAdmins();
  const normalized = login.trim().toLowerCase();
  return admins.find((a) => a.login.toLowerCase() === normalized) ?? null;
}

export async function findAdminById(id: string): Promise<Admin | null> {
  const admins = await readAdmins();
  return admins.find((a) => a.id === id) ?? null;
}

export function toPublicAdmin(admin: Admin): PublicAdmin {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = admin;
  return rest;
}
