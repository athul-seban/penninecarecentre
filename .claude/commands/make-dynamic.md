Scan a frontend page for hardcoded text and convert it to CMS-driven dynamic content.

Usage: /make-dynamic <page-name>
Examples: /make-dynamic home, /make-dynamic services, /make-dynamic team

If no page name is given, infer it from the currently open file.

---

## The dynamic content pattern in this project

Every Angular page component must follow this pattern:

**In the component .ts:**
```ts
sections: Record<string, string> = {};

ngOnInit(): void {
  this.content.getPage('page-key').subscribe(s => { this.sections = s; });
}
```
ContentService must be injected: `private content = inject(ContentService);`
Import: `import { ContentService } from '../../core/content.service';`

**In the template .html:**
```html
{{ sections['keyName'] || 'Fallback text shown if CMS is empty' }}
```
The fallback MUST be the original hardcoded text — it keeps the page working if the backend is down.

**In the seed (backend/src/pages/pages.service.ts):**
Add the key+value to the matching pageKey entry in DEFAULT_PAGES.

---

## Steps

1. Determine the page name from $ARGUMENTS or the currently open file.

2. Map page name to files:
   - home             → frontend/src/app/pages/home/home.html + home.ts
   - pennine-suite    → frontend/src/app/pages/pennine-suite/pennine-suite.html + .ts
   - moorland-suite   → frontend/src/app/pages/moorland-suite/moorland-suite.html + .ts
   - services         → frontend/src/app/pages/services/services.html + .ts
   - life-at-pennine  → frontend/src/app/pages/life-at-pennine/life-at-pennine.html + .ts
   - team             → frontend/src/app/pages/team/team.html + .ts
   - contact          → frontend/src/app/pages/contact/contact.html + .ts
   - careers          → frontend/src/app/pages/careers/careers.html + .ts
   - privacy-policy   → frontend/src/app/pages/privacy-policy/privacy-policy.html + .ts

3. Read the .html template in full.

4. Identify hardcoded text — text nodes inside these tags that do NOT already use `{{ sections['...'] }}`:
   - `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
   - `<p>` (not inside *ngFor loops that render API data)
   - `<a>` link labels / button text / `<button>` labels
   - `<span>` containing visible copy
   - `<li>` list items with static text
   - `<label>` form labels

   SKIP these — they are intentionally static and must not be touched:
   - `aria-label`, `[attr.aria-label]`, `placeholder`, `title` attributes
   - `routerLink` values
   - Angular expressions: `*ngIf`, `*ngFor`, `@for`, `[class]`, `(click)`, etc.
   - Icon elements (`<i class="fas ...">`)
   - Text inside `{{ }}` that already uses sections
   - Text that is purely structural (e.g. `|`, `/`, `·`)
   - Input placeholders and form validation messages
   - `<option>` values in selects

5. For each hardcoded text found, generate a camelCase key:
   - Use a short, descriptive name based on the element + content
   - Example: `<h2>Our Care</h2>` → key: `careSectionTitle`
   - Example: `<h4>Life at Pennine</h4>` → key: `lifeCard1Title`
   - Example: `<a>Explore Suite</a>` (Pennine) → key: `pennineCta`
   - Avoid collisions with existing sections keys already in the seed

6. Read the .ts component file and check:
   - Does it have `sections: Record<string, string> = {}`? If not, add it.
   - Does it call `this.content.getPage('page-key').subscribe(s => { this.sections = s; })` in ngOnInit? If not, add it.
   - Is ContentService imported and injected? If not, add the import and inject line.

7. Read backend/src/pages/pages.service.ts.
   Find the matching pageKey entry in DEFAULT_PAGES.
   Check which keys are ALREADY present in the sections object — do not add duplicates.

8. Present a summary table to the user BEFORE making changes:
   | Element | Hardcoded text | Proposed key | Already in seed? |
   List every change. Ask for confirmation if more than 5 changes are queued.
   If $ARGUMENTS contains "apply" or "--apply", skip confirmation and apply directly.

9. Apply changes:
   a. In the .html: replace each hardcoded text with `{{ sections['key'] || 'original text' }}`
      - Preserve surrounding whitespace and indentation exactly
      - For multi-line text in a <p>, keep the text on one line inside the binding
   b. In the .ts: add sections property and ContentService wiring if missing
   c. In pages.service.ts: add new keys to the matching sections object in DEFAULT_PAGES
      - Preserve existing keys — never remove or overwrite them
      - Add new keys at the end of the sections object

10. Report all files changed with a count of keys added/updated.

---

## Important rules

- NEVER remove existing `{{ sections['...'] || '...' }}` bindings — only add new ones
- NEVER make `@for` loop variables dynamic via sections (those come from API arrays, not CMS)
- NEVER touch image `src` or `alt` attributes — use /add-image for those
- If a page doesn't have a ContentService subscription yet, add it before adding any bindings
- The fallback text in `|| '...'` MUST exactly match the original hardcoded text so the page is resilient if the API is down
- New seed keys take effect after the backend restarts (`npm run start:dev` in backend/)
