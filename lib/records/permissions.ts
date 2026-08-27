import type { MembershipRecord } from "@/lib/records/types";

export function canEditRecord(
  membership: MembershipRecord,
  userId: string,
  record: { creatorId?: string },
) {
  return membership.role === "owner" || record.creatorId === userId;
}
