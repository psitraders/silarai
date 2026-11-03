<#
.SYNOPSIS
  Runs a `dotnet ef` command against the LOCAL or PRODUCTION database.

.DESCRIPTION
  `dotnet ef` uses AppDbContextFactory, which ignores appsettings and always targets the
  local Docker SQL Server. This wrapper reads the connection string from your local files
  and passes it with --connection, so nothing secret is committed or set as an env var:
    local -> src/ReplyCart.Api/appsettings.Development.json (gitignored)
    prod  -> src/ReplyCart.Api/appsettings.json (your local copy; committed copy stays empty)
  Commands that change production (database update / drop, migrations remove) ask you to
  type PROD first. `migrations script` never connects, so its output is the same for both.

.EXAMPLE
  .\scripts\ef.ps1 local migrations list
  .\scripts\ef.ps1 prod  migrations list
  .\scripts\ef.ps1 prod  database update
  .\scripts\ef.ps1 local migrations script 20260817000000_AddB2BEnabledToggle --idempotent -o storefront_release.sql
#>
# Plain $args on purpose: a param() block with [Parameter] makes this an advanced script,
# and PowerShell then grabs short switches like -o (-OutVariable) instead of passing them to dotnet ef.
if ($args.Count -lt 2 -or $args[0] -notin @('local', 'prod')) {
  Write-Host 'Usage: .\scripts\ef.ps1 <local|prod> <dotnet ef args...>'; exit 1
}
$Target = $args[0]
$EfArgs = @($args[1..($args.Count - 1)])
$ErrorActionPreference = 'Stop'

$backend = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$api     = Join-Path $backend 'src\ReplyCart.Api'
$file    = if ($Target -eq 'prod') { 'appsettings.json' } else { 'appsettings.Development.json' }
$path    = Join-Path $api $file
if (-not (Test-Path $path)) { throw "$file not found in $api" }

$cs = (Get-Content $path -Raw | ConvertFrom-Json).ConnectionStrings.DefaultConnection
if (-not $cs) { throw "No ConnectionStrings:DefaultConnection in $file" }

# Anything that writes to production needs typed confirmation
if ($Target -eq 'prod' -and ($EfArgs -contains 'update' -or $EfArgs -contains 'drop' -or $EfArgs -contains 'remove')) {
  if ((Read-Host 'This changes PRODUCTION. Type PROD to continue') -ne 'PROD') { Write-Host 'Cancelled.'; exit 1 }
}

$common = @('--project', (Join-Path $backend 'src\ReplyCart.Infrastructure'), '--startup-project', $api)
# Only these commands connect to a database and accept --connection
$conn = if ($EfArgs -contains 'list' -or $EfArgs[0] -eq 'database') { @('--connection', $cs) } else { @() }

Write-Host "dotnet ef $($EfArgs -join ' ')  ->  $Target ($file)" -ForegroundColor Yellow
dotnet ef @EfArgs @common @conn
exit $LASTEXITCODE
