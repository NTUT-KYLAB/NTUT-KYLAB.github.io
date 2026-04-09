# 網站維護手冊

本文件說明如何維護與更新 KY Lab 官方網站。

---

## 📁 專案結構

```
NTUT-KYLAB.github.io/
├── index.html          ← 主頁面（修改內容在這裡）
├── css/
│   └── style.css       ← 樣式表（修改配色、字體、排版）
├── js/
│   └── main.js         ← 互動效果（滾動動畫、選單）
├── images/             ← 放圖片的資料夾
│   ├── hero-bg.jpg     ← Hero 區背景照片（自行加入）
│   ├── project-01.jpg  ← 專案圖片（自行加入）
│   └── ...
├── README.md           ← 專案對外介紹頁面
└── MAINTENANCE.md      ← 本維護手冊
```

---

## 🚀 部署到 GitHub Pages（完整教學）

### 第一次設定

#### 1. 建立 GitHub 帳號
- 前往 https://github.com 註冊（免費）

#### 2. 安裝 Git
- Windows：下載 https://git-scm.com/download/win
- Mac：終端機輸入 `git --version`，系統會自動提示安裝
- 安裝完成後，打開終端機設定身份：
  ```bash
  git config --global user.name "你的名字"
  git config --global user.email "你的email@example.com"
  ```

#### 3. 在 GitHub 建立新 Repository
1. 登入 GitHub → 右上角 `+` → `New repository`
2. Repository name 填：`saclab-website`（或任何名稱）
3. 設為 **Public**
4. **不要**勾選 "Add a README file"
5. 點 `Create repository`

#### 4. 上傳網站檔案
```bash
# 進入網站資料夾
cd saclab-website

# 初始化 Git
git init

# 加入所有檔案
git add .

# 建立第一個版本
git commit -m "初始版本：實驗室網站上線"

# 連結到 GitHub（把 YOUR_USERNAME 換成你的帳號）
git remote add origin https://github.com/YOUR_USERNAME/saclab-website.git

# 推送上去
git branch -M main
git push -u origin main
```

#### 5. 開啟 GitHub Pages
1. 進入 GitHub 上的 repository 頁面
2. 點上方 `Settings`
3. 左側選單找到 `Pages`
4. Source 選 `Deploy from a branch`
5. Branch 選 `main`，資料夾選 `/ (root)`
6. 點 `Save`
7. 等 1-2 分鐘，網站就會出現在：
   `https://YOUR_USERNAME.github.io/saclab-website/`

---

### 日常更新流程

每次修改完檔案後，只需要三行指令：

```bash
git add .
git commit -m "描述這次改了什麼"
git push
```

GitHub Pages 會自動更新，通常 1-2 分鐘內生效。

---

## ✏️ 常見修改指南

### 修改文字內容
→ 編輯 `index.html`，找到對應區塊修改即可

### 修改配色
→ 編輯 `css/style.css` 最上方的 `:root` 區塊：
```css
:root {
  --accent: #3b82f6;      /* 主強調色 */
  --navy:   #0a1628;      /* 深色背景 */
  /* ... 其他顏色 ... */
}
```

### 新增專案
→ 在 `index.html` 的 `<!-- PROJECTS -->` 區塊中複製一個 `project-card` 並修改內容

### 新增成員
→ 在 `<!-- TEAM -->` 區塊中複製一個 `team-card` 並修改

### 加入實際照片
1. 將照片放入 `images/` 資料夾
2. 在 HTML 中取消對應的 `<img>` 註解，例如：
   ```html
   <!-- 原本 -->
   <!-- <img src="images/project-01.jpg" alt="..."> -->
   
   <!-- 改成 -->
   <img src="images/project-01.jpg" alt="無人機專案">
   ```

### 使用自訂域名（選用）
1. 在 repository 根目錄新增 `CNAME` 檔案，內容為你的域名：
   ```
   lab.example.com
   ```
2. 在你的 DNS 設定中加入 CNAME 記錄指向 `YOUR_USERNAME.github.io`
3. GitHub Pages Settings 中填入 Custom domain

---

## 👥 多人協作

### 加入協作者
1. Repository → Settings → Collaborators
2. 點 `Add people` → 輸入對方的 GitHub 帳號
3. 對方接受邀請後就能推送更新

### 建議工作流程
- 每次修改前先 `git pull`（拉取最新版本）
- 修改完再 `git add . → git commit → git push`
- 如果遇到衝突，Git 會提示你手動解決

---

## 📝 授權
MIT License — 可自由使用與修改
