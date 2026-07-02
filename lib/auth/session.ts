import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "babycare_user_id";

export function encodeSessionValue(userId: string, issuedAt: Date = new Date()) {
  return `${userId}:${issuedAt.getTime()}`;
}

export function parseSessionValue(value: string) {
  const [userId, issuedAtText] = value.split(":");
  const issuedAtMs = Number(issuedAtText);

  if (!userId || !Number.isFinite(issuedAtMs)) {
    return null;
  }

  return {
    userId,
    issuedAt: new Date(issuedAtMs),
  };
}

export function isSessionIssuedAfterRevocation(
  issuedAt: Date,
  sessionRevokedAt?: Date | null,
) {
  if (!sessionRevokedAt) return true;
  return issuedAt.getTime() > sessionRevokedAt.getTime();
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = parseSessionValue(cookieStore.get(COOKIE_NAME)?.value ?? "");

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    include: {
      preference: true,
    },
  });

  if (!user || !isSessionIssuedAfterRevocation(session.issuedAt, user.sessionRevokedAt)) {
    return null;
  }

  return user;
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, encodeSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
