import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyBVc5KJl_ZRwriC56yvQsCsQ7NEOXxkvIQ",
  authDomain: "kylab-ntut.firebaseapp.com",
  projectId: "kylab-ntut",
  storageBucket: "kylab-ntut.firebasestorage.app",
  messagingSenderId: "556294864349",
  appId: "1:556294864349:web:2653f4e64e0b846da04a34"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

const ADMIN_EMAIL = 'melvin0kuo@gmail.com';

// ── STATE ──
let currentMemberId = null;
let currentMemberData = null;
let allMembersMap = {};       // id → data (full cache)
let editingMemberId = null;   // which card is open in modal
let pendingPhotoBlob = null;
let editTags = [];

// ── HELPERS ──

function isAdmin() {
  return currentMemberData?.email === ADMIN_EMAIL;
}

// ── CARD RENDERING ──

const YEAR_LABELS = {
  '碩一': "📚 Master's Year 1 · 碩一",
  '碩二': "📖 Master's Year 2 · 碩二",
  '博士班': "🎓 Ph.D. Students · 博士班",
};

function buildCardHTML(m, docId) {
  const rawURL = m.photoURL || '';
  const photoURL = rawURL && !rawURL.startsWith('http') ? '/' + rawURL : rawURL;
  const hasPhoto = !!photoURL;
  const fallback = m.placeholderEmoji || '🎓';
  const avatarContent = hasPhoto
    ? `<img src="${photoURL}" alt="${m.name}" onerror="this.parentElement.innerHTML='${fallback}';">`
    : fallback;

  const nicknameHTML = m.nickname ? `<p class="member-nickname">${m.nickname}</p>` : '';
  const customTagsHTML = (m.customTags || []).map(t => `<span class="research-tag">${t}</span>`).join('');
  const bioHTML = m.bio ? `<p class="member-bio">${m.bio}</p>` : '';

  return `
    <div class="team-card member-card reveal active card-hover" data-member-id="${docId}">
      <div class="team-avatar-wrap"${docId === 'melvin' ? ' id="melvin-avatar-wrap"' : ''}>
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

  allMembersMap = {};
  const groups = {};
  const yearOrder = [];
  for (const { data, id } of members) {
    allMembersMap[id] = data;
    if (!groups[data.year]) { groups[data.year] = []; yearOrder.push(data.year); }
    groups[data.year].push({ data, id });
  }

  let html = '';
  for (const year of yearOrder) {
    html += `
      <div class="member-group-header reveal active">
        <span class="group-badge">${YEAR_LABELS[year] || year}</span>
      </div>
      <div class="team-grid member-grid">
        ${groups[year].map(({ data, id }) => buildCardHTML(data, id)).join('')}
      </div>
    `;
  }
  grid.innerHTML = html;
}

async function loadMembers() {
  try {
    const snap = await getDocs(collection(db, 'members'));
    const members = snap.docs
      .map(d => ({ id: d.id, data: d.data() }))
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
    renderMembers(members);
    addEditButtonsForCurrentUser();
  } catch (err) {
    console.error('loadMembers failed:', err);
    const grid = document.getElementById('members-grid');
    if (grid) grid.innerHTML = `<p style="padding:40px;color:var(--text-muted)">載入失敗：${err.message}</p>`;
  }
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

function addEditButtonsForCurrentUser() {
  if (!currentMemberId) return;
  if (isAdmin()) {
    Object.keys(allMembersMap).forEach(id => addEditButton(id));
  } else {
    addEditButton(currentMemberId);
  }
}

function updateNavAuth(user) {
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;

  if (!user) {
    navAuth.innerHTML = `<button class="nav-login-btn" id="login-btn">🔑 登入</button>`;
    document.getElementById('login-btn').addEventListener('click', openLoginModal);
    document.querySelectorAll('.edit-profile-btn').forEach(b => b.remove());
    return;
  }

  const rawNavPhoto = currentMemberData?.photoURL || '';
  const navPhotoURL = rawNavPhoto && !rawNavPhoto.startsWith('http') ? '/' + rawNavPhoto : rawNavPhoto;
  const avatarHTML = navPhotoURL
    ? `<img src="${navPhotoURL}" class="nav-user-avatar" alt="avatar" onerror="this.style.display='none'">`
    : '';
  const label = isAdmin()
    ? `${currentMemberData?.nickname || currentMemberData?.name || user.email} 👑`
    : (currentMemberData?.nickname || currentMemberData?.name || user.email);
  navAuth.innerHTML = `
    <div class="nav-user">
      ${avatarHTML}
      <span>${label}</span>
      <button class="nav-logout-btn" id="logout-btn">登出</button>
    </div>
  `;
  document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));
  addEditButtonsForCurrentUser();
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
    const errEl = document.getElementById('login-error');
    if (err.message?.includes('disallowed_useragent') || err.code === 'auth/operation-not-supported-in-this-environment') {
      errEl.textContent = '此瀏覽器不支援 Google 登入，請複製網址到 Chrome 或 Safari 開啟後再試';
    } else {
      errEl.textContent = '登入失敗：' + err.message;
    }
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
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg', QUALITY
      );
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
    btn.addEventListener('click', () => {
      editTags.splice(Number(btn.dataset.index), 1);
      renderEditTags();
    });
  });
}

function setupTagInput() {
  const wrap = document.getElementById('edit-tags-wrap');
  if (!wrap) return;
  const old = wrap.querySelector('.tag-input');
  const fresh = old.cloneNode(true);
  old.parentNode.replaceChild(fresh, old);
  fresh.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const val = fresh.value.trim().slice(0, 10);
    if (!val || editTags.length >= 5 || editTags.includes(val)) return;
    editTags.push(val);
    fresh.value = '';
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
  editingMemberId = memberId;
  const m = allMembersMap[memberId];
  if (!m) return;

  const admin = isAdmin();

  // Photo preview
  const preview = document.getElementById('edit-photo-preview');
  const photoURL = m.photoURL && !m.photoURL.startsWith('http') ? '/' + m.photoURL : m.photoURL;
  if (photoURL) {
    preview.onerror = () => { preview.style.display = 'none'; preview.src = ''; };
    preview.src = photoURL;
    preview.style.display = 'block';
  } else {
    preview.src = '';
    preview.style.display = 'none';
  }

  // Common fields
  document.getElementById('edit-nickname-input').value = m.nickname || '';
  document.getElementById('edit-bio-input').value = m.bio || '';
  updateCharCount('edit-bio-input', 'bio-char-count', 200);
  updateCharCount('edit-nickname-input', 'nickname-char-count', 30);

  editTags = [...(m.customTags || [])];
  renderEditTags();
  setupTagInput();
  pendingPhotoBlob = null;

  // Admin-only fields
  const adminSection = document.getElementById('admin-fields');
  adminSection.style.display = admin ? 'block' : 'none';
  if (admin) {
    document.getElementById('edit-name-input').value = m.name || '';
    document.getElementById('edit-role-input').value = m.role || '';
    document.getElementById('edit-year-select').value = m.year || '碩一';
    document.getElementById('edit-research-tag-input').value = m.researchTag || '';
    document.getElementById('edit-avatar-color-select').value = m.avatarColor || 'cyan';
    document.getElementById('edit-email-input').value = m.email || '';
    document.getElementById('edit-order-input').value = m.order ?? '';
    document.getElementById('edit-modal-title').textContent =
      memberId === currentMemberId ? '編輯個人資料 👑' : `編輯：${m.name} 👑`;
  } else {
    document.getElementById('edit-modal-title').textContent = '編輯個人資料';
  }

  const restoreBtn = document.getElementById('restore-photo-btn');
  restoreBtn.style.display = m.previousPhotoURL ? 'block' : 'none';
  restoreBtn.textContent = '↩️ 還原上一張頭貼';

  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  document.getElementById('restore-photo-btn').style.display = 'none';
  pendingPhotoBlob = null;
  editingMemberId = null;
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
    document.getElementById('restore-photo-btn').style.display = 'block';
  } catch { showToast('圖片處理失敗，請重試', 'error'); }
}

async function saveProfile() {
  const saveBtn = document.getElementById('save-profile-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = '儲存中…';

  const targetId = editingMemberId;
  const targetData = allMembersMap[targetId];
  const admin = isAdmin();

  try {
    const nickname = document.getElementById('edit-nickname-input').value.trim().slice(0, 30);
    const bio = document.getElementById('edit-bio-input').value.trim().slice(0, 200);
    if (editTags.length > 5) { showToast('標籤最多 5 個', 'error'); return; }

    const updates = { nickname, bio, customTags: editTags };

    // Admin-only fields
    if (admin) {
      updates.name = document.getElementById('edit-name-input').value.trim();
      updates.role = document.getElementById('edit-role-input').value.trim();
      updates.year = document.getElementById('edit-year-select').value;
      updates.researchTag = document.getElementById('edit-research-tag-input').value.trim();
      updates.avatarColor = document.getElementById('edit-avatar-color-select').value;
      updates.email = document.getElementById('edit-email-input').value.trim();
      const orderVal = parseInt(document.getElementById('edit-order-input').value);
      if (!isNaN(orderVal)) updates.order = orderVal;
    }

    // Photo upload
    if (pendingPhotoBlob) {
      const oldPhotoURL = targetData?.photoURL || '';
      const storageRef = ref(storage, `members/${targetId}/avatar.jpg`);
      await uploadBytes(storageRef, pendingPhotoBlob, { contentType: 'image/jpeg' });
      updates.photoURL = await getDownloadURL(storageRef);
      if (oldPhotoURL) updates.previousPhotoURL = oldPhotoURL;
    }

    await updateDoc(doc(db, 'members', targetId), updates);

    // Update local cache
    allMembersMap[targetId] = { ...allMembersMap[targetId], ...updates };
    if (targetId === currentMemberId) {
      currentMemberData = { ...currentMemberData, ...updates };
    }

    // Re-render the card
    const card = document.querySelector(`[data-member-id="${targetId}"]`);
    if (card) {
      card.outerHTML = buildCardHTML(allMembersMap[targetId], targetId);
      addEditButton(targetId);
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
          <h3 id="edit-modal-title">編輯個人資料</h3>
          <button class="modal-close-btn" id="edit-close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-field">
            <label>頭貼</label>
            <div class="avatar-preview-wrap">
              <img id="edit-photo-preview" class="avatar-preview" src="" alt="預覽" style="display:none">
              <div>
                <button class="upload-btn" id="upload-photo-btn">📷 上傳照片</button>
                <button class="upload-btn" id="restore-photo-btn" style="display:none;margin-top:6px;border-color:var(--color-orange);color:var(--color-orange)">↩️ 還原上一張</button>
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

          <!-- Admin-only fields -->
          <div id="admin-fields" style="display:none">
            <div class="admin-fields-divider">👑 管理員欄位</div>
            <div class="modal-field">
              <label>姓名</label>
              <input type="text" id="edit-name-input" placeholder="姓名">
            </div>
            <div class="modal-field">
              <label>役職 / 身份</label>
              <input type="text" id="edit-role-input" placeholder="碩士生 · Master's Student">
            </div>
            <div class="modal-field">
              <label>年級</label>
              <select id="edit-year-select" class="modal-select">
                <option value="碩一">碩一</option>
                <option value="碩二">碩二</option>
                <option value="博士班">博士班</option>
              </select>
            </div>
            <div class="modal-field">
              <label>研究標籤（預設）</label>
              <input type="text" id="edit-research-tag-input" placeholder="🚁 無人機">
            </div>
            <div class="modal-field">
              <label>頭像色環</label>
              <select id="edit-avatar-color-select" class="modal-select">
                <option value="cyan">Cyan（青）</option>
                <option value="purple">Purple（紫）</option>
                <option value="orange">Orange（橘）</option>
                <option value="pink">Pink（粉）</option>
              </select>
            </div>
            <div class="modal-field">
              <label>登入 Email</label>
              <input type="email" id="edit-email-input" placeholder="member@gmail.com">
            </div>
            <div class="modal-field">
              <label>排序 (order)</label>
              <input type="number" id="edit-order-input" placeholder="1" min="1">
            </div>
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
  document.getElementById('login-password-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleEmailLogin();
  });
  document.getElementById('login-modal').addEventListener('click', e => {
    if (e.target.id === 'login-modal') closeLoginModal();
  });

  document.getElementById('edit-close-btn').addEventListener('click', closeEditModal);
  document.getElementById('edit-cancel-btn').addEventListener('click', closeEditModal);
  document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
  document.getElementById('upload-photo-btn').addEventListener('click', () => {
    document.getElementById('photo-file-input').click();
  });
  document.getElementById('restore-photo-btn').addEventListener('click', async () => {
    const targetId = editingMemberId;
    const prev = allMembersMap[targetId]?.previousPhotoURL;
    if (!prev) return;
    try {
      await updateDoc(doc(db, 'members', targetId), { photoURL: prev, previousPhotoURL: '' });
      allMembersMap[targetId] = { ...allMembersMap[targetId], photoURL: prev, previousPhotoURL: '' };
      if (targetId === currentMemberId) currentMemberData = { ...currentMemberData, photoURL: prev, previousPhotoURL: '' };
      const preview = document.getElementById('edit-photo-preview');
      preview.src = prev; preview.style.display = 'block';
      pendingPhotoBlob = null;
      document.getElementById('photo-file-input').value = '';
      document.getElementById('restore-photo-btn').style.display = 'none';
      showToast('已還原上一張頭貼', 'success');
    } catch (err) { showToast('還原失敗：' + err.message, 'error'); }
  });
  document.getElementById('photo-file-input').addEventListener('change', handlePhotoSelect);
  document.getElementById('edit-modal').addEventListener('click', e => {
    if (e.target.id === 'edit-modal') closeEditModal();
  });
}

// ── INIT ──

document.addEventListener('DOMContentLoaded', () => {
  injectModals();
  initAuth();
  loadMembers();
});
