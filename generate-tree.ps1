function Get-TreeStructure {
    param(
        [string]$Path = ".",
        [int]$IndentLevel = 0,
        [string[]]$ExcludeFolders = @("node_modules", ".git", "dist", "build", ".next", "coverage"),
        [string[]]$ExcludeFiles = @(".gitignore", ".env", ".DS_Store")
    )
    
    $indent = "    " * $IndentLevel
    $items = Get-ChildItem -Path $Path | Sort-Object {-not $_.PSIsContainer}, Name
    
    foreach ($item in $items) {
        if ($ExcludeFolders -contains $item.Name -or $ExcludeFiles -contains $item.Name) {
            continue
        }
        
        if ($item.PSIsContainer) {
            Write-Output "$indent$($item.Name)/"
            Get-TreeStructure -Path $item.FullName -IndentLevel ($IndentLevel + 1) -ExcludeFolders $ExcludeFolders -ExcludeFiles $ExcludeFiles
        } else {
            Write-Output "$indent$($item.Name)"
        }
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputFile = "project_structure_$timestamp.txt"

Get-TreeStructure | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "Project structure saved to: $outputFile" -ForegroundColor Green
notepad $outputFile
