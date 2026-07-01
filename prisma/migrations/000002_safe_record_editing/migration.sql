-- Add record soft-delete and editor metadata.
ALTER TABLE "FeedingRecord"
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "deletedById" TEXT,
ADD COLUMN "updatedById" TEXT;

ALTER TABLE "DiaperRecord"
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "deletedById" TEXT,
ADD COLUMN "updatedById" TEXT;

ALTER TABLE "SleepRecord"
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "deletedById" TEXT,
ADD COLUMN "updatedById" TEXT;

DROP INDEX IF EXISTS "unique_active_breastfeeding_record_per_child";
DROP INDEX IF EXISTS "unique_active_sleep_record_per_child";

CREATE UNIQUE INDEX "unique_active_breastfeeding_record_per_child"
ON "FeedingRecord"("childId")
WHERE "type" = 'breast' AND "endTime" IS NULL AND "deletedAt" IS NULL;

CREATE UNIQUE INDEX "unique_active_sleep_record_per_child"
ON "SleepRecord"("childId")
WHERE "endTime" IS NULL AND "deletedAt" IS NULL;
