# FIX-FRONTMATTER.ps1
# ----------------------------------------------------------------------------
# Strips out known-broken frontmatter fields from all .md files under
# docs/old-docs/. MkDocs tolerated `description: null`, but Docusaurus
# rejects it with:
#   [ERROR] "description" must be a string
#
# This script scans all markdown files in old-docs, finds any top-of-file
# frontmatter block (between --- markers), and removes lines like:
#   description: null
#   description: ~
#   description:
# (as well as a few other common null-valued fields that tripped us up).
#
# USAGE:
#   cd H:\Code\helix-documentation-website-fork
#   powershell -ExecutionPolicy Bypass -File .\FIX-FRONTMATTER.ps1
#
# After it completes, run `npm run build` again. If a DIFFERENT frontmatter
# error comes up, tell Claude the error and we'll patch the script.
# ----------------------------------------------------------------------------

[CmdletBinding()]
param(
  [string]$DocsPath = "H:\Code\helix-documentation-website-fork\docs\old-docs",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $DocsPath)) {
  throw "Docs path not found: $DocsPath"
}

# Fields whose value, if null/empty, we should delete from frontmatter.
# (Docusaurus treats a missing field as "not set" and accepts that.)
$nullableFields = @("description", "image", "keywords", "slug", "draft", "hide_title", "hide_table_of_contents")

$files = Get-ChildItem -Path $DocsPath -Recurse -Filter *.md -File
Write-Host "Scanning $($files.Count) markdown files..." -ForegroundColor Cyan

$fixedCount = 0
$filesFixed = @()

foreach ($f in $files) {
  $content = Get-Content $f.FullName -Raw
  if (-not $content) { continue }

  # Only process files that start with a frontmatter block
  if ($content -notmatch '(?s)^---\s*\r?\n(.*?)\r?\n---\s*\r?\n') { continue }

  $original = $content
  $frontmatter = $Matches[1]
  $rest = $content.Substring($Matches[0].Length)

  $originalFm = $frontmatter

  foreach ($field in $nullableFields) {
    # Remove lines like `description: null`, `description: ~`, `description:<nothing>`
    # (but NOT `description: "some string"` or `description: some value`)
    $pattern = '(?m)^' + [regex]::Escape($field) + '\s*:\s*(null|~|)\s*\r?\n'
    $frontmatter = [regex]::Replace($frontmatter, $pattern, '')
  }

  if ($frontmatter -ne $originalFm) {
    $fixedCount++
    $filesFixed += $f.FullName
    if (-not $DryRun) {
      $newContent = "---`n" + $frontmatter.TrimEnd() + "`n---`n" + $rest
      Set-Content -Path $f.FullName -Value $newContent -NoNewline -Encoding UTF8
    }
  }
}

Write-Host "" -ForegroundColor Green
if ($DryRun) {
  Write-Host "DRY RUN: would fix $fixedCount files:" -ForegroundColor Yellow
} else {
  Write-Host "Fixed $fixedCount files:" -ForegroundColor Green
}
$filesFixed | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

Write-Host ""
Write-Host "Next: cd H:\Code\helix-documentation-website-fork && npm run build" -ForegroundColor Cyan
