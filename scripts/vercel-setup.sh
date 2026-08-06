#!/usr/bin/env bash
# One-time production setup for the 3 Vercel projects (backend/frontend/admin).
# Scripts what the Vercel CLI can reliably automate: project linking, env vars,
# and triggering the first production deploy. Run from the repo root.
#
# What this does NOT do (Vercel CLI has no stable command for these — do them
# once in the dashboard, see DEPLOYMENT.md):
#   - Provision the Postgres database (Vercel Storage tab or neon.tech) and
#     get its connection string
#   - Attach a Vercel Blob store to the backend project
#
# Usage:
#   1. npm i -g vercel && vercel login
#   2. export the secrets below (never hardcode them in this file)
#   3. ./scripts/vercel-setup.sh
#
# Re-running is safe — env vars are removed before being re-added.

set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL to your Neon connection string first}"
: "${JWT_SECRET:?Set JWT_SECRET to a long random string first}"
: "${ADMIN_EMAIL:?Set ADMIN_EMAIL first}"
: "${ADMIN_PASSWORD:?Set ADMIN_PASSWORD first}"
JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-7d}"

API_PROJECT="pinninecare-api"
FRONTEND_PROJECT="pinninecare"
ADMIN_PROJECT="pinninecare-admin"
ALLOWED_ORIGINS="https://${FRONTEND_PROJECT}.vercel.app,https://${ADMIN_PROJECT}.vercel.app"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

set_env() {
  local key="$1" value="$2"
  vercel env rm "$key" production --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | vercel env add "$key" production >/dev/null
  echo "  set $key"
}

echo "== Backend: $API_PROJECT =="
cd "$REPO_ROOT/backend"
vercel link --yes --project "$API_PROJECT"
set_env NODE_ENV production
set_env DATABASE_URL "$DATABASE_URL"
set_env JWT_SECRET "$JWT_SECRET"
set_env JWT_EXPIRES_IN "$JWT_EXPIRES_IN"
set_env ADMIN_EMAIL "$ADMIN_EMAIL"
set_env ADMIN_PASSWORD "$ADMIN_PASSWORD"
set_env ALLOWED_ORIGINS "$ALLOWED_ORIGINS"
vercel --prod

echo "== Frontend: $FRONTEND_PROJECT =="
cd "$REPO_ROOT/frontend"
vercel link --yes --project "$FRONTEND_PROJECT"
vercel --prod

echo "== Admin: $ADMIN_PROJECT =="
cd "$REPO_ROOT/admin"
vercel link --yes --project "$ADMIN_PROJECT"
vercel --prod

cat <<EOF

Done. Still manual (one-time, dashboard):
  1. Backend project -> Storage tab -> Create Database -> Blob -> connect it,
     then redeploy the backend once so it picks up BLOB_READ_WRITE_TOKEN.
  2. Run 'npm run db:sync' from backend/ with DATABASE_URL pointed at Neon to
     create the schema and seed default content (safe to re-run).
  3. Going forward, every 'git push' to master auto-deploys all three projects
     via Vercel's GitHub integration — this script is only for the first setup
     or if you need to rotate an env var.
EOF
