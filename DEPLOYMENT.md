# Deploying PinnineCare to Vercel (Free Tier)

This project deploys as **three separate Vercel projects** (frontend, admin, backend),
plus **two external free-tier services** Vercel doesn't provide itself: a Postgres
database (Neon) and file storage (Vercel Blob, attached to the backend project).

```
pinninecare.vercel.app        → frontend/   (public website, static Angular)
pinninecare-admin.vercel.app  → admin/      (CMS, static Angular)
pinninecare-api.vercel.app    → backend/    (NestJS, serverless functions)
                                    ↓
                              Neon Postgres (external, free)
                              Vercel Blob    (media/CV storage, free tier)
```

Do the steps in this order — the backend needs to exist before the frontend/admin
builds can point at it.

**Scripted shortcut**: once you've created the Neon database (step 1) and have a
JWT secret + admin credentials picked, `scripts/vercel-setup.sh` does steps 2–4 for
you (links/creates all three Vercel projects, sets every env var, deploys). See
[Automating the one-time setup](#automating-the-one-time-setup) below. It still
can't create the Neon database or attach Blob storage — no stable CLI command for
either — so those two clicks stay manual either way.

---

## 1. Create the Postgres database

Two equivalent options — pick one:

**Option A — Vercel dashboard (fewer accounts to manage):** once the backend
project exists (step 2), go to it → **Storage** tab → **Create Database** →
**Postgres**. Vercel provisions a Neon-backed database and auto-injects the
connection string as an env var directly into the project — you never leave
vercel.com. Confirm the exact variable name it used in Project Settings →
Environment Variables afterward (it's been `DATABASE_URL`, `POSTGRES_URL`, or
`POSTGRES_PRISMA_URL` depending on when you connect it — `app.module.ts` checks
all three, so whichever one it picks works with no code changes).

**Option B — neon.tech directly:**
1. Go to [neon.tech](https://neon.tech) → sign up (free) → **New Project**.
2. Name it e.g. `pinninecare`, pick a region close to your users.
3. Copy the **connection string** it gives you — it looks like:
   ```
   postgres://user:password@ep-xxxx-pooler.region.aws.neon.tech/pinninecaredb?sslmode=require
   ```
   Set this as `DATABASE_URL` in the backend project (step 2).

Either way, this is the value the `db:sync` step and `scripts/vercel-setup.sh`
below need.

---

## 2. Create the backend Vercel project

1. In Vercel → **Add New Project** → import the `penninecarecentre` GitHub repo.
2. **Root Directory**: `backend`
3. **Framework Preset**: Other
4. Name the project **`pinninecare-api`** (the code already assumes this exact name —
   see "If you use different project names" below if you pick something else).
5. **Environment Variables** (Project Settings → Environment Variables):

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | the Neon connection string from step 1 |
   | `JWT_SECRET` | a long random string (not the dev default) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `ADMIN_EMAIL` | your real admin email |
   | `ADMIN_PASSWORD` | a strong password (change after first login regardless) |
   | `ALLOWED_ORIGINS` | `https://pinninecare.vercel.app,https://pinninecare-admin.vercel.app` |
   | `ENABLE_SWAGGER` | *(optional)* `true` to keep `/api/docs` live in production — off by default to save cold-start CPU, see [Resource-usage tuning](#resource-usage-tuning-staying-inside-free-tier-quotas) |

6. **Deploy.**
7. Attach media storage: Project → **Storage** tab → **Create Database** → **Blob** →
   connect it to this project. Vercel automatically injects `BLOB_READ_WRITE_TOKEN`
   into the project's environment — you don't set it by hand.
8. **Redeploy** once after attaching Blob so the function picks up the new env var.

### One-time: create the database tables

`synchronize` is intentionally disabled when `NODE_ENV=production` (safe default —
it can drop columns on schema changes, per `CLAUDE.md`). That means the Neon database
starts out completely empty: no tables, no seed data, no default admin user.

Run this **once, from your machine**, with `DATABASE_URL` set to the Neon connection
string. It boots just the Nest application context (no HTTP server), forces
`synchronize: true` for this one run via `DB_FORCE_SYNC`, and runs every module's
normal startup seeding (default admin, 8 CMS pages, team members, jobs, reviews)
against Neon:

```bash
cd backend
DATABASE_URL="postgres://user:pass@ep-xxxx.neon.tech/pinninecaredb?sslmode=require" npm run db:sync
```

It's idempotent — safe to re-run any time you add/change an entity in a way that
needs a schema change. There's no migrations system in this project, so schema
changes are applied by re-running this script, not automatically in production.

---

## 3. Create the frontend Vercel project

1. **Add New Project** → same repo → **Root Directory**: `frontend`
2. Name it **`pinninecare`**.
3. Framework preset: Angular (or Other — `frontend/vercel.json` already sets the
   build command and output directory).
4. Deploy.

## 4. Create the admin Vercel project

1. **Add New Project** → same repo → **Root Directory**: `admin`
2. Name it **`pinninecare-admin`**.
3. Deploy.

---

## If you use different project names

`frontend/src/environments/environment.ts` and `admin/src/environments/environment.ts`
hardcode `apiUrl: 'https://pinninecare-api.vercel.app/api'` (Angular bakes this into
the JS bundle at build time — there's no runtime env var for a static SPA). Likewise
`admin/src/environments/environment.ts` hardcodes `frontendUrl` for previewing legacy
`/assets/...` images in the CMS.

If your actual Vercel project domains differ from `pinninecare` / `pinninecare-api` /
`pinninecare-admin`, update those two files to the real domains, then also update
`ALLOWED_ORIGINS` on the backend project to match, commit, and redeploy all three
projects.

---

## Automating the one-time setup

`scripts/vercel-setup.sh` scripts steps 2–4 above via the Vercel CLI: links (or
creates) all three projects, sets every backend env var, and triggers the first
production deploy of each. It's idempotent — re-running it just re-sets the env
vars, so it also doubles as how you rotate a secret later.

```bash
npm i -g vercel && vercel login      # once, opens a browser to authenticate

export DATABASE_URL="postgres://user:pass@ep-xxxx.neon.tech/pinninecaredb?sslmode=require"
export JWT_SECRET="$(openssl rand -hex 32)"
export ADMIN_EMAIL="you@example.com"
export ADMIN_PASSWORD="a-strong-password"

./scripts/vercel-setup.sh
```

Then run the [database sync](#one-time-create-the-database-tables) and attach Blob
storage (backend project → Storage tab) — those two still need the dashboard.

The script assumes the exact project names `pinninecare-api` / `pinninecare` /
`pinninecare-admin`; edit the `*_PROJECT` variables near the top of the script if
you want different names, and update `environment.ts` in `frontend/`/`admin/` to
match (see [If you use different project names](#if-you-use-different-project-names)).

## Ongoing deploys are already automatic

Once each Vercel project is linked to the GitHub repo (whether via the dashboard
or the script above), **every `git push` to master rebuilds and redeploys all
three projects automatically** — that's Vercel's native Git integration, not
something this repo had to configure. Pull requests also get their own preview
deployment URLs for free. There's no additional CI/CD to set up for that part;
`scripts/vercel-setup.sh` is only for the first-time project/env-var setup.

---

## Resource-usage tuning (staying inside free-tier quotas)

A few deliberate choices keep this within Hobby/Neon-free limits rather than
just "whatever the defaults happen to be":

- **DB connection pool capped to 1** (`app.module.ts`, the `DATABASE_URL` branch)
  — every concurrent serverless instance opens its own pool; an uncapped pool
  (pg's default is a much higher max) across a burst of cold starts is the
  fastest way to exhaust Neon free tier's connection limit. Pair this with
  Neon's **pooled** (`-pooler` hostname) connection string, not the direct one,
  so pgbouncer absorbs the rest.
- **Swagger docs skipped in production** (`bootstrap.ts`) — building the OpenAPI
  document walks every controller/DTO via reflection on every cold start, for a
  UI that isn't part of the actual admin/frontend traffic. Set `ENABLE_SWAGGER=true`
  as an env var if you want `/api/docs` back in production without a code change.
- **Function memory/duration capped explicitly** (`backend/vercel.json` →
  `functions`) — 512MB / 10s, rather than relying on platform defaults, so a
  runaway request can't eat more of the monthly included quota than it needs to.
- **Multer `fileSize` limits on uploads** — bounds how much a single upload can
  buffer into function memory before rejection (see the note below about the
  media limit exceeding Vercel's own body-size cap).

## Known limitations on the free tier

- **Request body size cap (~4.5MB)** — Vercel Hobby serverless functions reject
  bodies larger than this, including file uploads (media images, the homepage hero
  video, CVs). This is a platform limit, not something configurable in code. Fine
  for typical photos; large videos or PDFs may need to stay under that size or be
  uploaded directly to Blob client-side (not implemented here). Note the media
  upload route's own limit is currently set to 50MB (`media.controller.ts`) —
  that's above Vercel's cap, so anything between ~4.5MB and 50MB will fail with a
  platform-level 413 in production even though it'd succeed locally; worth
  tightening that constant to match if you hit it.
- **Neon autosuspend** — the free Neon branch suspends after inactivity; the first
  request after idle time takes a few extra seconds to wake it.
- **Serverless cold starts** — the first request to the backend after a period of
  no traffic will be slower (Nest bootstraps fresh); subsequent requests reuse the
  warm instance.
- **No shared filesystem** — this is why media/CV storage moved to Vercel Blob;
  don't reintroduce `fs.writeFileSync` calls for anything that needs to persist,
  it won't survive between invocations.
