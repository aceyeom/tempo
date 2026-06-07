# Deploying TEMPO on Supabase

You picked **Supabase + email/password**. The backend in `server/` is written
in standard SQL and layered repositories, so moving to Supabase is a config
change, not a rewrite. There are two paths — pick by how much you want to own.

The local dev backend (Express + SQLite) stays useful either way: it needs no
cloud, boots in one command, and is what `npm run dev:all` / the tests use.

---

## Path A — keep the Express API, point it at Supabase Postgres (recommended)

You keep the verified API (`server/`) and its 17 passing tests; only the
database driver and DDL change. Email/password auth (scrypt + JWT, already
built in `server/auth.js`) is unchanged.

1. **Create the project** at supabase.com → copy the connection string from
   *Project Settings → Database* (use the **session pooler** URI for a
   long-lived server).

2. **Apply the schema** (Postgres variant already written for you):
   ```bash
   psql "$SUPABASE_DB_URL" -f server/db/schema.postgres.sql
   # or: supabase db push, or paste it into the SQL editor
   ```

3. **Swap the driver.** Replace `better-sqlite3` with `pg` in `server/db/index.js`.
   The repositories use plain SQL; the only query edits are:
   - parameter placeholders `?` → `$1, $2, …`
   - `datetime('now')` → `now()` (already done in the Postgres schema)
   - booleans read back as real `true/false` instead of `0/1` — drop the
     `!!`/`? 1 : 0` coercions in `repositories/state.js` and `mutations.js`
   - quote the `stats."real"` column (reserved-ish word in Postgres)

4. **Seed.** `server/db/seed.js` already imports `src/data/index.js` as the
   source of truth — run it once against the new DB to load the catalog,
   benefits, titles, and the demo soldier.

5. **Point the frontend at it.** No frontend change needed: the Vite proxy
   (`/api`, `/auth`) targets your Express host; in prod your reverse proxy does
   the same. `src/api/client.js` already stores the JWT and auto-logs-in.

---

## Path B — Supabase-native (Supabase Auth + RLS, no Express)

Drop the custom server and let Supabase be the backend. More moving parts up
front, but you get managed auth, row-level security, and realtime for free.

1. **Auth.** Use Supabase Auth email/password (`supabase.auth.signUp` /
   `signInWithPassword`). Drop `soldiers.login` / `password_hash`; key the
   per-soldier tables off `auth.uid()` (uuid) instead of `soldier_id bigint`.

2. **Schema.** Use `server/db/schema.postgres.sql` as the base; change
   `soldier_id BIGINT` → `soldier_id UUID REFERENCES auth.users(id)`, and add a
   `profiles` table mirroring `soldiers` keyed by `auth.uid()`.

3. **RLS** — every per-soldier table gets owner-only access:
   ```sql
   ALTER TABLE soldier_subquests ENABLE ROW LEVEL SECURITY;
   CREATE POLICY own_rows ON soldier_subquests
     USING (soldier_id = auth.uid()) WITH CHECK (soldier_id = auth.uid());
   -- repeat for stats, tonight_quests, soldier_titles, checkins, activity, profiles
   ```
   Reference tables (`opportunities`, `milestones`, `subquests`, `benefits`,
   `titles`) are read-only to all authenticated users:
   ```sql
   ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
   CREATE POLICY read_all ON opportunities FOR SELECT TO authenticated USING (true);
   ```

4. **Frontend.** Replace `src/api/client.js` with `@supabase/supabase-js`
   calls. Keep the **shapes** identical so `src/store.js` and every screen stay
   unchanged — `getState()` becomes a set of `supabase.from(...).select(...)`
   that assembles the same snapshot the Express `repositories/state.js` returns
   today (it computes each opportunity's `fill%` from completed-subquest XP).

---

## Which to choose

- **Path A** ships fastest and reuses everything that's already tested. Best if
  you want a working hosted app this week.
- **Path B** is the cleaner long-term home (managed auth, RLS, realtime) but
  moves the read-assembly logic into the client or a Postgres view/RPC.

Either way the contract the frontend depends on is the `GET /api/state`
snapshot shape — keep that stable and no screen code changes.
