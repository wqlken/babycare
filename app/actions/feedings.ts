"use server";

import { redirect } from "next/navigation";
import { buildTimelineRedirectPath } from "@/app/actions/timeline-redirect";
import { requireUser } from "@/lib/auth/guards";
import {
  createBottleFeeding,
  startBreastfeeding,
  stopBreastfeeding,
  updateBottleFeeding,
  updateFeedingRecord,
} from "@/lib/records/service";
import { parseRecordDateTimeInput } from "@/lib/time";
import { parseMilkVolumeToMl, type MilkUnit } from "@/lib/units";

function redirectWithError(childId: string, target: string, error: string) {
  redirect(
    `/children/${childId}/feedings/${target}?error=${encodeURIComponent(error)}`,
  );
}

export async function createBottleFeedingAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const milkUnit = String(formData.get("milkUnit") ?? "ml") as MilkUnit;
  let amountMl = 0;
  let eventTime = new Date();

  try {
    amountMl = parseMilkVolumeToMl(String(formData.get("amount") ?? ""), milkUnit);
    eventTime = parseRecordDateTimeInput(String(formData.get("eventTime") ?? ""), {
      timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
    });
  } catch (error) {
    redirectWithError(
      childId,
      "new",
      error instanceof Error ? error.message : "奶量无效。",
    );
  }

  const result = await createBottleFeeding(user.id, {
    childId,
    amountMl,
    bottleContent: String(formData.get("bottleContent") ?? "unknown"),
    eventTime,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirectWithError(childId, "new", result.error);
  }

  redirect("/");
}

export async function startBreastfeedingAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  let startTime = new Date();

  try {
    startTime = parseRecordDateTimeInput(String(formData.get("startTime") ?? ""), {
      timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
    });
  } catch (error) {
    redirectWithError(
      childId,
      "new",
      error instanceof Error ? error.message : "记录时间无效。",
    );
  }

  const result = await startBreastfeeding(user.id, {
    childId,
    breastSide:
      (String(formData.get("breastSide") ?? "unknown") as
        | "left"
        | "right"
        | "both"
        | "unknown") ?? "unknown",
    startTime,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirectWithError(childId, "new", result.error);
  }

  redirect("/");
}

export async function stopBreastfeedingAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const result = await stopBreastfeeding(user.id, {
    childId,
    endTime: new Date(),
  });

  if (!result.ok) {
    redirectWithError(childId, "new", result.error);
  }

  redirect("/");
}

export async function updateBottleFeedingAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const recordId = String(formData.get("recordId") ?? "");
  const updatedAt = new Date(String(formData.get("updatedAt") ?? ""));
  const milkUnit = String(formData.get("milkUnit") ?? "ml") as MilkUnit;
  let amountMl = 0;

  try {
    amountMl = parseMilkVolumeToMl(String(formData.get("amount") ?? ""), milkUnit);
  } catch (error) {
    redirect(
      buildTimelineRedirectPath(
        childId,
        formData,
        error instanceof Error ? error.message : "奶量无效。",
      ),
    );
  }

  const result = await updateBottleFeeding(user.id, {
    childId,
    recordId,
    amountMl,
    bottleContent: String(formData.get("bottleContent") ?? "unknown"),
    updatedAt,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirect(buildTimelineRedirectPath(childId, formData, result.error));
  }

  redirect(buildTimelineRedirectPath(childId, formData));
}

export async function updateFeedingRecordAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const recordId = String(formData.get("recordId") ?? "");
  const type = String(formData.get("type") ?? "bottle") as "breast" | "bottle";
  const updatedAt = new Date(String(formData.get("updatedAt") ?? ""));
  const milkUnit = String(formData.get("milkUnit") ?? "ml") as MilkUnit;
  let startTime = new Date();
  let endTime: Date | null = null;
  let amountMl: number | null = null;

  try {
    startTime = parseRecordDateTimeInput(String(formData.get("startTime") ?? ""), {
      timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
    });

    if (type === "bottle") {
      amountMl = parseMilkVolumeToMl(String(formData.get("amount") ?? ""), milkUnit);
    } else {
      const endTimeText = String(formData.get("endTime") ?? "");
      endTime = endTimeText
        ? parseRecordDateTimeInput(endTimeText, {
            timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
          })
        : null;
    }
  } catch (error) {
    redirect(
      buildTimelineRedirectPath(
        childId,
        formData,
        error instanceof Error ? error.message : "记录信息无效。",
      ),
    );
  }

  const result = await updateFeedingRecord(user.id, {
    childId,
    recordId,
    type,
    breastSide: String(formData.get("breastSide") ?? "unknown"),
    startTime,
    endTime,
    amountMl,
    bottleContent: String(formData.get("bottleContent") ?? "unknown"),
    updatedAt,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirect(buildTimelineRedirectPath(childId, formData, result.error));
  }

  redirect(buildTimelineRedirectPath(childId, formData));
}
