import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserSession } from "@/types";
import { ALLOWED_USERS, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export function isValidCredentials(username: string, password: string): boolean {
  const normalized = username.trim().toLowerCase();
  const expected = ALLOWED_USERS[normalized];
  return expected !== undefined && expected === password;
}

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from("users_profile")
    .select("id, username, daily_calorie_target")
    .eq("username", username.trim().toLowerCase())
    .single();

  if (error || !data) return null;
  return data;
}

export async function createSessionToken(session: UserSession): Promise<string> {
  return new SignJWT({
    userId: session.userId,
    username: session.username,
    dailyCalorieTarget: session.dailyCalorieTarget,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      dailyCalorieTarget: payload.dailyCalorieTarget as number,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: UserSession) {
  const token = await createSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
