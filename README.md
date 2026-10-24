# Kali Hotel &amp; Restaurant — Janakpur Dham

A production-ready marketing site for **Kali Hotel &amp; Restaurant**, PWRG+3JF, Ring Rd, Janakpur,
Madhesh Province 45600. Built with **Node.js + Express**, **EJS** templates and **Tailwind CSS**.

- Multi-cuisine menu with accessible category tabs
- Celebrations (birthday / anniversary / cabin) section with direct WhatsApp and phone booking links
- Google rating + local-guide testimonials
- Embedded Google Map, contact details, opening hours and FAQ
- Full SEO: meta tags, OpenGraph, Twitter cards and Schema.org `Restaurant` JSON-LD

---

## Requirements

- Node.js 18 or newer (tested on Node 24)
- npm 10 or newer

## Getting started

```bash
npm install        # install express, ejs, helmet and the Tailwind build
npm run build:css  # compile src/css/tailwind.css -> public/css/tailwind.css
npm start          # build the CSS and start the server on http://localhost:3000
```

For development with auto-restart and Tailwind watching:

```bash
npm run dev        # node --watch server.js (run `npm run watch:css` in a second terminal)
```

### Environment variables

| Variable         | Default        | Purpose                                             |
| ---------------- | -------------- | --------------------------------------------------- |
| `PORT`           | `3000`         | HTTP port                                           |
| `HOST`           | `0.0.0.0`      | Bind address                                       |
| `NODE_ENV`       | –              | `production` enables view caching and HTTPS upgrade |
| `TRUST_PROXY`    | –              | `1` behind a reverse proxy (needed for correct IPs)  |
| `INQUIRY_TOKEN`  | –              | If set, enables the protected `GET /api/reservations` listing |

## Project structure

```
server.js                 Express app: routes, security headers, JSON API
lib/site-data.js          Single source of truth for business content (menu, reviews, hours…)
lib/validate.js           Sanitisation + validation for the inquiry endpoint
lib/store.js              Append-only NDJSON storage of inquiries (data/reservations.ndjson)
lib/rate-limit.js         Dependency-free in-memory fixed-window limiter
views/                    EJS templates (index, 404, 500 + partials/sections)
src/css/tailwind.css      Tailwind source: design tokens and component classes
public/css/tailwind.css   Compiled stylesheet (generated)
public/js/main.js         Tabs, mobile nav, scroll reveal and toast utilities
public/images/            Brand imagery (logo, counter, birthday, seven dish photos)
```

## API

### `POST /api/reservations`

Accepts JSON (or urlencoded) reservation and event inquiries.

```json
{
  "name": "Aman Sah",
  "phone": "+977 9854025213",
  "email": "aman@example.com",
  "date": "2026-12-24",
  "time": "19:30",
  "guests": 8,
  "eventType": "birthday",
  "occasion": "25th birthday",
  "message": "Balloon decoration please",
  "cabin": true,
  "decoration": true
}
```

| Status | Meaning                                                                 |
| ------ | ----------------------------------------------------------------------- |
| `201`  | Accepted — returns `{ success, message, reference, receivedAt }`        |
| `400`  | Validation failed — returns `{ success, message, errors: { field } }`   |
| `403`  | Cross-origin submission rejected                                        |
| `429`  | Rate limit reached (5 requests / 10 minutes / IP)                       |
| `500`  | Storage failure — the message asks the guest to call                    |

Every field is trimmed, stripped of markup and control characters, length-capped and validated
server-side. Inquiries are written to
`data/reservations.ndjson` (one JSON object per line) and logged with a `KH-XXXXX` reference.

### Other endpoints

- `GET /api/menu` — menu data as JSON
- `GET /api/reservations` — inquiry list, only when `INQUIRY_TOKEN` is set and `x-inquiry-token` matches
- `GET /health` — liveness probe
- `GET /robots.txt`, `GET /sitemap.xml` — crawler helpers

## Accessibility & quality notes

- Semantic HTML5 (`header`, `nav`, `main`, `section`, `article`, `address`, `blockquote`, `footer`)
- Skip link, visible focus rings, `aria-expanded` mobile menu, `role="tablist"` menu filters with
  arrow-key navigation and a live region announcing the result
- Navy `#0b1329` / gold `#d4af37` palette with measured contrast: body copy ≥ 7:1, gold-on-navy 11.8:1,
  navy-on-gold buttons 9.3:1
- `prefers-reduced-motion` disables the reveal animations and smooth scrolling
- Every image has descriptive alt text and explicit dimensions; below-the-fold images are lazy loaded
- Helmet security headers with a strict CSP (no inline scripts or styles)

## Content updates

All copy, menu items, reviews, hours and contact details live in
[`lib/site-data.js`](lib/site-data.js). Edit that file and restart the server — no template edits
needed.
