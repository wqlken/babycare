import { describe, expect, test } from "vitest";
import {
  DEFAULT_SEED_INPUT,
  createPasswordHash,
  readSeedInput,
} from "../../prisma/seed";

describe("development seed data", () => {
  test("uses stable default owner, family, and child values", () => {
    expect(DEFAULT_SEED_INPUT.ownerEmail).toBe("owner@example.com");
    expect(DEFAULT_SEED_INPUT.ownerDisplayName).toBe("家庭管理员");
    expect(DEFAULT_SEED_INPUT.familyName).toBe("我的家庭");
    expect(DEFAULT_SEED_INPUT.childName).toBe("宝宝");
  });

  test("allows environment overrides without changing defaults", () => {
    const input = readSeedInput({
      SEED_OWNER_EMAIL: "parent@example.com",
      SEED_OWNER_PASSWORD: "custom-password",
      SEED_CHILD_NAME: "小宝",
    });

    expect(input.ownerEmail).toBe("parent@example.com");
    expect(input.ownerPassword).toBe("custom-password");
    expect(input.childName).toBe("小宝");
    expect(input.familyName).toBe(DEFAULT_SEED_INPUT.familyName);
  });

  test("hashes the seed password instead of storing plaintext", async () => {
    const hash = await createPasswordHash("babycare123");

    expect(hash).not.toBe("babycare123");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });
});
