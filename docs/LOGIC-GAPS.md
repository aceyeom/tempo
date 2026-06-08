# DOLBOMI — Logic Gaps & Things to Fix

The catalogue of **broken, non-functional, dead, or misleading logic** in
`dolbomi-app/`. This is the implementation backlog implied by the brief
("various components… just a visual unfunctional wrapper… all the logical
loopholes"). Nothing here has been changed — this is analysis only.

**Severity:** 🔴 core loop broken / claim is false · 🟠 feature non-functional ·
🟡 misleading / partial / stale · ⚪ cosmetic / cleanup.

Each item: **Claim** (what the UI implies) → **Reality** (what the code does) →
`file:line` → **Fix direction**.

Quick index:
[A. XP/Evolution](#a-xp--leveling--evolution-the-core-broken-loop) ·
[B. Check-in/AI](#b-check-in-mood-energy--ai-customization) ·
[C. Fake AI](#c-canned-ai-surfaces) ·
[D. Quest creation](#d-adding--creating-quests) ·
[E. Verification](#e-verified--bonus) ·
[F. Settings/Theme/Avatar/Identity](#f-settings-theme-avatar-path-조직-병과) ·
[G. Accounts/Auth](#g-accounts--auth) ·
[H. Vacation](#h-vacation-ladder) ·
[I. Catalog/filters](#i-catalog--filters) ·
[J. Titles/Recap/Activity/Sharing](#j-titles-recap-activity-sharing) ·
[K. Persistence/sync](#k-persistence--sync) ·
[L. Misc/data](#l-misc--stale-data)

---

## A. XP / Leveling / Evolution (the core broken loop)

### 🔴 A1 — Stats never increase
**Claim:** completing quests grows your six stats.
**Reality:** `stats.cur` is seeded once and **no mutation ever updates it**.
`toggleTonight` and `toggleSubquest` only flip `done` and log activity.
`server/repositories/mutations.js` (whole file) · `db/schema.sql:26` (`stats` table).
**Fix:** on quest/subquest completion, `UPDATE stats SET cur = cur + xp` for the
quest's stat (and decrement on un-toggle), then return refreshed stats. Decide XP→stat
scaling and a cap vs `tgt`.

### 🔴 A2 — Guardian never evolves
**Claim:** "다음 진화 …까지" — the creature evolves as you progress.
**Reality:** `evolutionOf(stats)` = sum of `stats.cur`; since cur is frozen (A1),
the stage/label/progress are constant forever.
`components/creature/GuardianCard.jsx:14`.
**Fix:** falls out of A1. Verify `BANDS` thresholds match realistic stat totals
(seed total ≈ 304 → already "성체"; max with six 100s = 600 vs top band 500).

### 🔴 A3 — "+XP" celebration is cosmetic
**Claim:** `QuestComplete` counts up "+N XP" and "{stat} 경험치 성장".
**Reality:** the number is `quest.xp` animated locally; nothing is stored.
`components/Overlays.jsx:73-83, 119-127`.
**Fix:** tie to A1; show the real stat delta returned by the mutation.

### 🟠 A4 — Tonight-quest XP is never aggregated
**Reality:** `tonight[].xp` is displayed but never added to stats or any total.
`data/index.js:33`, `screens/HomeScreen.jsx:84`.

### 🟡 A5 — Per-stat cur/tgt are static, not computed
**Claim:** "능력치 · 경험치" implies these reflect your quest history.
**Reality:** `StatBar`/`SkillDetail` show seed `cur/tgt`; the per-stat quest list is
derived live but the numbers above it are not.
`components/SkillDetail.jsx:38-40`, `components/ui.jsx` (`StatBar`).

### 🟡 A6 — Avatar gilding is implemented but frozen
**Reality:** `creature.js applyStats()` genuinely gilds head/chest/hooves from
mind/money/etc., and `AvatarViewer` shows "머리 금빛 = 0.5·mind+0.5·money". Because
stats never change (A1), these meters never move in normal use.
`3d/creature.js:760`, `components/creature/AvatarViewer.jsx:13-16, 67`.
**Fix:** falls out of A1; otherwise the whole shader system is invisible.

### 🟡 A7 — `milestones` count is the only live creature input
**Reality:** App computes a `milestones` number (completed milestones + done tonight,
App.jsx:79) and passes it to `setMilestones`, which only changes particle/orbit
counts — not stage, XP, or stats. It's easy to mistake this for "progression."
`App.jsx:79-83`, `3d/creature.js:761`.

---

## B. Check-in (mood, energy) → AI customization

### 🔴 B1 — Check-in does not change tonight's quests
**Claim:** "오늘 밤 퀘스트가 기분에 맞춰졌어" / "오늘 밤의 3 받기" — quests tailored to mood/energy.
**Reality:** `addCheckin` inserts a row, bumps streak, logs activity. Tonight is a
fixed 3-row seed; never regenerated.
`server/repositories/mutations.js:41`, `components/Overlays.jsx:20-61`,
`screens/HomeScreen.jsx:34`.
**Fix:** implement quest selection (e.g. the `pickTonight()` scoring from the design
docs) keyed on energy/mood; regenerate and return tonight in the checkin response.

### 🟡 B2 — Mood isn't persisted to the UI
**Reality:** `mood` is local React state for the home-card label only; not in the
snapshot, so it resets on reload.
`App.jsx:51, 173`, `screens/HomeScreen.jsx:30-34`.

### 🟠 B3 — Energy is captured, stored, and never used
**Reality:** `energy` is POSTed and saved to `checkins.energy`, but no code reads it.
`server/repositories/mutations.js:42`, `db/schema.sql:147`.

### 🟡 B4 — Streak has no once-per-day guard
**Reality:** every check-in does `streak = streak + 1`. Five check-ins → +5. No date
dedupe; also nothing decays a broken streak.
`server/repositories/mutations.js:44-46`.
**Fix:** guard on "already checked in today"; compute streak from `checkins` dates.

### 🔴 B5 — No AI companion / Sunday Letter / journal pipeline
**Claim:** design docs describe a memory-bearing AI companion, weekly letters, and
journal→LLM quest generation.
**Reality:** there are **zero** LLM/AI calls anywhere in the codebase.
(grep: no anthropic/openai/fetch-to-LLM anywhere.)
**Fix:** out of scope for a quick fix; if "AI-powered" stays in the UX copy, it must
be backed by a real model call or the copy should be softened.

---

## C. Canned "AI" surfaces

### 🟡 C1 — "오늘의 한 줄" is a hardcoded string
**Reality:** one streak≥3 ternary around a fixed sentence that always references
"정보처리 필기까지 D-12" regardless of data.
`screens/HomeScreen.jsx:51-60`.

### 🟠 C2 — "마감까지 다시 짜기 (AI 재계획)" does nothing
**Reality:** sets local `replanned=true`, shows canned text, and only clamps the
local "expected %"; the plan/subquests are unchanged and it resets on navigation.
`screens/OppPlan.jsx:9-15, 58-72`.

### 🟡 C3 — Radar "personalization" is hardcoded
**Reality:** "너에게 맞는 기회 N개 · 육군 · 상병 프로필 기준" — N is just `catalog.length`;
the rest is a fixed label. No filtering by the soldier's profile.
`screens/RadarScreen.jsx:18-24`.

---

## D. Adding / creating quests

### 🟠 D1 — "추가 / 퀘스트" buttons don't add anything
**Claim:** "오늘 밤의 3에 추가" (OppDetail, OppPlan) and Benefits "퀘스트" add a quest.
**Reality:** they navigate Home (`setPushed(null); setTab('home')`) or open the opp
detail (`makeQuest`). Tonight is never modified.
`App.jsx:94, 106, 109`, `screens/OppPlan.jsx:173`, `screens/BenefitsScreen.jsx:97`.
**Fix:** add a `POST /api/tonight` create endpoint + store action; map subquests/opps
into tonight rows.

### 🟠 D2 — No way to create/edit/reorder quests at all
**Reality:** there is no endpoint or UI to add, remove, reorder, or generate
tonight quests, opportunities, or benefits. Everything is read-only seed. The brief's
"manual inputting of events or opportunities" is **entirely absent**.
`server/routes/api.js` (no create routes).
**Fix:** decide which entities are user-authorable and add CRUD.

---

## E. Verified / bonus

### 🟡 E1 — "인증 +보너스" gives no bonus
**Claim:** verifying a subquest (vs honest-tap) grants a bonus.
**Reality:** `verified` only changes a checkmark color (gold→green) and adds an
"인증됨" tag. XP is fixed by `size`; nothing differs in scoring, and `verified` is
stored but unused by any calculation.
`screens/OppPlan.jsx:82-113`, `server/repositories/mutations.js:22-38`.

---

## F. Settings, theme, avatar path, 조직, 병과

### 🔴 F1 — No user-facing settings screen
**Reality:** nav is home/radar/vacation/benefits/profile only. All design controls
live in the dev `TweaksPanel`.
`App.jsx:35-41, 177-190`.

### 🔴 F2 — The Tweaks panel is unreachable in production
**Reality:** it renders only on receiving a `__activate_edit_mode` `postMessage` from
a **parent frame** (the design-canvas host); standalone there's no parent, so it
never opens (`if (!open) return null;`).
`components/TweaksPanel.jsx:160-169, 198`.
**Fix:** build a real Settings screen for theme/palette/avatar; don't rely on the
dev panel for production controls.

### 🟠 F3 — Tweaks (and theme/palette) never persist
**Reality:** `useTweaks` is React state seeded from `TWEAK_DEFAULTS` on every load
and only `postMessage`s to the parent — no localStorage/server.
`components/TweaksPanel.jsx:115-125`, `App.jsx:19-28`.

### 🟠 F4 — Light/dark mode can't be toggled by users & doesn't persist
**Reality:** consequence of F2+F3. The token system (`styles/tokens.css`) fully
supports light/dark, but the only switch is the unreachable, non-persistent panel.

### 🟡 F5 — No onboarding / first-run avatar selection; path choice not saved
**Reality:** path defaults to 해치/ram. The in-card "길 바꾸기" picker works at runtime
(GuardianCard.jsx:59) but isn't persisted and there's no "choose your guardian to get
started" flow. The brief's "how does the user select the avatar to get started?" has
no answer in the app.
`App.jsx:19, 77, 97`, `components/creature/GuardianCard.jsx:59-89`.
**Fix:** onboarding step that writes the chosen path to the soldier record; load it
into state on boot.

### 🟡 F6 — Benefits branch filter (육군/해군/공군/해병대) is a no-op
**Claim:** filter benefits by branch / 병과.
**Reality:** `setBranch` updates state but `grouped` never filters by `branch`; all
benefits are tagged `전군`. Selecting 해군 changes nothing.
`screens/BenefitsScreen.jsx:18-19, 32-37`.
**Fix:** tag benefits/opps by branch and filter; or remove the control.

### ⚪ F7 — Four paths, two models
**Reality:** `ANIMAL_FOR_PATH` maps haechi/phoenix→ram and dragon/tiger→fox, so 봉황
is visually identical to 해치 and 백호 to 청룡. Path descriptions differ; models don't.
`App.jsx:33`, `components/creature/CreatureHero.jsx:4-14`.

### 🟡 F8 — 조직/unit is hardcoded and unsettable
**Reality:** `soldier.unit = '제3보병사단'`; no UI to choose or change it; nothing
keys off it.
`data/index.js:9`.

---

## G. Accounts & auth

### 🔴 G1 — No account creation
**Reality:** only `POST /auth/login` exists; the sole account is the seeded
`demo/dolbomi`. No register/signup route, no logout, no account UI.
`server/routes/api.js:11-20`, `server/db/seed.js:18-30`.
**Fix:** add a register endpoint that creates a soldier + seeds their per-soldier
rows; add login/onboarding UI.

### 🟡 G2 — Everyone is the same soldier
**Reality:** the frontend auto-logs-in as demo on boot; multi-user is
schema-supported but unreachable.
`api/client.js:33-42`, `store.js:27-35`.

### 🟡 G3 — Default JWT secret
**Reality:** `SECRET` falls back to `'dev-dolbomi-secret-change-in-prod'` if the env var
is unset — fine for dev, must be set in prod.
`server/auth.js:5`.

---

## H. Vacation ladder

### 🟡 H1 — "지금 확보" is effectively a constant 4
**Reality:** `getVacation.secured` only counts **fully-completed** vacation opps and
otherwise returns `4`. Since opps rarely hit 100%, it shows `4` permanently.
`server/repositories/state.js:101-113`.

### ⚪ H2 — `MAXD` duplicated
**Reality:** the per-opp max-days table exists in both `state.js:100` and
`screens/VacationScreen.jsx:6`; they can drift.
**Fix:** make it part of the opportunity reward data (single source).

### 🟠 H3 — Earned leave is just a displayed number
**Reality:** even when secured increments, nothing adds leave days to the soldier or
changes `dday`/`served`. Vacation is purely informational.
`server/repositories/state.js:101`, `data/index.js:13-15`.

---

## I. Catalog & filters

### 🟡 I1 — Radar category filter omits a real category
**Reality:** filter chips are `전체/대회/자격증/어학/금융/체력`, but the catalog also has
`교육` (e.g. `naeil`), which therefore only appears under "전체". `정신` is defined in
`cats` but unused.
`screens/RadarScreen.jsx:11`, `data/index.js:49-58, 280`.

### 🟡 I2 — D-day never advances
**Reality:** all `dday` values (and `soldier.dday=291`, `served=0.55`) are static
seed constants; no date math decrements them over real time. "마감 임박" is frozen.
`data/index.js:4-16`, opportunity `dday` fields.

### 🟠 I3 — D-90 / locked opportunities aren't gated
**Reality:** `started:false` / "D-90 해금" opps (cheongnyeon, naeil, defai) are shown
as normal cards and their subquests can be opened and toggled freely; the unlock
gating from the design docs is not enforced.
`data/index.js:259-320`, `screens/RadarScreen.jsx`, `screens/OppPlan.jsx`.

---

## J. Titles, recap, activity, sharing

### 🟠 J1 — Titles are never awarded by logic
**Reality:** ownership/equipped come from seed; no code grants a title on hitting a
threshold (e.g. "철벽 · 전투력 60 돌파" is pre-owned), and the equipped title can't be
changed in the UI.
`data/index.js:361-368`, `server/repositories/state.js:74`.

### 🟡 J2 — Monthly Wrapped is fully hardcoded
**Reality:** `wrapped` (42 quests, +3 전투력, savings, weekly bars, gains) is static;
not derived from activity/checkins.
`data/index.js:371-380`, `components/Overlays.jsx:133`, `components/ActivityLog.jsx:55`.

### 🟡 J3 — Activity rows have no real date
**Reality:** new rows are inserted with `day:'오늘'` and `ord:-1`; over multiple days
everything stays labeled "오늘". Offline, nothing logs.
`server/repositories/mutations.js:13-15, 47-49`.

### 🟠 J4 — Share / referral buttons are no-ops
**Reality:** "카톡에 공유" and "친구에게 같이 하자고 보내기" are `onClick={() => {}}`. The
two-tier referral from the design docs is absent.
`components/Overlays.jsx:189`, `screens/OppPlan.jsx:175`.

---

## K. Persistence & sync

### 🟡 K1 — Subquest toggles don't refresh derived data
**Reality:** `toggleSubquest` returns `{ catalog, opp }`; the store updates `catalog`
but not `vacation` or `activity`, so the vacation ladder and timeline can lag until a
full `getState`/`checkin`.
`server/repositories/mutations.js:36-37`, `store.js:46-60`.

### 🟡 K2 — Tonight toggle doesn't surface its own activity row
**Reality:** server logs an activity row on completion but returns only `{ tonight }`;
the client never refreshes `activity`, so a just-completed quest isn't in the log
until reload.
`server/repositories/mutations.js:7-17`, `store.js:40-44`.

### 🟡 K3 — Offline edits are memory-only and partial
**Reality:** mutations short-circuit (`if (!get().online) return`) after the
optimistic edit; tonight/subquest flips live only in memory, and **check-in does
nothing offline** (it returns before any local change).
`store.js:43, 59, 63-65`.

---

## L. Misc / stale data

### ⚪ L1 — Discharge-savings data is orphaned
**Reality:** `savingsNow/savingsProjected/deltaMonth` remain in the soldier seed and
schema, but the home savings card was removed (per design chat 5); no screen tracks
real savings.
`data/index.js:13-15`, `db/schema.sql:20-22`.

### ⚪ L2 — Dual data sources
**Reality:** `src/data/index.js` is both the DB seed source **and** the offline
fallback. Fine, but a divergence between seed-time data and a migrated DB would make
offline mode silently inconsistent with online.
`store.js:8-19`, `server/db/seed.js:5`.

### ⚪ L3 — `OppProgressBar` status math is client-local
**Reality:** "on/tight/risk" is recomputed in the client from `fill` vs static
`expectedPct` and can differ from the server's stored `status`.
`screens/OppPlan.jsx:9-22`.

---

## Suggested fix ordering

1. **Close the core loop (A1→A2→A3):** make quest/subquest completion write
   `stats.cur`, return refreshed stats, and let evolution + gilding move. This single
   change makes the creature, XP, profile radar, and celebrations *mean* something.
2. **Make the daily loop adaptive (B1, B3, D1, D2):** regenerate tonight from
   mood/energy and let users add quests from opps/benefits.
3. **Ship real settings + onboarding (F1, F2, F5, G1):** a Settings screen + first-run
   avatar/path/theme choice that persists, and account creation.
4. **Honor the promises or soften the copy (C1, C2, E1, B5, F6, J4):** either
   implement the "AI"/bonus/branch/share behaviors or change the labels.
5. **Tidy derived state & data (H, I, J2, K, L):** dedupe `MAXD`, gate D-90 opps,
   refresh vacation/activity after mutations, derive recap from real data, add real
   dates.
