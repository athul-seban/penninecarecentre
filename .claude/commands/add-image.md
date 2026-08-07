Add or fix an image in the PinnineCare frontend.

Usage: /add-image <description-of-image>
Examples: /add-image new hero photo for services page, /add-image fix broken bedroom image in moorland suite

Steps:
1. If the user is adding a NEW image:
   a. Determine the correct slug name following the project convention:
      Format: <page>-<descriptor>.png  (all lowercase, hyphens, no spaces)
      Examples: services-hero.png, team-member-jane.png, life-garden-activity.png
   b. Tell the user where to place it: `frontend/src/assets/images/<slug>.png`
   c. Show the correct Angular img tag: `<img src="/assets/images/<slug>.png" alt="..." />`
   d. If it's a CSS background: `background-image: url('/assets/images/<slug>.png')`

2. If fixing a BROKEN image reference:
   a. Grep all .html and .ts and .css files under frontend/src for the broken filename.
   b. Show every occurrence with file + line number.
   c. Confirm the correct slug name (check what files exist in frontend/src/assets/images/).
   d. Apply the fix across all occurrences.

3. If renaming an existing image:
   a. Find all references to the old filename.
   b. Rename the file in assets/images/.
   c. Update all references.

4. Report all changed files.

Note: angular.json has a component style budget of 32kB — warn if a CSS file approaches that.
