<!-- src/views/Promotion.vue -->
<template>
  <div class="promotion">
    <!-- Hero -->
    <section class="promotion__hero">
      <div class="promotion__heroInner">
        <div class="promotion__heroLeft">
          <p class="promotion__badge">PROMOTION</p>
          <h1 class="promotion__title">STARDO 優惠活動</h1>
          <p class="promotion__subtitle">
            這裡整理 STARDO
            目前進行中的優惠與玩法活動。實際優惠內容與適用條件以結帳時顯示為準。
          </p>

          <div class="promotion__heroActions">
            <button
              class="promotion__btn promotion__btn--primary"
              @click="goShop"
            >
              前往商品
            </button>
            <button
              class="promotion__btn promotion__btn--ghost"
              @click="scrollTo('list')"
            >
              查看活動
            </button>
          </div>

          <div class="promotion__hint">
            <span class="promotion__hintIcon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'circle-info']" />
            </span>
            <span class="promotion__hintText">
              活動可能有名額、時間或商品限制，建議抽選前先確認條款。
            </span>
          </div>
        </div>

        <aside class="promotion__heroRight">
          <div class="promotion__panel">
            <div class="promotion__panelHeader">
              <p class="promotion__panelTitle">快速篩選</p>
              <p class="promotion__panelDesc">依狀態快速查看。</p>
            </div>

            <div class="promotion__filters">
              <button
                class="promotion__chip"
                :class="{ 'is-active': activeTab === 'ongoing' }"
                @click="activeTab = 'ongoing'"
              >
                <span class="promotion__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'bolt']" />
                </span>
                進行中
              </button>

              <button
                class="promotion__chip"
                :class="{ 'is-active': activeTab === 'upcoming' }"
                @click="activeTab = 'upcoming'"
              >
                <span class="promotion__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'calendar-day']" />
                </span>
                即將開始
              </button>

              <button
                class="promotion__chip"
                :class="{ 'is-active': activeTab === 'ended' }"
                @click="activeTab = 'ended'"
              >
                <span class="promotion__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'flag-checkered']" />
                </span>
                已結束
              </button>
            </div>

            <div class="promotion__panelFooter">
              <button class="promotion__miniBtn" @click="goHome">回首頁</button>
              <button
                class="promotion__miniBtn promotion__miniBtn--gold"
                @click="goShop"
              >
                立即開抽
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Content -->
    <section class="promotion__section" id="list">
      <div class="promotion__container">
        <header class="promotion__header">
          <h2 class="promotion__h2">活動列表</h2>
          <p class="promotion__desc">
            你可以依狀態切換「進行中 / 即將開始 / 已結束」。
          </p>
        </header>

        <!-- Tabs summary -->
        <div class="promotion__summary">
          <div class="promotion__summaryItem">
            <p class="promotion__summaryNum">{{ ongoingCount }}</p>
            <p class="promotion__summaryLabel">進行中</p>
          </div>
          <div class="promotion__summaryItem">
            <p class="promotion__summaryNum">{{ upcomingCount }}</p>
            <p class="promotion__summaryLabel">即將開始</p>
          </div>
          <div class="promotion__summaryItem">
            <p class="promotion__summaryNum">{{ endedCount }}</p>
            <p class="promotion__summaryLabel">已結束</p>
          </div>
        </div>

        <!-- List -->
        <div v-if="filteredPromotions.length" class="promotion__grid">
          <article
            v-for="p in filteredPromotions"
            :key="p.id"
            class="promotion__card"
          >
            <div class="promotion__cardTop">
              <span
                class="promotion__status"
                :class="{
                  'is-ongoing': p.status === 'ONGOING',
                  'is-upcoming': p.status === 'UPCOMING',
                  'is-ended': p.status === 'ENDED',
                }"
              >
                {{ statusText(p.status) }}
              </span>

              <h3 class="promotion__cardTitle">{{ p.title }}</h3>
              <p class="promotion__cardDesc">
                {{ p.description }}
              </p>
            </div>

            <div class="promotion__meta">
              <div class="promotion__metaRow">
                <span class="promotion__metaKey">
                  <font-awesome-icon :icon="['fas', 'clock']" />
                  活動時間
                </span>
                <span class="promotion__metaVal">
                  {{ formatRange(p.startAt, p.endAt) }}
                </span>
              </div>

              <div class="promotion__metaRow" v-if="p.scopeText">
                <span class="promotion__metaKey">
                  <font-awesome-icon :icon="['fas', 'tags']" />
                  適用範圍
                </span>
                <span class="promotion__metaVal">{{ p.scopeText }}</span>
              </div>

              <div class="promotion__metaRow" v-if="p.ruleText">
                <span class="promotion__metaKey">
                  <font-awesome-icon :icon="['fas', 'list-check']" />
                  規則摘要
                </span>
                <span class="promotion__metaVal">{{ p.ruleText }}</span>
              </div>
            </div>

            <div class="promotion__cardActions">
              <button class="promotion__btn2" @click="openDetail(p)">
                查看詳情
              </button>
              <button
                class="promotion__btn2 promotion__btn2--primary"
                @click="goShop"
              >
                去逛逛
              </button>
            </div>
          </article>
        </div>

        <!-- Empty -->
        <div v-else class="promotion__empty">
          <div class="promotion__emptyIcon" aria-hidden="true">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </div>
          <p class="promotion__emptyTitle">目前沒有符合條件的活動</p>
          <p class="promotion__emptyDesc">你可以切換狀態或直接前往商品頁。</p>
          <div class="promotion__emptyActions">
            <button
              class="promotion__btn promotion__btn--primary"
              @click="goShop"
            >
              前往商品
            </button>
            <button
              class="promotion__btn promotion__btn--ghost"
              @click="activeTab = 'ongoing'"
            >
              看進行中
            </button>
          </div>
        </div>

        <!-- Bottom CTA -->
        <div class="promotion__cta">
          <div class="promotion__ctaLeft">
            <p class="promotion__ctaTitle">想直接開始？</p>
            <p class="promotion__ctaDesc">
              去商品頁挑一個系列，抽選或刮刮樂都可以馬上體驗。
            </p>
          </div>

          <div class="promotion__ctaRight">
            <button
              class="promotion__btn promotion__btn--primary"
              @click="goShop"
            >
              立即前往
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Detail Modal -->
    <div
      v-if="detailOpen"
      class="promotion__modal"
      role="dialog"
      aria-modal="true"
      @click.self="closeDetail"
    >
      <div class="promotion__modalCard">
        <div class="promotion__modalHead">
          <p class="promotion__modalTitle">{{ selected?.title }}</p>
          <button
            class="promotion__modalClose"
            type="button"
            @click="closeDetail"
          >
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </div>

        <div class="promotion__modalBody">
          <p class="promotion__modalStatus">
            <span
              class="promotion__status"
              :class="{
                'is-ongoing': selected?.status === 'ONGOING',
                'is-upcoming': selected?.status === 'UPCOMING',
                'is-ended': selected?.status === 'ENDED',
              }"
            >
              {{ statusText(selected?.status || 'ONGOING') }}
            </span>
            <span class="promotion__modalRange">
              {{
                formatRange(selected?.startAt || null, selected?.endAt || null)
              }}
            </span>
          </p>

          <p class="promotion__modalDesc">
            {{ selected?.description }}
          </p>

          <div class="promotion__modalBlock" v-if="selected?.detailText">
            <p class="promotion__modalBlockTitle">活動內容</p>
            <p class="promotion__modalBlockText">{{ selected?.detailText }}</p>
          </div>

          <div class="promotion__modalBlock" v-if="selected?.terms">
            <p class="promotion__modalBlockTitle">注意事項</p>
            <ul class="promotion__modalList">
              <li v-for="(t, i) in selected.terms" :key="t + i">{{ t }}</li>
            </ul>
          </div>
        </div>

        <div class="promotion__modalFoot">
          <button class="promotion__btn2" @click="closeDetail">關閉</button>
          <button
            class="promotion__btn2 promotion__btn2--primary"
            @click="goShop"
          >
            前往商品
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

type PromotionStatus = 'ONGOING' | 'UPCOMING' | 'ENDED';

type PromotionItem = {
  id: string;
  title: string;
  description: string;
  status: PromotionStatus;
  startAt?: string | null;
  endAt?: string | null;

  scopeText?: string; // 適用範圍（純文字）
  ruleText?: string; // 規則摘要（純文字）
  detailText?: string; // 詳情（純文字）
  terms?: string[]; // 注意事項（純文字）
};

const router = useRouter();
const year = computed(() => new Date().getFullYear());

/**
 * 這頁先用前端 mock，之後你要串 API 很簡單：
 * 1) promotions 改成 ref([])，onMounted 打 API 填入
 * 2) status 欄位由後端判斷或前端用時間推導都可以
 */
const promotions = ref<PromotionItem[]>([
  {
    id: 'p1',
    title: '首抽優惠',
    description:
      '首次體驗 STARDO 的用戶，可享指定折扣或加碼福利（以結帳顯示為準）。',
    status: 'ONGOING',
    startAt: null,
    endAt: null,
    scopeText: '部分商品 / 部分玩法',
    ruleText: '首次資格生效後，自動套用',
    detailText:
      '首抽優惠會在符合資格時自動套用，若同時存在其他優惠，將依結帳頁顯示的優先序處理。',
    terms: [
      '優惠是否顯示以結帳頁為準',
      '同一帳號僅限一次或依活動規則限制',
      'STARDO 保留活動調整與終止權利',
    ],
  },
  {
    id: 'p2',
    title: '連抽加碼',
    description: '指定連抽方案可能有額外回饋或折扣（以商品詳情與結帳為準）。',
    status: 'UPCOMING',
    startAt: '2026-02-15',
    endAt: '2026-03-01',
    scopeText: '支援連抽的商品',
    ruleText: '達指定連抽數量，符合條件即套用',
    detailText:
      '活動期間內，若商品支援連抽並達到指定連數，結帳時可能出現加碼或折扣顯示。',
    terms: ['活動開始前不會顯示', '實際方案依商品設定而異'],
  },
  {
    id: 'p3',
    title: '限時折扣',
    description: '部分系列於活動期間內會顯示折扣價。',
    status: 'ENDED',
    startAt: '2026-01-01',
    endAt: '2026-01-20',
    scopeText: '指定系列',
    ruleText: '折扣價優先於原價顯示',
    detailText:
      '限時折扣結束後會恢復原價，若你在折扣期間內下單，價格以你結帳時為準。',
    terms: ['已結束活動僅供參考', '價格與庫存依實際結帳與頁面為準'],
  },
]);

const activeTab = ref<'ongoing' | 'upcoming' | 'ended'>('ongoing');

const filteredPromotions = computed(() => {
  const tab = activeTab.value;
  const map: Record<typeof tab, PromotionStatus> = {
    ongoing: 'ONGOING',
    upcoming: 'UPCOMING',
    ended: 'ENDED',
  };
  const target = map[tab];
  return promotions.value.filter((p) => p.status === target);
});

const ongoingCount = computed(
  () => promotions.value.filter((p) => p.status === 'ONGOING').length,
);
const upcomingCount = computed(
  () => promotions.value.filter((p) => p.status === 'UPCOMING').length,
);
const endedCount = computed(
  () => promotions.value.filter((p) => p.status === 'ENDED').length,
);

const goHome = () => router.push({ name: 'Home' });
const goShop = () => router.push({ name: 'IchibanList' });

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};

const formatRange = (start?: string | null, end?: string | null) => {
  const s = start ? formatDate(start) : '-';
  const e = end ? formatDate(end) : '-';
  if (s === '-' && e === '-') return '依結帳/頁面顯示為準';
  if (s !== '-' && e === '-') return `自 ${s}`;
  if (s === '-' && e !== '-') return `至 ${e}`;
  return `${s} - ${e}`;
};

const statusText = (s: PromotionStatus) => {
  if (s === 'ONGOING') return '進行中';
  if (s === 'UPCOMING') return '即將開始';
  return '已結束';
};

/* modal */
const detailOpen = ref(false);
const selected = ref<PromotionItem | null>(null);

const openDetail = (p: PromotionItem) => {
  selected.value = p;
  detailOpen.value = true;
};

const closeDetail = () => {
  detailOpen.value = false;
  selected.value = null;
};
</script>

<style scoped lang="scss">
.promotion {
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

  &__filters {
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

    &.is-active {
      border-color: rgba(229, 166, 87, 0.55);
      box-shadow: 0 0 0 3px rgba(229, 166, 87, 0.18);
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

  &__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin: 14px 0 18px;
  }

  &__summaryItem {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    padding: 12px 12px 10px;
  }

  &__summaryNum {
    margin: 0 0 2px;
    font-weight: 1000;
    font-size: 18px;
    color: rgba(178, 71, 58, 0.95);
  }

  &__summaryLabel {
    margin: 0;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    letter-spacing: 1px;
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

  &__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 1000;
    letter-spacing: 1px;
    width: fit-content;

    &.is-ongoing {
      color: rgba(0, 0, 0, 0.9);
      background: rgba(229, 166, 87, 0.9);
      border: 1px solid rgba(229, 166, 87, 0.9);
    }

    &.is-upcoming {
      color: rgba(0, 0, 0, 0.85);
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    &.is-ended {
      color: rgba(0, 0, 0, 0.65);
      background: rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.06);
    }
  }

  &__meta {
    display: grid;
    gap: 8px;
    padding: 10px 0 0;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__metaRow {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.65);
  }

  &__metaKey {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    color: rgba(0, 0, 0, 0.72);
    font-weight: 900;
  }

  &__metaVal {
    text-align: right;
    line-height: 1.5;
    color: rgba(0, 0, 0, 0.7);
  }

  &__cardActions {
    margin-top: auto;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
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

  /* Empty */
  &__empty {
    margin-top: 16px;
    border-radius: 18px;
    padding: 22px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    text-align: center;
  }

  &__emptyIcon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    margin: 0 auto 10px;

    background: rgba(178, 71, 58, 0.08);
    border: 1px solid rgba(178, 71, 58, 0.14);
    color: rgba(178, 71, 58, 0.95);
    font-size: 18px;
  }

  &__emptyTitle {
    margin: 0 0 6px;
    font-weight: 1000;
    letter-spacing: 0.2px;
    color: #111;
  }

  &__emptyDesc {
    margin: 0 0 12px;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.7;
  }

  &__emptyActions {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
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

  /* Modal */
  &__modal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;
    padding: 18px;
  }

  &__modalCard {
    width: 100%;
    max-width: 720px;
    border-radius: 18px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.12);
    overflow: hidden;
  }

  &__modalHead {
    padding: 14px 14px;
    background: #000;
    color: #fff;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  &__modalTitle {
    margin: 0;
    font-weight: 1000;
    letter-spacing: 0.3px;
    font-size: 16px;
  }

  &__modalClose {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    cursor: pointer;
    display: grid;
    place-items: center;
  }

  &__modalBody {
    padding: 14px 16px 4px;
  }

  &__modalStatus {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    margin: 0 0 10px;
  }

  &__modalRange {
    color: rgba(0, 0, 0, 0.6);
    font-size: 13px;
  }

  &__modalDesc {
    margin: 0 0 12px;
    line-height: 1.75;
    color: rgba(0, 0, 0, 0.72);
  }

  &__modalBlock {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  &__modalBlockTitle {
    margin: 0 0 8px;
    font-weight: 1000;
    letter-spacing: 0.2px;
    color: #111;
  }

  &__modalBlockText {
    margin: 0;
    line-height: 1.75;
    color: rgba(0, 0, 0, 0.72);
  }

  &__modalList {
    margin: 0;
    padding-left: 18px;
    color: rgba(0, 0, 0, 0.72);
    line-height: 1.75;
  }

  &__modalFoot {
    padding: 12px 14px 14px;
    display: flex;
    justify-content: flex-end;
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

    &__summary {
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
  }
}
</style>
