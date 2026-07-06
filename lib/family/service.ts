import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

type Membership = {
  familyId: string;
  role: "owner" | "caregiver";
  removedAt: Date | null;
  user?: {
    displayName: string;
    email: string;
  };
};

type FamilyRole = "owner" | "caregiver";
export type FamilyMemberListItem = Membership & {
  id: string;
  userId: string;
  user: {
    displayName: string;
    email: string;
  };
};

type InviteRecord = {
  id: string;
  familyId: string;
  tokenHash: string;
  invitedEmail: string;
  expiresAt: Date;
  usedAt: Date | null;
};

export type FamilyDatabase = {
  familyMember: {
    findFirst: (args: {
      where: {
        userId: string;
        removedAt: null;
      };
      include?: {
        user: true;
      };
    }) => Promise<Membership | null>;
    create: (args: {
      data: {
        familyId: string;
        userId: string;
        role: "caregiver";
      };
    }) => Promise<unknown>;
    count?: (args: {
      where: {
        familyId: string;
        role: "owner";
        removedAt: null;
      };
    }) => Promise<number>;
    findUnique?: (args: {
      where: { id: string };
      include?: { user: true };
    }) => Promise<Membership & { id: string; userId: string } | null>;
    update?: (args: {
      where: { id: string };
      data: { removedAt?: Date; role?: FamilyRole };
    }) => Promise<unknown>;
  };
  user?: {
    update: (args: {
      where: { id: string };
      data: {
        passwordHash: string;
        sessionRevokedAt: Date;
      };
    }) => Promise<unknown>;
  };
  invite: {
    create: (args: {
      data: {
        familyId: string;
        tokenHash: string;
        invitedEmail: string;
        expiresAt: Date;
      };
    }) => Promise<InviteRecord>;
    findFirst: (args: {
      where: {
        tokenHash: string;
        usedAt: null;
      };
    }) => Promise<InviteRecord | null>;
    update: (args: {
      where: { id: string };
      data: { usedAt: Date };
    }) => Promise<InviteRecord>;
  };
};

export type InviteValidationDatabase = {
  invite: {
    findFirst: (args: {
      where: {
        tokenHash: string;
        usedAt: null;
      };
    }) => Promise<InviteRecord | null>;
  };
};

export type InviteAcceptanceDatabase = InviteValidationDatabase & {
  familyMember: {
    create: (args: {
      data: {
        familyId: string;
        userId: string;
        role: "caregiver";
      };
    }) => Promise<unknown>;
  };
  invite: InviteValidationDatabase["invite"] & {
    update: (args: {
      where: { id: string };
      data: { usedAt: Date };
    }) => Promise<unknown>;
  };
};

type ServiceResult<T> = ({ ok: true } & T) | { ok: false; error: string };
type FamilyActionContext =
  | {
      ok: true;
      actor: Membership;
      target: Membership & { id: string; userId: string };
    }
  | { ok: false; error: string };

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createInvite(
  userId: string,
  input: {
    email: string;
    appUrl: string;
    now?: Date;
  },
  db: FamilyDatabase = prisma,
): Promise<ServiceResult<{ token: string; inviteUrl: string }>> {
  const membership = await db.familyMember.findFirst({
    where: {
      userId,
      removedAt: null,
    },
  });

  if (!membership) {
    return { ok: false, error: "需要先加入一个有效家庭。" };
  }

  if (membership.role !== "owner") {
    return { ok: false, error: "只有家庭管理员可以创建邀请。" };
  }

  const invitedEmail = normalizeEmail(input.email);
  if (!invitedEmail) {
    return { ok: false, error: "请输入邀请邮箱。" };
  }

  const token = randomBytes(24).toString("base64url");
  const now = input.now ?? new Date();
  const expiresAt = new Date(now.getTime() + 7 * 86_400_000);

  await db.invite.create({
    data: {
      familyId: membership.familyId,
      tokenHash: hashInviteToken(token),
      invitedEmail,
      expiresAt,
    },
  });

  const appUrl = input.appUrl.replace(/\/$/, "");

  return {
    ok: true,
    token,
    inviteUrl: `${appUrl}/register?invite=${encodeURIComponent(token)}`,
  };
}

export async function acceptInvite(
  input: {
    token: string;
    userId: string;
    email: string;
    now?: Date;
  },
  db: InviteAcceptanceDatabase = prisma,
): Promise<ServiceResult<{ familyId: string }>> {
  const invite = await db.invite.findFirst({
    where: {
      tokenHash: hashInviteToken(input.token),
      usedAt: null,
    },
  });

  if (!invite) {
    return { ok: false, error: "邀请无效或已被使用。" };
  }

  const now = input.now ?? new Date();
  if (invite.expiresAt < now) {
    return { ok: false, error: "邀请已过期。" };
  }

  if (normalizeEmail(input.email) !== invite.invitedEmail) {
    return {
      ok: false,
      error: "邀请邮箱与当前账号不匹配。",
    };
  }

  await db.familyMember.create({
    data: {
      familyId: invite.familyId,
      userId: input.userId,
      role: "caregiver",
    },
  });

  await db.invite.update({
    where: { id: invite.id },
    data: { usedAt: now },
  });

  return {
    ok: true,
    familyId: invite.familyId,
  };
}

export async function validateInviteForEmail(
  input: {
    token: string;
    email: string;
    now?: Date;
  },
  db: InviteValidationDatabase = prisma,
): Promise<ServiceResult<{ familyId: string }>> {
  const invite = await db.invite.findFirst({
    where: {
      tokenHash: hashInviteToken(input.token),
      usedAt: null,
    },
  });

  if (!invite) {
    return { ok: false, error: "邀请无效或已被使用。" };
  }

  const now = input.now ?? new Date();
  if (invite.expiresAt < now) {
    return { ok: false, error: "邀请已过期。" };
  }

  if (normalizeEmail(input.email) !== invite.invitedEmail) {
    return {
      ok: false,
      error: "邀请邮箱与当前账号不匹配。",
    };
  }

  return {
    ok: true,
    familyId: invite.familyId,
  };
}

export async function listFamilyMembers(
  userId: string,
): Promise<FamilyMemberListItem[]> {
  const membership = await prisma.familyMember.findFirst({
    where: {
      userId,
      removedAt: null,
    },
  });

  if (!membership) {
    return [];
  }

  return prisma.familyMember.findMany({
    where: {
      familyId: membership.familyId,
      removedAt: null,
    },
    include: {
      user: true,
    },
    orderBy: {
      joinedAt: "asc",
    },
  });
}

async function getFamilyActionContext(
  userId: string,
  memberId: string,
  db: FamilyDatabase,
): Promise<FamilyActionContext> {
  const actor = await db.familyMember.findFirst({
    where: {
      userId,
      removedAt: null,
    },
  });

  if (!actor) {
    return { ok: false, error: "需要先加入一个有效家庭。" };
  }

  if (actor.role !== "owner") {
    return { ok: false, error: "只有家庭管理员可以管理家庭成员。" };
  }

  if (!db.familyMember.findUnique) {
    return { ok: false, error: "当前无法管理家庭成员。" };
  }

  const target = await db.familyMember.findUnique({
    where: { id: memberId },
    include: { user: true },
  });

  if (!target || target.familyId !== actor.familyId || target.removedAt) {
    return { ok: false, error: "无法访问该家庭成员。" };
  }

  return {
    ok: true,
    actor,
    target,
  };
}

async function ownerCount(familyId: string, db: FamilyDatabase) {
  if (!db.familyMember.count) {
    return null;
  }

  return db.familyMember.count({
    where: {
      familyId,
      role: "owner",
      removedAt: null,
    },
  });
}

async function wouldRemoveLastOwner(
  target: Membership,
  db: FamilyDatabase,
) {
  if (target.role !== "owner") {
    return false;
  }

  const count = await ownerCount(target.familyId, db);
  return count !== null && count <= 1;
}

export async function removeFamilyMember(
  userId: string,
  input: {
    memberId: string;
    now?: Date;
  },
  db: FamilyDatabase = prisma,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!db.familyMember.update || !db.familyMember.count) {
    return { ok: false, error: "当前无法管理家庭成员。" };
  }

  const context = await getFamilyActionContext(userId, input.memberId, db);
  if (!context.ok) return context;

  if (await wouldRemoveLastOwner(context.target, db)) {
    return { ok: false, error: "家庭中必须至少保留一位管理员。" };
  }

  await db.familyMember.update({
    where: { id: context.target.id },
    data: {
      removedAt: input.now ?? new Date(),
    },
  });

  return { ok: true };
}

export async function updateFamilyMemberRole(
  userId: string,
  input: {
    memberId: string;
    role: FamilyRole;
  },
  db: FamilyDatabase = prisma,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!db.familyMember.update || !db.familyMember.count) {
    return { ok: false, error: "当前无法管理家庭成员。" };
  }

  const context = await getFamilyActionContext(userId, input.memberId, db);
  if (!context.ok) return context;

  if (input.role !== "owner" && input.role !== "caregiver") {
    return { ok: false, error: "家庭成员角色无效。" };
  }

  if (context.target.role === "owner" && input.role === "caregiver") {
    if (await wouldRemoveLastOwner(context.target, db)) {
      return { ok: false, error: "家庭中必须至少保留一位管理员。" };
    }
  }

  await db.familyMember.update({
    where: { id: context.target.id },
    data: { role: input.role },
  });

  return { ok: true };
}

export async function resetCaregiverPassword(
  userId: string,
  input: {
    memberId: string;
    now?: Date;
  },
  db: FamilyDatabase = prisma,
): Promise<
  | {
      ok: true;
      temporaryPassword: string;
    }
  | { ok: false; error: string }
> {
  if (!db.user) {
    return { ok: false, error: "当前无法重置密码。" };
  }

  const context = await getFamilyActionContext(userId, input.memberId, db);
  if (!context.ok) return context;

  if (context.target.userId === userId || context.target.role !== "caregiver") {
    return {
      ok: false,
      error: "只有照护者密码可以由家庭管理员重置。",
    };
  }

  const temporaryPassword = randomBytes(12).toString("base64url").slice(0, 16);
  const now = input.now ?? new Date();

  await db.user.update({
    where: { id: context.target.userId },
    data: {
      passwordHash: await hashPassword(temporaryPassword),
      sessionRevokedAt: now,
    },
  });

  return {
    ok: true,
    temporaryPassword,
  };
}
