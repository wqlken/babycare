import { describe, expect, test, vi } from "vitest";
import {
  acceptInvite,
  createInvite,
  resetCaregiverPassword,
  updateFamilyMemberRole,
  removeFamilyMember,
  type FamilyDatabase,
} from "@/lib/family/service";

function createFamilyDatabase(
  role: "owner" | "caregiver" = "owner",
  options?: { includeSecondOwner?: boolean },
): FamilyDatabase {
  const invites: Array<{
    id: string;
    familyId: string;
    tokenHash: string;
    invitedEmail: string;
    expiresAt: Date;
    usedAt: Date | null;
  }> = [];
  const members = [
    {
      id: "member-1",
      familyId: "family-1",
      userId: "owner-1",
      role: "owner" as const,
      removedAt: null,
      user: {
        displayName: "Owner",
        email: "owner@example.com",
      },
    },
    {
      id: "member-2",
      familyId: "family-1",
      userId: "caregiver-1",
      role: "caregiver" as const,
      removedAt: null,
      user: {
        displayName: "Caregiver",
        email: "caregiver@example.com",
      },
    },
    ...(options?.includeSecondOwner
      ? [
          {
            id: "member-3",
            familyId: "family-1",
            userId: "owner-2",
            role: "owner" as const,
            removedAt: null,
            user: {
              displayName: "Second Owner",
              email: "owner2@example.com",
            },
          },
        ]
      : []),
  ];

  return {
    familyMember: {
      findFirst: vi.fn(async ({ where }) => {
        if (where.userId === "owner-1" || where.userId === "caregiver-1") {
          const member = members.find((item) => item.userId === where.userId);
          if (!member) return null;

          return {
            familyId: member.familyId,
            role,
            removedAt: member.removedAt,
            user: member.user,
          };
        }

        return null;
      }),
      create: vi.fn(async ({ data }) => ({
        id: "member-1",
        ...data,
      })),
      findUnique: vi.fn(async ({ where }) => {
        return members.find((member) => member.id === where.id) ?? null;
      }),
      count: vi.fn(async ({ where }) => {
        if (where.familyId !== "family-1" || where.role !== "owner") {
          return 0;
        }

        return members.filter(
          (member) => member.role === "owner" && member.removedAt === null,
        ).length;
      }),
      update: vi.fn(async ({ where, data }) => ({
        ...members.find((member) => member.id === where.id)!,
        ...data,
      })),
    },
    user: {
      update: vi.fn(async ({ where, data }) => ({
        id: where.id,
        ...data,
      })),
    },
    invite: {
      create: vi.fn(async ({ data }) => {
        const invite = {
          id: `invite-${invites.length + 1}`,
          familyId: data.familyId,
          tokenHash: data.tokenHash,
          invitedEmail: data.invitedEmail,
          expiresAt: data.expiresAt,
          usedAt: null,
        };
        invites.push(invite);
        return invite;
      }),
      findFirst: vi.fn(async ({ where }) => {
        return (
          invites.find(
            (invite) =>
              invite.tokenHash === where.tokenHash &&
              invite.usedAt === where.usedAt,
          ) ?? null
        );
      }),
      update: vi.fn(async ({ where, data }) => {
        const invite = invites.find((item) => item.id === where.id);
        if (!invite) throw new Error("Invite not found.");
        invite.usedAt = data.usedAt;
        return invite;
      }),
    },
  };
}

describe("family permissions and invitations", () => {
  test("owners can create email-bound invites", async () => {
    const db = createFamilyDatabase("owner");

    const result = await createInvite(
      "owner-1",
      {
        email: "Caregiver@Example.com",
        appUrl: "http://localhost:3000",
        now: new Date("2026-06-25T00:00:00.000Z"),
      },
      db,
    );

    expect(result.ok).toBe(true);
    expect(db.invite.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        familyId: "family-1",
        invitedEmail: "caregiver@example.com",
      }),
    });
  });

  test("caregivers cannot create invites", async () => {
    const db = createFamilyDatabase("caregiver");

    await expect(
      createInvite(
        "caregiver-1",
        {
          email: "new@example.com",
          appUrl: "http://localhost:3000",
          now: new Date("2026-06-25T00:00:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Only owners can create invitations.",
    });
  });

  test("invite acceptance rejects mismatched email", async () => {
    const db = createFamilyDatabase("owner");
    const invite = await createInvite(
      "owner-1",
      {
        email: "caregiver@example.com",
        appUrl: "http://localhost:3000",
        now: new Date("2026-06-25T00:00:00.000Z"),
      },
      db,
    );

    if (!invite.ok) throw new Error(invite.error);

    await expect(
      acceptInvite(
        {
          token: invite.token,
          userId: "user-2",
          email: "other@example.com",
          now: new Date("2026-06-25T00:00:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Invitation email does not match this account.",
    });
  });

  test("owners can remove caregivers from the same family", async () => {
    const db = createFamilyDatabase("owner");

    await expect(
      removeFamilyMember(
        "owner-1",
        {
          memberId: "member-2",
          now: new Date("2026-06-25T00:00:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({ ok: true });
    expect(db.familyMember.update).toHaveBeenCalledWith({
      where: { id: "member-2" },
      data: { removedAt: new Date("2026-06-25T00:00:00.000Z") },
    });
  });

  test("caregivers cannot remove family members", async () => {
    const db = createFamilyDatabase("caregiver");

    await expect(
      removeFamilyMember(
        "caregiver-1",
        {
          memberId: "member-2",
          now: new Date("2026-06-25T00:00:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Only owners can manage family members.",
    });
  });

  test("owners cannot remove themselves as the last owner", async () => {
    const db = createFamilyDatabase("owner");

    await expect(
      removeFamilyMember(
        "owner-1",
        {
          memberId: "member-1",
          now: new Date("2026-06-25T00:00:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "A family must keep at least one owner.",
    });
  });

  test("owners can promote caregivers to owners", async () => {
    const db = createFamilyDatabase("owner");

    await expect(
      updateFamilyMemberRole(
        "owner-1",
        {
          memberId: "member-2",
          role: "owner",
        },
        db,
      ),
    ).resolves.toEqual({ ok: true });
    expect(db.familyMember.update).toHaveBeenCalledWith({
      where: { id: "member-2" },
      data: { role: "owner" },
    });
  });

  test("owners cannot demote the last owner", async () => {
    const db = createFamilyDatabase("owner");

    await expect(
      updateFamilyMemberRole(
        "owner-1",
        {
          memberId: "member-1",
          role: "caregiver",
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "A family must keep at least one owner.",
    });
  });

  test("caregivers cannot change roles", async () => {
    const db = createFamilyDatabase("caregiver");

    await expect(
      updateFamilyMemberRole(
        "caregiver-1",
        {
          memberId: "member-2",
          role: "owner",
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Only owners can manage family members.",
    });
  });

  test("owners can reset caregiver temporary passwords and revoke sessions", async () => {
    const db = createFamilyDatabase("owner");
    const now = new Date("2026-06-25T00:00:00.000Z");

    const result = await resetCaregiverPassword(
      "owner-1",
      {
        memberId: "member-2",
        now,
      },
      db,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.temporaryPassword).toHaveLength(16);
    expect(db.user?.update).toHaveBeenCalledWith({
      where: { id: "caregiver-1" },
      data: {
        passwordHash: expect.any(String),
        sessionRevokedAt: now,
      },
    });
  });

  test("owners cannot reset owner passwords through caregiver reset", async () => {
    const db = createFamilyDatabase("owner", { includeSecondOwner: true });

    await expect(
      resetCaregiverPassword(
        "owner-1",
        {
          memberId: "member-3",
          now: new Date("2026-06-25T00:00:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Only caregiver passwords can be reset by owners.",
    });
  });
});
