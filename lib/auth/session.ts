import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "babycare_user_id";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function getSessionSecret() {
  return process.env.AUTH_SECRET ?? "";
}

function signSessionPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function isValidSignature(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

export function encodeSessionValue(
  userId: string,
  issuedAt: Date = new Date(),
  secret = getSessionSecret(),
) {
  const payload = `${userId}:${issuedAt.getTime()}`;
  return `${payload}:${signSessionPayload(payload, secret)}`;
}

export function parseSessionValue(value: string, secret = getSessionSecret()) {
  const [userId, issuedAtText, signature] = value.split(":");
  const issuedAtMs = Number(issuedAtText);

  if (!userId || !Number.isFinite(issuedAtMs) || !signature || !secret) {
    return null;
  }

  const payload = `${userId}:${issuedAtText}`;
  const expectedSignature = signSessionPayload(payload, secret);

  if (!isValidSignature(expectedSignature, signature)) {
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

export function isSessionWithinMaxAge(
  issuedAt: Date,
  now: Date = new Date(),
) {
  const ageMs = now.getTime() - issuedAt.getTime();
  return ageMs >= 0 && ageMs <= SESSION_MAX_AGE_SECONDS * 1000;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = parseSessionValue(cookieStore.get(COOKIE_NAME)?.value ?? "");

  if (!session || !isSessionWithinMaxAge(session.issuedAt)) {
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
    maxAge: SESSION_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
