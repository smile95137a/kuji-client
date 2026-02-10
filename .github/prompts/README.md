# kuji-admin 前端 Prompt 檔案總覽

## 📋 Prompt 檔案清單

### 1. 架構與開發規範（必讀）
- **`frontend-architecture-guide.prompt.md`** - 前端專案架構、開發規範、流程指引

### 2. 功能需求 Prompt
- **`lottery-management.prompt.md`** - 抽獎遊戲管理功能需求
- **`user-permissions.prompt.md`** - 使用者權限與角色管理需求
- **`store-frontend.prompt.md`** - 店家前台資料管理需求
- **`store-account-frontend.prompt.md`** - 店家前台帳號管理需求
- **`frontend-user-system.prompt.md`** - 前台會員系統功能需求

---

## 🎯 使用指南

### AI 編碼代理使用順序
1. **第一步**: 閱讀 `frontend-architecture-guide.prompt.md` 了解專案架構
2. **第二步**: 根據需求閱讀對應的功能 prompt
3. **第三步**: 遵循 Component → API → Integration 的開發流程

### 關鍵開發原則
1. ✅ **Component 優先**: 先撰寫 Vue 組件
2. ✅ **API 整合**: 使用 Axios 與服務層進行 API 整合
3. ✅ **狀態管理**: 使用 Pinia 管理全域狀態
4. ✅ **表單驗證**: 使用 `vee-validate` 與 `yup/zod` 驗證表單
5. ❌ **禁止**: 在組件內直接操作 API 或全域狀態

---

## 📂 前端開發快速參考

### Vue 組件結構
- **組件檔案**: `src/components/` 下依功能模組劃分
- **樣式檔案**: 使用 SCSS，放置於對應組件目錄內
- **狀態管理**: `src/stores/` 下建立對應的 Pinia Store
- **路由配置**: `src/router/index.ts` 中新增對應路由

### API 使用範例
```typescript
import { lotteryService } from '@/services/lotteryService';

const fetchLotteryDetails = async (id: string) => {
   try {
      const response = await lotteryService.getLotteryDetails(id);
      console.log(response.data);
   } catch (error) {
      console.error('Error fetching lottery details:', error);
   }
};
```

---

## 🔄 標準開發流程

### 新增功能完整流程
```
1. 設計 Vue 組件結構
    ↓
2. 撰寫對應的 API 服務層
    ↓
3. 整合組件與 API
    ↓
4. 使用 Pinia 管理狀態
    ↓
5. 撰寫對應的表單驗證邏輯
    ↓
6. 測試功能並進行優化
```

---

## ⚠️ 常見錯誤

### ❌ 錯誤做法
- 在 Vue 組件內直接撰寫 API 呼叫邏輯
- 不使用 Pinia 管理全域狀態
- 忽略表單驗證，直接提交資料
- 在組件內直接操作 DOM，而非使用 Vue 的響應式系統

### ✅ 正確做法
- 使用服務層封裝 API 呼叫邏輯
- 使用 Pinia 管理全域狀態
- 使用 `vee-validate` 與 `yup/zod` 驗證表單
- 使用 Vue 的響應式系統操作 DOM

---

## 📌 快速檢查清單

開始開發前請確認:
- [ ] 已閱讀 `frontend-architecture-guide.prompt.md`
- [ ] 已設計 Vue 組件結構
- [ ] 已撰寫對應的 API 服務層
- [ ] 已整合組件與 API
- [ ] 已撰寫表單驗證邏輯
- [ ] 已測試功能並進行優化

---

**最後更新**: 2025-12-13  
**專案**: kuji-admin  
**版本**: Vue 3 + TypeScript + Vite
