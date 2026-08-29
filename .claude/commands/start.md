Start all three Pennine Care Centre dev servers.

1. Check that `backend/.env` exists. If it doesn't, warn the user and stop.
2. Open three background terminals (or instruct the user to run these in three separate terminals):
   - Terminal 1: `cd backend && npm run start:dev`  (NestJS API on :3000)
   - Terminal 2: `cd frontend && ng serve`          (Public site on :4200)
   - Terminal 3: `cd admin && ng serve --port 4300` (Admin CMS on :4300)
3. After ~5 seconds, verify the backend is up by hitting `http://localhost:3000/api/settings`.
4. Report the status of each server and print the three URLs:
   - Public site: http://localhost:4200
   - Admin CMS:   http://localhost:4300/login  (admin@pinnineCare.com / Admin@123)
   - API:         http://localhost:3000/api
