param(
  [Parameter(Mandatory = $true)]
  [string]$Path
)

Get-Content $Path | docker compose exec -T postgres psql -U babycare -d babycare

Write-Host "Restore completed from $Path"
