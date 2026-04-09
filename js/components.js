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
