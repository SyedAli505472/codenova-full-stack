Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$releaseRoot = Join-Path $projectRoot 'release'
New-Item -ItemType Directory -Path $releaseRoot -Force | Out-Null
$sourcePaths = @('apps','client','server','scripts','tests','docs','.vscode','.gitignore','.env.example','package.json','package-lock.json','index.html','vite.config.js','app-config.json','README.md')

function Add-SourceFiles($archive, [string]$sourceRoot, [string]$archiveRoot) {
    foreach ($relative in $sourcePaths) {
        $path = Join-Path $sourceRoot $relative
        if (-not (Test-Path -LiteralPath $path)) { continue }
        $item = Get-Item -LiteralPath $path -Force
        $files = if ($item.PSIsContainer) { @(Get-ChildItem -LiteralPath $path -Recurse -File -Force) } else { @($item) }
        foreach ($file in $files) {
            $entryPath = $archiveRoot + '/' + $file.FullName.Substring($sourceRoot.Length + 1).Replace('\','/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryPath) | Out-Null
        }
    }
}

function Write-Archive([string]$filename, $packages) {
    $output = Join-Path $releaseRoot $filename
    $stream = [System.IO.File]::Open($output, [System.IO.FileMode]::Create)
    $archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($package in $packages) { Add-SourceFiles $archive $package.Source $package.Name }
    } finally { $archive.Dispose(); $stream.Dispose() }
    $check = [System.IO.Compression.ZipFile]::OpenRead($output)
    try {
        foreach ($entry in $check.Entries) {
            if ($entry.FullName -match '(^|/)(node_modules|dist|data|\.git)/|(^|/)\.env$|\.(sqlite|db)(-|$)') { throw 'Unexpected runtime data in source archive.' }
        }
        Write-Output "$filename verified: $($check.Entries.Count) source/documentation files"
    } finally { $check.Dispose() }
}

Write-Archive 'Full_Stack_Project.zip' @(@{ Source=$projectRoot; Name='Full_Stack_Project' })
$names = @('codenova-notes','codenova-expense-tracker','codenova-event-registration','codenova-project-showcase')
$packages = foreach ($name in $names) {
    $source = Join-Path (Join-Path $projectRoot 'exports') $name
    if (-not (Test-Path -LiteralPath (Join-Path $source 'package.json'))) { throw 'Run npm run export before packaging.' }
    @{ Source=$source; Name=$name }
}
Write-Archive 'Four_GitHub_Repositories.zip' $packages
