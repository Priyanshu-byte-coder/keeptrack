Write-Host ""
Write-Host "  KeepTrack Installer" -ForegroundColor Green
Write-Host "  ==================="
Write-Host ""

# Get latest version via redirect
Write-Host "Fetching latest version..."
try {
    $response = Invoke-WebRequest -Uri "https://github.com/Priyanshu-byte-coder/keeptrack/releases/latest" -MaximumRedirection 0 -ErrorAction SilentlyContinue -UseBasicParsing
} catch {
    $redirectUrl = $_.Exception.Response.Headers.Location
}

if (-not $redirectUrl) {
    # Fallback: follow redirect normally
    $redirectUrl = (Invoke-WebRequest -Uri "https://github.com/Priyanshu-byte-coder/keeptrack/releases/latest" -UseBasicParsing -MaximumRedirection 5).BaseResponse.ResponseUri.AbsoluteUri
}

$version = ($redirectUrl -split '/')[-1]
$versionNum = $version -replace '^v', ''

if (-not $versionNum) {
    Write-Host "Error: Could not determine latest version." -ForegroundColor Red
    exit 1
}

$url = "https://github.com/Priyanshu-byte-coder/keeptrack/releases/download/v${versionNum}/keeptrack-v${versionNum}.zip"
$installDir = "$env:USERPROFILE\keeptrack"
$zipPath = "$env:TEMP\keeptrack.zip"

Write-Host "Downloading KeepTrack v${versionNum}..."
Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing

Write-Host "Installing to ${installDir}..."
if (Test-Path $installDir) {
    Remove-Item -Recurse -Force $installDir
}
Expand-Archive -Path $zipPath -DestinationPath $installDir -Force
Remove-Item $zipPath

Write-Host ""
Write-Host "  KeepTrack v${versionNum} installed to ${installDir}" -ForegroundColor Green
Write-Host ""
Write-Host "  Load in Chrome:"
Write-Host "    1. Open chrome://extensions"
Write-Host "    2. Enable Developer Mode (top right)"
Write-Host "    3. Click Load unpacked"
Write-Host "    4. Select: ${installDir}"
Write-Host "    5. Done!"
Write-Host ""
