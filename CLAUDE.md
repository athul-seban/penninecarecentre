# PinnineCare — Project Overview for Claude

## What This Project Is
A full-stack web platform for **Pennine Care Centre**, a premium residential care home in Glossop, Derbyshire, UK. It has three parts:

1. **Public website** (`frontend/`) — Angular 21, 9 pages
2. **Admin CMS** (`admin/`) — Angular 21, edits all content
3. **REST API** (`backend/`) — NestJS + PostgreSQL + Cloudinary

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Angular 21 (standalone components) |
| Admin framework | Angular 21 (standalone components) |
| Backend | NestJS 11, TypeORM |
| Database | PostgreSQL 17 |
| Media storage | Cloudinary |
| Authentication | JWT (bcryptjs + passport-jwt) |
| API docs | Swagger at `/api/docs` |

---

## Key Files & Folders

### Backend (`backend/src/`)
- `main.ts` — App bootstrap, CORS, global prefix `/api`, Swagger setup
- `app.module.ts` — Root module, TypeORM connection
- `auth/` — JWT login, strategy, guard
- `users/` — Admin user entity + service (auto-creates default admin)
- `pages/` — Page content CMS (8 pages auto-seeded)
- `settings/` — Key-value site settings (includes `site.theme`)
- `media/` — Cloudinary upload/delete/list
- `team/` — Team member CRUD
- `careers/` — Job listing CRUD
- `reviews/` — Google reviews CRUD
- `.env` — Environment config (DB, JWT, Cloudinary)

### Frontend (`frontend/src/app/`)
- `app.ts` — Root component, calls `ThemeService.applyActiveTheme()` on init
- `app.routes.ts` — 9 page routes
- `core/theme.service.ts` — Fetches `site.theme` from API, applies `data-theme` to body
- `shared/navbar/` — Sticky nav with mobile overlay, announcement banner
- `shared/footer/` — 4-column footer
- `pages/home/` — Full homepage (video hero, carousels, testimonials, etc.)
- `pages/pennine-suite/` — Suite detail with sliders
- `pages/moorland-suite/` — Male-only unit detail with sliders
- `pages/services/` — 5 care services, alternating rows
- `pages/life-at-pennine/` — 6 activity rows
- `pages/team/` — Values + team grid
- `pages/contact/` — Form + map
- `pages/careers/` — Jobs + application form
- `pages/privacy-policy/` — GDPR policy

### Admin (`admin/src/app/`)
- `core/auth.ts` — Token storage + Bearer header helper
- `core/api.ts` — All API calls (pages, team, careers, reviews, settings, media)
- `core/auth-guard.ts` — Functional guard, redirects to /login if no token
- `pages/login/` — Email/password login
- `pages/dashboard/` — Stats overview
- `pages/settings-editor/` — **Theme switcher** (5 themes) + all site settings
- `pages/pages-editor/` — Edit page meta/content
- `pages/team-manager/` — Add/edit/delete team members
- `pages/careers-manager/` — Post/edit/close job listings
- `pages/reviews-manager/` — Manage testimonials
- `pages/media-library/` — Upload to Cloudinary, delete files

---

## 5 Website Themes

Themes are applied by setting `body[data-theme="<id>"]` via CSS custom property overrides in `frontend/src/styles.css`.

| ID | Name | Colors |
|---|---|---|
| `classic` | Classic | Navy `#002b5b`, Gold `#c5a059` |
| `modern` | Modern Dark | Near-black `#0d0d1a`, Cyan `#00d4ff` |
| `sage` | Warm Sage | Forest green `#2a4523`, Copper `#b8925a` |
| `rose` | Rose & Slate | Slate `#2c3e50`, Rose `#c27b6e` |
| `royal` | Royal Purple | Violet `#2d1b69`, Lavender `#9b7ed4` |

**To switch theme:** Admin → Settings → click a theme card → Save All Settings.
The frontend fetches `site.theme` from `GET /api/settings` on startup and applies it.

---

## Database

All tables are auto-created by TypeORM `synchronize: true` (dev mode only).

| Table | Content |
|---|---|
| `users` | Admin accounts |
| `page_content` | Per-page CMS content (JSON sections) |
| `settings` | Key-value site config including `site.theme` |
| `team_members` | Staff profiles |
| `jobs` | Career listings |
| `reviews` | Testimonials |
| `media` | Cloudinary file records |

---

## Admin Access

- URL: `http://localhost:4300/login`
- **Not linked anywhere on the public website** — access by direct URL only
- Default: `admin@pinnineCare.com` / `Admin@123`

---

## API Endpoints

Full interactive docs at: **http://localhost:3000/api/docs** (Swagger UI)

Key endpoints:
```
POST   /api/auth/login
GET    /api/settings
PUT    /api/settings          (auth)
GET    /api/pages
PUT    /api/pages/:key        (auth)
GET/POST/PUT/DELETE /api/team
GET/POST/PUT/DELETE /api/careers
GET/POST/PUT/DELETE /api/reviews
POST   /api/media/upload      (auth)
DELETE /api/media/:id         (auth)
```

---

## Running Locally

See [RUNNING.md](./RUNNING.md) for full instructions.

Quick start:
```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && ng serve

# Terminal 3
cd admin && ng serve --port 4300
```
