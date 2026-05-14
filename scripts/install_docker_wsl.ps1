# install_docker_wsl.ps1 — Instala WSL2 + Docker Desktop
# Ejecutar como administrador (clic derecho → Ejecutar con PowerShell elevado)
#
# Pasos:
#   1. Habilita Virtual Machine Platform + Windows Subsystem for Linux
#   2. Instala WSL2 con distro Ubuntu
#   3. Instala Docker Desktop via winget
#   4. Avisa cuándo reiniciar
#
# Después del reinicio: arrancar Docker Desktop manualmente UNA vez para
# aceptar EULA y dejarlo corriendo en background.

$ErrorActionPreference = 'Continue'

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: hay que correr este script como Administrador." -ForegroundColor Red
    Write-Host "Clic derecho en el archivo -> Ejecutar con PowerShell (Admin)" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "===== Paso 1/4: Habilitar Windows Features (WSL + Virtual Machine Platform) =====" -ForegroundColor Cyan
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
Write-Host ""

Write-Host "===== Paso 2/4: Instalar WSL2 con Ubuntu =====" -ForegroundColor Cyan
wsl --install -d Ubuntu --no-launch
wsl --set-default-version 2
wsl --update
Write-Host ""

Write-Host "===== Paso 3/4: Instalar Docker Desktop =====" -ForegroundColor Cyan
winget install --id Docker.DockerDesktop -e --accept-package-agreements --accept-source-agreements --silent
Write-Host ""

Write-Host "===== Paso 4/4: Listo =====" -ForegroundColor Green
Write-Host ""
Write-Host "PASOS SIGUIENTES:" -ForegroundColor Yellow
Write-Host "  1. REINICIAR la PC ahora (el script no lo hace solo)"
Write-Host "  2. Despues del reinicio, abrir Docker Desktop manualmente"
Write-Host "     (Menu Inicio -> Docker Desktop). Aceptar EULA."
Write-Host "  3. Dejarlo corriendo en background (icono en la bandeja)"
Write-Host "  4. Volver a Claude Code y avisar: 'Docker listo'"
Write-Host ""
Write-Host "Reiniciar ahora? (S/N)" -ForegroundColor Yellow
$ans = Read-Host
if ($ans -eq 'S' -or $ans -eq 's') {
    Restart-Computer -Force
}
