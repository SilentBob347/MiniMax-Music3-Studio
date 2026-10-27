# Checks that every program and library the studio runs on Windows finds what it imports: the staged installer
# bundle, and the runtimes the studio downloads, read where they already lie on this computer at their pins and
# never fetched (crates/music-server/src/dll_imports.rs). Sources are data folders that hold them: the studios'
# data folders, Dub Studio's and Speech Studio's installation folders, transcribe.cpp build folders. A runtime
# found in none of them is listed as skipped.
param(
    [Parameter(Mandatory = $true)][string[]]$Sources
)
$ErrorActionPreference = 'Stop'
$missing = @($Sources | Where-Object { -not (Test-Path -LiteralPath $_ -PathType Container) })
if ($missing.Count) { throw "not a folder: $($missing -join ', ')" }
$env:MM3_DLL_SOURCES = $Sources -join ';'
Push-Location (Join-Path $PSScriptRoot '..')
try {
    $ErrorActionPreference = 'Continue'
    cargo test -j 8 -p music-server --lib dll_imports::tests::local_runtimes_can_be_loaded -- --ignored --exact --nocapture
    if ($LASTEXITCODE -ne 0) { throw "the DLL import check failed with exit code $LASTEXITCODE" }
} finally {
    Pop-Location
}
