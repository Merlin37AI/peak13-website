# Layouts

A layout is the frame around a page: head, header, footer and the scripts. The page content is dropped into the `<!--PAGE-->` slot.

| Layout | File | Use when |
|---|---|---|
| Base | `base.html` | Every page. Holds `<head>` (fonts, favicon, `assets/site.css`), skip link, header with the logo and nav, `<main id="main">` with the page slot, footer, the right-edge scroll indicator and `assets/site.js` |

## Layout css

| File | Holds |
|---|---|
| `base.css` | `:root` colour and type tokens, reset, mono labels, pills, plus rows, header, hero |
| `sections.css` | Shared section padding, split headline/lede grid, big headings |
| `footer.css` | Footer |
| `logo.css` | Header and footer logo sizes (58 / 46px, 40 / 36px on phones) |
| `responsive.css` | Every media query (760px, 1000px, 1100px) and the reduced-motion block. Joined last so it wins |

## Rules

- Tokens live in `base.css` only. Components use `var(--token)`.
- The logo is an `<img>` (`public/images/peak13-logo.webp`) with real dimensions and alt text. Do not swap it for text.
- Only one `<main>`, one skip link, one right-edge indicator.
- Changing the head (fonts, meta) means rebuilding and checking the first paint on a phone.
