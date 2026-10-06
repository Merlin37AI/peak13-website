# Pages

The site is one page, plus two plain legal pages. Routing on the home page is anchors, not URLs.

| Page | File | Output | Layout |
|---|---|---|---|
| Home | `index.html` | `dist/index.html` | `layouts/base.html` |
| Privacy notice | `privacy.html` | `dist/privacy.html` | `layouts/legal.html` |
| Website terms | `terms.html` | `dist/terms.html` | `layouts/legal.html` |

The legal pages hold body text only. Their title and description are set in the `legalPages` list in `build.mjs`. They load the same `site.css` but not `site.js`. The footer (company details, email, Privacy and Terms links) is one shared file, `layouts/footer.html`, included by both layouts. Link to them as `/privacy.html` and `/terms.html`. Review the text when what the site collects changes (analytics, a form, an embedded booking widget, self-hosted fonts).

`index.html` contains only `<!--include:...-->` lines, one per section, in page order. `build.mjs` replaces each with the component's html and drops the result into the layout's `<!--PAGE-->` slot.

## Anchor routing

| Link | Goes to |
|---|---|
| Nav "What we build" | `#build` |
| Nav "The audit" | `#audit` (the three offers) |
| Grow step 6 link | `#stage` (the STOIC method) |
| Method step 5 link | `#calc` (the calculator) |
| Every "Book a free Snapshot Call" | Calendly: calendly.com/peak13consultingcall/ai-discovery |
| Footer and CTA email | info@peak13.co.uk |

## Adding a page

1. Add `src/pages/name.html` (include lines only).
2. Teach `build.mjs` to build it to `dist/name.html` (today it builds `index.html` only).
3. Pick a layout, link to it from the nav, and update `docs/prd.md`.

Do not add pages for content that does not exist yet (blog, case studies, pricing). Case studies are the most valuable future page, once there are real results.
