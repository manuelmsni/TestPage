# =====================
# Script Git Auto Push - Fixed
# =====================

$ErrorActionPreference = "Stop"

# --- Pedir token ---
$secureToken = Read-Host "Introduce la contraseña" -AsSecureString
$Token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
)

# --- Preparar log ---
$logDir = "C:\web_logs"
$logFile = "$logDir\git.log"

if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
if (!(Test-Path $logFile)) { New-Item -ItemType File -Path $logFile | Out-Null }

function Write-Log($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logFile -Value "[$timestamp] $msg"
}

# --- FUNCIÓN MEJORADA ---
function Invoke-Git($gitArgs) {
    # Redirigimos stderr a stdout (2>&1) para capturar mensajes de progreso
    $output = & git @gitArgs 2>&1
    
    # Solo disparamos el error si el código de salida NO es 0
    if ($LASTEXITCODE -ne 0) {
        # Excepción: No hay nada que commitear (no es un error real)
        if ($gitArgs -contains "commit" -and $output -match "nothing to commit") {
            return $output
        }
        # Si llegamos aquí, sí es un error de verdad
        throw ($output | Out-String)
    }
    return $output
}

try {
    Write-Host "Iniciando sincronización..." -ForegroundColor Cyan

    Write-Host "-> Pulling..."
    Invoke-Git @("pull")

    Write-Host "-> Adding..."
    Invoke-Git @("add", "*")

    Write-Host "-> Committing..."
    $fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Invoke-Git @("commit", "-m", "Actualización - $fecha")

    Write-Host "-> Pushing..." -ForegroundColor Yellow
    # Aquí es donde fallaba: Git escribe el progreso en el flujo de error
    Invoke-Git @("push")

    Write-Host "`n[ OK ] Proceso completado correctamente." -ForegroundColor Green
}
catch {
    $errMsg = $_.Exception.Message
    Write-Host "`n[ ERROR ] Ha ocurrido un problema:" -ForegroundColor Red
    
    if ($errMsg -match "auth|403|denied") {
        Write-Host "Contraseña incorrecta o token sin permisos de escritura." -ForegroundColor Red
    }
    elseif ($errMsg -match "conflict|merge") {
        Write-Host "Hay conflictos en los archivos. Sincronice manualmente." -ForegroundColor Red
    }
    else {
        Write-Host $errMsg -ForegroundColor Yellow
    }

    Write-Log "ERROR DETECTADO: $errMsg"
}
finally {
    Write-Host "`nPresione cualquier tecla para cerrar..." -ForegroundColor Gray
    $null = [System.Console]::ReadKey($true)
}