# Plan: 04 - 抽獎核心流程

> Branch: `feat/04-draw-flow`
> Worktree: `../kuji-client--feat-04/`
> 依賴: `fix/critical-bugs` + `feat/03-lottery-browse` 建議先完成

---

## 型別修正

### lotteryDrawService.ts

```typescript
// 修正前
ticketNumber?: number

// 修正後（格式如 "042"，為字串）
ticketNumber?: string
```

### SessionResponse 對齊後端實際欄位

```typescript
interface SessionResponse {
  sessionId: string
  status: string
  isDesignationComplete: boolean     // 非 grandPrizesDesignated
  openerNickname: string | null
  canDraw: boolean
  cannotDrawReason: string | null
  protectionDraws: number
  freeDrawEnabled: boolean
}
```

---

## 元件邊界

```
IchibanDetail.vue（view，薄 shell）
  ├── IchibanDrawPanel.vue（LOTTERY_MODE 一番賞/卡牌）
  │   ├── DrawResultDisplay.vue（開獎動畫 + 結果展示）
  │   └── ProtectionTimer.vue（倒數計時，protectionEndTime 有值才顯示）
  ├── IchibanScratchPanel.vue（SCRATCH_MODE 刮刮樂）
  │   ├── PrizeDesignationDialog.vue（Opener 指定大獎位置）
  │   └── DesignationWaitingOverlay.vue（等待狀態 UI + 輪詢）
  └── GachaView.vue（GACHA 扭蛋）

Composables:
  useDrawFlow.ts（抽獎邏輯：三種回應判斷）
  useSessionPoller.ts（designationPending 輪詢）
  useProtectionTimer.ts（倒數計時邏輯）
```

---

## useDrawFlow.ts 設計

```typescript
export function useDrawFlow(lotteryId: Ref<string>) {
  const isLoading = ref(false)
  const results = ref<DrawResult[]>([])
  const protectionEndTime = ref<string | null>(null)
  const designationRequired = ref(false)
  const designationPending = ref(false)
  const availableNumbers = ref<string[]>([])
  const grandPrizes = ref<GrandPrize[]>([])

  async function draw() {
    const res = await lotteryDrawService.drawLottery(lotteryId.value)
    const data = res.data?.data
    if (data?.results) {
      // 情況 1: 正常開獎
      results.value = data.results
      protectionEndTime.value = data.protectionEndTime
      memberWallet.updateBalance(data.remainingGold, data.remainingBonus)
    } else if (data?.designationRequired) {
      // 情況 2: 需指定大獎
      designationRequired.value = true
      availableNumbers.value = data.availableNumbers
      grandPrizes.value = data.grandPrizes
    } else if (data?.designationPending) {
      // 情況 3: 等待指定
      designationPending.value = true
      startPolling()
    }
  }

  return { isLoading, results, protectionEndTime, designationRequired, designationPending, draw }
}
```

---

## useSessionPoller.ts 設計

```typescript
// 間隔 3 秒輪詢，isDesignationComplete = true 時停止
export function useSessionPoller(lotteryId: Ref<string>, onComplete: () => void) {
  let timer: ReturnType<typeof setInterval> | null = null

  function startPolling() {
    timer = setInterval(async () => {
      const session = await lotteryDrawService.getLotterySession(lotteryId.value)
      if (session.data?.data?.isDesignationComplete) {
        stopPolling()
        onComplete()
      }
    }, 3000)
  }

  function stopPolling() {
    if (timer) clearInterval(timer)
    timer = null
  }

  onUnmounted(stopPolling)
  return { startPolling, stopPolling }
}
```
