"use server";

import { redirect } from "next/navigation";
import { clearSession, setSession } from "@/lib/auth/session";
import { authenticateUser, registerUser } from "@/lib/auth/service";

export async function registerAction(formData: FormData) {
  const result = await registerUser({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
  });

  if (!result.ok) {
    redirect(`/register?error=${encodeURIComponent(result.error)}`);
  }

  await setSession(result.userId);
  redirect("/");
}

export async function loginAction(formData: FormData) {
  const result = await authenticateUser({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }

  await setSession(result.userId);
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
