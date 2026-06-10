# DOLBOMI — Supabase backend

The whole backend: Postgres schema, row-level security, and the game-logic RPCs.
Apply these to a Supabase project (Seoul region) per
[../DEPLOYMENT.md](../DEPLOYMENT.md).

## Files (run in this order)

| # | File | What it does |
| --- | --- | --- |
| 1 | `migrations/0001_init.sql` | reference + per-user tables, RLS policies |
| 2 | `migrations/0002_functions.sql` | `SECURITY DEFINER` RPCs (the game logic) |
| 3 | `migrations/0003_onboarding_user_opps.sql` | onboarding profile fields (병과·관심사·role), interest tags, user-created opportunities + admin review RPCs |
| 4 | `seed.sql` | reference content (catalog/benefits/titles/quest pool) — **generated** |

All are idempotent (`if not exists` / `create or replace` / `truncate`),
so re-running is safe. **Note:** `seed.sql` now writes the `tags` columns, so
run `0003` before re-seeding.

## Apply

**SQL Editor (simplest):** paste each file's contents and Run, in order.

**CLI:**
```bash
supabase link --project-ref <ref>
supabase db push                              # applies migrations/
psql "$SUPABASE_DB_URL" -f supabase/seed.sql  # loads the seed
```

## Regenerating the seed

`seed.sql` is generated from `dolbomi-app/src/data/index.js` (the single source of
truth for reference content) so the database and the SPA's offline fallback can't
diverge. After editing the catalog:

```bash
cd dolbomi-app && npm run gen:seed   # rewrites ../supabase/seed.sql
```

Then re-run `seed.sql` in Supabase.

## Model

- **Reference tables** (`stat_defs`, `opportunities`, `milestones`, `subquests`,
  `benefits`, `titles`, `quest_pool`) — readable by any authenticated user.
  Community entries published by an admin get a `c-` id prefix.
- **Per-user tables** (`profiles`, `stats`, `tonight_quests`, `user_subquests`,
  `user_titles`, `checkins`, `activity`, `user_opportunities`) — RLS
  `user_id = auth.uid()`; admins can additionally read `user_opportunities`.
- **RPCs** own all writes so XP can't be forged: `app_ensure_profile`,
  `app_complete_onboarding`, `app_toggle_tonight`, `app_toggle_subquest`,
  `app_add_tonight`, `app_checkin`, `app_equip_title`, `app_save_user_opp`,
  `app_delete_user_opp`, `app_submit_user_opp`, `app_review_user_opp`
  (+ helpers `app_award_titles`, `app_seoul_date`, `app_pick_pool`, `app_is_admin`).

## Making someone an admin

```sql
update profiles set role = 'admin' where id = '<auth user uuid>';
```

Admins see the 심사 대기열 (review queue) in the app's Settings screen and can
publish user-submitted opportunities to everyone's radar.
