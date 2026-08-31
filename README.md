# MAKFitness

A group accountability app for daily fitness check-ins. Small private groups, a daily check-in with photo and freely-configurable metrics, streaks, emoji reactions, and weekly challenges.

Next.js 15 (App Router) · TypeScript · Supabase (Postgres + Auth + Storage) · Tailwind · installable PWA

---

## The design problem

Every group tracks different things. One wants weight and protein; another wants steps, sleep and mood; a third just wants a photo and a yes/no. Modelling that with a column per metric means a migration every time somebody wants to track something new, and a table full of nulls for everyone who doesn't.

The schema treats **metrics as data rather than structure**:

```sql
CREATE TABLE public.metric_definitions (
  key          TEXT UNIQUE NOT NULL,
  category     TEXT NOT NULL,
  display_name TEXT NOT NULL,
  input_type   TEXT NOT NULL,      -- drives which UI control renders
  config       JSONB DEFAULT '{}', -- min/max, units, options
  ...
);
```

A metric definition declares its own `input_type` and a `config` blob, so the frontend renders the right control (slider, counter, toggle, select) from the definition rather than from hardcoded knowledge of each metric. `user_metric_preferences` then lets each user enable and order metrics per group.

Recorded values live in a single JSONB column on the check-in:

```sql
metrics JSONB DEFAULT '{}',
...
CREATE INDEX idx_checkins_metrics ON public.daily_checkins USING GIN (metrics);
```

The GIN index is the part that makes this viable rather than merely convenient — it keeps queries *into* the JSONB (find everyone who logged protein above X) from degrading into full scans as check-ins accumulate. Adding a new metric type is an insert, not a migration.

**The tradeoff**, stated honestly: values inside JSONB lose column-level type checking, so validation has to be enforced in the application against `input_type` and `config`. That is the price of the flexibility, and for a schema whose entire premise is user-defined metrics it is the right trade — but it is a real one.

## Access control

Row-level security is enabled on all 9 tables, with 22 policies across the migrations — plus a follow-up migration correcting the `user_streaks` policies once the group-scoped read paths were exercised properly.

Groups are the security boundary: you can read a check-in if you share a group with its author, and write only your own. This matters more than usual here, because the whole app is built around people seeing each other's daily photos — getting the policies wrong means leaking them.

Auth runs through Supabase SSR with `middleware.ts` refreshing the session on every request, and separate client/server Supabase factories (`src/lib/supabase/`) so tokens are never handled in the wrong context.

## Structure

```
src/app/(auth)/      sign-in
src/app/(app)/       authenticated surface — check-in, feed, progress, profile, onboarding
src/app/auth/        OAuth callback route handler
src/components/      check-in inputs, feed cards, reaction bar, UI primitives
src/lib/supabase/    client / server / middleware factories
src/lib/hooks/       use-metrics
supabase/migrations/ schema, metric updates, RLS corrections
```

Route groups separate the authenticated shell from the auth pages so each gets its own layout without affecting the URL.

## Data model

| table | purpose |
|---|---|
| `profiles` | user, keyed to `auth.users` |
| `groups` / `group_members` | private groups, invite codes, admin/member roles |
| `metric_definitions` | available metrics and their input config |
| `user_metric_preferences` | which metrics each user tracks, per group |
| `daily_checkins` | one per user per group per day, with JSONB metrics |
| `user_streaks` | current/longest streak, denormalized for cheap reads |
| `checkin_reactions` | emoji reactions, unique per user per emoji |
| `weekly_challenges` | per-group weekly challenge windows |

`UNIQUE(user_id, group_id, checkin_date)` enforces one check-in per day at the database level rather than trusting the client. Streaks are stored rather than computed on read — a deliberate denormalization, since they are read constantly (every feed card) and written once a day.

## Setup

See [SETUP.md](SETUP.md) for the full walkthrough — create a Supabase project, run the migrations, configure storage for check-in photos, set environment variables. [DEPLOYMENT.md](DEPLOYMENT.md) covers going live and [ICONS.md](ICONS.md) covers PWA icon generation.

```bash
npm install
cp .env.example .env.local   # add your Supabase URL and anon key
npm run dev
```

## Limitations

- **Metric validation is application-side only**, per the JSONB tradeoff above. A malformed write that bypasses the UI would not be caught by the database.
- **Streak updates are not transactional** with the check-in insert, so a failure between the two can leave a streak stale until the next check-in.
- **No tests.**
- **Weekly challenges are schema-complete but thin in the UI** — the tables and windows exist, the surfacing does not.

## What I would do differently

- **Move streak updates into a database trigger or an RPC** so the check-in and the streak update succeed or fail together.
- **Generate TypeScript types from the schema** (`supabase gen types`) instead of maintaining `src/types/` by hand — they can drift silently today.
- **Add a check constraint or trigger validating `metrics` against `metric_definitions`**, recovering some of what JSONB gives up.
- **Test the RLS policies.** They are the security boundary of the entire app and the one migration correcting them proves they are easy to get subtly wrong.
