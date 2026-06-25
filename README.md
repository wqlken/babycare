# babycare

Babycare is a self-hosted family baby tracking app for feeding, diapers, and sleep. It runs as a Next.js application with PostgreSQL through Docker Compose.

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
