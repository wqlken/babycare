import { describe, expect, test, vi } from "vitest";
import {
  acceptInvite,
  createInvite,
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
});
