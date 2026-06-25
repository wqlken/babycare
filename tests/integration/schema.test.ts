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
});
