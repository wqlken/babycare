CREATE TABLE "GrowthRecord" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "creatorDisplayName" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "lengthCm" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "GrowthRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GrowthRecord_childId_measuredAt_idx" ON "GrowthRecord"("childId", "measuredAt");
CREATE INDEX "GrowthRecord_creatorId_idx" ON "GrowthRecord"("creatorId");

ALTER TABLE "GrowthRecord" ADD CONSTRAINT "GrowthRecord_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
