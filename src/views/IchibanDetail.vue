<!-- src/views/IchibanDetail.vue -->
<template>
  <div class="ichibanDetail">
    <!-- 上方 Banner + 資訊區 -->
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
          <!-- Banner -->
          <div class="ichibanDetail__banner">
            <img :src="bannerSrc" alt="Ichiban Banner" />
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

              <!-- 價格區 -->
              <div class="ichibanDetail__prices">
                <div
                  v-for="p in prices"
                  :key="p.label"
                  class="ichibanDetail__priceItem"
                >
                  <div class="ichibanDetail__priceLabel">{{ p.label }}</div>
                  <div class="ichibanDetail__priceValue">
                    <span class="ichibanDetail__priceNumber">
                      {{ p.amount.toLocaleString('zh-TW') }}
                    </span>
                    <span class="ichibanDetail__priceUnit">
                      / {{ p.unit }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 補充資訊 -->
              <div class="ichibanDetail__meta">
                <div class="ichibanDetail__metaRow">
                  <span class="ichibanDetail__metaKey">店家</span>
                  <span class="ichibanDetail__metaVal">{{
                    lotteryData?.storeName || '-'
                  }}</span>
                </div>
                <div class="ichibanDetail__metaRow">
                  <span class="ichibanDetail__metaKey">類型</span>
                  <span class="ichibanDetail__metaVal">{{
                    lotteryData?.categoryName || categoryTypeLabel || '-'
                  }}</span>
                </div>
                <div class="ichibanDetail__metaRow">
                  <span class="ichibanDetail__metaKey">總抽數</span>
                  <span class="ichibanDetail__metaVal">
                    {{ totalDraws }} 抽
                  </span>
                </div>
                <div class="ichibanDetail__metaRow">
                  <span class="ichibanDetail__metaKey">剩餘</span>
                  <span class="ichibanDetail__metaVal" style="color: #ff6b6b; font-weight: 700;">
                    {{ remainingQuantity }} / {{ totalDraws }} 抽
                  </span>
                </div>
                <div class="ichibanDetail__metaRow">
                  <span class="ichibanDetail__metaKey">每抽價格</span>
                  <span class="ichibanDetail__metaVal" style="color: #ffa726; font-weight: 700;">
                    NT$ {{ currentPricePerDraw.toLocaleString() }}
                  </span>
                </div>
                <div class="ichibanDetail__metaRow" v-if="lotteryData?.allowMultiDraw">
                  <span class="ichibanDetail__metaKey">10連抽</span>
                  <span class="ichibanDetail__metaVal" style="color: #ffa726; font-weight: 700;">
                    NT$ {{ (currentPricePerDraw * 10).toLocaleString() }}
                  </span>
                </div>
                <div class="ichibanDetail__metaRow">
                  <span class="ichibanDetail__metaKey">上架時間</span>
                  <span class="ichibanDetail__metaVal">{{ createdAtText }}</span>
                </div>
                <div class="ichibanDetail__metaRow" v-if="periodText !== '-'">
                  <span class="ichibanDetail__metaKey">活動期間</span>
                  <span class="ichibanDetail__metaVal">{{ periodText }}</span>
                </div>
                <div class="ichibanDetail__metaRow">
                  <span class="ichibanDetail__metaKey">狀態</span>
                  <span class="ichibanDetail__metaVal">{{
                    statusDisplayText
                  }}</span>
                </div>
              </div>

              <!-- 按鈕 -->
              <div class="ichibanDetail__actions">
                <KujiButton variant="primary" block @click="handleDraw">
                  開抽！
                </KujiButton>

                <KujiButton variant="secondary" block @click="handleViewStatus">
                  <template #icon>
                    <font-awesome-icon :icon="['fas', 'square-check']" />
                  </template>
                  檢視抽況
                </KujiButton>
              </div>
            </template>
          </aside>
        </div>
      </div>
    </section>

    <!-- 主內容 -->
    <main class="ichibanDetail__main">
      <!-- 賞品一覽（目前你沒給 prize API，這段先保留 demo，之後接 API 我再幫你換） -->
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
      <section class="ichibanDetail__status" ref="statusSectionRef">
        <h2 class="ichibanDetail__status-title">檢視抽況</h2>

        <p class="ichibanDetail__status-summary">
          剩餘抽數：
          {{ remainingQuantity.toLocaleString('zh-TW') }} 抽
        </p>

        <IchibanStatusGrid
          :cards="statusCards"
          :active-cards="activeCards"
          :card-img="ichibanCardBack"
          @select="openDrawPanelFromCard"
        />
      </section>

      <IchibanNoticeSection />
    </main>

    <!-- 抽選面板 -->
    <IchibanDrawPanel
      :is-open="isDrawPanelOpen"
      :remaining="remainingQuantity"
      :active-cards="activeCards"
      :price-per-draw="currentPricePerDraw"
      :multi-draw-price="multiDrawPrice"
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

import IchibanPrizeCard from '@/components/ichiban/IchibanPrizeCard.vue';
import IchibanNoticeSection from '@/components/ichiban/IchibanNoticeSection.vue';
import IchibanStatusGrid from '@/components/ichiban/IchibanStatusGrid.vue';
import IchibanDrawPanel from '@/components/ichiban/IchibanDrawPanel.vue';

import demo1 from '@/assets/image/demo1.jpg';
import ichibanCardBack from '@/assets/image/ichibanCardBack.png';
import { getBrowseLotteryDetail, /* ... */ incrementHotCount } from '@/services/lotteryBrowseService';
import { getTickets, drawLottery } from '@/services/lotteryDrawService';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOverlayStore } from '@/stores/overlay';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { ichibanResultDialog } from '@/utils/dialog/ichibanResultDialog';
import { ichibanResultCardDialog } from '@/utils/dialog/ichibanResultCardDialog';
import { gotchaDialog } from '@/utils/dialog/gotchaDialog';
import { scratchCardDialog } from '@/utils/dialog/scratchCardDialog';
import { gachaTearDialog } from '@/utils/dialog/kujiRevealStripDialog';
import { executeApi } from '@/utils/executeApiUtils';

/* -----------------------------
 * Route
 * ----------------------------- */
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const overlay = useOverlayStore();

const kujiId = computed(() => String(route.params.id || ''));

/* -----------------------------
 * API state
 * ----------------------------- */
const loading = ref(false);
const errorMsg = ref('');
const detail = ref<any>(null);
const ticketList = ref<any[]>([]);
const sessionInfo = ref<any>(null);

// 統一取得 lottery 物件（API 可能回傳 { lottery: {...}, prizes: [...] } 或直接 {...}）
const lotteryData = computed(() => detail.value?.lottery || detail.value);

const bannerSrc = computed(() => lotteryData.value?.mainImageUrl || lotteryData.value?.imageUrl || demo1);

const kujiTitle = computed(() => lotteryData.value?.title || '未命名商品');
const kujiSubTitle = computed(() => lotteryData.value?.description || '');

// breadcrumb 類別顯示
const breadcrumbCategory = computed(() => {
  return lotteryData.value?.categoryName || '商城';
});

// 分類類型標籤
const categoryTypeLabel = computed(() => {
  const category = lotteryData.value?.category;
  switch(category) {
    case 'OFFICIAL_ICHIBAN': return '官方一番賞';
    case 'CUSTOM_GACHA': return '自製賞';
    case 'PRIZE_CAPSULE': return '扭蛋';
    case 'SCRATCH_CARD': return '刮刮樂';
    case 'CARD_DRAW': return '卡牌抽選';
    default: return lotteryData.value?.categoryName || '-';
  }
});

// 狀態顯示文字
const statusDisplayText = computed(() => {
  const status = lotteryData.value?.status;
  switch(status) {
    case 'ON_SHELF': return '🟢 上架中';
    case 'OFF_SHELF': return '🔴 已下架';
    case 'SOLD_OUT': return '⚫ 已售罄';
    case 'COMING_SOON': return '🟡 即將開賣';
    default: return lotteryData.value?.statusName || status || '-';
  }
});

// 價格
const currentPricePerDraw = computed(() => {
  const lottery = lotteryData.value;
  return Number(lottery?.currentPrice ?? lottery?.pricePerDraw ?? 0) || 0;
});

// 總抽數
const totalDraws = computed(() => {
  const lottery = lotteryData.value;
  return Number(lottery?.totalDraws ?? lottery?.maxDraws ?? 0) || 0;
});

// 10連抽價格（如果有折扣）
const multiDrawPrice = computed(() => {
  const lottery = lotteryData.value;
  if (lottery?.discountedPrice != null) {
    return Number(lottery.discountedPrice) || currentPricePerDraw.value * 10;
  }
  return currentPricePerDraw.value * 10;
});

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day} ${hh}:${mm}`;
};

// 上架時間
const createdAtText = computed(() => {
  return formatDateTime(lotteryData.value?.createdAt) || '-';
});

const periodText = computed(() => {
  const lottery = lotteryData.value;
  const s = formatDate(lottery?.startTime ?? null);
  const e = formatDate(lottery?.endTime ?? null);
  if (s && e) return `${s} - ${e}`;
  if (e) return `至 ${e}`;
  if (s) return `自 ${s}`;
  return '-';
});

/* -----------------------------
 * Prices（每抽 + 多抽）
 * ----------------------------- */
type PriceItem = { label: string; amount: number; unit: string };

const prices = computed<PriceItem[]>(() => {
  const lottery = lotteryData.value;
  if (!lottery) return [];

  const per = currentPricePerDraw.value;

  // 多抽 options：優先 10 連、其次 5 連
  const opts = Array.isArray(lottery.multiDrawOptions) ? [...lottery.multiDrawOptions] : [];
  const prefer = [10, 5];
  const chosen =
    prefer.find((x) => opts.includes(x)) ?? (opts.length ? opts[0] : (lottery.allowMultiDraw ? 10 : null));

  const arr: PriceItem[] = [{ label: '每抽', amount: per, unit: '元' }];

  if (lottery.allowMultiDraw && chosen) {
    arr.push({ label: `${chosen}連`, amount: per * chosen, unit: '元' });
  }

  return arr;
});

/* -----------------------------
 * 抽況
 * ----------------------------- */
const statusSectionRef = ref<HTMLElement | null>(null);

const isDrawPanelOpen = ref(false);
const activeCards = ref<number[]>([]);
// 票券編號 → UUID 的映射表（用於抽獎 API 傳送 UUID）
const ticketNumberToId = ref<Record<number, string>>({});

// 剩餘抽數
const remainingQuantity = computed(() => {
  const n = Number(lotteryData.value?.remainingDraws ?? 0);
  return Number.isNaN(n) ? 0 : n;
});

// 籤位狀態（從 API tickets 取得完整資訊）
const statusCards = computed(() => {
  if (ticketList.value.length > 0) {
    // 同步建立 ticketNumber → UUID 映射表
    const mapping: Record<number, string> = {};
    const cards = ticketList.value.map((t: any) => {
      if (t.id) mapping[t.ticketNumber] = t.id;
      return {
        id: t.id,               // 票券 UUID（用於抽獎 API）
        ticketNumber: t.ticketNumber,
        status: t.status,
        isGrandPrize: t.isGrandPrize || false,
        isLastPrize: t.isLastPrize || false,
        isDesignatedPrize: t.isDesignatedPrize || false,
        prizeImageUrl: t.prizeImageUrl,
        prizeLevel: t.prizeLevel,
        prizeName: t.prizeName,
      };
    });
    ticketNumberToId.value = mapping;
    return cards;
  }
  // fallback: 用 totalDraws 產生格子（舊格式，僅數字）
  const total = totalDraws.value;
  const SAFE_MAX = 120;
  const len = Math.min(Math.max(total, 0), SAFE_MAX);
  return Array.from({ length: len }, (_, i) => i + 1);
});

// 已抽籤位（含獎品資訊）
const drawnTickets = computed(() => {
  const drawn: Record<number, any> = {};
  ticketList.value.forEach((t: any) => {
    if (t.status === 'DRAWN') {
      drawn[t.ticketNumber] = {
        prizeLevel: t.prizeLevel,
        prizeName: t.prizeName,
        prizeImageUrl: t.prizeImageUrl,
      };
    }
  });
  return drawn;
});

// 可抽籤位
const availableTickets = computed(() => {
  return ticketList.value
    .filter((t: any) => t.status === 'AVAILABLE')
    .map((t: any) => t.ticketNumber);
});

// Session 保護狀態
const isProtected = computed(() => {
  const session = sessionInfo.value || detail.value?.session;
  if (!session) return false;
  return session.status === 'ACTIVE' && !session.canDraw;
});

const protectionMessage = computed(() => {
  const session = sessionInfo.value || detail.value?.session;
  if (!session) return '';
  if (session.cannotDrawReason) return session.cannotDrawReason;
  if (session.protectionEndTime) {
    const endTime = new Date(session.protectionEndTime);
    const now = new Date();
    const diff = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000 / 60));
    return `商品被鎖定中，剩餘時間：${diff} 分鐘`;
  }
  return '商品被其他玩家抽獎中';
});

const toggleCardSelection = (ticketNumber: number, ticketId?: string) => {
  // 只能選擇可抽的籤位
  if (!availableTickets.value.includes(ticketNumber)) return;
  const idx = activeCards.value.indexOf(ticketNumber);
  if (idx >= 0) {
    activeCards.value.splice(idx, 1);
  } else {
    activeCards.value.push(ticketNumber);
  }
  // 如果有 UUID 就更新映射
  if (ticketId) {
    ticketNumberToId.value[ticketNumber] = ticketId;
  }
};

const openDrawPanelFromCard = (ticketNumber: number, ticketId?: string) => {
  if (!authStore.isLogin) {
    router.push({ name: 'Login' });
    return;
  }
  if (availableTickets.value.includes(ticketNumber)) {
    toggleCardSelection(ticketNumber, ticketId);
  }
  isDrawPanelOpen.value = true;
};

const closeDrawPanel = () => {
  isDrawPanelOpen.value = false;
  activeCards.value = [];
};

/* -----------------------------
 * 賞品（從 API prizes 取得）
 * ----------------------------- */
type PrizeDisplayItem = {
  id: string;
  gradeLabel: string;
  gradeType: 'primary' | 'secondary';
  countText: string;
  sizeText: string;
  name: string;
  imgSrc: string;
};

const prizes = computed<PrizeDisplayItem[]>(() => {
  const prizeData = detail.value?.prizes || [];
  return prizeData.map((p: any) => ({
    id: p.id || String(Math.random()),
    gradeLabel: `${p.level || '?'}賞`,
    gradeType: p.isGrandPrize ? 'primary' : 'secondary',
    countText: `${p.remaining ?? 0}/${p.quantity ?? 0}`,
    sizeText: p.size || '',
    name: p.name || '未命名獎品',
    imgSrc: p.imageUrl || demo1,
  }));
});

/* -----------------------------
 * Actions
 * ----------------------------- */
const handleDraw = () => {
  if (!authStore.isLogin) {
    router.push({ name: 'Login' });
    return;
  }
  if (isProtected.value) {
    overlay.open();
    ichibanInfoDialog({ title: '無法抽獎', content: protectionMessage.value });
    overlay.close();
    return;
  }
  statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
  isDrawPanelOpen.value = true;
};

const handleViewStatus = () => {
  statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
};

// 根據分類顯示對應的抽獎動畫
const showDrawResult = async (results: any[], totalPrice: number) => {
  const category = lotteryData.value?.category;
  const items = results
    .filter((r: any) => r != null) // 過濾 undefined/null
    .map((r: any) => ({
      id: String(r?.ticketNumber || r?.id || r?.prizeId || ''),
      name: r?.prizeName || '獎品',
      image: r?.prizeImageUrl || demo1,
      grade: r?.prizeLevel || r?.grade || r?.gradeType,
    }));

  // 不在這裡調用 overlay.open() 
  // 因為各個動畫對話框有自己的背景層

  try {
    switch (category) {
      case 'PRIZE_CAPSULE': // 扭蛋
        await gotchaDialog({
          title: '扭蛋結果',
          pulls: items,
          speed: 1,
        });
        break;

      case 'SCRATCH_CARD': // 刮刮樂
        // 刮刮樂一次只能刮一張
        for (const item of items) {
          await scratchCardDialog({
            title: '刮刮樂',
            imageSrc: item.image,
            revealText: item.name ? `🎉 恭喜獲得 ${item.name}！` : '謝謝惠顧',
            grade: item.grade,
          });
        }
        break;

      case 'CARD_DRAW': // 卡牌抽選
        await ichibanResultCardDialog({
          remain: remainingQuantity.value - results.length,
          count: results.length,
          totalPrice,
          items,
        });
        break;

      case 'OFFICIAL_ICHIBAN': // 官方一番賞
      case 'CUSTOM_GACHA': // 自製賞
      default:
        // 先顯示撕卡動畫
        const pulls = items.map((item, index) => ({
          index,
          ...item,
          title: `今日一番賞・第 ${index + 1} 抽`,
        }));
        
        const tearResult = await gachaTearDialog({ pulls });
        if (!tearResult) return; // 用戶關閉動畫
        
        // 撕卡結束後顯示結果總覽
        await ichibanResultDialog({
          remain: remainingQuantity.value - results.length,
          count: results.length,
          totalPrice,
          items,
        });
        break;
    }
  } finally {
    // 動畫結束後不需要關閉 overlay（因為沒有打開）
  }
};

// 隨機選擇
const handleRandomSelect = async (count: number) => {
  if (!authStore.isLogin) {
    router.push({ name: 'Login' });
    return;
  }

  // 執行隨機抽獎（新版 API：只傳 count，不傳 ticket，由後端隨機選擇）
  await executeApi({
    fn: () => drawLottery(kujiId.value, { count }),
    successTitle: '抽獎成功！',
    showSuccessDialog: false,
    showCatchDialog: true,
    onSuccess: async (data: any) => {
      // 新 API 統一回傳陣列 - 處理可能的多層包裝
      let results = Array.isArray(data) ? data : [];
      
      // 如果 data 是物件但不是陣列，檢查是否有 data/results/items 等屬性
      if (!Array.isArray(data) && data && typeof data === 'object') {
        results = data.data || data.results || data.items || [data];
      }
      
      // 過濾掉 undefined/null 項目
      results = results.filter((r: any) => r != null);
      
      const totalPrice = currentPricePerDraw.value * results.length;

      // 根據分類顯示對應動畫
      await showDrawResult(results, totalPrice);

      // 檢查是否開套免單
      const freeDrawResult = results.find((r: any) => r.triggeredFreeDraw);
      if (freeDrawResult) {
        overlay.open();
        await ichibanInfoDialog({
          title: '🎉 恭喜開套免單！',
          content: `退還 ${freeDrawResult.refundAmount || 0} 元`,
        });
        overlay.close();
      }

      // 重新載入資料
      await reload();
      closeDrawPanel();
    },
  });
};

// 指定抽獎（使用票券 UUID 批次抽獎）
const handleExchange = async (type: 'gold' | 'silver') => {
  if (!authStore.isLogin) {
    router.push({ name: 'Login' });
    return;
  }
  if (!activeCards.value.length) {
    overlay.open();
    await ichibanInfoDialog({ title: '提示', content: '請先選擇想要抽的格數' });
    overlay.close();
    return;
  }

  // 將選中的票券編號轉換成 UUID
  const ticketUuids: string[] = [];
  for (const ticketNumber of activeCards.value) {
    const uuid = ticketNumberToId.value[ticketNumber];
    if (uuid) {
      ticketUuids.push(uuid);
    }
  }

  if (ticketUuids.length === 0) {
    overlay.open();
    await ichibanInfoDialog({ title: '錯誤', content: '無法取得票券資訊，請重新整理頁面' });
    overlay.close();
    return;
  }

  // count 必須等於 ticket 陣列長度
  const count = ticketUuids.length;

  await executeApi({
    fn: () => drawLottery(kujiId.value, { count, ticket: ticketUuids }),
    successTitle: '抽獎成功！',
    showSuccessDialog: false,
    showCatchDialog: true,
    onSuccess: async (data: any) => {
      // 新 API 統一回傳陣列 - 處理可能的多層包裝
      let results = Array.isArray(data) ? data : [];
      
      // 如果 data 是物件但不是陣列，檢查是否有 data/results/items 等屬性
      if (!Array.isArray(data) && data && typeof data === 'object') {
        results = data.data || data.results || data.items || [data];
      }
      
      // 過濾掉 undefined/null 項目
      results = results.filter((r: any) => r != null);

      const totalPrice = currentPricePerDraw.value * results.length;

      // 根據分類顯示對應動畫
      await showDrawResult(results, totalPrice);

      // 檢查是否有開套免單
      const freeDrawResult = results.find((r: any) => r.triggeredFreeDraw);
      if (freeDrawResult) {
        overlay.open();
        await ichibanInfoDialog({
          title: '🎉 恭喜開套免單！',
          content: `退還 ${freeDrawResult.refundAmount || 0} 元`,
        });
        overlay.close();
      }

      await reload();
      closeDrawPanel();
    },
  });
};

/* -----------------------------
 * API fetch
 * ----------------------------- */
const reload = async () => {
  if (!kujiId.value) return;

  loading.value = true;
  errorMsg.value = '';
  detail.value = null;
  ticketList.value = [];
  sessionInfo.value = null;

  try {
    // 取得完整商品詳情（含 prizes + tickets + session）
    const resp = await getBrowseLotteryDetail(kujiId.value);
    if (resp.success) {
      detail.value = resp.data;

      // 從 detail 取得 tickets
      if (Array.isArray(resp.data?.tickets)) {
        ticketList.value = resp.data.tickets;
      }
      // 從 detail 取得 session
      if (resp.data?.session) {
        sessionInfo.value = resp.data.session;
      }
    } else {
      errorMsg.value = resp.message || '無法取得商品資料';
    }
  } catch (e) {
    console.error(e);
    errorMsg.value = '無法取得商品資料，請稍後再試';
  }

  // 如果已登入，額外取得籤位資訊（可能有更詳細的狀態）
  if (authStore.isLogin) {
    try {
      const ticketResp = await getTickets(kujiId.value);
      if (ticketResp.success && ticketResp.data) {
        if (Array.isArray(ticketResp.data?.tickets)) {
          ticketList.value = ticketResp.data.tickets;
        }
        if (ticketResp.data?.session) {
          sessionInfo.value = ticketResp.data.session;
        }
      }
    } catch (err) {
      console.warn('[getTickets failed]', err);
    }
  }

  loading.value = false;
};

onMounted(async () => {
  if (kujiId.value) {
    incrementHotCount(kujiId.value).catch((err) => console.warn('incrementHotCount failed', err));
  }
  await reload();
});

watch(
  () => kujiId.value,
  async () => {
    if (kujiId.value) {
      incrementHotCount(kujiId.value).catch((err) => console.warn('incrementHotCount failed', err));
    }
    await reload();
  },
);

/* -----------------------------
 * Nav
 * ----------------------------- */
const goHome = () => router.push({ name: 'Home' });
</script>

<style scoped lang="scss">
.ichibanDetail {
  background: linear-gradient(180deg, #f4e1cc 0%, #f8efe3 40%, #ffffff 100%);
  min-height: 100vh;
  padding-bottom: 120px;

  &__hero {
    position: relative;
    padding-top: 24px;
    padding-bottom: 32px;
  }

  &__hero-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      #f4e1cc 0%,
      #f8efe3 50%,
      rgba(255, 255, 255, 0) 100%
    );
    pointer-events: none;
  }

  &__hero-inner {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  &__breadcrumb {
    font-size: 13px;
    color: #7b6a5a;
    margin-bottom: 8px;

    &-current {
      color: #3f2412;
      font-weight: 600;
    }
  }

  &__top {
    display: flex;
    gap: 24px;
    align-items: stretch;
  }

  &__banner {
    flex: 3;
    background: #000;
    border-radius: 12px;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  }

  &__info {
    flex: 2;
    background: #fbe8d6;
    border-radius: 12px;
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__title {
    font-size: 20px;
    font-weight: 900;
    color: #3f2412;
    line-height: 1.4;
  }

  &__subtitle {
    font-size: 14px;
    color: #7b6a5a;
    line-height: 1.5;
  }

  &__prices {
    display: flex;
    gap: 18px;
    margin-top: 4px;
  }

  &__priceItem {
    min-width: 90px;
    text-align: right;
  }

  &__priceLabel {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 10px;
    border-radius: 999px;
    background: #ffffff;
    color: #e5a657;
    font-size: 12px;
    font-weight: 700;
  }

  &__priceValue {
    margin-top: 4px;
    color: #3f2412;
    font-weight: 900;
  }

  &__priceNumber {
    font-size: 22px;
  }

  &__priceUnit {
    font-size: 11px;
    margin-left: 2px;
  }

  &__meta {
    display: grid;
    gap: 6px;
    padding-top: 6px;
  }

  &__metaRow {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: #6b5a4d;
  }

  &__metaKey {
    opacity: 0.85;
  }

  &__metaVal {
    color: #3f2412;
    font-weight: 700;
    text-align: right;
  }

  &__actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  &__prizes {
    margin-top: 24px;
    background: #a23b2f;
    border-radius: 18px 18px 0 0;
    padding: 24px 24px 32px;
    color: #ffffff;
  }

  &__prizes-header {
    text-align: center;
    margin-bottom: 24px;
  }

  &__prizes-title {
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 2px;
  }

  &__prizes-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px 20px;
  }

  &__status {
    background: #000000;
    color: #ffffff;
    padding: 32px 24px 40px;
    border-radius: 0 0 18px 18px;
    margin-top: 0;
  }

  &__status-title {
    text-align: center;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 2px;
    margin: 0 0 12px;
  }

  &__status-summary {
    text-align: center;
    font-size: 14px;
    margin-bottom: 16px;
    color: #f3cf7a;
  }

  @media (max-width: 1024px) {
    &__top {
      flex-direction: column;
    }
    &__prizes-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    &__prizes-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
