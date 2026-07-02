CREATE TYPE "BottleContent" AS ENUM ('formula', 'expressed_breast_milk', 'mixed', 'other', 'unknown');

CREATE TYPE "StoolColor" AS ENUM ('yellow', 'brown', 'green', 'black', 'red', 'white', 'other', 'unknown');

CREATE TYPE "StoolConsistency" AS ENUM ('watery', 'loose', 'soft', 'formed', 'hard', 'mucousy', 'other', 'unknown');

ALTER TABLE "FeedingRecord"
ADD COLUMN "bottleContent" "BottleContent";

ALTER TABLE "DiaperRecord"
ADD COLUMN "stoolColor" "StoolColor",
ADD COLUMN "stoolConsistency" "StoolConsistency";
