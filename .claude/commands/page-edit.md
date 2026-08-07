Edit a frontend page — both the Angular template and its CMS sections.

Usage: /page-edit <page-name>
Examples: /page-edit home, /page-edit services, /page-edit team

Page name → file mapping:
  home          → frontend/src/app/pages/home/
  pennine-suite → frontend/src/app/pages/pennine-suite/
  moorland-suite→ frontend/src/app/pages/moorland-suite/
  services      → frontend/src/app/pages/services/
  life-at-pennine → frontend/src/app/pages/life-at-pennine/
  team          → frontend/src/app/pages/team/
  contact       → frontend/src/app/pages/contact/
  careers       → frontend/src/app/pages/careers/
  privacy-policy→ frontend/src/app/pages/privacy-policy/

Steps:
1. Read the Angular template (.html) and component (.ts) for the requested page.
2. Read the matching CMS sections from the backend seed file at backend/src/pages/pages.seed.ts (look for the page key matching the page name).
3. Show the user a summary of: editable text areas in the template, and the `sections` fields stored in the CMS.
4. Ask what they want to change (or use $ARGUMENTS if provided).
5. Apply changes to the Angular template if it's hardcoded text.
6. If the text is driven by ContentService/sections, update the seed AND note that the admin CMS (http://localhost:4300) Pages editor can also update it live without a code change.
7. Report which files changed.
