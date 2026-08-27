import type { RecordsDatabase } from "@/lib/records/types";

export async function getRecordContext(
  userId: string,
  childId: string,
  db: RecordsDatabase,
) {
  const [user, membership] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.familyMember.findFirst({
      where: {
        userId,
        removedAt: null,
      },
    }),
  ]);

  if (!user || !membership) {
    return { ok: false as const, error: "需要先加入一个有效家庭。" };
  }

  const child = await db.child.findFirst({
    where: {
      id: childId,
      familyId: membership.familyId,
      archivedAt: null,
    },
  });

  if (!child) {
    return { ok: false as const, error: "无法访问该宝宝资料。" };
  }

  return {
    ok: true as const,
    user,
    membership,
    child,
  };
}
