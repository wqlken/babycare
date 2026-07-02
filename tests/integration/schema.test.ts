import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const root = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Prisma schema", () => {
  test("defines V1 family, child, invite, and record models", () => {
    const schema = readProjectFile("prisma/schema.prisma");

    for (const model of [
      "User",
      "UserPreference",
      "Family",
      "FamilyMember",
      "Invite",
      "Child",
      "FeedingRecord",
      "DiaperRecord",
      "SleepRecord",
    ]) {
      expect(schema).toContain(`model ${model} {`);
    }
  });

  test("defines V1 role and record enums", () => {
    const schema = readProjectFile("prisma/schema.prisma");

    for (const enumName of [
      "FamilyRole",
      "FeedingType",
      "BreastSide",
      "DiaperType",
      "BottleContent",
      "StoolColor",
      "StoolConsistency",
    ]) {
      expect(schema).toContain(`enum ${enumName} {`);
    }

    expect(schema).toContain("owner");
    expect(schema).toContain("caregiver");
    expect(schema).toContain("breast");
    expect(schema).toContain("bottle");
  });

  test("adds database guards for one active sleep and breastfeeding record per child", () => {
    const migration = readProjectFile(
      "prisma/migrations/000001_init/migration.sql",
    );

    expect(migration).toContain("unique_active_sleep_record_per_child");
    expect(migration).toContain("unique_active_breastfeeding_record_per_child");
    expect(migration).toContain('"endTime" IS NULL');
  });

  test("defines soft delete and editor metadata for records", () => {
    const schema = readProjectFile("prisma/schema.prisma");

    for (const model of ["FeedingRecord", "DiaperRecord", "SleepRecord"]) {
      const modelStart = schema.indexOf(`model ${model} {`);
      const modelEnd = schema.indexOf("\n}", modelStart);
      const block = schema.slice(modelStart, modelEnd);

      expect(block).toContain("deletedAt");
      expect(block).toContain("deletedById");
      expect(block).toContain("updatedById");
    }
  });

  test("migrates record soft delete fields and active-record guards", () => {
    const migration = readProjectFile(
      "prisma/migrations/000002_safe_record_editing/migration.sql",
    );

    expect(migration).toContain('ADD COLUMN "deletedAt" TIMESTAMP(3)');
    expect(migration).toContain('ADD COLUMN "deletedById" TEXT');
    expect(migration).toContain('ADD COLUMN "updatedById" TEXT');
    expect(migration).toContain('"deletedAt" IS NULL');
    expect(migration).toContain("unique_active_sleep_record_per_child");
    expect(migration).toContain("unique_active_breastfeeding_record_per_child");
  });

  test("defines session revocation timestamp for password resets", () => {
    const schema = readProjectFile("prisma/schema.prisma");
    const migration = readProjectFile(
      "prisma/migrations/000003_family_administration/migration.sql",
    );

    expect(schema).toContain("sessionRevokedAt");
    expect(migration).toContain('ADD COLUMN "sessionRevokedAt" TIMESTAMP(3)');
  });

  test("defines V1.2 record detail fields", () => {
    const schema = readProjectFile("prisma/schema.prisma");

    expect(schema).toContain("bottleContent");
    expect(schema).toContain("stoolColor");
    expect(schema).toContain("stoolConsistency");
  });
});
