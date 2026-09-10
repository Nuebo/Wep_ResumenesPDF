@echo off
REM Script para iniciar Ollama en Windows

echo.
echo =====================================
echo Iniciando Ollama...
echo =====================================
echo.

REM Buscar Ollama en rutas comunes de Windows
if exist "C:\Program Files\Ollama\ollama app.exe" (
    echo Iniciando desde: C:\Program Files\Ollama\
    start "" "C:\Program Files\Ollama\ollama app.exe"
    goto success
)

if exist "C:\Users\%USERNAME%\AppData\Local\Ollama\ollama app.exe" (
    echo Iniciando desde: AppData\Local\Ollama\
    start "" "C:\Users\%USERNAME%\AppData\Local\Ollama\ollama app.exe"
    goto success
)

echo.
echo ERROR: No se encontro Ollama en las rutas esperadas.
echo.
echo Soluciones:
echo 1. Descarga Ollama desde: https://ollama.ai
echo 2. Instala siguiendo las instrucciones
echo 3. Vuelve a ejecutar este script
echo.
pause
exit /b 1

:success
echo.
echo ✓ Ollama iniciado correctamente
echo.
echo Ollama deberia estar escuchando en: http://localhost:11434
echo.
echo Proximos pasos:
echo 1. Abre http://localhost:11434 en tu navegador (si no ves nada, esta corriendo en background)
echo 2. En otra terminal, descarga un modelo:
echo    ollama pull mistral
echo 3. Abre index.html en tu navegador
echo.
pause
