param(
    [switch]$BaseOnly,
    [switch]$Detach,
    [int]$TimeoutSeconds = 180
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

function Write-Step {
    param([string]$Message)
    Write-Host "[RestoConnect] $Message" -ForegroundColor Cyan
}

function Test-DockerReady {
    try {
        docker info *> $null
        return $true
    } catch {
        return $false
    }
}

function Start-DockerDesktopIfNeeded {
    if (Test-DockerReady) {
        Write-Step "Docker ya esta listo."
        return
    }

    $dockerDesktopPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (-not (Test-Path $dockerDesktopPath)) {
        throw "No se encontro Docker Desktop en '$dockerDesktopPath'."
    }

    Write-Step "Iniciando Docker Desktop..."
    Start-Process -FilePath $dockerDesktopPath -WindowStyle Hidden

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        Start-Sleep -Seconds 3
        if (Test-DockerReady) {
            Write-Step "Docker Desktop quedo listo."
            return
        }
        Write-Step "Esperando a que Docker termine de iniciar..."
    } while ((Get-Date) -lt $deadline)

    throw "Docker Desktop no estuvo listo dentro de $TimeoutSeconds segundos."
}

function Ensure-EnvFile {
    $envPath = Join-Path $repoRoot ".env"
    $examplePath = Join-Path $repoRoot ".env.example"

    if (-not (Test-Path $envPath)) {
        if (-not (Test-Path $examplePath)) {
            throw "No existe .env ni .env.example en el proyecto."
        }
        Copy-Item $examplePath $envPath
        Write-Step "Se creo .env desde .env.example."
    } else {
        Write-Step "Usando el archivo .env existente."
    }
}

function Get-ComposeArguments {
    $paymentsCompose = Join-Path $repoRoot "docker-compose.payments.yml"
    $paguiBackendPath = Resolve-Path (Join-Path $repoRoot "..\pagui\backend") -ErrorAction SilentlyContinue

    $args = @("compose", "-f", "docker-compose.yml")

    if (-not $BaseOnly -and (Test-Path $paymentsCompose) -and $paguiBackendPath) {
        $args += @("-f", "docker-compose.payments.yml")
        Write-Step "Se levantara el stack completo con pagos QR."
    } else {
        Write-Step "Se levantara el stack base."
    }

    $args += @("up", "--build")

    if ($Detach) {
        $args += "-d"
    }

    return ,$args
}

Ensure-EnvFile
Start-DockerDesktopIfNeeded

$composeArgs = Get-ComposeArguments
Write-Step ("Ejecutando: docker " + ($composeArgs -join " "))
try {
    & docker @composeArgs
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose termino con codigo $LASTEXITCODE."
    }
} catch {
    Write-Host "[RestoConnect] Docker si arranco, pero el stack fallo durante build o startup." -ForegroundColor Yellow
    throw
}
