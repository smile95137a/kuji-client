<!-- src/views/Policy.vue -->
<template>
  <div class="policy">
    <!-- Hero -->
    <section class="policy__hero">
      <div class="policy__heroInner">
        <div class="policy__heroLeft">
          <p class="policy__badge">TERMS</p>
          <h1 class="policy__title">STARDO 網站服務條款</h1>
          <p class="policy__subtitle">
            歡迎你使用 STARDO。本頁為 STARDO
            網站與相關服務之使用條款，說明你在註冊、登入、
            抽選/刮刮樂、儲值、兌換、出貨、客服與其他功能使用時，彼此的權利義務與重要規範。
            若你不同意本條款全部或部分內容，請停止使用本服務。
          </p>

          <div class="policy__heroActions">
            <button
              class="policy__btn policy__btn--primary"
              type="button"
              @click="scrollTo('content')"
            >
              查看條款
            </button>
          </div>

          <div class="policy__hint" role="note">
            <span class="policy__hintIcon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'file-signature']" />
            </span>
            <span class="policy__hintText">
              條款可能因營運需求更新。你於更新後繼續使用服務，視為同意更新內容。
            </span>
          </div>
        </div>

        <aside class="policy__heroRight">
          <div class="policy__panel">
            <div class="policy__panelHeader">
              <p class="policy__panelTitle">快速導覽</p>
              <p class="policy__panelDesc">點選可跳到對應段落。</p>
            </div>

            <div class="policy__nav">
              <button
                class="policy__chip"
                type="button"
                @click="scrollTo('s1')"
              >
                <span class="policy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'circle-question']" />
                </span>
                條款適用與同意
              </button>

              <button
                class="policy__chip"
                type="button"
                @click="scrollTo('s2')"
              >
                <span class="policy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'user-shield']" />
                </span>
                帳號與安全
              </button>

              <button
                class="policy__chip"
                type="button"
                @click="scrollTo('s3')"
              >
                <span class="policy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'coins']" />
                </span>
                代幣/點數與儲值
              </button>

              <button
                class="policy__chip"
                type="button"
                @click="scrollTo('s4')"
              >
                <span class="policy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'cart-shopping']" />
                </span>
                訂單與交易
              </button>

              <button
                class="policy__chip"
                type="button"
                @click="scrollTo('s5')"
              >
                <span class="policy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'truck']" />
                </span>
                兌換/寄送/保管
              </button>

              <button
                class="policy__chip"
                type="button"
                @click="scrollTo('s6')"
              >
                <span class="policy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'scale-balanced']" />
                </span>
                禁止行為與違約
              </button>

              <button
                class="policy__chip"
                type="button"
                @click="scrollTo('s7')"
              >
                <span class="policy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'copyright']" />
                </span>
                智慧財產權
              </button>

              <button
                class="policy__chip"
                type="button"
                @click="scrollTo('s8')"
              >
                <span class="policy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
                </span>
                服務中斷與免責
              </button>

              <button
                class="policy__chip"
                type="button"
                @click="scrollTo('s9')"
              >
                <span class="policy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'envelope']" />
                </span>
                聯絡方式
              </button>
            </div>

            <div class="policy__panelFooter">
              <button
                class="policy__miniBtn policy__miniBtn--gold"
                type="button"
                @click="scrollTo('s9')"
              >
                聯絡我們
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Content -->
    <section class="policy__section" id="content">
      <div class="policy__container">
        <header class="policy__header">
          <h2 class="policy__h2">服務條款內容</h2>
          <p class="policy__desc">
            以下條款為一般性規範，實際交易與功能細則仍以各頁面規則、結帳顯示、活動說明與平台公告為準。
          </p>
        </header>

        <div class="policy__grid">
          <!-- s1 -->
          <article class="policy__card" id="s1">
            <div class="policy__cardTop">
              <span class="policy__cardBadge">
                <span class="policy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'circle-question']" />
                </span>
                條款適用與同意
              </span>
              <h3 class="policy__cardTitle">使用本服務即表示同意</h3>
              <p class="policy__cardDesc">
                STARDO（以下稱「本平台」）提供線上抽選、刮刮樂、儲值、兌換與相關電商服務。
                你在註冊會員、登入、下單或使用任何功能前，應閱讀並同意本條款與本平台公告之相關規範。
              </p>
            </div>

            <ul class="policy__list">
              <li class="policy__item">
                你完成註冊或使用本服務，即表示你已閱讀、理解並同意本條款全部內容。
              </li>
              <li class="policy__item">
                本平台得因營運需求更新條款，更新後公布於本頁或以平台公告方式提示。
                你於更新後繼續使用服務，視為同意更新內容。
              </li>
              <li class="policy__item">
                若你未滿二十歲，應由法定代理人閱讀、理解並同意本條款後，方可使用或繼續使用本服務。
              </li>
            </ul>

            <div class="policy__reserve">
              <p class="policy__reserveTitle">與其他規範的關係</p>
              <p class="policy__reserveText">
                若本條款與個別活動規則、商品頁說明或結帳頁顯示內容有差異，以個別規則或結帳顯示為準。
              </p>
            </div>
          </article>

          <!-- s2 -->
          <article class="policy__card" id="s2">
            <div class="policy__cardTop">
              <span class="policy__cardBadge">
                <span class="policy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'user-shield']" />
                </span>
                帳號與安全
              </span>
              <h3 class="policy__cardTitle">帳號、密碼與使用責任</h3>
              <p class="policy__cardDesc">
                為保障交易安全，你需要使用電子郵件（或平台支援之第三方登入方式）建立帳號並設定密碼。
                你應確保帳號資訊正確並妥善保管登入憑證。
              </p>
            </div>

            <ul class="policy__list">
              <li class="policy__item">
                請勿將帳號、密碼或驗證碼提供給第三人，亦不得與他人共用帳號。
              </li>
              <li class="policy__item">
                建議使用不同於其他網站的密碼，並定期更新，以降低風險。
              </li>
              <li class="policy__item">
                以你的帳號完成之登入與操作，推定為你本人行為；若有異常或疑似遭冒用，請立即通知客服。
              </li>
              <li class="policy__item">
                你應提供真實、完整且最新之會員資料；若資料不實或冒用他人資訊，本平台得限制或終止你的使用權限。
              </li>
            </ul>

            <div class="policy__callout" role="note">
              <span class="policy__calloutIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
              </span>
              <p class="policy__calloutText">
                若你收到可疑郵件或訊息要求提供帳密/驗證碼，請勿提供並立即聯繫客服確認。
              </p>
            </div>
          </article>

          <!-- s3 -->
          <article class="policy__card" id="s3">
            <div class="policy__cardTop">
              <span class="policy__cardBadge">
                <span class="policy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'coins']" />
                </span>
                代幣/點數與儲值
              </span>
              <h3 class="policy__cardTitle">代幣用途、限制與確認</h3>
              <p class="policy__cardDesc">
                本平台可能提供可於平台內使用的代幣/點數（以下統稱「代幣」）作為付款或參與抽選/刮刮樂之媒介。
                代幣僅限於本平台使用，且不得任意轉讓或兌換為現金（除法律另有規定或平台公告者外）。
              </p>
            </div>

            <ul class="policy__list">
              <li class="policy__item">
                儲值完成後，本平台將依系統紀錄更新你的代幣餘額；若有異常請盡速聯繫客服查核。
              </li>
              <li class="policy__item">
                系統通知（Email/站內通知）僅為交易訊息提示，不代表交易必然完成或契約成立；
                是否成立以付款狀態、風控結果與系統最終紀錄為準。
              </li>
              <li class="policy__item">
                代幣可用範圍、活動回饋、折抵限制與有效期限（若有）以平台公告或各活動規則為準。
              </li>
            </ul>

            <div class="policy__reserve">
              <p class="policy__reserveTitle">儲值與退款原則</p>
              <p class="policy__reserveText">
                若你申請取消或退款，需符合平台規則（例如未使用之代幣、申請期限、付款方式限制等），
                實際受理與處理時間仍以本平台審核與金流作業為準。
              </p>
            </div>
          </article>

          <!-- s4 -->
          <article class="policy__card" id="s4">
            <div class="policy__cardTop">
              <span class="policy__cardBadge">
                <span class="policy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'cart-shopping']" />
                </span>
                訂單與交易
              </span>
              <h3 class="policy__cardTitle">下單流程、契約成立與限制</h3>
              <p class="policy__cardDesc">
                商品頁面所示之名稱、價格、規格、活動規則與注意事項，均為交易契約的一部分。
                你應於下單前確認內容、數量、收件資訊與金額。
              </p>
            </div>

            <ul class="policy__list">
              <li class="policy__item">
                你送出訂單後，本平台仍得基於交易條件、庫存狀態、風險控管或系統異常等正當理由拒絕或取消訂單。
              </li>
              <li class="policy__item">
                特定商品或活動可能設有購買/參與上限；同一會員以多帳號或其他方式規避限制者，本平台得取消相關權益。
              </li>
              <li class="policy__item">
                折扣、優惠券、紅利與免運券等使用方式與限制，以結帳頁顯示、券面條款或活動規則為準。
              </li>
              <li class="policy__item">
                交易與使用紀錄以本平台系統所保存之電子資料為準；若有爭議，亦以該資料作為主要認定依據。
              </li>
            </ul>

            <div class="policy__callout" role="note">
              <span class="policy__calloutIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'circle-info']" />
              </span>
              <p class="policy__calloutText">
                有關發票、出貨、取消、保管與其他未盡事項，可另參考本平台「交易說明」與各頁面公告。
              </p>
            </div>
          </article>

          <!-- s5 -->
          <article class="policy__card" id="s5">
            <div class="policy__cardTop">
              <span class="policy__cardBadge">
                <span class="policy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'truck']" />
                </span>
                兌換/寄送/保管
              </span>
              <h3 class="policy__cardTitle">獎品與商品之寄送處理</h3>
              <p class="policy__cardDesc">
                你在本平台獲得之獎品或兌換商品，可能涉及保管、寄送、超商取貨或宅配等流程。
                寄送與保管規則以各商品頁、兌換頁與平台公告為準。
              </p>
            </div>

            <ul class="policy__list">
              <li class="policy__item">
                請確保會員資料與收件資訊正確；因地址錯誤、拒收或逾期未取所致的退件，可能影響再次寄送與相關費用負擔。
              </li>
              <li class="policy__item">
                商品圖片可能因螢幕顯示而有差異；量產品可能存在非功能性細微差異（例如塗裝、外盒輕微壓痕），以實際商品狀況為準。
              </li>
              <li class="policy__item">
                若收到商品有缺件、明顯破損或功能異常，請於平台規範期限內（例如收貨後數日內）完成開箱錄影並聯繫客服。
              </li>
            </ul>

            <div class="policy__reserve">
              <p class="policy__reserveTitle">保管與自動處理</p>
              <p class="policy__reserveText">
                若平台提供保管服務，本平台可能依規則於保管期限到期時自動安排寄送或其他處理。
                相關條件以平台公告與你的會員設定為準。
              </p>
            </div>
          </article>

          <!-- s6 -->
          <article class="policy__card" id="s6">
            <div class="policy__cardTop">
              <span class="policy__cardBadge">
                <span class="policy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'scale-balanced']" />
                </span>
                禁止行為與違約
              </span>
              <h3 class="policy__cardTitle">為維護平台公平與安全</h3>
              <p class="policy__cardDesc">
                為保障所有使用者權益，本平台禁止任何影響平台正常運作、破壞公平或違反法令之行為。
                若你違反，本平台得限制或終止你的使用權利。
              </p>
            </div>

            <ul class="policy__list">
              <li class="policy__item">
                提供不實資料、冒用他人身份、偽造或變造交易資料。
              </li>
              <li class="policy__item">
                未經授權使用他人付款工具、疑似盜刷或洗錢等可疑行為。
              </li>
              <li class="policy__item">
                以程式、外掛、爬蟲或其他方式干擾系統、竄改資料或大量異常請求。
              </li>
              <li class="policy__item">
                惡意濫用退款/取消、重複下單規避限制、或不當取得優惠利益。
              </li>
              <li class="policy__item">
                對客服或平台人員進行騷擾、威脅、辱罵或其他不當言行。
              </li>
              <li class="policy__item">
                其他違反法令、本條款或平台公告之行為。
              </li>
            </ul>

            <div class="policy__callout" role="note">
              <span class="policy__calloutIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
              </span>
              <p class="policy__calloutText">
                若因你的違規造成平台或第三人損害，你可能需負擔相關賠償責任；平台亦得採取必要之風控或法律措施。
              </p>
            </div>
          </article>

          <!-- s7 -->
          <article class="policy__card" id="s7">
            <div class="policy__cardTop">
              <span class="policy__cardBadge">
                <span class="policy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'copyright']" />
                </span>
                智慧財產權
              </span>
              <h3 class="policy__cardTitle">內容與素材之權利歸屬</h3>
              <p class="policy__cardDesc">
                本平台上的文字、圖片、設計、程式、商標、版面與其他內容（包含但不限於商品圖、活動圖、介面設計與程式碼），
                均受著作權、商標法、專利法、營業秘密或其他法令保護。
              </p>
            </div>

            <ul class="policy__list">
              <li class="policy__item">
                未經本平台或權利人事先書面同意，不得重製、改作、公開傳輸、散布或商業使用。
              </li>
              <li class="policy__item">
                你上傳或提供給平台之內容（若有）應保證不侵害第三人權利；若涉侵權你應自負責任。
              </li>
              <li class="policy__item">
                本平台得為提供服務之必要，在合理範圍內展示你所提供內容（例如評價、留言或客服附件）。
              </li>
            </ul>
          </article>

          <!-- s8 -->
          <article class="policy__card" id="s8">
            <div class="policy__cardTop">
              <span class="policy__cardBadge">
                <span class="policy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
                </span>
                服務中斷與免責
              </span>
              <h3 class="policy__cardTitle">維運、暫停與風險說明</h3>
              <p class="policy__cardDesc">
                本平台會在合理技術範圍內維護服務品質，但不保證服務永遠不中斷或完全無誤。
                當發生維護、突發故障或不可抗力因素時，平台可能暫停或中斷部分或全部服務。
              </p>
            </div>

            <ul class="policy__list">
              <li class="policy__item">系統維護、搬遷、升級、保養或修復。</li>
              <li class="policy__item">
                電信或第三方服務中斷、設備故障或不可歸責於平台之原因。
              </li>
              <li class="policy__item">
                天災、停電、網路攻擊或其他不可抗力事件。
              </li>
              <li class="policy__item">
                為維護平台安全、公平或依法配合要求所採取之必要措施。
              </li>
            </ul>

            <div class="policy__reserve">
              <p class="policy__reserveTitle">提前公告</p>
              <p class="policy__reserveText">
                若為可預期之維護計畫，平台會盡可能提前以網站公告或社群公告方式提示。
              </p>
            </div>
          </article>

          <!-- s9 -->
          <article class="policy__card" id="s9">
            <div class="policy__cardTop">
              <span class="policy__cardBadge">
                <span class="policy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'envelope']" />
                </span>
                聯絡方式
              </span>
              <h3 class="policy__cardTitle">問題諮詢與爭議處理</h3>
              <p class="policy__cardDesc">
                若你對本條款、交易、儲值或權益有疑問，可透過客服管道聯繫我們。
                為加速處理，建議提供會員帳號、訂單編號與相關截圖/影片佐證（若適用）。
              </p>
            </div>

            <div class="policy__contact">
              <div class="policy__contactRow">
                <span class="policy__contactKey">
                  <font-awesome-icon :icon="['fas', 'at']" />
                  客服信箱
                </span>
                <span class="policy__contactVal">service@stardo.example</span>
              </div>

              <div class="policy__contactRow">
                <span class="policy__contactKey">
                  <font-awesome-icon :icon="['fas', 'clock']" />
                  客服時間
                </span>
                <span class="policy__contactVal">以平台公告為準</span>
              </div>

              <div class="policy__contactRow">
                <span class="policy__contactKey">
                  <font-awesome-icon :icon="['fas', 'scale-balanced']" />
                  準據法
                </span>
                <span class="policy__contactVal">中華民國法律</span>
              </div>
            </div>

            <div class="policy__callout" role="note">
              <span class="policy__calloutIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'circle-info']" />
              </span>
              <p class="policy__calloutText">
                上述信箱為範例字串。你可改成實際客服信箱，或改成從設定檔帶入。
                公司名稱、統編、地址等資訊亦可在你確定後補上。
              </p>
            </div>
          </article>
        </div>

        <div class="policy__cta">
          <div class="policy__ctaLeft">
            <p class="policy__ctaTitle">相關頁面</p>
            <p class="policy__ctaDesc">
              你也可以查看「交易說明」「FAQ」「隱私權政策」以了解更多細則與常見問題。
            </p>
          </div>

          <div class="policy__ctaRight">
            <button
              class="policy__btn policy__btn--primary"
              type="button"
              @click="goFaq"
            >
              前往 FAQ
            </button>
            <button
              class="policy__btn policy__btn--ghost"
              type="button"
              @click="goTransaction"
            >
              交易說明
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const router = useRouter();

const goFaq = () => router.push({ name: 'Faq' });
const goTransaction = () => router.push({ name: 'Transaction' });

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
</script>

<style scoped lang="scss">
.policy {
  background: linear-gradient(180deg, #f4e1cc 0%, #f8efe3 40%, #ffffff 100%);
  min-height: 100vh;
  position: relative;
  z-index: 9;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Hero */
  &__hero {
    background: #000;
    color: #fff;
    padding: 34px 0 28px;
  }

  &__heroInner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;

    display: grid;
    grid-template-columns: 1.12fr 0.88fr;
    gap: 24px;
    align-items: stretch;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    letter-spacing: 2px;
    font-weight: 900;
    color: rgba(229, 166, 87, 0.95);
    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.35);
    margin: 0 0 10px;
  }

  &__title {
    font-size: 34px;
    line-height: 1.15;
    margin: 0 0 10px;
    font-weight: 1000;
    letter-spacing: 0.2px;
  }

  &__subtitle {
    margin: 0 0 18px;
    font-size: 15px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.82);
    max-width: 640px;
  }

  &__heroActions {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  &__btn {
    height: 52px;
    padding: 0 18px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 15px;
    border: 0;
    cursor: pointer;
    letter-spacing: 1px;

    &--primary {
      background: #b2473a;
      color: #fff;
    }

    &--ghost {
      background: transparent;
      color: rgba(229, 166, 87, 0.95);
      border: 1px solid rgba(229, 166, 87, 0.55);
    }
  }

  &__hint {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    color: rgba(255, 255, 255, 0.78);
    font-size: 13px;
    line-height: 1.7;
    max-width: 640px;
  }

  &__hintIcon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;

    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.22);
    color: rgba(229, 166, 87, 0.95);
    flex: 0 0 auto;
  }

  &__heroRight {
    display: flex;
    justify-content: flex-end;
  }

  &__panel {
    width: 100%;
    max-width: 460px;
    border-radius: 18px;
    padding: 16px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.04)
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__panelHeader {
    margin-bottom: 10px;
  }

  &__panelTitle {
    margin: 0 0 6px;
    font-weight: 1000;
    letter-spacing: 1px;
    font-size: 16px;
  }

  &__panelDesc {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.78);
  }

  &__nav {
    margin-top: 12px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  &__chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px;
    border-radius: 14px;
    cursor: pointer;

    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);

    font-weight: 1000;
    letter-spacing: 0.4px;
    font-size: 14px;
    text-align: left;

    &:hover {
      border-color: rgba(229, 166, 87, 0.35);
    }
  }

  &__chipIcon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;

    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.22);
    color: rgba(229, 166, 87, 0.95);
    flex: 0 0 auto;
  }

  &__panelFooter {
    margin-top: 12px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  &__miniBtn {
    height: 40px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(0, 0, 0, 0.25);
    color: rgba(255, 255, 255, 0.9);
    font-weight: 900;
    cursor: pointer;

    &--gold {
      background: rgba(229, 166, 87, 0.9);
      border-color: rgba(229, 166, 87, 0.9);
      color: #000;
    }
  }

  /* Content */
  &__section {
    padding: 34px 0 40px;
  }

  &__header {
    margin-bottom: 14px;
  }

  &__h2 {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 1000;
    letter-spacing: 1px;
    color: #111;
  }

  &__desc {
    margin: 0;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.7;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  &__card {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__cardTop {
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__cardBadge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: rgba(178, 71, 58, 0.08);
    border: 1px solid rgba(178, 71, 58, 0.14);
    color: rgba(178, 71, 58, 0.95);
    font-weight: 1000;
    letter-spacing: 1px;
    font-size: 12px;
  }

  &__cardBadgeIcon {
    width: 22px;
    height: 22px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: rgba(178, 71, 58, 0.12);
  }

  &__cardTitle {
    margin: 10px 0 6px;
    font-weight: 1000;
    letter-spacing: 0.2px;
    font-size: 16px;
    color: #111;
  }

  &__cardDesc {
    margin: 0;
    line-height: 1.7;
    color: rgba(0, 0, 0, 0.7);
    font-size: 14px;
  }

  &__list {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 10px;
    color: rgba(0, 0, 0, 0.72);
    line-height: 1.85;
    font-size: 14px;
  }

  &__item {
    padding-left: 2px;
  }

  &__callout {
    margin-top: 12px;
    border-radius: 16px;
    padding: 12px 12px;
    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.25);
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  &__calloutIcon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;

    color: rgba(0, 0, 0, 0.9);
    background: rgba(229, 166, 87, 0.9);
    border: 1px solid rgba(229, 166, 87, 0.9);
  }

  &__calloutText {
    margin: 0;
    color: rgba(0, 0, 0, 0.72);
    line-height: 1.85;
    font-size: 13px;
  }

  &__reserve {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  &__reserveTitle {
    margin: 0 0 6px;
    font-weight: 1000;
    letter-spacing: 0.2px;
    color: #111;
  }

  &__reserveText {
    margin: 0;
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.75;
    font-size: 14px;
  }

  /* Contact */
  &__contact {
    display: grid;
    gap: 10px;
  }

  &__contactRow {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.65);
  }

  &__contactKey {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    color: rgba(0, 0, 0, 0.72);
    font-weight: 900;
  }

  &__contactVal {
    text-align: right;
    line-height: 1.5;
    color: rgba(0, 0, 0, 0.7);
    font-weight: 800;
  }

  /* CTA */
  &__cta {
    margin-top: 18px;
    border-radius: 18px;
    padding: 18px;
    background: linear-gradient(135deg, #b2473a, #7a1a12);
    color: #fff;

    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  &__ctaTitle {
    margin: 0 0 4px;
    font-weight: 1000;
    letter-spacing: 0.3px;
    font-size: 18px;
  }

  &__ctaDesc {
    margin: 0;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.7;
    font-size: 14px;
  }

  &__ctaRight {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  /* Footer */
  &__footer {
    padding: 18px 0 24px;
  }

  &__footerInner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__footerText {
    margin: 0;
    color: rgba(0, 0, 0, 0.6);
    font-size: 13px;
  }

  &__footerTop {
    height: 40px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.7);
    font-weight: 900;
    cursor: pointer;
  }

  /* RWD */
  @media (max-width: 1024px) {
    &__heroInner {
      grid-template-columns: 1fr;
    }

    &__heroRight {
      justify-content: flex-start;
    }

    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    &__container {
      padding: 0 16px;
    }

    &__heroInner {
      padding: 0 16px;
    }

    &__title {
      font-size: 28px;
    }

    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
