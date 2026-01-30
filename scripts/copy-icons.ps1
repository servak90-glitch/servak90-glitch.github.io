# Find and copy generated bit icons
$targetDir = "public\equipment\bits"
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

# Search in user's temp/brain folders
$possiblePaths = @(
    "$env:USERPROFILE\.gemini\antigravity\brain",
    "$env:TEMP",
    "$env:LOCALAPPDATA\Temp"
)

$foundFiles = @()

foreach ($basePath in $possiblePaths) {
    if (Test-Path $basePath) {
        $files = Get-ChildItem -Path $basePath -Recurse -Filter "bit_*_*.png" -ErrorAction SilentlyContinue | 
        Where-Object { $_.Name -match "^bit_\d+_" } |
        Sort-Object LastWriteTime -Descending
        
        if ($files) {
            $foundFiles += $files
            Write-Host "Found $($files.Count) files in: $basePath" -ForegroundColor Cyan
        }
    }
}

if ($foundFiles.Count -eq 0) {
    Write-Host "No icon files found. Please check the artifact folder manually." -ForegroundColor Red
    exit 1
}

# Group by tier number and take the most recent for each
$copiedCount = 0
for ($tier = 1; $tier -le 15; $tier++) {
    $pattern = "bit_${tier}_"
    $matchingFiles = $foundFiles | Where-Object { $_.Name -like "${pattern}*" } | Select-Object -First 1
    
    if ($matchingFiles) {
        $targetPath = Join-Path $targetDir "bit_$tier.png"
        Copy-Item -Path $matchingFiles.FullName -Destination $targetPath -Force
        Write-Host "OK Copied bit_$tier.png" -ForegroundColor Green
        $copiedCount++
    }
    else {
        Write-Host "MISSING bit_$tier" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Icons copied: $copiedCount / 15" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
