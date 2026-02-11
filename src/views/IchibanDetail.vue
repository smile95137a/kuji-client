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

      <!-- 抽況 -->
      <section
        class="ichibanDetail__status"
        ref="statusSectionRef"
        v-if="!isGacha"
      >
        <h2 class="ichibanDetail__status-title">檢視抽況</h2>

        <RemainingCounter
          :remaining-prizes="detail?.remainingPrizes ?? null"
          :total-prizes="detail?.totalPrizes ?? null"
          :tickets="statusCards"
        />

        <!-- ⚠️ 這裡 @select 請改成 emit ticketId(UUID) -->
        <IchibanStatusGrid
          :cards="statusCards"
          :active-cards="activeCards"
          @select="openDrawPanelFromCard"
        />
      </section>

      <IchibanNoticeSection />
    </main>

    <IchibanDrawPanel
      :is-open="isDrawPanelOpen"
      :remaining="detail?.remainingPrizes"
      :active-cards="activeCards"
      :active-card-numbers="activeCardNumbers"
      @close="closeDrawPanel"
      @randomSelect="handleRandomSelect"
      @exchange="handleExchange"
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
import RemainingCounter from '@/components/IchibanDetail/RemainingCounter.vue';
import IchibanMetaInfo from '@/components/IchibanDetail/IchibanMetaInfo.vue';

import demo1 from '@/assets/image/demo1.jpg';

import {
  getBrowseLotteryById,
  incrementLotteryHotCount,
} from '@/services/lotteryBrowseService';
import {
  designatePrizePositions,
  drawLottery,
} from '@/services/lotteryDrawService';
import { executeApi } from '@/utils/executeApiUtils';
import { useOverlayStore } from '@/stores/overlay';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { gachaTearDialog } from '@/utils/dialog/kujiRevealStripDialog';
import { ichibanResultDialog } from '@/utils/dialog/ichibanResultDialog';
import { scratchCardDialog } from '@/utils/dialog/scratchCardDialog';
import { ichibanResultCardDialog } from '@/utils/dialog/ichibanResultCardDialog';
import { gotchaDialog } from '@/utils/dialog/gotchaDialog';

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

const isScratchMode = computed(() => {
  const m = String(detail.value?.playMode ?? '').toUpperCase();
  return m === 'SCRATCH_MODE';
});

/** ✅ is 扭蛋 */
const isGacha = computed(() => {
  // 兼容多種後端命名（你可以保留你實際會出現的那幾個）
  const playMode = String(detail.value?.playMode ?? '').toUpperCase();
  const category = String(detail.value?.category ?? '').toUpperCase();
  const type = String(detail.value?.type ?? '').toUpperCase();

  return (
    playMode === 'GACHA_MODE' ||
    playMode === 'GASHAPON_MODE' ||
    category === 'GACHA' ||
    category === 'GASHAPON' ||
    type === 'GACHA' ||
    type === 'GASHAPON'
  );
});

const primaryCtaText = computed(() => {
  if (isScratchMode.value) return '開刮！';
  if (isGacha.value) return '扭一顆！';
  return '開抽！';
});

const playModeText = computed(() => {
  const m = String(detail.value?.playMode ?? '').toUpperCase();
  if (m === 'SCRATCH_MODE') return '刮刮樂';
  if (m === 'LOTTERY_MODE') return '抽籤';
  if (m === 'GACHA_MODE' || m === 'GASHAPON_MODE') return '扭蛋';
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

const toggleCardSelection = (ticketId: string) => {
  if (!availableTicketIds.value.includes(ticketId)) return;

  const idx = activeCards.value.indexOf(ticketId);
  if (idx >= 0) activeCards.value.splice(idx, 1);
  else activeCards.value.push(ticketId);
};

const closeDrawPanel = () => {
  isDrawPanelOpen.value = false;
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

const handleScratch = async () => {
  const ok = await ensureCanDraw();
  if (!ok) return;

  const count = 1;

  await executeApi({
    fn: () =>
      drawLottery(kujiId.value, {
        count,
        ticket: [],
      }),
    onSuccess: async (data: any) => {
      overlay.open();

      try {
        const ok = await scratchCardDialog({
          title: 'STARDO・刮刮樂（單抽）',
          imageSrc: data[0].prizeImageUrl,
          idleText: '刮開看看，抽到什麼賞？',
          revealText: data[0].prizeName,
          threshold: 45,
          grade: data[0].prizeLevel,
        });

        if (!ok) return;

        const drawnCount = Array.isArray(data) ? data.length : 0;
        const unitPrice = Number(displayPrice.value ?? 0) || 0;
        const totalPrice = unitPrice * drawnCount;

        const beforeRemain = Math.max(
          0,
          Number(detail.value?.remainingPrizes ?? 0) || 0,
        );
        const remain = Math.max(0, beforeRemain - drawnCount);

        await ichibanResultDialog({
          remain,
          count: drawnCount,
          totalPrice,
          items: data,
        });
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

  const count = 1;

  await executeApi({
    fn: () =>
      drawLottery(kujiId.value, {
        count,
        ticket: [], // 扭蛋不需要指定票券
      }),
    onSuccess: async (data: any) => {
      overlay.open();

      try {
        // 撕開（扭蛋/抽獎都可共用）
        const results = await gotchaDialog({
          title: '扭蛋機抽獎中',
          pulls: data,
          speed: 0.6,
        });

        if (!results) return;

        const drawnCount = Array.isArray(data) ? data.length : 0;
        const unitPrice = Number(displayPrice.value ?? 0) || 0;
        const totalPrice = unitPrice * drawnCount;

        const beforeRemain = Math.max(
          0,
          Number(detail.value?.remainingPrizes ?? 0) || 0,
        );
        const remain = Math.max(0, beforeRemain - drawnCount);

        await ichibanResultDialog({
          remain,
          count: drawnCount,
          totalPrice,
          items: data,
        });
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

const handlePrimaryAction = async () => {
  if (isScratchMode.value) {
    await handleScratch();
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
        closeDrawPanel();
        overlay.open();

        try {
          const drawnCount = Array.isArray(data) ? data.length : 0;
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
            count: data.length,
            totalPrice,
            items: data,
          });
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
  } else {
    await executeApi({
      fn: () =>
        drawLottery(kujiId.value, {
          count: safeCount,
          ticket: safeTickets,
        }),
      onSuccess: async (data: any) => {
        closeDrawPanel();
        overlay.open();

        try {
          const tearResult = await gachaTearDialog({ pulls: data });
          if (!tearResult) return;

          const drawnCount = Array.isArray(data) ? data.length : 0;
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
            items: data,
          });
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
        session.value = data?.session ?? null;
      },
      onFail: async () => {
        errorMsg.value = '載入失敗，請稍後再試';
      },
    });
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
