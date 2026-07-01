"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { deleteRecord } from "@/lib/records/service";

export async function deleteRecordAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const kind = String(formData.get("kind") ?? "") as "feeding" | "diaper" | "sleep";
  const recordId = String(formData.get("recordId") ?? "");
  const result = await deleteRecord(user.id, {
    childId,
    kind,
    recordId,
  });

  if (!result.ok) {
    redirect(`/children/${childId}/timeline?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/children/${childId}/timeline`);
}
