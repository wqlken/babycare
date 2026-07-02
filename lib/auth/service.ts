import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  acceptInvite,
  validateInviteForEmail,
  type InviteAcceptanceDatabase,
  type InviteValidationDatabase,
} from "@/lib/family/service";

export type AuthDatabase = {
  user: {
    count: () => Promise<number>;
    create: (args: {
      data: {
        email: string;
        passwordHash: string;
        displayName: string;
      };
    }) => Promise<{ id: string }>;
    findUnique: (args: {
      where: { email: string };
    }) => Promise<{ id: string; passwordHash: string } | null>;
    findFirst?: (args: {
      where: {
        id?: string;
        email?: string;
        NOT?: { id: string };
      };
    }) => Promise<{
      id: string;
      email: string;
      passwordHash: string;
      displayName: string;
    } | null>;
    update?: (args: {
      where: { id: string };
      data: {
        email?: string;
        displayName?: string;
        passwordHash?: string;
      };
    }) => Promise<unknown>;
  };
  family: {
    create: (args: {
      data: {
        name: string;
        createdBy: string;
        members: {
          create: {
            userId: string;
            role: "owner";
          };
        };
      };
    }) => Promise<{ id: string }>;
  };
  userPreference: {
    create: (args: { data: { userId: string } }) => Promise<unknown>;
    upsert?: (args: {
      where: { userId: string };
      create: {
        userId: string;
        milkUnit: "ml" | "oz";
      };
      update: {
        milkUnit: "ml" | "oz";
      };
    }) => Promise<unknown>;
  };
  invite?: {
    findFirst: (args: {
      where: {
        tokenHash: string;
        usedAt: null;
      };
    }) => Promise<{
      id: string;
      familyId: string;
      tokenHash: string;
      invitedEmail: string;
      expiresAt: Date;
      usedAt: Date | null;
    } | null>;
    update: (args: {
      where: { id: string };
      data: { usedAt: Date };
    }) => Promise<unknown>;
  };
  familyMember?: {
    create: (args: {
      data: {
        familyId: string;
        userId: string;
        role: "caregiver";
      };
    }) => Promise<unknown>;
  };
};

export type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
  inviteToken?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

type AccountResult = { ok: true } | { ok: false; error: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerUser(
  input: RegisterInput,
  db: AuthDatabase = prisma,
): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const displayName = input.displayName.trim();

  if (!email || !displayName) {
    return { ok: false, error: "Email and display name are required." };
  }

  const existingUsers = await db.user.count();
  if (existingUsers > 0 && !input.inviteToken) {
    return { ok: false, error: "Registration requires an invitation." };
  }

  if (input.inviteToken) {
    if (!db.invite || !db.familyMember) {
      return { ok: false, error: "Invitation is invalid or already used." };
    }

    const inviteResult = await validateInviteForEmail(
      {
        token: input.inviteToken,
        email,
      },
      db as InviteValidationDatabase,
    );

    if (!inviteResult.ok) {
      return inviteResult;
    }
  }

  const passwordHash = await hashPassword(input.password);
  const user = await db.user.create({
    data: {
      email,
      displayName,
      passwordHash,
    },
  });

  if (input.inviteToken) {
    const inviteResult = await acceptInvite(
      {
        token: input.inviteToken,
        userId: user.id,
        email,
      },
      db as InviteAcceptanceDatabase,
    );

    if (!inviteResult.ok) {
      return inviteResult;
    }
  } else {
    await db.family.create({
      data: {
        name: "我的家庭",
        createdBy: user.id,
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });
  }

  await db.userPreference.create({
    data: {
      userId: user.id,
    },
  });

  return { ok: true, userId: user.id };
}

export async function authenticateUser(
  input: LoginInput,
  db: AuthDatabase = prisma,
): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return { ok: false, error: "Invalid email or password." };
  }

  return { ok: true, userId: user.id };
}

export async function updateProfile(
  userId: string,
  input: {
    displayName: string;
    email?: string;
  },
  db: AuthDatabase = prisma,
): Promise<AccountResult> {
  if (!db.user.update) {
    return { ok: false, error: "Profile update is not available." };
  }

  const displayName = input.displayName.trim();
  if (!displayName) {
    return { ok: false, error: "Display name is required." };
  }

  const data: { displayName: string; email?: string } = { displayName };

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);
    if (!email) {
      return { ok: false, error: "Email is required." };
    }

    if (db.user.findFirst) {
      const existing = await db.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existing) {
        return { ok: false, error: "Email is already in use." };
      }
    }

    data.email = email;
  }

  await db.user.update({
    where: { id: userId },
    data,
  });

  return { ok: true };
}

export async function updatePassword(
  userId: string,
  input: {
    currentPassword: string;
    newPassword: string;
  },
  db: AuthDatabase = prisma,
): Promise<AccountResult> {
  if (!db.user.findFirst || !db.user.update) {
    return { ok: false, error: "Password update is not available." };
  }

  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return { ok: false, error: "User not found." };
  }

  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(input.newPassword);

  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash,
    },
  });

  return { ok: true };
}

export async function updatePreferences(
  userId: string,
  input: {
    milkUnit: string;
  },
  db: AuthDatabase = prisma,
): Promise<AccountResult> {
  if (!db.userPreference.upsert) {
    return { ok: false, error: "Preference update is not available." };
  }

  if (input.milkUnit !== "ml" && input.milkUnit !== "oz") {
    return { ok: false, error: "Milk unit must be ml or oz." };
  }

  await db.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      milkUnit: input.milkUnit,
    },
    update: {
      milkUnit: input.milkUnit,
    },
  });

  return { ok: true };
}
