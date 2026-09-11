@echo off
REM Script para iniciar el servidor backend (login, registro y base de datos MySQL/XAMPP)

echo.
echo =====================================
echo Iniciando servidor backend...
echo =====================================
echo.
echo IMPORTANTE: antes de continuar, asegurate de que en el Panel de
echo Control de XAMPP el modulo MySQL este iniciado (en verde).
echo Si aun no lo has hecho, cierra esta ventana y ejecuta primero
echo INICIAR_XAMPP.bat
echo.
pause

cd /d "%~dp0backend"

if not exist node_modules (
    echo Instalando dependencias por primera vez, esto puede tardar un poco...
    call npm install
    echo.
)

if not exist .env (
    echo Creando archivo .env a partir de .env.example...
    copy .env.example .env >nul
    echo.
)

echo Iniciando servidor en http://localhost:3000 ...
echo (la base de datos y las tablas se crean automaticamente si no existen)
echo (Deja esta ventana abierta mientras uses la aplicacion)
echo.
call npm start

pause
