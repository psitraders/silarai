<#
.SYNOPSIS
  Builds the Azure App Service application-settings array from your LOCAL
  appsettings.Development.json.

.DESCRIPTION
  Reads the gitignored appsettings.Development.json, converts each secret key from
  ASP.NET's "Section:Key" form to the "Section__Key" form App Service expects, and
  writes a paste-ready JSON array.

  The point is that real secret values are read and written entirely on your machine —
  they never need to be pasted into a chat, a ticket, or a commit. Output goes to
  $env:TEMP so it cannot be committed by accident.

.EXAMPLE
  pwsh ./backend/scripts/make-azure-appsettings.ps1
#>

$ErrorActionPreference = 'Stop'

$src = Join-Path $PSScriptRoot '..\src\ReplyCart.Api\appsettings.Development.json'
if (-not (Test-Path $src)) {
    throw "Not found: $src`nCopy appsettings.Development.example.json to appsettings.Development.json and fill it in first."
}

$cfg = Get-Content -LiteralPath $src -Raw | ConvertFrom-Json

# Must stay in sync with the secret list in context.md section 4.5.1.
$keys = @(
    'ConnectionStrings:DefaultConnection'
    'Jwt:Secret'
    'AI:OpenAI:ApiKey'
    'Storage:Cloudinary:ApiKey'
    'Storage:Cloudinary:ApiSecret'
    'Razorpay:KeyId'
    'Razorpay:KeySecret'
    'WhatsApp:AccessToken'
    'WhatsApp:VerifyToken'
    'Meta:AppSecret'
    'GoogleAnalytics:ServiceAccountPrivateKey'
    'GoogleAnalytics:ServiceAccountPrivateKeyId'
    'Cloudflare:ApiToken'
    'Redis:AccessKey'
)

function Get-Nested($obj, [string]$path) {
    $cur = $obj
    foreach ($part in $path.Split(':')) {
        if ($null -eq $cur -or -not $cur.PSObject.Properties.Match($part).Count) { return $null }
        $cur = $cur.$part
    }
    return $cur
}

$settings = [System.Collections.Generic.List[object]]::new()
$skipped  = @()

foreach ($k in $keys) {
    $v = Get-Nested $cfg $k
    if ([string]::IsNullOrWhiteSpace([string]$v)) { $skipped += $k; continue }
    $settings.Add([pscustomobject]@{
        name        = ($k -replace ':', '__')
        value       = [string]$v
        slotSetting = $false
    })
}

$dest = Join-Path $env:TEMP 'silarai-azure-appsettings.json'
ConvertTo-Json -InputObject @($settings) -Depth 4 | Set-Content -LiteralPath $dest -Encoding utf8

Write-Host ""
Write-Host "Wrote $($settings.Count) setting(s) to: $dest" -ForegroundColor Green
if ($skipped.Count) {
    Write-Warning "Empty in appsettings.Development.json, so omitted:"
    $skipped | ForEach-Object { Write-Warning "  $_" }
}
Write-Host ""
Write-Host "Next: Portal > your App Service > Configuration > Advanced edit." -ForegroundColor Cyan
Write-Host "MERGE these objects into the existing array. Advanced edit REPLACES the whole" -ForegroundColor Yellow
Write-Host "array, so pasting only these would delete ASPNETCORE_URLS and every other setting." -ForegroundColor Yellow
Write-Host ""
Write-Host "Delete $dest when you are done." -ForegroundColor Cyan
