# babycare

Babycare is a self-hosted family baby tracking app for feeding, diapers, and sleep. It runs as a Next.js application with PostgreSQL through Docker Compose.

## Features

- Bootstrap registration creates the first owner and family workspace.
- Later registrations require an email-bound invitation link.
- Family owners can invite and remove caregivers.
- Baby profiles include name, birthday, gender, and notes.
- The dashboard shows current child context, quick actions, active timers, recent records, and daily totals.
- Feeding, diaper, and sleep records can be created from mobile-friendly forms.
- Breastfeeding and sleep support start/stop timer flows.
- Timeline shows recent records, notes, creator names, owner delete controls, and bottle feeding edit controls.
- Account settings support display name, email, and password updates.

## Application Routes

- `/login`: account login.
- `/register`: first-owner registration or invite acceptance.
- `/`: current child dashboard.
- `/children`: first child creation flow.
- `/children/[childId]`: baby profile settings.
- `/children/[childId]/feedings/new`: feeding logging.
- `/children/[childId]/diapers/new`: diaper logging.
- `/children/[childId]/sleep`: sleep timer start flow.
- `/children/[childId]/timeline`: recent activity timeline.
- `/settings/family`: family members and invitations.
- `/settings/account`: profile and password settings.

## Docker

1. Copy `.env.example` to `.env`.
2. Update `AUTH_SECRET` with a strong random value.
3. Set `APP_URL` to the LAN or public URL, for example `http://localhost:3000`.
4. Start the stack:

```powershell
docker compose up -d --build
```

The app container runs `npx prisma migrate deploy` before starting Next.js.

## Development

```powershell
npm install
npm run dev
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Use `npx prisma db seed` only for local development seed data. Do not run seed automatically in production.

## Backup And Restore

Create a manual database backup:

```powershell
powershell -File scripts/backup-db.ps1
```

Restore from a backup:

```powershell
powershell -File scripts/restore-db.ps1 -Path backups/<file>.sql
```

Backups are written to `backups/` and are intentionally ignored by git.
