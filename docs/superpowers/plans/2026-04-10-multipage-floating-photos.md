# Multi-Page Navigation + Floating Lab Photos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the single-page KY Lab site into separate HTML pages per nav section, and add floating frosted-glass lab photo cards to the Home hero background.

**Architecture:** A new `js/components.js` file synchronously injects the shared nav, footer, cursor glow, drone cursor, and theme toggle button into each page's DOM when its script tag executes (scripts are at bottom of body, so DOM is already parsed). Each inner page (research, projects, professor, members, awards) is a standalone HTML file containing only its section content. `index.html` keeps only the hero section and gains a floating photo layer driven by a `labPhotos` array in `main.js`.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES6). No build tools. GitHub Pages static hosting.

**Note on testing:** This project has no test framework. Each task ends with manual browser verification steps instead of automated tests.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `index.html` | Hero only; update internal links; remove all other sections |
| Create | `js/components.js` | Inject nav, footer, cursor, themeToggle into every page |
| Modify | `js/main.js` | Remove scroll-active detection; add `labPhotos` array + `initFloatingPhotos()` |
| Modify | `css/style.css` | Add `.lab-photo-float` styles + inner-page top padding |
| Create | `research.html` | Research section page |
| Create | `projects.html` | Projects section page |
| Create | `professor.html` | Professor section page |
| Create | `members.html` | Members section page |
| Create | `awards.html` | Awards section page |
| Create | `images/lab/.gitkeep` | Placeholder so folder is tracked by git |

---

## Task 1: Setup — .gitignore and images/lab/ directory

**Files:**
- Modify: `.gitignore`
- Create: `images/lab/.gitkeep`

- [ ] **Step 1: Add .superpowers/ to .gitignore**

Open `.gitignore` (create it if it doesn't exist) and add:

```
.superpowers/
```

- [ ] **Step 2: Create images/lab directory with gitkeep**

Create an empty file at `images/lab/.gitkeep` (empty content). This lets git track the folder so future lab photos placed there are automatically in the right location.

- [ ] **Step 3: Commit**

```bash
git add .gitignore images/lab/.gitkeep
git commit -m "chore: add .gitignore for .superpowers and create images/lab/ folder"
```

---

## Task 2: Create js/components.js — shared nav, footer, cursor injection

**Files:**
- Create: `js/components.js`

This file runs synchronously (script tag at bottom of `<body>`), so the page DOM is already parsed when it executes. It injects nav at the top of body and footer + UI chrome at the bottom. It detects the current page filename to set the active nav link.

- [ ] **Step 1: Create js/components.js with the full content below**

```js
/* ======================================================
   KY Lab — Shared Components (Nav + Footer + UI Chrome)
   Injected synchronously into every page via <script> tag
   at bottom of <body>.
   ====================================================== */

(function () {
  // Detect current page for active nav link
  const page = location.pathname.split('/').pop() || 'index.html';

  function active(href) {
    return page === href ? ' class="active"' : '';
  }

  const topHTML = `
    <div class="cursor-glow" id="cursorGlow"></div>
    <img src="images/drone.png" class="drone-cursor" id="droneCursor" alt="Drone Cursor">
    <nav id="navbar">
      <div class="nav-brand">
        <div class="nav-logo-box">
          <span class="nav-logo-icon">⚙️</span>
        </div>
        <div class="logo-text">KY <span>Lab</span></div>
      </div>
      <ul class="nav-links">
        <li><a href="index.html"${active('index.html')}>Home</a></li>
        <li><a href="research.html"${active('research.html')}>Research</a></li>
        <li><a href="projects.html"${active('projects.html')}>Projects</a></li>
        <li><a href="professor.html"${active('professor.html')}>Professor</a></li>
        <li><a href="members.html"${active('members.html')}>Members</a></li>
        <li><a href="awards.html"${active('awards.html')}>Awards</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <button class="nav-toggle" aria-label="選單">
        <span></span><span></span><span></span>
      </button>
    </nav>
  `;

  const bottomHTML = `
    <footer id="contact">
      <div class="footer-top">
        <div class="footer-brand-area">
          <div class="footer-logo-box"><span>⚙️</span></div>
          <div>
            <div class="footer-brand">KY Lab · 系統分析與控制實驗室</div>
            <p>國立臺北科技大學 · 電機工程系</p>
          </div>
        </div>
        <div class="footer-info">
          <div class="footer-item">
            <span class="fi-icon">📍</span>
            <span>106 台北市大安區忠孝東路三段1號 綜合科館 503 室</span>
          </div>
          <div class="footer-item">
            <span class="fi-icon">✉️</span>
            <a href="mailto:kylian@ntut.edu.tw">kylian@ntut.edu.tw</a>
          </div>
          <div class="footer-item">
            <span class="fi-icon">📞</span>
            <span>02-2771-2171 #2171</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>Made by Melvin Kuo © 2026 · National Taipei University of Technology</p>
      </div>
    </footer>
    <button id="themeToggle" class="theme-toggle" aria-label="切換深淺色主題">🌙</button>
  `;

  document.body.insertAdjacentHTML('afterbegin', topHTML);
  document.body.insertAdjacentHTML('beforeend', bottomHTML);
})();
```

- [ ] **Step 2: Manual verification**

Open `index.html` in a browser (or local server). The nav and footer should still appear even though they're no longer in `index.html`'s body yet (they will be once we refactor in Task 4). For now, there'll be two navs — that's expected and will be fixed in Task 4.

- [ ] **Step 3: Commit**

```bash
git add js/components.js
git commit -m "feat: add components.js for shared nav/footer injection"
```

---

## Task 3: Update css/style.css — floating photo card styles + inner-page padding

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: Append the following CSS to the end of css/style.css**

```css
/* ====== LAB PHOTO FLOAT CARDS ====== */
.lab-photo-float {
  position: absolute;
  width: 160px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  animation: float-jelly 10s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: 0;
}

.lab-photo-float img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.45;
}

body.dark-theme .lab-photo-float {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

/* ====== INNER PAGE TOP PADDING ====== */
/* Ensures first section clears the fixed nav on non-hero pages */
.page-section {
  padding-top: 130px;
}
```

- [ ] **Step 2: Manual verification**

No visual change yet (no `.lab-photo-float` elements exist in DOM yet). Verify the file saved correctly by opening `css/style.css` and confirming the new rules are at the bottom.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add lab photo float card styles and inner-page padding"
```

---

## Task 4: Refactor index.html — hero only, update links, remove other sections

**Files:**
- Modify: `index.html`

Remove everything except the hero section. Update hero internal links. Add `js/components.js` script tag. Remove the old nav, footer, cursor elements, and themeToggle (now injected by components.js).

- [ ] **Step 1: Replace the entire index.html with the content below**

```html
<!DOCTYPE html>
<html lang="zh-Hant">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>練光祐教授 Prof. Kuang-Yow Lian | 國立臺北科技大學 KY Lab 系統分析與控制實驗室</title>

  <meta name="description"
    content="國立臺北科技大學（北科大）系統分析與控制實驗室 (KY Lab)，由練光祐特聘教授 (Prof. Kuang-Yow Lian) 指導。專注於無人機飛行控制、AI音訊處理、影像辨識、智慧家庭、IoT 嵌入式裝置及節能優化研究。">
  <meta name="keywords" content="練光祐, Kuang-Yow Lian, 北科大, NTUT, KY Lab, 系統分析與控制, 無人機控制, 音訊處理, 影像辨識, 節能優化, 台北科技大學電機系">
  <meta name="author" content="Kuang-Yow Lian">

  <meta property="og:title" content="練光祐教授 Prof. Kuang-Yow Lian | 北科大 KY Lab 系統分析與控制實驗室">
  <meta property="og:description" content="探索練光祐教授指導的 KY Lab 研究成果：無人機、AI音訊、影像處理及智慧控制。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ntut-kylab.github.io/">
  <meta property="og:image" content="https://ntut-kylab.github.io/images/professor.jpg">

  <link rel="icon" type="image/svg+xml"
    href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>🤖</text></svg>">
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Nunito:wght@400;600;700;800&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "練光祐",
    "alternateName": "Kuang-Yow Lian",
    "affiliation": {
      "@type": "EducationalOrganization",
      "name": "國立臺北科技大學",
      "sameAs": "https://www.ntut.edu.tw/"
    },
    "jobTitle": "特聘教授",
    "url": "https://ntut-kylab.github.io/",
    "worksFor": {
      "@type": "Organization",
      "name": "KY Lab 系統分析與控制實驗室"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "忠孝東路三段1號 綜合科館 503 室",
      "addressLocality": "大安區",
      "addressRegion": "台北市",
      "postalCode": "106",
      "addressCountry": "TW"
    }
  }
  </script>
</head>

<body>

  <section class="hero" id="hero">
    <div class="hero-particles" id="particles"></div>
    <div class="hero-grid-bg"></div>
    <div class="hero-deco">
      <span class="float-icon f1">🛸</span>
      <span class="float-icon f2">🔧</span>
      <span class="float-icon f3">💡</span>
      <span class="float-icon f4">🚀</span>
      <span class="float-icon f5">⚡</span>
      <span class="float-icon f6">🎯</span>
      <div class="orbit-ring ring1">
        <div class="orbit-dot"></div>
      </div>
      <div class="orbit-ring ring2">
        <div class="orbit-dot"></div>
      </div>
    </div>

    <div class="hero-content">
      <div class="hero-chip">
        <span class="chip-dot"></span>
        National Taipei University of Technology
      </div>
      <h1>
        <span class="line1">System Analysis</span>
        <span class="line2">& <span class="gradient-text">Control Lab</span></span>
      </h1>
      <p class="hero-sub">系統分析與控制實驗室</p>
      <p class="hero-desc">
        指導教授：練光祐 特聘教授<br>
        專長：音訊處理、AI、智慧家庭、IoT、生理信號量測與分析 🎯<br>
        嵌入式裝置、智慧型控制 🚀
      </p>
      <div class="hero-actions">
        <a href="research.html" class="btn btn-glow">
          <span>研究領域</span>
          <span class="btn-arrow">→</span>
        </a>
        <a href="professor.html" class="btn btn-soft">認識教授 👋</a>
      </div>

      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-num">4</div>
          <div class="stat-label">研究領域</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">20+</div>
          <div class="stat-label">年教學經驗</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">50+</div>
          <div class="stat-label">重要學經歷</div>
        </div>
      </div>
    </div>

    <div class="hero-scroll" onclick="window.location.href='research.html'">
      <div class="scroll-line"></div>
      <span>SCROLL</span>
    </div>
  </section>

  <script src="js/components.js"></script>
  <script src="js/main.js"></script>
</body>

</html>
```

- [ ] **Step 2: Manual verification**

Open `index.html` in a browser. Confirm:
- Hero section looks identical to before (same content, same styling)
- Nav appears at top (injected by components.js), "Home" is active/highlighted
- Footer appears at bottom with contact info
- All other sections (Research, Projects, etc.) are gone from this page

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "refactor: strip index.html to hero-only, update links to separate pages"
```

---

## Task 5: Update js/main.js — labPhotos array + floating photo generator

**Files:**
- Modify: `js/main.js`

Remove the scroll-based active nav detection (now handled by components.js). Add `labPhotos` array and `initFloatingPhotos()` at the top of the file.

- [ ] **Step 1: Replace the entire js/main.js with the content below**

```js
/* ======================================================
   SAC Lab — Main Script
   ====================================================== */

// ── LAB PHOTOS CONFIG ──
// Add photo paths here to show floating cards on the Home page.
// Photos should be placed in the images/lab/ folder.
// Leave empty to show no floating cards.
const labPhotos = [
  // 'images/lab/photo1.jpg',
  // 'images/lab/photo2.jpg',
  // 'images/lab/photo3.jpg',
  // 'images/lab/photo4.jpg',
];

// ── FLOATING LAB PHOTOS (Home page only) ──
function initFloatingPhotos() {
  if (labPhotos.length === 0) return;
  const heroDeco = document.querySelector('.hero-deco');
  if (!heroDeco) return;

  const positions = [
    { top: '12%', left: '4%', animationDuration: '9s', animationDelay: '0s', rotation: -6 },
    { top: '12%', right: '4%', animationDuration: '11s', animationDelay: '1.5s', rotation: 5 },
    { top: '48%', left: '2%', animationDuration: '10s', animationDelay: '3s', rotation: -4 },
    { top: '48%', right: '2%', animationDuration: '12s', animationDelay: '0.8s', rotation: 7 },
    { bottom: '18%', left: '5%', animationDuration: '8s', animationDelay: '2s', rotation: -7 },
    { bottom: '18%', right: '5%', animationDuration: '13s', animationDelay: '4s', rotation: 4 },
  ];

  const photos = labPhotos.slice(0, 6);
  photos.forEach(function (src, i) {
    const pos = positions[i];
    const card = document.createElement('div');
    card.className = 'lab-photo-float';
    card.style.animationDuration = pos.animationDuration;
    card.style.animationDelay = pos.animationDelay;
    card.style.transform = 'rotate(' + pos.rotation + 'deg)';

    // Apply positional styles
    ['top', 'right', 'bottom', 'left'].forEach(function (side) {
      if (pos[side] !== undefined) card.style[side] = pos[side];
    });

    const img = document.createElement('img');
    img.src = src;
    img.alt = '實驗室照片';
    card.appendChild(img);
    heroDeco.appendChild(card);
  });
}

initFloatingPhotos();


// ── 1. Scroll Reveal (滑動顯示動畫) ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('active'), i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});

window.addEventListener('load', () => {
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('active');
    }
  });
});


// ── 2. Navbar 滾動陰影變化 ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.style.boxShadow = window.scrollY > 50
      ? 'var(--shadow-hover)'
      : 'var(--shadow-soft)';
  }
});


// ── 3. 手機版選單切換 ──
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    if (navLinks.style.display === 'flex' && navLinks.style.flexDirection === 'column') {
      navLinks.style.display = 'none';
    } else {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '100%';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = 'var(--bg-nav)';
      navLinks.style.padding = '20px';
      navLinks.style.borderRadius = '20px';
      navLinks.style.boxShadow = 'var(--shadow-soft)';
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) navLinks.style.display = 'none';
    });
  });
}


// ── 4. 游標光暈 & 無人機游標 (物理傾斜效果) ──
const glow = document.getElementById('cursorGlow');
const drone = document.getElementById('droneCursor');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let droneX = window.innerWidth / 2;
let droneY = window.innerHeight / 2;

if (window.innerWidth > 768) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (glow) {
      glow.style.left = mouseX + 'px';
      glow.style.top = mouseY + 'px';
    }
  });

  function animateDrone() {
    const dx = mouseX - droneX;
    const dy = mouseY - droneY;
    droneX += dx * 0.18;
    droneY += dy * 0.18;
    let tilt = Math.max(Math.min(dx * 0.6, 35), -35);
    if (drone) {
      drone.style.transform = `translate(${droneX}px, ${droneY}px) translate(-50%, -50%) rotate(${tilt}deg)`;
    }
    requestAnimationFrame(animateDrone);
  }
  animateDrone();
}


// ── 5. 點擊 emoji 彈跳 (可愛互動) ──
document.querySelectorAll('.card-icon-wrap, .proj-emoji, .award-icon, .team-avatar, .nav-logo-box, .prof-avatar').forEach(el => {
  el.style.cursor = 'pointer';
  el.addEventListener('click', () => {
    el.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.2) rotate(5deg)' },
      { transform: 'scale(0.9) rotate(-5deg)' },
      { transform: 'scale(1.1) rotate(2deg)' },
      { transform: 'scale(1)' }
    ], { duration: 500, easing: 'ease-in-out' });
  });
});


// ── 6. 教授學經歷展開/收合 ──
function toggleServices() {
  const extra = document.getElementById('serviceExtra');
  const btn = document.getElementById('expandBtn');
  if (extra && btn) {
    if (extra.style.display === 'none' || extra.style.display === '') {
      extra.style.display = 'grid';
      btn.innerText = '收起學經歷 ↑';
    } else {
      extra.style.display = 'none';
      btn.innerText = '查看更多學經歷 ↓';
    }
  }
}


// ── 7. 深淺色主題切換 (Dark/Light Mode) ──
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

const savedTheme = localStorage.getItem('saclab-theme');
if (savedTheme === 'dark') {
  body.classList.add('dark-theme');
  if (themeToggle) themeToggle.innerText = '☀️';
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    themeToggle.style.animation = 'none';
    themeToggle.offsetHeight;
    themeToggle.style.animation = 'jelly 0.5s';
    if (body.classList.contains('dark-theme')) {
      themeToggle.innerText = '☀️';
      localStorage.setItem('saclab-theme', 'dark');
    } else {
      themeToggle.innerText = '🌙';
      localStorage.setItem('saclab-theme', 'light');
    }
  });
}
```

- [ ] **Step 2: Manual verification**

Open `index.html`. Confirm:
- No JS errors in browser console
- Drone cursor still follows mouse
- Theme toggle (🌙 button bottom-right) still works
- No floating photo cards visible (array is empty — correct)

To test floating photos work: temporarily uncomment one entry in `labPhotos` pointing to an existing image (e.g. `'images/professor.jpg'`), reload, confirm a frosted card appears in the hero background, then re-comment it.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: add labPhotos config array and initFloatingPhotos() to main.js"
```

---

## Task 6: Create research.html

**Files:**
- Create: `research.html`

- [ ] **Step 1: Create research.html with the content below**

```html
<!DOCTYPE html>
<html lang="zh-Hant">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Research | KY Lab · 國立臺北科技大學</title>
  <meta name="description" content="KY Lab 主要研究領域：無人機自走車、語音音訊處理、影像處理、節能優化。">
  <link rel="icon" type="image/svg+xml"
    href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>🤖</text></svg>">
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Nunito:wght@400;600;700;800&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>

<body>

  <section class="research page-section" id="research">
    <div class="section-header reveal">
      <div class="section-badge">🔬 Research Areas</div>
      <h2 class="section-title">主要研究領域</h2>
      <p class="section-desc">聚焦於無人載具、AI 音訊與影像處理，及博士班專攻之工業節能優化</p>
    </div>
    <div class="research-grid">
      <div class="research-card reveal card-hover" data-color="purple">
        <div class="card-glow"></div>
        <div class="card-icon-wrap purple">
          <span>🛸</span>
        </div>
        <h3>無人機 & 自走車</h3>
        <p>開發無人機與自走車之飛行控制、路徑規劃與自主導航系統，結合嵌入式裝置實現即時控制與智慧決策。</p>
        <div class="card-footer">
          <span class="card-tag">Drone & AGV</span>
          <span class="card-arrow">→</span>
        </div>
      </div>

      <div class="research-card reveal card-hover" data-color="orange">
        <div class="card-glow"></div>
        <div class="card-icon-wrap orange">
          <span>🎙️</span>
        </div>
        <h3>語音與音訊處理</h3>
        <p>運用深度學習與音訊處理技術，研究語音辨識、語者識別與智慧家庭環境下的語音互動系統。</p>
        <div class="card-footer">
          <span class="card-tag">Speech & Audio</span>
          <span class="card-arrow">→</span>
        </div>
      </div>

      <div class="research-card reveal card-hover" data-color="pink">
        <div class="card-glow"></div>
        <div class="card-icon-wrap pink">
          <span>📷</span>
        </div>
        <h3>影像處理</h3>
        <p>利用電腦視覺與深度學習技術，實現物件偵測、影像分類、語意分割與即時環境感知應用。</p>
        <div class="card-footer">
          <span class="card-tag">Image Processing</span>
          <span class="card-arrow">→</span>
        </div>
      </div>

      <div class="research-card reveal card-hover" data-color="cyan">
        <div class="card-glow"></div>
        <div class="card-icon-wrap cyan">
          <span>⚡</span>
        </div>
        <h3>節能優化 (冰水主機)</h3>
        <p>博士班重點研究：針對大型冰水主機 (Chiller) 與空調系統進行節能最佳化控制，結合 IoT 技術實現工業智慧能源管理。</p>
        <div class="card-footer">
          <span class="card-tag">Energy Optimization</span>
          <span class="card-arrow">→</span>
        </div>
      </div>
    </div>
  </section>

  <script src="js/components.js"></script>
  <script src="js/main.js"></script>
</body>

</html>
```

- [ ] **Step 2: Manual verification**

Open `research.html` in a browser. Confirm:
- Nav appears at top, "Research" link is highlighted as active
- All 4 research cards show with scroll-reveal animation
- Footer appears at bottom
- No other sections visible

- [ ] **Step 3: Commit**

```bash
git add research.html
git commit -m "feat: add research.html as standalone page"
```

---

## Task 7: Create projects.html

**Files:**
- Create: `projects.html`

- [ ] **Step 1: Create projects.html with the content below**

```html
<!DOCTYPE html>
<html lang="zh-Hant">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Projects | KY Lab · 國立臺北科技大學</title>
  <meta name="description" content="KY Lab 研究專案：無人載具自主導航、AI語音辨識、電腦視覺、冰水主機節能控制。">
  <link rel="icon" type="image/svg+xml"
    href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>🤖</text></svg>">
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Nunito:wght@400;600;700;800&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>

<body>

  <section class="projects page-section" id="projects">
    <div class="section-header reveal">
      <div class="section-badge">📂 Featured Projects</div>
      <h2 class="section-title">研究專案</h2>
      <p class="section-desc">展示實驗室近期的代表性研究成果</p>
    </div>
    <div class="projects-grid">
      <div class="project-card reveal card-hover">
        <div class="proj-header">
          <span class="proj-num">01</span>
          <span class="proj-emoji">🛸</span>
        </div>
        <h3>無人載具自主導航與飛控系統</h3>
        <p>開發基於 ROS/PX4 等嵌入式控制平台，整合多重感測器融合與避障演算法，實現無人機與自走車的自主移動功能。</p>
        <div class="proj-tags">
          <span>Drone</span><span>AGV</span><span>Navigation</span>
        </div>
      </div>

      <div class="project-card reveal card-hover">
        <div class="proj-header">
          <span class="proj-num">02</span>
          <span class="proj-emoji">🎙️</span>
        </div>
        <h3>AI 語音辨識與互動系統</h3>
        <p>運用深度學習模型進行高精度的語音特徵擷取與辨識，並將其應用於智慧家庭的免持語音控制介面。</p>
        <div class="proj-tags">
          <span>AI</span><span>Speech</span><span>Deep Learning</span>
        </div>
      </div>

      <div class="project-card reveal card-hover">
        <div class="proj-header">
          <span class="proj-num">03</span>
          <span class="proj-emoji">📷</span>
        </div>
        <h3>電腦視覺與即時感知系統</h3>
        <p>利用影像處理與機器學習技術，實現複雜場景下的即時物件偵測與追蹤，輔助自走車與 AI 系統的環境理解。</p>
        <div class="proj-tags">
          <span>Vision</span><span>CV</span><span>Object Detection</span>
        </div>
      </div>

      <div class="project-card reveal card-hover">
        <div class="proj-header">
          <span class="proj-num">04</span>
          <span class="proj-emoji">⚡</span>
        </div>
        <h3>冰水主機智慧節能控制系統</h3>
        <p>結合 IoT 感測器網路與先進控制演算法，動態調節大型冰水主機群的運轉負載，達成最佳化的工業節能效益。</p>
        <div class="proj-tags">
          <span>Chiller</span><span>Energy</span><span>Smart Control</span>
        </div>
      </div>
    </div>
  </section>

  <script src="js/components.js"></script>
  <script src="js/main.js"></script>
</body>

</html>
```

- [ ] **Step 2: Manual verification**

Open `projects.html`. Confirm "Projects" is active in nav and all 4 project cards render correctly.

- [ ] **Step 3: Commit**

```bash
git add projects.html
git commit -m "feat: add projects.html as standalone page"
```

---

## Task 8: Create professor.html

**Files:**
- Create: `professor.html`

- [ ] **Step 1: Create professor.html with the content below**

```html
<!DOCTYPE html>
<html lang="zh-Hant">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Professor | KY Lab · 練光祐教授</title>
  <meta name="description" content="練光祐特聘教授簡介，國立臺北科技大學電機工程系，KY Lab 指導教授。">
  <link rel="icon" type="image/svg+xml"
    href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>🤖</text></svg>">
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Nunito:wght@400;600;700;800&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>

<body>

  <section class="professor page-section" id="professor">
    <div class="section-header reveal">
      <div class="section-badge">👨‍🏫 Professor</div>
      <h2 class="section-title">指導教授</h2>
    </div>
    <div class="prof-container reveal">
      <div class="prof-card">
        <div class="prof-avatar">
          <img src="images/professor.jpg" alt="練光祐教授">
        </div>
        <div class="prof-info">
          <h3>練光祐 教授</h3>
          <p class="prof-name-en">Kuang-Yow Lian</p>
          <p class="prof-title">特聘教授 · 電機工程系</p>
          <div class="prof-details">
            <div class="prof-detail-item">
              <span class="pdi-icon">🏫</span>
              <span>電資學院 · 電機工程系</span>
            </div>
            <div class="prof-detail-item">
              <span class="pdi-icon">📍</span>
              <span>綜合科館 503 室</span>
            </div>
            <div class="prof-detail-item">
              <span class="pdi-icon">📞</span>
              <span>02-2771-2171 #2171</span>
            </div>
            <div class="prof-detail-item">
              <span class="pdi-icon">✉️</span>
              <a href="mailto:kylian@ntut.edu.tw">kylian@ntut.edu.tw</a>
            </div>
          </div>
        </div>
      </div>

      <div class="prof-expertise">
        <h4>🔬 研究專長</h4>
        <div class="expertise-tags">
          <span>音訊處理</span>
          <span>AI</span>
          <span>智慧家庭</span>
          <span>IoT</span>
          <span>生理信號量測與分析</span>
          <span>嵌入式裝置</span>
          <span>智慧型控制</span>
        </div>
      </div>

      <div class="prof-service">
        <h4>🏅 重要學經歷</h4>
        <div class="service-list">
          <div class="service-item"><span class="si-dot cyan"></span><span>國科會控制學門
              複審委員(2003~2005、2008~2011、2014~)</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>國科會控制學門
              控制理論研究規劃委員會召集人(2004年、2008年、2015年)</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>IEEE 控制系統學會台北分會 主席(2015~
              )、副主席(2005~2009)</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>IEEE CIS學會台北分會 副主席 (2009~2011)</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>Asia Journal of Control, Associate Editor
              (2008~)</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>Asian Control Conference 2009 IPC
              Member</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>International Symposium on Intelligent
              Control (ISIC) 2009 IPC Member</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>International Conference on Machine Learning
              and Cybernectics (ICMLC) 2009 IPC Member</span></div>
        </div>

        <button class="expand-btn" id="expandBtn" onclick="toggleServices()">
          查看更多學經歷 ↓
        </button>

        <div class="service-extra" id="serviceExtra">
          <div class="service-item"><span class="si-dot cyan"></span><span>CACS 2009 Best Paper Award Chair</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>SIRCon 2009 Finance Chair</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>SICE 2010 Local Arrangements Chair</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>ISSSE 2010 Local Arrangements Chair</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>FUZZ-IEEE 2011 Program Committee Member</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>FUZZ-IEEE 2011 Program Committee Member</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>中華民國自動控制學會 理事(2008~ )</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>中華民國自動控制學會 秘書長(2006~2007)</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>中華民國系統學會 理事(2011~2012 )、常務理事(2013~ )</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>國際工程與科技學會中華民國分會 (The IET Taipei Local Network) 理事(2014~ )</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>中華民國模糊學會 監事(2008~2009 )</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>台灣機器人學會 監事 (2008~2011)</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>中華工程教育學會(IEET) 認證委員 (2014~ )</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>97, 98, 100, 101, 102, 103, 104年度全國微電腦應用系統設計製作競賽評審委員</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>2014 , 2015 CACS 國際研討會論文競賽評審委員</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>2012, 2013中華民國模糊學會最佳碩博士論文評審委員</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>2009中華民國系統科學與工程研討會論文競賽評審委員</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>考選部高等考試命題委員(2006)</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>經濟部國家標準局國家標準技術委員(2006~)</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>臺北科技大學學刊編輯委員(2008~2010)</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>先進工程學刊之編輯顧問(2007~ 2008)</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>淡江大學電機系IEET認證學界代表(2008~2014)</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>義守大學電機系自評評鑑委員(2007)</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>清雲科技大學電機系自評評鑑委員(2007)</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>華梵大學電子系自評評鑑委員(2008)</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>龍華科技大學電機系自評評鑑委員(2009)</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>東南科技大學電機系自評評鑑委員(2011)</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>國立宜蘭大學電機系IEET認證學界代表(2011)</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>國立宜蘭大學電機系自評評鑑委員(2011)</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>國立宜蘭大學電機系IEET認證諮詢委員(2012, 2013)</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>國立宜蘭大學電資學院學士班自評評鑑委員(2012)</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>國立宜蘭大學電資學院碩士在職專班自評評鑑委員(2012)</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>國立宜蘭大學電資學院自評指導委員(2012)</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>財團法人國立成功大學工程科學文教基金會董事(2012~ )</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>第三十三屆電力研討會顧問(2012)</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>電機暨能源論壇雜誌創刊號主編(2012)</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>IEYI世界青少年發明展臺灣區選拔 評審委員 (2012.8.16)</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>國立臺灣海洋大學「101年海洋專業跨域課群培育計畫」評審委員 (2013.4.29)</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>2013年全國綠色能源及節能技術專題競賽 評審委員 (2013.7)</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>2013、2014 World GreenMech Contest (世界機關王競賽) 評審裁判 (2013/8/3、2014)</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>國立臺北科技大學電機系系主任 (2009年8月至2012年7月)</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>中原大學電機系系主任 (2004年8月至2007年7月)</span></div>
          <div class="service-item"><span class="si-dot orange"></span><span>中華民國自動控制學會 秘書長 (2006年~2008年)</span></div>
          <div class="service-item"><span class="si-dot pink"></span><span>IEEE 控制系統學會台北分會 副主席 (2005~2009)</span></div>
          <div class="service-item"><span class="si-dot cyan"></span><span>IEEE CIS學會台北分會 副主席 (2010~2011)</span></div>
          <div class="service-item"><span class="si-dot purple"></span><span>中原大學教職員羽球聯誼會 會長 (2005年至2006年)</span></div>
        </div>
      </div>
    </div>
  </section>

  <script src="js/components.js"></script>
  <script src="js/main.js"></script>
</body>

</html>
```

- [ ] **Step 2: Manual verification**

Open `professor.html`. Confirm "Professor" is active in nav, professor photo loads, "查看更多學經歷" expand button works.

- [ ] **Step 3: Commit**

```bash
git add professor.html
git commit -m "feat: add professor.html as standalone page"
```

---

## Task 9: Create members.html

**Files:**
- Create: `members.html`

- [ ] **Step 1: Create members.html with the content below**

```html
<!DOCTYPE html>
<html lang="zh-Hant">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Members | KY Lab · 實驗室成員</title>
  <meta name="description" content="KY Lab 實驗室成員：博士班、碩士班研究生與專題生。">
  <link rel="icon" type="image/svg+xml"
    href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>🤖</text></svg>">
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Nunito:wght@400;600;700;800&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>

<body>

  <section class="team page-section" id="team">
    <div class="section-header reveal">
      <div class="section-badge">👥 Our Team</div>
      <h2 class="section-title">實驗室成員</h2>
      <p class="section-desc">由練光祐教授帶領碩博士生組成的研究團隊</p>
    </div>
    <div class="team-grid">
      <div class="team-card reveal card-hover">
        <div class="team-avatar-wrap">
          <div class="team-avatar phd">🎓</div>
          <div class="avatar-ring"></div>
        </div>
        <h4>博士班研究生</h4>
        <p class="role">Ph.D. Student</p>
      </div>
      <div class="team-card reveal card-hover">
        <div class="team-avatar-wrap">
          <div class="team-avatar master">📚</div>
          <div class="avatar-ring"></div>
        </div>
        <h4>碩士班研究生</h4>
        <p class="role">Master's Student</p>
      </div>
      <div class="team-card reveal card-hover">
        <div class="team-avatar-wrap">
          <div class="team-avatar undergrad">💡</div>
          <div class="avatar-ring"></div>
        </div>
        <h4>專題生</h4>
        <p class="role">Undergraduate Researcher</p>
      </div>
    </div>
  </section>

  <script src="js/components.js"></script>
  <script src="js/main.js"></script>
</body>

</html>
```

- [ ] **Step 2: Manual verification**

Open `members.html`. Confirm "Members" is active in nav and 3 team cards appear with their spinning avatar rings.

- [ ] **Step 3: Commit**

```bash
git add members.html
git commit -m "feat: add members.html as standalone page"
```

---

## Task 10: Create awards.html

**Files:**
- Create: `awards.html`

- [ ] **Step 1: Create awards.html with the content below**

```html
<!DOCTYPE html>
<html lang="zh-Hant">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Awards | KY Lab · 榮譽獲獎</title>
  <meta name="description" content="KY Lab 歷年榮譽獲獎：全國智慧機器人競賽冠軍、國際無人機競賽銀獎等。">
  <link rel="icon" type="image/svg+xml"
    href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>🤖</text></svg>">
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Nunito:wght@400;600;700;800&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>

<body>

  <section class="awards page-section" id="awards">
    <div class="section-header reveal">
      <div class="section-badge">🏆 Achievements</div>
      <h2 class="section-title">榮譽與獲獎</h2>
      <p class="section-desc">實驗室歷年來的重要獲獎與成就</p>
    </div>
    <div class="awards-list">
      <div class="award-item reveal card-hover">
        <div class="award-icon gold">🥇</div>
        <div class="award-body">
          <h4>全國智慧機器人競賽 — 冠軍</h4>
          <p>自走車組別 · 教育部主辦</p>
        </div>
        <div class="award-year-badge">2025</div>
      </div>
      <div class="award-item reveal card-hover">
        <div class="award-icon silver">🥈</div>
        <div class="award-body">
          <h4>國際無人機創新應用競賽 — 銀獎</h4>
          <p>自主飛行組別 · IEEE 協辦</p>
        </div>
        <div class="award-year-badge">2024</div>
      </div>
      <div class="award-item reveal card-hover">
        <div class="award-icon star">⭐</div>
        <div class="award-body">
          <h4>科技部大專生研究計畫 — 優等</h4>
          <p>控制工程領域</p>
        </div>
        <div class="award-year-badge">2024</div>
      </div>
      <div class="award-item reveal card-hover">
        <div class="award-icon medal">🎖️</div>
        <div class="award-body">
          <h4>TDK 盃機器人競賽 — 佳作</h4>
          <p>自動化控制組</p>
        </div>
        <div class="award-year-badge">2023</div>
      </div>
    </div>
  </section>

  <script src="js/components.js"></script>
  <script src="js/main.js"></script>
</body>

</html>
```

- [ ] **Step 2: Manual verification**

Open `awards.html`. Confirm "Awards" is active in nav and all 4 award items appear with the hover lift effect.

- [ ] **Step 3: Commit**

```bash
git add awards.html
git commit -m "feat: add awards.html as standalone page"
```

---

## Task 11: Final end-to-end verification and cleanup commit

- [ ] **Step 1: Navigate the full site and verify every link**

Open `index.html`. Click each nav link in order and verify:

| Click | Lands on | Active nav item |
|-------|----------|-----------------|
| Home | index.html | Home |
| Research | research.html | Research |
| Projects | projects.html | Projects |
| Professor | professor.html | Professor |
| Members | members.html | Members |
| Awards | awards.html | Awards |
| Contact | #contact footer on current page | — |

- [ ] **Step 2: Verify hero page buttons**

On `index.html`:
- "研究領域" button → navigates to `research.html` ✓
- "認識教授 👋" button → navigates to `professor.html` ✓
- SCROLL indicator at bottom → navigates to `research.html` ✓

- [ ] **Step 3: Verify drone cursor and theme toggle on all pages**

Visit each page. Confirm:
- Drone cursor follows mouse (desktop)
- 🌙 button toggles dark mode and persists across page navigations (localStorage)

- [ ] **Step 4: Verify floating photo system**

In `js/main.js`, temporarily uncomment one photo entry using `professor.jpg` as a stand-in:

```js
const labPhotos = [
  'images/professor.jpg',
];
```

Reload `index.html`. Confirm a frosted glass card appears in the hero background, floats with animation, and is clearly behind the hero text content. Re-comment the entry and save.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete multi-page navigation with floating lab photos support"
```
