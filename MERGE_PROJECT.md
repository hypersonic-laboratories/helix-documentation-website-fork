# HELIX Docs Merge Project — Handover & Status

> **Last updated:** 2026-04-23 (afternoon)
> **Current status:** Everything Claude did was **in the wrong repo**. `new-docs` is Jack's reference code — we are NOT working in it. All real work has been moved into the FORK (`H:\Code\helix-documentation-website-fork`) via a one-shot migration script.
> **Target repo:** `H:\Code\helix-documentation-website-fork` (auto-deploys to `helix-documentation-website-fork.olivato.workers.dev`)
> **This repo (`new-docs`):** reference only — will be reset to Jack's clean `develop` when Jen runs `MIGRATE.ps1` (in the fork).
> **Owner:** Jen (jen@hypersoniclabs.co) with Claude + Codex

This file exists only so that whoever opens `new-docs` next understands the migration isn't here. **Read the MERGE_PROJECT.md in the fork after the migration runs** — that will be the living project brain going forward.

---

## TL;DR — what to do right now

1. **Open PowerShell**, go to the fork, and run the migration script:

   ```powershell
   cd H:\Code\helix-documentation-website-fork
   # Dry run first (optional, shows what it'll do without changing anything):
   powershell -ExecutionPolicy Bypass -File .\MIGRATE.ps1 -DryRun

   # For real:
   powershell -ExecutionPolicy Bypass -File .\MIGRATE.ps1
   ```

2. The script will:
   - create branch `feat/docusaurus-migration` in the fork
   - move the fork's existing MkDocs `docs\*` into `docs\old-docs\*`
   - copy Docusaurus scaffold from `new-docs` into the fork
   - delete MkDocs-only files (`mkdocs.yml`, `_overrides`, `requirements.txt`, etc.)
   - write a fresh GitHub Actions workflow that builds Docusaurus
   - update `wrangler.jsonc` to serve `build\` instead of `site\`
   - commit the changes on the new branch
   - **reset this `new-docs` repo to Jack's clean state** (wipes Claude's changes in new-docs)

3. After the script finishes:

   ```powershell
   cd H:\Code\helix-documentation-website-fork
   npm install
   npm run build        # verify it compiles
   npm run start        # preview at http://localhost:3000
   git push -u origin feat/docusaurus-migration
   ```

   Then open a PR against `development` in the fork.

---

## Why we pivoted to the fork

**The fork is the repo Cloudflare auto-deploys.** `helix-documentation-website-fork.olivato.workers.dev` pulls from the fork's `development` branch via a Cloudflare Worker. If we want the new docs to actually appear on a URL the team can look at, the code has to live in the fork.

`new-docs` is Jack's code — a Docusaurus prototype with ~54 rewritten pages, the BlueprintGraph renderer, Atlas chat, and the theme. It's **reference only**. We're copying what we need FROM it into the fork, not building on top of it.

---

## The three inputs we're merging

| Source | What it is | Where it ended up |
|---|---|---|
| **Kostas's prototype** | Tutorials-home mockup (Roblox-like feel) | Design reference only — informing `src/pages/index.tsx` restyle (task #6) |
| **Jack's prototype (`new-docs`)** | Docusaurus 3.9 + React 19 + TypeScript, BlueprintGraph, Atlas chat | **Scaffold copied into fork** via `MIGRATE.ps1` |
| **Old docs (fork)** | MkDocs Material, ~161 markdown files, canonical content | Moved into `docs\old-docs\` inside the fork, preserving hierarchy |

## Agreed Information Architecture

Top nav (left → right): **Docs · Roadmap · Changelog · News↗ · API Reference · | · Discord · HELIX↗**

Sidebar top-level categories (inside Docs):
1. Welcome · 2. Getting Started · 3. Core Concepts · 4. Scripting · 5. Game Systems · 6. Multiplayer · 7. Publishing · 8. Migration Guides · 9. QBCore · 10. Templates · 11. Roadmap (single page) · 12. Changelog (single page) · 13. **Old Docs** (mirror of old MkDocs nav)

### The Old Docs mirror rule

> If a page from the old docs has a natural home in Jack's new sidebar → port the content there.
> If it doesn't → it goes under `Old Docs → <original path>`, preserving the old MkDocs hierarchy.

Pages graduate OUT of `Old Docs` as they get rewritten into the sections above. The endgame is `Old Docs` being empty and removable.

## Branding decisions

- Colors: HELIX teal `#04FFD1` on charcoal `#0a0a0a`. NOT Kostas's placeholder palette.
- Fonts: **Tomorrow** (headings, UPPERCASE where appropriate) + **JetBrains Mono** (code).
- Dark mode is the default. Light mode toggle kept but secondary.

## Features inventory

| Feature | Decision |
|---|---|
| Docusaurus 3.9 + React 19 + TS | ✅ keep |
| HELIX dark + teal theme (`src/css/custom.css`) | ✅ keep |
| Tomorrow + JetBrains Mono fonts | ✅ keep |
| `LanguageTabs` (Blueprint / Lua / JS, Blueprint default) | ✅ keep |
| `BlueprintGraph` (interactive node renderer) | ✅ keep — marquee feature |
| `ConceptCallout`, `AuthorityBadge`, `FiveMComparison`, `DownloadTemplate` | ✅ keep |
| Atlas AI chat widget | ⚠️ **defer** — login broken, ship v1 without it, fix in v1.1 |
| `@easyops-cn/docusaurus-search-local` full-text search | ✅ keep (indexes `docs` + `api`) |
| Separate API Reference (`/api/` route via second docs plugin) | ✅ keep |
| Cloudflare Workers backend (`workers/atlas-api/`) | ⚠️ NOT copied to fork — unrelated to the docs scaffold |

## Task list state

| # | Subject | Status |
|---|---|---|
| 1 | Inventory Jack's new-docs repo | ✅ |
| 2 | Extract Kostas's design tokens | ⏳ (low priority — current theme already matches brand) |
| 3 | Build migration tracker artifact | ✅ |
| 4 | Agree on merged-site IA | ✅ |
| 5 | Scaffold Docusaurus in the FORK | ⚠️ **needs `MIGRATE.ps1` run** |
| 6 | Restyle Docusaurus to match Kostas's prototype + port tutorials home | ⏳ pending (next session) |
| 7 | Feature audit | ✅ (inline above) |
| 8 | Remap sidebar taxonomy onto Kostas's structure | ✅ (Old Docs mirror approach) |
| 9 | Apply HELIX dark + teal theme | ✅ |
| 10 | Add top-nav shortcuts | ✅ (waiting on migration script) |
| 11 | Create Old Docs sidebar category | ✅ (waiting on migration script) |
| 12 | Build + verify (`npm run build`) | ⚠️ **blocked — run after `MIGRATE.ps1`** |
| 13 | Write MERGE_PROJECT.md | ✅ (this file, and a copy moves to fork via script) |
| 14 | Write `MIGRATE.ps1` | ✅ in `H:\Code\helix-documentation-website-fork\MIGRATE.ps1` |
| 15 | Update fork deploy config for Docusaurus | ✅ (handled by `MIGRATE.ps1`) |

## Known caveats

1. **MkDocs admonition syntax** (`!!! note "Title"`) appears in a handful of old pages. Docusaurus renders it as plain text with `!!!` visible. Needs find-and-replace to `:::note\n...\n:::` during content polish.
2. **MkDocs tab syntax** (`=== "Tab"`) appears in ~25 files. Same story — convert to Docusaurus `<Tabs>` or tag `Needs Review`.
3. **`docs/old-docs/_extra/` and `docs/old-docs/_images/`** — MkDocs-theme asset folders. Safe to delete during cleanup (no `.md` content).
4. **Image bloat.** ~435 MB of images in `docs/old-docs/`. Consider `git-lfs`, external CDN, or pruning before the first production deploy.
5. **`helix.main.js`** in `docs/old-docs/helixjs/examples/scripts/` isn't markdown. Move to `static/` or reference a GitHub blob in a follow-up.
6. **Atlas AI chat** is in the code but login is broken. Don't ship until Jack fixes; consider feature-flagging off via env var.
7. **Cloudflare Pages project name:** the `deploy.yml` written by `MIGRATE.ps1` uses project name `helix-documentation-website-fork` to match the current Cloudflare Worker. If the Cloudflare dashboard actually targets a Pages project with a different name, adjust `--project-name=` accordingly.
8. **Cloudflare build command.** The existing Worker may have a build command configured in the Cloudflare dashboard (e.g. `mkdocs build`). After the migration, that needs updating to either `npm run build` with output `build/`, or removed entirely if the GitHub Action handles the build + deploy. Check the Cloudflare Pages/Workers dashboard.

## Conventions

- **Commits:** Gitmoji + Conventional Commits — e.g. `:sparkles: feat(sidebar): add Old Docs mirror category`, `:lipstick: style(theme): HELIX teal on dark`, `:recycle: refactor(nav): rename Guide → Docs`, `:truck: feat(docs): migrate MkDocs → Docusaurus`.
- **Branch names:** `feat/<short-dash-name>` for features, `fix/<name>` for bugs, `chore/<name>` for housekeeping.
- **PRs:** opened against `development` in the fork (NOT `main`).

## Mental model for future sessions

Think of `Old Docs` as scaffolding, not destination content. Every page that lives under `Old Docs → ...` today is a candidate for rewrite into the polished sections above it. When a page gets rewritten:
1. Move the new `.mdx` into its new home (e.g., `docs/core-concepts/the-game-loop.mdx`).
2. Delete the old-docs copy.
3. Add a redirect in `docusaurus.config.ts` (via `@docusaurus/plugin-client-redirects`) so existing links to `/docs/old-docs/...` keep working.
4. Update the migration tracker artifact — mark the page `Ported` with its new location.

The endgame is `Old Docs` being empty and removable. Every merged PR gets us closer.
