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
set NGINX_CONFIG=%PROJECT%deploy\conf.d\kuji-client.conf

echo [1/6] Updating Nginx config...
if exist "%NGINX_CONFIG%" (
    scp -i "%PEM%" "%NGINX_CONFIG%" %HOST%:/tmp/
    ssh -i "%PEM%" %HOST% "sudo cp /tmp/kuji-client.conf /etc/nginx/conf.d/ && sudo nginx -t"
    if errorlevel 1 (
        echo [ERROR] Nginx config test failed!
        pause
        exit /b 1
    )
)

echo [2/6] Building...
cd /d "%PROJECT%"
if exist dist rd /s /q dist
if exist dist.zip del /f /q dist.zip
call npx vite build --mode production
if errorlevel 1 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo [3/6] Creating ZIP...
powershell -Command "Compress-Archive -Path dist -DestinationPath dist.zip -Force"

echo [4/6] Uploading to EC2...
scp -i "%PEM%" "%PROJECT%dist.zip" %HOST%:/tmp/client-dist.zip

echo [5/6] Deploying on EC2...
ssh -i "%PEM%" %HOST% "cd /tmp && rm -rf client-dist && unzip -q -o client-dist.zip -d client-dist && sudo rm -rf /var/www/kuji-client/* && sudo cp -r /tmp/client-dist/dist/* /var/www/kuji-client/ && sudo chown -R nginx:nginx /var/www/kuji-client"

echo [6/6] Restarting Nginx...
ssh -i "%PEM%" %HOST% "sudo systemctl restart nginx"

echo.
echo ========================================
echo   Deploy Complete!
echo ========================================
echo   URL: http://18.179.187.129/client/
echo ========================================
echo.
echo Press Ctrl+Shift+R in browser to refresh
echo.
pause
