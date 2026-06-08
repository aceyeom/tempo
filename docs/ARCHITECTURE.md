# DOLBOMI — Architecture

This describes **how the implemented app is built and wired**. For *behavioral*
intent vs. reality see [WORKFLOW-LOGIC.md](./WORKFLOW-LOGIC.md); for the defect
inventory see [LOGIC-GAPS.md](./LOGIC-GAPS.md).

## 1. Repository layout

```
dolbomi.app/
├── README.md            # design-handoff bundle README (pre-implementation; see audit)
├── chats/               # 7 design-tool transcripts (design intent / aspirational)
├── project/             # original HTML/JSX prototypes + screenshots + PRODUCT_SPEC
├── docs/                # ← this folder (engineering docs)
└── dolbomi-app/         # the real implementation
    ├── src/             # Vite + React 19 frontend
    └── server/          # Express + better-sqlite3 backend
```

The `project/` folder is the **mockup origin** (HTML/JSX prototypes exported from a
design tool). `dolbomi-app/` is the production-intended rebuild. The two are not
linked at runtime — `project/` is reference only.

## 2. Tech stack

**Frontend** (`dolbomi-app/`)
- **Vite + React 19** SPA.
- **zustand** global store (`src/store.js`) holding the live, API-backed snapshot.
- **Three.js** 3D guardian creature with a per-vertex "gilding" shader (`src/3d/creature.js`).
- **CSS custom properties** for design tokens: 3 palettes (골드/택티컬/스틸) × light/dark (`src/styles/tokens.css`).

**Backend** (`dolbomi-app/server/`)
- **Express** REST API.
- **better-sqlite3** synchronous SQLite (auto-migrates + seeds on boot).
- **JWT auth** with scrypt password hashing (`server/auth.js`).
- Schema is plain SQL (`db/schema.sql`), with a Postgres variant (`db/schema.postgres.sql`).

## 3. Frontend module map

```
src/
├── main.jsx                     # React entry
├── App.jsx                      # shell: tab router, push-nav, overlays, Tweaks, bootstrap()
├── store.js                     # zustand store (live data + optimistic mutations)
├── api/client.js                # fetch client: JWT in localStorage, auto-login demo
├── data/index.js                # SEED data + static UI config + offline fallback
├── icons.jsx                    # Icon(key,opts) + STAT_C (per-stat colors) + STATUS map
├── styles/tokens.css            # palettes, themes, keyframes
├── 3d/creature.js               # Three.js engine: create()→{setStats,setMilestones,pulse,…}
├── components/
│   ├── ui.jsx                   # Card, Tag, Btn, ProgressBar, StatBar, ScreenHead…
│   ├── SkillDetail.jsx          # StatRow (accordion) + per-stat quest breakdown
│   ├── Badges.jsx               # title crests
│   ├── ActivityLog.jsx          # activity timeline + monthly-recap card
│   ├── Overlays.jsx             # CheckInSheet, QuestComplete, Wrapped
│   ├── TweaksPanel.jsx          # DEV design-tweak panel (palette/theme/path/…)
│   ├── IOSFrame.jsx             # iOS device chrome
│   └── creature/
│       ├── CreatureHero.jsx     # React↔Three.js bridge (mount + live prop updates)
│       ├── GuardianCard.jsx     # GuardianHero + evolutionOf(stats)  ← evolution math
│       └── AvatarViewer.jsx     # full-screen avatar inspector
└── screens/
    ├── HomeScreen.jsx           # guardian, check-in card, "오늘 밤의 3", stat bars, AI line
    ├── RadarScreen.jsx          # opportunity feed + category filter
    ├── OppDetail.jsx            # opportunity detail (header, 신청 정보, milestone preview)
    ├── OppPlan.jsx              # full plan + OppProgressBar + subquest toggles + "AI 재계획"
    ├── VacationScreen.jsx       # vacation ladder (추천 / 진행 중 / 그 외)
    ├── BenefitsScreen.jsx       # benefits hub (4 category groups + branch filter)
    └── ProfileScreen.jsx        # identity, stat radar, titles, activity/recap
```

### Navigation model (`App.jsx`)
- 5 bottom tabs: `home / radar / vacation / benefits / profile` (`NAV`, App.jsx:35).
- A single **push layer** (`pushed`) overlays the active tab for detail screens
  (`opp`, `oppPlan`, `wrapped`). Pushed opportunities are re-resolved from the live
  catalog by id so they reflect saved progress (App.jsx:70).
- Overlays (sheets/celebrations) are separate top-level state: `sheet` (check-in),
  `celebrate` (quest-complete), `showAvatar` (full-screen viewer).
- There is **no settings tab and no onboarding/login screen.**

## 4. The frontend↔backend seam

```
src/api/client.js   thin fetch client; stores JWT; auto-logs-in demo soldier
src/store.js        bootstrap() → ensureSession() → GET /api/state; screens read store
src/data/index.js   single source of truth for SEED + static config + offline fallback
```

On boot, `App.jsx` calls `store.bootstrap()`:
1. `ensureSession()` — if no token, `POST /auth/login` as `demo/dolbomi` (client.js:33).
2. `GET /api/state` — assembles the full snapshot (state.js `getSnapshot`).
3. On success: `set({ ...snapshot, loaded:true, online:true })`.
4. On any failure: fall back to `OFFLINE_SNAPSHOT` built from `src/data` (store.js:10, 32).

### API surface (`server/routes/api.js`)

| Method | Route | Handler | Returns |
| --- | --- | --- | --- |
| POST | `/auth/login` | verify password, sign JWT | `{ token, soldierId }` |
| GET | `/api/state` | `getSnapshot(soldierId)` | full snapshot |
| POST | `/api/tonight/:questId/toggle` | `toggleTonight` | `{ tonight }` |
| POST | `/api/opportunities/:oppId/subquests/:subquestId/toggle` | `toggleSubquest` | `{ catalog, opp }` |
| POST | `/api/checkin` | `addCheckin` | `{ snapshot }` |
| GET | `/api/health` | — | `{ ok:true }` |

Everything under `/api` requires a Bearer token (`requireAuth`, auth.js:27). There
is **no register/signup route** and no logout.

### Store mutation pattern (`store.js`)
- Mutations apply an **optimistic local edit first**, then call the API and
  reconcile with the response. If `online === false`, they short-circuit after the
  local edit (so offline edits live only in memory).
- `toggleTonight` → updates `tonight` only.
- `toggleSubquest` → flips the subquest in the local `catalog`, calls
  `recomputeFill()` (XP-weighted % per opportunity), then replaces `catalog` from
  the server. **Does not refresh `vacation`/`activity`** (see LOGIC-GAPS #G2, #I1).
- `checkin` → replaces the entire snapshot from the server response.

## 5. Database schema (`server/db/schema.sql`)

Two kinds of tables:

- **Reference data** (shared across soldiers): `opportunities`, `milestones`,
  `subquests`, `benefits`, `titles`.
- **Per-soldier mutable state**: `soldiers`, `stats`, `tonight_quests`,
  `soldier_subquests` (completion overrides), `soldier_titles`, `checkins`,
  `activity`.

`db/seed.js` imports `src/data/index.js` **directly** so the frontend prototype
data is the single seed source, and creates one demo soldier (`demo/dolbomi`).
Per-soldier subquest completion is seeded from each subquest's prototype
`done`/`verified` default.

> Note: `stats.cur` is stored per soldier but **no code path ever updates it after
> seeding** — this is the root cause of the broken progression loop (LOGIC-GAPS #A).

## 6. State assembly (`server/repositories/state.js`)

`getSnapshot` composes the exact shapes the frontend expects:
- `getCatalog` merges reference catalog with `soldier_subquests` completion and
  computes an XP-weighted `fill` % per opportunity (state.js:55).
- `getVacation` derives the ladder from `휴가`-reward opportunities and computes
  `secured` days from **fully-completed** vacation opps, falling back to a constant
  `4` otherwise (state.js:101). `MAXD` (max days per opp) is duplicated here and in
  `VacationScreen.jsx` (LOGIC-GAPS #H2).

## 7. The 3D guardian engine (`src/3d/creature.js`)

- `create({container, path, animal, stats, milestones, …})` builds a Three.js scene
  and returns an imperative API: `setStats`, `setMilestones`, `setPath`,
  `setAnimal`, `setCompanion`, `setTheme`, `pulse`, `resize`, `dispose` (creature.js:791).
- **Stats drive visuals**: `applyStats()` gilds the model (e.g. head gold ≈
  `0.5*mind + 0.5*money`, hooves/chest from money), scales bulk from body, etc.
  `setMilestones` rebuilds particle/orbit counts. `pulse()` runs the
  quest-complete camera push + ignite shader.
- **Bridge**: `CreatureHero.jsx` mounts the engine once and pushes prop changes via
  the imperative API in `useEffect`s.
- **Models**: GLB models (ram, fox) load from `static.poly.pizza`; if the CDN is
  unreachable a procedural marble creature is built (`buildFallback`). Only **two**
  models exist — `ANIMAL_FOR_PATH` maps 4 paths onto them (LOGIC-GAPS #F7).

Because `stats` never change at runtime (see §5), the gilding system is fully
implemented but **visually frozen** in normal use.

## 8. Build & run

```bash
# backend
cd dolbomi-app/server && npm install && npm start    # API :4000, auto-migrate+seed
# frontend (separate terminal)
cd dolbomi-app && npm install && npm run dev          # Vite :5173, proxies /api → :4000
# or both:
cd dolbomi-app && npm run dev:all
```

Tests: `npm run test:smoke` (SSR render of every screen/overlay),
`server/ && npm run test:api` (boots server, asserts shapes + persistence). See
`dolbomi-app/SUPABASE.md` for the Postgres/Supabase path.
