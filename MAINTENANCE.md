# 網站維護手冊

KY Lab 官方網站維護說明。本站為純靜態網站部署於 GitHub Pages，成員頁面使用 Firebase 動態管理。

---

## 專案結構

```
NTUT-KYLAB.github.io/
├── index.html              ← 首頁 Hero
├── research/index.html     ← 研究方向
├── projects/index.html     ← 實驗室專案
│   ├── drone/index.html
│   ├── speech/index.html
│   ├── vision/index.html
│   └── energy/index.html
├── professor/index.html    ← 教授簡介
├── members/index.html      ← 實驗室成員（Firebase 動態）
├── awards/index.html       ← 得獎紀錄
├── gallery/index.html      ← 相簿
├── css/
│   ├── style.css           ← 全站樣式（配色變數在 :root）
│   └── members.css         ← 成員頁專用樣式
├── js/
│   ├── components.js       ← 共用 Navbar / Footer
│   ├── main.js             ← 互動效果（無人機游標、滾動動畫）
│   └── members.js          ← 成員頁 Firebase 邏輯
├── images/
│   ├── professor.jpg       ← 教授照片
│   └── members/            ← 成員預設照片（.jpg）
├── sitemap.xml
└── robots.txt
```

---

## 日常更新流程

修改任何檔案後，三行指令推上去，GitHub Pages 約 1-2 分鐘自動更新：

```bash
git add <檔案>
git commit -m "說明這次改了什麼"
git push
```

---

## 靜態頁面修改指南

以下頁面內容直接寫在 HTML 裡，用文字編輯器開啟修改即可。

### 新增 / 修改研究方向
編輯 `research/index.html`，複製現有的卡片區塊並修改文字。

### 新增 / 修改專案
編輯 `projects/index.html`，或各子頁面（`drone/`、`speech/` 等）的 `index.html`。

### 修改教授資料
編輯 `professor/index.html`。教授照片路徑為 `/images/professor.jpg`（使用絕對路徑）。

### 新增得獎紀錄
編輯 `awards/index.html`，複製現有卡片並修改。

### 修改導覽列 / 頁尾
編輯 `js/components.js`，Navbar 和 Footer 的 HTML 注入在此。新增頁面時也需在這裡加上連結。

### 修改全站配色
編輯 `css/style.css` 最上方的 `:root` 區塊：
```css
:root {
  --color-cyan:   #64D2D6;
  --color-purple: #B794F4;
  --color-orange: #F6AD55;
  --color-pink:   #F687B3;
}
```

---

## 成員頁管理（Firebase）

成員資料存放於 Firebase Firestore，登入後可透過頁面上的編輯介面管理，**不需要改程式碼**。

### 登入方式
前往 `https://kylab-ntut.github.io/members/`，點右上角「🔑 登入」：
- **Google 帳號登入**：需在一般瀏覽器（Chrome / Safari）開啟，LINE 等 app 內建瀏覽器請改用 Email + 密碼登入
- **Email + 密碼登入**：適用所有環境

### 每位成員能編輯的欄位
登入後，自己的卡片右上角會出現 ✏️ 按鈕：
- 暱稱（英文暱稱）
- 自我介紹
- 自訂標籤（最多 5 個）
- 頭貼照片

### 管理員額外功能
管理員帳號可以編輯**所有人**的卡片，並多出以下欄位：
- 姓名、役職、年級、研究標籤、頭像色環
- 登入 Email、排序順序

**目前管理員 Email** 寫在 `js/members.js` 第 21 行：
```js
const ADMIN_EMAIL = 'melvin0kuo@gmail.com';
```

### 新增成員
1. 在 [Firebase Console](https://console.firebase.google.com/) → `kylab-ntut` → **Firestore Database** → `members` collection
2. 新增一筆文件，欄位如下：

| 欄位 | 說明 | 範例 |
|---|---|---|
| `name` | 姓名 | `王小明` |
| `role` | 役職 | `碩士生 · Master's Student` |
| `year` | 年級 | `碩一` / `碩二` / `博士班` |
| `email` | 登入用 Gmail | `student@gmail.com` |
| `researchTag` | 預設標籤 | `🚁 無人機` |
| `avatarColor` | 色環顏色 | `cyan` / `purple` / `orange` / `pink` |
| `order` | 排列順序（數字越小越前面） | `5` |
| `photoURL` | 頭貼路徑或 URL（選填） | `images/members/name.jpg` |
| `placeholderEmoji` | 無照片時的替代 emoji（選填） | `🎓` |

3. 成員第一次用 Google 帳號登入時，系統會自動寄一封**密碼設定信**到他的 Gmail，讓他設好密碼後也能用 Email 登入

### 移除成員
在 Firebase Console → Firestore → `members` → 找到該文件 → 刪除。

---

## Firebase 專案交接

### 需要移交的項目

#### 1. Firebase / Google Cloud 擁有權
1. 開 [console.cloud.google.com](https://console.cloud.google.com/) → 選 `kylab-ntut` 專案
2. 左側 **IAM & Admin** → 新增新管理員的 Gmail，角色設為 `Owner`
3. 確認新管理員能正常登入後，再移除舊帳號的權限

#### 2. 修改程式碼裡的管理員 Email
編輯 `js/members.js` 第 21 行：
```js
const ADMIN_EMAIL = '新管理員的gmail@gmail.com';
```
修改後 commit + push 即可。

#### 3. 確認新管理員有 Firestore 成員資料
新管理員的 Gmail 必須在 Firestore `members` collection 裡有對應文件（`email` 欄位需吻合），否則登入後會被擋掉。

#### 4. GitHub Organization 管理員
前往 [github.com/KYLAB-NTUT](https://github.com/KYLAB-NTUT) → Settings → Members：
- 將新管理員升為 `Owner`
- 舊管理員降為 `Member` 或移除

### 交接完成確認清單
- [ ] Google Cloud IAM 已新增新 Owner
- [ ] `ADMIN_EMAIL` 已改為新管理員 Email 並 push
- [ ] 新管理員在 Firestore `members` 有對應文件
- [ ] 新管理員能成功登入網站並看到 👑 標誌
- [ ] GitHub Organization Owner 已轉移

---

## Google 搜尋 / SEO

- **Sitemap**：`https://kylab-ntut.github.io/sitemap.xml`（已設定於 `robots.txt`）
- **Google Search Console**：已驗證，可至 [search.google.com/search-console](https://search.google.com/search-console/) 提交 Sitemap 或請求重新索引
- 各頁面已設有 `<link rel="canonical">` 指向正確網址

新增頁面後，記得在 `sitemap.xml` 加入對應的 `<url>` 條目。

---

## Firebase 費用說明

目前使用 Firebase **免費方案（Spark）**，對實驗室網站流量綽綽有餘：

| 資源 | 免費額度 | 預估用量 |
|---|---|---|
| Firestore 讀取 | 50,000 次/天 | ~1,000 次/天 |
| Firestore 寫入 | 20,000 次/天 | 偶爾管理員操作 |
| Firebase Storage | 5 GB 儲存 / 1 GB 下載/天 | 頭貼照片 < 100 MB |

除非網站流量暴增（超過 ~5,000 訪客/天），否則不會產生費用。

---

## 常見問題

**Q：推送後網站沒有更新？**
等 1-2 分鐘，或到 GitHub → repository → Actions 確認部署狀態。

**Q：成員無法用 Google 登入（出現「已封鎖」）？**
該使用者是從 LINE / Instagram 等 app 內建瀏覽器開啟，請複製網址到 Chrome 或 Safari 再登入，或改用 Email + 密碼。

**Q：新成員登入後顯示「不在成員名單中」？**
先在 Firebase Console → Firestore → `members` 新增該成員的資料（`email` 欄位需填正確 Gmail）。

**Q：頭貼沒有顯示？**
確認 `photoURL` 填的是絕對路徑（如 `/images/members/name.jpg`）或完整的 https:// URL。
