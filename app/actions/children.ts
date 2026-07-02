"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import {
  archiveChild,
  createChild,
  setCurrentChild,
  unarchiveChild,
  updateChild,
} from "@/lib/children/service";

export async function createChildAction(formData: FormData) {
  const user = await requireUser();
  const result = await createChild(user.id, {
    name: String(formData.get("name") ?? ""),
    birthday: String(formData.get("birthday") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirect(`/children?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/");
}

export async function setCurrentChildAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const result = await setCurrentChild(user.id, childId);

  if (!result.ok) {
    redirect(`/?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/");
}

export async function updateChildAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const result = await updateChild(user.id, childId, {
    name: String(formData.get("name") ?? ""),
    birthday: String(formData.get("birthday") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirect(`/children/${childId}?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/children/${childId}?saved=profile`);
}

export async function archiveChildAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const result = await archiveChild(user.id, childId);

  if (!result.ok) {
    redirect(`/children/${childId}?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/");
}

export async function unarchiveChildAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const result = await unarchiveChild(user.id, childId);

  if (!result.ok) {
    redirect(`/children/${childId}?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/children/${childId}?saved=archive`);
}
