"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createDiaper } from "@/lib/records/service";

export async function createDiaperAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const result = await createDiaper(user.id, {
    childId,
    type: String(formData.get("type") ?? "wet") as "wet" | "dirty" | "both",
    stoolColor: String(formData.get("stoolColor") ?? ""),
    stoolConsistency: String(formData.get("stoolConsistency") ?? ""),
    time: new Date(),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirect(`/children/${childId}/diapers/new?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/");
}
