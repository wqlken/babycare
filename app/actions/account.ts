"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { updatePassword, updateProfile } from "@/lib/auth/service";

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const result = await updateProfile(user.id, {
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
  });

  if (!result.ok) {
    redirect(`/settings/account?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/settings/account?saved=profile");
}

export async function updatePasswordAction(formData: FormData) {
  const user = await requireUser();
  const result = await updatePassword(user.id, {
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
  });

  if (!result.ok) {
    redirect(`/settings/account?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/settings/account?saved=password");
}
