Check all backend API endpoints are responding correctly.

Requires the backend to be running on http://localhost:3000. If it's not, tell the user to run `/start` first.

1. Hit these public endpoints and verify 200 responses:
   - GET /api/settings
   - GET /api/pages
   - GET /api/pages/home
   - GET /api/pages/services
   - GET /api/pages/team
   - GET /api/pages/careers
   - GET /api/reviews?visible=true
   - GET /api/careers

2. Log in to get a JWT token:
   POST /api/auth/login  { email: "admin@pinnineCare.com", password: "Admin@123" }

3. With the token, hit these protected endpoints:
   - GET /api/team
   - GET /api/contact
   - GET /api/media

4. Print a table:
   | Endpoint | Status | Notes |
   For any non-200, include the error message and suggest a fix.

5. Summarise: X/Y endpoints healthy. Flag anything that needs attention.
