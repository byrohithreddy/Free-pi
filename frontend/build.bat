@echo off
REM ============================================================
REM Frontend Build Script for Cloudflare Pages
REM Run this from the cloudflare-deployment\frontend directory
REM ============================================================

echo.
echo ============================================
echo  Building Frontend for Cloudflare Pages
echo ============================================
echo.

REM Step 1: Copy the frontend source from the original project
echo [1/4] Copying frontend source...
if not exist "src" (
    xcopy /E /I /Y "..\..\artifacts\upi-dashboard\src" "src"
    copy /Y "..\..\artifacts\upi-dashboard\index.html" "index.html"
    copy /Y "..\..\artifacts\upi-dashboard\vite.config.ts" "vite.config.ts"
    copy /Y "..\..\artifacts\upi-dashboard\tsconfig.json" "tsconfig.json"
    copy /Y "..\..\artifacts\upi-dashboard\components.json" "components.json"
    copy /Y "..\..\artifacts\upi-dashboard\package.json" "package.json"
    if exist "..\..\artifacts\upi-dashboard\public" (
        xcopy /E /I /Y "..\..\artifacts\upi-dashboard\public" "public"
    )
)

REM Step 2: Copy shared libraries
echo [2/4] Copying shared libraries...
if not exist "..\..\lib" (
    echo WARNING: lib directory not found. Make sure shared libs are accessible.
)

REM Step 3: Create .env file with the Worker URL
echo [3/4] Setting environment variables...
if not exist ".env" (
    echo VITE_API_URL=https://upi-orchestrator-api.YOUR_SUBDOMAIN.workers.dev > .env
    echo.
    echo WARNING: Update .env with your actual Worker URL!
    echo.
)

REM Step 4: Install dependencies and build
echo [4/4] Installing dependencies and building...
call npm install
call npm run build

echo.
echo ============================================
echo  Build complete! Deploy the 'dist' folder
echo  to Cloudflare Pages.
echo ============================================
echo.
