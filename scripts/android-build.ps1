# APPDECK 로컬 Android 빌드 스크립트 (Windows PowerShell)
#
# 전역 환경 변수를 건드리지 않고 이 프로세스에만 JDK 17 / Android SDK 경로를 지정한다.
# 사용 예:
#   npm run android:debug     # assembleDebug (APK)
#   npm run android:release   # bundleRelease (AAB)
#
# 경로는 APPDECK_JAVA_HOME / APPDECK_ANDROID_HOME / APPDECK_GRADLE_HOME 로 덮어쓸 수 있다.
param(
  [string]$Task = "assembleDebug",
  [string]$Architectures = "arm64-v8a"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Pick([string]$override, [string]$fallback) {
  if ($override) { return $override } else { return $fallback }
}

$env:JAVA_HOME = Pick $env:APPDECK_JAVA_HOME "C:\Program Files\Microsoft\jdk-17"
$env:ANDROID_HOME = Pick $env:APPDECK_ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
if ($env:APPDECK_GRADLE_HOME) { $env:GRADLE_USER_HOME = $env:APPDECK_GRADLE_HOME }
# 사용자 폴더(또는 프로젝트 경로)에 한글이 있으면 일부 Gradle/CMake 단계가 깨질 수 있어 ASCII 임시 폴더를 쓴다.
$tmp = Pick $env:APPDECK_TMP "C:\appdeck-tmp"
New-Item -ItemType Directory -Force $tmp | Out-Null
$env:TEMP = $tmp
$env:TMP = $tmp
$env:NODE_ENV = if ($Task -like "*Release*") { "production" } else { "development" }

if (-not (Test-Path (Join-Path $root "android\gradlew.bat"))) {
  Write-Host "android/ 폴더가 없습니다. 먼저 'npx expo prebuild --platform android' 를 실행하세요."
  exit 1
}

[IO.File]::WriteAllLines((Join-Path $root "android\local.properties"), @("sdk.dir=$($env:ANDROID_HOME -replace '\\','\\')"))

Push-Location (Join-Path $root "android")
try {
  & .\gradlew.bat $Task "-PreactNativeArchitectures=$Architectures" --console=plain --no-daemon
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
