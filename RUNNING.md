# PinnineCare — How to Run & Host

## Project Structure

```
PinnineCare/
├── backend/      NestJS REST API  (port 3000)
├── frontend/     Angular public website (port 4200)
├── admin/        Angular admin CMS (port 4300)
```

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | v18+ | `node --version` |
| npm | v9+ | `npm --version` |
| PostgreSQL | v17 | Running as service `postgresql-17` |

---

## 1. Backend (NestJS API)

### Setup
```bash
cd backend
npm install
```

### Configure environment
Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=pinninecaredb
JWT_SECRET=change_this_to_a_strong_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Cloudinary**: Free account at cloudinary.com — copy the cloud name, API key, and secret from your dashboard.

### Create database (first time only)
```bash
# In PowerShell (PostgreSQL must be running)
$env:PGPASSWORD="postgres123"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE pinninecaredb;"
```

### Run in development
```bash
npm run start:dev
```
- API: http://localhost:3000/api
- Swagger docs: http://localhost:3000/api/docs

### Default admin login
- Email: `admin@pinnineCare.com`
- Password: `Admin@123`

> **Change this immediately** via `PUT /api/auth/change-password`

---

## 2. Frontend (Public Website)

```bash
cd frontend
npm install
ng serve
```
- Website: http://localhost:4200

---

## 3. Admin CMS

```bash
cd admin
npm install
ng serve --port 4300
```
- Admin panel: http://localhost:4300/login

> The admin is **not linked from the public website**. Access it directly via URL.

---

## Running All Three at Once

Open 3 separate terminals:

**Terminal 1 — Backend**
```bash
cd backend && npm run start:dev
```

**Terminal 2 — Frontend**
```bash
cd frontend && ng serve
```

**Terminal 3 — Admin**
```bash
cd admin && ng serve --port 4300
```

---

## Swagger API Documentation

Visit: **http://localhost:3000/api/docs**

1. Click **Authorize** (top right)
2. Enter your JWT token: `Bearer <token from login>`
3. All endpoints are documented and testable

---

## Switching Website Themes

1. Log in to the admin panel at http://localhost:4300/login
2. Go to **Settings** in the sidebar
3. Under **Website Design Theme**, click one of the 5 themes:
   - **Classic** — Navy & Gold (default)
   - **Modern Dark** — Near-black with cyan
   - **Warm Sage** — Forest green with copper
   - **Rose & Slate** — Slate blue with dusty rose
   - **Royal Purple** — Deep violet with lavender
4. Click **Save All Settings**
5. Refresh the public website — theme applies immediately

---

## Production Hosting (VPS/Cloud)

### Backend
```bash
cd backend
npm run build
node dist/main.js
```
Or use PM2:
```bash
npm install -g pm2
pm2 start dist/main.js --name pinnineCare-api
pm2 save
```

### Frontend & Admin
```bash
cd frontend && ng build --configuration production
cd admin && ng build --configuration production
```
Serve the `dist/` folders with **Nginx** or upload to a static host (Vercel, Netlify, Cloudflare Pages).

### Nginx example config
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Public website
    root /var/www/pinnineCare/frontend/dist/browser;
    try_files $uri $uri/ /index.html;

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

---

## Useful Commands

```bash
# Check PostgreSQL service
Get-Service postgresql-17

# Start/stop PostgreSQL
Start-Service postgresql-17
Stop-Service postgresql-17

# View API logs
cd backend && npm run start:dev

# Build backend
cd backend && npm run build

# Build frontend for production
cd frontend && ng build --configuration production
```
