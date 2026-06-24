# Babycare MVP Design

## Goal

Build a stable self-hosted baby care tracking app for the user's family. The first release focuses on quick daily logging for feeding, diapers, and sleep. The app must run with Docker on a home NAS or small server, support family access through accounts and invitations, and leave room for later expansion into growth, medicine, temperature, pumping, and richer reports.

## Scope

Version 1 includes:

- Account registration and login.
- A family workspace created by the first user.
- Invitation links for family members and caregivers.
- Baby profiles with name, birthday, gender, and notes.
- Fast mobile-first logging for feedings, diapers, and sleep.
- A dashboard showing last events and today's totals.
- A daily timeline with edit and delete controls.
- Docker Compose deployment with PostgreSQL.

Version 1 does not include solids, pumping, temperature, medicine, growth charts, AI chat, native mobile apps, or advanced reports. These are planned for a later phase after the core workflow is stable.

## Technical Approach

Use Next.js with the App Router, TypeScript, Prisma, PostgreSQL, Tailwind CSS, and Docker Compose.

The Next.js application will serve both the UI and the backend behavior. Form-oriented writes should start with Server Actions to reduce duplicated client/API logic. API routes can be added later for highly interactive flows or external integrations.

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

The dashboard should be optimized for one-handed phone use. It should show time since the last feeding, diaper, and sleep event, today's feeding count and bottle volume, today's diaper count, today's sleep duration, and large actions for feeding, diaper, and sleep logging.

## Data Model

Core entities:

- `User`: email, password hash, display name, timestamps.
- `Family`: name, creator, timestamps.
- `FamilyMember`: family, user, role, joined time.
- `Invite`: family, token, invited email, expiry, used status.
- `Child`: family, name, birthday, gender, notes, timestamps.
- `FeedingRecord`: child, creator, type, start time, end time, amount in ml, notes.
- `DiaperRecord`: child, creator, time, type, notes.
- `SleepRecord`: child, creator, start time, end time, notes.

Feeding type values are `breast` and `bottle`. Diaper type values are `wet`, `dirty`, and `both`. A sleep record with no end time represents an active sleep session.

Later phase B features should be added as separate tables, not overloaded into the first three record types.

## Permissions

Only family members may access a family's children and records.

Roles:

- `owner`: manage children, invite members, remove members, and delete records.
- `caregiver`: view all records, create records, and edit records they created.

Record deletion should be owner-only in the first release to reduce accidental data loss. Every record should show the creator so family members can see who logged it.

## Validation Rules

- Bottle feeding requires an amount in milliliters.
- Breastfeeding requires timing information but no amount.
- Diaper records require one of `wet`, `dirty`, or `both`.
- A child may not have more than one active sleep record.
- Users may not access children, records, or invites from another family.
- Invite tokens must expire and may only be used once.

## Testing Plan

Automated tests should cover:

- Authentication protects private routes.
- Cross-family data access is blocked.
- Caregivers cannot delete other users' records.
- Feeding, diaper, and sleep records appear in the timeline.
- Dashboard totals calculate correctly for the selected day.
- A child cannot start a second active sleep session.
- Invite acceptance adds the user to the correct family.

The first implementation should include focused tests around data access and summary calculations before expanding UI test coverage.

## Deployment Notes

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: authentication/session secret.
- `APP_URL`: canonical application URL.

Do not commit `.env` files, database volumes, or backups. Provide `.env.example`.

For public access, put the app behind HTTPS through a reverse proxy and set `APP_URL` to the public domain. Add a backup path for PostgreSQL dumps in a later operations task.
