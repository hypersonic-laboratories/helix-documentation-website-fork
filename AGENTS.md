# Agent instructions

This file tells AI coding agents (Codex, Claude, etc.) how to work in this repo.

## Commit messages

Follow **Gitmoji + Conventional Commits** format:

    <emoji> <type>: <imperative summary>

### Examples

- ✨ feat: add search bar to homepage
- 🐛 fix: correct pagination on news_updates page
- 📝 docs: update API reference for /users endpoint
- ♻️ refactor: simplify navigation component
- 🔧 chore: update mkdocs dependencies
- ⏪ revert: undo test note addition

### Rules

- Use imperative mood — "add" not "added", "fix" not "fixes"
- Keep the subject line under 72 characters
- Always include the emoji matching the type
- One logical change per commit

### Emoji → type reference

- ✨ feat — new feature
- 🐛 fix — bug fix
- 📝 docs — documentation only
- 💄 style — formatting, whitespace, UI-only changes
- ♻️ refactor — restructure without changing behavior
- ⚡ perf — performance improvement
- ✅ test — add or fix tests
- 🔧 chore — config, tooling, maintenance
- 🔥 remove — removing code or files
- 🚀 release — version bumps or deployment
- ⏪ revert — reverting a previous commit
