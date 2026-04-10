---
inclusion: auto
---

# ORGs Skills Registry

This file is auto-included in every Kiro session. It tracks all learned skills, their source URLs, and last verified dates.

## Active Skills

| Skill | File | Source URL | Last Verified | Version |
|-------|------|-----------|---------------|---------|
| Electron Fundamentals | `electron-fundamentals.md` | https://www.electronjs.org/docs/latest | 2026-04-10 | Electron v41 |
| NSIS Windows Installer | `nsis-windows-installer.md` | https://nsis.sourceforge.io/Docs/ | 2026-04-10 | NSIS v3.11 |
| Playwright Testing | `playwright-testing.md` | https://playwright.dev/docs/intro | 2026-04-10 | Playwright v1.x |

---

## Skill Update Protocol

When any skill is referenced or a new session starts on a relevant topic, Kiro MUST:

1. **Check the source URL** for any updates since `Last Verified` date
2. **Compare** key APIs, config options, and breaking changes
3. **Update the skill file** if significant changes are found
4. **Update the `Last Verified` date** in this registry
5. **Copy updated skill** to `~/.kiro/skills/` for global persistence

## How New Skills Are Added

When a user says "learn this" or "save as skill":
1. Fetch and study the documentation comprehensively
2. Save to `.kiro/skills/{skill-name}.md` (workspace)
3. Copy to `~/.kiro/skills/{skill-name}.md` (global — persists across all projects)
4. Add entry to this registry with source URL and date
5. Commit both files to the repo

## Trigger Words

The following topics should trigger an automatic skill update check:
- "electron" → check electron-fundamentals.md
- "nsis", "installer", "packaging" → check nsis-windows-installer.md  
- "playwright", "testing", "e2e" → check playwright-testing.md
- "learn", "skill", "documentation" → add new skill
