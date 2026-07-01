"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import {
  createInvite,
  removeFamilyMember,
  resetCaregiverPassword,
  updateFamilyMemberRole,
} from "@/lib/family/service";

export async function createInviteAction(formData: FormData) {
  const user = await requireUser();
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const result = await createInvite(user.id, {
    email: String(formData.get("email") ?? ""),
    appUrl,
  });

  if (!result.ok) {
    redirect(`/settings/family?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/settings/family?invite=${encodeURIComponent(result.inviteUrl)}`);
}

export async function removeFamilyMemberAction(formData: FormData) {
  const user = await requireUser();
  const result = await removeFamilyMember(user.id, {
    memberId: String(formData.get("memberId") ?? ""),
  });

  if (!result.ok) {
    redirect(`/settings/family?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/settings/family?saved=member-removed");
}

export async function updateFamilyMemberRoleAction(formData: FormData) {
  const user = await requireUser();
  const result = await updateFamilyMemberRole(user.id, {
    memberId: String(formData.get("memberId") ?? ""),
    role: String(formData.get("role") ?? "") as "owner" | "caregiver",
  });

  if (!result.ok) {
    redirect(`/settings/family?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/settings/family?saved=role-updated");
}

export async function resetCaregiverPasswordAction(formData: FormData) {
  const user = await requireUser();
  const result = await resetCaregiverPassword(user.id, {
    memberId: String(formData.get("memberId") ?? ""),
  });

  if (!result.ok) {
    redirect(`/settings/family?error=${encodeURIComponent(result.error)}`);
  }

  redirect(
    `/settings/family?saved=password-reset&temporaryPassword=${encodeURIComponent(
      result.temporaryPassword,
    )}`,
  );
}
