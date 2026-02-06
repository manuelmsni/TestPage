# =====================
# Script Git Auto Push - Fix Comillas
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

function Write-Log($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logFile -Value "[$timestamp] $msg"
}

function Invoke-Git {
    param([string[]]$Arguments)
    
    # Ejecutamos git directamente pero capturamos el resultado de forma controlada
    $p = Start-Process -FilePath "git" -ArgumentList $Arguments -NoNewWindow -Wait -PassThru -RedirectStandardOutput "tmp_out.txt" -RedirectStandardError "tmp_err.txt"
    
    $stdout = if (Test-Path "tmp_out.txt") { Get-Content "tmp_out.txt" -Raw; Remove-Item "tmp_out.txt" } else { "" }
    $stderr = if (Test-Path "tmp_err.txt") { Get-Content "tmp_err.txt" -Raw; Remove-Item "tmp_err.txt" } else { "" }

    if ($p.ExitCode -ne 0) {
        # Ignorar si no hay nada que subir
        if ($Arguments -contains "commit" -and ($stdout + $stderr -match "nothing to commit")) {
            return $stdout
        }
        throw ($stdout + $stderr)
    }
    return $stdout
}

try {
    Write-Host "Iniciando proceso..." -ForegroundColor Cyan

    Write-Host "1. Git Pull..."
    Invoke-Git -Arguments "pull"

    Write-Host "2. Git Add..."
    Invoke-Git -Arguments "add", "."

    Write-Host "3. Git Commit..."
    $fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $mensajeCommit = "Actualización - $fecha"
    # Pasamos el mensaje como un solo objeto para que no se fragmente
    Invoke-Git -Arguments "commit", "-m", "`"$mensajeCommit`""

    Write-Host "4. Git Push..." -ForegroundColor Yellow
    Invoke-Git -Arguments "push"

    Write-Host "`n[ OK ] Todo se ha subido correctamente." -ForegroundColor Green
}
catch {
    $errMsg = $_.Exception.Message
    Write-Host "`n[!] DETALLE DEL PROCESO:" -ForegroundColor Yellow
    
    if ($errMsg -match "auth|403|denied") {
        Write-Host "Error de autenticación. Revisa tu token." -ForegroundColor Red
    } else {
        Write-Host $errMsg
    }

    Write-Log "ERROR: $errMsg"
}
finally {
    Write-Host "`n----------------------------------------"
    Write-Host "Presione una tecla para cerrar..."
    $null = [System.Console]::ReadKey($true)
}