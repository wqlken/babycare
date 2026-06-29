import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

type Membership = {
  familyId: string;
  role: "owner" | "caregiver";
  removedAt: Date | null;
  user?: {
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
