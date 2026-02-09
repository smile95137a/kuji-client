<!-- src/views/Cooperation.vue -->
<template>
  <div class="cooperation">
    <!-- Hero -->
    <section class="cooperation__hero">
      <div class="cooperation__heroInner">
        <div class="cooperation__heroLeft">
          <p class="cooperation__badge">COOPERATION</p>
          <h1 class="cooperation__title">STARDO 合作諮詢</h1>
          <p class="cooperation__subtitle">
            若你是品牌方、通路/門市、IP
            授權方、供應商或活動主辦單位，歡迎透過本頁與我們聯繫。
            我們會依需求評估合作方向並安排後續洽談。
          </p>

          <div class="cooperation__heroActions">
            <button
              class="cooperation__btn cooperation__btn--primary"
              @click="scrollTo('form')"
            >
              填寫表單
            </button>
            <button
              class="cooperation__btn cooperation__btn--ghost"
              @click="scrollTo('guide')"
            >
              合作說明
            </button>
          </div>

          <div class="cooperation__hint">
            <span class="cooperation__hintIcon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'circle-info']" />
            </span>
            <span class="cooperation__hintText">
              一般問題（訂單/退款/帳號）請優先前往「常見問題」或「交易說明」；合作洽談請在此留下資訊。
            </span>
          </div>
        </div>

        <aside class="cooperation__heroRight">
          <div class="cooperation__panel">
            <div class="cooperation__panelHeader">
              <p class="cooperation__panelTitle">快速入口</p>
              <p class="cooperation__panelDesc">常用頁面與聯繫方式。</p>
            </div>

            <div class="cooperation__quick">
              <button class="cooperation__chip" @click="goFaq">
                <span class="cooperation__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'circle-question']" />
                </span>
                常見問題
              </button>

              <button class="cooperation__chip" @click="goTransaction">
                <span class="cooperation__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'receipt']" />
                </span>
                交易說明
              </button>

              <a
                class="cooperation__chip cooperation__chip--link"
                :href="mailtoHref"
              >
                <span class="cooperation__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'envelope']" />
                </span>
                {{ contactEmail }}
              </a>
            </div>

            <div class="cooperation__panelFooter">
              <button
                class="cooperation__miniBtn cooperation__miniBtn--gold"
                @click="scrollTo('form')"
              >
                立即洽談
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Guide -->
    <section class="cooperation__section" id="guide">
      <div class="cooperation__container">
        <header class="cooperation__header">
          <h2 class="cooperation__h2">合作類型</h2>
          <p class="cooperation__desc">
            你可以用最簡單的方式描述需求，我們會協助你整理成可執行的合作方案。
          </p>
        </header>

        <div class="cooperation__grid">
          <article class="cooperation__card">
            <div class="cooperation__cardHead">
              <span class="cooperation__cardIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'copyright']" />
              </span>
              <p class="cooperation__cardTitle">IP / 授權合作</p>
            </div>
            <p class="cooperation__cardDesc">
              系列企劃、聯名抽賞、限定獎品、授權素材整合與上架規劃。
            </p>
            <ul class="cooperation__list">
              <li>授權範圍與期間</li>
              <li>素材交付與審稿流程</li>
              <li>上架節奏與宣傳協作</li>
            </ul>
          </article>

          <article class="cooperation__card">
            <div class="cooperation__cardHead">
              <span class="cooperation__cardIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'boxes-stacked']" />
              </span>
              <p class="cooperation__cardTitle">供應 / 物流合作</p>
            </div>
            <p class="cooperation__cardDesc">
              商品供應、倉儲與配送、包材規格與出貨 SOP 協作。
            </p>
            <ul class="cooperation__list">
              <li>備貨量與交期</li>
              <li>包裝規格與品檢</li>
              <li>退換貨與異常處理</li>
            </ul>
          </article>

          <article class="cooperation__card">
            <div class="cooperation__cardHead">
              <span class="cooperation__cardIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'store']" />
              </span>
              <p class="cooperation__cardTitle">通路 / 門市合作</p>
            </div>
            <p class="cooperation__cardDesc">
              門市導流、線下活動、取貨/展示點、共同宣傳與會員互通。
            </p>
            <ul class="cooperation__list">
              <li>門市位置與合作模式</li>
              <li>活動檔期與人流目標</li>
              <li>導流與成效回報</li>
            </ul>
          </article>

          <article class="cooperation__card">
            <div class="cooperation__cardHead">
              <span class="cooperation__cardIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'bullhorn']" />
              </span>
              <p class="cooperation__cardTitle">行銷 / 活動合作</p>
            </div>
            <p class="cooperation__cardDesc">
              社群活動、媒體合作、跨品牌共同曝光與抽賞企劃。
            </p>
            <ul class="cooperation__list">
              <li>曝光渠道與素材形式</li>
              <li>活動機制與贈品配置</li>
              <li>檔期與投放規劃</li>
            </ul>
          </article>
        </div>

        <div class="cooperation__cta">
          <div class="cooperation__ctaLeft">
            <p class="cooperation__ctaTitle">不知道該選哪一種？</p>
            <p class="cooperation__ctaDesc">
              直接在表單用一句話描述你的目標，我們會回覆可行的合作方向與下一步。
            </p>
          </div>
          <div class="cooperation__ctaRight">
            <button
              class="cooperation__btn cooperation__btn--primary"
              @click="scrollTo('form')"
            >
              前往表單
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Form -->
    <section class="cooperation__section cooperation__section--form" id="form">
      <div class="cooperation__container">
        <header class="cooperation__header">
          <h2 class="cooperation__h2">合作洽談表單</h2>
          <p class="cooperation__desc">
            請留下聯絡方式與需求簡述，我們會依序處理並回覆（回覆時間依案件量而定）。
          </p>
        </header>

        <div class="cooperation__formWrap">
          <form class="cooperation__form" @submit.prevent="submit">
            <div class="cooperation__formGrid">
              <label class="cooperation__field">
                <span class="cooperation__label">公司 / 單位名稱</span>
                <input
                  v-model.trim="form.company"
                  class="cooperation__input"
                  type="text"
                  placeholder="例如：星朵有限公司"
                />
              </label>

              <label class="cooperation__field">
                <span class="cooperation__label">聯絡人姓名</span>
                <input
                  v-model.trim="form.name"
                  class="cooperation__input"
                  type="text"
                  placeholder="請輸入姓名"
                />
              </label>

              <label class="cooperation__field">
                <span class="cooperation__label">電子郵件</span>
                <input
                  v-model.trim="form.email"
                  class="cooperation__input"
                  type="email"
                  placeholder="name@example.com"
                />
              </label>

              <label class="cooperation__field">
                <span class="cooperation__label">聯絡電話</span>
                <input
                  v-model.trim="form.phone"
                  class="cooperation__input"
                  type="tel"
                  placeholder="例如：09xx-xxx-xxx"
                />
              </label>

              <label class="cooperation__field cooperation__field--full">
                <span class="cooperation__label">合作類型</span>
                <div class="cooperation__selectRow">
                  <button
                    v-for="opt in typeOptions"
                    :key="opt.value"
                    type="button"
                    class="cooperation__pill"
                    :class="{ 'is-active': form.type === opt.value }"
                    @click="form.type = opt.value"
                  >
                    <span class="cooperation__pillIcon" aria-hidden="true">
                      <font-awesome-icon :icon="opt.icon" />
                    </span>
                    {{ opt.label }}
                  </button>
                </div>
              </label>

              <label class="cooperation__field cooperation__field--full">
                <span class="cooperation__label">需求簡述</span>
                <textarea
                  v-model.trim="form.message"
                  class="cooperation__textarea"
                  rows="6"
                  placeholder="請描述合作目標、資源與期望時間（越簡單越好）"
                />
                <span class="cooperation__help">
                  建議包含：合作目標 / 你能提供的資源 / 期望檔期 / 其他補充。
                </span>
              </label>
            </div>

            <div class="cooperation__formActions">
              <button class="cooperation__btn2" type="button" @click="reset">
                清除
              </button>
              <button
                class="cooperation__btn2 cooperation__btn2--primary"
                type="submit"
              >
                送出洽談
              </button>
            </div>

            <div class="cooperation__callout" role="note">
              <div class="cooperation__calloutDot" aria-hidden="true"></div>
              <div class="cooperation__calloutBody">
                送出後本頁不會自動建立契約或承諾合作；STARDO 會依內容評估並以
                email 聯繫後續流程。
              </div>
            </div>
          </form>

          <aside class="cooperation__side">
            <div class="cooperation__sideCard">
              <p class="cooperation__sideTitle">建議提供資訊</p>
              <ul class="cooperation__sideList">
                <li>合作目標（曝光 / 上架 / 活動 / 通路）</li>
                <li>內容資源（IP/商品/門市/媒體/人力）</li>
                <li>預計檔期（大致月份即可）</li>
                <li>預算或合作模式（可不填，若方便更好）</li>
              </ul>
            </div>

            <div class="cooperation__sideCard">
              <p class="cooperation__sideTitle">其他聯繫方式</p>
              <p class="cooperation__sideText">
                你也可以直接寄信至：
                <a class="cooperation__sideLink" :href="mailtoHref">{{
                  contactEmail
                }}</a>
              </p>
              <div class="cooperation__sideBtns">
                <button
                  class="cooperation__miniBtn"
                  type="button"
                  @click="copyEmail"
                >
                  複製信箱
                </button>
                <button
                  class="cooperation__miniBtn cooperation__miniBtn--gold"
                  type="button"
                  @click="openMail"
                >
                  開啟郵件
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- Toast -->
    <div
      v-if="toastOpen"
      class="cooperation__toast"
      role="status"
      aria-live="polite"
    >
      <span class="cooperation__toastIcon" aria-hidden="true">
        <font-awesome-icon :icon="['fas', 'check']" />
      </span>
      <span class="cooperation__toastText">{{ toastText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

type CooperationType = 'IP' | 'SUPPLY' | 'CHANNEL' | 'MARKETING';

const router = useRouter();
const year = computed(() => new Date().getFullYear());

const contactEmail = 'a@gmail.com';
const mailtoHref = computed(() => `mailto:${contactEmail}`);

const typeOptions: Array<{
  value: CooperationType;
  label: string;
  icon: any;
}> = [
  { value: 'IP', label: 'IP / 授權', icon: ['fas', 'copyright'] },
  { value: 'SUPPLY', label: '供應 / 物流', icon: ['fas', 'boxes-stacked'] },
  { value: 'CHANNEL', label: '通路 / 門市', icon: ['fas', 'store'] },
  { value: 'MARKETING', label: '行銷 / 活動', icon: ['fas', 'bullhorn'] },
];

const form = ref({
  company: '',
  name: '',
  email: '',
  phone: '',
  type: 'IP' as CooperationType,
  message: '',
});

const toastOpen = ref(false);
const toastText = ref('');

const showToast = (text: string) => {
  toastText.value = text;
  toastOpen.value = true;
  window.setTimeout(() => {
    toastOpen.value = false;
  }, 1800);
};

const goHome = () => router.push({ name: 'Home' });
const goFaq = () => router.push({ path: '/faq' });
const goTransaction = () => router.push({ path: '/transaction' });
const goShop = () => router.push({ name: 'Mall' });

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const reset = () => {
  form.value = {
    company: '',
    name: '',
    email: '',
    phone: '',
    type: 'IP',
    message: '',
  };
  showToast('已清除');
};

const submit = () => {
  // 這裡先做前端示意。之後串 API 也很簡單：把 form.value 送到後端即可。
  // 基本檢查（最少必要）
  if (!form.value.name || !form.value.email || !form.value.message) {
    showToast('請至少填寫：姓名、Email、需求簡述');
    return;
  }

  showToast('已送出，我們會盡快回覆');
  reset();
};

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(contactEmail);
    showToast('已複製信箱');
  } catch {
    showToast('複製失敗，請手動複製');
  }
};

const openMail = () => {
  window.location.href = mailtoHref.value;
};
</script>

<style scoped lang="scss">
.cooperation {
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
    max-width: 560px;
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

  &__quick {
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

    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);

    font-weight: 1000;
    letter-spacing: 0.4px;
    font-size: 14px;
    text-align: left;
    cursor: pointer;

    &--link {
      text-decoration: none;
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

  /* Sections */
  &__section {
    padding: 34px 0 40px;

    &--form {
      padding-top: 10px;
    }
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  &__card {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 18px;
    padding: 16px;
  }

  &__cardHead {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  &__cardIcon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: grid;
    place-items: center;

    background: rgba(178, 71, 58, 0.08);
    border: 1px solid rgba(178, 71, 58, 0.14);
    color: rgba(178, 71, 58, 0.95);
    font-size: 16px;
    flex: 0 0 auto;
  }

  &__cardTitle {
    margin: 0;
    font-weight: 1000;
    letter-spacing: 0.2px;
    font-size: 15px;
    color: #111;
  }

  &__cardDesc {
    margin: 0 0 10px;
    line-height: 1.7;
    color: rgba(0, 0, 0, 0.7);
    font-size: 14px;
  }

  &__list {
    margin: 0;
    padding-left: 18px;
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.7;
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

  /* Form */
  &__formWrap {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 14px;
    align-items: start;
  }

  &__form {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 18px;
    padding: 16px;
  }

  &__formGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__label {
    font-size: 13px;
    font-weight: 1000;
    letter-spacing: 0.6px;
    color: rgba(0, 0, 0, 0.72);
  }

  &__input {
    height: 46px;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.85);
    padding: 0 12px;
    outline: none;
    font-size: 14px;
  }

  &__textarea {
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.85);
    padding: 12px;
    outline: none;
    font-size: 14px;
    resize: vertical;
  }

  &__help {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.55);
    line-height: 1.6;
  }

  &__selectRow {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    font-weight: 1000;
    font-size: 13px;

    &.is-active {
      border-color: rgba(229, 166, 87, 0.75);
      box-shadow: 0 0 0 3px rgba(229, 166, 87, 0.18);
    }
  }

  &__pillIcon {
    width: 26px;
    height: 26px;
    border-radius: 10px;
    display: grid;
    place-items: center;

    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.22);
    color: rgba(229, 166, 87, 0.95);
  }

  &__formActions {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__btn2 {
    height: 42px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.85);
    font-weight: 1000;
    cursor: pointer;

    &--primary {
      background: rgba(178, 71, 58, 0.95);
      border-color: rgba(178, 71, 58, 0.95);
      color: #fff;
    }
  }

  &__callout {
    margin-top: 12px;
    border-radius: 16px;
    padding: 12px;
    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.22);
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  &__calloutDot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    margin-top: 6px;
    background: rgba(229, 166, 87, 0.9);
    flex: 0 0 auto;
  }

  &__calloutBody {
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.7;
    font-size: 13px;
  }

  &__side {
    display: grid;
    gap: 14px;
  }

  &__sideCard {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 18px;
    padding: 16px;
  }

  &__sideTitle {
    margin: 0 0 10px;
    font-weight: 1000;
    letter-spacing: 0.2px;
    color: #111;
  }

  &__sideList {
    margin: 0;
    padding-left: 18px;
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.7;
  }

  &__sideText {
    margin: 0;
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.7;
  }

  &__sideLink {
    color: rgba(178, 71, 58, 0.95);
    text-decoration: none;
    font-weight: 900;

    &:hover {
      opacity: 0.85;
    }
  }

  &__sideBtns {
    margin-top: 12px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
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

  /* Toast */
  &__toast {
    position: fixed;
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    z-index: 99999;

    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 999px;

    background: rgba(0, 0, 0, 0.92);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.14);
  }

  &__toastIcon {
    width: 28px;
    height: 28px;
    border-radius: 12px;
    display: grid;
    place-items: center;

    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.22);
    color: rgba(229, 166, 87, 0.95);
    flex: 0 0 auto;
  }

  &__toastText {
    font-weight: 900;
    letter-spacing: 0.2px;
    font-size: 13px;
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

    &__formWrap {
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

    &__grid {
      grid-template-columns: 1fr;
    }

    &__formGrid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
