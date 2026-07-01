import { describe, expect, test, vi } from "vitest";
import {
  acceptInvite,
  createInvite,
  removeFamilyMember,
  type FamilyDatabase,
} from "@/lib/family/service";

function createFamilyDatabase(role: "owner" | "caregiver" = "owner"): FamilyDatabase {
  const invites: Array<{
    id: string;
    familyId: string;
    tokenHash: string;
    invitedEmail: string;
    expiresAt: Date;
    usedAt: Date | null;
  }> = [];

  return {
    familyMember: {
      findFirst: vi.fn(async ({ where }) => {
        if (where.userId === "owner-1" || where.userId === "caregiver-1") {
          return {
            familyId: "family-1",
            role,
            removedAt: null,
            user: {
              displayName: "Owner",
              email: "owner@example.com",
            },
          };
        }

        return null;
      }),
      create: vi.fn(async ({ data }) => ({
        id: "member-1",
        ...data,
      })),
      findUnique: vi.fn(async ({ where }) => {
        if (where.id === "member-1") {
          return {
            id: "member-1",
            familyId: "family-1",
            userId: "owner-1",
            role: "owner" as const,
            removedAt: null,
            user: {
              displayName: "Owner",
              email: "owner@example.com",
            },
          };
        }

        if (where.id === "member-2") {
          return {
            id: "member-2",
            familyId: "family-1",
            userId: "caregiver-1",
            role: "caregiver" as const,
            removedAt: null,
            user: {
              displayName: "Caregiver",
              email: "caregiver@example.com",
            },
          };
        }

        return null;
      }),
      count: vi.fn(async ({ where }) => {
        if (where.familyId !== "family-1" || where.role !== "owner") {
          return 0;
        }

        return role === "owner" ? 1 : 0;
      }),
      update: vi.fn(async ({ where, data }) => ({
        id: where.id,
        familyId: "family-1",
        userId: "caregiver-1",
        role: "caregiver" as const,
        removedAt: data.removedAt,
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
});
