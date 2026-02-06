# =====================
# Script Git Auto Push
# =====================

$ErrorActionPreference = "Stop"

# --- Pedir token ---
$secureToken = Read-Host "Introduce la contraseña" -AsSecureString
$Token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
)
# Nota: Si el usuario ya escribe "github_pat_...", no hace falta concatenarlo. 
# Si quieres forzar el prefijo, usa: ("github_pat_" + $Token)

# --- Preparar log ---
$logDir = "C:\web_logs"
$logFile = "$logDir\git.log"

if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}
if (!(Test-Path $logFile)) {
    New-Item -ItemType File -Path $logFile | Out-Null
}

function Write-Log($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logFile -Value "[$timestamp] $msg"
}

# --- Función para ejecutar git y capturar error real ---
function Invoke-Git($gitArgs) {
    # Usamos 2>&1 para capturar warnings como si fueran errores y poder leerlos
    $output = & git @gitArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        # El commit devuelve código 1 si no hay nada que subir, lo ignoramos para que no cierre el script
        if ($gitArgs -contains "commit" -and $output -match "nothing to commit") {
            return $output
        }
        throw ($output | Out-String)
    }
    return $output
}

try {
    Write-Host "Ejecutando git pull..." -ForegroundColor Cyan
    Invoke-Git @("pull")

    Write-Host "Ejecutando git add..." -ForegroundColor Cyan
    Invoke-Git @("add", "*")

    $fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $msg = "Actualización - $fecha"

    Write-Host "Ejecutando git commit..." -ForegroundColor Cyan
    Invoke-Git @("commit", "-m", $msg)

    Write-Host "Ejecutando git push..." -ForegroundColor Cyan
    Invoke-Git @("push")

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Proceso completado correctamente." -ForegroundColor Green
    Write-Host "========================================`n"
}
catch {
    $errMsg = $_.Exception.Message
    $errStack = $_.ScriptStackTrace
    $fullError = "$errMsg`n$errStack"

    Write-Host "`n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Red
    # --- Clasificación de errores ---
    if ($errMsg -match "auth|Authentication|403|denied") {
        Write-Host "ERROR: Contraseña incorrecta o sin permisos." -ForegroundColor Red
    }
    elseif ($errMsg -match "conflict|merge|non-fast-forward|overwritten") {
        Write-Host "ERROR: Conflicto de datos. Consulte al equipo técnico." -ForegroundColor Red
    }
    else {
        Write-Host "Ha sucedido un error inesperado:" -ForegroundColor Red
        Write-Host $errMsg -ForegroundColor Yellow
    }
    Write-Host "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`n" -ForegroundColor Red

    # --- Guardar detalle real en log ---
    Write-Log "ERROR GIT:"
    Write-Log $fullError
}
finally {
    # Este bloque se ejecuta SIEMPRE, haya error o no
    Write-Host "Presione una tecla para cerrar esta ventana..." -ForegroundColor Gray
    $null = [System.Console]::ReadKey($true)
}