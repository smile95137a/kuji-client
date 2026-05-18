<template>
  <section class="prizeBox">
    <div class="prizeBox__hero">
      <div class="prizeBox__heroBg"></div>

      <div class="prizeBox__heroTop">
        <div>
          <p class="prizeBox__badge">PRIZE BOX</p>
          <h1 class="prizeBox__title">賞品盒</h1>
          <p class="prizeBox__subtitle">
            查看你抽到的賞品，支援配送申請與可回收獎品處理。
          </p>
        </div>

        <div class="prizeBox__heroCount">
          <span>共</span>
          <strong>{{ displayCount }}</strong>
          <span>筆</span>
        </div>
      </div>
    </div>

    <div class="prizeBox__section">
      <div class="prizeBox__sectionHead">
        <div>
          <p class="prizeBox__sectionKicker">SEARCH FILTER</p>
          <h2 class="prizeBox__sectionTitle">篩選條件</h2>
        </div>
      </div>

      <form class="prizeBox__form" @submit.prevent="onSearch">
        <div class="prizeBox__grid">
          <div class="prizeBox__field">
            <label class="prizeBox__label">狀態</label>
            <select class="prizeBox__input" v-model="status">
              <option value="">全部</option>
              <option value="IN_BOX">在賞品盒</option>
              <option value="SHIPPING">配送中</option>
              <option value="DELIVERED">已送達</option>
              <option value="REDEEMED">已回收</option>
            </select>
          </div>

          <div class="prizeBox__field">
            <label class="prizeBox__label">賞品池 / 商品</label>
            <select class="prizeBox__input" v-model="lotteryTitle">
              <option value="">全部</option>
              <option v-for="t in lotteryTitleOptions" :key="t" :value="t">
                {{ t }}
              </option>
            </select>
          </div>

          <div class="prizeBox__field prizeBox__field--keyword">
            <label class="prizeBox__label">關鍵字</label>
            <input
              class="prizeBox__input"
              type="text"
              placeholder="搜尋賞品名稱、商品名稱或店家"
              v-model.trim="keyword"
            />
          </div>

          <div class="prizeBox__field prizeBox__field--check">
            <label
              class="prizeBox__checkCard"
              :class="{ 'prizeBox__checkCard--active': onlyUnshipped }"
            >
              <input type="checkbox" v-model="onlyUnshipped" />
              <span class="prizeBox__checkIcon">
                <font-awesome-icon :icon="['fas', 'check']" />
              </span>
              <span>只看可申請配送</span>
            </label>
          </div>
        </div>

        <div class="prizeBox__actions">
          <button
            class="prizeBox__actionBtn prizeBox__actionBtn--ghost"
            type="button"
            @click="onReset"
            :disabled="loading"
          >
            重設
          </button>

          <button class="prizeBox__actionBtn" type="submit" :disabled="loading">
            <span v-if="loading" class="prizeBox__spinner"></span>
            <template v-else>
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
              查詢
            </template>
          </button>
        </div>
      </form>
    </div>

    <div class="prizeBox__section">
      <div class="prizeBox__sectionHead">
        <div>
          <p class="prizeBox__sectionKicker">PRIZE LIST</p>
          <h2 class="prizeBox__sectionTitle">賞品列表</h2>
        </div>

        <p class="prizeBox__count">
          共 <b>{{ displayCount }}</b> 筆
        </p>
      </div>

      <div class="prizeBox__batchBar">
        <label
          class="prizeBox__selectAll"
          :class="{ 'prizeBox__selectAll--active': allChecked }"
        >
          <input
            type="checkbox"
            :checked="allChecked"
            @change="toggleAll(($event.target as HTMLInputElement).checked)"
          />
          <span class="prizeBox__checkIcon">
            <font-awesome-icon :icon="['fas', 'check']" />
          </span>
          <span>全選本頁可配送賞品</span>
        </label>

        <div class="prizeBox__batch">
          <button
            class="prizeBox__actionBtn prizeBox__actionBtn--ghost"
            type="button"
            :disabled="loading || checkedIds.size === 0"
            @click="batchRecycle"
          >
            批次回收
          </button>

          <button
            class="prizeBox__actionBtn"
            type="button"
            :disabled="loading || checkedIds.size === 0"
            @click="batchShip"
          >
            批次申請配送
          </button>
        </div>
      </div>

      <div class="prizeBox__tableWrap">
        <table class="prizeBox__table">
          <thead>
            <tr>
              <th>選取</th>
              <th>賞品</th>
              <th>商品</th>
              <th>店家</th>
              <th>入盒時間</th>
              <th>狀態</th>
              <th class="prizeBox__thAction">操作</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in pageRows" :key="row.id">
              <td>
                <label class="prizeBox__tableCheck">
                  <input
                    type="checkbox"
                    :checked="checkedIds.has(row.id)"
                    :disabled="row.status !== 'IN_BOX'"
                    @change="
                      toggleOne(
                        row.id,
                        ($event.target as HTMLInputElement).checked,
                      )
                    "
                  />
                  <span></span>
                </label>
              </td>

              <td>
                <div class="prizeBox__prizeCell">
                  <img
                    class="prizeBox__thumb"
                    :src="row.prizeImageUrl"
                    alt="thumb"
                  />

                  <div class="prizeBox__prizeMeta">
                    <p class="prizeBox__prizeName">
                      {{ row.prizeName }}
                      <span v-if="row.prizeLevel" class="prizeBox__mini">
                        （{{ formatPrizeLevel(row.prizeLevel) }}）
                      </span>
                    </p>

                    <p v-if="row.isRecyclable" class="prizeBox__mini">
                      可回收，回饋 +{{ row.recycleBonus }} 蝦幣
                    </p>
                  </div>
                </div>
              </td>

              <td>{{ row.lotteryTitle || '-' }}</td>
              <td>{{ row.storeName || '-' }}</td>
              <td>{{ formatDate(row.createdAt) }}</td>

              <td>
                <span
                  class="prizeBox__statusBadge"
                  :class="badgeClass(row.status)"
                >
                  {{ row.statusName || statusLabel(row.status) }}
                </span>
              </td>

              <td class="prizeBox__tdAction">
                <button
                  class="prizeBox__detailBtn"
                  type="button"
                  @click="openDetail(row)"
                >
                  查看
                </button>
              </td>
            </tr>

            <tr v-if="!loading && pageRows.length === 0">
              <td class="prizeBox__empty" colspan="7">
                目前沒有符合條件的賞品
              </td>
            </tr>

            <tr v-if="loading">
              <td class="prizeBox__empty" colspan="7">載入中...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="prizeBox__cards">
        <article v-for="row in pageRows" :key="row.id" class="prizeBox__item">
          <div class="prizeBox__itemTop">
            <label
              class="prizeBox__mobileCheck"
              :class="{
                'prizeBox__mobileCheck--active': checkedIds.has(row.id),
              }"
            >
              <input
                type="checkbox"
                :checked="checkedIds.has(row.id)"
                :disabled="row.status !== 'IN_BOX'"
                @change="
                  toggleOne(row.id, ($event.target as HTMLInputElement).checked)
                "
              />
              <span class="prizeBox__checkIcon">
                <font-awesome-icon :icon="['fas', 'check']" />
              </span>
              <span>選取</span>
            </label>

            <span class="prizeBox__statusBadge" :class="badgeClass(row.status)">
              {{ row.statusName || statusLabel(row.status) }}
            </span>
          </div>

          <div class="prizeBox__itemBody">
            <img class="prizeBox__thumb" :src="row.prizeImageUrl" alt="thumb" />

            <div class="prizeBox__prizeMeta">
              <p class="prizeBox__prizeName">
                {{ row.prizeName }}
                <span v-if="row.prizeLevel" class="prizeBox__mini">
                  （{{ formatPrizeLevel(row.prizeLevel) }}）
                </span>
              </p>

              <p class="prizeBox__prizeId">{{ row.id }}</p>
              <p class="prizeBox__mini">商品：{{ row.lotteryTitle || '-' }}</p>
              <p class="prizeBox__mini">店家：{{ row.storeName || '-' }}</p>
              <p class="prizeBox__mini">
                入盒：{{ formatDate(row.createdAt) }}
              </p>

              <p v-if="row.isRecyclable" class="prizeBox__mini">
                可回收，回饋 +{{ row.recycleBonus }} 蝦幣
              </p>
            </div>
          </div>

          <button
            class="prizeBox__mobileDetailBtn"
            type="button"
            @click="openDetail(row)"
          >
            查看詳情
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </article>

        <div
          v-if="!loading && pageRows.length === 0"
          class="prizeBox__emptyCard"
        >
          <font-awesome-icon :icon="['fas', 'gift']" />
          <p>目前沒有符合條件的賞品</p>
          <span>可以調整篩選條件再試一次。</span>
        </div>

        <div v-if="loading" class="prizeBox__emptyCard">
          <font-awesome-icon :icon="['fas', 'spinner']" spin />
          <p>載入中...</p>
        </div>
      </div>

      <div class="prizeBox__pagination">
        <BasePagination
          v-model:page="page"
          :total-pages="totalPages"
          :max-visible="5"
        />
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="detailOpen"
        class="prizeBox__overlay"
        @click.self="detailOpen = false"
      >
        <div class="prizeBox__dialog">
          <div class="prizeBox__dialogHeader">
            <div>
              <p class="prizeBox__sectionKicker">PRIZE DETAIL</p>
              <h3 class="prizeBox__dialogTitle">賞品詳情</h3>
            </div>

            <button
              class="prizeBox__dialogClose"
              type="button"
              @click="detailOpen = false"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </button>
          </div>

          <div v-if="selected" class="prizeBox__dialogBody">
            <div class="prizeBox__detailCard">
              <img
                class="prizeBox__detailImg"
                :src="selected.prizeImageUrl"
                alt="img"
              />

              <div class="prizeBox__detailMeta">
                <span
                  class="prizeBox__statusBadge"
                  :class="badgeClass(selected.status)"
                >
                  {{ selected.statusName || statusLabel(selected.status) }}
                </span>

                <p class="prizeBox__detailName">
                  {{ selected.prizeName }}
                  <span v-if="selected.prizeLevel" class="prizeBox__mini">
                    （{{ formatPrizeLevel(selected.prizeLevel) }}）
                  </span>
                </p>

                <p class="prizeBox__detailId">{{ selected.id }}</p>
              </div>
            </div>

            <div class="prizeBox__detailInfo">
              <p>
                <span>商品</span>
                <strong>{{ selected.lotteryTitle || '-' }}</strong>
              </p>

              <p>
                <span>店家</span>
                <strong>{{ selected.storeName || '-' }}</strong>
              </p>

              <p>
                <span>入盒時間</span>
                <strong>{{ formatDate(selected.createdAt) }}</strong>
              </p>

              <p v-if="selected.isRecyclable">
                <span>回收回饋</span>
                <strong class="prizeBox__bonusText">
                  +{{ selected.recycleBonus }} 蝦幣
                </strong>
              </p>
            </div>
          </div>

          <div v-if="selected" class="prizeBox__dialogFooter">
            <button
              class="prizeBox__dialogBtn prizeBox__dialogBtn--ghost"
              type="button"
              @click="detailOpen = false"
            >
              取消
            </button>

            <button
              class="prizeBox__dialogBtn prizeBox__dialogBtn--ghost"
              type="button"
              :disabled="
                loading ||
                !selected.isRecyclable ||
                selected.status !== 'IN_BOX'
              "
              @click="recycleOne(selected)"
            >
              回收領回饋
            </button>

            <button
              class="prizeBox__dialogBtn"
              type="button"
              :disabled="loading || selected.status !== 'IN_BOX'"
              @click="shipOne(selected)"
            >
              申請配送
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <PrizeBoxShipDialog
      :visible="shipDialogOpen"
      :items="shipDialogItems"
      @close="shipDialogOpen = false"
      @success="onShipSuccess"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BasePagination from '@/components/common/BasePagination.vue';
import PrizeBoxShipDialog from '@/components/member/PrizeBoxShipDialog.vue';

import {
  getPrizeBoxHistory,
  recyclePrizeBoxItems,
} from '@/services/prizeBoxService';

import { executeApi } from '@/utils/executeApiUtils';
import { formatPrizeLevel } from '@/utils/prizeLevel';
import { useMemberWalletStore } from '@/stores/memberWallet';

const walletStore = useMemberWalletStore();

type PrizeStatus = 'IN_BOX' | 'SHIPPING' | 'DELIVERED' | 'REDEEMED';

const pageSize = 10;
const page = ref(1);

const status = ref<PrizeStatus | ''>('');
const lotteryTitle = ref('');
const keyword = ref('');
const onlyUnshipped = ref(false);

const rows = ref<any[]>([]);
const loading = ref(false);
const serverTotal = ref(0);
const serverTotalPages = ref(1);

const lotteryTitleOptions = computed(() => {
  const set = new Set<string>();

  rows.value.forEach((r) => {
    if (r.lotteryTitle) set.add(r.lotteryTitle);
  });

  return Array.from(set);
});

const useServerPaging = computed(
  () =>
    !lotteryTitle.value.trim() && !keyword.value.trim() && !onlyUnshipped.value,
);

const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase();

  const baseRows = useServerPaging.value
    ? rows.value
    : rows.value.filter((r) => {
        const okStatus = status.value ? r.status === status.value : true;
        const okLottery = lotteryTitle.value
          ? r.lotteryTitle === lotteryTitle.value
          : true;

        const okKw = kw
          ? (r.prizeName || '').toLowerCase().includes(kw) ||
            (r.lotteryTitle || '').toLowerCase().includes(kw) ||
            (r.storeName || '').toLowerCase().includes(kw)
          : true;

        const okUnshipped = onlyUnshipped.value ? r.status === 'IN_BOX' : true;

        return okStatus && okLottery && okKw && okUnshipped;
      });

  return baseRows.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
});

const totalPages = computed(() =>
  useServerPaging.value
    ? Math.max(1, serverTotalPages.value)
    : Math.max(1, Math.ceil(filteredRows.value.length / pageSize)),
);

const displayCount = computed(() =>
  useServerPaging.value ? serverTotal.value : filteredRows.value.length,
);

const pageRows = computed(() => {
  if (useServerPaging.value) return filteredRows.value;

  const start = (page.value - 1) * pageSize;

  return filteredRows.value.slice(start, start + pageSize);
});

watch([status, lotteryTitle, keyword, onlyUnshipped], async () => {
  page.value = 1;
  checkedIds.value = new Set();

  await loadPrizeBox();
});

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
  if (page.value < 1) page.value = 1;
});

watch(page, async (next, prev) => {
  if (next === prev) return;

  checkedIds.value = new Set();

  if (useServerPaging.value) {
    await loadPrizeBox();
  }
});

const mapRow = (p: any) => ({
  id: String(p.id ?? ''),
  userId: String(p.userId ?? ''),
  lotteryId: String(p.lotteryId ?? ''),
  lotteryTitle: String(p.lotteryTitle ?? ''),
  prizeId: String(p.prizeId ?? ''),
  prizeName: String(p.prizeName ?? ''),
  prizeLevel: String(p.prizeLevel ?? ''),
  prizeImageUrl: String(p.prizeImageUrl ?? ''),
  storeId: String(p.storeId ?? ''),
  storeName: String(p.storeName ?? ''),
  status: (p.status ?? 'IN_BOX') as PrizeStatus,
  statusName: String(p.statusName ?? ''),
  isRecyclable: Boolean(p.isRecyclable ?? false),
  recycleBonus: Number(p.recycleBonus ?? 0) || 0,
  createdAt: String(p.createdAt ?? ''),
});

const extractPageItems = (raw: any) => {
  const payload = raw?.data ?? raw;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.list)) return raw.list;
  if (Array.isArray(raw)) return raw;

  return [];
};

const extractPageTotal = (raw: any, fallback: number) => {
  const payload = raw?.data ?? raw;

  return (
    Number(
      payload?.totalItems ?? payload?.total ?? payload?.count ?? fallback,
    ) || fallback
  );
};

const extractPageTotalPages = (raw: any, fallbackTotal: number) => {
  const payload = raw?.data ?? raw;

  return (
    Number(
      payload?.totalPages ?? Math.max(1, Math.ceil(fallbackTotal / pageSize)),
    ) || 1
  );
};

const loadPrizeBox = async () => {
  loading.value = true;

  const effectiveStatus = onlyUnshipped.value
    ? 'IN_BOX'
    : status.value || undefined;

  await executeApi<any>({
    fn: () =>
      useServerPaging.value
        ? getPrizeBoxHistory({
            status: effectiveStatus,
            page: page.value,
            size: pageSize,
          })
        : getPrizeBoxHistory({
            status: effectiveStatus,
            page: 1,
            size: 500,
          }),
    onSuccess: (raw) => {
      const list = extractPageItems(raw);
      const total = extractPageTotal(raw, list.length);

      rows.value = list.map(mapRow);
      serverTotal.value = total;
      serverTotalPages.value = extractPageTotalPages(raw, total);
    },
    onFinally: () => {
      loading.value = false;
    },
  });
};

const shipDialogOpen = ref(false);
const shipDialogItems = ref<any[]>([]);

const openShipDialog = (ids: string[]) => {
  if (!ids.length) return;

  shipDialogItems.value = rows.value.filter((r) => ids.includes(r.id));
  shipDialogOpen.value = true;
};

const onShipSuccess = () => {
  shipDialogOpen.value = false;
  checkedIds.value = new Set();
  detailOpen.value = false;

  loadPrizeBox();
};

const recycleByIds = async (ids: string[]) => {
  if (!ids.length) return;

  loading.value = true;

  await executeApi<any>({
    fn: () => recyclePrizeBoxItems({ prizeBoxIds: ids }),
    showSuccessDialog: true,
    showFailDialog: true,
    successTitle: '回收成功',
    successMessage: '賞品已回收，回饋獎勵已發送至您的錢包。',
    errorTitle: '回收失敗',
    errorMessage: '回收作業失敗，請稍後再試。',
    onSuccess: async () => {
      await walletStore.loadMe();

      checkedIds.value = new Set();
      detailOpen.value = false;

      await loadPrizeBox();
    },
    onFinally: () => {
      loading.value = false;
    },
  });
};

const onSearch = async () => {
  page.value = 1;

  await loadPrizeBox();
};

const onReset = async () => {
  status.value = '';
  lotteryTitle.value = '';
  keyword.value = '';
  onlyUnshipped.value = false;

  page.value = 1;
  checkedIds.value = new Set();

  await loadPrizeBox();
};

const formatDate = (iso: string) => {
  if (!iso) return '-';

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) return iso;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;
};

const statusLabel = (s: PrizeStatus) => {
  if (s === 'IN_BOX') return '在賞品盒';
  if (s === 'SHIPPING') return '配送中';
  if (s === 'DELIVERED') return '已送達';

  return '已回收';
};

const badgeClass = (s: PrizeStatus) => ({
  'is-inbox': s === 'IN_BOX',
  'is-shipping': s === 'SHIPPING',
  'is-delivered': s === 'DELIVERED',
  'is-redeemed': s === 'REDEEMED',
});

const checkedIds = ref<Set<string>>(new Set());

const toggleOne = (id: string, checked: boolean) => {
  const next = new Set(checkedIds.value);

  if (checked) next.add(id);
  else next.delete(id);

  checkedIds.value = next;
};

const allChecked = computed(() => {
  if (pageRows.value.length === 0) return false;

  const selectable = pageRows.value.filter((r) => r.status === 'IN_BOX');

  if (selectable.length === 0) return false;

  return selectable.every((r) => checkedIds.value.has(r.id));
});

const toggleAll = (checked: boolean) => {
  const next = new Set(checkedIds.value);

  pageRows.value.forEach((r) => {
    if (r.status !== 'IN_BOX') return;

    if (checked) next.add(r.id);
    else next.delete(r.id);
  });

  checkedIds.value = next;
};

const detailOpen = ref(false);
const selected = ref<any | null>(null);

const openDetail = (row: any) => {
  selected.value = row;
  detailOpen.value = true;
};

const shipOne = async (row: any) => {
  if (row.status !== 'IN_BOX') return;

  openShipDialog([row.id]);
};

const recycleOne = async (row: any) => {
  if (row.status !== 'IN_BOX') return;
  if (!row.isRecyclable) return;

  await recycleByIds([row.id]);
};

const batchShip = async () => {
  const ids = Array.from(checkedIds.value);

  openShipDialog(ids);
};

const batchRecycle = async () => {
  const ids = Array.from(checkedIds.value).filter((id) => {
    const r = rows.value.find((x) => x.id === id);

    return !!r && r.status === 'IN_BOX' && r.isRecyclable;
  });

  await recycleByIds(ids);
};

onMounted(async () => {
  await walletStore.loadMe();
  await loadPrizeBox();
});
</script>

<style scoped lang="scss">
.prizeBox {
  min-height: 100%;
  color: #201713;

  --primary: #b43325;
  --primary-dark: #8f261b;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --brown: #3f2412;
  --cream: #fff8ef;
  --cream-deep: #f5eadc;
  --card: #ffffff;
  --line: rgba(63, 36, 18, 0.1);
  --text: #201713;
  --text-soft: rgba(32, 23, 19, 0.58);

  &__hero {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    padding: 22px;
    margin-bottom: 18px;

    background:
      radial-gradient(
        circle at 12% 0%,
        rgba(255, 255, 255, 0.5),
        transparent 28%
      ),
      linear-gradient(135deg, #4a2617 0%, #b43325 58%, #d66b42 100%);
    color: #fff;
    box-shadow: 0 18px 36px rgba(91, 37, 21, 0.16);
  }

  &__heroBg {
    position: absolute;
    right: -70px;
    top: -90px;
    width: 220px;
    height: 220px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.13);
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      right: 50px;
      bottom: -70px;
      width: 150px;
      height: 150px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__heroTop {
    position: relative;
    z-index: 1;

    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
  }

  &__badge,
  &__sectionKicker {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    margin: 0 0 8px;

    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1.3px;
  }

  &__badge {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }

  &__sectionKicker {
    background: var(--primary-soft);
    color: var(--primary);
  }

  &__title {
    margin: 0;
    font-size: 28px;
    line-height: 1.2;
    font-weight: 950;
    letter-spacing: 0.5px;
  }

  &__subtitle {
    margin: 8px 0 0;
    color: rgba(255, 255, 255, 0.78);
    font-size: 14px;
    line-height: 1.6;
  }

  &__heroCount {
    min-width: 86px;
    min-height: 64px;
    padding: 10px 12px;
    border-radius: 20px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.24);
    backdrop-filter: blur(12px);

    span {
      color: rgba(255, 255, 255, 0.75);
      font-size: 12px;
      font-weight: 800;
    }

    strong {
      color: #fff;
      font-size: 22px;
      line-height: 1.1;
      font-weight: 950;
    }
  }

  &__section {
    border-radius: 24px;
    padding: 18px;
    margin-top: 16px;

    background: var(--card);
    border: 1px solid var(--line);
    box-shadow: 0 12px 28px rgba(53, 31, 18, 0.055);
  }

  &__sectionHead {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__sectionTitle {
    margin: 0;
    color: var(--text);
    font-size: 19px;
    line-height: 1.3;
    font-weight: 950;
  }

  &__form {
    display: grid;
    gap: 14px;
  }

  &__grid {
    display: grid;
    grid-template-columns: 160px 180px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: end;
  }

  &__field {
    min-width: 0;

    &--check {
      display: flex;
      align-items: end;
    }
  }

  &__label {
    display: block;
    margin-bottom: 7px;
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 900;
  }

  &__input {
    width: 100%;
    min-height: 46px;
    padding: 0 14px;
    border-radius: 16px;

    background: #fff;
    border: 1px solid var(--line);
    color: var(--text);
    outline: none;

    font-size: 14px;
    font-weight: 800;

    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease;

    &::placeholder {
      color: rgba(32, 23, 19, 0.34);
    }

    &:focus {
      border-color: rgba(180, 51, 37, 0.5);
      box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.1);
    }
  }

  &__checkCard,
  &__selectAll,
  &__mobileCheck {
    min-height: 46px;
    padding: 0 14px;
    border-radius: 16px;
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    gap: 10px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
    color: var(--text);

    font-size: 14px;
    font-weight: 900;

    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease;

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    &--active {
      border-color: rgba(180, 51, 37, 0.55);
      box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.1);

      .prizeBox__checkIcon {
        background: var(--primary);
        color: #fff;
      }
    }
  }

  &__checkIcon {
    width: 24px;
    height: 24px;
    border-radius: 999px;

    display: grid;
    place-items: center;

    background: #fff;
    color: var(--text-soft);
    border: 1px solid var(--line);

    font-size: 11px;
    flex: 0 0 auto;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  &__actionBtn,
  &__dialogBtn {
    min-height: 44px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1px solid var(--primary);
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    background: var(--primary);
    color: #fff;

    font-size: 14px;
    font-weight: 900;

    transition:
      transform 0.16s ease,
      box-shadow 0.16s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 12px 20px rgba(180, 51, 37, 0.18);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--ghost {
      background: #fff;
      color: var(--text);
      border-color: var(--line);

      &:hover:not(:disabled) {
        box-shadow: 0 10px 18px rgba(63, 36, 18, 0.06);
      }
    }
  }

  &__count {
    margin: 0;
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 900;

    b {
      color: var(--primary);
      font-size: 18px;
    }
  }

  &__batchBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__batch {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__tableWrap {
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 10px;
    font-size: 14px;

    th {
      padding: 0 12px 4px;
      color: var(--text-soft);
      font-size: 12px;
      font-weight: 900;
      text-align: left;
      white-space: nowrap;
    }

    td {
      padding: 14px 12px;
      background: var(--cream);
      border-top: 1px solid rgba(180, 51, 37, 0.08);
      border-bottom: 1px solid rgba(180, 51, 37, 0.08);
      color: var(--text);
      font-weight: 800;
      white-space: nowrap;
      vertical-align: middle;

      &:first-child {
        border-left: 1px solid rgba(180, 51, 37, 0.08);
        border-radius: 18px 0 0 18px;
      }

      &:last-child {
        border-right: 1px solid rgba(180, 51, 37, 0.08);
        border-radius: 0 18px 18px 0;
      }
    }
  }

  &__thAction,
  &__tdAction {
    text-align: right;
  }

  &__tableCheck {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 28px;
    height: 28px;
    cursor: pointer;

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    span {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      background: #fff;
      border: 1px solid var(--line);
    }

    input:checked + span {
      background: var(--primary);
      border-color: var(--primary);

      &::after {
        content: '✓';
        display: grid;
        place-items: center;
        color: #fff;
        font-size: 13px;
        font-weight: 900;
      }
    }

    input:disabled + span {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__prizeCell {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 280px;
  }

  &__thumb {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    border: 1px solid var(--line);
    object-fit: cover;
    background: #f6f1ea;
    flex: 0 0 auto;
  }

  &__prizeMeta {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  &__prizeName {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 950;
    white-space: normal;
  }

  &__prizeId,
  &__detailId {
    margin: 0;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 800;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
  }

  &__mini {
    margin: 0;
    color: var(--text-soft);
    font-size: 12px;
    line-height: 1.45;
    font-weight: 800;
  }

  &__statusBadge {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;

    background: rgba(32, 23, 19, 0.06);
    color: rgba(32, 23, 19, 0.72);
    border: 1px solid rgba(32, 23, 19, 0.08);

    font-size: 12px;
    font-weight: 950;

    &.is-inbox {
      background: rgba(180, 51, 37, 0.1);
      color: var(--primary);
      border-color: rgba(180, 51, 37, 0.16);
    }

    &.is-shipping {
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      border-color: rgba(37, 99, 235, 0.16);
    }

    &.is-delivered {
      background: rgba(46, 125, 50, 0.1);
      color: #2e7d32;
      border-color: rgba(46, 125, 50, 0.16);
    }

    &.is-redeemed {
      background: rgba(32, 23, 19, 0.08);
      color: rgba(32, 23, 19, 0.7);
      border-color: rgba(32, 23, 19, 0.12);
    }
  }

  &__detailBtn {
    min-height: 34px;
    padding: 0 13px;
    border-radius: 999px;
    border: 1px solid rgba(180, 51, 37, 0.14);
    cursor: pointer;

    background: #fff;
    color: var(--primary);

    font-size: 13px;
    font-weight: 900;

    &:hover {
      background: var(--primary);
      color: #fff;
    }
  }

  &__empty {
    text-align: center !important;
    padding: 28px 12px !important;
    color: var(--text-soft) !important;
    border-radius: 18px !important;
  }

  &__cards {
    display: none;
    gap: 12px;
  }

  &__item {
    padding: 14px;
    border-radius: 20px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.045);
  }

  &__itemTop {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__mobileCheck {
    min-height: 34px;
    padding: 0 10px;
    font-size: 12px;

    &:has(input:checked) {
      border-color: rgba(180, 51, 37, 0.55);
      box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.08);

      .prizeBox__checkIcon {
        background: var(--primary);
        color: #fff;
      }
    }

    &:has(input:disabled) {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__itemBody {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 12px;
    align-items: start;

    .prizeBox__thumb {
      width: 64px;
      height: 64px;
      border-radius: 18px;
    }
  }

  &__mobileDetailBtn {
    width: 100%;
    min-height: 46px;
    margin-top: 14px;
    border-radius: 999px;
    border: 1px solid var(--primary);
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    background: var(--primary);
    color: #fff;

    font-size: 14px;
    font-weight: 950;
  }

  &__emptyCard {
    min-height: 150px;
    padding: 22px;
    border-radius: 20px;

    display: grid;
    place-items: center;
    text-align: center;

    background: var(--cream);
    border: 1px dashed rgba(180, 51, 37, 0.22);
    color: var(--text-soft);

    svg {
      color: var(--primary);
      font-size: 28px;
      margin-bottom: 8px;
    }

    p {
      margin: 0;
      color: var(--text);
      font-size: 16px;
      font-weight: 950;
    }

    span {
      display: block;
      margin-top: 4px;
      font-size: 13px;
      font-weight: 700;
    }
  }

  &__pagination {
    margin-top: 16px;
  }

  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;

    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;

    background: rgba(32, 23, 19, 0.48);
    backdrop-filter: blur(8px);
  }

  &__dialog {
    width: min(620px, 100%);
    overflow: hidden;
    border-radius: 26px;

    background: #fff;
    border: 1px solid rgba(255, 255, 255, 0.36);
    box-shadow: 0 24px 60px rgba(32, 23, 19, 0.22);
  }

  &__dialogHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;

    padding: 18px;
    border-bottom: 1px solid var(--line);
  }

  &__dialogTitle {
    margin: 0;
    color: var(--text);
    font-size: 20px;
    line-height: 1.3;
    font-weight: 950;
  }

  &__dialogClose {
    width: 38px;
    height: 38px;
    border-radius: 14px;
    border: 1px solid var(--line);
    cursor: pointer;

    display: grid;
    place-items: center;

    background: var(--cream);
    color: var(--text-soft);

    &:hover {
      color: var(--primary);
      border-color: rgba(180, 51, 37, 0.22);
      background: #fff;
    }
  }

  &__dialogBody {
    padding: 18px;
    display: grid;
    gap: 12px;
  }

  &__detailCard {
    padding: 14px;
    border-radius: 20px;

    display: grid;
    grid-template-columns: 120px minmax(0, 1fr);
    gap: 14px;
    align-items: center;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
  }

  &__detailImg {
    width: 120px;
    height: 120px;
    border-radius: 22px;
    border: 1px solid var(--line);
    object-fit: cover;
    background: #f6f1ea;
  }

  &__detailMeta {
    display: grid;
    gap: 8px;
  }

  &__detailName {
    margin: 0;
    color: var(--text);
    font-size: 18px;
    line-height: 1.5;
    font-weight: 950;
  }

  &__detailInfo {
    padding: 14px;
    border-radius: 20px;

    display: grid;
    gap: 10px;

    background: #fff;
    border: 1px solid var(--line);

    p {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin: 0;

      span {
        color: var(--text-soft);
        font-size: 13px;
        font-weight: 900;
      }

      strong {
        color: var(--text);
        font-size: 14px;
        font-weight: 950;
        text-align: right;
      }
    }
  }

  &__bonusText {
    color: var(--primary) !important;
  }

  &__dialogFooter {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;

    padding: 14px 18px 18px;
    border-top: 1px solid var(--line);
  }

  &__dialogBtn {
    min-height: 46px;
    padding: 0 16px;
    font-size: 14px;

    &--ghost {
      background: #fff;
      color: var(--text);
      border-color: var(--line);

      &:hover:not(:disabled) {
        box-shadow: 0 10px 18px rgba(63, 36, 18, 0.06);
      }
    }
  }

  &__spinner {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.42);
    border-top-color: #fff;
    animation: prizeBoxSpin 0.7s linear infinite;
  }

  @media (max-width: 960px) {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__field--keyword,
    &__field--check {
      grid-column: 1 / -1;
    }

    &__checkCard {
      width: 100%;
    }

    &__batchBar {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  @media (max-width: 760px) {
    &__tableWrap {
      display: none;
    }

    &__cards {
      display: grid;
    }
  }

  @media (max-width: 640px) {
    padding-bottom: 20px;

    &__hero {
      border-radius: 0 0 28px 28px;
      margin: -16px -16px 18px;
      padding: 22px 16px 18px;
    }

    &__title {
      font-size: 25px;
    }

    &__subtitle {
      font-size: 13px;
    }

    &__heroCount {
      min-width: 68px;
      min-height: 58px;
      border-radius: 18px;

      strong {
        font-size: 20px;
      }
    }

    &__section {
      border-radius: 22px;
      padding: 15px;
      margin-top: 14px;
    }

    &__sectionHead {
      align-items: flex-start;
    }

    &__sectionTitle {
      font-size: 18px;
    }

    &__count {
      display: none;
    }

    &__grid {
      grid-template-columns: 1fr;
      gap: 13px;
    }

    &__input,
    &__checkCard {
      min-height: 48px;
    }

    &__actions,
    &__batch {
      width: 100%;
      flex-direction: column-reverse;
    }

    &__actionBtn {
      width: 100%;
      min-height: 48px;
    }

    &__selectAll {
      width: 100%;
    }

    &__itemTop {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    &__overlay {
      align-items: flex-end;
      padding: 12px;
    }

    &__dialog {
      border-radius: 26px 26px 22px 22px;
    }

    &__dialogHeader,
    &__dialogBody {
      padding: 16px;
    }

    &__detailCard {
      grid-template-columns: 96px minmax(0, 1fr);
      padding: 12px;
    }

    &__detailImg {
      width: 96px;
      height: 96px;
      border-radius: 18px;
    }

    &__detailName {
      font-size: 16px;
    }

    &__detailInfo {
      padding: 12px;
    }

    &__dialogFooter {
      grid-template-columns: 1fr;
      padding: 14px 16px 16px;
    }

    &__dialogBtn {
      min-height: 48px;

      &--ghost:first-child {
        order: 3;
      }
    }
  }
}

@keyframes prizeBoxSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
