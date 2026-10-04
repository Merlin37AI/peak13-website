# Components

A component here is a section of the page plus the css and js that drive it. Html components are included into the page; css and js fragments are joined by `build.mjs` in the order listed in `src/manifest.json`.

## Html components (page sections)

| File | Section | Anchor | Notes |
|---|---|---|---|
| `hero.html` | Hero statement and headline | `#h1` | Headline reveals on load (`.reveal`) |
| `grow-stage.html` | Grow: dream, odds, one person, small, growing, large | `#grow` | Sticky dark window with a canvas (`#gr`), character sheet, badge, odds panel, six cards |
| `method-stage.html` | STOIC method on the building | `#stage` | Sticky window with canvas (`#block`), matrix panel (`#mx`), cost panel (`#cs`), five cards |
| `build.html` | Then we build the fix | `#build` | Find / Build / Keep, flow demo, automations vs agents, typical builds |
| `calculator.html` | Run it on your own week | `#calc` | Two inputs, output starts empty |
| `offers.html` | Three ways to work with us | `#audit` | Audit, Agents & Automations, Retainer |
| `cta.html` | Free Snapshot Call | none | Includes the CSS 3D tower (`#cube`) |

## Css fragments (joined in this order)

`layouts/base.css` (tokens, reset, labels, pills, header, hero) then `reveal.css`, `stage.css`, `scene-panels.css`, `grow.css`, `layouts/sections.css`, `calculator.css`, `offers.css`, `rise.css`, `build.css`, `cta.css`, `tower.css`, `layouts/footer.css`, `layouts/logo.css`, `rail.css`, `layouts/responsive.css` (all media queries, last so they win).

## Js fragments (one shared scope, joined in this order)

| File | What it holds |
|---|---|
| `core.js` | `RM` (reduced motion), helpers (`$`, `clamp`, `lerp`, `ss`, `key`) |
| `method-timeline.js` | `state(u)`: where every part of the method scene is at scroll position `u` |
| `projector.js` | Tiny 3D projector (`Camera`), box drawing, window strips |
| `method-scene.js` | `render(u)`: the building, track, labels |
| `method-hud.js` | HUD text, matrix and cost panels |
| `scroll-mapping.js` | Maps scroll to `u`, the frame loop, the right-edge scroll indicator |
| `grow-scene.js` | The Grow scene: icons, character sheet, badge, odds dots, canvas render |
| `reveals.js` | Masked headline reveals and `.rise` fade-ups |
| `build-flow.js` | The animated flow in the Build section |
| `calculator.js` | Calculator logic |
| `tower.js` | CSS 3D tower in the call-to-action |
| `boot.js` | `startPage()` and start-up |

## How they connect

- Both scroll scenes use the same idea: a sticky window, a list of 100vh "chapters" that scroll over it, and a position `u` (0 at the first card resting, 1 at the second, and so on). Everything drawn is a pure function of `u`, so scrolling back plays it in reverse.
- The scenes share the projector (`projector.js`) and helpers (`core.js`). The Grow scene reuses the building constants (`F`, `BW`, `BD`, `FHY`) defined at the top of `core.js`.
- Order matters: `core.js` first, `boot.js` last. If you add a fragment, add it to `src/manifest.json` and rebuild.
- Chapter queries are scoped (`#stage .chapter`, `#grow .chapter`) so the two scenes do not collide.

## Adding a component

1. Create `name.html` (and `name.css` / `name.js` if needed) here.
2. Add `<!--include:components/name.html-->` to `src/pages/index.html` where it belongs.
3. Add the css/js to `src/manifest.json` in the right place.
4. `node build.mjs`, then check at desktop and 390px.
