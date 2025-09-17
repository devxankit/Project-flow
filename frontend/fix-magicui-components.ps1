# PowerShell script to fix Magic UI component installation issues
Write-Host "Fixing Magic UI component installation issues..." -ForegroundColor Green

$componentsPath = "src\components\magicui"
if (Test-Path $componentsPath) {
    Set-Location $componentsPath
    
    if (Test-Path "ui") {
        Write-Host "Found nested ui directory. Moving components..." -ForegroundColor Yellow
        
        $uiFiles = Get-ChildItem "ui" -Recurse -File
        
        foreach ($file in $uiFiles) {
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\ui\", "")
            $newPath = $relativePath
            
            $newDir = Split-Path $newPath -Parent
            if ($newDir -and !(Test-Path $newDir)) {
                New-Item -ItemType Directory -Path $newDir -Force | Out-Null
            }
            
            Move-Item $file.FullName $newPath -Force
            Write-Host "Moved: $($file.Name) to $newPath" -ForegroundColor Cyan
            
            # Fix import paths
            $content = Get-Content $newPath -Raw
            $content = $content -replace 'from "src/lib/utils"', 'from "../../lib/utils"'
            $content = $content -replace "from 'src/lib/utils'", "from '../../lib/utils'"
            Set-Content $newPath $content -NoNewline
            Write-Host "Fixed import path in: $($file.Name)" -ForegroundColor Green
        }
        
        Remove-Item "ui" -Recurse -Force
        Write-Host "Removed nested ui directory" -ForegroundColor Green
    } else {
        Write-Host "No nested ui directory found." -ForegroundColor Green
    }
    
    # Fix any remaining incorrect import paths
    $allFiles = Get-ChildItem -Recurse -File -Filter "*.jsx"
    foreach ($file in $allFiles) {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        $content = $content -replace 'from "src/lib/utils"', 'from "../../lib/utils"'
        $content = $content -replace "from 'src/lib/utils'", "from '../../lib/utils'"
        
        if ($content -ne $originalContent) {
            Set-Content $file.FullName $content -NoNewline
            Write-Host "Fixed import path in: $($file.Name)" -ForegroundColor Green
        }
    }
    
    Write-Host "Magic UI component fixes completed!" -ForegroundColor Green
} else {
    Write-Host "Components directory not found: $componentsPath" -ForegroundColor Red
}