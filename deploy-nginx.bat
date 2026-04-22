@echo off
chcp 65001 >nul
cls

echo ========================================
echo   Nginx Config - Deploy to EC2
echo ========================================
echo.
echo 此腳本會將 nginx.conf 和 conf.d/ 上傳到 EC2
echo 並重啟 Nginx 服務。
echo.

set PEM=C:\Users\user\OneDrive\Desktop\dream\ourkuji\ourkuji.pem
set HOST=ec2-user@18.179.187.129
set DEPLOY_DIR=%~dp0deploy

echo [1/4] Uploading nginx.conf...
scp -i "%PEM%" "%DEPLOY_DIR%\nginx.conf" %HOST%:/tmp/nginx.conf

echo [2/4] Uploading conf.d files...
scp -i "%PEM%" "%DEPLOY_DIR%\conf.d\kuji-admin.conf" %HOST%:/tmp/kuji-admin.conf
scp -i "%PEM%" "%DEPLOY_DIR%\conf.d\kuji-client.conf" %HOST%:/tmp/kuji-client.conf
scp -i "%PEM%" "%DEPLOY_DIR%\conf.d\api-proxy.conf" %HOST%:/tmp/api-proxy.conf

echo [3/4] Installing configs on EC2...
ssh -i "%PEM%" %HOST% "sudo cp /tmp/nginx.conf /etc/nginx/nginx.conf && sudo mkdir -p /etc/nginx/conf.d && sudo cp /tmp/kuji-admin.conf /etc/nginx/conf.d/ && sudo cp /tmp/kuji-client.conf /etc/nginx/conf.d/ && sudo cp /tmp/api-proxy.conf /etc/nginx/conf.d/ && sudo nginx -t"

echo [4/4] Restarting Nginx...
ssh -i "%PEM%" %HOST% "sudo systemctl restart nginx"

echo.
echo ========================================
echo   Nginx Config Deploy Complete!
echo ========================================
echo.
pause
