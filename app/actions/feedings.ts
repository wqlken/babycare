"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import {
  createBottleFeeding,
  startBreastfeeding,
  stopBreastfeeding,
} from "@/lib/records/service";

function redirectWithError(childId: string, target: string, error: string) {
  redirect(
    `/children/${childId}/feedings/${target}?error=${encodeURIComponent(error)}`,
  );
}

export async function createBottleFeedingAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const amountMl = Number(formData.get("amountMl"));
  const result = await createBottleFeeding(user.id, {
    childId,
    amountMl,
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
