<#
Backs up the live Supabase Postgres database (schema + data) to a timestamped .sql
file in an OneDrive-synced folder, and prunes dumps older than $RetentionDays.

Requires SUPABASE_DB_URL to be set as a persistent user environment variable, e.g.:
  postgresql://postgres:PASSWORD@db.ipgdxxwctaprjkdzqxkp.supabase.co:5432/postgres
Get it from: Supabase Dashboard -> Leela-Interiors -> Project Settings -> Database
             -> Connection string (URI, direct connection / port 5432).

To restore a dump into an empty database:
  psql "$env:SUPABASE_DB_URL" -f path\to\backup.sql
#>

$ErrorActionPreference = 'Stop'

$BackupDir = "$env:USERPROFILE\OneDrive\LeelaInteriorBackups"
$RetentionDays = 30
$LogFile = Join-Path $BackupDir 'backup-log.txt'

function Write-Log($message) {
    $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $message
    Write-Output $line
    Add-Content -Path $LogFile -Value $line
}

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

if (-not $env:SUPABASE_DB_URL) {
    Write-Log "ERROR: SUPABASE_DB_URL environment variable is not set. Aborting."
    exit 1
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$dumpFile = Join-Path $BackupDir "leela-interiors-$timestamp.sql"

Write-Log "Starting backup to $dumpFile"

try {
    & npx --yes supabase db dump --db-url $env:SUPABASE_DB_URL --file $dumpFile 2>&1 |
        ForEach-Object { Write-Log $_ }

    if ($LASTEXITCODE -ne 0) {
        throw "supabase db dump exited with code $LASTEXITCODE"
    }

    if (-not (Test-Path $dumpFile) -or (Get-Item $dumpFile).Length -eq 0) {
        throw "Dump file is missing or empty"
    }

    Write-Log "Backup succeeded: $dumpFile ($((Get-Item $dumpFile).Length) bytes)"
}
catch {
    Write-Log "ERROR: Backup failed - $_"
    exit 1
}

$cutoff = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter 'leela-interiors-*.sql' |
    Where-Object { $_.LastWriteTime -lt $cutoff } |
    ForEach-Object {
        Write-Log "Pruning old backup: $($_.Name)"
        Remove-Item $_.FullName -Force
    }

Write-Log "Backup run complete."
