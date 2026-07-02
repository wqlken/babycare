"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { startSleep, stopSleep } from "@/lib/records/service";
import { parseRecordDateTimeInput } from "@/lib/time";

export async function startSleepAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  let startTime = new Date();

  try {
    startTime = parseRecordDateTimeInput(String(formData.get("startTime") ?? ""), {
      timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
    });
  } catch (error) {
    redirect(
      `/children/${childId}/sleep?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Record time is invalid.",
      )}`,
    );
  }

  const result = await startSleep(user.id, {
    childId,
    startTime,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirect(`/children/${childId}/sleep?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/");
}

export async function stopSleepAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const result = await stopSleep(user.id, {
    childId,
    endTime: new Date(),
  });

  if (!result.ok) {
    redirect(`/children/${childId}/sleep?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/");
}
