@echo off
chcp 65001 >nul
cls

echo ========================================
echo   Kuji Client Web - Deploy to EC2
echo ========================================
echo.

set PEM=C:\Users\user\OneDrive\Desktop\dream\ourkuji\ourkuji.pem
set HOST=ec2-user@18.179.187.129
set PROJECT=%~dp0

echo [1/5] Building...
cd /d "%PROJECT%"
if exist dist rd /s /q dist
if exist dist.zip del /f /q dist.zip
call npx vite build --mode production
if errorlevel 1 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo [2/5] Creating ZIP...
powershell -Command "Compress-Archive -Path dist -DestinationPath dist.zip -Force"

echo [3/5] Uploading to EC2...
scp -i "%PEM%" "%PROJECT%dist.zip" %HOST%:/tmp/kuji-client-dist.zip
if errorlevel 1 (
    echo [ERROR] Upload failed!
    pause
    exit /b 1
)

echo [4/5] Deploying on EC2...
echo   - Extracting files...
ssh -i "%PEM%" %HOST% "cd /tmp && rm -rf dist && unzip -o kuji-client-dist.zip 2>&1 | grep -v 'backslashes' || true"

echo   - Creating directory...
ssh -i "%PEM%" %HOST% "sudo mkdir -p /var/www/kuji-client"

echo   - Copying files...
ssh -i "%PEM%" %HOST% "sudo rm -rf /var/www/kuji-client/* && sudo cp -r /tmp/dist/* /var/www/kuji-client/"
if errorlevel 1 (
    echo [ERROR] Copy failed!
    pause
    exit /b 1
)

echo   - Setting permissions...
ssh -i "%PEM%" %HOST% "sudo chown -R nginx:nginx /var/www/kuji-client && sudo chmod -R 755 /var/www/kuji-client"

echo   - Cleaning up...
ssh -i "%PEM%" %HOST% "rm -f /tmp/kuji-client-dist.zip && rm -rf /tmp/dist"

echo [5/5] Restarting Nginx...
ssh -i "%PEM%" %HOST% "sudo systemctl restart nginx"

echo.
echo ========================================
echo   Deploy Complete!
echo ========================================
echo   前台: http://18.179.187.129/client/
echo   後台: http://18.179.187.129/kuji/
echo ========================================
echo.
echo Press Ctrl+Shift+R in browser to refresh
echo.
pause
