# Musical Studio · Windows PowerShell 부트스트래퍼
# 사용법: PowerShell에서 .\scripts\setup.ps1
# 본격 개발은 WSL2 안에서 진행하는 게 좋음. 이 스크립트는 Windows 측 보조.

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Musical Studio - Windows Setup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Prereq check
$missing = @()
foreach ($cmd in @('node','pnpm','git','gh','wsl')) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        $missing += $cmd
    }
}
if ($missing.Count -gt 0) {
    Write-Host "[FAIL] 미설치 도구: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "  winget install GitHub.cli OpenJS.NodeJS pnpm.pnpm Git.Git"
    exit 1
}

Write-Host "[OK] Node $(node --version), pnpm $(pnpm --version), git $(git --version)" -ForegroundColor Green

# WSL Ubuntu 확인
$wslDistros = wsl --list --verbose
if ($wslDistros -notmatch 'Ubuntu') {
    Write-Host "[WARN] WSL Ubuntu 없음. wsl --install -d Ubuntu-24.04 권장" -ForegroundColor Yellow
}

# .env.local
if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
    Write-Host "[INFO] .env.local 생성. 시크릿 채우세요." -ForegroundColor Yellow
}

# .env/secrets.env 마스터 안내
if (-not (Test-Path .env)) {
    New-Item -ItemType Directory -Path .env | Out-Null
    Write-Host "[INFO] .env/ 디렉토리 생성됨" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[DONE] Windows 측 셋업 완료. 다음 단계는 WSL2 안에서:" -ForegroundColor Green
Write-Host "  wsl -d Ubuntu-24.04" -ForegroundColor Cyan
Write-Host "  cd ~/projects/musical-studio" -ForegroundColor Cyan
Write-Host "  bash scripts/setup.sh" -ForegroundColor Cyan
