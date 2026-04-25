 📋 前台前端 API 文件

   Base URL: http://18.179.187.129/api
   認證: Authorization: Bearer {USER_TOKEN}

  ----------------------------------------------------------------------------------------------------------------

  📸 一、頭像上傳（已修復）

   舊路由 /api/user/avatar 與新路由 /api/user/me/avatar 現在都可用，效果相同

  方式 A：只上傳，取回 URL（兩步驟用）

   POST /api/user/me/avatar
   Content-Type: multipart/form-data

  ┌────────┬─────────────────────────────────────────────┐
  │ 欄位   │ 說明                                        │
  ├────────┼─────────────────────────────────────────────┤
  │ file   │ 圖片檔案（最大 5MB，支援 jpg/png/gif/webp） │
  └────────┴─────────────────────────────────────────────┘

  Response

   {
     "imageUrl": "https://xxx.s3.amazonaws.com/user/uuid_avatar.jpg"
   }

   拿到 URL 後，再呼叫 PUT /api/user/me 更新 avatar 欄位

  ----------------------------------------------------------------------------------------------------------------

  方式 B：上傳 + 直接更新（一步到位，推薦）

   POST /api/user/me/avatar/update
   Content-Type: multipart/form-data

  Request 同上，傳 file 欄位

  Response — 完整的 UserRes（含更新後的 avatar URL）

   {
     "id": "uuid",
     "email": "user@example.com",
     "nickname": "測試用戶",
     "avatar": "https://xxx.s3.amazonaws.com/user/new_avatar.jpg",
     "goldCoins": 5000,
     "bonusCoins": 200
   }

  ----------------------------------------------------------------------------------------------------------------

  💳 二、支付方式查詢（公開，不需要 Token）

   GET /api/recharge/payment-methods

  Response

   [
     {
       "code": "GOMYPAY",
       "name": "信用卡 / 行動支付",
       "description": "透過 GoMyPay 金流平台付款，支援 VISA、MasterCard、JCB 及街口、LINE Pay 等行動支付"
     }
   ]

   目前只有一種支付方式。建議在儲值頁面 call 此 API 動態顯示，方便未來擴充。

  ----------------------------------------------------------------------------------------------------------------

  💰 三、儲值（需 Token）

   POST /api/recharge
   Authorization: Bearer {USER_TOKEN}
   Content-Type: application/json

  Request Body

   {
     "planId": "儲值方案UUID",
     "paymentMethod": "GOMYPAY"
   }

   ⚠️ paymentMethod 現在是選填，預設 "GOMYPAY"，可省略

  Response

   {
     "orderId": "uuid",
     "status": "COMPLETED",
     "planName": "NT$500 方案",
     "amount": 500,
     "bonusGranted": 50,
     "goldAfter": 5500,
     "bonusAfter": 250,
     "paymentUrl": null
   }

   目前是測試模式，paymentUrl 為 null，儲值直接完成。

  ----------------------------------------------------------------------------------------------------------------

  📦 四、儲值方案查詢（公開，不需要 Token）

   GET /api/recharge-plans

  Response

   [
     {
       "id": "uuid",
       "name": "NT$500 方案",
       "price": 500,
       "goldCoins": 500,
       "bonusCoins": 50,
       "isActive": true
     }
   ]
