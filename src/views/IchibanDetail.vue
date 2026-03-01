<!-- src/views/IchibanDetail.vue -->
<template>
  <div class="ichibanDetail">
    <main class="ichibanDetail__main">
      <!-- 賞品一覽 -->
      <section class="ichibanDetail__hero">
        <div class="ichibanDetail__hero-bg" aria-hidden="true" />

        <div class="ichibanDetail__hero-inner">
          <!-- 麵包屑 -->
          <nav class="ichibanDetail__breadcrumb">
            <span class="clickable" @click="goHome">首頁</span>
            <span> / </span>
            <span>{{ breadcrumbCategory }}</span>
            <span> / </span>
            <span class="ichibanDetail__breadcrumb-current">
              {{ kujiTitle }}
            </span>
          </nav>

          <div class="ichibanDetail__top">
            <div class="ichibanDetail__banner">
              <img :src="bannerSrc" alt="Ichiban Banner" />

              <div v-if="galleryThumbs.length" class="ichibanDetail__gallery">
                <button
                  v-for="(img, idx) in galleryThumbs"
                  :key="img + idx"
                  type="button"
                  class="ichibanDetail__galleryItem"
                  :class="{ 'is-active': idx === activeGalleryIndex }"
                  @click="activeGalleryIndex = idx"
                >
                  <img :src="img" alt="Gallery" />
                </button>
              </div>
            </div>

            <!-- Info -->
            <aside class="ichibanDetail__info">
              <template v-if="loading">
                <h1 class="ichibanDetail__title">載入中...</h1>
                <p class="ichibanDetail__subtitle">請稍候</p>
              </template>

              <template v-else-if="errorMsg">
                <h1 class="ichibanDetail__title">載入失敗</h1>
                <p class="ichibanDetail__subtitle">{{ errorMsg }}</p>
                <div class="ichibanDetail__actions">
                  <KujiButton variant="secondary" block @click="reload">
                    重新載入
                  </KujiButton>
                </div>
              </template>

              <template v-else>
                <h1 class="ichibanDetail__title">{{ kujiTitle }}</h1>
                <p class="ichibanDetail__subtitle">{{ kujiSubTitle }}</p>

                <div class="ichibanDetail__priceBox">
                  <div class="ichibanDetail__priceBoxLeft">
                    <span class="ichibanDetail__priceBoxTag">特價</span>
                  </div>

                  <div class="ichibanDetail__priceBoxRight">
                    <span class="ichibanDetail__priceBoxNumber">
                      <NumberFormatter :number="displayPrice" locale="zh-TW" />
                    </span>
                    <span class="ichibanDetail__priceBoxUnit">元</span>
                  </div>
                </div>

                <IchibanMetaInfo
                  :detail="detail"
                  :play-mode-text="playModeText"
                  :period-text="periodText"
                  :tags="tags"
                />

                <div v-if="protectionInfo" class="ichibanDetail__protection">
                  <div class="protection-badge">
                    <span class="protection-icon" aria-hidden="true">
                      <font-awesome-icon :icon="['fas', 'shield-halved']" />
                    </span>

                    <div class="protection-content">
                      <div class="protection-title">開套者保護期</div>
                      <div class="protection-message">
                        {{ protectionInfo.message }}
                      </div>
                      <div
                        class="protection-detail"
                        v-if="protectionInfo.endTime"
                      >
                        有效期限：{{ protectionInfo.endTime }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 扭蛋次數選擇（1-10），僅 GACHA 模式顯示 -->
                <div v-if="isGacha" class="ichibanDetail__gachaCount">
                  <span class="ichibanDetail__gachaCountLabel">次數：</span>
                  <div class="ichibanDetail__gachaCountBtns">
                    <button
                      v-for="n in [1, 2, 3, 5, 10]"
                      :key="n"
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
                    {{ primaryCtaText }}
                  </KujiButton>

                  <KujiButton
                    class="ichibanDetail__cta ichibanDetail__cta--secondary"
                    variant="secondary"
                    block
                    @click="handleViewStatus"
                  >
                    <template #icon>
                      <span class="ichibanDetail__ctaIcon">
                        <font-awesome-icon :icon="['fas', 'square-check']" />
                      </span>
                    </template>
                    檢視抽況
                  </KujiButton>
                </div>
              </template>
            </aside>
          </div>
        </div>
      </section>
      <!-- 賞品介紹 -->
      <section class="ichibanDetail__intro" v-if="detail?.content">
        <header class="ichibanDetail__intro-header">
          <h2 class="ichibanDetail__intro-title">賞品介紹</h2>
        </header>

        <div class="ichibanDetail__intro-body">
          <div class="ichibanDetail__intro-content" v-html="detail.content" />
        </div>
      </section>

      <section class="ichibanDetail__prizes">
        <header class="ichibanDetail__prizes-header">
          <h2 class="ichibanDetail__prizes-title">賞品一覽</h2>
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

      <!-- 抽況 / 格數選擇 -->
      <section
        class="ichibanDetail__status"
        ref="statusSectionRef"
        v-if="!isGacha"
      >
        <h2 class="ichibanDetail__status-title">
          {{ isScratchMode ? '選擇格數' : '檢視抽況' }}
        </h2>

        <!-- ✅ 刮刮樂大獎提示（顯示中獎號碼） -->
        <div
          v-if="isScratchMode && designatedWinningNumbers.length"
          class="ichibanDetail__grandPrizeBanner"
        >
          <div class="grand-prize-announcement">
            <div class="grand-prize-icon" aria-hidden="true">🏆</div>
            <div class="grand-prize-content">
              <div class="grand-prize-title">中獎號碼公告</div>
              <div v-for="(group, idx) in grandPrizeDisplay" :key="idx" class="grand-prize-item">
                <strong class="grand-prize-numbers">{{ group.numbers.join('、') }}</strong>
                <span class="grand-prize-arrow">→</span>
                <span class="grand-prize-name">{{ group.prizeName }}</span>
              </div>
              <div class="grand-prize-hint">
                刮中以上號碼即可獲得對應大獎！
              </div>
            </div>
          </div>
        </div>

        <ScratchRemainingCounter
          v-if="isScratchMode"
          :remaining-prizes="detail?.remainingPrizes ?? null"
          :total-prizes="detail?.totalPrizes ?? null"
          :tickets="statusCards"
          :protection-info="protectionInfo"
          :protection-end-time="session?.protectionEndTime ?? null"
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
      :remaining="detail?.remainingPrizes"
      :active-cards="activeCards"
      :active-card-numbers="activeCardNumbers"
      @close="closeDrawPanel"
      @randomSelect="handleRandomSelect"
      @exchange="handleExchange"
    />

    <!-- 刮刮樂確認面板 -->
    <IchibanScratchPanel
      :is-open="isScratchPanelOpen"
      :ticket-numbers="activeCardNumbers"
      :ticket-ids="activeCards"
      :remaining="scratchRemainingCount"
      :price-per-draw="displayPrice"
      @close="closeScratchPanel"
      @scratch="handleScratchFromPanel"
    />

    <!-- 🎯 大獎指定對話框 -->
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
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
} from '@/services/lotteryDrawService';
import { randomDrawLottery } from '@/services/lotteryRandomService';
import { executeApi } from '@/utils/executeApiUtils';
import { useOverlayStore } from '@/stores/overlay';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { gachaTearDialog } from '@/utils/dialog/kujiRevealStripDialog';
import { ichibanResultDialog } from '@/utils/dialog/ichibanResultDialog';
import { scratchCardDialog } from '@/utils/dialog/scratchCardDialog';
import { ichibanResultCardDialog } from '@/utils/dialog/ichibanResultCardDialog';
import { gotchaDialog } from '@/utils/dialog/gotchaDialog';
import { getLotterySession } from '@/services/lotteryDrawService';

const overlay = useOverlayStore();

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
  ticketNumber: number;
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

/** 真正的扭蛋（加權隨機）：category=GACHA 且沒有籤位制 playMode */
const isGacha = computed(() => {
  const category = String(detail.value?.category ?? '').toUpperCase();
  const m = String(detail.value?.playMode ?? '').toUpperCase();
  // 有籤位制 playMode 就不算扭蛋（走 draw 路由）
  const isTicketBased =
    m === 'LOTTERY_MODE' || m === 'SCRATCH_MODE' || m === 'SCRATCH_CARD_MODE';
  return category === 'GACHA' && !isTicketBased;
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

/* -----------------------------
 * 保護期提示
 * ----------------------------- */
const isInProtection = computed(() => {
  const s = session.value;
  if (!s) return false;
  const protectionDraws = s.protectionDraws ?? 0;
  const openerDrawCount = s.openerDrawCount ?? 0;
  // 不限制 isOpener：小套者 / 非小套者都應看到保護期營出
  return protectionDraws > 0 && openerDrawCount < protectionDraws;
});

const protectionInfo = computed(() => {
  if (!isInProtection.value) return null;

  const protectionDraws = session.value?.protectionDraws ?? 0;
  const openerDrawCount = session.value?.openerDrawCount ?? 0;
  const remainingDraws = protectionDraws - openerDrawCount;
  const endTime = session.value?.protectionEndTime;

  if (!isOpener.value) {
    return {
      remainingDraws,
      totalDraws: protectionDraws,
      endTime: endTime ? formatDate(endTime) : '',
      message: '等待開套玩家完成保護抽，暫時無法抽取',
    };
  }

  return {
    remainingDraws,
    totalDraws: protectionDraws,
    endTime: endTime ? formatDate(endTime) : '',
    message: `保護期內：還剩 ${remainingDraws} 次專屬抽獎機會`,
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

  const opts = Array.isArray(d.multiDrawOptions) ? d.multiDrawOptions : [];
  const chosen = opts.length ? opts[0] : null;

  if (d.allowMultiDraw && chosen) {
    arr.push({ label: `${chosen}連`, amount: per * chosen, unit: '元' });
  }

  return arr;
});

/* -----------------------------
 * Prizes（排序：LAST 最後、等級、prizeNumber）
 * ----------------------------- */
const prizes = computed(() => {
  const arr = Array.isArray(prizesData.value) ? prizesData.value : [];

  const levelOrder: Record<string, number> = {
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
      gradeLabel,
      gradeType,
      countText,
      sizeText: p?.sizeText ? String(p.sizeText) : '-',
      name: String(p?.name ?? '未命名賞品'),
      imgSrc: String(p?.imageUrl ?? '') || demo1,

      _lvlOrder: levelOrder[level] ?? 50,
      _num: Number(p?.prizeNumber ?? 9999) || 9999,
      _isLast: !!p?.isLastPrize || level === 'LAST',
    };
  });

  mapped.sort((a: any, b: any) => {
    if (a._isLast !== b._isLast) return a._isLast ? 1 : -1;
    if (a._lvlOrder !== b._lvlOrder) return a._lvlOrder - b._lvlOrder;
    return a._num - b._num;
  });

  return mapped.map(({ _lvlOrder, _num, _isLast, ...rest }: any) => rest);
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

const activeCardNumbers = computed<number[]>(() => {
  return activeCards.value
    .map((id) => ticketNoById.value[id])
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
  if (!isScratchMode.value || !designatedWinningNumbers.value.length) return null;
  
  // 按 prizeId 分組
  const grouped = designatedWinningNumbers.value.reduce((acc, item) => {
    if (!acc[item.prizeId]) {
      acc[item.prizeId] = {
        prizeName: item.prizeName,
        prizeLevel: item.prizeLevel,
        numbers: [],
      };
    }
    acc[item.prizeId].numbers.push(item.revealedNumber);
    return acc;
  }, {} as Record<string, { prizeName: string; prizeLevel: string; numbers: number[] }>);

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
    await handleScratchCardSelect(ticketId);
  } else {
    await openDrawPanelFromCard(ticketId);
  }
};

/**
 * 刮刮樂格子點擊：支援多選，每次 toggle 該格，面板跟著顯示/隱藏
 */
const handleScratchCardSelect = async (ticketId: string) => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  if (!availableTicketIds.value.includes(ticketId)) return;

  const idx = activeCards.value.indexOf(ticketId);
  if (idx >= 0) {
    activeCards.value.splice(idx, 1);
  } else {
    activeCards.value.push(ticketId);
  }

  // 有選格子就展開面板；全部取消就關閉
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
  if (!canDraw.value) {
    try {
      overlay.open('ichiban-info', false);
      await ichibanInfoDialog({
        title: '提示訊息',
        content: cannotDrawReason.value,
      });
      goLogin();
    } finally {
      overlay.close();
    }
    return false;
  }
  return true;
};

/**
 * 檢查唔單彈窗（免單彈窗）
 */
const showFreeDrawModal = async (results: any[]) => {
  for (const result of results) {
    if (result.triggeredFreeDraw && Number(result.refundAmount ?? 0) > 0) {
      await ichibanInfoDialog({
        title: '恰喜！開套免單',
        content: `已退還 ${result.refundAmount} 元至你的帳戶`,
      });
    }
  }
};

/**
 * 執行刮刮樂
 * @param ticketIdOverride 外部傳入的 ticket UUID；省略時從 activeCards[0] 取
 */
const handleScratch = async (ticketIdOverride?: string) => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  // 確認有選到格子（UUID）
  const selectedTicketId = ticketIdOverride ?? activeCards.value[0];
  if (!selectedTicketId) {
    statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  await refreshSession(); // 🔥 先更新 session

  const tryDraw = async () => {
    return await drawLottery(kujiId.value, {
      count: 1,
      ticket: [selectedTicketId], // ✅ 送 UUID，不是 ticketNumber
    });
  };

  await executeApi({
    fn: tryDraw,

    onSuccess: async (data: any) => {
      // Step 1: designationRequired 攔截（SCRATCH_PLAYER 尚未指定大獎）
      if (data?.designationRequired) {
        await handleDesignatePrize(
          data.availableNumbers || [],
          data.grandPrizes || [],
        );
        return;
      }

      // Step 2: 解析 DrawBatchResponse（v4.0：data.results，不再是裸陣列）
      const drawResults: DrawResult[] = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];
      if (!drawResults.length) return;

      // ✅ 新增：處理 protectionEndTime（首次抽獎時會返回）
      if (data?.protectionEndTime && session.value) {
        session.value.protectionEndTime = data.protectionEndTime;
      }

      // Step 3: 檢查後端回傳的失敗結果
      const result = drawResults[0];
      if (result?.success === false) {
        await ichibanInfoDialog({
          title: '刮刮樂失敗',
          content: result.message || '請稍後再試',
        });
        return;
      }

      overlay.open();
      // 清除選取狀態
      activeCards.value = [];

      try {
        // 刮刮樂動畫（包含 revealedNumber 大字展示）
        await scratchCardDialog({
          title: 'STARDO・刮刮樂',
          imageSrc: result?.prizeImageUrl,
          idleText: '刮開看看，抽到什麼賞？',
          revealText: result?.prizeName ?? '銘謝惠顧',
          threshold: 45,
          grade: result?.prizeLevel,
          revealedNumber: result?.revealedNumber ?? null,
        });

        // 無論有無刮完動畫，都顯示抽獎結果
        await ichibanResultDialog({
          remain: Math.max(0, Number(detail.value?.remainingPrizes ?? 0) - 1),
          count: 1,
          totalPrice: displayPrice.value,
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
        title: '刮刮樂失敗',
        content: '請稍後再試',
      });
    },
  });
};

const handleDraw = async () => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
  isDrawPanelOpen.value = true;
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
      if (data?.protectionEndTime && session.value) {
        session.value.protectionEndTime = data.protectionEndTime;
      }

      // 檢查後端回傳的失敗結果
      if (drawResults.length > 0 && drawResults[0]?.success === false) {
        await ichibanInfoDialog({
          title: '扭蛋失敗',
          content: drawResults[0].message || '請稍後再試',
        });
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
        const unitPrice = Number(displayPrice.value ?? 0) || 0;
        const totalPrice = unitPrice * drawnCount;

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

  overlay.open();

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
    const designateResult = await designatePrizePositions(kujiId.value, {
      designations,
    });

    // ✅ 更新 designatedWinningNumbers（從回應中取得）
    if (designateResult?.designatedWinningNumbers) {
      designatedWinningNumbers.value = designateResult.designatedWinningNumbers;
    }

    await ichibanInfoDialog({
      title: '大獎位置已設定',
      content: `已成功指定 ${designations.length} 個大獎位置，開始抽獎吧！`,
    });

    await refreshSession(); // 🔥 指定後刷新

    // 🔥 再抽一次
    await handleScratch();
  } finally {
    overlay.close();
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

const handleScratchFromPanel = async (payload: { ticketIds: string[] }) => {
  closeScratchPanel();
  // 依序刮每張票（每張都有刮刮樂動畫）
  for (const ticketId of payload.ticketIds) {
    await handleScratch(ticketId);
  }
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
          ticket: safeTickets,
        }),
      onSuccess: async (data: any) => {
        // v4.0: DrawBatchResponse.results
        const drawResults: DrawResult[] = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data) ? data : [];

        // ✅ 新增：處理 protectionEndTime
        if (data?.protectionEndTime && session.value) {
          session.value.protectionEndTime = data.protectionEndTime;
        }

        if (drawResults.length > 0 && drawResults[0]?.success === false) {
          await ichibanInfoDialog({
            title: '抽獎失敗',
            content: drawResults[0].message || '請稍後再試',
          });
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
          ticket: safeTickets,
        }),
      onSuccess: async (data: any) => {
        // v4.0: DrawBatchResponse.results
        const drawResults: DrawResult[] = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data) ? data : [];

        // ✅ 新增：處理 protectionEndTime
        if (data?.protectionEndTime && session.value) {
          session.value.protectionEndTime = data.protectionEndTime;
        }

        if (drawResults.length > 0 && drawResults[0]?.success === false) {
          await ichibanInfoDialog({
            title: '抽獎失敗',
            content: drawResults[0].message || '請稍後再試',
          });
          return;
        }

        closeDrawPanel();
        overlay.open();

        try {
          const tearResult = await gachaTearDialog({ pulls: drawResults });
          if (!tearResult) return;

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

          await ichibanResultDialog({
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
      session.value = data;
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
        detail.value = data?.lottery ?? null;
        prizesData.value = Array.isArray(data?.prizes) ? data.prizes : [];
        ticketData.value = Array.isArray(data?.tickets) ? data.tickets : [];
        
        // ✅ 新增：取得 designatedWinningNumbers（刮刮樂大獎中獎號碼）
        designatedWinningNumbers.value = Array.isArray(data?.designatedWinningNumbers)
          ? data.designatedWinningNumbers
          : [];
      },
      onFail: async () => {
        errorMsg.value = '載入失敗，請稍後再試';
      },
    });

    await refreshSession(); // 🔥 不再用 data.session
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

onMounted(async () => {});

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
</script>

<style scoped lang="scss">
/* 保護期提示樣式 */
.ichibanDetail__protection {
  margin: 16px 0;
}

.protection-badge {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.protection-icon {
  font-size: 24px;
  line-height: 1;
}

.protection-content {
  flex: 1;
  color: #fff;
}

.protection-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
  opacity: 0.95;
}

.protection-message {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.protection-detail {
  font-size: 12px;
  opacity: 0.85;
}

/* 扭蛋次數選擇器 */
.ichibanDetail__gachaCount {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.ichibanDetail__gachaCountLabel {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.ichibanDetail__gachaCountBtns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ichibanDetail__gachaCountBtn {
  min-width: 40px;
  height: 36px;
  padding: 0 10px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  color: #333;

  &:hover {
    border-color: var(--color-primary, #e75480);
    color: var(--color-primary, #e75480);
  }

  &.is-active {
    border-color: var(--color-primary, #e75480);
    background: var(--color-primary, #e75480);
    color: #fff;
  }
}

/* ✅ 刮刮樂大獎提示（中獎號碼公告） */
.ichibanDetail__grandPrizeBanner {
  padding: 14px 18px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #fff8e7 0%, #fff3cd 100%);
  border: 2px solid #f5c518;
  border-radius: 12px;
}

.grand-prize-announcement {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.grand-prize-icon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}

.grand-prize-content {
  flex: 1;
}

.grand-prize-title {
  font-size: 16px;
  font-weight: 700;
  color: #b8860b;
  margin-bottom: 8px;
}

.grand-prize-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 14px;
  color: #6b4c00;

  &:last-of-type {
    margin-bottom: 8px;
  }
}

.grand-prize-numbers {
  font-weight: 700;
  color: #d4880f;
  font-size: 16px;
}

.grand-prize-arrow {
  color: #b8860b;
  font-weight: 600;
}

.grand-prize-name {
  font-weight: 600;
  color: #6b4c00;
}

.grand-prize-hint {
  font-size: 12px;
  color: #8b6914;
  font-style: italic;
  margin-top: 4px;
}
</style>
