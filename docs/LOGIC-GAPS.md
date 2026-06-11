# DOLBOMI — Design Review & Decision Record

This document has two layers, matching the project's two passes:

1. **Part I — Design review (current):** the product-design audit done after the
   technical logic gaps were closed. Each issue: **Problem → Decision → Status**.
   Decisions were made interactively with the product owner (2026-06-11).
2. **Part II — Logic-gap history (archive):** the original catalogue of broken
   logic from the first pass, kept as the record of *why* the Supabase
   migration changed what it changed.

**Status legend:** ✅ shipped (this pass) · ◐ partial · 📋 specified, not built ·
⏸ deliberately deferred.

---

## Part I — Design review

The technical loop works (quests grant XP, the creature evolves, streaks guard
by day). This pass asked the next question: **is the product clear, honest, and
worth opening at 21:00 on an exhausted day?** Issues are grouped by theme.

### D1. Progression & XP

**D1.1 — Stats didn't start at zero. ✅**
*Problem:* `stat_defs.base` gave every new account 94 unexplained XP (body 20,
craft 22…). Bars looked pre-filled, the first evolution was already 60% done,
and the core promise — "every pixel is something you did" — was false from
minute one.
*Decision:* true-zero start. All six stats begin at 0; the radar starts empty.
*Shipped:* `base = 0` (`data/index.js`, migration `0004`, regenerated
`seed.sql`). Existing accounts keep earned XP.

**D1.2 — Evolution bands assumed seeded stats. ✅**
*Problem:* with a zero start, the old bands (150/270/390/500) put the first
evolution weeks away — dead early game.
*Decision:* rebalance so the first evolution lands in week 1 (~10 XP/day from
오늘 밤의 3 alone), with later bands leaning on opportunity subquests (15–90 XP
each).
*Shipped:* bands now **각성기 0 → 성장기 40 → 성체 140 → 정예 300 → 수호신 480**
(`GuardianCard.jsx BANDS`).

**D1.3 — Targets (`tgt`) were fixed seed constants the user never chose. ✅**
*Problem:* the Gap ("now me" vs "discharge me") is the spec's single most
important answer to falling-behind anxiety, but the dashed target line was the
same arbitrary numbers for everyone.
*Decision:* **goal templates at onboarding** — 취업 준비형 / 체력 단련형 /
자산 형성형 / 창업 도전형 set the six discharge-day targets; individually
adjustable later.
*Shipped:* onboarding step 5 (`OnboardingScreen`), `GOAL_TEMPLATES`
(`data/index.js`), `app_set_targets` RPC (clamped server-side), profile
**목표 조정** slider sheet (`ProfileScreen TargetEditor`), `profiles.goal`.

**D1.4 — Progression had no roadmap pull. ✅**
*Problem:* stages only changed a label; nothing to look forward to.
*Decision:* **cosmetic/prestige unlocks only** — features are never gated.
성장기 → 팔레트 「택티컬」 · 성체 → 동료 수호신 + 「스틸」 · 정예 → 칭호 「정예」 ·
수호신 → 칭호 「수호신의 주인」 + 황금화 완성.
*Shipped:* roadmap card on 프로필 (every stage + its rewards + current marker),
"next unlock" card on 홈, palette locks in 설정, total-XP title requirements
(`req: {kind:'total'}`, `app_award_titles` v2), starter title 「첫 걸음」 (10 XP)
so the first session already awards something.

### D2. Avatar / guardian

**D2.1 — Four path names, two models, free swapping. ✅**
*Problem:* 봉황/백호 were visually identical to 해치/청룡; swapping was free and
instant, all driven by one shared XP pool — the "choice" carried no identity,
no investment, no honesty.
*Decision:* **one guardian, evolution roadmap.** Onboarding offers the two
*real* guardians (해치/청룡) as a meaningful choice; 봉황/백호 are cut. The
unchosen guardian unlocks as a switchable **companion at 성체 (140 XP)** —
shown locked with its condition until then. Per-stat visual change stays via
the existing gilding shader (mind+money → golden head, body → bulk…).
*Shipped:* path switching gated everywhere (GuardianCard picker, 설정,
AvatarViewer companion tap → toast with unlock condition), companion model
hidden until unlocked, onboarding copy states the permanence
("신중하게 골라 — 전역까지 함께한다").

**D2.2 — One creature per stat / collection model — rejected.** Splits
emotional attachment six ways and multiplies 3D asset cost; the Receipt wants
*one* identity that carries the 18 months.

### D3. Quests

**D3.1 — Generic, repetitive pool. ✅ (foundation) / 📋 (LLM)**
*Problem:* ~45 generic micro-quests, repeats within a week, tap-to-complete
with no connection to the user's actual goals. The spec's own kill criterion:
"if quests feel templated by day 5, the emotional frame can't save it."
*Decision:* **curated tracks + LLM personalization, built in that order.**
Curation now (the opportunity catalog's step-by-step milestone plans *are* the
authored tracks); a bounded LLM layer later that only *selects and rephrases*
from the curated pool — never invents content. No "AI" claims in copy until
it's real.
*Shipped now:*
- **7-day no-repeat rotation:** `quest_history` table records every served
  quest; `app_pick_pool` v2 orders fresh-first → interest-match → random
  (migration `0004`). Pool widened to ~60 with breadth in money/people/edge.
- **The LLM seam:** `app_pick_pool` is the single selection point, documented
  in-place — a model-backed Edge Function replaces only that function.
- **Tracks surfaced where the action is:** the 퀘스트 tab lists 진행 중인 도전
  with the next step completable inline (D3.3).
*Deferred:* the actual Claude-API Edge Function (needs key + cost/fallback
handling); journal→quest pipeline.

**D3.2 — Check-in and quests lived on an overloaded Home. ✅**
*Problem:* guardian hero + check-in + quests + six stat accordions + AI line
on one scroll; meanwhile 휴가/혜택 (low-frequency browse) each owned a nav slot.
*Decision:* **4 tabs, one job each** — 홈 (emotional dashboard) · 퀘스트 (daily
action) · 기회 (browse: 탐색/휴가/혜택 segments) · 프로필 (Receipt + hub).
Check-in **gates** the quest list (it literally generates it): quests render
blurred with a "체크인하고 받기" pill until today's check-in.
*Shipped:* `QuestScreen` (check-in gate → 오늘 밤의 퀘스트 → 진행 중인 도전 →
오늘의 기록), Home slimmed to identity/guardian/status-chip/next-unlock/
one-liner, `RadarScreen` segments, nav rewired (`App.jsx`).

**D3.3 — Opportunity progress was buried two taps deep. ✅**
*Shipped:* active tracks (started, unlocked, unfinished, by D-day) on the
퀘스트 tab with the next subquest completable inline; row opens the full plan.

**D3.4 — Un-completing a quest silently reclaimed XP. ✅**
*Shipped:* arm-then-confirm — first tap on a done quest arms a 3s
"한 번 더 누르면 완료 취소 · +N XP 회수" state.

**D3.5 — "오늘 밤의 3에 추가" gave no feedback. ✅** Toast on add; navigation
now lands on the 퀘스트 tab (where the quest actually appeared).

### D4. Onboarding & teaching

**D4.1 — Zero explanation of anything. ✅**
*Problem:* the wizard collected data but never taught the loop. Verified
+50%, evolution, the Gap, even where quests live — all undiscoverable.
*Decision:* **guided first-quest walkthrough** + first-visit tips.
*Shipped:*
- `FirstRunGuide` — one-time 4-card walkthrough right after onboarding
  (zero start → nightly rhythm → opportunity radar → evolution), ends by
  routing into the 퀘스트 tab to do the first quest for real.
- `TipBanner` — dismissible one-time explainers on 퀘스트/기회/프로필.
- Verified bonus surfaced in the plan header ("완료하면 능력치 XP, 인증하면
  +50% 보너스") instead of the old "AI가 짠 경로" claim.

**D4.2 — Streaks broke silently. ✅** `app_checkin` returns `streak_before`;
the client toasts "연속 기록이 끊겼어 · N일 → 1일부터 다시" (or the new streak).

### D5. Theme & visual

**D5.1 — Default was dark. ✅** Default is now **light + gold** everywhere:
`DEFAULT_PREFS` (store), `profiles.theme` column default (migration `0004`),
설정 lists 라이트 first. Light-theme text alphas raised for contrast on the
pale gold background (`tokens.css`).

**D5.2 — Status bar ate taps. ✅** The decorative iOS status bar intercepted
all pointer events in the top ~62px (the settings gear was untappable).
`pointerEvents:'none'` on the overlay (`IOSFrame.jsx`). Found by driving the
built app in a browser.

### D6. Profile

**D6.1 — Profile duplicated Home and buried the useful parts. ✅**
*Decision:* **the living Receipt + functional hub.**
*Shipped order:* identity card (rank/unit/MOS, equipped title, D-day, served %,
service dates) → **전역 리시트** (Gap radar vs goal targets, total XP, 목표 조정)
→ **진화 로드맵** (all stages + rewards) → 칭호 → 기록 (recap + activity) →
**바로가기** (avatar viewer, my submitted opportunities, share recap, settings,
logout). The guardian hero lives on 홈 only.

### D7. Copy honesty

- "퀘스트" button on benefits (which only opened the opp detail) → **경로 보기**. ✅
- "AI가 짠 마감까지의 경로" → honest step-path copy + bonus explanation. ✅
- Auth hero replaced with the product's emotional center: **"우리 억울하지
  말자."** ✅

### Open items (specified, not in this pass)

| Item | Why deferred | Where it slots in |
| --- | --- | --- |
| LLM quest selection + 오늘의 한 줄 generation | needs API key, per-checkin cost, fallback design | replace `app_pick_pool` via Edge Function (seam documented in `0004`) |
| Journal → quest pipeline, Sunday Letter, AI companion | premium-tier moat; depends on the LLM layer | new surfaces |
| New 3D models / per-stage model variants | asset cost; gilding + aura carry stages for now | `creature.js` |
| Lockscreen HUD widget | platform work (PWA/native) | spec Part V F1 |
| Squad / Anonymous Wall / Rival social layer | post-PMF per spec | spec Part V E |
| Real leave-day accounting (vacation secured → soldier record) | needs a trustworthy verification story | `H3` below |
| Quest-tab inline step completion can't mark "verified" | kept simple; full plan view handles verification | `QuestScreen TrackRow` |

---

## Part II — Logic-gap history (archive, first pass)

The original catalogue of **broken, non-functional, dead, or misleading
logic** found in the prototype, and how the Vercel + Supabase migration
resolved it. File references predate the migration (the Express `server/` was
removed; write logic now lives in `supabase/migrations/0002+`, read assembly
in `src/api/client.js`).

### Resolution status

✅ fixed · ◐ partial · ⏸ deferred

| Group | Outcome |
| --- | --- |
| **A. XP/Evolution** — stats never increased, creature never evolved, "+XP" was cosmetic | ✅ `app_toggle_tonight` / `app_toggle_subquest` write `stats.cur` (capped 100) from reference XP; evolution, gilding, radar and celebrations all move. A5 partial (cur grows live; no full history recompute) |
| **B. Check-in/AI** — check-in changed nothing, energy unused, streak unguarded | ✅ `app_checkin`: one bump per Seoul day, regenerates 오늘 밤의 3 sized to energy. B5 (real LLM) still deferred — see Part I D3.1 |
| **C. Fake AI surfaces** — hardcoded "오늘의 한 줄", no-op 재계획, fake personalization | ✅ home line derived from data; 재계획 relabelled to an honest view; radar counts real matches |
| **D. Quest creation** — "추가" buttons were navigation no-ops; no CRUD | ✅ `app_add_tonight` + full user-opportunity CRUD (private → submitted → published with admin review). Edit/reorder UI still minimal |
| **E. Verified bonus** — verification changed only a checkmark color | ✅ verified completion pays +50% XP server-side |
| **F. Settings/Theme/Path** — no settings screen, dev-panel-only theming, nothing persisted | ✅ real `SettingsScreen` + `AuthScreen` + onboarding; theme/palette/path persist to profile + localStorage. F7 (4 paths→2 models) resolved by design in Part I D2.1 |
| **G. Accounts** — single hardcoded demo login | ✅ Supabase Auth + per-user RLS + `app_ensure_profile` provisioning |
| **H. Vacation** — "확보" was a constant 4; days informational | ✅ secured derives from completed vacation opps; H3 (days → real leave record) still deferred |
| **I. Catalog** — filter omitted categories, D-day frozen, D-90 not gated | ✅ filters derived from data, deadlines absolute (D-day advances), unlock gating enforced server-side |
| **J. Titles/Recap/Share** — titles pre-owned, Wrapped hardcoded, share no-ops | ✅ titles auto-award from requirements, recap numbers derive from activity, share uses the Web Share API. Some recap copy still static |
| **K. Persistence** — mutations didn't refresh derived state; offline memory-only | ✅ mutations refetch the snapshot. K3 (offline edits don't sync back) accepted for the prototype |
| **L. Misc** — orphaned savings data, dual data sources, client-only status | ✅ `src/data` is the single source (seed.sql is generated from it). L3 (client-derived pace status) accepted |

The full pre-migration item-by-item catalogue (A1–L3 with `file:line`
references) lives in this file's git history
(`git log --follow docs/LOGIC-GAPS.md`) and in
[WORKFLOW-LOGIC.md](./WORKFLOW-LOGIC.md), which walks each loop
as-designed vs as-implemented.
