import { cookies } from "next/headers";

const COOKIE_NAME = "br26_admin";
const COOKIE_VALUE = "ok";
const ONE_DAY = 60 * 60 * 24;

export function isAdmin(): boolean {
  return cookies().get(COOKIE_NAME)?.value === COOKIE_VALUE;
}

export function setAdminCookie() {
  cookies().set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_DAY,
    path: "/",
  });
}

export function clearAdminCookie() {
  cookies().delete(COOKIE_NAME);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // เปรียบเทียบยาวเท่ากันก่อน เพื่อกัน timing attack เบื้องต้น
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function verifySecretPath(input: string): boolean {
  return input === process.env.ADMIN_SECRET_PATH;
}
