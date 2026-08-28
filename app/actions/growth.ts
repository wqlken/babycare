"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createGrowthRecord, updateGrowthRecord } from "@/lib/growth/service";
import { parseRecordDateTimeInput } from "@/lib/time";

function redirectWithError(childId: string, error: string) {
  redirect(`/children/${childId}/growth?error=${encodeURIComponent(error)}`);
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const parsed = Number(text);
  if (!Number.isFinite(parsed)) {
    throw new Error("测量数值无效。");
  }

  return parsed;
}

export async function createGrowthRecordAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  let measuredAt = new Date();
  let weightKg: number | null = null;
  let lengthCm: number | null = null;

  try {
    measuredAt = parseRecordDateTimeInput(String(formData.get("measuredAt") ?? ""), {
      timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
    });
    weightKg = parseOptionalNumber(formData.get("weightKg"));
    lengthCm = parseOptionalNumber(formData.get("lengthCm"));
  } catch (error) {
    redirectWithError(
      childId,
      error instanceof Error ? error.message : "生长记录无效。",
    );
  }

  const result = await createGrowthRecord(user.id, {
    childId,
    measuredAt,
    weightKg,
    lengthCm,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirectWithError(childId, result.error);
  }

  redirect(`/children/${childId}/growth?saved=1`);
}

export async function updateGrowthRecordAction(formData: FormData) {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const recordId = String(formData.get("recordId") ?? "");
  let measuredAt = new Date();
  let weightKg: number | null = null;
  let lengthCm: number | null = null;

  try {
    measuredAt = parseRecordDateTimeInput(
      String(formData.get("measuredAt") ?? ""),
      {
        timezone: process.env.FAMILY_TIMEZONE ?? "Asia/Shanghai",
      },
    );
    weightKg = parseOptionalNumber(formData.get("weightKg"));
    lengthCm = parseOptionalNumber(formData.get("lengthCm"));
  } catch (error) {
    redirectWithError(
      childId,
      error instanceof Error ? error.message : "生长记录无效。",
    );
  }

  const result = await updateGrowthRecord(user.id, {
    childId,
    recordId,
    measuredAt,
    weightKg,
    lengthCm,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    redirectWithError(childId, result.error);
  }

  redirect(`/children/${childId}/growth?saved=updated`);
}
