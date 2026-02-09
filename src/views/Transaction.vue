<!-- src/views/Transaction.vue -->
<template>
  <div class="transaction">
    <!-- Hero -->
    <section class="transaction__hero">
      <div class="transaction__heroInner">
        <div class="transaction__heroLeft">
          <p class="transaction__badge">TRANSACTION</p>
          <h1 class="transaction__title">交易說明</h1>
          <p class="transaction__subtitle">
            這裡整理 STARDO
            的代幣/點數購買、發票、取消退款、寄送保管與系統安全等說明。
            實際適用條件以結帳時與平台公告顯示為準。
          </p>

          <div class="transaction__heroActions">
            <button
              class="transaction__btn transaction__btn--primary"
              type="button"
              @click="goShop"
            >
              前往商品
            </button>
            <button
              class="transaction__btn transaction__btn--ghost"
              type="button"
              @click="scrollTo('content')"
            >
              查看內容
            </button>
          </div>

          <div class="transaction__hint" role="note">
            <span class="transaction__hintIcon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'circle-info']" />
            </span>
            <span class="transaction__hintText">
              若你遇到入點延遲或訂單狀態異常，請先保留付款憑證並至會員中心查看交易紀錄，再聯繫客服協助查核。
            </span>
          </div>
        </div>

        <aside class="transaction__heroRight">
          <div class="transaction__panel">
            <div class="transaction__panelHeader">
              <p class="transaction__panelTitle">快速導覽</p>
              <p class="transaction__panelDesc">點選項目可快速跳轉段落。</p>
            </div>

            <div class="transaction__nav">
              <button
                class="transaction__chip"
                type="button"
                @click="scrollTo('s1')"
              >
                <span class="transaction__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'coins']" />
                </span>
                代幣/點數
              </button>

              <button
                class="transaction__chip"
                type="button"
                @click="scrollTo('s2')"
              >
                <span class="transaction__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'receipt']" />
                </span>
                發票與載具
              </button>

              <button
                class="transaction__chip"
                type="button"
                @click="scrollTo('s3')"
              >
                <span class="transaction__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'rotate-left']" />
                </span>
                取消/退款
              </button>

              <button
                class="transaction__chip"
                type="button"
                @click="scrollTo('s4')"
              >
                <span class="transaction__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'list-ol']" />
                </span>
                儲值流程
              </button>

              <button
                class="transaction__chip"
                type="button"
                @click="scrollTo('s7')"
              >
                <span class="transaction__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'truck']" />
                </span>
                寄送與保管
              </button>

              <button
                class="transaction__chip"
                type="button"
                @click="scrollTo('s9')"
              >
                <span class="transaction__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'scale-balanced']" />
                </span>
                法律與權益
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Content -->
    <section class="transaction__section" id="content">
      <div class="transaction__container">
        <header class="transaction__header">
          <h2 class="transaction__h2">內容一覽</h2>
          <p class="transaction__desc">
            以下說明為一般性規範整理，實際以結帳頁、商品頁與平台公告為準。
          </p>
        </header>

        <div class="transaction__grid">
          <!-- 1 -->
          <article class="transaction__card" id="s1">
            <div class="transaction__cardTop">
              <span class="transaction__cardBadge">
                <span class="transaction__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'coins']" />
                </span>
                代幣/點數
              </span>

              <h3 class="transaction__cardTitle">代幣/點數購買須知</h3>
              <p class="transaction__cardDesc">
                代幣/點數屬平台內數位權益，購買前請先確認需求與適用規則。
              </p>
            </div>

            <ol class="transaction__list">
              <li class="transaction__item">
                訂單完成後的代幣/點數不得轉讓、出售或移轉予第三人（除非平台另有明示規定）。
              </li>
              <li class="transaction__item">
                代幣/點數可用於平台指定功能（抽選、刮刮樂、兌換、購買服務等），實際可用範圍以頁面顯示為準。
              </li>
              <li class="transaction__item">
                交易結果以系統入點與扣點紀錄為準；通知（Email/站內）屬提示訊息，不等同必然完成。
              </li>
              <li class="transaction__item">
                若遇入點延遲、扣點不符等異常，請先保留付款憑證並聯繫客服協助查核。
              </li>
            </ol>
          </article>

          <!-- 2 -->
          <article class="transaction__card" id="s2">
            <div class="transaction__cardTop">
              <span class="transaction__cardBadge">
                <span class="transaction__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'receipt']" />
                </span>
                發票與載具
              </span>

              <h3 class="transaction__cardTitle">什麼狀況下會開立發票</h3>
              <p class="transaction__cardDesc">
                發票開立方式與載具規範依主管機關公告及結帳流程為準。
              </p>
            </div>

            <ol class="transaction__list">
              <li class="transaction__item">
                代幣/點數購買完成後，系統將依你在結帳時選擇之發票類型與載具方式開立電子發票並提供通知。
              </li>
              <li class="transaction__item">
                如需統編、捐贈或載具設定，請於結帳流程依頁面指示填寫與確認。
              </li>
            </ol>

            <div class="transaction__callout" role="note">
              <span class="transaction__calloutIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'circle-info']" />
              </span>
              <p class="transaction__calloutText">
                若未收到發票通知，請先確認垃圾郵件匣與會員信箱設定；仍未收到再聯繫客服補寄/查詢。
              </p>
            </div>
          </article>

          <!-- 3 -->
          <article class="transaction__card" id="s3">
            <div class="transaction__cardTop">
              <span class="transaction__cardBadge">
                <span class="transaction__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'rotate-left']" />
                </span>
                取消/退款
              </span>

              <h3 class="transaction__cardTitle">退款/取消（代幣相關）</h3>
              <p class="transaction__cardDesc">
                代幣/點數屬數位權益，退款受理需符合平台規範並以審核結果為準。
              </p>
            </div>

            <ol class="transaction__list">
              <li class="transaction__item">
                若申請取消或退款，通常需符合「尚未使用」且「在規定期限內提出」等條件；實際受理以平台公告為準。
              </li>
              <li class="transaction__item">
                請透過客服管道聯繫並提供：會員帳號、訂單編號、聯絡方式與必要之退款資訊，以利核對。
              </li>
              <li class="transaction__item">
                退款時間將依付款方式、銀行作業日與審核進度而異；若需扣除必要手續費（若有），將依規範辦理。
              </li>
            </ol>
          </article>

          <!-- 4 -->
          <article class="transaction__card" id="s4">
            <div class="transaction__cardTop">
              <span class="transaction__cardBadge">
                <span class="transaction__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'list-ol']" />
                </span>
                儲值流程
              </span>

              <h3 class="transaction__cardTitle">儲值流程教學</h3>
              <p class="transaction__cardDesc">
                依會員中心導引完成方案選擇與付款驗證後即可完成儲值。
              </p>
            </div>

            <ol class="transaction__list">
              <li class="transaction__item">
                登入會員 → 會員中心 → 代幣儲值 → 選擇方案 → 確認送出。
              </li>
              <li class="transaction__item">
                依指示完成信用卡/支付工具驗證（例如簡訊驗證碼、3D 驗證）→
                儲值完成。
              </li>
              <li class="transaction__item">
                若遇延遲入帳，請先刷新頁面或至交易紀錄確認狀態；仍異常再聯繫客服。
              </li>
            </ol>
          </article>

          <!-- 5 -->
          <article class="transaction__card" id="s5">
            <div class="transaction__cardTop">
              <span class="transaction__cardBadge">
                <span class="transaction__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'ticket']" />
                </span>
                紅利/免運券
              </span>

              <h3 class="transaction__cardTitle">紅利/免運券 累積與使用</h3>
              <p class="transaction__cardDesc">
                紅利與免運券可能有期限與適用範圍，請以券面或結帳顯示為準。
              </p>
            </div>

            <ol class="transaction__list">
              <li class="transaction__item">
                可透過登入活動、任務或平台指定活動獲得；使用期限與限制以券面/活動說明為準。
              </li>
              <li class="transaction__item">
                由紅利/免運券折抵或兌換之項目，若屬不可退回之數位權益或已使用之優惠，將無法要求退回。
              </li>
              <li class="transaction__item">
                平台保留修改、終止活動或變更優惠內容之權利，並以公告為準。
              </li>
            </ol>
          </article>

          <!-- 6 -->
          <article class="transaction__card" id="s6">
            <div class="transaction__cardTop">
              <span class="transaction__cardBadge">
                <span class="transaction__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'gift']" />
                </span>
                獎品與商品
              </span>

              <h3 class="transaction__cardTitle">遊戲獎品與商品說明</h3>
              <p class="transaction__cardDesc">
                商品外觀與到貨時間可能因量產與物流因素而有所差異。
              </p>
            </div>

            <ol class="transaction__list">
              <li class="transaction__item">
                商品圖片僅供參考，實際顏色與規格以實品為準。
              </li>
              <li class="transaction__item">
                量產商品可能存在輕微塗裝差異、細微擦痕或色差等非功能性差異，通常不視為重大瑕疵。
              </li>
              <li class="transaction__item">
                出貨/到貨時間為預估值，實際仍依原廠/供應商公告與物流作業為準。
              </li>
            </ol>
          </article>

          <!-- 7 -->
          <article class="transaction__card" id="s7">
            <div class="transaction__cardTop">
              <span class="transaction__cardBadge">
                <span class="transaction__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'truck']" />
                </span>
                寄送與保管
              </span>

              <h3 class="transaction__cardTitle">寄送與保管說明</h3>
              <p class="transaction__cardDesc">
                請確保收件資訊正確，並在收到商品後於期限內完成檢查與回報。
              </p>
            </div>

            <ol class="transaction__list">
              <li class="transaction__item">
                超商取貨逾期未取退回，平台可能依規則收取再次寄送之必要費用或以權益折抵（若適用）。
              </li>
              <li class="transaction__item">
                獎品保管達一定期限，平台可能依規則安排寄送至預設地址；請確保會員資料正確。
              </li>
              <li class="transaction__item">
                收到商品如有缺件、明顯破損或功能異常，請於收到後 3
                天內保留開箱錄影並聯繫客服。
              </li>
              <li class="transaction__item">
                外盒可能因運送碰撞產生痕跡，平台無法保證外盒完全無傷，請審慎評估。
              </li>
            </ol>
          </article>

          <!-- 8 -->
          <article class="transaction__card" id="s8">
            <div class="transaction__cardTop">
              <span class="transaction__cardBadge">
                <span class="transaction__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'shield']" />
                </span>
                服務可用性
              </span>

              <h3 class="transaction__cardTitle">系統安全與服務可用性</h3>
              <p class="transaction__cardDesc">
                平台將以合理範圍維護服務品質，但仍可能因維護或不可抗力中斷。
              </p>
            </div>

            <ol class="transaction__list">
              <li class="transaction__item">
                平台不對速度、完整性、即時性或完全不中斷提供任何明示或默示保證。
              </li>
              <li class="transaction__item">
                平台不保證通知或資料傳輸必然無誤；因不可歸責於平台之事由造成之損害，平台將依規範處理。
              </li>
              <li class="transaction__item">
                可能中斷服務情形包含：系統維護、突發故障、第三方服務中斷、天災或其他不可抗力。
              </li>
            </ol>
          </article>

          <!-- 9 -->
          <article class="transaction__card" id="s9">
            <div class="transaction__cardTop">
              <span class="transaction__cardBadge">
                <span class="transaction__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'scale-balanced']" />
                </span>
                法律與權益
              </span>

              <h3 class="transaction__cardTitle">相關法律與權益</h3>
              <p class="transaction__cardDesc">
                交易認定與爭議處理以系統紀錄與法令規範為準。
              </p>
            </div>

            <ol class="transaction__list">
              <li class="transaction__item">
                會員同意其使用、交易、兌換等行為，以平台所記錄之電子資料為準。
              </li>
              <li class="transaction__item">
                若平台依規範停用或限制帳號，會員可能無法存取帳戶資料與帳戶內權益，平台將依規則處理。
              </li>
              <li class="transaction__item">
                平台得依實際營運調整活動與規則，保留修改、暫停或終止之權利，並以公告為準。
              </li>
              <li class="transaction__item">
                本頁內容之解釋與適用，及因交易行為產生之爭議，悉依中華民國法律處理。
              </li>
            </ol>

            <div class="transaction__reserve">
              <p class="transaction__reserveTitle">權利保留</p>
              <p class="transaction__reserveText">
                STARDO
                保留會員註冊審核、訂單條件確認、商品兌換規則、價格調整及本頁內容修改之權利；相關變更將以平台公告或頁面更新為準。
              </p>
            </div>
          </article>
        </div>

        <div class="transaction__cta">
          <div class="transaction__ctaLeft">
            <p class="transaction__ctaTitle">想直接開始？</p>
            <p class="transaction__ctaDesc">
              前往商品頁挑選系列，抽選或刮刮樂都可以立即體驗。
            </p>
          </div>

          <div class="transaction__ctaRight">
            <button
              class="transaction__btn transaction__btn--primary"
              type="button"
              @click="goShop"
            >
              立即前往
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const router = useRouter();
const year = computed(() => new Date().getFullYear());

const goHome = () => router.push({ name: 'Home' });
const goShop = () => router.push({ name: 'IchibanList' });

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
</script>

<style scoped lang="scss">
.transaction {
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
    max-width: 620px;
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
    max-width: 620px;
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
