# Frontend Specification: 刮刮樂獎項規則修正 — 前台

**Feature Branch**: `015-scratch-lottery-prize-rules`
**Created**: 2026-04-06
**Status**: Draft
**對應後端 Spec**: `specs/015-scratch-lottery-prize-rules/spec.md`

---

## 背景說明

後端本次已完成以下修正（前台需配合對接）：

1. **`designationDeadline` 欄位**：`lottery_session` 表新增此欄位，後端 `GET /lottery/draw/{id}/session` 現在回傳 `designationDeadline`（ISO-8601）。
2. **非開套玩家攔截**：`SCRATCH_PLAYER` 模式下，在指定未完成時呼叫 draw API，後端對非開套玩家回傳新 DTO `DesignationPendingResponse`（`awaitingDesignation: true`、`message`、`openerDeadline`）。
3. **開套玩家攔截**：已有 `designationRequired: true` 回應（現有邏輯）。

前台目前已實作：
- 開套玩家 `designationRequired: true` 處理 → 彈出 `PrizeDesignationDialog` ✅
- 指定送出 API `POST /lottery/draw/{id}/designate` ✅

前台**尚未實作**（本次任務範圍）：
- `awaitingDesignation: true` 回應處理 → 等待畫面 + 倒數計時器
- `SessionResponse` 新增 `designationDeadline` 欄位
- 進頁面時主動判斷「等待指定」狀態並顯示對應 UI（不只靠 draw 時攔截）
- 倒數計時器歸零後自動 reload 頁面狀態

---

## User Stories（前台視角）

### User Story FE-1 — 開套玩家進場主動顯示指定畫面 (Priority: P1)

**What**: `SCRATCH_PLAYER` 商品，開套玩家進入籤位頁時，若指定尚未完成，系統應主動顯示「請選擇大獎號碼」提示區塊，而不只靠嘗試抽獎才觸發。

**Why**: 使用者進頁面不一定會馬上點抽，若沒有主動 UI 提示，開套者不知道需要先做指定。

**Acceptance Scenarios**:
1. **Given** SCRATCH_PLAYER 商品、當前玩家為開套者、指定尚未完成，**When** 頁面載入完成，**Then** Info 區塊出現「您是開套者，請先指定大獎號碼才能開始抽獎」橫幅，且「開始指定」按鈕可點擊。
2. **Given** 同上，**When** 玩家點「開始指定」按鈕，**Then** 直接打開大獎指定流程（`PrizeDesignationDialog`）。
3. **Given** 指定已完成，**When** 頁面載入，**Then** 開套者橫幅不顯示，正常顯示籤位選擇。

---

### User Story FE-2 — 非開套玩家等待指定（倒數計時） (Priority: P1)

**What**: `SCRATCH_PLAYER` 商品，非開套玩家嘗試操作時（包含點格子、點主要按鈕），若收到 `awaitingDesignation: true`，前台顯示等待提示與剩餘倒數計時器，且阻擋一切抽獎操作。

**Why**: 非開套玩家若沒有清楚的等待提示與倒數，會誤以為遊戲壞了或自己可以操作。

**Acceptance Scenarios**:
1. **Given** 非開套玩家嘗試抽獎（呼叫 draw API），**When** 後端回傳 `awaitingDesignation: true` 與 `openerDeadline`，**Then** 前台顯示 `DesignationWaitingOverlay` 等待畫面，顯示開套者暱稱（若有）、倒數計時器（`MM:SS`）、提示文字「等待開套者指定大獎號碼中」。
2. **Given** 等待畫面開啟，**When** 倒數計時器歸零，**Then** 前台自動呼叫 reload（重新拉資料 + session），並提示「計時結束！您可以成為新的開套者，請重新進入抽獎流程」。
3. **Given** reload 完成後當前玩家成為新開套者（`session.isOpener = true`），**When** 指定尚未完成，**Then** 自動觸發 FE-1 的開套者橫幅，引導玩家進行指定。
4. **Given** 等待畫面顯示，**When** 玩家主動點「關閉」，**Then** 等待畫面關閉，不觸發 reload（倒數停止，但頁面其他元素正常顯示）。

---

### User Story FE-3 — Session 回應增加 `designationDeadline` (Priority: P1)

**What**: `SessionResponse` 介面（`lotteryDrawService.ts`）新增 `designationDeadline?: string | null`，且 `refreshSession()` 取得後存入 `session.value`，供倒數計時器與主動判斷使用。

**Why**: 頁面載入時需要知道目前 `designationDeadline` 以主動顯示等待 UI，而非每次都靠 draw API 攔截才知道。

**Acceptance Scenarios**:
1. **Given** `GET /lottery/draw/{id}/session` 回傳 `designationDeadline`，**When** `refreshSession()` 執行，**Then** `session.value.designationDeadline` 更新為後端回傳值（可為 null）。
2. **Given** `session.value.designationDeadline` 為一個未來時間點，**When** 計算 `isDesignationPending`（computed），**Then** 回傳 `true`；若為 null 或過去時間點，回傳 `false`。

---

### User Story FE-4 — 頁面載入後主動顯示等待畫面（非開套） (Priority: P1)

**What**: 非開套玩家進入 `SCRATCH_PLAYER` 商品頁，若 `session` 顯示目前有開套者（`isOpener = false`）且 `designationDeadline` 存在且未過期，則直接顯示等待 UI（不等玩家嘗試抽獎）。等待畫面開啟後，每 30 秒 poll 一次 session API，偵測到指定完成即自動關閉並 reload。

**Why**: 避免玩家操作一番才被攔截，提供更清晰的 UX 流程；30 秒 polling 確保開套者提前完成時非開套玩家能在最多 30 秒內感知。

**Acceptance Scenarios**:
1. **Given** SCRATCH_PLAYER 商品、當前玩家非開套者、`session.designationDeadline` 為未來時間，**When** 頁面 `reload()` 完成（session 更新），**Then** 自動顯示等待倒數 UI，並啟動 30 秒 polling。
2. **Given** 等待中，**When** 玩家手動關閉等待 UI，**Then** 等待 UI 消失，30 秒 polling 停止，頁面可瀏覽但刮格/抽獎操作保留禁止（`canDraw` 邏輯）。
3. **Given** 等待 Overlay 開啟且 polling 運行中，**When** 第 N 次 poll 回傳 `designationDeadline === null`（開套者已完成指定），**Then** 自動關閉 overlay、停止 polling 並呼叫 `reload()`，最長延遲 30 秒。

---

### Edge Cases（前台）

- **`POST /designate` 失敗處理**：`designatePrizePositions()` 呼叫失敗時（網路錯誤或後端拒絕），顯示錯誤 info dialog（顯示後端訊息或「指定失敗，請稍後再試」），`PrizeDesignationDialog` **保持開啟**；玩家可修改選號後直接重試，不需重新點「立即指定」按鈕。
- **倒數顯示**：從 `openerDeadline`（ISO-8601）計算剩餘秒數，誤差不超過 ±5 秒；每秒更新一次。
- **網路延遲**：若 `openerDeadline` 在計算時已過期，立即觸發 reload，不顯示負數倒數。
- **指定流程取消**：開套者在 `PrizeDesignationDialog` 點「取消」，不執行 draw，回到正常頁面狀態（不重設 `designationDeadline`，開套者身份保留，仍可再次觸發指定）。
- **並發保護**：倒數期間，非開套玩家嘗試點格子，UI 應直接阻擋（顯示 toast 或 info dialog），不再呼叫 draw API 來被攔截。
- **`POST /designate` 失敗**：後端拒絕或網路錯誤時，顯示錯誤 info dialog（含後端回傳的錯誤訊息），`PrizeDesignationDialog` **保持開啟**，讓開套者直接重試；不強制關閉對話框再重開（節省 10 分鐘有效期的操作成本）。
- **SCRATCH_STORE 模式**：後端已確保上架前必須完成指定，前台無需額外處理；玩家進入 `SCRATCH_STORE` 商品直接看到正常籤位，不需要任何指定步驟。
- **指定完成後**：`designatedWinningNumbers` 已在回應中取得並顯示中獎號碼橫幅（現有邏輯），確認此流程不受影響。

---

## Clarifications

### Session 2026-04-06

- Q: 非開套玩家的等待 UI 是 full-screen overlay 還是頁面內嵌區塊？ → A: 採用 full-screen overlay（`DesignationWaitingOverlay` 元件），風格參照現有 `BaseOverlay`；玩家可主動關閉，關閉後頁面仍顯示，但無法刮格。
- Q: `awaitingDesignation` 是否只在 draw API 回傳，還是 session API 也提供？ → A: Session API（`GET /session`）回傳 `designationDeadline`；前台自行判斷是否顯示等待 UI。Draw API 另外回傳 `awaitingDesignation: true` 作為兜底攔截。
- Q: 倒數歸零後是自動 reload 還是顯示按鈕讓使用者手動刷新？ → A: 自動 reload（呼叫現有 `reload()` 函式），之後顯示 toast「計時結束，您已可成為開套者」。
- Q: 等待 Overlay 是否需要定期 poll session API 偵測開套者提前完成指定？ → A: 是，每 30 秒 poll 一次（保守策略）；偵測到指定完成後自動關閉 overlay 並呼叫 `reload()`，不必等倒數歸零。
- Q: `triggerDesignationFromSession()` 呼叫 `drawLottery()` 時，若開套者尚未選格子，用哪個 ticket UUID？ → A: 自動取 `availableTicketIds.value[0]`（第一個 AVAILABLE ticket）作為 probe ticket UUID；若無可用 ticket 則顯示「目前無可用格數」提示並中止。
- Q: `designationDone` 的主要判斷訊號為何？ → A: 要求後端在 `SessionResponse` 新增 `isDesignationComplete: boolean` 欄位作為明確訊號；前台以 `session.value?.isDesignationComplete === true` 判斷指定是否完成，不依賴 `designatedWinningNumbers` 陣列長度。
- Q: `POST /designate` 失敗時（網路錯誤 / 後端拒絕），`PrizeDesignationDialog` 應保持開啟還是關閉？ → A: 顯示錯誤 info dialog，`PrizeDesignationDialog` **保持開啟**，玩家可直接重試，不需重新觸發指定流程。
- Q: `POST /designate` 失敗時的錯誤處理為何？ → A: 顯示錯誤 info dialog，`PrizeDesignationDialog` 保持開啟，讓開套者直接重試，不強制關閉再重開。

---

## Requirements（前台）

### FR-FE-001 — `SessionResponse` 新增 `designationDeadline` 與 `isDesignationComplete`

在 `src/services/lotteryDrawService.ts` 的 `SessionResponse` 介面新增：
```typescript
designationDeadline?: string | null;  // ISO-8601，SCRATCH_PLAYER 開套者有效期；指定完成後為 null
isDesignationComplete: boolean;       // 後端明確訊號：指定是否已完成（取代 designatedWinningNumbers 長度判斷）
```

前台統一以 `session.value?.isDesignationComplete === true` 作為 **`designationDone` 的唯一判斷依據**。

### FR-FE-002 — `DesignationPendingResponse` 型別新增

在 `src/services/lotteryDrawService.ts` 新增：
```typescript
export interface DesignationPendingResponse {
  awaitingDesignation: true;
  message: string;
  openerDeadline: string; // ISO-8601
}
```

### FR-FE-003 — `handleScratch()` 處理 `awaitingDesignation`

`IchibanDetail.vue` 中 `handleScratch()` 的 `onSuccess` 回調，目前僅判斷 `designationRequired`；需補充判斷 `awaitingDesignation: true`，呼叫 `showDesignationWaitingOverlay(data.openerDeadline, data.message)`。

### FR-FE-004 — 新建 `DesignationWaitingOverlay` 元件

路徑：`src/components/ichiban/DesignationWaitingOverlay.vue`

Props：
| Prop | 型別 | 說明 |
|------|------|------|
| `show` | `boolean` | 是否顯示 |
| `openerDeadline` | `string` | ISO-8601 倒數目標時間 |
| `message` | `string` | 後端提示訊息 |

Emits：
| Event | 說明 |
|-------|------|
| `close` | 玩家主動關閉 |
| `expired` | 倒數歸零（前台自行 reload） |

UI 元素：
- 半透明深色全屏 overlay
- 大型倒數計時器（`MM:SS`）
- 標題：「等待開套者指定大獎號碼」
- 提示說明文字（來自 `message`）
- 「稍後再試」關閉按鈕
- 倒數歸零後顯示「計時結束！現在可以成為開套者」並自動觸發 `expired` 事件

### FR-FE-005 — `IchibanDetail.vue` 整合等待 Overlay

在 template 中引入 `DesignationWaitingOverlay`，並管理其顯示狀態：

```typescript
const showWaitingOverlay = ref(false);
const waitingOpenerDeadline = ref('');
const waitingMessage = ref('');
let waitingPollInterval: ReturnType<typeof setInterval> | null = null;
```

- `showDesignationWaitingOverlay(deadline, message)` 輔助函式：設定 ref、顯示 overlay、並啟動 polling
- **Polling 邏輯**：overlay 開啟後，每 30 秒呼叫一次 `getLotterySession()`，若回傳 `designationDeadline === null`（指定完成）則停止 polling、關閉 overlay、呼叫 `reload()`
- `@expired` 處理：停止 polling，呼叫 `reload()`，關閉 overlay，顯示「計時結束，您已可嘗試成為開套者」 info dialog
- `@close` 處理：停止 polling，關閉 overlay
- **cleanup**：元件 `onUnmounted` 時清除 polling interval

### FR-FE-006 — 頁面載入時主動顯示等待 UI

`reload()` 函式取得 session 後，補充判斷邏輯：

```typescript
// 在 refreshSession() 完成後
const gameMode = detail.value?.gameMode;
if (gameMode === 'SCRATCH_PLAYER' && session.value) {
  const deadline = session.value.designationDeadline;
  const isOpenerLocal = session.value.isOpener;
  const designationDone = session.value.isDesignationComplete === true; // ← 後端明確訊號

  if (!designationDone && deadline && new Date(deadline) > new Date()) {
    if (!isOpenerLocal) {
      // 非開套者：主動顯示等待 overlay
      showDesignationWaitingOverlay(deadline, '開套者正在指定大獎位置，請稍候');
    }
    // 開套者：顯示橫幅（FR-FE-007）
  }
}
```

### FR-FE-007 — 開套者進場橫幅（需指定才能繼續）

在 `IchibanDetail.vue` 的 Info 區塊（`ichibanDetail__info` aside），新增條件式橫幅：

顯示條件：
- `isScratchMode && detail.value?.gameMode === 'SCRATCH_PLAYER'`
- `isOpener`（`session.value?.isOpener === true`）
- `!designationDone`（`session.value?.isDesignationComplete !== true`）

UI：
- 橙色警示橫幅（類似 `protection-badge`）
- 文字：「您是開套者，請先指定大獎號碼才能開始抽獎」
- 「立即指定」按鈕 → 觸發 `triggerDesignationFromSession()`

### FR-FE-008 — `triggerDesignationFromSession()` 函式

開套者從橫幅點「立即指定」時，需要取得 `availableNumbers` 與 `grandPrizes`：
1. 檢查 `availableTicketIds.value` 是否有可用 ticket；若為空，顯示「目前無可用格數，無法開始指定」info dialog 並中止。
2. 取 `availableTicketIds.value[0]` 作為 probe ticket UUID。
3. 呼叫 `drawLottery(kujiId, { count: 1, ticket: [probeTicketId] })`，後端將在驗證 ticket 前先攔截 `designationRequired` 並回傳所需資料。
4. 利用現有 `handleDesignatePrize(data.availableNumbers, data.grandPrizes)` 流程開啟 `PrizeDesignationDialog`。

### FR-FE-009 — 格子點擊的前置阻擋（非開套等待中）

`handleScratchCardSelect()` 與 `handleScratchFromPanel()` 中，在呼叫 draw 前增加前置判斷：
- 若 `showWaitingOverlay.value` 為 true（等待中）→ 直接 return，不呼叫 draw

---

## Key Data Flows

### 開套玩家流程

```
進入頁面
→ reload() → refreshSession()
→ session.isOpener = true, session.designationDeadline 存在, designatedWinningNumbers.length = 0
→ 顯示「立即指定」橫幅
→ 玩家點「立即指定」
→ triggerDesignationFromSession()
  → 取 availableTicketIds.value[0] 作為 probe UUID（若無 ticket 則顯示錯誤並中止）
  → drawLottery({ count: 1, ticket: [probeUUID] })
  → 後端回傳 designationRequired: true + availableNumbers + grandPrizes
→ handleDesignatePrize() → PrizeDesignationDialog（現有流程）
→ POST /designate
→ reload() → 顯示中獎號碼橫幅，進入正常刮格流程
```

### 非開套玩家流程（主動攔截）

```
進入頁面
→ reload() → refreshSession()
→ session.isOpener = false, session.designationDeadline 為未來時間
→ 自動顯示 DesignationWaitingOverlay（倒數計時）
→ 玩家等待或關閉
→ 倒數歸零 → reload() → 若成為新開套者 → 開套者橫幅
```

### 非開套玩家流程（被 draw API 攔截）

```
玩家點格子 → handleScratchCardSelect() → handleScratch()
→ drawLottery() → 後端回傳 awaitingDesignation: true + openerDeadline
→ showDesignationWaitingOverlay(openerDeadline, message)
→ 顯示 DesignationWaitingOverlay
```

---

## API Contract（前台需對接）

### `GET /lottery/draw/{id}/session` 回應更新

```typescript
interface SessionResponse {
  sessionId: string;
  isOpener: boolean;
  openerNickname: string | null;
  protectionDraws: number;
  protectionEndTime: string | null;
  openerDrawCount: number;
  freeDrawEnabled: boolean;
  status: string;
  canDraw?: boolean;
  cannotDrawReason?: string | null;
  designationDeadline?: string | null;    // ← 新增（前端倒數用）
  isDesignationComplete: boolean;         // ← 新增（前端 designationDone 唯一判斷訊號）
}
```

> **⚠️ 後端配合需求（T021 擴充）**：
> 請在 `LotteryDrawController.java` 的 `SessionResponse.from()` 方法中加入以下兩個欄位：
>
> ```java
> // 1. 指定截止時間（SCRATCH_PLAYER 開套者 10 分鐘倒數）
> private String designationDeadline;  // ISO-8601，null = 非 SCRATCH_PLAYER 或指定已完成
>
> // 2. 指定是否完成（前台 designationDone 唯一判斷訊號）
> private boolean isDesignationComplete;  // true = playerDesignatedNumbers != null && !blank
> ```
>
> 設定規則：
> - `isDesignationComplete = true` 當 `session.playerDesignatedNumbers != null && !session.playerDesignatedNumbers.isBlank()`
> - `isDesignationComplete = false` 當 `session.playerDesignatedNumbers` 為 null 或空白
> - 一番賞 / 扭蛋 / SCRATCH_STORE 商品：`isDesignationComplete = true`（無需指定流程，預設完成）

### `POST /lottery/draw/{id}/draw` 新回應格式（非開套等待）

```typescript
interface DesignationPendingResponse {
  awaitingDesignation: true;
  message: string;
  openerDeadline: string; // ISO-8601
}
```

現有 `designationRequired` 回應（開套者）不變：
```typescript
interface DesignationRequiredResponse {
  designationRequired: true;
  message: string;
  availableNumbers: number[];
  grandPrizes: GrandPrizeInfo[];
}
```

---

## Success Criteria（前台）

- **SC-FE-001**: `SCRATCH_PLAYER` 開套者進頁面，100% 看到橙色「立即指定」橫幅，點擊後直接進入號碼選擇畫面。
- **SC-FE-002**: 非開套玩家無論透過「點格子」還是「頁面載入 session 判斷」，100% 看到等待 overlay，看不到可操作的刮格按鈕。
- **SC-FE-003**: 倒數計時器每秒更新，誤差 ≤ 5 秒；歸零後 5 秒內觸發 reload。另：若開套者提前完成指定，非開套玩家的等待 overlay 在最多 **30 秒**內自動感知並關閉（polling 機制）。
- **SC-FE-004**: `SCRATCH_STORE` 商品的玩家進入頁面，不顯示任何指定相關 UI，直接看到正常籤位（與現有行為一致）。
- **SC-FE-005**: 一番賞（LOTTERY_MODE）與扭蛋（GACHA）的現有流程不受影響，100% 通過現有操作路徑。
- **SC-FE-006**: 指定完成後，`designatedWinningNumbers` 中獎號碼橫幅正確顯示（現有功能，確認不因本次修改而損壞）。

---

## Assumptions

- `detail.value?.gameMode` 由後端 `getBrowseLotteryById` 回傳，前台不需要額外 API 取 `gameMode`。
- `designationDone` 的判斷方式：`session.value?.isDesignationComplete === true`（後端 `SessionResponse` 明確欄位），不依賴 `designatedWinningNumbers` 陣列長度。
- 倒數計時器使用瀏覽器端 `setInterval`（每秒更新），元件卸載時清除計時器。
- `DesignationWaitingOverlay` 樣式沿用現有深色主題（背景 `rgba(0,0,0,0.85)`）。
- 非開套玩家關閉等待 overlay 後，若試圖點格子，`handleScratchCardSelect()` 應再次呼叫 draw，被後端攔截後重新顯示 overlay（不做前台靜默阻擋，以避免狀態同步問題）。
