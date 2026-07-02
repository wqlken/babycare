import { describe, expect, test, vi } from "vitest";
import {
  authenticateUser,
  registerUser,
  updatePassword,
  updatePreferences,
  updateProfile,
  type AuthDatabase,
} from "@/lib/auth/service";

function createAuthDatabase(): AuthDatabase {
  const users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
  }> = [];

  return {
    user: {
      count: vi.fn(async () => users.length),
      create: vi.fn(async ({ data }) => {
        const user = {
          id: `user-${users.length + 1}`,
          email: data.email,
          passwordHash: data.passwordHash,
          displayName: data.displayName,
        };
        users.push(user);
        return user;
      }),
      findUnique: vi.fn(async ({ where }) => {
        return users.find((user) => user.email === where.email) ?? null;
      }),
      findFirst: vi.fn(async ({ where }) => {
        return (
          users.find(
            (user) =>
              user.id === where.id ||
              (user.email === where.email && user.id !== where.NOT?.id),
          ) ?? null
        );
      }),
      update: vi.fn(async ({ where, data }) => {
        const user = users.find((item) => item.id === where.id);
        if (!user) throw new Error("User not found.");
        user.displayName = data.displayName ?? user.displayName;
        user.passwordHash = data.passwordHash ?? user.passwordHash;
        return user;
      }),
    },
    family: {
      create: vi.fn(async () => ({ id: "family-1" })),
    },
    userPreference: {
      create: vi.fn(async () => ({ id: "preference-1" })),
      upsert: vi.fn(async () => ({ id: "preference-1" })),
    },
  };
}

describe("authentication rules", () => {
  test("bootstrap registration creates the first owner and family", async () => {
    const db = createAuthDatabase();

    const result = await registerUser(
      {
        email: "Owner@Example.com",
        password: "babycare123",
        displayName: "Owner",
      },
      db,
    );

    expect(result).toEqual({ ok: true, userId: "user-1" });
    expect(db.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "owner@example.com",
        displayName: "Owner",
      }),
    });
    expect(db.family.create).toHaveBeenCalledWith({
      data: {
        name: "我的家庭",
        createdBy: "user-1",
        members: {
          create: {
            userId: "user-1",
            role: "owner",
          },
        },
      },
    });
  });

  test("second public registration fails without an invite", async () => {
    const db = createAuthDatabase();

    await registerUser(
      {
        email: "owner@example.com",
        password: "babycare123",
        displayName: "Owner",
      },
      db,
    );

    const result = await registerUser(
      {
        email: "caregiver@example.com",
        password: "babycare123",
        displayName: "Caregiver",
      },
      db,
    );

    expect(result).toEqual({
      ok: false,
      error: "Registration requires an invitation.",
    });
  });

  test("invalid invite registration does not create an orphan user", async () => {
    const db = createAuthDatabase();

    await registerUser(
      {
        email: "owner@example.com",
        password: "babycare123",
        displayName: "Owner",
      },
      db,
    );

    const result = await registerUser(
      {
        email: "caregiver@example.com",
        password: "babycare123",
        displayName: "Caregiver",
        inviteToken: "invalid-token",
      },
      db,
    );

    expect(result).toEqual({
      ok: false,
      error: "Invitation is invalid or already used.",
    });
    await expect(db.user.count()).resolves.toBe(1);
  });

  test("login succeeds with valid credentials", async () => {
    const db = createAuthDatabase();

    await registerUser(
      {
        email: "owner@example.com",
        password: "babycare123",
        displayName: "Owner",
      },
      db,
    );

    await expect(
      authenticateUser(
        {
          email: "OWNER@example.com",
          password: "babycare123",
        },
        db,
      ),
    ).resolves.toEqual({ ok: true, userId: "user-1" });
  });

  test("users can update their display name", async () => {
    const db = createAuthDatabase();

    await registerUser(
      {
        email: "owner@example.com",
        password: "babycare123",
        displayName: "Owner",
      },
      db,
    );

    await expect(
      updateProfile(
        "user-1",
        {
          displayName: "Parent",
        },
        db,
      ),
    ).resolves.toEqual({ ok: true });
    await expect(
      authenticateUser(
        {
          email: "owner@example.com",
          password: "babycare123",
        },
        db,
      ),
    ).resolves.toEqual({ ok: true, userId: "user-1" });
  });

  test("users can update password with current password", async () => {
    const db = createAuthDatabase();

    await registerUser(
      {
        email: "owner@example.com",
        password: "babycare123",
        displayName: "Owner",
      },
      db,
    );

    await expect(
      updatePassword(
        "user-1",
        {
          currentPassword: "babycare123",
          newPassword: "newpassword123",
        },
        db,
      ),
    ).resolves.toEqual({ ok: true });
    await expect(
      authenticateUser(
        {
          email: "owner@example.com",
          password: "newpassword123",
        },
        db,
      ),
    ).resolves.toEqual({ ok: true, userId: "user-1" });
  });

  test("password update rejects invalid current password", async () => {
    const db = createAuthDatabase();

    await registerUser(
      {
        email: "owner@example.com",
        password: "babycare123",
        displayName: "Owner",
      },
      db,
    );

    await expect(
      updatePassword(
        "user-1",
        {
          currentPassword: "wrong-password",
          newPassword: "newpassword123",
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Current password is incorrect.",
    });
  });

  test("users can update milk unit preference", async () => {
    const db = createAuthDatabase();

    await expect(
      updatePreferences(
        "user-1",
        {
          milkUnit: "oz",
        },
        db,
      ),
    ).resolves.toEqual({ ok: true });
    expect(db.userPreference.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      create: {
        userId: "user-1",
        milkUnit: "oz",
      },
      update: {
        milkUnit: "oz",
      },
    });
  });

  test("milk unit preference rejects unsupported units", async () => {
    const db = createAuthDatabase();

    await expect(
      updatePreferences(
        "user-1",
        {
          milkUnit: "cup",
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Milk unit must be ml or oz.",
    });
    expect(db.userPreference.upsert).not.toHaveBeenCalled();
  });
});
