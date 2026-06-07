# TEMPO — Docs, README & Chat-Context Audit

Per the brief: *"determine if the chat context and readme is unnecessary or needs
updating."* Verdict per artifact, with recommended action. Short answer: **nothing
should be deleted, but the root README is stale as an entry point and the chats must
be clearly labeled as aspirational design intent, not a description of the running
app.**

---

## 1. Root `README.md` — ⚠️ stale, needs updating

It is a **pre-implementation handoff README** ("CODING AGENTS: READ THIS FIRST… a
handoff bundle from Claude Design"). It instructs an agent to read the `chats/` and
the `project/*.html` prototypes and *implement them*, and says the bundle contents
are `README.md`, `chats/`, `project/` — with **no mention of `tempo-app/`**, which is
the actual implementation that now exists.

- **Still useful for:** provenance — explaining where the design came from and that
  `project/` holds the original mockups.
- **Misleading now because:** it presents the repo as "designs awaiting
  implementation" when a full-stack app already exists; a new reader following its
  instructions would re-implement what's already built and never look at `tempo-app/`.

**Recommended action:** keep it but add a top banner that points to `tempo-app/`
(the real app), `docs/` (this folder), and clarifies `project/` + `chats/` are design
origin/reference. Don't delete — it documents the handoff lineage.

---

## 2. `tempo-app/README.md` — ✅ accurate, keep

This is a solid, current description of the implemented app (stack, run scripts,
architecture, the frontend↔backend seam, asset fallbacks). It matches the code.

- **One caveat:** the opening line *"Progress (quest completion, plan milestones,
  daily check-ins) persists to a real database"* is true for **completion flags and
  streak/activity**, but it implies a working progression system. It does **not**
  mention that **stats never grow and the creature never evolves** (see
  [LOGIC-GAPS #A](./LOGIC-GAPS.md#a-xp--leveling--evolution-the-core-broken-loop)).
  Consider a "Known gaps" link to `docs/LOGIC-GAPS.md` so the README doesn't oversell.

**Recommended action:** keep as-is; add a single line linking to `docs/` and noting
the known logic gaps.

---

## 3. `chats/` (chat1–chat7) — ✅ keep, but relabel as aspirational

These 7 transcripts are the **design conversation** behind the app. They are
valuable but easy to misread as a spec of the *current* behavior.

What they uniquely contain (not in code):
- **Emotional product intent** — the "your 18 months weren't wasted" framing, the
  discharge "Receipt," 포상휴가 as the real-world hook.
- **Rejected directions** — squad/social, separate animal toggles, capes, multiple
  halos, flat badges, generic animations. Knowing what was *cut* prevents
  re-introducing it.
- **Design culture / north stars** — "like Toss," "no AI slop," iterate and ask first.
- **Avatar engineering detail** — per-vertex gilding, path→animal binding, cape
  physics history (capes ultimately removed).

What is **redundant** with the code (no need to re-read for behavior): screen
layouts, component styling, palette/token decisions, the 3D shader approach — all of
these are now in `tempo-app/` and described in [ARCHITECTURE.md](./ARCHITECTURE.md).

What is **aspirational / NOT implemented** (the important caveat): the chats and the
`project/uploads/PRODUCT_SPEC_v3 2.md` describe an **AI companion with 14-day memory,
weekly "Sunday Letter," an adaptive quest engine, and a journal→LLM quest pipeline**
as the product's core/moat. **None of that exists in the code** (see
[LOGIC-GAPS #B5, #C](./LOGIC-GAPS.md#b-check-in-mood-energy--ai-customization)). A
reader who takes the chats as ground truth will believe the app is far more
functional than it is.

**Recommended action:** keep the folder as design reference, but treat
`docs/WORKFLOW-LOGIC.md` + `docs/LOGIC-GAPS.md` as the authority on *actual*
behavior. If anything, add a one-line note at the top of `chats/` (or rely on this
audit) that these are **design intent, partially implemented**.

---

## 4. `project/` (HTML/JSX prototypes, screenshots, PRODUCT_SPEC) — ✅ keep as reference

The original mockups and `PRODUCT_SPEC_v3 2.md` are the canonical design source. They
are not wired into the running app and need no update; they're useful when deciding
*how a fix should look*. Same aspirational caveat as the chats applies to the spec's
AI/feature claims.

---

## Summary table

| Artifact | Status | Action |
| --- | --- | --- |
| Root `README.md` | ⚠️ Stale entry point | Add banner pointing to `tempo-app/` + `docs/`; keep for provenance |
| `tempo-app/README.md` | ✅ Accurate | Add link to `docs/`; note known gaps; don't overstate "persists" |
| `chats/` | ✅ Valuable, but aspirational | Keep as design intent; defer to `docs/` for actual behavior |
| `project/` + PRODUCT_SPEC | ✅ Canonical design source | Keep; same AI-claims caveat |
| `docs/` (this folder) | ✅ New source of truth for behavior | Maintain alongside code |

**Bottom line:** none of it is "unnecessary." The root README needs a small update so
it stops presenting the repo as un-built. The chats/spec stay, but the
**implementation reality lives in `docs/`** — because the gap between what the design
promises and what the code does is large, and that gap is exactly what this
documentation set makes explicit.
