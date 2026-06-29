"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { startSleep, stopSleep } from "@/lib/records/service";

export async function startSleepAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const result = await startSleep(user.id, {
    childId,
    startTime: new Date(),
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
