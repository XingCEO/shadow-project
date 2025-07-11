# 影子計劃 (Shadow Plan)

一個以 **Local-first (本地優先)** 為核心理念的 Mac 智慧學習應用程式。

## 專案架構

- **前端**: Remix 框架 + React + TypeScript
- **後端**: Node.js + Express
- **資料庫**: SQLite (本地儲存)
- **樣式**: Tailwind CSS
- **圖示**: Heroicons

## 功能特色

### 第一階段：核心專注閉環
- ✅ 智慧任務管理系統
- ⏳ 極致專注模式
- ⏳ 基礎學習紀錄

## 開發指令

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run server

# 另開終端機啟動 Remix 開發模式
npm run dev

# 建置專案
npm run build

# 型別檢查
npm run typecheck

# 程式碼檢查
npm run lint
```

## 專案結構

```
System/
├── app/                    # Remix 應用程式
│   ├── components/         # React 元件
│   ├── routes/            # 路由頁面
│   ├── root.tsx           # 根元件
│   └── tailwind.css       # 樣式檔案
├── data/                  # SQLite 資料庫檔案
├── public/                # 靜態資源
├── server.js              # Node.js 後端伺服器
└── package.json           # 專案配置
```

## 資料庫結構

### tasks 資料表
- `id`: 任務 ID (主鍵)
- `title`: 任務標題
- `description`: 任務描述
- `estimated_time`: 預估時間 (分鐘)
- `importance`: 重要程度 (1-5)
- `status`: 任務狀態 (pending/in_progress/completed)
- `created_at`: 建立時間
- `updated_at`: 更新時間

### focus_sessions 資料表
- `id`: 記錄 ID (主鍵)
- `task_id`: 關聯任務 ID
- `duration`: 專注時長 (分鐘)
- `started_at`: 開始時間
- `completed_at`: 完成時間
- `created_at`: 建立時間

## 設計理念

- **Local-first**: 所有資料儲存在本地，使用者完全掌控
- **離線優先**: 無需網路連線即可使用
- **隱私保護**: 絕對不會上傳任何使用者資料
- **專注導向**: 介面設計以提升專注力為目標
- **精緻體驗**: 採用現代化設計語言，提供流暢的使用體驗