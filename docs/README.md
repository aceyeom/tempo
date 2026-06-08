# DOLBOMI — Engineering Documentation

This `docs/` folder is the **engineering source of truth** for the implemented app
in [`dolbomi-app/`](../dolbomi-app). It was written by reading the code top-to-bottom
(frontend store, screens, 3D engine, Express API, SQLite schema/seed) and the
design handoff material (`chats/`, `project/`).

The app is a **gamified self-development app for Korean military service members**
("군인 자기개발 앱"): six stats grow as you complete quests pulled from a real
opportunity catalog, a 3D guardian creature evolves with your XP, and you climb a
vacation-leave ladder and browse a benefits hub.

> ⚠️ **Read this first:** a large share of the visible app is a **high-fidelity
> visual shell**. Many flows render beautifully but do not actually mutate state,
> and several "AI-powered" labels describe behavior that does not exist in the
> code. The full inventory is in **[LOGIC-GAPS.md](./LOGIC-GAPS.md)** — start there
> if your goal is to make the app *functionally* real.

## Documents

| File | What it covers |
| --- | --- |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Tech stack, repo layout, frontend↔backend seam, data flow, the 3D creature engine, build/run. |
| **[WORKFLOW-LOGIC.md](./WORKFLOW-LOGIC.md)** | Every core loop **as it is intended to work** and **as it actually works**: boot/auth, the XP→evolution loop, check-in, quests, opportunities/plans, vacation, benefits, theming/avatar. Heavy focus on logic. |
| **[LOGIC-GAPS.md](./LOGIC-GAPS.md)** | The catalogue of broken / non-functional / dead logic — "things to fix." Grouped by area, each with severity, the UI's claim, what actually happens, and a `file:line` pointer. **This is the main deliverable.** |
| **[DOCS-AND-README-AUDIT.md](./DOCS-AND-README-AUDIT.md)** | Assessment of whether `chats/`, the root `README.md`, and `dolbomi-app/README.md` are still needed, redundant, or stale — with recommended actions. |

## TL;DR of findings

- **The central loop is open, not closed.** Completing quests flips `done` flags and
  writes activity rows, but **never increases any stat**. Because the guardian's
  evolution stage is computed purely from the sum of the six stats, **the creature
  can never evolve through play** and every `+XP` animation is cosmetic.
- **The "AI" is theater.** There are **no LLM/AI calls anywhere**. The daily
  check-in does not tailor quests, "AI 재계획" shows canned text, and "오늘의 한 줄"
  is a hardcoded string.
- **There is no settings UI and no onboarding.** Theme, palette, and avatar path
  live only in a **developer Tweaks panel** that opens via a `postMessage` from a
  design-canvas parent frame — so in a standalone deploy users cannot change them
  at all, and nothing persists.
- **No account creation.** Only the seeded `demo/dolbomi` soldier exists; the app
  auto-logs-in as that one account.
- **Several controls are no-ops:** the Benefits branch filter (육군/해군/공군/해병대),
  "오늘 밤의 3에 추가", "인증 +보너스", and share buttons do nothing meaningful.

_Last reviewed against the code on this branch. Line numbers refer to files as they
exist now and may drift as the code changes._
