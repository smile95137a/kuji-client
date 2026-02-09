<!-- src/views/Faq.vue -->
<template>
  <div class="faq">
    <!-- Hero -->
    <section class="faq__hero">
      <div class="faq__heroInner">
        <div class="faq__heroLeft">
          <p class="faq__badge">FAQ</p>
          <h1 class="faq__title">STARDO 常見問題</h1>
          <p class="faq__subtitle">
            這裡整理了大家最常問的問題：抽選流程、刮刮樂模式、付款與狀態更新。
            如果你找不到答案，也可以回到商品頁或聯絡客服。
          </p>

          <div class="faq__heroActions">
            <button class="faq__btn faq__btn--primary" @click="goShop">
              前往商品
            </button>
            <button class="faq__btn faq__btn--ghost" @click="scrollTo('list')">
              直接看問題
            </button>
          </div>
        </div>

        <aside class="faq__heroRight">
          <div class="faq__panel">
            <div class="faq__panelHeader">
              <p class="faq__panelTitle">快速導覽</p>
              <p class="faq__panelDesc">點選分類快速跳到你要的問題。</p>
            </div>

            <div class="faq__quick">
              <button class="faq__chip" @click="jump('play')">
                <span class="faq__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'ticket']" />
                </span>
                抽選 / 刮刮樂
              </button>

              <button class="faq__chip" @click="jump('status')">
                <span class="faq__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'chart-simple']" />
                </span>
                抽況 / 剩餘
              </button>

              <button class="faq__chip" @click="jump('payment')">
                <span class="faq__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'credit-card']" />
                </span>
                付款 / 訂單
              </button>

              <button class="faq__chip" @click="jump('account')">
                <span class="faq__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'user']" />
                </span>
                帳號 / 登入
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Content -->
    <section class="faq__section" id="list">
      <div class="faq__container">
        <header class="faq__header">
          <h2 class="faq__h2">問題列表</h2>
          <p class="faq__desc">
            若你是第一次玩 STARDO，建議先看「抽選 / 刮刮樂」與「抽況 / 剩餘」。
          </p>
        </header>

        <!-- 抽選 / 刮刮樂 -->
        <div class="faq__group" id="play">
          <div class="faq__groupHead">
            <div class="faq__groupTitle">
              <span class="faq__groupIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'ticket']" />
              </span>
              抽選 / 刮刮樂
            </div>
            <p class="faq__groupSub">玩法差異、怎麼開始、結果怎麼看。</p>
          </div>

          <div class="faq__list">
            <details class="faq__qa" open>
              <summary class="faq__q">抽籤模式跟刮刮樂模式差在哪？</summary>
              <div class="faq__a">
                抽籤模式通常會提供「檢視抽況 /
                選票」等流程；刮刮樂模式以快速揭曉為主，
                直接「開刮」進揭曉動畫與結果畫面。
              </div>
            </details>

            <details class="faq__qa">
              <summary class="faq__q">我可以一次抽多張嗎？</summary>
              <div class="faq__a">
                依商品設定而定。若該商品支援連抽/多抽，會在抽選面板或操作區顯示對應選項。
              </div>
            </details>

            <details class="faq__qa">
              <summary class="faq__q">抽完會立刻看到抽到什麼嗎？</summary>
              <div class="faq__a">
                會。抽完後會進入揭曉流程（撕開／刮開），並在結果彈窗顯示抽到的賞品內容與數量。
              </div>
            </details>

            <details class="faq__qa">
              <summary class="faq__q">會不會抽到重複的賞？</summary>
              <div class="faq__a">
                可能。抽選結果依商品當下剩餘與配置規則而定，重複出現同一等級/同一品項屬於正常情況。
              </div>
            </details>
          </div>
        </div>

        <!-- 抽況 / 剩餘 -->
        <div class="faq__group" id="status">
          <div class="faq__groupHead">
            <div class="faq__groupTitle">
              <span class="faq__groupIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'chart-simple']" />
              </span>
              抽況 / 剩餘
            </div>
            <p class="faq__groupSub">
              剩餘抽數、已抽狀態、為什麼有些票不能選。
            </p>
          </div>

          <div class="faq__list">
            <details class="faq__qa" open>
              <summary class="faq__q">抽況與剩餘數量是即時的嗎？</summary>
              <div class="faq__a">
                以後端回傳為準。抽完後頁面會刷新資料，確保顯示最新抽況與剩餘抽數。
              </div>
            </details>

            <details class="faq__qa">
              <summary class="faq__q">為什麼有些票券顯示不可用？</summary>
              <div class="faq__a">
                常見原因包含：已抽出（DRAWN）、被保留（RESERVED）、被鎖定（LOCKED）等狀態。
                只有 AVAILABLE 的票券可以選擇。
              </div>
            </details>

            <details class="faq__qa">
              <summary class="faq__q">
                刮刮樂模式為什麼看不到「檢視抽況」？
              </summary>
              <div class="faq__a">
                刮刮樂模式設計上以「直接揭曉」為主，因此會隱藏抽況區與抽選面板，讓流程更快更直覺。
              </div>
            </details>
          </div>
        </div>

        <!-- 付款 / 訂單 -->
        <div class="faq__group" id="payment">
          <div class="faq__groupHead">
            <div class="faq__groupTitle">
              <span class="faq__groupIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'credit-card']" />
              </span>
              付款 / 訂單
            </div>
            <p class="faq__groupSub">付款後狀態、訂單查詢、異常狀況。</p>
          </div>

          <div class="faq__list">
            <details class="faq__qa" open>
              <summary class="faq__q">付款成功後，抽況會自動更新嗎？</summary>
              <div class="faq__a">
                會。完成抽選後會顯示結果並刷新資料；若你有離開頁面，也可以重新進入商品詳情查看最新狀態。
              </div>
            </details>

            <details class="faq__qa">
              <summary class="faq__q">我可以在哪裡查詢我的抽選紀錄？</summary>
              <div class="faq__a">
                依站內功能而定，通常會在會員中心或訂單/紀錄頁。若你們已有該頁路由，可把入口放在右上角會員選單。
              </div>
            </details>

            <details class="faq__qa">
              <summary class="faq__q">抽選失敗或看到錯誤訊息怎麼辦？</summary>
              <div class="faq__a">
                建議先重新整理頁面或稍後再試。若持續發生，請截圖錯誤訊息並提供時間點給客服協助確認。
              </div>
            </details>
          </div>
        </div>

        <!-- 帳號 / 登入 -->
        <div class="faq__group" id="account">
          <div class="faq__groupHead">
            <div class="faq__groupTitle">
              <span class="faq__groupIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'user']" />
              </span>
              帳號 / 登入
            </div>
            <p class="faq__groupSub">為什麼需要登入、不能抽的原因。</p>
          </div>

          <div class="faq__list">
            <details class="faq__qa" open>
              <summary class="faq__q">為什麼我按「開抽」會被要求登入？</summary>
              <div class="faq__a">
                抽選涉及交易與結果紀錄，為了確保抽選結果可追蹤，需要在登入狀態下進行。
              </div>
            </details>

            <details class="faq__qa">
              <summary class="faq__q">顯示「目前無法抽選」是什麼意思？</summary>
              <div class="faq__a">
                代表當下 session
                回傳不可抽。可能原因包含：未登入、活動未開始/已結束、抽數不足、
                或帳號狀態限制等。系統會顯示對應原因提示。
              </div>
            </details>
          </div>
        </div>

        <!-- Bottom CTA -->
        <div class="faq__cta">
          <div class="faq__ctaLeft">
            <p class="faq__ctaTitle">還是找不到答案？</p>
            <p class="faq__ctaDesc">
              你可以回到商品頁先看看賞品與玩法，或聯絡客服協助。
            </p>
          </div>

          <div class="faq__ctaRight">
            <button class="faq__btn faq__btn--primary" @click="goShop">
              前往商品
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

const jump = (id: string) => scrollTo(id);
</script>

<style scoped lang="scss">
.faq {
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
    max-width: 560px;
  }

  &__heroActions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
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

  &__quick {
    margin-top: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
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

    font-weight: 900;
    letter-spacing: 0.4px;
    font-size: 13px;
    text-align: left;
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
    margin-bottom: 16px;
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

  &__group {
    margin-top: 18px;
  }

  &__groupHead {
    margin-bottom: 10px;
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__groupTitle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 1000;
    letter-spacing: 0.4px;
    color: #111;
  }

  &__groupIcon {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: grid;
    place-items: center;

    background: rgba(178, 71, 58, 0.08);
    border: 1px solid rgba(178, 71, 58, 0.14);
    color: rgba(178, 71, 58, 0.95);
    flex: 0 0 auto;
  }

  &__groupSub {
    margin: 8px 0 0;
    font-size: 13px;
    line-height: 1.7;
    color: rgba(0, 0, 0, 0.65);
  }

  &__list {
    display: grid;
    gap: 10px;
  }

  &__qa {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    padding: 12px 14px;
  }

  &__q {
    cursor: pointer;
    font-weight: 1000;
    letter-spacing: 0.2px;
  }

  &__a {
    margin-top: 10px;
    line-height: 1.75;
    color: rgba(0, 0, 0, 0.72);
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

    &__quick {
      grid-template-columns: 1fr;
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
  }
}
</style>
