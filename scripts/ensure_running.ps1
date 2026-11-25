param(
  [switch]$OpenBrowser
)

$ErrorActionPreference = "SilentlyContinue"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogFile = Join-Path $env:TEMP "campusconnect-autostart.log"
$DockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

function Write-Log($msg) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$ts $msg" | Out-File -FilePath $LogFile -Append -Encoding utf8
}

Write-Log "Starting CampusConnect auto-start check..."

function Test-DockerReady {
  docker info *> $null
  return ($LASTEXITCODE -eq 0)
}

if (-not (Test-DockerReady)) {
  if (Test-Path $DockerExe) {
    Write-Log "Docker Engine not ready. Launching Docker Desktop..."
    Start-Process -FilePath $DockerExe -WindowStyle Minimized
  } else {
    Write-Log "ERROR: Docker Desktop executable not found at $DockerExe"
    exit 1
  }

  $maxWaitSec = 150
  $elapsed = 0
  while (-not (Test-DockerReady) -and $elapsed -lt $maxWaitSec) {
    Start-Sleep -Seconds 3
    $elapsed += 3
  }
}

if (-not (Test-DockerReady)) {
  Write-Log "ERROR: Docker Engine did not become ready within timeout."
  exit 1
}

Write-Log "Docker Engine is ready. Ensuring CampusConnect containers are up..."
Push-Location $ProjectRoot
docker compose up -d 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8
Pop-Location

$healthWait = 60
$waited = 0
while ($waited -lt $healthWait) {
  try {
    $resp = Invoke-WebRequest -Uri "http://127.0.0.1:5001/api/health" -UseBasicParsing -TimeoutSec 3
    if ($resp.StatusCode -eq 200) {
      Write-Log "CampusConnect Backend & MySQL are healthy (HTTP 200)."
      break
    }
  } catch {}
  Start-Sleep -Seconds 2
  $waited += 2
}

if ($OpenBrowser) {
  Start-Process "http://localhost"
}

Write-Log "CampusConnect startup verification complete."
exit 0
