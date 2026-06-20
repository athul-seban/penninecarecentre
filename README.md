<div align="center">

# 🏥 Pennine Care Centre

### A premium residential care home management platform built with Angular & NestJS

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular)](https://angular.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com)

*Glossop, Derbyshire, UK*

</div>

---

## Overview

**Pennine Care Centre** is a full-stack web platform for a premium residential care home. It consists of three applications working together: a public-facing website, a headless REST API, and a private admin CMS — enabling staff to manage all website content, team profiles, job listings, testimonials, and contact enquiries without touching any code.

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   Public Website    │     │     NestJS REST API   │     │     Admin CMS       │
│   Angular 21        │────▶│     Port 3000         │◀────│     Angular 21      │
│   Port 4200         │     │     PostgreSQL 17      │     │     Port 4300       │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
```

---

## ✨ Features

### Public Website
- 9-page responsive website covering suites, services, team, careers & contact
- CMS-driven content — every text field and image editable from the admin panel
- 5 switchable colour themes applied in real time via CSS custom properties
- Sticky navigation, back-to-top, announcement banner, Google Maps embed
- Photo carousels, image sliders, and a testimonials section fed from the database

### Admin CMS
- **Pages Editor** — edit all text fields and images for every page, with a visual photo-grid asset picker for local frontend images
- **Team Manager** — add, edit, reorder and deactivate staff profiles with photo support
- **Reviews Manager** — manage Google-style testimonials with visibility toggle
- **Careers Manager** — post, edit and close job listings with application form
- **Contact Enquiries** — view all form submissions, update status (read/replied/archived), add internal notes
- **Media Library** — upload images to Cloudinary, browse and delete files
- **Settings** — switch themes, manage SMTP email config, and edit all site-wide settings
- **Dashboard** — stats overview of content across all sections

### Backend API
- JWT authentication with bcrypt password hashing
- Full CRUD for pages, team, careers, reviews, settings, media and contact
- Auto-seeds all tables with real content on first run
- SMTP email forwarding for contact form submissions
- Structured JSON error responses and coloured HTTP request logging
- Interactive Swagger docs at `/api/docs`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend & Admin** | Angular 21 (standalone components, signals) |
| **Backend** | NestJS 11, TypeORM |
| **Database** | PostgreSQL 17 (JSONB for page sections) |
| **Auth** | JWT · bcryptjs · Passport |
| **Media** | Cloudinary (upload, delete, list) |
| **API Docs** | Swagger / OpenAPI |
| **Language** | TypeScript throughout |

---

## 🚀 Quick Start

> **Prerequisites:** Node.js 18+, npm 9+, PostgreSQL 17 running locally

### 1 — Clone & install

```bash
git clone https://github.com/athul-seban/penninecarecentre.git
cd penninecarecentre

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd admin && npm install && cd ..
```

### 2 — Configure the backend

Copy and edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=pinninecaredb

JWT_SECRET=change_this_to_a_long_random_string

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Cloudinary** is free — create an account at [cloudinary.com](https://cloudinary.com) and copy your credentials from the dashboard.

### 3 — Create the database

```bash
# PowerShell (PostgreSQL must be running)
$env:PGPASSWORD="postgres123"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE pinninecaredb;"
```

### 4 — Run all three servers

Open three terminals:

```bash
# Terminal 1 — API
cd backend && npm run start:dev

# Terminal 2 — Public website
cd frontend && ng serve

# Terminal 3 — Admin CMS
cd admin && ng serve --port 4300
```

| App | URL |
|---|---|
| Public website | http://localhost:4200 |
| Admin CMS | http://localhost:4300/login |
| API + Swagger | http://localhost:3000/api/docs |

**Default admin credentials**
```
Email:    admin@pinnineCare.com
Password: Admin@123
```
> Change these immediately after first login.

---

## 🗄 Database

TypeORM auto-creates all tables on first run (`synchronize: true` in dev). The backend also auto-seeds everything — no manual SQL needed.

| Table | Description | Auto-seeded |
|---|---|---|
| `users` | Admin accounts | ✅ 1 default admin |
| `page_content` | Per-page CMS content (JSONB sections) | ✅ 8 pages with real content |
| `settings` | Key-value site config (theme, SMTP, etc.) | ✅ 17 defaults |
| `team_members` | Staff profiles | ✅ 6 placeholder members |
| `jobs` | Career listings | ✅ 3 open + 1 closed |
| `reviews` | Testimonials | ✅ 5 real Google reviews |
| `media` | Cloudinary file records | — |
| `contact_submissions` | Website contact form submissions | — |

---

## 🎨 Themes

Switch themes instantly from **Admin → Settings → Website Design Theme**. No redeploy needed.

| Theme | ID | Primary | Accent |
|---|---|---|---|
| Classic | `classic` | Navy `#002b5b` | Gold `#c5a059` |
| Modern Dark | `modern` | Near-black `#0d0d1a` | Cyan `#00d4ff` |
| Warm Sage | `sage` | Forest green `#2a4523` | Copper `#b8925a` |
| Rose & Slate | `rose` | Slate `#2c3e50` | Rose `#c27b6e` |
| Royal Purple | `royal` | Violet `#2d1b69` | Lavender `#9b7ed4` |

Themes are implemented as CSS custom property overrides on `body[data-theme="<id>"]`.

---

## 📡 API Reference

Full interactive docs: **http://localhost:3000/api/docs**

```
POST   /api/auth/login                  Authenticate and receive JWT

GET    /api/pages                       List all pages
GET    /api/pages/:key                  Get a single page with sections
PUT    /api/pages/:key            🔒    Update page content

GET    /api/settings                    Get all site settings
PUT    /api/settings              🔒    Update settings

GET    /api/team                        List team members
POST   /api/team                  🔒    Add team member
PUT    /api/team/:id              🔒    Update team member
DELETE /api/team/:id              🔒    Delete team member

GET    /api/careers                     List job listings
POST   /api/careers               🔒    Create job listing
PUT    /api/careers/:id           🔒    Update job listing
DELETE /api/careers/:id           🔒    Delete job listing

GET    /api/reviews                     List reviews (?visible=true for public)
POST   /api/reviews               🔒    Add review
PUT    /api/reviews/:id           🔒    Update review
DELETE /api/reviews/:id           🔒    Delete review

POST   /api/contact                     Submit contact form (public)
GET    /api/contact               🔒    List all submissions
PATCH  /api/contact/:id           🔒    Update submission status
DELETE /api/contact/:id           🔒    Delete submission

POST   /api/media/upload          🔒    Upload to Cloudinary
GET    /api/media                 🔒    List Cloudinary files
GET    /api/media/local-assets    🔒    List local frontend image assets
DELETE /api/media/:id             🔒    Delete from Cloudinary
```

🔒 = Requires `Authorization: Bearer <token>` header

---

## 📁 Project Structure

```
PinnineCare/
├── backend/
│   └── src/
│       ├── auth/               JWT login, strategy, guard
│       ├── users/              Admin user entity, auto-creates default admin
│       ├── pages/              Page CMS (sections JSONB, 8 pages seeded)
│       ├── settings/           Key-value site settings + SMTP config
│       ├── media/              Cloudinary upload/delete + local asset listing
│       ├── team/               Team member CRUD
│       ├── careers/            Job listing CRUD
│       ├── reviews/            Testimonial CRUD
│       ├── contact/            Contact form (save to DB + email forwarding)
│       ├── analytics/          Basic analytics tracking
│       └── common/             HTTP logger, exception filter, error log
│
├── frontend/
│   └── src/app/
│       ├── core/               ThemeService, ContentService (with caching)
│       ├── shared/             Navbar (sticky + mobile overlay), Footer
│       └── pages/              home, pennine-suite, moorland-suite, services,
│                               life-at-pennine, team, contact, careers, privacy-policy
│
└── admin/
    └── src/app/
        ├── core/               Auth service, API service, auth guard
        ├── shared/             Responsive sidebar with mobile hamburger
        └── pages/              login, dashboard, pages-editor, team-manager,
                                careers-manager, reviews-manager, media-library,
                                contact-manager, settings-editor, people-manager
```

---

## 🚢 Production Deployment

### Build

```bash
cd backend && npm run build
cd frontend && ng build --configuration production
cd admin && ng build --configuration production
```

### Run the API with PM2

```bash
npm install -g pm2
cd backend
pm2 start dist/main.js --name pennine-api
pm2 save && pm2 startup
```

### Nginx config (example)

```nginx
# Public website
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/pennine/frontend/dist/browser;
    try_files $uri $uri/ /index.html;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Admin panel
server {
    listen 80;
    server_name admin.yourdomain.com;

    root /var/www/pennine/admin/dist/browser;
    try_files $uri $uri/ /index.html;
}
```

Serve the `dist/browser/` folders for frontend and admin — or deploy them to any static host (Vercel, Netlify, Cloudflare Pages).

---

## 🔧 Troubleshooting

**Blank screen (NG0908 error)**
Make sure `zone.js` is installed and listed in `angular.json` polyfills in both `frontend/` and `admin/`.

**Database connection refused**
Confirm PostgreSQL is running (`Get-Service postgresql-17` on Windows) and that `.env` credentials are correct.

**Images not loading on public website**
Ensure `src/assets` is listed in the `assets` array inside `frontend/angular.json`.

**Contact emails not sending**
Configure SMTP in Admin → Settings. Gmail users need an [App Password](https://support.google.com/accounts/answer/185833) (not your regular password).

---

<div align="center">

Built for **Pennine Care Centre** · Glossop, Derbyshire, UK

</div>
