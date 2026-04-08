/* ======================================================
   SAC Lab — Main Script (加入深淺色主題切換)
   ====================================================== */

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

// 網頁載入時強制觸發一次，避免頂部畫面沒東西
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
  if (window.scrollY > 50) {
    navbar.style.boxShadow = "var(--shadow-hover)";
  } else {
    navbar.style.boxShadow = "var(--shadow-soft)";
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


// ── 4. Active nav link (導覽列隨滾動變色) ──
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 150) current = s.id;
  });
  navItems.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});


// ── 5. 游標光暈 ──
const glow = document.getElementById('cursorGlow');
if (glow && window.innerWidth > 768) {
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}


// ── 6. 點擊 emoji 彈跳 (可愛互動) ──
document.querySelectorAll('.card-icon-wrap, .proj-emoji, .award-icon, .team-avatar, .nav-logo-box, .prof-avatar').forEach(el => {
  el.style.cursor = 'pointer';
  el.addEventListener('click', () => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.2) rotate(5deg)' },
      { transform: 'scale(0.9) rotate(-5deg)' },
      { transform: 'scale(1.1) rotate(2deg)' },
      { transform: 'scale(1)' }
    ], { duration: 500, easing: 'ease-in-out' });
  });
});


// ── 7. 教授學術服務展開/收合 ──
function toggleServices() {
  const extra = document.getElementById('serviceExtra');
  const btn = document.getElementById('expandBtn');
  if (extra && btn) {
    if (extra.style.display === 'none' || extra.style.display === '') {
      extra.style.display = 'grid';
      btn.innerText = '收起學術服務 ↑';
    } else {
      extra.style.display = 'none';
      btn.innerText = '查看更多學術服務 ↓';
    }
  }
}

// ── 8. 深淺色主題切換 (Dark/Light Mode) ──
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// 網頁載入時，檢查使用者上次選擇的主題
const savedTheme = localStorage.getItem('saclab-theme');
if (savedTheme === 'dark') {
  body.classList.add('dark-theme');
  if (themeToggle) themeToggle.innerText = '☀️';
}

// 點擊按鈕切換主題
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');

    // 按鈕自己的彈跳特效
    themeToggle.style.animation = 'none';
    themeToggle.offsetHeight;
    themeToggle.style.animation = 'jelly 0.5s';

    // 判斷目前狀態並存入 localStorage
    if (body.classList.contains('dark-theme')) {
      themeToggle.innerText = '☀️';
      localStorage.setItem('saclab-theme', 'dark');
    } else {
      themeToggle.innerText = '🌙';
      localStorage.setItem('saclab-theme', 'light');
    }
  });
}