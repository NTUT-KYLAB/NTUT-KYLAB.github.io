# Multi-Page Navigation + Floating Lab Photos — Design Spec

**Date:** 2026-04-10  
**Project:** NTUT KY Lab GitHub Pages site

---

## Overview

Convert the current single-page site into separate HTML pages for each nav section, and add floating frosted-glass lab photos to the Home hero background.

---

## Architecture

### Navigation Approach
Separate HTML files (true multi-page). Each nav link loads a new `.html` file instead of scrolling to an anchor.

### Shared Components
A new `js/components.js` file injects the nav and footer HTML into every page via JavaScript. Each page calls `components.js` once — no duplicated nav/footer markup across files.

---

## Files To Create

| File | Contents |
|------|----------|
| `research.html` | Research section only |
| `projects.html` | Projects section only |
| `professor.html` | Professor section only |
| `members.html` | Members (team) section only |
| `awards.html` | Awards section only |
| `js/components.js` | Shared nav + footer injection |
| `images/lab/` | Folder for lab photos (empty to start) |

## Files To Modify

| File | Change |
|------|--------|
| `index.html` | Remove all sections except hero; add floating photo layer |
| `js/main.js` | Add `labPhotos` array; add floating photo generator logic |
| `css/style.css` | Add frosted-glass floating card styles |

---

## Nav Link Changes

| Link | Before | After |
|------|--------|-------|
| Home | `#hero` | `index.html` |
| Research | `#research` | `research.html` |
| Projects | `#projects` | `projects.html` |
| Professor | `#professor` | `professor.html` |
| Members | `#team` | `members.html` |
| Awards | `#awards` | `awards.html` |
| Contact | `#contact` | `#contact` (footer on every page) |

---

## Page Structure

### index.html (Home)
- Hero section — **visually unchanged**, but internal links updated:
  - "研究領域" button: `#research` → `research.html`
  - "認識教授" button: `#professor` → `professor.html`
  - Hero SCROLL button: `#research` → `research.html`
- Floating photo layer rendered behind hero content
- Nav + footer injected by `components.js`

### Other pages (research, projects, professor, members, awards)
- Inject nav + footer via `components.js`
- Small page-top padding to clear the fixed nav
- Contain only the relevant section content (copied from current `index.html`)
- Scroll reveal animations work the same way

---

## Floating Lab Photos

### Style
Frosted-glass rectangular cards with:
- `backdrop-filter: blur` + semi-transparent overlay
- Slight random rotation (−8° to +8°)
- Slow floating animation (same `float-jelly` keyframe, longer duration ~8–12s)
- Low opacity (0.4–0.6) so they don't compete with hero text
- Positioned randomly around the hero edges (not center)

### Management
```js
// js/main.js — edit this array to add/remove photos
const labPhotos = [
  'images/lab/photo1.jpg',
  'images/lab/photo2.jpg',
  // add more here
];
```
- If array is empty, no floating cards are rendered
- Cards are generated dynamically and inserted into `.hero-deco`
- Maximum 6 cards displayed even if more paths are provided (to avoid clutter)

---

## Constraints
- No build tools — vanilla HTML/CSS/JS only
- Must work on GitHub Pages (static hosting)
- Contact stays as footer on every page (no separate contact page)
- `.gitignore` should include `.superpowers/`
