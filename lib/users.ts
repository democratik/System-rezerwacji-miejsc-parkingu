import fs from "fs/promises";
import path from "path";

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  password: string; // plain text - bez szyfrowania (zgodnie z wymaganiami)
  createdAt: string;
};

export type PublicUser = Omit<User, "password">;

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

async function ensureFile(): Promise<void> {
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, "[]", "utf-8");
  }
}

export async function readUsers(): Promise<User[]> {
  await ensureFile();
  const raw = await fs.readFile(USERS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeUsers(users: User[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await readUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  phone: string;
  password: string;
}): Promise<User> {
  const users = await readUsers();
  const user: User = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return user;
}

export function toPublicUser(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}
