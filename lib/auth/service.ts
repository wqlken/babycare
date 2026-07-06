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
    return { ok: false, error: "请输入邮箱和显示名称。" };
  }

  const existingUsers = await db.user.count();
  if (existingUsers > 0 && !input.inviteToken) {
    return { ok: false, error: "注册需要有效邀请。" };
  }

  if (input.inviteToken) {
    if (!db.invite || !db.familyMember) {
      return { ok: false, error: "邀请无效或已被使用。" };
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
    return { ok: false, error: "邮箱或密码不正确。" };
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
    return { ok: false, error: "当前无法更新个人资料。" };
  }

  const displayName = input.displayName.trim();
  if (!displayName) {
    return { ok: false, error: "请输入显示名称。" };
  }

  const data: { displayName: string; email?: string } = { displayName };

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);
    if (!email) {
      return { ok: false, error: "请输入邮箱。" };
    }

    if (db.user.findFirst) {
      const existing = await db.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existing) {
        return { ok: false, error: "该邮箱已被使用。" };
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
    return { ok: false, error: "当前无法更新密码。" };
  }

  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return { ok: false, error: "未找到该用户。" };
  }

  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    return { ok: false, error: "当前密码不正确。" };
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
    return { ok: false, error: "当前无法更新偏好设置。" };
  }

  if (input.milkUnit !== "ml" && input.milkUnit !== "oz") {
    return { ok: false, error: "奶量单位只能是 ml 或 oz。" };
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
