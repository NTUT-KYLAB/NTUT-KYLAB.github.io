# Member Profile Self-Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Firebase-backed self-editing to the KY Lab members page so each lab member can log in and update their own profile photo, nickname, bio, and custom tags.

**Architecture:** All member data moves to Firestore and is rendered dynamically. Firebase Auth handles login (Google OAuth + Email/Password). Firebase Storage holds compressed profile photos. The static GitHub Pages site calls Firebase directly from the browser via the Firebase Web SDK CDN — no build step needed.

**Tech Stack:** Firebase 10 (Auth, Firestore, Storage) via CDN ESM imports; vanilla JS; no npm or build tooling.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `js/members.js` | Create | Firebase init, Firestore card rendering, Auth, edit modal, photo compression |
| `css/members.css` | Create | Navbar login button, edit icon, login modal, edit modal, tag chips, toast |
| `members.html` | Modify | Replace static cards with `#members-grid` container; load `members.js` + `members.css` |
| `js/components.js` | Modify | Add `#nav-auth` slot to navbar |

---

### Task 1: Firebase Console Setup (manual — no code)

- [ ] **Step 1: Create Firebase project**

Go to https://console.firebase.google.com/ → "新增專案" → name it `kylab-ntut` → skip Analytics → Create.

- [ ] **Step 2: Enable Firestore**

Build → Firestore Database → Create database → Production mode → Region: `asia-east1` → Done.

- [ ] **Step 3: Enable Authentication**

Build → Authentication → Get started → Sign-in method tab:
- Enable **電子郵件/密碼** (Email/Password)
- Enable **Google** (set support email to your own)

- [ ] **Step 4: Enable Storage**

Build → Storage → Get started → Production mode → Region: `asia-east1` → Done.

- [ ] **Step 5: Register web app and copy config**

Project Settings (gear icon) → "Your apps" → `</>` (web) → Register app `kylab-ntut-web` → copy the `firebaseConfig` object. It looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "kylab-ntut.firebaseapp.com",
  projectId: "kylab-ntut",
  storageBucket: "kylab-ntut.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

- [ ] **Step 6: Add authorized domain**

Authentication → Settings → Authorized domains → Add domain: `kylab-ntut.github.io`

---

### Task 2: Update `js/components.js` — add auth slot to navbar

**Files:**
- Modify: `js/components.js`

- [ ] **Step 1: Add `#nav-auth` div just before the hamburger button**

In `js/components.js`, find this block (around line 35):

```javascript
      <button class="nav-toggle" aria-label="選單">
        <span></span><span></span><span></span>
      </button>
    </nav>
```

Replace it with:

```javascript
      <div id="nav-auth"></div>
      <button class="nav-toggle" aria-label="選單">
        <span></span><span></span><span></span>
      </button>
    </nav>
```

- [ ] **Step 2: Open members.html in browser, verify navbar renders correctly**

Expected: page looks identical to before (empty `#nav-auth` div is invisible). No console errors.

- [ ] **Step 3: Commit**

```bash
git add js/components.js
git commit -m "feat: add #nav-auth slot to navbar for auth UI"
```

---

### Task 3: Create `css/members.css`

**Files:**
- Create: `css/members.css`

- [ ] **Step 1: Create the file**

```css
/* ── Nav auth UI ── */
.nav-login-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  background: var(--color-cyan);
  color: #fff;
  border: none;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.nav-login-btn:hover { opacity: 0.85; }

.nav-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}
.nav-user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-cyan);
}
.nav-logout-btn {
  padding: 4px 12px;
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: 99px;
  font-size: 0.78rem;
  cursor: pointer;
  color: var(--text-muted);
  transition: background 0.2s;
}
.nav-logout-btn:hover { background: var(--bg-card); }

/* ── Edit button on card ── */
.edit-profile-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-cyan);
  color: #fff;
  border: none;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}
.team-card.member-card { position: relative; }
.team-card.member-card:hover .edit-profile-btn { opacity: 1; }

/* ── Modal overlay ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.modal-overlay.hidden { display: none; }

/* ── Modal box ── */
.modal-box {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}
.modal-header h3 { font-size: 1.1rem; font-weight: 700; }
.modal-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-main);
  border: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-body { padding: 20px 24px; }
.modal-footer {
  padding: 0 24px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* ── Form fields ── */
.modal-field { margin-bottom: 18px; }
.modal-field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.modal-field input,
.modal-field textarea {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  font-size: 0.9rem;
  color: var(--text-main);
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}
.modal-field input:focus,
.modal-field textarea:focus {
  outline: none;
  border-color: var(--color-cyan);
}
.char-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: right;
  margin-top: 4px;
}
.char-count.over { color: #f56565; }

/* ── Avatar preview ── */
.avatar-preview-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}
.avatar-preview {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-light);
  background: var(--bg-main);
}
.upload-btn {
  padding: 8px 16px;
  background: var(--bg-main);
  border: 1px dashed var(--color-cyan);
  border-radius: 10px;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--color-cyan);
  font-weight: 600;
  transition: background 0.2s;
}
.upload-btn:hover { background: var(--bg-card); }
.upload-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }

/* ── Tag chips ── */
.tag-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  min-height: 44px;
  align-items: center;
}
.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: var(--bg-card);
  border: 1px solid var(--color-cyan);
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-cyan);
}
.tag-chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 13px;
  padding: 0;
  line-height: 1;
}
.tag-input {
  border: none;
  background: transparent;
  font-size: 0.85rem;
  color: var(--text-main);
  font-family: inherit;
  min-width: 80px;
  outline: none;
  flex: 1;
}
.tag-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }

/* ── Buttons ── */
.btn-primary {
  padding: 10px 24px;
  background: var(--color-cyan);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.85; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--text-muted);
}

/* ── Google login button ── */
.login-google-btn {
  width: 100%;
  padding: 12px;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background 0.2s;
  color: var(--text-main);
}
.login-google-btn:hover { background: var(--bg-card); }
.login-divider {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
  margin: 16px 0;
  position: relative;
}
.login-divider::before, .login-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 42%;
  height: 1px;
  background: var(--border-light);
}
.login-divider::before { left: 0; }
.login-divider::after { right: 0; }

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(80px);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 0.9rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  z-index: 2000;
  transition: transform 0.3s ease;
  white-space: nowrap;
}
.toast.show { transform: translateX(-50%) translateY(0); }
.toast.error { border-color: #fc8181; color: #fc8181; }
.toast.success { border-color: var(--color-cyan); color: var(--color-cyan); }
```

- [ ] **Step 2: Commit**

```bash
git add css/members.css
git commit -m "feat: add CSS for auth UI, modals, tag chips, and toast"
```

---

### Task 4: Create `js/members.js` — Firebase init and card rendering

**Files:**
- Create: `js/members.js`

- [ ] **Step 1: Create the file with Firebase imports, config, state, and card rendering**

Replace `REPLACE_ME` values with your actual Firebase config from Task 1 Step 5.

```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

// ── FIREBASE CONFIG — replace with values from Firebase Console ──
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// ── STATE ──
let currentMemberId = null;
let currentMemberData = null;
let pendingPhotoBlob = null;
let editTags = [];

// ── CARD RENDERING ──

const YEAR_LABELS = {
  '碩一': "📚 Master's Year 1 · 碩一",
  '碩二': "📖 Master's Year 2 · 碩二",
  '博士班': "🎓 Ph.D. Students · 博士班",
};

function buildCardHTML(m, docId) {
  const hasPhoto = !!m.photoURL;
  const avatarContent = hasPhoto
    ? `<img src="${m.photoURL}" alt="${m.name}" onerror="this.parentElement.innerHTML='${m.placeholderEmoji || '🎓'}';">`
    : (m.placeholderEmoji || '🎓');

  const nicknameHTML = m.nickname ? `<p class="member-nickname">${m.nickname}</p>` : '';
  const customTagsHTML = (m.customTags || []).map(t => `<span class="research-tag">${t}</span>`).join('');
  const bioHTML = m.bio ? `<p class="member-bio">${m.bio}</p>` : '';

  return `
    <div class="team-card member-card reveal card-hover" data-member-id="${docId}">
      <div class="team-avatar-wrap">
        <div class="team-avatar avatar-placeholder">${avatarContent}</div>
        <div class="avatar-ring ${m.avatarColor || 'cyan'}"></div>
      </div>
      <h4>${m.name}</h4>
      ${nicknameHTML}
      <p class="role">${m.role}</p>
      <span class="research-tag">${m.researchTag}</span>
      ${customTagsHTML}
      ${bioHTML}
    </div>
  `;
}

function renderMembers(members) {
  const grid = document.getElementById('members-grid');
  if (!grid) return;

  // Group by year preserving order
  const groups = {};
  const yearOrder = [];
  for (const { data, id } of members) {
    if (!groups[data.year]) { groups[data.year] = []; yearOrder.push(data.year); }
    groups[data.year].push({ data, id });
  }

  let html = '';
  for (const year of yearOrder) {
    html += `
      <div class="member-group-header reveal">
        <span class="group-badge">${YEAR_LABELS[year] || year}</span>
      </div>
      <div class="team-grid member-grid">
        ${groups[year].map(({ data, id }) => buildCardHTML(data, id)).join('')}
      </div>
    `;
  }
  grid.innerHTML = html;
  initRevealAnimation();
}

async function loadMembers() {
  const q = query(collection(db, 'members'), orderBy('order'));
  const snap = await getDocs(q);
  const members = snap.docs.map(d => ({ id: d.id, data: d.data() }));
  renderMembers(members);
  // If already logged in when page loads, re-apply edit button after cards render
  if (currentMemberId) addEditButton(currentMemberId);
}

function initRevealAnimation() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

// ── TOAST ──

let toastTimer = null;

function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── AUTH UI ──

function updateNavAuth(user) {
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;

  if (!user) {
    navAuth.innerHTML = `<button class="nav-login-btn" id="login-btn">🔑 登入</button>`;
    document.getElementById('login-btn').addEventListener('click', openLoginModal);
    document.querySelectorAll('.edit-profile-btn').forEach(b => b.remove());
    return;
  }
  const avatarHTML = currentMemberData?.photoURL
    ? `<img src="${currentMemberData.photoURL}" class="nav-user-avatar" alt="avatar" onerror="this.style.display='none'">`
    : '';
  navAuth.innerHTML = `
    <div class="nav-user">
      ${avatarHTML}
      <span>${currentMemberData?.nickname || currentMemberData?.name || user.email}</span>
      <button class="nav-logout-btn" id="logout-btn">登出</button>
    </div>
  `;
  document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));
  if (currentMemberId) addEditButton(currentMemberId);
}

function addEditButton(memberId) {
  const card = document.querySelector(`[data-member-id="${memberId}"]`);
  if (!card || card.querySelector('.edit-profile-btn')) return;
  const btn = document.createElement('button');
  btn.className = 'edit-profile-btn';
  btn.title = '編輯個人資料';
  btn.textContent = '✏️';
  btn.addEventListener('click', () => openEditModal(memberId));
  card.appendChild(btn);
}

// ── AUTH STATE ──

async function lookupMember(email) {
  const q = query(collection(db, 'members'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, data: snap.docs[0].data() };
}

function initAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const result = await lookupMember(user.email);
      if (!result) {
        showToast(`此帳號（${user.email}）不在實驗室成員名單中，請聯絡管理員。`, 'error');
        await signOut(auth);
        return;
      }
      currentMemberId = result.id;
      currentMemberData = result.data;
    } else {
      currentMemberId = null;
      currentMemberData = null;
    }
    updateNavAuth(user);
  });
}

// ── LOGIN MODAL ──

function openLoginModal() {
  document.getElementById('login-modal').classList.remove('hidden');
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('login-email-input').value = '';
  document.getElementById('login-password-input').value = '';
  document.getElementById('login-error').textContent = '';
}

async function handleGoogleLogin() {
  try {
    await signInWithPopup(auth, googleProvider);
    closeLoginModal();
  } catch (err) {
    document.getElementById('login-error').textContent = '登入失敗：' + err.message;
  }
}

async function handleEmailLogin() {
  const email = document.getElementById('login-email-input').value.trim();
  const password = document.getElementById('login-password-input').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeLoginModal();
  } catch (err) {
    const msgs = {
      'auth/user-not-found': '找不到此帳號',
      'auth/wrong-password': '密碼錯誤',
      'auth/invalid-email': 'Email 格式不正確',
      'auth/invalid-credential': '帳號或密碼錯誤',
    };
    errEl.textContent = msgs[err.code] || '登入失敗：' + err.message;
  }
}

// ── PHOTO COMPRESSION ──

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const MAX_PX = 1200;
    const QUALITY = 0.85;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_PX || height > MAX_PX) {
        if (width > height) { height = Math.round(height * MAX_PX / width); width = MAX_PX; }
        else { width = Math.round(width * MAX_PX / height); height = MAX_PX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Compression failed')), 'image/jpeg', QUALITY);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── TAG INPUT ──

function renderEditTags() {
  const wrap = document.getElementById('edit-tags-wrap');
  if (!wrap) return;
  wrap.querySelectorAll('.tag-chip').forEach(c => c.remove());
  const input = wrap.querySelector('.tag-input');
  editTags.forEach((tag, i) => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `${tag} <button class="tag-chip-remove" data-index="${i}" aria-label="移除">×</button>`;
    wrap.insertBefore(chip, input);
  });
  wrap.querySelectorAll('.tag-chip-remove').forEach(btn => {
    btn.addEventListener('click', () => { editTags.splice(Number(btn.dataset.index), 1); renderEditTags(); });
  });
}

function setupTagInput() {
  const input = document.querySelector('.tag-input');
  if (!input) return;
  // Remove previous listener by replacing the element
  const clone = input.cloneNode(true);
  input.parentNode.replaceChild(clone, input);
  clone.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const val = clone.value.trim().slice(0, 10);
    if (!val || editTags.length >= 5 || editTags.includes(val)) return;
    editTags.push(val);
    clone.value = '';
    renderEditTags();
  });
}

// ── EDIT MODAL ──

function updateCharCount(inputId, countId, max) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(countId);
  if (!input || !counter) return;
  const update = () => {
    const len = input.value.length;
    counter.textContent = `${len} / ${max}`;
    counter.classList.toggle('over', len > max);
  };
  input.addEventListener('input', update);
  update();
}

function openEditModal(memberId) {
  const m = currentMemberData;
  if (!m) return;

  const preview = document.getElementById('edit-photo-preview');
  if (m.photoURL) { preview.src = m.photoURL; preview.style.display = 'block'; }
  else { preview.src = ''; preview.style.display = 'none'; }

  document.getElementById('edit-nickname-input').value = m.nickname || '';
  document.getElementById('edit-bio-input').value = m.bio || '';
  updateCharCount('edit-bio-input', 'bio-char-count', 200);
  updateCharCount('edit-nickname-input', 'nickname-char-count', 30);

  editTags = [...(m.customTags || [])];
  renderEditTags();
  setupTagInput();
  pendingPhotoBlob = null;

  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  pendingPhotoBlob = null;
}

async function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 20 * 1024 * 1024) { showToast('檔案超過 20MB 限制', 'error'); return; }
  try {
    pendingPhotoBlob = await compressImage(file);
    const preview = document.getElementById('edit-photo-preview');
    preview.src = URL.createObjectURL(pendingPhotoBlob);
    preview.style.display = 'block';
  } catch { showToast('圖片處理失敗，請重試', 'error'); }
}

async function saveProfile() {
  const saveBtn = document.getElementById('save-profile-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = '儲存中…';

  try {
    const nickname = document.getElementById('edit-nickname-input').value.trim().slice(0, 30);
    const bio = document.getElementById('edit-bio-input').value.trim().slice(0, 200);
    if (editTags.length > 5) { showToast('標籤最多 5 個', 'error'); return; }

    const updates = { nickname, bio, customTags: editTags };

    if (pendingPhotoBlob) {
      const storageRef = ref(storage, `members/${currentMemberId}/avatar.jpg`);
      await uploadBytes(storageRef, pendingPhotoBlob, { contentType: 'image/jpeg' });
      updates.photoURL = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, 'members', currentMemberId), updates);
    currentMemberData = { ...currentMemberData, ...updates };

    // Re-render just this card in the DOM
    const card = document.querySelector(`[data-member-id="${currentMemberId}"]`);
    if (card) {
      const editBtn = card.querySelector('.edit-profile-btn');
      card.outerHTML = buildCardHTML(currentMemberData, currentMemberId);
      // Re-query since outerHTML replacement creates a new element
      const newCard = document.querySelector(`[data-member-id="${currentMemberId}"]`);
      if (newCard && editBtn) newCard.appendChild(editBtn);
    }
    updateNavAuth(auth.currentUser);
    closeEditModal();
    showToast('已儲存！', 'success');
  } catch (err) {
    showToast('儲存失敗：' + err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '儲存';
  }
}

// ── MODAL HTML INJECTION ──

function injectModals() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay hidden" id="login-modal">
      <div class="modal-box">
        <div class="modal-header">
          <h3>登入</h3>
          <button class="modal-close-btn" id="login-close-btn">✕</button>
        </div>
        <div class="modal-body">
          <button class="login-google-btn" id="google-login-btn">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            使用 Google 帳號登入
          </button>
          <div class="login-divider">或</div>
          <div class="modal-field">
            <label>Email</label>
            <input type="email" id="login-email-input" placeholder="your@email.com">
          </div>
          <div class="modal-field">
            <label>密碼</label>
            <input type="password" id="login-password-input" placeholder="••••••••">
          </div>
          <p id="login-error" style="color:#fc8181;font-size:0.85rem;margin-top:8px;min-height:20px;"></p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="login-cancel-btn">取消</button>
          <button class="btn-primary" id="email-login-btn">登入</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay hidden" id="edit-modal">
      <div class="modal-box">
        <div class="modal-header">
          <h3>編輯個人資料</h3>
          <button class="modal-close-btn" id="edit-close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-field">
            <label>頭貼</label>
            <div class="avatar-preview-wrap">
              <img id="edit-photo-preview" class="avatar-preview" src="" alt="預覽" style="display:none">
              <div>
                <button class="upload-btn" id="upload-photo-btn">📷 上傳照片</button>
                <input type="file" id="photo-file-input" accept="image/jpeg,image/png,image/webp" style="display:none">
                <p class="upload-hint">JPG / PNG / WEBP，最大 20MB</p>
              </div>
            </div>
          </div>
          <div class="modal-field">
            <label>暱稱</label>
            <input type="text" id="edit-nickname-input" placeholder="英文暱稱（選填）" maxlength="30">
            <p class="char-count" id="nickname-char-count">0 / 30</p>
          </div>
          <div class="modal-field">
            <label>自我介紹</label>
            <textarea id="edit-bio-input" rows="3" placeholder="寫點什麼…" maxlength="200"></textarea>
            <p class="char-count" id="bio-char-count">0 / 200</p>
          </div>
          <div class="modal-field">
            <label>自定標籤（最多 5 個，Enter 新增）</label>
            <div class="tag-chips-wrap" id="edit-tags-wrap">
              <input type="text" class="tag-input" placeholder="輸入後按 Enter" maxlength="10">
            </div>
            <p class="tag-hint">每個標籤最多 10 字</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="edit-cancel-btn">取消</button>
          <button class="btn-primary" id="save-profile-btn">儲存</button>
        </div>
      </div>
    </div>
  `);

  document.getElementById('login-close-btn').addEventListener('click', closeLoginModal);
  document.getElementById('login-cancel-btn').addEventListener('click', closeLoginModal);
  document.getElementById('google-login-btn').addEventListener('click', handleGoogleLogin);
  document.getElementById('email-login-btn').addEventListener('click', handleEmailLogin);
  document.getElementById('login-password-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleEmailLogin(); });
  document.getElementById('login-modal').addEventListener('click', e => { if (e.target.id === 'login-modal') closeLoginModal(); });

  document.getElementById('edit-close-btn').addEventListener('click', closeEditModal);
  document.getElementById('edit-cancel-btn').addEventListener('click', closeEditModal);
  document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
  document.getElementById('upload-photo-btn').addEventListener('click', () => document.getElementById('photo-file-input').click());
  document.getElementById('photo-file-input').addEventListener('change', handlePhotoSelect);
  document.getElementById('edit-modal').addEventListener('click', e => { if (e.target.id === 'edit-modal') closeEditModal(); });
}

// ── INIT ──

document.addEventListener('DOMContentLoaded', () => {
  injectModals();
  initAuth();
  loadMembers();
});
```

- [ ] **Step 2: Commit**

```bash
git add js/members.js
git commit -m "feat: add members.js with Firebase, card rendering, auth, and edit modal"
```

---

### Task 5: Update `members.html`

**Files:**
- Modify: `members.html`

- [ ] **Step 1: Replace the entire file content**

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
  <meta name="google-site-verification" content="RQ12fc-hOMq_x1yrjFCUHl7oK_w1Fe56xZftTjvMvw4" />
  <link rel="canonical" href="https://kylab-ntut.github.io/members.html">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/members.css">
  <style>
    .member-group-header {
      margin: 50px 0 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .member-group-header::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border-light);
      border-top: 1px dashed var(--color-cyan);
      opacity: 0.5;
    }
    .group-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 99px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
      box-shadow: var(--shadow-soft);
    }
    .team-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .team-avatar.avatar-placeholder { border: 2px dashed var(--color-purple); background: var(--bg-main); font-size: 38px; }
    .avatar-ring.cyan   { border-color: var(--color-cyan); }
    .avatar-ring.purple { border-color: var(--color-purple); }
    .avatar-ring.orange { border-color: var(--color-orange); }
    .avatar-ring.pink   { border-color: var(--color-pink); }
    .member-bio {
      margin-top: 12px;
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.6;
      text-align: left;
      padding: 10px 14px;
      background: var(--bg-main);
      border-radius: 12px;
      border-left: 3px solid var(--color-cyan);
    }
    body.dark-theme .member-bio { border-left-color: var(--color-purple); }
    .member-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
    .team-card.member-card { padding: 32px 20px 24px; }
    .research-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      padding: 3px 10px;
      background: var(--bg-main);
      border: 1px solid var(--border-light);
      border-radius: 99px;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .member-nickname { font-size: 0.78rem; opacity: 0.55; margin: 2px 0 0; }
    #members-grid { width: 100%; }
  </style>
  <script>try { if (localStorage.getItem('saclab-theme') === 'dark') document.documentElement.classList.add('dark-theme'); } catch (e) { }</script>
</head>

<body>

  <section class="team page-section" id="team">
    <div class="section-header reveal">
      <div class="section-badge">👥 Our Team</div>
      <h2 class="section-title">實驗室成員</h2>
      <p class="section-desc">由練光祐教授帶領碩博士生組成的研究團隊</p>
    </div>
    <div id="members-grid">
      <!-- Cards rendered dynamically by js/members.js -->
    </div>
  </section>

  <script src="js/components.js"></script>
  <script src="js/main.js"></script>
  <script type="module" src="js/members.js"></script>
</body>

</html>
```

- [ ] **Step 2: Open page via local server and verify cards load**

Run a local server: `python -m http.server 8080` (or use VS Code Live Server).
Open http://localhost:8080/members.html.

Expected: All member cards load from Firestore with correct grouping (碩一 / 碩二 / 博士班). No console errors.

- [ ] **Step 3: Commit**

```bash
git add members.html
git commit -m "feat: replace static member HTML with dynamic Firestore rendering"
```

---

### Task 6: Seed Firestore with member data

**Files:** none — manual steps in Firebase Console

- [ ] **Step 1: Collect all member emails**

Ask each member for the email they'll use to log in (their Google account email, or set one for email/password login). Fill these in below before entering Firestore.

- [ ] **Step 2: Add Firestore documents**

Firebase Console → Firestore → `members` collection → Add document for each member below.

**碩一 (order 1–7):**

| Document ID | name | nickname | role | year | researchTag | bio | photoURL | placeholderEmoji | email | avatarColor | order | customTags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `linpinwen` | 林品雯 | (empty) | 碩士生 · Master's Student | 碩一 | 🚁 無人機 | 大家好，我喜歡出去玩還有吃大餐，都可以揪我，請大家多多指教。 | images/members/linpinwen.jpg | 🎓 | *ask member* | cyan | 1 | (array, empty) |
| `melvin` | 郭傲羲 | Melvin | 碩士生 · Master's Student | 碩一 | 🚁 無人機 | 喲！我是呱西～ 對拍照、收集小車車、還有對電腦有興趣的可以來交流 OUOb | images/members/melvin.jpg | 🎓 | melvin0kuo@gmail.com | cyan | 2 | (array, empty) |
| `liangyinglee` | 李亮穎 | (empty) | 碩士生 · Master's Student | 碩一 | 🚁 無人機 | 哈囉，我喜歡看nba比賽，也喜歡益智桌遊可以找我一起看或者玩ㄛ～ | (empty) | 🚁 | *ask member* | purple | 3 | (array, empty) |
| `jamie` | 余依庭 | Jamie | 碩士生 · Master's Student | 碩一 | 🚢 無人船 | 嗨嗨！如果有人想跳傘可以揪我，逛酒展也可以 我會到！！！如果有玩石頭也可以交流交流哈哈哈 | (empty) | 🤿 | *ask member* | purple | 4 | (array, empty) |
| `chiukailen` | 邱凱稜 | (empty) | 碩士生 · Master's Student | 碩一 | 🚢 無人船 | 哈囉！我喜歡可愛的東西還有美食✨有時候很E有時候很I歡迎加入我們🫶🏻 | images/members/chiukailen.jpg | 🎓 | *ask member* | purple | 5 | (array, empty) |
| `fanyahan` | 范雅涵 | (empty) | 碩士生 · Master's Student | 碩一 | 🚗 自走車 | 嗨伊！我喜歡打籃球也喜歡看籃球比賽！追趕跑跳碰的運動都歡迎找我一起玩😍 | (empty) | 🚗 | *ask member* | orange | 6 | (array, empty) |
| `lihuixin` | 李慧芯 | (empty) | 碩士生 · Master's Student | 碩一 | 🎙️ 音訊 LLM | 喲！要出去玩可以找我，我不一定會到，但我會認真考慮一下的！ | (empty) | 🐒 | *ask member* | pink | 7 | (array, empty) |

**碩二 (order 8–16):**

| Document ID | name | nickname | role | year | researchTag | bio | photoURL | placeholderEmoji | email | avatarColor | order | customTags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `chenjing` | 陳靖 | (empty) | 碩士生 · Master's Student | 碩二 | 🚗 自走車 | 打麻將 唱歌 買盲盒扭蛋的時候記得叫我 目標是每個人桌上都要有一隻我的公仔 | images/members/chenjing.jpg | 🎓 | *ask* | cyan | 8 | (array, empty) |
| `liaojunyi` | 廖俊羿 | (empty) | 碩士生 · Master's Student | 碩二 | 🚁 無人機 | (empty) | images/members/liaojunyi.jpg | 🎓 | *ask* | purple | 9 | (array, empty) |
| `chenyang` | 陳揚 | (empty) | 碩士生 · Master's Student | 碩二 | 🎙️ 音訊 LLM | (empty) | images/members/chenyang.jpg | 🎓 | *ask* | orange | 10 | (array, empty) |
| `chenyoujun` | 陳宥均 | (empty) | 碩士生 · Master's Student | 碩二 | 🚗 自走車 | (empty) | (empty) | 🎓 | *ask* | pink | 11 | (array, empty) |
| `ouyangxin` | 歐陽馨 | (empty) | 碩士生 · Master's Student | 碩二 | 🚁 無人機 | (empty) | (empty) | 🎓 | *ask* | cyan | 12 | (array, empty) |
| `suqinbang` | 蘇沁邦 | (empty) | 碩士生 · Master's Student | 碩二 | 🚁 無人機 | (empty) | images/members/suqinbang.jpg | 🎓 | *ask* | purple | 13 | (array, empty) |
| `luoxinqi` | 羅欣綺 | (empty) | 碩士生 · Master's Student | 碩二 | 🚁 無人機 | (empty) | (empty) | 🎓 | *ask* | orange | 14 | (array, empty) |
| `liuziling` | 劉姿伶 | (empty) | 碩士生 · Master's Student | 碩二 | 🚁 無人機 | (empty) | (empty) | 🎓 | *ask* | pink | 15 | (array, empty) |
| `xieweirui` | 謝緯睿 | (empty) | 碩士生 · Master's Student | 碩二 | 🎙️ 音訊 LLM | (empty) | (empty) | 🎓 | *ask* | cyan | 16 | (array, empty) |

**博士班 (order 17):**

| Document ID | name | nickname | role | year | researchTag | bio | photoURL | placeholderEmoji | email | avatarColor | order | customTags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `phd1` | 博士班研究生 | (empty) | Ph.D. Student | 博士班 | ⚡ 節能優化 | (empty) | (empty) | 🎓 | *ask* | cyan | 17 | (array, empty) |

- [ ] **Step 3: Create Firebase Auth accounts for email/password members**

Authentication → Users → Add user → enter email + a temporary password → Save.
Then send each member a password reset email: select user → "Send password reset email".
They click the link, set their own password, done.

---

### Task 7: Deploy Security Rules

**Files:** none — Firebase Console

- [ ] **Step 1: Set Firestore rules**

Firebase Console → Firestore → Rules → Replace entire content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /members/{memberId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email == resource.data.email
        && request.resource.data.name == resource.data.name
        && request.resource.data.role == resource.data.role
        && request.resource.data.year == resource.data.year
        && request.resource.data.researchTag == resource.data.researchTag
        && request.resource.data.email == resource.data.email
        && request.resource.data.avatarColor == resource.data.avatarColor
        && request.resource.data.order == resource.data.order;
    }
  }
}
```

Click "Publish".

- [ ] **Step 2: Set Storage rules**

Firebase Console → Storage → Rules → Replace entire content with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /members/{memberId}/avatar.jpg {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 20 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

Click "Publish".

- [ ] **Step 3: End-to-end test checklist**

Open http://localhost:8080/members.html:

1. All 17 cards load, grouped 碩一 / 碩二 / 博士班
2. "🔑 登入" button appears in navbar
3. Click → login modal appears with Google button + email/password form
4. Log in with Google → modal closes → nav shows avatar + name
5. Own card shows ✏️ icon on hover
6. Click ✏️ → edit modal opens with current data pre-filled
7. Change bio → 儲存 → card updates immediately, toast says 已儲存
8. Upload a photo (under 20MB) → preview appears → 儲存 → card shows new photo
9. Add a custom tag → Enter → chip appears → 儲存 → card shows tag
10. Try to add 6th tag → blocked (nothing happens)
11. Log out → ✏️ disappears
12. Log in with an email not in Firestore → error toast → auto sign-out

- [ ] **Step 4: Push to main**

```bash
git add members.html js/members.js css/members.css js/components.js
git push origin main
```

Wait ~2 minutes, verify on https://kylab-ntut.github.io/members.html.

---

## Spec Coverage Check

| Spec requirement | Covered by |
|---|---|
| Firebase Auth — Email/Password + Google | Tasks 1, 4 |
| Login button right side of navbar | Tasks 2, 4 |
| Email → member lookup | Task 4 (`lookupMember`) |
| Unknown email → error toast + auto signout | Task 4 (`handleUnknownUser`) |
| ✏️ on own card only | Task 4 (`addEditButton`) |
| Edit: photo (20MB, compress 1200px/0.85) | Task 4 (`compressImage`, `handlePhotoSelect`) |
| Edit: nickname (max 30 chars) | Task 4 (`openEditModal`, `saveProfile`) |
| Edit: bio (max 200 chars) | Task 4 (`openEditModal`, `saveProfile`) |
| Edit: custom tags (max 5, max 10 chars each) | Task 4 (`renderEditTags`, `setupTagInput`) |
| Save spinner + immediate card re-render | Task 4 (`saveProfile`) |
| Firestore security rules (admin fields immutable) | Task 7 |
| Storage security rules | Task 7 |
| Dynamic card rendering from Firestore | Task 4 (`loadMembers`, `renderMembers`) |
| All 17 members seeded | Task 6 |
| members.html cleaned up | Task 5 |
