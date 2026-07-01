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
    return { ok: false, error: "Active family membership is required." };
  }

  if (membership.role !== "owner") {
    return { ok: false, error: "Only owners can create invitations." };
  }

  const invitedEmail = normalizeEmail(input.email);
  if (!invitedEmail) {
    return { ok: false, error: "Invite email is required." };
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
    return { ok: false, error: "Invitation is invalid or already used." };
  }

  const now = input.now ?? new Date();
  if (invite.expiresAt < now) {
    return { ok: false, error: "Invitation has expired." };
  }

  if (normalizeEmail(input.email) !== invite.invitedEmail) {
    return {
      ok: false,
      error: "Invitation email does not match this account.",
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
    return { ok: false, error: "Invitation is invalid or already used." };
  }

  const now = input.now ?? new Date();
  if (invite.expiresAt < now) {
    return { ok: false, error: "Invitation has expired." };
  }

  if (normalizeEmail(input.email) !== invite.invitedEmail) {
    return {
      ok: false,
      error: "Invitation email does not match this account.",
    };
  }

  return {
    ok: true,
    familyId: invite.familyId,
  };
}

export async function listFamilyMembers(userId: string) {
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
    return { ok: false, error: "Active family membership is required." };
  }

  if (actor.role !== "owner") {
    return { ok: false, error: "Only owners can manage family members." };
  }

  if (!db.familyMember.findUnique) {
    return { ok: false, error: "Family member management is not available." };
  }

  const target = await db.familyMember.findUnique({
    where: { id: memberId },
    include: { user: true },
  });

  if (!target || target.familyId !== actor.familyId || target.removedAt) {
    return { ok: false, error: "Family member is not accessible." };
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
    return { ok: false, error: "Family member management is not available." };
  }

  const context = await getFamilyActionContext(userId, input.memberId, db);
  if (!context.ok) return context;

  if (await wouldRemoveLastOwner(context.target, db)) {
    return { ok: false, error: "A family must keep at least one owner." };
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
    return { ok: false, error: "Family member management is not available." };
  }

  const context = await getFamilyActionContext(userId, input.memberId, db);
  if (!context.ok) return context;

  if (input.role !== "owner" && input.role !== "caregiver") {
    return { ok: false, error: "Family role is invalid." };
  }

  if (context.target.role === "owner" && input.role === "caregiver") {
    if (await wouldRemoveLastOwner(context.target, db)) {
      return { ok: false, error: "A family must keep at least one owner." };
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
    return { ok: false, error: "Password reset is not available." };
  }

  const context = await getFamilyActionContext(userId, input.memberId, db);
  if (!context.ok) return context;

  if (context.target.userId === userId || context.target.role !== "caregiver") {
    return {
      ok: false,
      error: "Only caregiver passwords can be reset by owners.",
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
