@echo off
REM Script para abrir el Panel de Control de XAMPP (necesario para MySQL)

echo.
echo =====================================
echo Abriendo el Panel de Control de XAMPP...
echo =====================================
echo.

if exist "C:\xampp\xampp-control.exe" (
    start "" "C:\xampp\xampp-control.exe"
    goto success
)

if exist "C:\xampp\xampp_start.exe" (
    start "" "C:\xampp\xampp_start.exe"
    goto success
)

echo.
echo ERROR: No se encontro XAMPP en C:\xampp\
echo.
echo Soluciones:
echo 1. Descarga XAMPP desde: https://www.apachefriends.org
echo 2. Instalalo (deja la ruta por defecto: C:\xampp\)
echo 3. Vuelve a ejecutar este script
echo.
pause
exit /b 1

:success
echo.
echo Se abrio el Panel de Control de XAMPP.
echo.
echo Proximos pasos:
echo 1. En el panel, haz clic en el boton "Start" de la fila MySQL
echo    (debe quedar en color verde).
echo 2. NO es necesario iniciar Apache para esta aplicacion.
echo 3. Deja el Panel de Control abierto.
echo 4. Ejecuta INICIAR_SERVIDOR.bat para iniciar el backend.
echo.
pause
