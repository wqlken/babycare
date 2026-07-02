# Babycare MVP Design

## Goal

Build a stable self-hosted baby care tracking app for the user's family. The first release focuses on quick daily logging for feeding, diapers, and sleep. The app must run with Docker on a home NAS or small server, support family access through accounts and invitations, and leave room for later expansion into growth, medicine, temperature, pumping, and richer reports.

## Delivery Phases

The full design remains the target product direction, but implementation should be delivered in phases so the first Docker deployment becomes usable before every refinement is complete.

## Current Implementation Status

Status as of 2026-07-02:

- V1 core family logging is implemented on `main`.
- Implemented V1 scope includes bootstrap registration, invite-bound registration, login/logout, first-child onboarding, current child preference, baby profile editing, account settings, family invitations, caregiver removal with last-owner protection, feeding/diaper/sleep logging, breastfeeding and sleep start/stop timers, dashboard summaries, recent records, timeline display, owner record deletion, bottle feeding edit controls, Docker Compose, and manual backup/restore scripts.
- V1.1 soft deletion, edited metadata, optimistic bottle editing, owner CSV export, family administration, seven-day summary, PWA metadata, and network-unavailable handling are implemented on `main`.
- V1.2 bottle content, stool details, milk unit preference, ounce input conversion, child archiving, archived-child record blocking, and creator display name snapshot coverage are implemented on `main` and tagged as `v1.2.0`.
- Latest verified commands on `main`: `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Docker smoke testing was not run locally because Docker CLI is not installed in this environment.

### V1: Core Family Logging

V1 includes:

- Account registration and login.
- A family workspace created by the first user.
- Invitation links for family members and caregivers.
- First-run onboarding that creates the default family and guides creation of the first child.
- Baby profiles with name, birthday, gender, and notes.
- Fast mobile-first logging for feedings, diapers, and sleep.
- Timer-based start and stop flows for breastfeeding and sleep.
- A dashboard showing last events and today's totals.
- A daily timeline with edit and delete controls.
- Current child selection, child age display, and clear selected-child labels on record forms.
- Basic owner/caregiver permissions and family data isolation.
- Docker Compose deployment with PostgreSQL.
- Manual database backup and restore instructions.

### V1.1: Stability and Data Ownership

V1.1 adds:

- Soft deletion for records.
- Optimistic concurrency control for edits.
- Owner CSV export for a child's feeding, diaper, and sleep records.
- Owner temporary password reset for caregivers.
- Role promotion and demotion with last-owner protection.
- A lightweight recent 7-day summary for feeding, diapers, and sleep.
- Basic PWA install support for phone home-screen access.

### V1.2: Data Detail and Household Polish

V1.2 adds:

- Bottle content classification.
- Stool color and consistency.
- User display unit preference for milk volume, with internal storage in milliliters.
- Child archiving for children that should be hidden from normal use.
- Creator display name snapshots.
- Edited-state display in the timeline.

All phases exclude solids, pumping, temperature, medicine, growth charts, AI chat, native mobile apps, offline writes, active notifications, public APIs, API tokens, MCP, third-party integrations, and advanced reports. These are planned for later product phases after the core workflow is stable.

## Technical Approach

Use Next.js with the App Router, TypeScript, Prisma, PostgreSQL, Tailwind CSS, and Docker Compose.

The Next.js application will serve both the UI and the backend behavior. Form-oriented writes should start with Server Actions to reduce duplicated client/API logic. API routes can be added later for highly interactive flows or external integrations.

V1 authentication uses email and password login. Email verification and self-service password reset are out of scope for the first release. Registration uses a bootstrap-plus-invite model: if the system has no users, the first registered user becomes the owner of the first family workspace; after that, registration requires a valid invitation token.

The V1 through V1.2 product phases do not provide a public REST API, API tokens, MCP server, mobile-app API, or third-party integration surface. All user operations are performed through authenticated web sessions.

Docker Compose will run:

- `app`: the Next.js application.
- `postgres`: the PostgreSQL database with a persistent volume.

The deployment should work first on a LAN at `http://host-ip:3000`, then support public access through a reverse proxy such as Caddy, Nginx Proxy Manager, or NAS-provided reverse proxy tooling.

## Product Structure

Routes:

- `/login`: account login.
- `/register`: account registration and invite acceptance.
- `/`: current child dashboard.
- `/children`: child list and creation.
- `/children/[childId]`: child details and settings.
- `/children/[childId]/feedings/new`: create a feeding record.
- `/children/[childId]/diapers/new`: create a diaper record.
- `/children/[childId]/sleep`: start, end, or backfill sleep.
- `/children/[childId]/timeline`: daily activity timeline.
- `/settings/family`: family members and invitations.
- `/settings/account`: profile and password settings.

First-run onboarding should be explicit. The first registered owner automatically gets a default family workspace, then is guided to create the first child. If a logged-in family has no children, the root dashboard should redirect or route the user into the child creation flow instead of showing an empty dashboard.

The dashboard should be optimized for one-handed phone use. It should show time since the last feeding, diaper, and sleep event, today's feeding count and bottle volume, today's diaper count, today's sleep duration, and large actions for feeding, diaper, and sleep logging. In-progress breastfeeding and sleep records should appear as active timer states on the dashboard with clear stop actions. Bottle feeding and diaper logging remain one-shot quick forms.

Fast logging is a product acceptance criterion. Bottle and diaper records should be savable from the dashboard path with at most two user actions after choosing the action, using sensible defaults and optional expandable details. Breastfeeding and sleep should support one action to start and one action to stop. Less common fields belong in expandable sections or later edit views.

Each user should have a `currentChildId` preference. The root dashboard uses the user's current child when available; otherwise it selects the first child in the family. All new record pages must show the selected child's name clearly and allow switching children before saving, to reduce accidental logging to the wrong child. The dashboard and child switcher should show the child's day age or month age based on birthday and the family timezone; growth charts remain out of scope for the initial product phases.

The "time since last feeding" display should use the feeding completion time. For completed breastfeeding this is `endTime`; for bottle feeding this is the event or start time. If breastfeeding is currently active, the dashboard should show an active breastfeeding timer instead of a stale interval.

The V1 through V1.2 product phases do not send system notifications, Push notifications, SMS, email reminders, or scheduled alerts. Reminder behavior is passive: the dashboard shows how long it has been since the last feeding, diaper, and sleep event.

The V1.1 recent 7-day summary should provide basic trend visibility without a charting dependency. It should show daily feeding count, bottle total, diaper count, and sleep total duration as a table or simple list. Complex charts and configurable reports remain out of scope for the initial product phases.

Record notes are visible to all members of the same family and are included in CSV exports. Notes should not appear on the dashboard summary; they should appear only in timeline details and edit views.

Date-based summaries should use the family timezone. The initial default is `Asia/Shanghai`, with the model leaving room for a future family-level timezone setting. Feeding and diaper records belong to the day containing their start or event time. Sleep duration is split by overlap with each day, so a 23:00-01:00 sleep session contributes one hour to each day.

V1.1 PWA support means install metadata and mobile-friendly shell behavior. The initial product phases do not support offline writes, offline queues, or conflict resolution. If the app is offline or a write request cannot reach the server, the UI should show a clear network-unavailable message and avoid pretending the record was saved.

## Data Model

Core entities:

- `User`: email, password hash, display name, timestamps.
- `UserPreference`: user, current child, milk volume unit, timestamps.
- `Family`: name, creator, timestamps.
- `FamilyMember`: family, user, role, joined time.
- `Invite`: family, token, invited email, expiry, used status.
- `Child`: family, name, birthday, gender, notes, archived status, timestamps.
- `FeedingRecord`: child, creator, creator display name snapshot, type, breast side, bottle content, start time, end time, amount in ml, notes, update metadata, soft deletion fields.
- `DiaperRecord`: child, creator, creator display name snapshot, time, type, stool color, stool consistency, notes, update metadata, soft deletion fields.
- `SleepRecord`: child, creator, creator display name snapshot, start time, end time, notes, update metadata, soft deletion fields.

Feeding type values are `breast` and `bottle`. Breastfeeding records support `breastSide` values of `left`, `right`, `both`, and `unknown`. V1 supports a single side value per breastfeeding record and does not model multiple side switches inside one session. Bottle records use `amountMl`; V1.2 adds optional `bottleContent`.

Bottle content values are `formula`, `expressed_breast_milk`, `mixed`, `other`, and `unknown`. The default is `unknown`, and the field should not be required in the quick logging flow.

Milk volume is stored internally in milliliters. Users may prefer input and display in `ml` or `oz`, defaulting to `ml`. Input in ounces should be converted to milliliters before persistence. CSV exports must include `amountMl`; they may also include display-unit columns.

Diaper type values are `wet`, `dirty`, and `both`. Dirty and both diaper records may include optional `stoolColor` and `stoolConsistency` fields. Wet-only records should not store stool details.

A sleep record with no end time represents an active sleep session. A breastfeeding record with no end time represents an active breastfeeding session.

Soft deletion fields are `deletedAt` and `deletedById`. Default lists and summary calculations must exclude soft-deleted records. The first release may hide deleted records without offering a restore UI, but the data model must preserve enough information for future recovery.

All editable record tables should store `updatedAt` and `updatedById`. V1.1 does not require a field-level audit log. Timeline entries should show an "edited" state when a record has been modified after creation. Edit forms should use `updatedAt` for optimistic concurrency control: if the submitted `updatedAt` no longer matches the current record, the save should be rejected and the user should be asked to refresh or reapply changes.

Record rows should store a creator display name snapshot so timeline and CSV exports remain understandable if a family member is later removed or renamed.

The database must enforce that each child has at most one active, non-deleted sleep record. In PostgreSQL this should be implemented with a partial unique index on active sleep records, such as `childId WHERE endTime IS NULL AND deletedAt IS NULL`.

The database should also enforce that each child has at most one active, non-deleted breastfeeding record. In PostgreSQL this should be implemented with a partial unique index scoped to breast feeding records with `endTime IS NULL AND deletedAt IS NULL`.

Later phase B features should be added as separate tables, not overloaded into the first three record types.

## Permissions

Only family members may access a family's children and records.

Roles:

- `owner`: manage children, invite members, remove members, and delete records.
- `caregiver`: view all records, create records, and edit records they created.

Owners may edit and soft-delete all records. Caregivers may edit only records they created and may not delete records in the first release. Record deletion should be owner-only to reduce accidental data loss. Every record should show the creator so family members can see who logged it.

Invitations must be bound to an invited email address. A token may only be accepted by a user with the same email address, after login or registration. V1 does not need to send invitation emails; the owner can copy the generated invitation link and share it manually.

Owners may reset a temporary password for caregiver accounts in the same family. Owners may not reset their own password through this flow. A password reset by owner must update the password hash and invalidate existing sessions for that user.

Owners may promote caregivers to owner or demote other owners to caregiver. The system must always keep at least one owner in each family. It must block removing, demoting, or otherwise leaving a family without an owner.

The initial product phases must not hard-delete families or children. V1.2 adds child archiving to hide children from default lists and prevent normal new logging until unarchived. Family members may be removed from active membership, but their historical records remain attached to the family and use the creator display name snapshot for display.

## Validation Rules

- Bottle feeding requires an amount in milliliters.
- Bottle content, when present, must use the allowed enum values.
- Breastfeeding requires timing information and a valid `breastSide`, but no amount.
- Diaper records require one of `wet`, `dirty`, or `both`.
- Stool color and consistency are allowed only for `dirty` and `both` diaper records.
- A child may not have more than one active sleep record.
- A child may not have more than one active breastfeeding record.
- Users may not access children, records, or invites from another family.
- Invite tokens must expire and may only be used once.
- Invite acceptance must verify that the invite email matches the authenticated or registering user's email.
- Registration without an invite token is only allowed while the system has no users.
- Family membership changes must not remove or demote the last owner.
- Archived children are hidden from default child selection and should not accept new records through normal logging flows.
- Record edits must include the last-seen `updatedAt`; stale edits must be rejected instead of silently overwriting newer data.
- CSV export is owner-only, scoped to one child and a selected date range, defaults to excluding soft-deleted records, and includes both UTC ISO timestamps and family-timezone local timestamps.

## Testing Plan

Automated tests should cover:

- Authentication protects private routes.
- Cross-family data access is blocked.
- Caregivers cannot delete other users' records.
- Feeding, diaper, and sleep records appear in the timeline.
- Dashboard totals calculate correctly for the selected day.
- The recent 7-day summary returns daily feeding count, bottle total, diaper count, and sleep total duration.
- A child cannot start a second active sleep session.
- A child cannot start a second active breastfeeding session.
- Active breastfeeding and sleep timers appear on the dashboard and can be stopped.
- Breastfeeding records validate `breastSide` and bottle records validate `amountMl`.
- Bottle content validates allowed values and defaults to `unknown` when omitted.
- Milk volume input converts supported `oz` values into stored milliliters.
- Stool details are accepted for dirty or both diaper records and rejected for wet-only records.
- Invite acceptance adds the user to the correct family.
- Invite acceptance fails for a mismatched email.
- Public registration is blocked after the first owner exists unless a valid invite token is present.
- Soft-deleted records are excluded from timelines and summaries.
- Cross-midnight sleep is split correctly across day summaries.
- Stale record edits are rejected through optimistic concurrency control.
- Owner password reset works for caregivers and invalidates existing sessions.
- User current-child preference controls the default dashboard child.
- New record pages show the selected child and support switching before save.
- First owner onboarding creates a default family and guides child creation.
- Families with no children route users to the child creation flow.
- Child age appears on the dashboard and child switcher.
- Notes are hidden from dashboard summaries but visible in timeline details and included in CSV export.
- Edited records store update metadata and show an edited state in the timeline.
- Owner role changes cannot remove, demote, or strand the last family owner.
- Families and children cannot be hard-deleted in the initial product phases; archived children are hidden from default flows once archiving is implemented.
- Removed family members no longer have access, while historical records still show a stable creator name.
- Owner can export a child's feeding, diaper, and sleep records as CSV with date range filtering, UTC timestamps, local timestamps, notes, and soft-deleted records excluded by default.
- Fast logging meets the interaction target for bottle, diaper, breastfeeding, and sleep.
- PWA metadata exists, and offline write attempts show a network-unavailable error instead of silently succeeding.
- No public REST API, API token, MCP, or third-party integration endpoint is exposed in the V1 through V1.2 product phases.

The first implementation should include focused tests around data access and summary calculations before expanding UI test coverage.

## Deployment Notes

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: authentication/session secret.
- `APP_URL`: canonical application URL.

Do not commit `.env` files, database volumes, or backups. Provide `.env.example`.

For public access, put the app behind HTTPS through a reverse proxy and set `APP_URL` to the public domain.

Container startup must not reset or destroy existing database data. Production schema changes should run through `prisma migrate deploy`. Seed data is for development only and should not run automatically in production containers.

The Docker deliverable must include manual database backup and restore instructions. At minimum, provide a script or Compose profile that writes a PostgreSQL dump to a host-mounted `backups/` directory. Automated scheduled backups can come later, but a manual backup and restore path is part of the first release acceptance criteria.
