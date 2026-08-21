"use server";

import { redirect } from "next/navigation";
import { buildTimelineRedirectPath } from "@/app/actions/timeline-redirect";
import { requireUser } from "@/lib/auth/guards";
import { startSleep, stopSleep, updateSleepRecord } from "@/lib/records/service";
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
        error instanceof Error ? error.message : "记录时间无效。",
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

export async function updateSleepRecordAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const recordId = String(formData.get("recordId") ?? "");
  const updatedAt = new Date(String(formData.get("updatedAt") ?? ""));
  let startTime = new Date();
  let endTime: Date | null = null;

  try {
    startTime = parseRecordDateTimeInput(String(formData.get("startTime") ?? ""), {
      timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
    });

    const endTimeText = String(formData.get("endTime") ?? "");
    endTime = endTimeText
      ? parseRecordDateTimeInput(endTimeText, {
          timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
        })
      : null;
  } catch (error) {
    redirect(
      buildTimelineRedirectPath(
        childId,
        formData,
        error instanceof Error ? error.message : "记录时间无效。",
      ),
    );
  }

  const result = await updateSleepRecord(user.id, {
    childId,
    recordId,
    startTime,
    endTime,
    updatedAt,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirect(buildTimelineRedirectPath(childId, formData, result.error));
  }

  redirect(buildTimelineRedirectPath(childId, formData));
}
