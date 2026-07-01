# Babycare Phased Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Babycare self-hosted family logging app in three phases: V1 core logging, V1.1 stability/data ownership, and V1.2 household polish.

**Architecture:** Use one Next.js App Router application for UI, authenticated server actions, and server-rendered data reads. Persist data in PostgreSQL through Prisma. Deploy with Docker Compose using an app container, database container, persistent volumes, and explicit migration/backup commands.

**Tech Stack:** Next.js, TypeScript, Prisma, PostgreSQL, Tailwind CSS, Playwright or Vitest where appropriate, Docker Compose.

**Current Status (2026-07-01):**

- Phase V1 is implemented on `main`.
- V1 implementation also includes follow-up management polish that was added after the original task list: baby profile settings, account profile/password settings, family member removal with last-owner protection, owner record deletion from the timeline, and bottle feeding edit controls.
- Phase V1.1 is implemented on `feat/v1-safe-record-editing`.
- Phase V1.2 remains incomplete.
- Latest verified commands on `feat/v1-safe-record-editing`: `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

---

## File Structure

Create this structure during implementation:

```text
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (app)/
    layout.tsx
    page.tsx
    children/page.tsx
    children/[childId]/page.tsx
    children/[childId]/feedings/new/page.tsx
    children/[childId]/diapers/new/page.tsx
    children/[childId]/sleep/page.tsx
    children/[childId]/timeline/page.tsx
    settings/account/page.tsx
    settings/family/page.tsx
  actions/
    auth.ts
    children.ts
    feedings.ts
    diapers.ts
    sleep.ts
    family.ts
    exports.ts
  api/export/[childId]/route.ts
  globals.css
  layout.tsx
components/
  app-shell.tsx
  child-switcher.tsx
  dashboard/
    active-timers.tsx
    summary-cards.tsx
    quick-actions.tsx
    seven-day-summary.tsx
  forms/
    feeding-form.tsx
    diaper-form.tsx
    sleep-form.tsx
lib/
  auth/
    password.ts
    session.ts
    guards.ts
  db.ts
  time.ts
  units.ts
  summaries.ts
  csv.ts
prisma/
  schema.prisma
  migrations/
scripts/
  backup-db.ps1
  restore-db.ps1
tests/
  unit/
    time.test.ts
    units.test.ts
    summaries.test.ts
  integration/
    auth.test.ts
    permissions.test.ts
    records.test.ts
    exports.test.ts
docker-compose.yml
Dockerfile
.env.example
package.json
```

Responsibilities:

- `app/actions/*`: server-side mutations and permission enforcement.
- `lib/auth/*`: password hashing, session lookup, and access guards.
- `lib/time.ts`: family timezone date boundaries, child age, and cross-midnight duration splitting.
- `lib/summaries.ts`: today and seven-day aggregation logic.
- `lib/units.ts`: ml/oz conversion and formatting.
- `lib/csv.ts`: CSV serialization for owner export.
- `prisma/schema.prisma`: source of truth for models, indexes, and enums.
- `tests/unit/*`: pure logic tests.
- `tests/integration/*`: database-backed behavior tests.

---

## Phase V1: Core Family Logging

### Task 1: Scaffold Next.js, Tooling, and Docker Baseline

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.env.example`

- [x] **Step 1: Initialize the app dependencies**

Run:

```powershell
npm create next-app@latest . -- --ts --tailwind --eslint --app --src-dir false --import-alias "@/*"
npm install @prisma/client prisma bcryptjs zod
npm install -D vitest tsx @types/bcryptjs
```

Expected: `package.json`, `app/`, `next.config.*`, and Tailwind files exist.

- [x] **Step 2: Add environment example**

Create `.env.example`:

```env
DATABASE_URL=postgresql://babycare:babycare@postgres:5432/babycare
AUTH_SECRET=change-me-with-openssl-rand-base64-32
APP_URL=http://localhost:3000
FAMILY_TIMEZONE=Asia/Shanghai
```

- [x] **Step 3: Add Docker Compose**

Create `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: babycare
      POSTGRES_USER: babycare
      POSTGRES_PASSWORD: babycare
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U babycare -d babycare"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    depends_on:
      postgres:
        condition: service_healthy
    env_file:
      - .env
    ports:
      - "3000:3000"
    command: sh -c "npx prisma migrate deploy && npm run start"

volumes:
  postgres-data:
```

- [x] **Step 4: Add Dockerfile**

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "run", "start"]
```

- [x] **Step 5: Verify scaffold**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands pass.

- [x] **Step 6: Commit**

```powershell
git add package.json package-lock.json tsconfig.json next.config.* app Dockerfile docker-compose.yml .env.example
git commit -m "chore: scaffold Next.js Docker app"
```

### Task 2: Prisma Schema for V1 Core

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`
- Test: `tests/integration/schema.test.ts`

- [x] **Step 1: Define Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum FamilyRole {
  owner
  caregiver
}

enum FeedingType {
  breast
  bottle
}

enum BreastSide {
  left
  right
  both
  unknown
}

enum DiaperType {
  wet
  dirty
  both
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  displayName  String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  memberships FamilyMember[]
  preference  UserPreference?
}

model UserPreference {
  id             String   @id @default(cuid())
  userId         String   @unique
  currentChildId String?
  milkUnit       String   @default("ml")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  currentChild Child? @relation(fields: [currentChildId], references: [id])
}

model Family {
  id        String   @id @default(cuid())
  name      String
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members FamilyMember[]
  invites Invite[]
  children Child[]
}

model FamilyMember {
  id        String     @id @default(cuid())
  familyId  String
  userId    String
  role      FamilyRole
  joinedAt  DateTime   @default(now())
  removedAt DateTime?

  family Family @relation(fields: [familyId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([familyId, userId])
}

model Invite {
  id           String   @id @default(cuid())
  familyId     String
  tokenHash    String   @unique
  invitedEmail String
  expiresAt    DateTime
  usedAt       DateTime?
  createdAt    DateTime @default(now())

  family Family @relation(fields: [familyId], references: [id], onDelete: Cascade)
}

model Child {
  id        String   @id @default(cuid())
  familyId  String
  name      String
  birthday  DateTime
  gender    String?
  notes     String?
  archivedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  family Family @relation(fields: [familyId], references: [id], onDelete: Cascade)
  feedings FeedingRecord[]
  diapers  DiaperRecord[]
  sleeps   SleepRecord[]
  preferences UserPreference[]
}

model FeedingRecord {
  id                  String      @id @default(cuid())
  childId             String
  creatorId           String
  creatorDisplayName  String
  type                FeedingType
  breastSide          BreastSide?
  startTime           DateTime
  endTime             DateTime?
  amountMl            Int?
  notes               String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  child Child @relation(fields: [childId], references: [id], onDelete: Cascade)
}

model DiaperRecord {
  id                 String     @id @default(cuid())
  childId            String
  creatorId          String
  creatorDisplayName String
  time               DateTime
  type               DiaperType
  notes              String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  child Child @relation(fields: [childId], references: [id], onDelete: Cascade)
}

model SleepRecord {
  id                 String   @id @default(cuid())
  childId            String
  creatorId          String
  creatorDisplayName String
  startTime          DateTime
  endTime            DateTime?
  notes              String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  child Child @relation(fields: [childId], references: [id], onDelete: Cascade)
}
```

- [x] **Step 2: Add Prisma client helper**

Create `lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [x] **Step 3: Generate migration**

Run:

```powershell
npx prisma migrate dev --name init
npx prisma generate
```

Expected: migration created and Prisma client generated.

- [x] **Step 4: Commit**

```powershell
git add prisma lib/db.ts
git commit -m "feat: add core data schema"
```

### Task 3: Authentication, Bootstrap Registration, and Guards

**Files:**
- Create: `lib/auth/password.ts`
- Create: `lib/auth/session.ts`
- Create: `lib/auth/guards.ts`
- Create: `app/actions/auth.ts`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Test: `tests/integration/auth.test.ts`

- [x] **Step 1: Add password helpers**

Create `lib/auth/password.ts`:

```ts
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

- [x] **Step 2: Add cookie-based session helper**

Create `lib/auth/session.ts`:

```ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "babycare_user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(COOKIE_NAME)?.value;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
```

- [x] **Step 3: Add registration/login actions**

Create `app/actions/auth.ts` with actions for bootstrap registration, invite registration, login, and logout. The first registration creates `Family`, `FamilyMember(owner)`, and `UserPreference`. Later registration without invite returns an error.

- [x] **Step 4: Add auth pages**

Create login and register pages with email/password/display name forms that call the server actions.

- [x] **Step 5: Test auth rules**

Run:

```powershell
npm test -- tests/integration/auth.test.ts
```

Expected: bootstrap registration passes; second public registration fails; login succeeds with valid credentials.

- [x] **Step 6: Commit**

```powershell
git add lib/auth app/actions/auth.ts "app/(auth)"
git commit -m "feat: add bootstrap authentication"
```

### Task 4: Child Onboarding and App Shell

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `components/app-shell.tsx`
- Create: `components/child-switcher.tsx`
- Create: `app/actions/children.ts`
- Create: `app/(app)/children/page.tsx`
- Modify: `app/(app)/page.tsx`
- Test: `tests/integration/children.test.ts`

- [x] **Step 1: Add child actions**

Implement create child, set current child, and list accessible children. V1 should block hard delete.

- [x] **Step 2: Add app layout guard**

App layout requires an authenticated user and active family membership. If no child exists, route to `/children`.

- [x] **Step 3: Add child list/create page**

Create a form for name, birthday, gender, and notes. After creation, set `currentChildId`.

- [x] **Step 4: Add child switcher**

Render child name and day/month age. Allow switching current child.

- [x] **Step 5: Run tests**

Run:

```powershell
npm test -- tests/integration/children.test.ts
```

Expected: no-child users route to child creation; creating a child sets current child.

- [x] **Step 6: Commit**

```powershell
git add app components tests/integration/children.test.ts
git commit -m "feat: add child onboarding"
```

### Task 5: Time, Units, and Summary Logic

**Files:**
- Create: `lib/time.ts`
- Create: `lib/units.ts`
- Create: `lib/summaries.ts`
- Test: `tests/unit/time.test.ts`
- Test: `tests/unit/units.test.ts`
- Test: `tests/unit/summaries.test.ts`

- [x] **Step 1: Add time helpers**

Implement Asia/Shanghai day boundaries, child age display, and overlap duration splitting.

- [x] **Step 2: Add unit helpers**

Implement ml/oz conversion with internal ml storage.

- [x] **Step 3: Add summary helpers**

Implement today totals and 7-day summary inputs/outputs.

- [x] **Step 4: Run tests**

Run:

```powershell
npm test -- tests/unit/time.test.ts tests/unit/units.test.ts tests/unit/summaries.test.ts
```

Expected: cross-midnight sleep splits correctly; oz input converts to ml.

- [x] **Step 5: Commit**

```powershell
git add lib/time.ts lib/units.ts lib/summaries.ts tests/unit
git commit -m "feat: add time and summary helpers"
```

### Task 6: V1 Feeding, Diaper, and Sleep Records

**Files:**
- Create: `app/actions/feedings.ts`
- Create: `app/actions/diapers.ts`
- Create: `app/actions/sleep.ts`
- Create: `components/forms/feeding-form.tsx`
- Create: `components/forms/diaper-form.tsx`
- Create: `components/forms/sleep-form.tsx`
- Create: route pages under `app/(app)/children/[childId]/...`
- Test: `tests/integration/records.test.ts`

- [x] **Step 1: Add feeding actions**

Support bottle one-shot records and breastfeeding start/stop with one active breastfeeding per child.

- [x] **Step 2: Add diaper actions**

Support wet/dirty/both records with notes.

- [x] **Step 3: Add sleep actions**

Support sleep start/stop and backfill with one active sleep per child.

- [x] **Step 4: Add forms and pages**

Create mobile-first forms. Keep optional details collapsed by default.

- [x] **Step 5: Run tests**

Run:

```powershell
npm test -- tests/integration/records.test.ts
```

Expected: records create successfully, duplicate active sleep/breastfeeding fails.

- [x] **Step 6: Commit**

```powershell
git add app/actions components/forms "app/(app)/children" tests/integration/records.test.ts
git commit -m "feat: add core baby records"
```

### Task 7: V1 Dashboard and Timeline

**Files:**
- Create: `components/dashboard/summary-cards.tsx`
- Create: `components/dashboard/active-timers.tsx`
- Create: `components/dashboard/quick-actions.tsx`
- Modify: `app/(app)/page.tsx`
- Create: `app/(app)/children/[childId]/timeline/page.tsx`

- [x] **Step 1: Build dashboard query**

Load current child, active timers, last records, and today totals.

- [x] **Step 2: Render dashboard**

Render summary cards, active timers, and quick actions.

- [x] **Step 3: Build timeline**

List feeding, diaper, and sleep records by date. Show creator display name and notes in details.

- [x] **Step 4: Run build**

Run:

```powershell
npm run build
```

Expected: build passes.

- [x] **Step 5: Commit**

```powershell
git add app components/dashboard
git commit -m "feat: add dashboard and timeline"
```

### Task 8: V1 Family Settings and Invitations

**Files:**
- Create: `app/actions/family.ts`
- Create: `app/(app)/settings/family/page.tsx`
- Test: `tests/integration/permissions.test.ts`

- [x] **Step 1: Add invite creation**

Owner creates invite token bound to email. Store token hash and expiry.

- [x] **Step 2: Add invite acceptance**

Register/login with invite token and matching email joins family.

- [x] **Step 3: Add family settings UI**

Show members and generated invite link. No email sending in V1.

- [x] **Step 4: Run permissions tests**

Run:

```powershell
npm test -- tests/integration/permissions.test.ts
```

Expected: cross-family access blocked; mismatched invite email rejected.

- [x] **Step 5: Commit**

```powershell
git add app/actions/family.ts "app/(app)/settings/family" tests/integration/permissions.test.ts
git commit -m "feat: add family invitations"
```

### Task 9: V1 Docker Backup and Restore

**Files:**
- Create: `scripts/backup-db.ps1`
- Create: `scripts/restore-db.ps1`
- Modify: `README.md`

- [x] **Step 1: Add backup script**

Create `scripts/backup-db.ps1`:

```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Force -Path ".\backups" | Out-Null
docker compose exec -T postgres pg_dump -U babycare -d babycare | Out-File -Encoding utf8 ".\backups\babycare-$timestamp.sql"
Write-Host "Backup written to .\backups\babycare-$timestamp.sql"
```

- [x] **Step 2: Add restore script**

Create `scripts/restore-db.ps1`:

```powershell
param([Parameter(Mandatory=$true)][string]$Path)
Get-Content $Path | docker compose exec -T postgres psql -U babycare -d babycare
Write-Host "Restore completed from $Path"
```

- [x] **Step 3: Document Docker flow**

Update `README.md` with:

```markdown
## Docker

1. Copy `.env.example` to `.env`.
2. Update `AUTH_SECRET` and `APP_URL`.
3. Run `docker compose up -d --build`.
4. Back up with `powershell -File scripts/backup-db.ps1`.
5. Restore with `powershell -File scripts/restore-db.ps1 -Path backups/<file>.sql`.
```

- [x] **Step 4: Commit**

```powershell
git add scripts README.md
git commit -m "docs: add Docker backup workflow"
```

---

## Phase V1.1: Stability and Data Ownership

### Task 10: Soft Delete and Optimistic Edits

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: record actions in `app/actions/*.ts`
- Test: `tests/integration/records.test.ts`

- [x] Add `deletedAt`, `deletedById`, `updatedById` to record models.
- [x] Generate migration.
- [x] Update list and summary queries to exclude soft-deleted records.
- [x] Update edit actions to require matching `updatedAt`.
- [x] Run integration tests.
- [x] Commit with `feat: add safe record editing`.

### Task 11: CSV Export

**Files:**
- Create: `lib/csv.ts`
- Create: `app/api/export/[childId]/route.ts`
- Test: `tests/integration/exports.test.ts`

- [x] Implement CSV serialization with UTC and local timestamps.
- [x] Add owner-only export route with child and date range.
- [x] Exclude soft-deleted records by default.
- [x] Include notes and creator display name snapshot.
- [x] Run export tests.
- [x] Commit with `feat: add owner CSV export`.

### Task 12: Role Management and Password Reset

**Files:**
- Modify: `app/actions/family.ts`
- Modify: `app/(app)/settings/family/page.tsx`
- Test: `tests/integration/permissions.test.ts`

- [x] Add owner-only role promotion/demotion.
- [x] Block removing or demoting the last owner.
- [x] Add owner reset temporary password for caregivers.
- [x] Invalidate affected user sessions.
- [x] Run permissions tests.
- [x] Commit with `feat: add family administration`.

### Task 13: Seven-Day Summary and PWA Metadata

**Files:**
- Create: `components/dashboard/seven-day-summary.tsx`
- Modify: `app/(app)/page.tsx`
- Create: `app/manifest.ts`
- Modify: `app/layout.tsx`

- [x] Render 7-day summary table/list.
- [x] Add PWA manifest and mobile shell metadata.
- [x] Add network-unavailable handling for failed writes.
- [x] Run build.
- [x] Commit with `feat: add summary and PWA metadata`.

---

## Phase V1.2: Data Detail and Household Polish

### Task 14: Bottle, Diaper, and Unit Details

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: feeding and diaper forms/actions.
- Modify: `lib/units.ts`
- Test: `tests/integration/records.test.ts`
- Test: `tests/unit/units.test.ts`

- [ ] Add `bottleContent`, `stoolColor`, and `stoolConsistency`.
- [ ] Add `milkUnit` preference UI.
- [ ] Convert oz input into stored ml.
- [ ] Keep optional fields collapsed in quick forms.
- [ ] Run unit and integration tests.
- [ ] Commit with `feat: add record details`.

### Task 15: Child Archiving and Creator Snapshots

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: child actions and child switcher.
- Modify: record creation actions.
- Test: `tests/integration/children.test.ts`
- Test: `tests/integration/records.test.ts`

- [ ] Add `archivedAt` behavior for children.
- [ ] Hide archived children from default selection.
- [ ] Block normal new records for archived children.
- [ ] Store creator display name snapshot on record creation.
- [ ] Run tests.
- [ ] Commit with `feat: add household data polish`.

### Task 16: Final Verification

**Files:**
- Modify: `README.md`

- [ ] Run all tests:

```powershell
npm test
```

- [ ] Run production build:

```powershell
npm run build
```

- [ ] Run Docker smoke test:

```powershell
docker compose up -d --build
docker compose ps
powershell -File scripts/backup-db.ps1
docker compose down
```

- [ ] Update README with final development, test, Docker, backup, and deployment commands.
- [ ] Commit with `docs: finalize project instructions`.

---

## Self-Review

Spec coverage:

- V1 covers Docker, PostgreSQL, auth, invite registration, onboarding, child profile, quick records, dashboard, timeline, permissions, and backup.
- V1.1 covers soft delete, optimistic edits, CSV export, owner password reset, role management, 7-day summary, and PWA metadata.
- V1.2 covers bottle content, stool details, unit preference, child archiving, creator snapshot, and edited-state polish.

Known sequencing constraints:

- Task 2 must complete before any database-backed task.
- Task 3 must complete before protected app routes.
- Task 5 should complete before dashboard summaries.
- V1.1 and V1.2 tasks should not start until V1 passes build and core integration tests.

No intentional incomplete sections remain. If implementation discovers framework-generated path differences, preserve the responsibilities above and update paths consistently.
