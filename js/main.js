/* ======================================================
   SAC Lab — Main Script (科技可愛版)
   ====================================================== */

// ── Scroll Reveal ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// ── Navbar 滾動 ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});


// ── 手機選單 ──
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle) {
  toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}


// ── Active nav link ──
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


// ── 游標光暈 ──
const glow = document.getElementById('cursorGlow');
if (glow && window.innerWidth > 768) {
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}


// ── 粒子背景 ──
const particleContainer = document.getElementById('particles');
if (particleContainer && window.innerWidth > 768) {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    const colors = ['#5eead4', '#c084fc', '#fb923c', '#f472b6'];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    particleContainer.appendChild(p);
  }
}


// ── 點擊 emoji 彈跳 ──
document.querySelectorAll('.card-icon-wrap, .proj-emoji, .award-icon, .team-avatar, .nav-logo-box').forEach(el => {
  el.style.cursor = 'pointer';
  el.addEventListener('click', () => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'jelly 0.5s';
  });
});
