# 影子計劃 - Vercel 部署指南

## 快速部署步驟

### 1. 上傳至 Vercel
1. 將專案上傳到 GitHub 或直接拖放到 Vercel Dashboard
2. 在 Vercel 中選擇 Remix 框架
3. 部署配置會自動使用 `vercel.json` 設定

### 2. 更新 API URL
部署完成後，需要更新以下檔案中的 API URL：

**檔案：** `app/routes/_index.tsx`
- 將 `https://your-vercel-app.vercel.app` 替換為實際的 Vercel 部署 URL

### 3. 資料庫初始化
部署完成後，訪問以下端點來初始化資料庫：
```
https://your-vercel-app.vercel.app/api/init-db
```

### 4. 測試功能
1. **任務管理**：新增、編輯、刪除任務
2. **記憶卡片**：透過任務完成創建記憶卡片
3. **統計數據**：查看每日、每週、每月統計
4. **成就系統**：獲得徽章和成就通知

## API 端點列表

### 核心功能
- `/api/tasks` - 任務管理 CRUD
- `/api/memory-cards` - 記憶卡片管理
- `/api/memory-cards-due` - 到期複習卡片
- `/api/material-library` - 教材庫（含台灣教育內容）

### 統計與分析
- `/api/stats` - 每日統計
- `/api/stats-weekly` - 每週統計
- `/api/stats-monthly` - 每月統計
- `/api/achievements` - 成就系統
- `/api/focus-sessions` - 專注會話記錄

### 系統
- `/api/init-db` - 資料庫初始化

## 技術架構

### 前端
- **框架**：Remix (SSR)
- **UI**：Tailwind CSS 客製化設計系統
- **圖示**：Heroicons
- **TypeScript**：完整型別支援

### 後端
- **API**：Vercel Serverless Functions
- **資料庫**：SQLite（儲存在 `/tmp` 目錄）
- **CORS**：已配置跨域請求

### 特色功能
- **間隔重複系統**：SM-2 演算法
- **成就系統**：即時徽章通知
- **台灣教育內容**：高中數學、英文7000字、物理、化學
- **數據分析**：個人化學習統計

## 注意事項

1. **資料庫**：使用 SQLite 儲存在 `/tmp` 目錄，每次 cold start 會重新初始化
2. **持久化**：如需永久儲存，建議整合 Vercel KV 或 PostgreSQL
3. **URL 更新**：部署後記得更新所有 API 呼叫的 URL
4. **測試**：建議先測試所有 API 端點確保正常運作

## 展示重點

1. **專業UI設計**：精緻的玻璃毛玻璃效果和漸層背景
2. **完整功能**：三階段開發（任務管理、智慧記憶、成就系統）
3. **台灣本土化**：預建台灣教育內容
4. **即時互動**：成就通知和數據更新
5. **響應式設計**：適配不同螢幕尺寸