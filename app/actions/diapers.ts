"use server";

import { redirect } from "next/navigation";
import { buildTimelineRedirectPath } from "@/app/actions/timeline-redirect";
import { requireUser } from "@/lib/auth/guards";
import { createDiaper, updateDiaperRecord } from "@/lib/records/service";
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
        error instanceof Error ? error.message : "记录时间无效。",
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

export async function updateDiaperRecordAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const recordId = String(formData.get("recordId") ?? "");
  const updatedAt = new Date(String(formData.get("updatedAt") ?? ""));
  let time = new Date();

  try {
    time = parseRecordDateTimeInput(String(formData.get("eventTime") ?? ""), {
      timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
    });
  } catch (error) {
    redirect(
      buildTimelineRedirectPath(
        childId,
        formData,
        error instanceof Error ? error.message : "记录时间无效。",
      ),
    );
  }

  const result = await updateDiaperRecord(user.id, {
    childId,
    recordId,
    type: String(formData.get("type") ?? "wet"),
    stoolColor: String(formData.get("stoolColor") ?? ""),
    stoolConsistency: String(formData.get("stoolConsistency") ?? ""),
    time,
    updatedAt,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirect(buildTimelineRedirectPath(childId, formData, result.error));
  }

  redirect(buildTimelineRedirectPath(childId, formData));
}
