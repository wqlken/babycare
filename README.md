# babycare

Babycare is a self-hosted family baby tracking app for feeding, diapers, and sleep. It runs as a Next.js application with PostgreSQL through Docker Compose.

## Features

- Bootstrap registration creates the first owner and family workspace.
- Later registrations require an email-bound invitation link.
- Family owners can invite and remove caregivers.
- Baby profiles include name, birthday, gender, notes, and owner-managed archiving.
- The dashboard shows current child context, quick actions, active timers, recent records, and daily totals.
- Feeding, diaper, and sleep records can be created from mobile-friendly forms.
- Bottle records support content details and ml/oz input preferences while storing milk internally in milliliters.
- Diaper records support optional stool color and consistency details.
- Breastfeeding and sleep support start/stop timer flows.
- Timeline shows recent records, notes, creator names, owner delete controls, and bottle feeding edit controls.
- Account settings support display name, email, password, and milk unit preference updates.

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

### VPS With Existing PostgreSQL And Caddy

When deploying behind an existing Caddy reverse proxy and PostgreSQL container,
connect Babycare to the same Docker network as Caddy and PostgreSQL. The app
expects `DATABASE_URL`, not separate `DB_HOST`/`DB_USER` variables.

```yaml
services:
  babycare:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: babycare
    restart: always
    environment:
      DATABASE_URL: postgresql://babycare_user:your_strong_password@sub2api-postgres:5432/babycare
      AUTH_SECRET: replace-with-openssl-rand-base64-32
      APP_URL: https://babycare.example.com
      FAMILY_TIMEZONE: Asia/Shanghai
      NODE_ENV: production
    networks:
      - global-gateway
    command: sh -c "npx prisma migrate deploy && npm run start"

networks:
  global-gateway:
    external: true
```

Caddy can then proxy to the Docker service name:

```caddyfile
babycare.example.com {
  reverse_proxy babycare:3000
}
```

If `npx prisma migrate deploy` fails with `permission denied for schema public`,
grant the application database user ownership or schema privileges from a
PostgreSQL admin session:

```sql
ALTER DATABASE babycare OWNER TO babycare_user;
ALTER SCHEMA public OWNER TO babycare_user;
GRANT CONNECT ON DATABASE babycare TO babycare_user;
GRANT USAGE, CREATE ON SCHEMA public TO babycare_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO babycare_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO babycare_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO babycare_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO babycare_user;
```

If Caddy returns `502` with `lookup babycare ... no such host`, confirm that
the `babycare` and `caddy` containers are attached to the same Docker network.

## Development

```powershell
npm ci
npx prisma generate
npm run dev
```

Run the local verification suite before merging:

```powershell
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Use `npx prisma db seed` only for local development seed data. Do not run seed automatically in production.

## Production Verification

After pulling new code on a server, apply migrations before or during app
startup:

```powershell
docker compose run --rm babycare npx prisma migrate deploy
docker compose up -d --build
docker compose ps
```

For this repository's compose file, the app command already runs migrations on
container start. For custom VPS compose files, keep:

```yaml
command: sh -c "npx prisma migrate deploy && npm run start"
```

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
