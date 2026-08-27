export type UserRecord = {
  id: string;
  displayName: string;
};

export type MembershipRecord = {
  familyId: string;
  role: "owner" | "caregiver";
  removedAt: Date | null;
};

export type BottleContent =
  | "formula"
  | "expressed_breast_milk"
  | "mixed"
  | "other"
  | "unknown";

export type StoolColor =
  | "yellow"
  | "brown"
  | "green"
  | "black"
  | "red"
  | "white"
  | "other"
  | "unknown";

export type StoolConsistency =
  | "watery"
  | "loose"
  | "soft"
  | "formed"
  | "hard"
  | "mucousy"
  | "other"
  | "unknown";

export type FeedingRecordCreateInput = {
  childId: string;
  creatorId: string;
  creatorDisplayName: string;
  type: "breast" | "bottle";
  breastSide?: "left" | "right" | "both" | "unknown";
  startTime: Date;
  endTime?: Date | null;
  amountMl?: number | null;
  bottleContent?: BottleContent | null;
  notes?: string | null;
};

export type SleepRecordCreateInput = {
  childId: string;
  creatorId: string;
  creatorDisplayName: string;
  startTime: Date;
  endTime?: Date | null;
  notes?: string | null;
};

export type ActiveFeedingRecord = {
  id: string;
  childId?: string;
  creatorId?: string;
  type?: "breast" | "bottle";
  breastSide?: "left" | "right" | "both" | "unknown" | null;
  startTime?: Date;
  endTime?: Date | null;
  amountMl?: number | null;
  bottleContent?: BottleContent | null;
  notes?: string | null;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type ActiveSleepRecord = {
  id: string;
  childId?: string;
  creatorId?: string;
  creatorDisplayName?: string;
  startTime?: Date;
  endTime?: Date | null;
  notes?: string | null;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type RecordsDatabase = {
  user: {
    findUnique: (args: {
      where: { id: string };
    }) => Promise<UserRecord | null>;
  };
  familyMember: {
    findFirst: (args: {
      where: {
        userId: string;
        removedAt: null;
      };
    }) => Promise<MembershipRecord | null>;
  };
  child: {
    findFirst: (args: {
      where: {
        id: string;
        familyId: string;
        archivedAt: null;
      };
    }) => Promise<{ id: string; familyId: string } | null>;
  };
  feedingRecord: {
    findFirst: (args: {
      where: {
        childId?: string;
        id?: string;
        type?: "breast" | "bottle";
        endTime?: null;
        deletedAt?: null;
      };
    }) => Promise<ActiveFeedingRecord | null>;
    create: (args: {
      data: FeedingRecordCreateInput;
    }) => Promise<{ id: string }>;
    update: (args: {
      where: { id: string };
      data: {
        breastSide?: "left" | "right" | "both" | "unknown" | null;
        startTime?: Date;
        endTime?: Date | null;
        amountMl?: number | null;
        bottleContent?: BottleContent | null;
        notes?: string | null;
        deletedAt?: Date;
        deletedById?: string;
        updatedById?: string;
      };
    }) => Promise<{ id: string }>;
    delete: (args: { where: { id: string } }) => Promise<{ id: string }>;
  };
  diaperRecord: {
    findFirst?: (args: {
      where: {
        childId?: string;
        id?: string;
        deletedAt?: null;
      };
    }) => Promise<{
      id: string;
      childId?: string;
      creatorId?: string;
      time?: Date;
      type?: "wet" | "dirty" | "both";
      stoolColor?: StoolColor | null;
      stoolConsistency?: StoolConsistency | null;
      notes?: string | null;
      updatedAt?: Date;
      deletedAt?: Date | null;
    } | null>;
    create: (args: {
      data: {
        childId: string;
        creatorId: string;
        creatorDisplayName: string;
        time: Date;
        type: "wet" | "dirty" | "both";
        stoolColor?: StoolColor | null;
        stoolConsistency?: StoolConsistency | null;
        notes?: string | null;
      };
    }) => Promise<{ id: string }>;
    update?: (args: {
      where: { id: string };
      data: {
        time?: Date;
        type?: "wet" | "dirty" | "both";
        stoolColor?: StoolColor | null;
        stoolConsistency?: StoolConsistency | null;
        notes?: string | null;
        deletedAt?: Date;
        deletedById?: string;
        updatedById?: string;
      };
    }) => Promise<{ id: string }>;
    delete?: (args: { where: { id: string } }) => Promise<{ id: string }>;
  };
  sleepRecord: {
    findFirst: (args: {
      where: {
        childId?: string;
        id?: string;
        endTime?: null;
        deletedAt?: null;
      };
    }) => Promise<ActiveSleepRecord | null>;
    create: (args: {
      data: SleepRecordCreateInput;
    }) => Promise<{ id: string }>;
    update: (args: {
      where: { id: string };
      data: {
        startTime?: Date;
        endTime?: Date | null;
        notes?: string | null;
        deletedAt?: Date;
        deletedById?: string;
        updatedById?: string;
      };
    }) => Promise<{ id: string }>;
    delete: (args: { where: { id: string } }) => Promise<{ id: string }>;
  };
};

export type RecordResult =
  | { ok: true; recordId: string }
  | { ok: false; error: string };

export type DeleteRecordResult = { ok: true } | { ok: false; error: string };
