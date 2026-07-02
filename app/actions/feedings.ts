"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import {
  createBottleFeeding,
  startBreastfeeding,
  stopBreastfeeding,
  updateBottleFeeding,
} from "@/lib/records/service";
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

  try {
    amountMl = parseMilkVolumeToMl(String(formData.get("amount") ?? ""), milkUnit);
  } catch (error) {
    redirectWithError(
      childId,
      "new",
      error instanceof Error ? error.message : "Milk volume is invalid.",
    );
  }

  const result = await createBottleFeeding(user.id, {
    childId,
    amountMl,
    bottleContent: String(formData.get("bottleContent") ?? "unknown"),
    eventTime: new Date(),
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
  const result = await startBreastfeeding(user.id, {
    childId,
    breastSide:
      (String(formData.get("breastSide") ?? "unknown") as
        | "left"
        | "right"
        | "both"
        | "unknown") ?? "unknown",
    startTime: new Date(),
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
      `/children/${childId}/timeline?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Milk volume is invalid.",
      )}`,
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
    redirect(`/children/${childId}/timeline?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/children/${childId}/timeline`);
}
