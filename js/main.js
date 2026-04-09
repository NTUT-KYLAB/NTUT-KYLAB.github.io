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
const htmlEl = document.documentElement;

// Set initial icon based on current theme (class already applied by inline head script)
if (htmlEl.classList.contains('dark-theme')) {
  if (themeToggle) themeToggle.innerText = '☀️';
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    htmlEl.classList.toggle('dark-theme');
    themeToggle.style.animation = 'none';
    themeToggle.offsetHeight;
    themeToggle.style.animation = 'jelly 0.5s';
    if (htmlEl.classList.contains('dark-theme')) {
      themeToggle.innerText = '☀️';
      localStorage.setItem('saclab-theme', 'dark');
    } else {
      themeToggle.innerText = '🌙';
      localStorage.setItem('saclab-theme', 'light');
    }
  });
}
