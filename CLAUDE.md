# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the official static website for **KY Lab (System Analysis & Control Lab)** at National Taipei University of Technology (NTUT), led by Prof. Kuang-Yow Lian. It is a pure static HTML/CSS/JS site deployed via GitHub Pages — no build step, no package manager, no framework.

**Live site:** https://ntut-kylab.github.io/

## Deployment

Push to `main` → GitHub Pages auto-deploys within ~2 minutes. There is no CI build step to run.

```bash
git add <files>
git commit -m "描述這次改了什麼"
git push
```

## Architecture

### Page Structure

Each page is a standalone HTML file that loads the same two scripts at the bottom of `<body>`:

```html
<script src="js/components.js"></script>
<script src="js/main.js"></script>
```

| File | Purpose |
|---|---|
| `index.html` | Hero landing page only |
| `research.html` | Research areas |
| `projects.html` | Lab projects |
| `professor.html` | Professor profile & academic history |
| `members.html` | Lab members |
| `awards.html` | Awards & recognition |

### Shared Components (`js/components.js`)

Injects navbar and footer into every page via `insertAdjacentHTML`. Active nav link is detected by comparing `location.pathname`. If you add a new page, add it to the `nav-links` list inside `components.js`.

### Main Script (`js/main.js`)

Controls all interactive behavior:
- **`labPhotos` config array** — add image paths here to enable floating photo cards on the home page hero. Photos go in `images/lab/`.
- Scroll reveal animation (`IntersectionObserver` on `.reveal` elements)
- Navbar scroll shadow
- Mobile hamburger menu
- Drone cursor with physics tilt (`#droneCursor`)
- Cursor glow (`#cursorGlow`)
- Emoji bounce click animation
- Professor academic history expand/collapse (`toggleServices()`)
- Dark/light theme toggle persisted in `localStorage` under key `saclab-theme`

### Styling (`css/style.css`)

All colors are defined as CSS variables in `:root`. Dark mode overrides are applied via `body.dark-theme`. To change the color scheme, edit the variables at the top of `style.css`:

```css
:root {
  --color-cyan: #64D2D6;
  --color-purple: #B794F4;
  /* etc. */
}
```

### Adding Content

- **New research card / project / member / award** — duplicate an existing card element in the relevant HTML file and edit the content.
- **Floating lab photos** — add photo paths to the `labPhotos` array in `js/main.js` (max 6 shown). Place images in `images/lab/`.
- **New page** — create a new `.html` file following the same `<head>` template as an existing page, then add the route to the navbar in `js/components.js`.

## GitHub Actions

- `.github/workflows/claude.yml` — enables `@claude` mentions in issues and PRs to trigger Claude Code.
- `.github/workflows/claude-code-review.yml` — automated code review on PRs.
