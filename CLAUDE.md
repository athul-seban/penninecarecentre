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
- `pages/` — Page content CMS (8 pages auto-seeded with real content in `sections` JSONB)
- `settings/` — Key-value site settings (includes `site.theme`, SMTP email config)
- `media/` — Cloudinary upload/delete/list
- `team/` — Team member CRUD (auto-seeded with 6 placeholder members)
- `careers/` — Job listing CRUD (auto-seeded with 3 open + 1 closed job)
- `reviews/` — Google reviews CRUD (auto-seeded with 5 real testimonials)
- `contact/` — Contact form submissions (save to DB + optional email via SMTP)
- `common/logging.interceptor.ts` — Global HTTP request logger (coloured terminal output)
- `common/http-exception.filter.ts` — Global exception filter, structured JSON errors
- `.env` — Environment config (DB, JWT, Cloudinary)

### Frontend (`frontend/src/app/`)
- `app.ts` — Root component, calls `ThemeService.applyActiveTheme()` on init, back-to-top button
- `app.routes.ts` — 9 page routes
- `core/theme.service.ts` — Fetches `site.theme` from API, applies `data-theme` to body
- `core/content.service.ts` — Fetches page `sections` JSONB from API with caching
- `shared/navbar/` — Sticky nav with mobile overlay, announcement banner
- `shared/footer/` — 4-column footer
- `pages/home/` — Full homepage (video hero, carousels, testimonials fetched from API)
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
- `core/api.ts` — All API calls (pages, team, careers, reviews, settings, media, contact)
- `core/auth-guard.ts` — Functional guard, redirects to /login if no token
- `pages/login/` — Email/password login
- `pages/dashboard/` — Stats overview
- `pages/settings-editor/` — Theme switcher (5 themes) + all site settings + SMTP email config
- `pages/pages-editor/` — Edit ALL page text sections and meta per page (8 pages with labelled fields)
- `pages/team-manager/` — Add/edit/delete team members
- `pages/careers-manager/` — Post/edit/close job listings
- `pages/reviews-manager/` — Manage testimonials
- `pages/media-library/` — Upload to Cloudinary, delete files
- `pages/contact-manager/` — View/manage contact form submissions, update status, add notes
- `shared/sidebar/` — Responsive sidebar with hamburger toggle on mobile (≤768px)

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

---

## Database

All tables are auto-created by TypeORM `synchronize: true` (dev mode only).

| Table | Content | Seeded? |
|---|---|---|
| `users` | Admin accounts | Yes (1 default admin) |
| `page_content` | Per-page CMS content (JSON sections) | Yes (8 pages with real content) |
| `settings` | Key-value site config including `site.theme` and SMTP | Yes (17 defaults) |
| `team_members` | Staff profiles | Yes (6 placeholder members) |
| `jobs` | Career listings | Yes (3 open + 1 closed) |
| `reviews` | Testimonials | Yes (5 real Google reviews) |
| `media` | Cloudinary file records | No |
| `contact_submissions` | Website contact form submissions | No |

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
PUT    /api/settings                  (auth)
GET    /api/pages
GET    /api/pages/:key
PUT    /api/pages/:key                (auth)
GET/POST/PUT/DELETE /api/team
GET/POST/PUT/DELETE /api/careers
GET/POST/PUT/DELETE /api/reviews      ?visible=true for public
POST   /api/contact                   (public, saves + optional email)
GET/PATCH/DELETE /api/contact         (auth)
POST   /api/media/upload              (auth)
DELETE /api/media/:id                 (auth)
```

---

## CMS Content Editing (Admin)

### Page Text Content
Admin → **Pages** → select a page → edit any section field → Save

The `sections` JSONB field stores all editable text per page. Fields are labelled in the editor. The frontend fetches sections via `ContentService.getPage(key)`.

### Team Members
Admin → **Team** — add/edit (name/role/bio/photo), reorder, deactivate.

### Reviews / Testimonials
Admin → **Reviews** — edit text, rating, author, toggle visibility. Homepage fetches visible reviews from `GET /api/reviews?visible=true`.

### Careers / Jobs
Admin → **Careers** — post new jobs, edit descriptions/requirements, mark open/closed.

### Contact Enquiries
Admin → **Contact Enquiries** — view all submissions, mark as read/replied/archived, add notes.

### Email Notifications
Admin → **Settings** → Email & SMTP Configuration — configure SMTP to auto-forward contact form submissions.

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
