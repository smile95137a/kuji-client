你是本專案前端工程師（同時負責前台 + 後台），請依照以下「後端已改動內容」完成對接。請輸出：
  1) 影響清單
  2) 必改頁面與欄位
  3) API 對接程式碼調整點
  4) 驗收測試清單

  【後端已合併到 main 的報表改增/整合報表 API（後台）：
    - POST /admin/report/prize-shipment
    - POST /admin/report/member-growth
    - POST /admin/report/lottery-sales
    - POST /admin/report/store-performance
  - 角色規則：
    - Admin 可查全平台
    - StoreOwner 只能查自己的 store（後端會覆蓋或限制 storeId）
  - 報表查詢 request 型態皆為 QueryReq<Condition> 風格，需保留 sortBy/sortOrder/condition 結構。

  【同批後端業務規則（商品/抽eshold 改為「選填」：
    - NULL = 店家未啟用免費抽/免單機制
    - 只有店家啟用免費抽時，freeDrawThreshold 才必須 >= 1
    - 不得因 freeDrawThreshold = NULL 導致刮刮樂商品建立失敗
  - paymentType 僅 GOLD/BONUS（不再使用 FREE）
  - 非 DRAFT 狀態不得修改 paymentType
  - allowMultiDraw / multiDrawOptions 屬舊欄位（deprecated），前端新流程不應再依賴
  - 抽獎結果 costType 需顯示實際 paymentType（GOLD 或 BONUS）

  【後台前端必立/編輯頁：
    - freeDrawThreshold 改為可為 null
    - 新增「是否啟用免費抽機制」UI，未啟用時送 null
    - 啟用時驗證 freeDrawThreshold >= 1
    - paymentType 僅提供 GOLD/BONUS
    - 非 DRAFT 時鎖定 paymentType 欄位不可編輯
  - 報表頁：
    - 補上 prize-shipment / member-growth / lottery-sales / store-performance 對應查詢與表格
    - StoreOwner 視角不要提供跨店查詢 UI（或顯示但不可變更）
  - 錯誤處理：
    - 403（越權店家查詢）要有明確提示
    - 驗證錯誤（例如 freeDrawThreshold）要顯示欄位級錯誤訊息

  【前台前端必做 抽獎/消費顯示文案與紀錄：
    - 依回傳 costType/paymentType 顯示 GOLD 或 BONUS 扣款
    - 不可再假設一律 GOLD
  - 若前台有顯示免費抽門檻：
    - 當 freeDrawThreshold 為 null 時，視為未啟用，不顯示門檻提示
    - 有值時才顯示門檻文案

  【請產出- freeDrawThreshold = null 可建立刮刮樂商品
  - 啟用免費抽且門檻 < 1 會被擋下
  - 非 DRAFT 編輯 paymentType 被拒絕
  - StoreOwner 查其他店報表回 403
  - 抽獎紀錄在 GOLD/BONUS 兩種支付模式下顯示正確