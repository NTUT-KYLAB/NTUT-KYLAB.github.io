# Member Profile Self-Editor — Design Spec

**Date:** 2026-04-25
**Scope:** KY Lab website (`kylab-ntut.github.io`) — members page only

---

## Problem

Member profile data (photo, bio, nickname, custom tags) is hardcoded in `members.html`. Lab members have no way to update their own info without touching code.

---

## Goal

Let each lab member log in and edit their own profile card (photo, nickname, bio, custom tags) without requiring GitHub access or admin intervention.

---

## Approved Approach: Firebase Full Dynamic (Plan A)

All member data moves to Firestore. `members.html` renders cards dynamically via JavaScript. Firebase Auth handles login. Firebase Storage holds profile photos.

---

## Architecture

```
GitHub Pages (static frontend)       Firebase (backend)
──────────────────────────────       ──────────────────
members.html                         Firestore
  └─ js/members.js          ←──────▶   └─ members/{id}
  └─ js/components.js                Auth
                             ←──────▶   ├─ Email / Password
                                        └─ Google OAuth
                                      Storage
                             ←──────▶   └─ members/{id}/avatar.jpg
```

---

## Firestore Data Structure

Collection: `members`
Document ID: English slug (e.g. `melvin`, `linpinwen`)

| Field | Type | Editable by member | Description |
|---|---|---|---|
| `name` | string | no | Chinese name |
| `nickname` | string | yes | English nickname |
| `role` | string | no | e.g. "碩士生 · Master's Student" |
| `year` | string | no | e.g. "碩一" |
| `researchTag` | string | no | e.g. "🚁 無人機" |
| `customTags` | string[] | yes | Member-defined tags, max 5 |
| `bio` | string | yes | Self-introduction |
| `photoURL` | string | yes | Firebase Storage download URL |
| `email` | string | no | Used to link Firebase Auth user to this document |
| `avatarColor` | string | no | Ring color: `cyan`, `purple`, `orange`, `pink` |
| `order` | number | no | Display order on page |

Admin manages `name`, `role`, `year`, `researchTag`, `email`, `avatarColor`, `order` directly via Firebase Console.

---

## Authentication

### Supported methods
- Email + Password (admin creates accounts via Firebase Console; Firebase sends a password-setup email to each member)
- Google OAuth (member clicks "Google 登入", no password needed)

### Login → Member mapping
1. User logs in → obtain `user.email` from Firebase Auth
2. Query Firestore: `members where email == user.email`
3. **Found** → member is identified; show ✏️ on their card
4. **Not found** → show error toast: "此帳號（xxx@gmail.com）不在實驗室成員名單中，請聯絡管理員。" → auto sign-out

---

## UI

### Navbar
| State | Right side of navbar |
|---|---|
| Not logged in | `[🔑 登入]` button |
| Logged in | Member avatar thumbnail + name + `[登出]` button |

### Member card states
| State | Card appearance |
|---|---|
| Not logged in / other member logged in | Normal card, no controls |
| Own card while logged in | `✏️` icon in top-right corner |

### Edit Modal fields

| Field | Input type | Constraints |
|---|---|---|
| 頭貼 | File picker + preview | JPG / PNG / WEBP / HEIC, max 20 MB |
| 暱稱 | Text input | Max 30 chars |
| 自我介紹 | Textarea | Max 200 chars |
| 自定標籤 | Tag input (Enter to add, ✕ to remove) | Max 5 tags, max 10 chars each |

**Photo upload flow:**
1. Member selects file → client-side compression via Canvas API (resize to max 1200px on longest side, quality 0.85 JPEG)
2. Show compressed preview in modal
3. On "儲存": upload compressed image to `members/{memberId}/avatar.jpg` (overwrites previous)
4. Get download URL → update `photoURL` in Firestore
5. Card photo updates immediately without page reload

**Save flow:**
1. Click "儲存" → button shows loading spinner
2. Write all changed fields to Firestore in one `update()` call
3. On success: close modal, update card in DOM immediately
4. On failure: show error toast, keep modal open

---

## File Changes

### New files
| File | Purpose |
|---|---|
| `js/members.js` | Firebase init, Auth, Firestore reads/writes, dynamic card rendering, modal logic, photo upload + compression |
| `css/members.css` | Modal styles, login button, ✏️ icon, tag input styles |

### Modified files
| File | Change |
|---|---|
| `members.html` | Remove all static member card HTML; add empty container `<div id="members-grid">` and `<div id="edit-modal">`; load `members.js` and `members.css` |
| `js/components.js` | Add login button to navbar; update navbar based on auth state |

### Untouched
All other pages (`index.html`, `research.html`, etc.), `css/style.css`, `js/main.js`.

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /members/{memberId} {
      // Anyone can read (page renders publicly)
      allow read: if true;
      // Only the matched member can write their own document
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

The write rule enforces that admin-only fields cannot be changed even if someone crafts a manual request.

---

## Firebase Storage Rules

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

> **Note:** Storage rules cannot cross-reference Firestore, so we cannot verify in the rule that `memberId` matches the logged-in user's member document. The frontend enforces the correct upload path; this is an acceptable risk for a small private lab site. If stricter enforcement is needed in the future, Cloud Functions can be introduced.

> **HEIC note:** `Canvas.toBlob()` cannot decode HEIC. On iOS, the browser file picker silently converts HEIC to JPEG before passing it to the File API, so compression still works. On desktop, HEIC files should be excluded by the `accept` attribute on the file input.

---

## Migration Plan

1. Admin creates Firebase project, enables Auth + Firestore + Storage
2. Admin runs a one-time data migration: copy all current hardcoded member data from `members.html` into Firestore documents
3. Admin creates Firebase Auth accounts for each member (email/password); Firebase sends setup emails
4. Deploy updated `members.html` + new JS/CSS
5. Members receive email, set password, log in and update their own profiles

---

## Out of Scope

- Admin panel UI (admin uses Firebase Console directly)
- Member removal / reordering (admin edits Firestore directly)
- Password reset UI (Firebase Auth handles this natively via email)
- Multiple photos per member
