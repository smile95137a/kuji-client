<!-- src/views/IchibanDetail.vue -->
<template>
  <div class="ichibanDetail">
    <main class="ichibanDetail__main">
      <section class="ichibanDetail__hero">
        <div class="ichibanDetail__heroHead">
          <nav class="ichibanDetail__breadcrumb">
            <span class="clickable" @click="goHome">首頁</span>
            <span class="ichibanDetail__breadcrumbSep">/</span>
            <span>{{ breadcrumbCategory }}</span>
            <span class="ichibanDetail__breadcrumbSep">/</span>
            <span class="ichibanDetail__breadcrumb-current">
              {{ kujiTitle }}
            </span>
          </nav>
        </div>

        <div class="ichibanDetail__top">
          <div class="ichibanDetail__mediaCard">
            <div class="ichibanDetail__banner">
              <img :src="bannerSrc" alt="STARO 商品主圖" />
            </div>

            <div v-if="galleryThumbs.length" class="ichibanDetail__gallery">
              <button
                v-for="(img, idx) in galleryThumbs"
                :key="img + idx"
                type="button"
                class="ichibanDetail__galleryItem"
                :class="{ 'is-active': idx === activeGalleryIndex }"
                @click="activeGalleryIndex = idx"
              >
                <img :src="img" alt="商品縮圖" />
              </button>
            </div>
          </div>

          <aside class="ichibanDetail__info">
            <template v-if="loading">
              <p class="ichibanDetail__eyebrow">LOADING</p>
              <h1 class="ichibanDetail__title">載入中...</h1>
              <p class="ichibanDetail__subtitle">請稍候，正在取得商品資訊。</p>
            </template>

            <template v-else-if="errorMsg">
              <p class="ichibanDetail__eyebrow">ERROR</p>
              <h1 class="ichibanDetail__title">載入失敗</h1>
              <p class="ichibanDetail__subtitle">{{ errorMsg }}</p>

              <div class="ichibanDetail__actions">
                <KujiButton variant="secondary" block @click="reload">
                  重新載入
                </KujiButton>
              </div>
            </template>

            <template v-else>
              <p class="ichibanDetail__eyebrow">STARO ITEM</p>

              <h1 class="ichibanDetail__title">{{ kujiTitle }}</h1>

              <p v-if="kujiSubTitle" class="ichibanDetail__subtitle">
                {{ kujiSubTitle }}
              </p>

              <div class="ichibanDetail__priceBox">
                <span class="ichibanDetail__priceBoxTag">特價</span>

                <div class="ichibanDetail__priceBoxRight">
                  <span class="ichibanDetail__priceBoxNumber">
                    <NumberFormatter :number="displayPrice" locale="zh-TW" />
                  </span>
                  <span class="ichibanDetail__priceBoxUnit">元</span>
                </div>
              </div>

              <div class="ichibanDetail__metaWrap">
                <IchibanMetaInfo
                  :detail="detail"
                  :play-mode-text="playModeText"
                  :period-text="periodText"
                  :tags="tags"
                />
              </div>

              <div v-if="protectionInfo" class="ichibanDetail__protection">
                <div class="protection-badge">
                  <div class="protection-content">
                    <div class="protection-title">開套者保護期</div>

                    <div class="protection-message">
                      {{ protectionInfo.message }}
                    </div>

                    <div
                      v-if="protectionCountdownText"
                      class="protection-countdown"
                    >
                      保護剩餘：{{ protectionCountdownText }}
                    </div>

                    <div
                      v-if="protectionInfo.endTime"
                      class="protection-detail"
                    >
                      有效期限：{{ protectionInfo.endTime }}
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="showOpenerBanner"
                class="ichibanDetail__designation-banner"
              >
                <div class="designation-badge">
                  <div class="designation-content">
                    <div class="designation-title">指定大獎號碼</div>
                    <div class="designation-message">
                      您是開套者，請先指定大獎號碼才能開始抽獎。
                    </div>
                  </div>

                  <KujiButton
                    variant="primary"
                    size="sm"
                    @click="triggerDesignationFromSession"
                  >
                    立即指定
                  </KujiButton>
                </div>
              </div>

              <div v-if="isGacha" class="ichibanDetail__gachaCount">
                <div class="ichibanDetail__gachaCountHead">
                  <span class="ichibanDetail__gachaCountLabel">扭蛋次數</span>
                  <span class="ichibanDetail__gachaCountHint">
                    選擇一次要扭幾顆
                  </span>
                </div>

                <div class="ichibanDetail__gachaCountBtns">
                  <button
                    v-for="n in [1, 2, 3, 5, 10]"
                    :key="n"
                    type="button"
                    :class="[
                      'ichibanDetail__gachaCountBtn',
                      { 'is-active': gachaCount === n },
                    ]"
                    @click="gachaCount = n"
                  >
                    {{ n }}
                  </button>
                </div>
              </div>

              <div class="ichibanDetail__actions">
                <KujiButton
                  class="ichibanDetail__cta ichibanDetail__cta--primary"
                  variant="primary"
                  block
                  @click="handlePrimaryAction"
                >
                  <template #icon>
                    <span class="ichibanDetail__ctaIcon">
                      <font-awesome-icon
                        :icon="
                          isGacha
                            ? 'fa-capsules'
                            : isScratchMode
                              ? 'fa-wand-magic-sparkles'
                              : 'fa-gift'
                        "
                      />
                    </span>
                  </template>

                  {{ primaryCtaText }}
                </KujiButton>

                <KujiButton
                  class="ichibanDetail__cta ichibanDetail__cta--secondary"
                  variant="secondary"
                  block
                  @click="handleViewStatus"
                >
                  檢視抽況
                </KujiButton>
              </div>
            </template>
          </aside>
        </div>
      </section>

      <section v-if="detail?.content" class="ichibanDetail__intro">
        <header class="ichibanDetail__sectionHeader">
          <p class="ichibanDetail__sectionEyebrow">DETAIL</p>
          <h2 class="ichibanDetail__sectionTitle">賞品介紹</h2>
        </header>

        <div class="ichibanDetail__introBody">
          <div class="ichibanDetail__introContent" v-html="detail.content" />
        </div>
      </section>

      <section class="ichibanDetail__prizes">
        <header class="ichibanDetail__sectionHeader">
          <p class="ichibanDetail__sectionEyebrow">PRIZES</p>
          <h2 class="ichibanDetail__sectionTitle">賞品一覽</h2>
        </header>

        <div class="ichibanDetail__prizes-grid">
          <IchibanPrizeCard
            v-for="item in prizes"
            :key="item.id"
            :img-src="item.imgSrc"
            :name="item.name"
            :grade-label="item.gradeLabel"
            :grade-type="item.gradeType"
            :count-text="item.countText"
            :size-text="item.sizeText"
          />
        </div>
      </section>

      <section
        v-if="!isGacha"
        ref="statusSectionRef"
        class="ichibanDetail__status"
      >
        <header class="ichibanDetail__sectionHeader">
          <p class="ichibanDetail__sectionEyebrow">
            {{ isScratchMode ? 'SELECT' : 'STATUS' }}
          </p>
          <h2 class="ichibanDetail__sectionTitle">
            {{ isScratchMode ? '選擇格數' : '檢視抽況' }}
          </h2>
        </header>

        <div
          v-if="isScratchMode && designatedWinningNumbers.length"
          class="ichibanDetail__grandPrizeBanner"
        >
          <div class="grand-prize-announcement">
            <div class="grand-prize-content">
              <div class="grand-prize-title">中獎號碼公告</div>

              <div
                v-for="(group, idx) in grandPrizeDisplay"
                :key="idx"
                class="grand-prize-item"
              >
                <strong class="grand-prize-numbers">
                  {{ group.numbers.join('、') }}
                </strong>

                <span class="grand-prize-arrow">→</span>

                <span class="grand-prize-name">
                  {{ group.prizeName }}
                </span>
              </div>

              <div class="grand-prize-hint">刮中以上號碼即可獲得對應大獎！</div>
            </div>
          </div>
        </div>

        <ScratchRemainingCounter
          v-if="isScratchMode"
          :remaining-prizes="detail?.remainingDraws ?? null"
          :total-prizes="detail?.maxDraws ?? null"
          :tickets="statusCards"
          :protection-info="protectionInfo"
          :protection-end-time="protectionEndTime"
          @expired="reload"
        />

        <RemainingCounter
          v-else
          :remaining-prizes="detail?.remainingPrizes ?? null"
          :total-prizes="detail?.totalPrizes ?? null"
          :tickets="statusCards"
        />

        <IchibanScratchStatusGrid
          v-if="isScratchMode"
          :cards="statusCards"
          :active-cards="activeCards"
          :total-tickets="detail?.maxDraws ?? detail?.totalPrizes ?? 0"
          @select="handleScratchCardSelect"
        />

        <IchibanStatusGrid
          v-else
          :cards="statusCards"
          :active-cards="activeCards"
          @select="handleCardSelect"
        />
      </section>

      <IchibanNoticeSection />
    </main>

    <IchibanDrawPanel
      v-if="!isScratchMode"
      :is-open="isDrawPanelOpen"
      :remaining="detail?.remainingDraws ?? 0"
      :active-cards="activeCards"
      :active-card-numbers="activeCardNumbers"
      @close="closeDrawPanel"
      @randomSelect="handleRandomSelect"
      @exchange="handleExchange"
    />

    <IchibanScratchPanel
      :is-open="isScratchPanelOpen"
      :ticket-numbers="activeCardNumbers"
      :ticket-ids="activeCards"
      :remaining="scratchRemainingCount"
      :price-per-draw="displayPrice"
      @close="closeScratchPanel"
      @scratch="handleScratchFromPanel"
    />

    <PrizeDesignationDialog
      v-if="showDesignationDialog"
      :available-numbers="designationAvailableNumbers"
      :required-count="designationRequiredCount"
      :current-prize="designationCurrentPrize"
      :used-numbers="designationUsedNumbers"
      @confirm="onDesignationConfirm"
      @cancel="onDesignationCancel"
      @close="onDesignationCancel"
    />

    <DesignationWaitingOverlay
      :show="showWaitingOverlay"
      :opener-deadline="waitingOpenerDeadline"
      :message="waitingMessage"
      :lottery-id="kujiId"
      @close="onWaitingOverlayClose"
      @expired="onWaitingOverlayExpired"
      @designation-complete="onDesignationComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import KujiButton from '@/components/common/KujiButton.vue';
import NumberFormatter from '@/components/common/NumberFormatter.vue';

import IchibanPrizeCard from '@/components/ichiban/IchibanPrizeCard.vue';
import IchibanNoticeSection from '@/components/ichiban/IchibanNoticeSection.vue';
import IchibanStatusGrid from '@/components/ichiban/IchibanStatusGrid.vue';
import IchibanDrawPanel from '@/components/ichiban/IchibanDrawPanel.vue';
import IchibanScratchPanel from '@/components/ichiban/IchibanScratchPanel.vue';
import RemainingCounter from '@/components/IchibanDetail/RemainingCounter.vue';
import IchibanMetaInfo from '@/components/IchibanDetail/IchibanMetaInfo.vue';
import PrizeDesignationDialog from '@/components/common/PrizeDesignationDialog.vue';
import DesignationWaitingOverlay from '@/components/ichiban/DesignationWaitingOverlay.vue';
import ScratchRemainingCounter from '@/components/IchibanDetail/ScratchRemainingCounter.vue';
import IchibanScratchStatusGrid from '@/components/ichiban/IchibanScratchStatusGrid.vue';
import demo1 from '@/assets/image/demo1.jpg';

import {
  getBrowseLotteryById,
  incrementLotteryHotCount,
} from '@/services/lotteryBrowseService';
import {
  designatePrizePositions,
  drawLottery,
  type PrizeDesignation,
  type GrandPrizeInfo,
  type DrawResult,
  type DesignationPendingResponse,
  type SessionResponse,
} from '@/services/lotteryDrawService';
import { randomDrawLottery } from '@/services/lotteryRandomService';
import { executeApi } from '@/utils/executeApiUtils';
import { useOverlayStore } from '@/stores/overlay';
import { useAuthStore } from '@/stores/useAuthStore';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { gachaTearDialog } from '@/utils/dialog/kujiRevealStripDialog';
import { ichibanResultDialog } from '@/utils/dialog/ichibanResultDialog';
import { scratchCardDialog } from '@/utils/dialog/scratchCardDialog';
import { ichibanResultCardDialog } from '@/utils/dialog/ichibanResultCardDialog';
import { gotchaDialog } from '@/utils/dialog/gotchaDialog';
import { getLotterySession } from '@/services/lotteryDrawService';
import { formatPrizeLevel } from '@/utils/prizeLevel';

const overlay = useOverlayStore();
const authStore = useAuthStore();

/* -----------------------------
 * Route
 * ----------------------------- */
const route = useRoute();
const router = useRouter();
const kujiId = computed(() => String(route.params.id || ''));

/* -----------------------------
 * types
 * ----------------------------- */
type TicketItem = {
  id: string; //  UUID
  ticketNumber: number; // 物理位置（第幾格），用來定位 grid 哪格要更新
  revealedNumber?: number | null; // 刮開後顯示的亂數（隨機洗牌），僅作顯示用，不代表格子位置
  status: 'AVAILABLE' | 'DRAWN' | 'RESERVED' | 'LOCKED' | string;
  isDesignatedPrize?: boolean;

  level?: string | null;
  prizeLevel?: string | null;
  prize?: { level?: string | null } | null;
};

/* -----------------------------
 * API state
 * ----------------------------- */
const loading = ref(false);
const errorMsg = ref('');

const detail = ref<any>(null);
const prizesData = ref<any[]>([]);
const ticketData = ref<TicketItem[]>([]);
const session = ref<any>(null);

/** ✅ 新增：刮刮樂大獎中獎號碼（從 API 取得） */
type DesignatedWinningNumber = {
  revealedNumber: number;
  prizeId: string;
  prizeName: string;
  prizeLevel: string;
  prizeImageUrl: string | null;
};
const designatedWinningNumbers = ref<DesignatedWinningNumber[]>([]);

/* -----------------------------
 * 大獎指定對話框狀態
 * ----------------------------- */
const showDesignationDialog = ref(false);
const designationAvailableNumbers = ref<number[]>([]);
const designationRequiredCount = ref(3);
const designationCurrentPrize = ref<any>(null);
const designationUsedNumbers = ref<number[]>([]);
const designationResolve = ref<((numbers: number[]) => void) | null>(null);

/* -----------------------------
 * DesignationWaiting overlay state (T003)
 * ----------------------------- */
// === DesignationWaiting overlay state ===
let waitingPollInterval: ReturnType<typeof setInterval> | null = null;
const showWaitingOverlay = ref(false);
const waitingOpenerDeadline = ref('');
const waitingMessage = ref('');

const stopWaitingOverlay = () => {
  showWaitingOverlay.value = false;
};

const showDesignationWaitingOverlay = (deadline: string, message: string) => {
  waitingOpenerDeadline.value = deadline;
  waitingMessage.value = message;
  showWaitingOverlay.value = true;
  // Actual polling is handled by DesignationWaitingOverlay via useSessionPoller
};

const onWaitingOverlayClose = () => {
  stopWaitingOverlay();
  // Do NOT reload — user dismissed voluntarily. Guard in handleScratchCardSelect
  // ensures scratch calls continue to hit the API and be re-intercepted if needed.
};

const onDesignationComplete = async () => {
  stopWaitingOverlay();
  await reload();
};

const onWaitingOverlayExpired = async () => {
  stopWaitingOverlay();
  await reload();
  await ichibanInfoDialog({
    title: '計時結束',
    content: '計時結束，您已可嘗試成為開套者，請重新進入抽獎流程。',
  });
};

/* -----------------------------
 * gallery / banner
 * ----------------------------- */
const activeGalleryIndex = ref(0);

const galleryThumbs = computed<string[]>(() => {
  const imgs = detail.value?.galleryImages;
  return Array.isArray(imgs) ? imgs.filter(Boolean) : [];
});

const bannerSrc = computed(() => {
  const imgs = galleryThumbs.value;
  if (imgs.length)
    return imgs[Math.min(activeGalleryIndex.value, imgs.length - 1)];
  return detail.value?.imageUrl || demo1;
});

watch(
  () => detail.value?.id,
  () => {
    activeGalleryIndex.value = 0;
  },
);

/* -----------------------------
 * title / breadcrumb
 * ----------------------------- */
const kujiTitle = computed(() => detail.value?.title || '未命名商品');
const kujiSubTitle = computed(() => detail.value?.description || '');
const breadcrumbCategory = computed(() => detail.value?.categoryName || '商城');
const isOpener = computed(() => !!session.value?.isOpener);

/** 開套者是否已完成指定 — 優先使用後端明確訊號，回退到 designatedWinningNumbers 是否已填入 */
const designationDone = computed(
  () =>
    session.value?.isDesignationComplete === true ||
    designatedWinningNumbers.value.length > 0,
);

/** 顯示「請立即指定」橫幅的條件
 *  注意：後端 browse API 目前不回傳 gameMode，故移除該欄位判斷，
 *  改以 isScratchMode + isOpener + !designationDone 判斷是否需要顯示。 */
const showOpenerBanner = computed(
  () =>
    isScratchMode.value &&
    session.value?.isOpener === true &&
    !designationDone.value,
);

// isScratchPlayerMode / isScratchStoreMode / isScratchModeCustom 已移除
// 後端只有 SCRATCH_MODE 與 SCRATCH_CARD_MODE，統一用 isScratchMode 判斷

/* -----------------------------
 * helpers
 * ----------------------------- */
const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};

const periodText = computed(() => {
  const s = formatDate(detail.value?.startTime ?? null);
  const e = formatDate(detail.value?.endTime ?? null);
  if (s && e) return `${s} - ${e}`;
  if (e) return `至 ${e}`;
  if (s) return `自 ${s}`;
  return '-';
});

/* -----------------------------
 * playMode / tags
 * ----------------------------- */

/* -----------------------------
 * playMode / tags
 * ----------------------------- */

/** 刮刮樂 / 刮刮卡模式：playMode 為 SCRATCH_MODE 或 SCRATCH_CARD_MODE */
const isScratchMode = computed(() => {
  const m = String(detail.value?.playMode ?? '').toUpperCase();
  return m === 'SCRATCH_MODE' || m === 'SCRATCH_CARD_MODE';
});

/** 真正的扭蛋（加權隨機）：category=GACHA 且不是刮刮模式 */
const isGacha = computed(() => {
  const category = String(detail.value?.category ?? '').toUpperCase();
  const m = String(detail.value?.playMode ?? '').toUpperCase();
  return (
    category === 'GACHA' && m !== 'SCRATCH_MODE' && m !== 'SCRATCH_CARD_MODE'
  );
});

/** 扭蛋次數（1-10） */
const gachaCount = ref(1);

const primaryCtaText = computed(() => {
  if (isScratchMode.value) return '點下方格數開始刮！';
  if (isGacha.value) return `扭 ${gachaCount.value} 顆！`;
  return '開抽！';
});

const playModeText = computed(() => {
  const m = String(detail.value?.playMode ?? '').toUpperCase();
  const category = String(detail.value?.category ?? '').toUpperCase();
  // 先看 playMode，再看 category
  if (m === 'LOTTERY_MODE') return '抽籤型';
  if (m === 'SCRATCH_MODE') return '刮刮樂型';
  if (m === 'SCRATCH_CARD_MODE') return '刮刮卡型';
  if (category === 'GACHA') return '扭蛋'; // 只有無 playMode 的 GACHA 才顯示扭蛋
  return '-';
});

const tags = computed<string[]>(() => {
  const arr = detail.value?.tags;
  return Array.isArray(arr)
    ? arr.filter((x: any) => typeof x === 'string' && x.trim())
    : [];
});

/* -----------------------------
 * session.canDraw
 * ----------------------------- */
const canDraw = computed(() => session.value?.canDraw !== false);
const cannotDrawReason = computed(
  () => session.value?.cannotDrawReason || '目前無法抽選',
);

const protectionEndTime = ref<string | null>(null);
const protectionSecondsLeft = ref(0);
let protectionTimer: ReturnType<typeof setInterval> | null = null;

const stopProtectionTimer = () => {
  if (protectionTimer) {
    clearInterval(protectionTimer);
    protectionTimer = null;
  }
};

const calcProtectionSeconds = (endTime?: string | null) => {
  if (!endTime) return 0;
  const endMs = new Date(endTime).getTime();
  if (Number.isNaN(endMs)) return 0;
  return Math.max(0, Math.floor((endMs - Date.now()) / 1000));
};

const startProtectionTimer = (endTime?: string | null) => {
  stopProtectionTimer();
  protectionSecondsLeft.value = calcProtectionSeconds(endTime);
  if (protectionSecondsLeft.value <= 0) return;

  protectionTimer = setInterval(() => {
    protectionSecondsLeft.value = calcProtectionSeconds(
      protectionEndTime.value,
    );
    if (protectionSecondsLeft.value <= 0) {
      protectionEndTime.value = null;
      if (session.value) {
        session.value.protectionEndTime = null;
      }
      stopProtectionTimer();
    }
  }, 1000);
};

const hasActiveProtection = computed(() => {
  const endTime = protectionEndTime.value;
  if (!endTime) return false;
  return calcProtectionSeconds(endTime) > 0;
});

const protectionCountdownText = computed(() => {
  if (!hasActiveProtection.value || protectionSecondsLeft.value <= 0) return '';
  const minutes = Math.floor(protectionSecondsLeft.value / 60);
  const seconds = protectionSecondsLeft.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');
  return `${y}/${m}/${day} ${h}:${min}:${sec}`;
};

const protectionDeadlineText = computed(() =>
  protectionEndTime.value ? formatDateTime(protectionEndTime.value) : '',
);

const isProtectionBlockedState = (reason?: string | null) => {
  const text = String(reason ?? '')
    .trim()
    .toLowerCase();
  if (!text) return false;
  return (
    text.includes('draw is blocked until protection ends') ||
    text.includes('商品正在被其他玩家抽獎中') ||
    text.includes('保護期')
  );
};

const getProtectionBlockedMessage = () => {
  const countdown = protectionCountdownText.value;
  const deadline = protectionDeadlineText.value;
  const details: string[] = ['目前有其他玩家正在保護期中，請稍後再試。'];

  if (countdown) {
    details.push(`剩餘時間：${countdown}`);
  }
  if (deadline) {
    details.push(`保護截止：${deadline}`);
  }

  return details.join('<br/>');
};

const showBlockedByProtectionDialog = async (title = '暫時無法抽獎') => {
  await ichibanInfoDialog({
    title,
    content: getProtectionBlockedMessage(),
  });
};

/* -----------------------------
 * 保護期提示
 * ----------------------------- */
const isInProtection = computed(() => hasActiveProtection.value);

const protectionInfo = computed(() => {
  if (!isInProtection.value) return null;

  const endTime = protectionEndTime.value;

  if (!isOpener.value) {
    return {
      endTime: endTime ? formatDateTime(endTime) : '',
      message: '目前有其他玩家正在保護期中，請稍後再試',
    };
  }

  return {
    endTime: endTime ? formatDateTime(endTime) : '',
    message: '目前為您的保護期，其他玩家暫時無法抽獎',
  };
});

const goLogin = () => {
  router.push({ path: '/login' });
};

/* -----------------------------
 *  設計圖特價顯示：discounted 優先，沒有就用 per draw
 * ----------------------------- */
const displayPrice = computed(() => {
  const d = detail.value;
  if (!d) return 0;

  const discounted =
    d.discountedPrice != null ? Number(d.discountedPrice) : NaN;
  if (Number.isFinite(discounted) && discounted > 0) return discounted;

  return Number(d.currentPrice ?? d.pricePerDraw ?? 0) || 0;
});

/* -----------------------------
 * Prices（保留：若其他地方要用）
 * ----------------------------- */
type PriceItem = { label: string; amount: number; unit: string };

const prices = computed<PriceItem[]>(() => {
  const d = detail.value;
  if (!d) return [];

  const per = Number(d.currentPrice ?? d.pricePerDraw ?? 0) || 0;
  const discounted =
    d.discountedPrice != null ? Number(d.discountedPrice) : null;

  const hasDiscount =
    discounted != null && Number.isFinite(discounted) && discounted > 0;

  const arr: PriceItem[] = [{ label: '每抽', amount: per, unit: '元' }];

  if (hasDiscount) {
    const label = d.discountTriggered ? '折扣中' : '折扣後';
    arr.push({ label, amount: discounted!, unit: '元' });
  }

  return arr;
});

/* -----------------------------
 * Prizes
 * ----------------------------- */
const prizes = computed(() => {
  const arr = Array.isArray(prizesData.value) ? prizesData.value : [];
  const isCustomGachaPrizeList =
    String(detail.value?.category ?? '').toUpperCase() === 'CUSTOM_GACHA';

  const levelOrder: Record<string, number> = {
    GRAND: 0,
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    I: 9,
    J: 10,
    LAST: 99,
  };

  const mapped = arr.map((p: any) => {
    const level = String(p?.level ?? '').toUpperCase();
    const gradeLabel =
      level === 'LAST' ? '最後賞' : level ? `${level}賞` : '賞品';

    const q = Number(p?.quantity ?? 0) || 0;
    const r = Number(p?.remaining ?? 0) || 0;
    const countText = `${r}/${q}`;

    const gradeType: 'primary' | 'secondary' =
      p?.isGrandPrize || level === 'A' || level === 'B'
        ? 'primary'
        : 'secondary';

    return {
      id: String(p?.id),
      gradeLabel: formatPrizeLevel(level) || gradeLabel,
      gradeType,
      countText,
      sizeText: p?.sizeText ? String(p.sizeText) : '-',
      name: String(p?.name ?? '未命名賞品'),
      imgSrc: String(p?.imageUrl ?? '') || demo1,

      _lvlOrder: levelOrder[level] ?? 50,
      _num: Number(p?.prizeNumber ?? 9999) || 9999,
      _isLast: !!p?.isLastPrize || level === 'LAST',
      _isGrand: !!p?.isGrandPrize || level === 'GRAND',
    };
  });

  mapped.sort((a: any, b: any) => {
    if (isCustomGachaPrizeList) {
      if (a._isGrand !== b._isGrand) return a._isGrand ? -1 : 1;
    } else if (a._isLast !== b._isLast) {
      return a._isLast ? -1 : 1;
    }
    if (a._lvlOrder !== b._lvlOrder) return a._lvlOrder - b._lvlOrder;
    return a._num - b._num;
  });

  return mapped.map(
    ({ _lvlOrder, _num, _isLast, _isGrand, ...rest }: any) => rest,
  );
});

/* -----------------------------
 * 抽況
 * ----------------------------- */
const statusSectionRef = ref<HTMLElement | null>(null);

const isDrawPanelOpen = ref(false);
const isScratchPanelOpen = ref(false);

/**  改成存 ticket UUID（string[]） */
const activeCards = ref<string[]>([]);

const statusCards = computed<TicketItem[]>(() => {
  const arr = Array.isArray(ticketData.value) ? ticketData.value : [];
  return arr;
});
const ticketNoById = computed<Record<string, number>>(() => {
  const map: Record<string, number> = {};
  const arr = statusCards.value || [];
  for (const t of arr) {
    const id = String((t as any).id || '');
    if (!id) continue;
    map[id] = Number((t as any).ticketNumber ?? 0);
  }
  return map;
});

const ticketIdByNo = computed<Record<number, string>>(() => {
  const map: Record<number, string> = {};
  const arr = statusCards.value || [];
  for (const t of arr) {
    const ticketNumber = Number((t as any).ticketNumber ?? 0);
    const id = String((t as any).id || '');
    if (!ticketNumber || !id) continue;
    map[ticketNumber] = id;
  }
  return map;
});

const activeCardNumbers = computed<number[]>(() => {
  return activeCards.value
    .map((id) => ticketNoById.value[String(id)])
    .filter((n) => Number.isFinite(n) && n > 0);
});

/**  可用票券 UUID（AVAILABLE） */
const availableTicketIds = computed<string[]>(() => {
  return statusCards.value
    .filter((t) => String(t.status).toUpperCase() === 'AVAILABLE')
    .map((t) => String(t.id));
});

/** 刮刮樂模式下，剩餘可刮格數（由 tickets 計算，數字精確） */
const scratchRemainingCount = computed(() => availableTicketIds.value.length);

/** ✅ 刮刮樂大獎中獎號碼（從 designatedWinningNumbers 取得） */
const grandPrizeNumbers = computed<number[]>(() => {
  if (!isScratchMode.value) return [];
  return designatedWinningNumbers.value
    .map((d) => d.revealedNumber)
    .filter((n) => n > 0);
});

/** 刮刮樂大獎資訊顯示文字 */
const grandPrizeDisplay = computed(() => {
  if (!isScratchMode.value || !designatedWinningNumbers.value.length)
    return null;

  // 按 prizeId 分組
  const grouped = designatedWinningNumbers.value.reduce(
    (acc, item) => {
      if (!acc[item.prizeId]) {
        acc[item.prizeId] = {
          prizeName: item.prizeName,
          prizeLevel: item.prizeLevel,
          numbers: [],
        };
      }
      acc[item.prizeId].numbers.push(item.revealedNumber);
      return acc;
    },
    {} as Record<
      string,
      { prizeName: string; prizeLevel: string; numbers: number[] }
    >,
  );

  return Object.values(grouped);
});

const toggleCardSelection = (ticketId: string) => {
  if (!availableTicketIds.value.includes(ticketId)) return;

  const idx = activeCards.value.indexOf(ticketId);
  if (idx >= 0) activeCards.value.splice(idx, 1);
  else activeCards.value.push(ticketId);
};

/**
 * 票格點擊：刮刮樂模式只保留一格選取；一番賞模式開抽況面板
 */
const handleCardSelect = async (ticketId: string) => {
  if (isScratchMode.value) {
    await handleScratchCardSelect(
      Number(ticketNoById.value[String(ticketId)] ?? 0),
    );
  } else {
    await openDrawPanelFromCard(ticketId);
  }
};

/**
 * 刮刮樂格子點擊：支援多選，每次 toggle 該格，面板跟著顯示/隱藏
 */
const handleScratchCardSelect = async (ticketNumber: number) => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  if (showWaitingOverlay.value) return;

  const normalizedTicketNumber = Number(ticketNumber ?? 0);
  if (!Number.isFinite(normalizedTicketNumber) || normalizedTicketNumber <= 0) {
    return;
  }

  const normalizedTicketId = String(
    ticketIdByNo.value[normalizedTicketNumber] ?? '',
  );
  if (!normalizedTicketId) return;

  if (!availableTicketIds.value.includes(normalizedTicketId)) return;

  const idx = activeCards.value.findIndex(
    (id) => String(id) === normalizedTicketId,
  );

  if (idx >= 0) {
    activeCards.value.splice(idx, 1);
  } else {
    activeCards.value.push(normalizedTicketId);
  }

  isScratchPanelOpen.value = activeCards.value.length > 0;
};

const closeDrawPanel = () => {
  isDrawPanelOpen.value = false;
  activeCards.value = [];
};

const closeScratchPanel = () => {
  isScratchPanelOpen.value = false;
  activeCards.value = [];
};

/* -----------------------------
 * Actions（全部 await ensureCanDraw）
 * ----------------------------- */
const ensureCanDraw = async () => {
  if (!authStore.isLogin) {
    try {
      overlay.open('ichiban-info', false);
      await ichibanInfoDialog({
        title: '請先登入',
        content: '需要登入才能進行此操作，請先登入您的帳號。',
      });
    } finally {
      overlay.close();
    }
    goLogin();
    return false;
  }

  if (!canDraw.value) {
    try {
      overlay.open('ichiban-info', false);
      if (isProtectionBlockedState(cannotDrawReason.value)) {
        await showBlockedByProtectionDialog();
      } else {
        await ichibanInfoDialog({
          title: '提示訊息',
          content: cannotDrawReason.value,
        });
      }
    } finally {
      overlay.close();
    }
    return false;
  }
  return true;
};

const handleDraw = async () => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
  isDrawPanelOpen.value = true;
};

const syncProtectionEndTime = (
  value?: string | null,
  options?: { forceClear?: boolean },
) => {
  const current = protectionEndTime.value;

  if (value) {
    protectionEndTime.value = value;
    if (!session.value) {
      session.value = {
        protectionEndTime: value,
      };
    } else {
      session.value.protectionEndTime = value;
    }
    startProtectionTimer(value);
    return;
  }

  if (current && calcProtectionSeconds(current) > 0) {
    protectionEndTime.value = current;
    if (session.value) {
      session.value.protectionEndTime = current;
    }
    startProtectionTimer(current);
    return;
  }

  protectionEndTime.value = null;
  if (options?.forceClear && session.value) {
    session.value.protectionEndTime = null;
  }
  startProtectionTimer(null);
};

const normalizePaymentType = (value: unknown): 'GOLD' | 'BONUS' => {
  const normalized = String(value ?? '').toUpperCase();
  return normalized === 'BONUS' ? 'BONUS' : 'GOLD';
};

const resolvePaymentTypeFromResults = (
  results: DrawResult[],
): 'GOLD' | 'BONUS' => {
  for (const item of results) {
    const typed = String(
      (item as any)?.costType ?? (item as any)?.paymentType ?? '',
    ).toUpperCase();
    if (typed === 'GOLD' || typed === 'BONUS') return typed;
  }

  const totalGoldSpent = results.reduce(
    (sum, item) => sum + (Number(item?.goldSpent ?? 0) || 0),
    0,
  );
  const totalBonusSpent = results.reduce(
    (sum, item) => sum + (Number(item?.bonusSpent ?? 0) || 0),
    0,
  );

  if (totalBonusSpent > 0 && totalGoldSpent <= 0) return 'BONUS';
  return normalizePaymentType(detail.value?.paymentType);
};

const getPaymentLabel = (value: 'GOLD' | 'BONUS') => {
  return value === 'BONUS' ? '紅利' : '金幣';
};

const calcTotalSpend = (
  results: DrawResult[],
  fallbackCount: number,
  paymentType: 'GOLD' | 'BONUS',
) => {
  const key = paymentType === 'BONUS' ? 'bonusSpent' : 'goldSpent';
  const apiTotal = results.reduce(
    (sum, item) => sum + (Number((item as any)?.[key] ?? 0) || 0),
    0,
  );
  if (apiTotal > 0) return apiTotal;
  return (Number(displayPrice.value ?? 0) || 0) * fallbackCount;
};

const handleGacha = async () => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  const count = Math.min(Math.max(1, gachaCount.value), 10);

  await executeApi({
    // GACHA 走 /lottery/random/{id}/draw（加權隨機），count 為 query param
    fn: () => randomDrawLottery(kujiId.value, count),
    onSuccess: async (data: any) => {
      // v4.0: DrawBatchResponse { playMode, gameMode, results[] }
      // 相容舊格式 DrawResponseRes { results, goldUsed, ... } 或裸陣列
      const drawResults: DrawResult[] = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

      // ✅ 新增：處理 protectionEndTime（扭蛋模式為 null）
      syncProtectionEndTime(data?.protectionEndTime);

      // 檢查後端回傳的失敗結果
      if (drawResults.length > 0 && drawResults[0]?.success === false) {
        if (isProtectionBlockedState(drawResults[0].message)) {
          await showBlockedByProtectionDialog();
        } else {
          await ichibanInfoDialog({
            title: '扭蛋失敗',
            content: drawResults[0].message || '請稍後再試',
          });
        }
        return;
      }

      overlay.open();

      try {
        // 扭蛋抽獎動畫
        await gotchaDialog({
          title: '扭蛋機抽獎中',
          pulls: drawResults,
          speed: 0.6,
        });

        const drawnCount = drawResults.length;
        const paymentType = resolvePaymentTypeFromResults(drawResults);
        const totalPrice = calcTotalSpend(drawResults, drawnCount, paymentType);
        const costTypeLabel = getPaymentLabel(paymentType);

        const beforeRemain = Math.max(
          0,
          Number(detail.value?.remainingPrizes ?? 0) || 0,
        );
        const remain = Math.max(0, beforeRemain - drawnCount);

        // 無論動畫結果如何，都顯示抽獎結果
        await ichibanResultDialog({
          remain,
          count: drawnCount,
          totalPrice,
          costTypeLabel,
          items: drawResults,
        });

        // 免單彈窗
        await showFreeDrawModal(drawResults);
      } finally {
        overlay.close();
      }

      await reload();
    },
    onFail: async () => {
      await ichibanInfoDialog({
        title: '扭蛋失敗',
        content: '請稍後再試',
      });
    },
  });
};
const handleDesignatePrize = async (
  availableNumbers: number[],
  grandPrizes: GrandPrizeInfo[],
) => {
  if (!availableNumbers.length) return;

  try {
    // grandPrizes 直接來自 draw 回應，不再從本地 prizesData 取
    if (!grandPrizes.length) {
      await ichibanInfoDialog({
        title: '錯誤',
        content: '此套餐沒有設定大獎',
      });
      return;
    }

    const designations: PrizeDesignation[] = [];
    const usedNumbers: number[] = [];

    // 為每個大獎依次選號
    for (const prize of grandPrizes) {
      const quantity = prize.quantity || 1;

      // 顯示對話框讓玩家選號
      const selectedNumbers = await showDesignationUI(
        availableNumbers,
        quantity,
        prize,
        usedNumbers,
      );

      // 玩家取消
      if (!selectedNumbers || selectedNumbers.length === 0) {
        await ichibanInfoDialog({
          title: '已取消',
          content: '請先指定大獎位置才能開始抽獎',
        });
        return;
      }

      // 將選擇的號碼加入指定列表
      for (const num of selectedNumbers) {
        designations.push({
          revealedNumber: num,
          prizeId: prize.prizeId, // ✅ 使用 API 回應的 prizeId 欄位
        });
        usedNumbers.push(num);
      }
    }

    // ✅ 調用 API 並接收回應
    let designateResult: any;
    try {
      designateResult = await designatePrizePositions(kujiId.value, {
        designations,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '指定失敗，請稍後再試。';
      await ichibanInfoDialog({ title: '指定失敗', content: msg });
      // Re-invoke the full designation flow so player can re-select numbers and retry
      await handleDesignatePrize(availableNumbers, grandPrizes);
      return;
    }

    // ✅ 更新 designatedWinningNumbers（designateResult 為 ApiResponse，資料在 .data 層）
    if (designateResult?.data?.designatedWinningNumbers) {
      designatedWinningNumbers.value =
        designateResult.data.designatedWinningNumbers;
    }

    await ichibanInfoDialog({
      title: '大獎位置已設定',
      content: `已成功指定 ${designations.length} 個大獎位置，開始抽獎吧！`,
    });

    await refreshSession(); // 🔥 指定後刷新

    // 🔥 再抽一次
    await handleScratch();
  } finally {
  }
};

/** 顯示大獎指定 UI 並等待玩家選擇 */
const showDesignationUI = (
  availableNumbers: number[],
  count: number,
  prize: any,
  usedNumbers: number[],
): Promise<number[]> => {
  return new Promise((resolve) => {
    designationAvailableNumbers.value = availableNumbers;
    designationRequiredCount.value = count;
    designationCurrentPrize.value = prize;
    designationUsedNumbers.value = usedNumbers;
    showDesignationDialog.value = true;
    designationResolve.value = resolve;
  });
};

const onDesignationConfirm = (numbers: number[]) => {
  showDesignationDialog.value = false;
  if (designationResolve.value) {
    designationResolve.value(numbers);
    designationResolve.value = null;
  }
};

const onDesignationCancel = () => {
  showDesignationDialog.value = false;
  if (designationResolve.value) {
    designationResolve.value([]);
    designationResolve.value = null;
  }
};

/** 開套者從橫幅點擊「立即指定」，使用 probe ticket 觸發 designationRequired 流程 */
const triggerDesignationFromSession = async () => {
  const probeTicketId = availableTicketIds.value[0];
  if (!probeTicketId) {
    await ichibanInfoDialog({
      title: '提示訊息',
      content: '目前無可用格數，無法開始指定流程。',
    });
    return;
  }

  await executeApi({
    fn: () => drawLottery(kujiId.value, { count: 1, tickets: [probeTicketId] }),
    onSuccess: async (data: any) => {
      if (data?.designationRequired === true) {
        await handleDesignatePrize(
          data.availableNumbers ?? [],
          data.grandPrizes ?? [],
        );
      }
    },
    onFail: async () => {
      await ichibanInfoDialog({
        title: '錯誤',
        content: '無法取得指定流程資訊，請稍後再試。',
      });
    },
  });
};

const handleScratchFromPanel = async (payload: { ticketIds: string[] }) => {
  if (showWaitingOverlay.value) return;

  closeScratchPanel();

  const ticketIds = Array.isArray(payload.ticketIds)
    ? payload.ticketIds.map((id) => String(id)).filter(Boolean)
    : [];

  await handleScratchBatch(ticketIds);
};

const handlePrimaryAction = async () => {
  if (isScratchMode.value) {
    // 刮刮樂：引導使用者在下方格數選擇格子
    statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (isGacha.value) {
    await handleGacha();
    return;
  }

  await handleDraw(); // LOTTERY_MODE：開抽況面板
};

const handleViewStatus = () => {
  statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
};

/**  這裡接收 ticketId(UUID) */
const openDrawPanelFromCard = async (ticketId: string) => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  toggleCardSelection(ticketId);
  isDrawPanelOpen.value = true;
};

/**  隨機挑 N 張（只是 UI 上選取 tickets） */
const handleRandomSelect = async (count: number) => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  const available = [...availableTicketIds.value];
  if (!available.length) return;

  const selectCount = Math.min(count, available.length);
  const shuffled = [...available].sort(() => Math.random() - 0.5);

  activeCards.value = shuffled.slice(0, selectCount);
  isDrawPanelOpen.value = true;
};

/**
 *  兌換：送後端 DrawRequest
 * 規則：count = tickets.length
 * payload 只需要 type + tickets
 */
const handleExchange = async (payload: {
  type: 'gold' | 'silver';
  tickets: string[]; // UUID list
}) => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  const tickets = Array.isArray(payload.tickets) ? payload.tickets : [];
  const count = tickets.length;

  if (count <= 0) {
    try {
      overlay.open('ichiban-info', false);
      await ichibanInfoDialog({
        title: '提示訊息',
        content: '請先選擇至少 1 張獎籤',
      });
    } finally {
      overlay.close();
    }
    return;
  }

  const safeRemaining = Math.max(
    0,
    Number(
      detail.value?.remainingPrizes ?? availableTicketIds.value.length ?? 0,
    ),
  );

  if (safeRemaining <= 0) {
    try {
      overlay.open('ichiban-info', false);
      await ichibanInfoDialog({
        title: '提示訊息',
        content: '已無剩餘抽數',
      });
    } finally {
      overlay.close();
    }
    return;
  }

  const safeTickets = tickets.slice(0, safeRemaining);
  const safeCount = safeTickets.length;

  if (String(detail.value?.category ?? '').toUpperCase() === 'TRADING_CARD') {
    await executeApi({
      fn: () =>
        drawLottery(kujiId.value, {
          count: safeCount,
          tickets: safeTickets,
        }),
      onSuccess: async (data: any) => {
        // v4.0: DrawBatchResponse.results
        const drawResults: DrawResult[] = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : [];

        // ✅ 新增：處理 protectionEndTime
        syncProtectionEndTime(data?.protectionEndTime);

        if (drawResults.length > 0 && drawResults[0]?.success === false) {
          if (isProtectionBlockedState(drawResults[0].message)) {
            await showBlockedByProtectionDialog();
          } else {
            await ichibanInfoDialog({
              title: '抽獎失敗',
              content: drawResults[0].message || '請稍後再試',
            });
          }
          return;
        }

        closeDrawPanel();
        overlay.open();

        try {
          const drawnCount = drawResults.length;
          const unitPrice = Number(displayPrice.value ?? 0) || 0;
          const totalPrice = unitPrice * drawnCount;
          const beforeRemain = Math.max(
            0,
            Number(
              detail.value?.remainingPrizes ??
                availableTicketIds.value.length ??
                0,
            ) || 0,
          );

          const remain = Math.max(0, beforeRemain - drawnCount);

          const again = await ichibanResultCardDialog({
            remain,
            count: drawnCount,
            totalPrice,
            items: drawResults,
          });

          // 免單彈窗
          await showFreeDrawModal(drawResults);
        } finally {
          overlay.close();
        }

        await reload();
      },

      onFail: async () => {
        await ichibanInfoDialog({
          title: '抽獎失敗',
          content: '請稍後再試',
        });
      },
    });
    return;
  }

  if (isScratchMode.value) {
    // 刮刮樂：直接用 safeTickets[0] UUID 執行抽取
    await handleScratch(safeTickets[0]);
    return;
  } else {
    await executeApi({
      fn: () =>
        drawLottery(kujiId.value, {
          count: safeCount,
          tickets: safeTickets,
        }),
      onSuccess: async (data: any) => {
        // v4.0: DrawBatchResponse.results
        const drawResults: DrawResult[] = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : [];

        // ✅ 新增：處理 protectionEndTime
        syncProtectionEndTime(data?.protectionEndTime);

        if (drawResults.length > 0 && drawResults[0]?.success === false) {
          if (isProtectionBlockedState(drawResults[0].message)) {
            await showBlockedByProtectionDialog();
          } else {
            await ichibanInfoDialog({
              title: '抽獎失敗',
              content: drawResults[0].message || '請稍後再試',
            });
          }
          return;
        }

        closeDrawPanel();
        overlay.open();

        try {
          const tearResult = await gachaTearDialog({ pulls: drawResults });
          if (!tearResult) return;

          const drawnCount = drawResults.length;
          const paymentType = resolvePaymentTypeFromResults(drawResults);
          const totalPrice = calcTotalSpend(
            drawResults,
            drawnCount,
            paymentType,
          );
          const costTypeLabel = getPaymentLabel(paymentType);
          const beforeRemain = Math.max(
            0,
            Number(
              detail.value?.remainingPrizes ??
                availableTicketIds.value.length ??
                0,
            ) || 0,
          );

          const remain = Math.max(0, beforeRemain - drawnCount);

          await ichibanResultDialog({
            remain,
            count: drawnCount,
            totalPrice,
            costTypeLabel,
            items: drawResults,
          });

          // 免單彈窗
          await showFreeDrawModal(drawResults);
        } finally {
          overlay.close();
        }

        await reload();
      },

      onFail: async () => {
        await ichibanInfoDialog({
          title: '抽獎失敗',
          content: '請稍後再試',
        });
      },
    });
  }
};

/* -----------------------------
 * API fetch
 * ----------------------------- */
const refreshSession = async () => {
  if (!kujiId.value) return;

  await executeApi({
    fn: () => getLotterySession(kujiId.value),
    showCatchDialog: false,
    showFailDialog: false,
    onSuccess: (data: any) => {
      if (data) {
        session.value = {
          ...(session.value ?? {}),
          ...data,
        };
        syncProtectionEndTime(data.protectionEndTime ?? null, {
          forceClear: data.protectionEndTime == null,
        });
        return;
      }

      if (!hasActiveProtection.value) {
        session.value = null;
        syncProtectionEndTime(null, { forceClear: true });
      }
    },
  });
};

const reload = async () => {
  if (!kujiId.value) return;

  try {
    await executeApi({
      fn: () => getBrowseLotteryById(kujiId.value),
      showCatchDialog: false,
      showFailDialog: false,
      onSuccess: async (data) => {
        const payload = (data ?? {}) as any;
        const lottery = payload.lottery ?? payload;

        detail.value = lottery ?? null;
        prizesData.value = Array.isArray(payload.prizes)
          ? payload.prizes
          : Array.isArray(lottery?.prizes)
            ? lottery.prizes
            : [];
        ticketData.value = Array.isArray(payload.tickets)
          ? payload.tickets.map((t: any) => ({
              ...t,
              ticketNumber: Number(t.ticketNumber),
            }))
          : Array.isArray(lottery?.tickets)
            ? lottery.tickets.map((t: any) => ({
                ...t,
                ticketNumber: Number(t.ticketNumber),
              }))
            : [];

        const detailSession = payload.session ?? lottery?.session ?? null;
        if (detailSession) {
          session.value = {
            ...(session.value ?? {}),
            ...detailSession,
          };
          syncProtectionEndTime(detailSession.protectionEndTime ?? null, {
            forceClear: detailSession.protectionEndTime == null,
          });
        }

        // ✅ 新增：取得 designatedWinningNumbers（刮刮樂大獎中獎號碼）
        designatedWinningNumbers.value = Array.isArray(
          payload.designatedWinningNumbers ?? lottery?.designatedWinningNumbers,
        )
          ? ((payload.designatedWinningNumbers ??
              lottery?.designatedWinningNumbers) as DesignatedWinningNumber[])
          : [];
      },
      onFail: async () => {
        errorMsg.value = '載入失敗，請稍後再試';
      },
    });

    await refreshSession(); // 🔥 不再用 data.session

    // Proactive waiting / opener check (FE-4 + FE-6)
    // 後端 browse API 目前不回傳 gameMode，改以 isScratchMode 判斷
    if (isScratchMode.value && session.value) {
      const deadline = session.value.designationDeadline;
      const isOpenerLocal = session.value.isOpener === true;
      const designationDoneLocal =
        session.value.isDesignationComplete === true ||
        designatedWinningNumbers.value.length > 0;

      if (
        !designationDoneLocal &&
        deadline &&
        new Date(deadline) > new Date()
      ) {
        if (!isOpenerLocal && !showWaitingOverlay.value) {
          // Non-opener: proactively show waiting overlay
          showDesignationWaitingOverlay(
            deadline,
            '開套者正在指定大獎位置，請稍候。',
          );
        }
        // Opener: showOpenerBanner computed handles banner display reactively
      }
    }
  } catch (e) {
    console.error(e);
    errorMsg.value = '載入失敗，請稍後再試';
  } finally {
    loading.value = false;
  }
};

const HOT_LS_PREFIX = 'kuji_hot_v1'; // 想改版本可改 v2

const pad2 = (n: number) => String(n).padStart(2, '0');

const getTaipeiDayKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = pad2(now.getMonth() + 1);
  const d = pad2(now.getDate());
  return `${y}-${m}-${d}`;
};

const buildHotKey = (lotteryId: string) => {
  return `${HOT_LS_PREFIX}:${lotteryId}:${getTaipeiDayKey()}`;
};

const hasHitHotToday = (lotteryId: string) => {
  try {
    const key = buildHotKey(lotteryId);
    return localStorage.getItem(key) === '1';
  } catch (e) {
    return false;
  }
};

const markHitHotToday = (lotteryId: string) => {
  try {
    const key = buildHotKey(lotteryId);
    localStorage.setItem(key, '1');
  } catch (e) {
    // ignore
  }
};

const didHot = ref(false);

const hitHotCount = async () => {
  const id = kujiId.value;
  if (!id) return;

  if (didHot.value) return;

  if (hasHitHotToday(id)) {
    didHot.value = true;
    return;
  }

  didHot.value = true;

  await executeApi<any>({
    fn: () => incrementLotteryHotCount(id),
    showCatchDialog: false,
    showFailDialog: false,
    onSuccess: async () => {
      markHitHotToday(id);
    },
    onFail: async () => {
      didHot.value = false;
    },
  });
};

watch(
  () => protectionEndTime.value,
  (value) => {
    startProtectionTimer(value);
  },
  { immediate: true },
);

watch(
  () => protectionSecondsLeft.value,
  async (value, oldValue) => {
    if (oldValue && oldValue > 0 && value === 0 && kujiId.value) {
      await refreshSession();
    }
  },
);

onMounted(async () => {});

onUnmounted(() => {
  stopProtectionTimer();
});

watch(
  () => kujiId.value,
  async (id) => {
    if (!id) return;

    didHot.value = false;

    await hitHotCount();

    await reload();
  },
  { immediate: true },
);

/* -----------------------------
 * Nav
 * ----------------------------- */
const goHome = () => router.push({ name: 'Home' });

/**
 * 檢查免單彈窗
 */
const showFreeDrawModal = async (results: any[]) => {
  for (const result of results) {
    if (result.triggeredFreeDraw && Number(result.refundAmount ?? 0) > 0) {
      await ichibanInfoDialog({
        title: '恭喜！開套免單',
        content: `已退還 ${Number(result.refundAmount ?? 0).toLocaleString()} 金幣至你的帳戶`,
      });
    }
  }
};

/**
 * 單張刮刮樂抽獎：只負責打 API 拿結果，不開刮刮樂動畫
 */
const drawScratchTicket = async (
  ticketId: string,
): Promise<{
  result: DrawResult | null;
  rawData?: any;
  blocked?: boolean;
}> => {
  const ok = await ensureCanDraw();
  if (!ok) return { result: null, blocked: true };

  const selectedTicketId = String(ticketId || '');
  if (!selectedTicketId) return { result: null };

  await refreshSession();

  try {
    const res: any = await drawLottery(kujiId.value, {
      count: 1,
      tickets: [selectedTicketId],
    });

    const data = res?.data ?? res;

    if (data?.designationRequired) {
      await handleDesignatePrize(
        data.availableNumbers || [],
        data.grandPrizes || [],
      );
      return { result: null, rawData: data, blocked: true };
    }

    if ((data as DesignationPendingResponse)?.awaitingDesignation === true) {
      showDesignationWaitingOverlay(
        (data as DesignationPendingResponse).openerDeadline,
        (data as DesignationPendingResponse).message ||
          '開套者正在指定大獎位置，請稍候',
      );
      return { result: null, rawData: data, blocked: true };
    }

    const drawResults: DrawResult[] = Array.isArray(data?.results)
      ? data.results
      : [];

    if (!drawResults.length) {
      return { result: null, rawData: data };
    }

    syncProtectionEndTime(data?.protectionEndTime);

    const result = drawResults[0];

    if (result?.success === false) {
      if (isProtectionBlockedState(result.message)) {
        await showBlockedByProtectionDialog();
      } else {
        await ichibanInfoDialog({
          title: '刮刮樂失敗',
          content: result.message || '請稍後再試',
        });
      }
      return { result: null, rawData: data };
    }

    return {
      result,
      rawData: data,
    };
  } catch (error) {
    await ichibanInfoDialog({
      title: '刮刮樂失敗',
      content: '請稍後再試',
    });
    return { result: null };
  }
};
/**
 * 多張刮刮樂：先收集全部結果，再一次開多張 ScratchCardDialog
 * 這樣 skipOne / skipAll 才能真正控制整批
 */
const handleScratchBatch = async (ticketIds: string[]) => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  const normalizedTicketIds = Array.isArray(ticketIds)
    ? ticketIds.map((id) => String(id)).filter(Boolean)
    : [];

  if (!normalizedTicketIds.length) {
    statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const results: DrawResult[] = [];

  for (const ticketId of normalizedTicketIds) {
    if (showWaitingOverlay.value) return;

    const { result, blocked } = await drawScratchTicket(ticketId);

    // 被指定流程 / 等待流程攔截，整批先中止
    if (blocked) return;

    if (result) {
      results.push(result);
      if (result.isGrandPrize) {
        break;
      }
    }
  }

  if (!results.length) return;

  // 依 ticketNumber 排序，讓對話框順序與格子位置一致（spec 要求）
  const sortedResults = [...results].sort(
    (a, b) => Number(a.ticketNumber ?? 0) - Number(b.ticketNumber ?? 0),
  );

  const cards = sortedResults.map((item) => ({
    imageSrc: item.prizeImageUrl || '',
    imageAlt: item.prizeName || 'scratch prize',
    idleText: '刮開看看，抽到什麼賞？',
    revealText: item.prizeName ?? '銘謝惠顧',
    threshold: 45,
    grade: item.prizeLevel,
    revealedNumber: item.revealedNumber ?? null,
  }));
  overlay.open();
  activeCards.value = [];

  try {
    await scratchCardDialog({
      title: 'STARDO・刮刮樂',
      cards,
    });
    const paymentType = resolvePaymentTypeFromResults(results);
    await ichibanResultDialog({
      remain: Math.max(
        0,
        Number(detail.value?.remainingDraws ?? 0) - results.length,
      ),
      count: results.length,
      totalPrice: calcTotalSpend(results, results.length, paymentType),
      costTypeLabel: getPaymentLabel(paymentType),
      items: results,
    });

    await showFreeDrawModal(results);
  } finally {
    overlay.close();
  }

  await reload();
};
/**
 * 單張刮刮樂
 * @param ticketIdOverride 外部傳入的 ticket UUID；省略時從 activeCards[0] 取
 */
const handleScratch = async (ticketIdOverride?: string) => {
  const selectedTicketId = ticketIdOverride ?? activeCards.value[0];
  if (!selectedTicketId) {
    statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const { result, blocked, rawData } = await drawScratchTicket(
    String(selectedTicketId),
  );
  if (blocked || !result) return;

  overlay.open();
  activeCards.value = [];

  try {
    await scratchCardDialog({
      title: 'STARDO・刮刮樂',
      imageSrc: result.prizeImageUrl,
      idleText: '刮開看看，抽到什麼賞？',
      revealText: result.prizeName ?? '銘謝惠顧',
      threshold: 45,
      grade: result.prizeLevel,
      revealedNumber: result.revealedNumber ?? null,
    });

    const paymentType = resolvePaymentTypeFromResults([result]);
    await ichibanResultDialog({
      remain: Math.max(0, Number(detail.value?.remainingDraws ?? 0) - 1),
      count: 1,
      totalPrice: calcTotalSpend([result], 1, paymentType),
      costTypeLabel: getPaymentLabel(paymentType),
      items: [result],
    });

    await showFreeDrawModal([result]);
  } finally {
    overlay.close();
  }

  await reload();
};
</script>
<style scoped lang="scss">
.ichibanDetail {
  min-height: 100vh;
  position: relative;
  z-index: 9;

  background:
    radial-gradient(circle at 8% 0%, rgba(180, 51, 37, 0.06), transparent 30%),
    radial-gradient(
      circle at 92% 10%,
      rgba(229, 166, 87, 0.12),
      transparent 28%
    ),
    #fff;

  color: #241610;

  --primary: #b43325;
  --primary-dark: #3f2412;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --gold: #e4aa43;
  --gold-soft: rgba(228, 170, 67, 0.18);
  --cream: #fff8ef;
  --text: #241610;
  --text-soft: rgba(36, 22, 16, 0.58);
  --line: rgba(63, 36, 18, 0.1);
  --danger: #b42318;
}

.ichibanDetail__main {
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 34px 20px 64px;
}

/* ==============================
 * Hero
 * ============================== */
.ichibanDetail__hero {
  position: relative;
  overflow: hidden;
  padding: 26px;

  border-radius: 34px;
  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(255, 255, 255, 0.32),
      transparent 32%
    ),
    linear-gradient(135deg, #4a2617 0%, #b43325 58%, #d66b42 100%);
  box-shadow: 0 26px 70px rgba(63, 36, 18, 0.12);

  &::after {
    content: '';
    position: absolute;
    right: -110px;
    top: -130px;
    width: 330px;
    height: 330px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    pointer-events: none;
  }
}

.ichibanDetail__hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  background:
    radial-gradient(
      circle at 86% 18%,
      rgba(228, 170, 67, 0.24),
      transparent 26%
    ),
    radial-gradient(
      circle at 18% 100%,
      rgba(255, 255, 255, 0.12),
      transparent 30%
    );
}

.ichibanDetail__heroHead,
.ichibanDetail__hero-inner {
  position: relative;
  z-index: 1;
}

.ichibanDetail__heroHead {
  margin-bottom: 22px;
}

.ichibanDetail__hero-inner {
  padding: 0;
}

/* ==============================
 * Breadcrumb
 * ============================== */
.ichibanDetail__breadcrumb {
  width: fit-content;
  max-width: 100%;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(10px);

  font-size: 13px;
  font-weight: 850;

  svg {
    color: #ffe0a3;
    font-size: 12px;
  }
}

.ichibanDetail__breadcrumbSep {
  color: rgba(255, 255, 255, 0.45);
}

.ichibanDetail__breadcrumb-current {
  color: #fff;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clickable {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  color: #ffe0a3;
  font-weight: 950;

  &:hover {
    color: #fff;
  }
}

/* ==============================
 * Top Layout
 * ============================== */
.ichibanDetail__top {
  position: relative;
  z-index: 1;

  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.72fr);
  gap: 24px;
  align-items: stretch;
}

/* ==============================
 * Media / Banner / Gallery
 * ============================== */
.ichibanDetail__mediaCard,
.ichibanDetail__banner {
  overflow: hidden;
}

.ichibanDetail__mediaCard {
  padding: 14px;

  border-radius: 30px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.34);
  box-shadow: 0 18px 44px rgba(63, 36, 18, 0.16);
}

.ichibanDetail__banner {
  border-radius: 22px;
  background: var(--cream);

  img {
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    display: block;
  }
}

.ichibanDetail__gallery {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 2px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.ichibanDetail__galleryItem {
  flex: 0 0 76px;
  width: 76px;
  height: 76px;
  padding: 4px;

  border-radius: 18px;
  border: 1px solid rgba(180, 51, 37, 0.14);

  background: #fff;
  cursor: pointer;

  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  img {
    width: 100%;
    height: 100%;
    border-radius: 14px;
    object-fit: cover;
  }

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(180, 51, 37, 0.32);
  }

  &.is-active {
    border-color: var(--primary);
    box-shadow: 0 10px 22px rgba(180, 51, 37, 0.18);
  }
}

/* ==============================
 * Info Card
 * ============================== */
.ichibanDetail__info {
  min-width: 0;
  padding: 32px;

  display: flex;
  flex-direction: column;

  border-radius: 30px;
  background:
    radial-gradient(circle at 92% 8%, rgba(180, 51, 37, 0.08), transparent 34%),
    linear-gradient(180deg, #fff8ef 0%, #ffffff 66%);
  border: 1px solid rgba(255, 255, 255, 0.42);
  box-shadow: 0 18px 44px rgba(63, 36, 18, 0.16);
}

.ichibanDetail__eyebrow {
  width: fit-content;
  min-height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  margin: 0 0 12px;

  display: inline-flex;
  align-items: center;

  background: rgba(180, 51, 37, 0.1);
  color: var(--primary);

  font-size: 12px;
  font-weight: 950;
  letter-spacing: 1.6px;
}

.ichibanDetail__title {
  margin: 0;
  color: var(--text);
  font-size: 32px;
  line-height: 1.25;
  font-weight: 950;
  letter-spacing: 1px;
}

.ichibanDetail__subtitle {
  margin: 10px 0 0;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.8;
  font-weight: 800;
}

/* ==============================
 * Price
 * ============================== */
.ichibanDetail__priceBox {
  margin: 24px 0 18px;
  padding: 16px 18px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 14px 32px rgba(63, 36, 18, 0.06);
}

.ichibanDetail__priceBoxLeft {
  flex: 0 0 auto;
}

.ichibanDetail__priceBoxTag {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  gap: 7px;

  background: var(--primary-soft);
  color: var(--primary);

  font-size: 13px;
  font-weight: 950;
  letter-spacing: 1px;

  svg {
    color: var(--gold);
    font-size: 12px;
  }
}

.ichibanDetail__priceBoxRight {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 6px;
}

.ichibanDetail__priceBoxNumber {
  color: var(--primary);
  font-size: 34px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: -1px;
}

.ichibanDetail__priceBoxUnit {
  color: var(--text-soft);
  font-size: 15px;
  font-weight: 950;
}

/* ==============================
 * Meta Info Fix
 * ============================== */
.ichibanDetail__metaWrap {
  margin-top: 4px;
  color: var(--text);
}

/* 修掉 IchibanMetaInfo 裡面白字看不到 */
.ichibanDetail__metaWrap :deep(*) {
  color: inherit;
}

.ichibanDetail__metaWrap :deep([class*='label']),
.ichibanDetail__metaWrap :deep([class*='Label']),
.ichibanDetail__metaWrap :deep([class*='title']),
.ichibanDetail__metaWrap :deep([class*='Title']) {
  color: var(--text-soft) !important;
}

.ichibanDetail__metaWrap :deep([class*='value']),
.ichibanDetail__metaWrap :deep([class*='Value']),
.ichibanDetail__metaWrap :deep(span),
.ichibanDetail__metaWrap :deep(p),
.ichibanDetail__metaWrap :deep(div) {
  color: var(--text) !important;
}

/* ==============================
 * Protection / Designation
 * ============================== */
.ichibanDetail__protection,
.ichibanDetail__designation-banner {
  margin: 16px 0 0;
}

.protection-badge,
.designation-badge {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;

  border-radius: 20px;
  border: 1px solid var(--line);
}

.protection-badge {
  background: rgba(79, 70, 229, 0.08);
}

.designation-badge {
  background: rgba(228, 170, 67, 0.16);
}

.protection-icon,
.designation-icon {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 14px;

  display: grid;
  place-items: center;

  background: rgba(180, 51, 37, 0.1);
  color: var(--primary);

  font-size: 17px;
}

.protection-content,
.designation-content {
  flex: 1;
  min-width: 0;
}

.protection-title,
.designation-title {
  margin-bottom: 4px;
  color: var(--text);
  font-size: 14px;
  font-weight: 950;
}

.protection-message,
.designation-message {
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.6;
  font-weight: 800;
}

.protection-countdown {
  margin-top: 4px;
  color: var(--primary);
  font-size: 13px;
  font-weight: 950;
}

.protection-detail {
  margin-top: 4px;
  color: var(--text-soft);
  font-size: 12px;
  font-weight: 800;
}

/* ==============================
 * Gacha Count
 * ============================== */
.ichibanDetail__gachaCount {
  margin: 18px 0 0;
  padding: 18px;

  border-radius: 22px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 14px 32px rgba(63, 36, 18, 0.06);
}

.ichibanDetail__gachaCountHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.ichibanDetail__gachaCountLabel {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  color: var(--text);
  font-size: 15px;
  font-weight: 950;

  svg {
    color: var(--primary);
  }
}

.ichibanDetail__gachaCountHint {
  color: var(--text-soft);
  font-size: 13px;
  font-weight: 800;
}

.ichibanDetail__gachaCountBtns {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.ichibanDetail__gachaCountBtn {
  min-height: 52px;
  border-radius: 16px;
  border: 1px solid rgba(180, 51, 37, 0.14);

  display: grid;
  place-items: center;

  background: var(--cream);
  color: var(--text);

  font-size: 20px;
  font-weight: 950;
  cursor: pointer;

  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(180, 51, 37, 0.28);
    color: var(--primary);
  }

  &.is-active {
    border-color: var(--primary);
    background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
    color: #fff;
    box-shadow: 0 12px 24px rgba(180, 51, 37, 0.18);
  }
}

.ichibanDetail__gachaCountBtnNumber {
  font-size: 22px;
  font-weight: 950;
}

/* ==============================
 * Actions
 * ============================== */
.ichibanDetail__actions {
  display: grid;
  gap: 12px;
  margin-top: auto;
  padding-top: 22px;
}

.ichibanDetail__cta {
  min-height: 56px;
}

.ichibanDetail__ctaIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ==============================
 * Sections
 * ============================== */
.ichibanDetail__intro,
.ichibanDetail__prizes,
.ichibanDetail__status {
  margin-top: 28px;
  padding: 28px;

  border-radius: 34px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 18px 48px rgba(63, 36, 18, 0.08);
}

.ichibanDetail__intro-header,
.ichibanDetail__prizes-header,
.ichibanDetail__sectionHeader {
  margin-bottom: 18px;
}

.ichibanDetail__sectionEyebrow {
  width: fit-content;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  margin: 0 0 8px;

  display: inline-flex;
  align-items: center;

  background: var(--primary-soft);
  color: var(--primary);

  font-size: 11px;
  font-weight: 950;
  letter-spacing: 1.4px;
}

.ichibanDetail__intro-title,
.ichibanDetail__prizes-title,
.ichibanDetail__status-title,
.ichibanDetail__sectionTitle {
  margin: 0;

  display: inline-flex;
  align-items: center;
  gap: 10px;

  color: var(--text);
  font-size: 26px;
  line-height: 1.3;
  font-weight: 950;
  letter-spacing: 1px;

  svg {
    color: var(--primary);
    font-size: 18px;
  }
}

.ichibanDetail__intro-body,
.ichibanDetail__introBody {
  padding: 20px;
  border-radius: 24px;
  background: var(--cream);
  border: 1px solid var(--line);
}

.ichibanDetail__intro-content,
.ichibanDetail__introContent {
  color: var(--text);
  font-size: 15px;
  line-height: 1.85;
  font-weight: 700;

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 18px;
  }

  :deep(p) {
    margin: 0 0 12px;
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }
}

.ichibanDetail__prizes-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

/* ==============================
 * Grand Prize Banner
 * ============================== */
.ichibanDetail__grandPrizeBanner {
  margin: 18px 0;
  padding: 18px;

  border-radius: 24px;
  background: linear-gradient(135deg, #fff8e7 0%, #fff3cd 100%);
  border: 1px solid rgba(228, 170, 67, 0.34);
  box-shadow: 0 14px 32px rgba(180, 83, 9, 0.08);
}

.grand-prize-announcement {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.grand-prize-icon {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 16px;

  display: grid;
  place-items: center;

  background: rgba(228, 170, 67, 0.22);
  color: #92400e;
  font-size: 22px;
}

.grand-prize-content {
  flex: 1;
  min-width: 0;
}

.grand-prize-title {
  margin-bottom: 8px;
  color: #92400e;
  font-size: 16px;
  font-weight: 950;
}

.grand-prize-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  color: var(--text);
  font-size: 14px;
  line-height: 1.6;
  font-weight: 850;
}

.grand-prize-numbers {
  color: var(--primary);
}

.grand-prize-arrow {
  color: rgba(36, 22, 16, 0.4);
}

.grand-prize-hint {
  margin-top: 8px;
  color: rgba(36, 22, 16, 0.62);
  font-size: 13px;
  font-weight: 800;
}

/* ==============================
 * Status
 * ============================== */
.ichibanDetail__status {
  scroll-margin-top: 24px;
}

.ichibanDetail__status-title {
  margin-bottom: 18px;
}

/* ==============================
 * RWD
 * ============================== */
@media (max-width: 1100px) {
  .ichibanDetail__top {
    grid-template-columns: 1fr;
  }

  .ichibanDetail__prizes-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .ichibanDetail__main {
    padding: 22px 16px 48px;
  }

  .ichibanDetail__hero {
    padding: 20px;
    border-radius: 30px;
  }

  .ichibanDetail__info {
    padding: 24px;
    border-radius: 26px;
  }

  .ichibanDetail__title {
    font-size: 26px;
  }

  .ichibanDetail__priceBox {
    align-items: flex-start;
    flex-direction: column;
    border-radius: 24px;
  }

  .ichibanDetail__priceBoxRight {
    width: 100%;
    justify-content: flex-start;
  }

  .ichibanDetail__intro,
  .ichibanDetail__prizes,
  .ichibanDetail__status {
    padding: 22px;
    border-radius: 28px;
  }

  .ichibanDetail__prizes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}

@media (max-width: 560px) {
  .ichibanDetail {
    background:
      radial-gradient(
        circle at 8% 0%,
        rgba(180, 51, 37, 0.06),
        transparent 34%
      ),
      #fff;
  }

  .ichibanDetail__main {
    width: 100%;
    padding: 0 0 38px;
  }

  .ichibanDetail__hero {
    padding: 18px 14px 20px;
    border-radius: 0 0 28px 28px;
    box-shadow: 0 14px 28px rgba(63, 36, 18, 0.12);
  }

  .ichibanDetail__breadcrumb {
    width: 100%;
    min-height: auto;
    padding: 10px 12px;
    border-radius: 18px;
    font-size: 12px;
    flex-wrap: wrap;
  }

  .ichibanDetail__breadcrumb-current {
    max-width: 100%;
    white-space: normal;
  }

  .ichibanDetail__top {
    gap: 16px;
  }

  .ichibanDetail__mediaCard {
    padding: 10px;
    border-radius: 24px;
  }

  .ichibanDetail__banner {
    border-radius: 18px;
  }

  .ichibanDetail__galleryItem {
    flex-basis: 64px;
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }

  .ichibanDetail__info {
    padding: 20px 16px;
    border-radius: 24px;
  }

  .ichibanDetail__title {
    font-size: 24px;
  }

  .ichibanDetail__subtitle {
    font-size: 14px;
  }

  .ichibanDetail__priceBoxNumber {
    font-size: 32px;
  }

  .designation-badge,
  .protection-badge {
    align-items: flex-start;
    flex-direction: column;
  }

  .ichibanDetail__gachaCountBtns {
    gap: 8px;
  }

  .ichibanDetail__gachaCountBtn {
    min-height: 48px;
    border-radius: 16px;
  }

  .ichibanDetail__intro,
  .ichibanDetail__prizes,
  .ichibanDetail__status {
    margin: 18px 14px 0;
    padding: 18px 14px;
    border-radius: 24px;
  }

  .ichibanDetail__intro-title,
  .ichibanDetail__prizes-title,
  .ichibanDetail__status-title,
  .ichibanDetail__sectionTitle {
    font-size: 22px;

    svg {
      font-size: 16px;
    }
  }

  .ichibanDetail__intro-body,
  .ichibanDetail__introBody {
    padding: 16px;
    border-radius: 20px;
  }

  .ichibanDetail__prizes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .grand-prize-announcement {
    flex-direction: column;
  }
}

@media (max-width: 380px) {
  .ichibanDetail__title {
    font-size: 22px;
  }

  .ichibanDetail__gachaCountBtns {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ichibanDetail__prizes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
