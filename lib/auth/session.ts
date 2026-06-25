import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "babycare_user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, userId, {
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
