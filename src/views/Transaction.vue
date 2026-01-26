<!-- src/views/Transaction.vue -->
<template>
  <section class="n-transaction-area">
    <h3 class="n-page-title">交易說明</h3>

    <!-- 1 -->
    <p class="n-transaction-title">代幣/點數購買須知</p>
    <ol class="n-ol">
      <li>
        請於購買前確認需求，本平台所販售之遊戲代幣（以下稱「代幣」），訂單成立後不得轉讓予第三人。
      </li>
      <li>
        代幣屬於平台內可使用之儲值點數，會員可於本平台進行抽賞、兌換或購買指定之商品與服務（實際可使用範圍依平台公告為準）。
      </li>
      <li>
        會員完成付款/儲值後，系統將以電子郵件或站內通知方式提供交易結果；惟該通知不等同於交易必然完成，本平台仍得依風控/付款狀態/交易條件確認結果後，認定契約成立與否。
      </li>
      <li>
        平台所有交易與使用紀錄，以系統記錄之電子資料為準。如發現異常（例如代幣數量不符、扣點異常等），請盡速聯繫客服以利查核。
      </li>
    </ol>

    <div class="n-hr-dashed" />

    <!-- 2 -->
    <p class="n-transaction-title">什麼狀況下會開立發票？</p>
    <p class="n-text">
      發票開立與載具規範依主管機關公告為準；若你有需要統編或捐贈設定，請於結帳流程依頁面指示填寫。
    </p>
    <ol class="n-ol">
      <li>
        代幣完成儲值後，系統將依會員資料與結帳設定自動開立電子發票並寄送至會員註冊信箱（或依你選擇之載具方式提供）。
      </li>
    </ol>
    <div class="n-callout" role="note">
      <div class="n-callout__dot" aria-hidden="true"></div>
      <div class="n-callout__body">
        若未收到發票通知，請先確認垃圾郵件匣或會員信箱設定，仍未收到再聯繫客服協助補寄/查詢。
      </div>
    </div>

    <div class="n-hr-dashed" />

    <!-- 3 -->
    <p class="n-transaction-title">退款/取消（代幣相關）</p>
    <ol class="n-ol">
      <li>
        若你欲申請取消已付款之代幣購買，需符合「尚未使用代幣」且在付款完成後七日內提出申請（實際受理仍依平台審核結果為準）。
      </li>
      <li>
        請透過客服信箱與我們聯繫，並提供：會員帳號、訂單編號、退款帳戶資訊與聯絡方式，以便核對與辦理。
      </li>
      <li>
        客服收到申請後，將通知你補齊必要資料；資料齊備後，退款作業通常需 14–18
        個工作天完成（可能因銀行作業日或付款方式而異），並可能扣除必要之手續費用（若有）。
      </li>
    </ol>

    <div class="n-hr-dashed" />

    <!-- 4 -->
    <p class="n-transaction-title">儲值流程教學</p>
    <ol class="n-ol">
      <li>
        登入會員 → 前往「會員中心」→ 選擇「代幣儲值」→ 挑選欲購買的代幣方案 →
        確認送出。
      </li>
      <li>
        進入付款頁面後，依指示完成信用卡/支付工具驗證（例如簡訊驗證碼）→
        儲值完成。
      </li>
    </ol>

    <div class="n-hr-dashed" />

    <!-- 5 -->
    <p class="n-transaction-title">紅利/免運券 累積與使用說明</p>
    <ol class="n-ol">
      <li>
        紅利與免運券可透過登入活動、遊戲活動或平台指定任務獲得；免運券可能有使用期限（以券面或活動說明為準），請於期限內使用。
      </li>
      <li>
        由紅利/免運券折抵或兌換之項目，若為不可退回之數位權益或已使用之優惠，將無法要求退回紅利/免運券或折抵金額。
      </li>
      <li>
        平台得因活動調整需要，保留修改、終止活動或變更優惠內容之權利，並以平台公告為準。
      </li>
    </ol>

    <div class="n-hr-dashed" />

    <!-- 6 -->
    <p class="n-transaction-title">遊戲獎品與商品說明</p>
    <ol class="n-ol">
      <li>
        商品圖片可能因螢幕顯示設定而與實品略有差異，圖片僅供參考，請以實際商品顏色與規格為準。
      </li>
      <li>
        若屬大量生產之商品，可能出現輕微塗裝、溢漆、細微擦痕或色差等非功能性差異，通常不視為重大瑕疵；如你對盒況或外觀要求較高，建議審慎評估後再參與。
      </li>
      <li>出貨/到貨時間為預估值，實際仍依原廠或供應商公告與物流作業為準。</li>
    </ol>

    <div class="n-hr-dashed" />

    <!-- 7 -->
    <p class="n-transaction-title">寄送與保管說明</p>
    <ol class="n-ol">
      <li>
        超商取貨若因逾期未取而退回，平台可能會依你的設定以代幣/紅利/免運券等方式扣抵再次寄送（若適用，細則以平台公告為準）。
      </li>
      <li>
        若獎品在平台保管達一定天數（例如自最後獲取獎品日起算），平台可能會依規則自動安排寄送至你的預設地址；請確保會員資料中的收件資訊正確。
      </li>
      <li>
        收到商品如有缺件、明顯破損或功能異常，請於 3
        天內完成開箱錄影並聯繫客服，並提供影片作為判定依據；逾期可能無法受理。
      </li>
      <li>
        運送途中外盒可能因搬運產生擠壓或碰撞痕跡，平台無法保證外盒完全無傷，若你非常在意盒況請審慎評估後再購買/遊玩。
      </li>
      <li>
        若自動寄出商品無人收件/拒收/地址錯誤而導致退件，可能視同放棄該次寄送權益；平台得依規則處理後續寄送或保管方式。
      </li>
    </ol>

    <div class="n-hr-dashed" />

    <!-- 8 -->
    <p class="n-transaction-title">系統安全與服務可用性</p>
    <ol class="n-ol">
      <li>
        本平台將以現有技術與合理範圍維護服務品質，但不對速度、完整性、即時性或完全不中斷提供任何明示或默示保證。
      </li>
      <li>
        平台不保證電子郵件、檔案或資料傳輸必然無誤；若因不可歸責於平台之事由造成遺失、延遲或錯誤所生損害，平台不負賠償責任。
      </li>
      <li>
        發生下列情形之一時，平台得暫停或中斷服務：
        <div class="n-subList">
          <p>3.1 電子通信設備維護或施工；</p>
          <p>3.2 突發性設備故障；</p>
          <p>3.3 電子通信服務提供者停止或中斷服務；</p>
          <p>3.4 天災或其他不可抗力因素。</p>
        </div>
      </li>
    </ol>

    <div class="n-hr-dashed" />

    <!-- 9 -->
    <p class="n-transaction-title">相關法律與權益</p>
    <ol class="n-ol">
      <li>
        會員同意其使用、交易、兌換等行為，以平台所記錄之電子資料為準；如有爭議，亦以該電子資料作為主要認定依據。
      </li>
      <li>
        若平台依規範停用或限制你的帳號，你可能無法登入與存取帳戶資料、帳戶內權益（含代幣、紅利、免運券等），並將依相關規範處理。
      </li>
      <li>
        平台各項活動與規則得依實際營運狀況調整，平台保留修改、暫停或終止活動之權利，並以公告為準。
      </li>
      <li>
        本頁內容之解釋與適用，及因交易行為產生之爭議，悉依中華民國法律處理；管轄法院以平台公告或法律強制規定為準。
      </li>
    </ol>

    <p class="n-transaction-title n-transaction-title--plain">權利保留</p>
    <p class="n-text">
      本平台保留會員註冊審核、訂單條件確認、商品兌換規則、價格調整及本頁內容修改之權利；相關變更將以平台公告或頁面更新為準。
    </p>

    <div class="n-bottom-space" />
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.n-transaction-area {
  max-width: 980px;
  margin: 0 auto;
  padding: 28px 16px 64px;
  color: #111;
}

/* Title */
.n-page-title {
  margin: 0 0 18px;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.02em;
}

/* Section Title */
.n-transaction-title {
  margin: 18px 0 10px;
  font-size: 15px;
  font-weight: 900;
  color: #111;
}

.n-transaction-title--plain {
  margin-top: 22px;
}

/* Text */
.n-text {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.9;
  color: #444;
}

/* List */
.n-ol {
  margin: 0;
  padding-left: 18px;
  font-size: 14px;
  line-height: 1.9;
  color: #444;

  li {
    margin: 6px 0;
  }
}

/* dashed hr */
.n-hr-dashed {
  margin: 16px 0;
  height: 1px;
  width: 100%;
  background-image: repeating-linear-gradient(
    90deg,
    #d9d9d9 0px,
    #d9d9d9 8px,
    transparent 8px,
    transparent 14px
  );
}

/* callout */
.n-callout {
  margin: 12px 0 0;
  padding: 12px 12px;
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid #eee;
  display: flex;
  gap: 10px;
  align-items: flex-start;

  &__dot {
    width: 10px;
    height: 10px;
    margin-top: 6px;
    border-radius: 999px;
    background: #111;
    flex: 0 0 auto;
    opacity: 0.75;
  }

  &__body {
    font-size: 13px;
    line-height: 1.8;
    color: #555;
  }
}

/* sub list 3.1~3.4 */
.n-subList {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px dashed #e5e5e5;

  p {
    margin: 6px 0;
    color: #555;
    font-size: 13px;
    line-height: 1.7;
  }
}

/* spacing */
.n-bottom-space {
  height: 8px;
}

/* RWD */
@media (max-width: 640px) {
  .n-transaction-area {
    padding: 22px 14px 56px;
  }

  .n-page-title {
    font-size: 20px;
  }

  .n-transaction-title {
    font-size: 14px;
  }

  .n-text,
  .n-ol {
    font-size: 13px;
  }
}

/* Print friendly */
@media print {
  .n-transaction-area {
    max-width: none;
    padding: 0;
  }
  .n-hr-dashed {
    background-image: none;
    border-top: 1px dashed #bbb;
  }
}
</style>
