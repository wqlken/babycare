"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createDiaper } from "@/lib/records/service";
import { parseRecordDateTimeInput } from "@/lib/time";

export async function createDiaperAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  let time = new Date();

  try {
    time = parseRecordDateTimeInput(String(formData.get("eventTime") ?? ""), {
      timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
    });
  } catch (error) {
    redirect(
      `/children/${childId}/diapers/new?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Record time is invalid.",
      )}`,
    );
  }

  const result = await createDiaper(user.id, {
    childId,
    type: String(formData.get("type") ?? "wet") as "wet" | "dirty" | "both",
    stoolColor: String(formData.get("stoolColor") ?? ""),
    stoolConsistency: String(formData.get("stoolConsistency") ?? ""),
    time,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirect(`/children/${childId}/diapers/new?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/");
}
