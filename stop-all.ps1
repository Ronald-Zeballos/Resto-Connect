param(
    [switch]$BaseOnly
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

$args = @("compose", "-f", "docker-compose.yml")

if (-not $BaseOnly -and (Test-Path (Join-Path $repoRoot "docker-compose.payments.yml")) -and (Test-Path (Join-Path $repoRoot "..\pagui\backend"))) {
    $args += @("-f", "docker-compose.payments.yml")
}

$args += "down"

Write-Host "[RestoConnect] Ejecutando: docker $($args -join ' ')" -ForegroundColor Cyan
& docker @args
