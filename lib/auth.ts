"use server";

import { cookies } from "next/headers";

const AUTH_COOKIE = "admin_auth";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function verifyPassword(password: string): Promise<boolean> {
  return password === PASSWORD;
}

export async function setAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === "true";
}
