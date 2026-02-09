<!-- src/views/About.vue -->
<template>
  <div class="about">
    <!-- Hero -->
    <section class="about__hero">
      <div class="about__heroInner">
        <div class="about__heroLeft">
          <p class="about__badge">ABOUT STARDO</p>
          <h1 class="about__title">STARDO｜把「抽到喜歡」做成體驗</h1>
          <p class="about__subtitle">
            STARDO
            專注於一番賞的抽選體驗：賞品展示清楚、流程透明、揭曉瞬間有儀式感。
            你只需要專心享受那個「揭曉」的那一秒。
          </p>

          <div class="about__heroActions">
            <button class="about__btn about__btn--primary" @click="goShop">
              前往商品
            </button>
            <button
              class="about__btn about__btn--ghost"
              @click="scrollTo('qa')"
            >
              常見問題
            </button>
          </div>

          <div class="about__stats">
            <div class="about__stat">
              <p class="about__statNum">透明</p>
              <p class="about__statLabel">流程可追蹤</p>
            </div>
            <div class="about__stat">
              <p class="about__statNum">即時</p>
              <p class="about__statLabel">抽況更新</p>
            </div>
            <div class="about__stat">
              <p class="about__statNum">多元</p>
              <p class="about__statLabel">玩法支援</p>
            </div>
          </div>
        </div>

        <div class="about__heroRight">
          <div class="about__heroCard">
            <div class="about__heroCardTop">
              <p class="about__heroCardTitle">STARDO 的體驗重點</p>
              <p class="about__heroCardDesc">
                我們把流程做得更清楚：先看清楚、再抽得安心、最後漂亮揭曉。
              </p>
            </div>

            <div class="about__heroPreview">
              <div class="about__previewPoster" aria-hidden="true">
                <img
                  class="about__previewImg"
                  :src="loginLogo"
                  alt="Login Illustration"
                />
              </div>

              <div class="about__previewTextList">
                <div class="about__previewTextItem">
                  <span class="about__previewTextKey">賞品一覽</span>
                  <span class="about__previewTextVal">等級 / 數量 / 尺寸</span>
                </div>

                <div class="about__previewTextItem">
                  <span class="about__previewTextKey">抽況追蹤</span>
                  <span class="about__previewTextVal">剩餘 / 已抽 / 可用</span>
                </div>

                <div class="about__previewTextItem">
                  <span class="about__previewTextKey">揭曉動畫</span>
                  <span class="about__previewTextVal"
                    >撕開 / 刮開 / 結果彈窗</span
                  >
                </div>
              </div>

              <div class="about__previewHint">
                <span class="about__dot"></span>
                <span>你會一直知道自己正在做什麼、也知道抽到了什麼</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="about__section">
      <div class="about__container">
        <header class="about__sectionHeader">
          <h2 class="about__sectionTitle">我們在乎什麼</h2>
          <p class="about__sectionSubtitle">
            不是把抽獎做複雜，而是把每一步做清楚、做順。
          </p>
        </header>

        <div class="about__grid">
          <article class="about__feature">
            <div class="about__featureIcon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" />
            </div>
            <h3 class="about__featureTitle">揭曉儀式感</h3>
            <p class="about__featureDesc">
              撕開／刮開的動畫與結果彈窗，讓每一次抽選都像「開箱」。
            </p>
          </article>

          <article class="about__feature">
            <div class="about__featureIcon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'box-open']" />
            </div>
            <h3 class="about__featureTitle">賞品資訊清楚</h3>
            <p class="about__featureDesc">
              賞品一覽、數量、尺寸、剩餘統計，資訊一眼懂，安心抽。
            </p>
          </article>

          <article class="about__feature">
            <div class="about__featureIcon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'chart-simple']" />
            </div>
            <h3 class="about__featureTitle">流程透明可追</h3>
            <p class="about__featureDesc">
              可用票券、已抽狀態、剩餘抽數，一個頁面全部掌握。
            </p>
          </article>

          <article class="about__feature">
            <div class="about__featureIcon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'shield-halved']" />
            </div>
            <h3 class="about__featureTitle">穩定與安全</h3>
            <p class="about__featureDesc">
              交易與結果流程分離，提示清楚、狀態一致，不怕卡住。
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="about__section about__section--dark">
      <div class="about__container">
        <header class="about__sectionHeader about__sectionHeader--center">
          <h2 class="about__sectionTitle about__sectionTitle--light">怎麼玩</h2>
          <p class="about__sectionSubtitle about__sectionSubtitle--light">
            三步驟完成一次抽選體驗（抽籤／刮刮樂都適用）
          </p>
        </header>

        <ol class="about__steps">
          <li class="about__step">
            <div class="about__stepNo">01</div>
            <div class="about__stepBody">
              <p class="about__stepTitle">選擇商品</p>
              <p class="about__stepDesc">
                查看賞品一覽與介紹內容，先確認喜歡再出手。
              </p>
            </div>
          </li>

          <li class="about__step">
            <div class="about__stepNo">02</div>
            <div class="about__stepBody">
              <p class="about__stepTitle">開始抽 / 開刮</p>
              <p class="about__stepDesc">
                抽籤模式可選票與檢視抽況；刮刮樂模式直接進揭曉流程。
              </p>
            </div>
          </li>

          <li class="about__step">
            <div class="about__stepNo">03</div>
            <div class="about__stepBody">
              <p class="about__stepTitle">查看結果與剩餘</p>
              <p class="about__stepDesc">
                結果會顯示抽到的賞品與剩餘抽數，並同步更新最新狀態。
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- QA -->
    <section class="about__section" id="qa">
      <div class="about__container">
        <header class="about__sectionHeader">
          <h2 class="about__sectionTitle">常見問題</h2>
          <p class="about__sectionSubtitle">你可能會想先知道這些。</p>
        </header>

        <div class="about__faq">
          <details class="about__qa" open>
            <summary class="about__qaQ">抽籤模式跟刮刮樂模式差在哪？</summary>
            <div class="about__qaA">
              抽籤模式會提供「檢視抽況 /
              選票」等流程；刮刮樂模式以快速揭曉為主，
              直接「開刮」進動畫與結果。
            </div>
          </details>

          <details class="about__qa">
            <summary class="about__qaQ">賞品剩餘與抽況是即時的嗎？</summary>
            <div class="about__qaA">
              以後端回傳為準。抽完後會自動刷新，確保顯示最新狀態。
            </div>
          </details>

          <details class="about__qa">
            <summary class="about__qaQ">介紹內容支援圖片或表格嗎？</summary>
            <div class="about__qaA">
              支援（例如後台編輯器輸出的 HTML）。若內容來源不可信，建議加入
              sanitize 來避免 XSS 風險。
            </div>
          </details>

          <details class="about__qa">
            <summary class="about__qaQ">如何聯絡 STARDO？</summary>
            <div class="about__qaA">
              你可以透過客服信箱或站內聯絡表單（若有）與我們聯繫。
            </div>
          </details>
        </div>

        <div class="about__ctaBlock">
          <div class="about__ctaLeft">
            <p class="about__ctaTitle">準備好開始了嗎？</p>
            <p class="about__ctaDesc">
              前往商品頁，挑一個你喜歡的系列，享受揭曉的瞬間。
            </p>
          </div>

          <div class="about__ctaRight">
            <button class="about__btn about__btn--primary" @click="goShop">
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
import loginLogo from '@/assets/image/login_logo.png';

const router = useRouter();

const goShop = () => router.push({ name: 'IchibanList' });

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
</script>

<style scoped lang="scss">
.about {
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
    grid-template-columns: 1.15fr 0.85fr;
    gap: 28px;
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
    margin-bottom: 18px;
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

  &__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    max-width: 520px;
  }

  &__stat {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 14px;
    padding: 12px 12px 10px;
  }

  &__statNum {
    margin: 0 0 2px;
    font-weight: 1000;
    font-size: 18px;
    color: rgba(229, 166, 87, 0.95);
  }

  &__statLabel {
    margin: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 1px;
  }

  &__heroRight {
    display: flex;
    justify-content: flex-end;
  }

  &__heroCard {
    width: 100%;
    max-width: 420px;
    border-radius: 18px;
    padding: 16px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.04)
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__heroCardTop {
    margin-bottom: 12px;
  }

  &__heroCardTitle {
    margin: 0 0 6px;
    font-weight: 1000;
    letter-spacing: 1px;
    font-size: 16px;
  }

  &__heroCardDesc {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.78);
  }

  &__heroPreview {
    margin-top: 12px;
    border-radius: 14px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 12px;
  }

  &__previewPoster {
    height: 180px;
    border-radius: 12px;
    background:
      radial-gradient(
        circle at 30% 20%,
        rgba(229, 166, 87, 0.42),
        transparent 60%
      ),
      linear-gradient(135deg, rgba(178, 71, 58, 0.65), rgba(0, 0, 0, 0.65));
    margin-bottom: 12px;
  }

  &__previewImg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__previewTextList {
    display: grid;
    gap: 10px;
    margin-bottom: 12px;
  }

  &__previewTextItem {
    display: grid;
    grid-template-columns: 86px 1fr;
    gap: 10px;
    align-items: center;

    padding: 10px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.09);
  }

  &__previewTextKey {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 1000;
    letter-spacing: 1px;

    color: rgba(229, 166, 87, 0.95);
    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.28);
  }

  &__previewTextVal {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.82);
    line-height: 1.6;
  }

  &__previewHint {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.6;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(229, 166, 87, 0.95);
    box-shadow: 0 0 0 4px rgba(229, 166, 87, 0.15);
    flex: 0 0 auto;
  }

  &__heroCardBottom {
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

  /* Sections */
  &__section {
    padding: 36px 0;

    &--dark {
      background: #000;
    }
  }

  &__sectionHeader {
    margin-bottom: 18px;

    &--center {
      text-align: center;
    }
  }

  &__sectionTitle {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 1000;
    letter-spacing: 1px;
    color: #111;

    &--light {
      color: #fff;
    }
  }

  &__sectionSubtitle {
    margin: 0;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.7;

    &--light {
      color: rgba(255, 255, 255, 0.78);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  &__feature {
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    padding: 16px;
  }

  &__featureIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    margin-bottom: 10px;

    background: rgba(178, 71, 58, 0.08);
    border: 1px solid rgba(178, 71, 58, 0.14);
    color: rgba(178, 71, 58, 0.95);

    font-size: 18px;
  }

  &__featureTitle {
    margin: 0 0 8px;
    font-weight: 1000;
    letter-spacing: 0.3px;
    font-size: 16px;
  }

  &__featureDesc {
    margin: 0;
    line-height: 1.7;
    color: rgba(0, 0, 0, 0.7);
    font-size: 14px;
  }

  /* Steps */
  &__steps {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 12px;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }

  &__step {
    border-radius: 16px;
    padding: 16px 16px 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  &__stepNo {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-weight: 1000;
    letter-spacing: 1px;
    color: #000;
    background: rgba(229, 166, 87, 0.92);
    flex: 0 0 auto;
  }

  &__stepTitle {
    margin: 2px 0 4px;
    font-weight: 1000;
    color: #fff;
    letter-spacing: 0.2px;
  }

  &__stepDesc {
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.7;
    font-size: 14px;
  }

  /* FAQ */
  &__faq {
    display: grid;
    gap: 10px;
  }

  &__qa {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    padding: 12px 14px;
  }

  &__qaQ {
    cursor: pointer;
    font-weight: 1000;
    letter-spacing: 0.2px;
  }

  &__qaA {
    margin-top: 10px;
    line-height: 1.75;
    color: rgba(0, 0, 0, 0.72);
    font-size: 14px;
  }

  /* CTA block */
  &__ctaBlock {
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

    &__stats {
      grid-template-columns: 1fr;
    }

    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
