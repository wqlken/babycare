$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Force -Path ".\backups" | Out-Null

$backupPath = ".\backups\babycare-$timestamp.sql"
docker compose exec -T postgres pg_dump -U babycare -d babycare | Out-File -Encoding utf8 $backupPath

Write-Host "Backup written to $backupPath"
