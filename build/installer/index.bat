@echo off
setlocal enabledelayedexpansion

set WORKSPACE=%cd%
set NSISPATH=%WORKSPACE%\build\nsis\makensis.exe
set NSISCRIPT=%WORKSPACE%\build\shell\beaver.nsi
set VERSION_FILE=%WORKSPACE%\version.txt

echo NSIS path: %NSISPATH%
echo NSI script path: %NSISCRIPT%
echo Workspace: %WORKSPACE%

for /f "usebackq tokens=*" %%i in (`powershell -command "(Get-Content -Path '%WORKSPACE%\package.json' -Raw | ConvertFrom-Json).version"`) do set BASE_VERSION=%%i

for /f "tokens=1-3 delims=." %%a in ("%BASE_VERSION%") do (
    set MAJOR=%%a
    set MINOR=%%b
    set PATCH=%%c
)

if exist %VERSION_FILE% (
    set /p BUILD=<%VERSION_FILE%
) else (
    set BUILD=0
)

set /a BUILD+=1

set VERSION=%MAJOR%.%MINOR%.%PATCH%.%BUILD%

echo Version: %VERSION%

echo %BUILD% > %VERSION_FILE%

powershell -Command "((Get-Content -Path '%WORKSPACE%\package.json' -Raw) | ConvertFrom-Json).version = '%VERSION%'; $_ | ConvertTo-Json -Depth 32 | Set-Content -Path '%WORKSPACE%\package.json' -Force"

%NSISPATH% /DVERSION=%VERSION% /DRESOURCEDIR=%WORKSPACE%\release\win-unpacked /DOUTPUTDIR=%WORKSPACE%\output\beaver_%VERSION%.exe %NSISCRIPT%

endlocal
