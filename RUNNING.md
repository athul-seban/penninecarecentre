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
- All HTTP requests are logged with coloured output in the terminal

### Default admin login
- Email: `admin@pinnineCare.com`
- Password: `Admin@123`

> **Change this immediately** via the admin panel Settings page or `PUT /api/auth/change-password`

### Auto-seeded data (first run only)
On first run, the backend automatically seeds:
- 1 admin user
- 8 page content records (with real section text for every page)
- 17 site settings (theme, contact info, SMTP)
- 5 Google testimonials/reviews
- 6 team member profiles
- 3 open + 1 closed job listings

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

## Admin Features

### Editing Website Text Content
1. Log in at http://localhost:4300/login
2. Go to **Pages** in the sidebar
3. Select any page (Home, Pennine Suite, Services, etc.)
4. Edit any labelled text field (Hero Headline, Intro Text, etc.)
5. Click **Save Changes**

> Page text is stored in the database and fetched by the frontend on each visit.

### Managing Reviews
1. Go to **Reviews** in the sidebar
2. Edit existing reviews or add new ones
3. Toggle visibility — only visible reviews show on the homepage

### Managing Team Members
1. Go to **Team** in the sidebar
2. Add/edit/deactivate team members
3. Upload a photo via the Media Library and paste the URL

### Managing Job Listings
1. Go to **Careers** in the sidebar
2. Post new jobs, edit descriptions, mark positions open/closed

### Viewing Contact Enquiries
1. Go to **Contact Enquiries** in the sidebar
2. Click any submission to view full message
3. Mark as Read / Replied / Archived, add internal notes

### Configuring Email Notifications
1. Go to **Settings** → Email & SMTP Configuration
2. Enter your SMTP credentials (e.g. Gmail App Password, Brevo, Mailgun)
3. Set "Forward Enquiries To" to the email that should receive contact form submissions
4. Click **Save All Settings**
5. New contact form submissions will be automatically emailed

---

## Swagger API Documentation

Visit: **http://localhost:3000/api/docs**

1. Click **Authorize** (top right)
2. Enter your JWT token from: `POST /api/auth/login` response
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
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Admin panel on subdomain
server {
    listen 80;
    server_name admin.yourdomain.com;

    root /var/www/pinnineCare/admin/dist/browser;
    try_files $uri $uri/ /index.html;
}
```

### Environment variables for production
In production, set these instead of using `.env`:
```bash
DB_HOST=your-db-host
DB_PASSWORD=strong-password
JWT_SECRET=very-long-random-string
CLOUDINARY_CLOUD_NAME=...
```

---

## Useful Commands

```bash
# Check PostgreSQL service (Windows PowerShell)
Get-Service postgresql-17

# Start/stop PostgreSQL
Start-Service postgresql-17
Stop-Service postgresql-17

# Backend development with live reload
cd backend && npm run start:dev

# Build backend for production
cd backend && npm run build

# Build frontend for production
cd frontend && ng build --configuration production

# Build admin for production
cd admin && ng build --configuration production
```

---

## Troubleshooting

### Frontend/Admin blank screen (NG0908)
Zone.js must be installed and declared. Both `frontend/` and `admin/` need:
```bash
npm install zone.js
```
And `angular.json` must have:
```json
"polyfills": ["zone.js"]
```

### Images not showing in frontend
`src/assets/` must be listed in `frontend/angular.json` assets array:
```json
{ "glob": "**/*", "input": "src/assets", "output": "assets" }
```

### Database connection refused
1. Check PostgreSQL is running: `Get-Service postgresql-17`
2. Verify `.env` credentials match your PostgreSQL setup
3. Make sure the database exists: run the CREATE DATABASE command above
