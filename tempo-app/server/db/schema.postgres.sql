-- TEMPO schema — Postgres / Supabase variant of db/schema.sql.
-- Same tables and shapes as the SQLite schema; types adapted for Postgres:
--   INTEGER PK AUTOINCREMENT → BIGINT GENERATED ALWAYS AS IDENTITY
--   INTEGER bool (0/1)       → BOOLEAN
--   REAL                     → DOUBLE PRECISION
--   TEXT timestamp           → TIMESTAMPTZ DEFAULT now()
--   datetime('now')          → now()
-- Run against a Supabase project:  supabase db push   (or paste into the SQL editor)
-- See SUPABASE.md for the full migration guide (RLS, Supabase Auth, seeding).

-- ── identity ──────────────────────────────────────────────────────
-- If you use Supabase Auth, you can instead key everything off auth.uid()
-- (uuid) and drop login/password_hash here. See SUPABASE.md.
CREATE TABLE IF NOT EXISTS soldiers (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  login              TEXT UNIQUE NOT NULL,
  password_hash      TEXT NOT NULL,
  name               TEXT NOT NULL,
  rank               TEXT NOT NULL,
  rank_en            TEXT NOT NULL,
  title              TEXT NOT NULL,
  unit               TEXT NOT NULL,
  dday               INTEGER NOT NULL,
  served             DOUBLE PRECISION NOT NULL,
  streak             INTEGER NOT NULL DEFAULT 0,
  savings_now        BIGINT NOT NULL DEFAULT 0,
  savings_projected  BIGINT NOT NULL DEFAULT 0,
  delta_month        BIGINT NOT NULL DEFAULT 0
);

-- ── six stats (per soldier) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS stats (
  soldier_id  BIGINT NOT NULL REFERENCES soldiers(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  mil         TEXT NOT NULL,
  en          TEXT NOT NULL,
  "real"      TEXT NOT NULL,
  cur         INTEGER NOT NULL,
  tgt         INTEGER NOT NULL,
  ord         INTEGER NOT NULL,
  PRIMARY KEY (soldier_id, key)
);

-- ── opportunity catalog (reference) ───────────────────────────────
CREATE TABLE IF NOT EXISTS opportunities (
  id           TEXT PRIMARY KEY,
  cat          TEXT NOT NULL,
  stat         TEXT NOT NULL,
  title        TEXT NOT NULL,
  hot          BOOLEAN NOT NULL DEFAULT false,
  sub          TEXT,
  what         TEXT,
  eligibility  TEXT,
  apply_where  TEXT,
  source       TEXT,
  verified     TEXT,
  cost         TEXT,
  dday         INTEGER NOT NULL,
  started      BOOLEAN NOT NULL DEFAULT false,
  reward_json  JSONB NOT NULL,
  why          TEXT,
  expected_pct INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'on',
  img          TEXT,
  ord          INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS milestones (
  id      TEXT NOT NULL,
  opp_id  TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  title   TEXT NOT NULL,
  date    TEXT,
  ord     INTEGER NOT NULL,
  PRIMARY KEY (opp_id, id)
);

CREATE TABLE IF NOT EXISTS subquests (
  id            TEXT NOT NULL,
  opp_id        TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  milestone_id  TEXT NOT NULL,
  text          TEXT NOT NULL,
  size          TEXT NOT NULL,
  xp            INTEGER NOT NULL,
  stat          TEXT NOT NULL,
  default_done  BOOLEAN NOT NULL DEFAULT false,
  service_json  JSONB,
  ord           INTEGER NOT NULL,
  PRIMARY KEY (opp_id, id)
);

-- per-soldier subquest completion (overrides default_done)
CREATE TABLE IF NOT EXISTS soldier_subquests (
  soldier_id   BIGINT NOT NULL REFERENCES soldiers(id) ON DELETE CASCADE,
  opp_id       TEXT NOT NULL,
  subquest_id  TEXT NOT NULL,
  done         BOOLEAN NOT NULL DEFAULT false,
  verified     BOOLEAN NOT NULL DEFAULT false,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (soldier_id, opp_id, subquest_id)
);

-- ── tonight's quests (per soldier) ────────────────────────────────
CREATE TABLE IF NOT EXISTS tonight_quests (
  id          TEXT NOT NULL,
  soldier_id  BIGINT NOT NULL REFERENCES soldiers(id) ON DELETE CASCADE,
  stat        TEXT NOT NULL,
  txt         TEXT NOT NULL,
  min         INTEGER NOT NULL,
  xp          INTEGER NOT NULL,
  hard        BOOLEAN NOT NULL DEFAULT false,
  done        BOOLEAN NOT NULL DEFAULT false,
  ord         INTEGER NOT NULL,
  PRIMARY KEY (soldier_id, id)
);

-- ── benefits (reference) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS benefits (
  id        TEXT PRIMARY KEY,
  title     TEXT NOT NULL,
  icon      TEXT NOT NULL,
  tone      TEXT,
  value     TEXT,
  where_    TEXT,
  tags_json JSONB,
  opp_id    TEXT,
  headline  BOOLEAN NOT NULL DEFAULT false,
  ord       INTEGER NOT NULL
);

-- ── titles (def + per-soldier ownership) ──────────────────────────
CREATE TABLE IF NOT EXISTS titles (
  name      TEXT PRIMARY KEY,
  descr     TEXT NOT NULL,
  rarity    TEXT NOT NULL,
  legendary BOOLEAN NOT NULL DEFAULT false,
  ord       INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS soldier_titles (
  soldier_id  BIGINT NOT NULL REFERENCES soldiers(id) ON DELETE CASCADE,
  title_name  TEXT NOT NULL REFERENCES titles(name) ON DELETE CASCADE,
  owned       BOOLEAN NOT NULL DEFAULT false,
  equipped    BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (soldier_id, title_name)
);

-- ── check-ins (mood) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkins (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  soldier_id  BIGINT NOT NULL REFERENCES soldiers(id) ON DELETE CASCADE,
  mood_key    TEXT NOT NULL,
  energy      INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── activity log ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  soldier_id  BIGINT NOT NULL REFERENCES soldiers(id) ON DELETE CASCADE,
  day         TEXT NOT NULL,
  time        TEXT NOT NULL,
  type        TEXT NOT NULL,
  stat        TEXT,
  text        TEXT NOT NULL,
  xp          INTEGER,
  amount      BIGINT,
  streak      INTEGER,
  opp         TEXT,
  legendary   BOOLEAN,
  ord         INTEGER NOT NULL DEFAULT 0
);
