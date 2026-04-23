# MIGRATE.ps1
# ----------------------------------------------------------------------------
# One-shot migration: MkDocs fork -> Docusaurus (grafting Jack's new-docs).
#
# What this does (in order):
#   1. Sanity-checks both repos, aborts if anything is off.
#   2. In the FORK: creates branch `feat/docusaurus-migration` off `development`.
#   3. Moves the fork's existing `docs\*` (MkDocs content) into `docs\old-docs\*`
#      preserving the original hierarchy.
#   4. Copies Docusaurus scaffold FROM new-docs INTO the fork:
#        package.json, package-lock.json, tsconfig.json,
#        docusaurus.config.ts, sidebars.ts, sidebarsApi.ts,
#        src\, static\, api\, docs\ (the 57 new-format pages),
#        docs\old-docs\_category_.json files,
#        MERGE_PROJECT.md.
#      Skips: node_modules\, .git\, .claude\, atlas\, workers\, scripts\,
#             docs-mapping.json, .github\ (we write a fresh one below).
#   5. Deletes MkDocs-only files in the fork:
#        mkdocs.yml, _overrides\, requirements.txt, pyvenv.cfg, runtime.txt,
#        .venv\, .pages, site\ (build output)
#   6. Writes a fresh `.github\workflows\deploy.yml` that builds Docusaurus.
#   7. Overwrites `wrangler.jsonc` to serve `build\` (Docusaurus output) instead
#      of `site\` (MkDocs output).
#   8. Cleans up Claude's sandbox test artefacts (_test_write.txt, _testfile.txt, _source.txt).
#   9. Commits the changes on the migration branch (but does NOT push — Jen
#      reviews first).
#  10. Resets new-docs to Jack's clean `develop` state (wipes Claude's changes).
#
# USAGE:
#   cd H:\Code\helix-documentation-website-fork
#   powershell -ExecutionPolicy Bypass -File .\MIGRATE.ps1
#
# Or, for a dry run (shows what would happen, changes nothing):
#   powershell -ExecutionPolicy Bypass -File .\MIGRATE.ps1 -DryRun
#
# After it completes successfully, run:
#   npm install
#   npm run build
# to verify the scaffold actually builds. Then push:
#   git push -u origin feat/docusaurus-migration
# and open a PR against `development`.
# ----------------------------------------------------------------------------

[CmdletBinding()]
param(
  [switch]$DryRun,
  [string]$ForkPath = "H:\Code\helix-documentation-website-fork",
  [string]$NewDocsPath = "H:\Code\new-docs",
  [string]$BranchName = "feat/docusaurus-migration"
)

$ErrorActionPreference = "Stop"

function Write-Step { param($Msg) Write-Host "`n==> $Msg" -ForegroundColor Cyan }
function Write-Ok   { param($Msg) Write-Host "    OK: $Msg" -ForegroundColor Green }
function Write-Warn { param($Msg) Write-Host "    WARN: $Msg" -ForegroundColor Yellow }
function Write-Info { param($Msg) Write-Host "    $Msg" -ForegroundColor Gray }

function Do-Action {
  param([scriptblock]$Block, [string]$Desc)
  Write-Info $Desc
  if ($DryRun) {
    Write-Info "(dry run - skipped)"
  } else {
    & $Block
  }
}

# ----------------------------------------------------------------------------
# 1. Sanity checks
# ----------------------------------------------------------------------------
Write-Step "Sanity-checking"

if (-not (Test-Path $ForkPath))    { throw "Fork not found at $ForkPath" }
if (-not (Test-Path $NewDocsPath)) { throw "new-docs not found at $NewDocsPath" }
Write-Ok "Both repos exist"

Push-Location $ForkPath
try {
  if (-not (Test-Path ".git")) { throw "$ForkPath is not a git repo" }
  if (-not (Test-Path "mkdocs.yml")) {
    Write-Warn "mkdocs.yml not found in fork - is this the right repo? Continuing anyway."
  }
  $status = git status --porcelain
  if ($status) {
    Write-Warn "Fork has uncommitted changes:"
    git status --short
    Write-Warn "These will be included in the migration commit. Ctrl+C now if that's not what you want."
    if (-not $DryRun) { Start-Sleep -Seconds 5 }
  }
  $currentBranch = git rev-parse --abbrev-ref HEAD
  Write-Ok "Fork on branch '$currentBranch'"
} finally { Pop-Location }

Push-Location $NewDocsPath
try {
  if (-not (Test-Path ".git")) { throw "$NewDocsPath is not a git repo" }
  Write-Ok "new-docs is a git repo"
} finally { Pop-Location }

# ----------------------------------------------------------------------------
# 2. Create migration branch in the fork
# ----------------------------------------------------------------------------
Write-Step "Creating branch '$BranchName' in fork"
Push-Location $ForkPath
try {
  Do-Action { git checkout development } "Checkout development"
  $existingBranch = git branch --list $BranchName
  if ($existingBranch) {
    Write-Warn "Branch '$BranchName' already exists. Using it."
    Do-Action { git checkout $BranchName } "Checkout existing $BranchName"
  } else {
    Do-Action { git checkout -b $BranchName } "Create + checkout $BranchName"
  }
} finally { Pop-Location }

# ----------------------------------------------------------------------------
# 3. Move fork's docs\* -> docs\old-docs\* (preserve hierarchy)
# ----------------------------------------------------------------------------
Write-Step "Moving fork's MkDocs content into docs\old-docs\"
Push-Location $ForkPath
try {
  $docsPath = Join-Path $ForkPath "docs"
  $oldDocsPath = Join-Path $docsPath "old-docs"

  if (Test-Path $oldDocsPath) {
    Write-Warn "docs\old-docs\ already exists - skipping move (assumed already done)"
  } elseif (Test-Path $docsPath) {
    Do-Action {
      # Stage: move docs\ to a temp location, then create new docs\old-docs\
      $tempOld = Join-Path $ForkPath "_docs_oldmkdocs_tmp"
      if (Test-Path $tempOld) { Remove-Item $tempOld -Recurse -Force }
      Move-Item $docsPath $tempOld
      New-Item -ItemType Directory -Path $docsPath | Out-Null
      New-Item -ItemType Directory -Path $oldDocsPath | Out-Null
      Get-ChildItem $tempOld | ForEach-Object {
        Move-Item $_.FullName (Join-Path $oldDocsPath $_.Name)
      }
      Remove-Item $tempOld -Recurse -Force
    } "Moved docs\* -> docs\old-docs\*"
  } else {
    Write-Warn "No docs\ folder in fork - nothing to move"
  }
} finally { Pop-Location }

# ----------------------------------------------------------------------------
# 4. Copy Docusaurus scaffold from new-docs into fork
# ----------------------------------------------------------------------------
Write-Step "Copying Docusaurus scaffold from new-docs into fork"

$skip = @(
  "node_modules", ".git", ".github", ".claude", "atlas", "workers",
  "scripts", "docs-mapping.json", "MIGRATE.ps1", "_docs_oldmkdocs_tmp",
  # Claude's sandbox test artefacts (if they leaked into new-docs):
  "_test_write.txt", "_testfile.txt", "_source.txt"
)

Push-Location $NewDocsPath
try {
  Get-ChildItem -Force | Where-Object {
    $item = $_
    $shouldSkip = $false
    foreach ($s in $skip) { if ($item.Name -eq $s) { $shouldSkip = $true; break } }
    -not $shouldSkip
  } | ForEach-Object {
    $src = $_.FullName
    $dst = Join-Path $ForkPath $_.Name

    # Special handling for docs\: fork already has docs\old-docs\ from step 3.
    # We want to merge new-docs\docs\ INTO fork\docs\ (adding the 57 new pages +
    # roadmap + changelog + old-docs _category_.json files, without blowing away
    # the old-docs content we just moved).
    if ($_.Name -eq "docs") {
      Do-Action {
        Get-ChildItem -Force $src | ForEach-Object {
          $subSrc = $_.FullName
          $subDst = Join-Path $dst $_.Name
          if ($_.Name -eq "old-docs") {
            # new-docs\docs\old-docs\ is a COPY of the fork's old docs. We
            # already have those in the fork from step 3 - but we DO want the
            # _category_.json files from new-docs. Copy those files only.
            if (Test-Path $subDst) {
              Get-ChildItem -Recurse -File $subSrc -Filter "_category_.json" | ForEach-Object {
                $relPath = $_.FullName.Substring($subSrc.Length).TrimStart('\')
                $targetFile = Join-Path $subDst $relPath
                $targetDir = Split-Path $targetFile -Parent
                if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
                Copy-Item $_.FullName $targetFile -Force
              }
            } else {
              Copy-Item $subSrc $subDst -Recurse -Force
            }
          } else {
            if ($_.PSIsContainer) {
              Copy-Item $subSrc $subDst -Recurse -Force
            } else {
              Copy-Item $subSrc $subDst -Force
            }
          }
        }
      } "Merged docs\ (preserved old-docs content, added new pages + _category_.json files)"
    } else {
      Do-Action {
        if ($_.PSIsContainer) {
          Copy-Item $src $dst -Recurse -Force
        } else {
          Copy-Item $src $dst -Force
        }
      } "Copied $($_.Name)"
    }
  }
} finally { Pop-Location }

# ----------------------------------------------------------------------------
# 5. Delete MkDocs-only files
# ----------------------------------------------------------------------------
Write-Step "Deleting MkDocs-only files from fork"
Push-Location $ForkPath
try {
  $mkdocsFiles = @(
    "mkdocs.yml",
    "_overrides",
    "requirements.txt",
    "pyvenv.cfg",
    "runtime.txt",
    ".venv",
    ".pages",
    "site",
    "Lib",
    "Scripts",
    # sandbox test cruft
    "_test_write.txt",
    "_testfile.txt",
    "_source.txt"
  )
  foreach ($f in $mkdocsFiles) {
    $p = Join-Path $ForkPath $f
    if (Test-Path $p) {
      Do-Action { Remove-Item $p -Recurse -Force } "Deleted $f"
    }
  }
} finally { Pop-Location }

# ----------------------------------------------------------------------------
# 6. Write .github\workflows\deploy.yml (build Docusaurus, deploy to CF Pages)
# ----------------------------------------------------------------------------
Write-Step "Writing .github\workflows\deploy.yml"
$deployYml = @'
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [development]
  pull_request:
    branches: [development]

jobs:
  build-and-deploy:
    name: Build & Deploy
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          # Matches the existing project name used by wrangler.jsonc
          command: pages deploy build --project-name=helix-documentation-website-fork
'@
Push-Location $ForkPath
try {
  Do-Action {
    $wfDir = Join-Path $ForkPath ".github\workflows"
    if (-not (Test-Path $wfDir)) { New-Item -ItemType Directory -Path $wfDir -Force | Out-Null }
    Set-Content -Path (Join-Path $wfDir "deploy.yml") -Value $deployYml -Encoding UTF8
  } "Wrote .github\workflows\deploy.yml"
} finally { Pop-Location }

# ----------------------------------------------------------------------------
# 7. Overwrite wrangler.jsonc so CF Worker serves build\ (Docusaurus output)
# ----------------------------------------------------------------------------
Write-Step "Updating wrangler.jsonc"
$wrangler = @'
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "helix-documentation-website-fork",
  "compatibility_date": "2026-04-23",
  "observability": {
    "enabled": true
  },
  "assets": {
    "directory": "build"
  },
  "compatibility_flags": [
    "nodejs_compat"
  ]
}
'@
Push-Location $ForkPath
try {
  Do-Action {
    Set-Content -Path (Join-Path $ForkPath "wrangler.jsonc") -Value $wrangler -Encoding UTF8
  } "Wrote wrangler.jsonc (assets.directory: build)"
} finally { Pop-Location }

# ----------------------------------------------------------------------------
# 8. Append Docusaurus-friendly entries to .gitignore
# ----------------------------------------------------------------------------
Write-Step "Updating .gitignore"
Push-Location $ForkPath
try {
  $gi = Join-Path $ForkPath ".gitignore"
  $addLines = @"

# Docusaurus
/node_modules
/.docusaurus
/build
/.cache-loader
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
"@
  Do-Action {
    if (Test-Path $gi) {
      $existing = Get-Content $gi -Raw
      if ($existing -notmatch "/.docusaurus") {
        Add-Content -Path $gi -Value $addLines
      }
    } else {
      Set-Content -Path $gi -Value $addLines -Encoding UTF8
    }
  } "Ensured Docusaurus entries in .gitignore"
} finally { Pop-Location }

# ----------------------------------------------------------------------------
# 9. Commit on migration branch (gitmoji + conventional commits)
# ----------------------------------------------------------------------------
Write-Step "Committing on '$BranchName'"
Push-Location $ForkPath
try {
  # Remove stale index.lock if any
  $lock = Join-Path $ForkPath ".git\index.lock"
  if (Test-Path $lock) {
    Do-Action { Remove-Item $lock -Force } "Removed stale .git\index.lock"
  }

  Do-Action { git add -A } "git add -A"
  $hasChanges = -not $DryRun -and -not [string]::IsNullOrWhiteSpace((git status --porcelain))
  if ($DryRun -or $hasChanges) {
    Do-Action {
      git commit -m ":truck: feat(docs): migrate MkDocs -> Docusaurus scaffold from new-docs" `
                 -m "- Grafted Docusaurus 3.9 scaffold (Jack's) onto the fork." `
                 -m "- Moved all existing MkDocs content into docs/old-docs/ preserving hierarchy." `
                 -m "- Added top-nav shortcuts: Docs / Roadmap / Changelog / News / API Reference." `
                 -m "- Added Old Docs autogenerated sidebar category (with _category_.json labels)." `
                 -m "- Replaced MkDocs build in CI with Docusaurus (.github/workflows/deploy.yml)." `
                 -m "- wrangler.jsonc now serves build/ instead of site/." `
                 -m "- See MERGE_PROJECT.md for full context and next steps."
    } "Created commit"
  } else {
    Write-Warn "Nothing to commit (working tree clean)"
  }
} finally { Pop-Location }

# ----------------------------------------------------------------------------
# 10. Reset new-docs to Jack's clean state (wipes Claude's changes)
# ----------------------------------------------------------------------------
Write-Step "Resetting new-docs to clean state"
Push-Location $NewDocsPath
try {
  # Nuke stale index.lock if present
  $lock = Join-Path $NewDocsPath ".git\index.lock"
  if (Test-Path $lock) {
    Do-Action { Remove-Item $lock -Force } "Removed stale .git\index.lock from new-docs"
  }

  Do-Action { git fetch origin } "Fetch origin"

  # Figure out the default branch (develop or main)
  $defaultBranch = git remote show origin 2>$null | Select-String "HEAD branch:" | ForEach-Object {
    ($_ -split ":")[1].Trim()
  } | Select-Object -First 1
  if (-not $defaultBranch) { $defaultBranch = "develop" }
  Write-Info "Default branch detected: $defaultBranch"

  Do-Action { git checkout $defaultBranch 2>$null } "Checkout $defaultBranch"
  Do-Action { git reset --hard "origin/$defaultBranch" } "Reset hard to origin/$defaultBranch"
  Do-Action { git clean -fd } "Clean untracked files"

  # Delete Claude's migration branch if it exists
  $claudeBranch = git branch --list "feat/helix-theme-and-old-docs-mirror"
  if ($claudeBranch) {
    Do-Action { git branch -D feat/helix-theme-and-old-docs-mirror } "Deleted Claude's migration branch in new-docs"
  }
} finally { Pop-Location }

# ----------------------------------------------------------------------------
# Done
# ----------------------------------------------------------------------------
Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " MIGRATION COMPLETE" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Fork branch:    $BranchName" -ForegroundColor Yellow
Write-Host "Fork path:      $ForkPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd $ForkPath" -ForegroundColor Gray
Write-Host "  2. npm install" -ForegroundColor Gray
Write-Host "  3. npm run build   # verify Docusaurus compiles" -ForegroundColor Gray
Write-Host "  4. npm run start   # local preview at http://localhost:3000" -ForegroundColor Gray
Write-Host "  5. git push -u origin $BranchName" -ForegroundColor Gray
Write-Host "  6. Open PR against 'development' for team review" -ForegroundColor Gray
Write-Host ""
Write-Host "If anything went sideways, you can always:" -ForegroundColor Cyan
Write-Host "  cd $ForkPath" -ForegroundColor Gray
Write-Host "  git checkout development" -ForegroundColor Gray
Write-Host "  git branch -D $BranchName" -ForegroundColor Gray
Write-Host ""
Write-Host "(Then re-run this script.)" -ForegroundColor Gray
