<!-- src/views/member/PrizeBox.vue -->
<template>
  <section class="prizeBox">
    <header class="prizeBox__header">
      <h1 class="prizeBox__title">賞品盒</h1>
      <p class="prizeBox__subtitle">
        查看您抽到的賞品，支援篩選、配送申請與可回收獎品處理。
      </p>
    </header>

    <div class="prizeBox__card">
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

          <div class="prizeBox__field">
            <label class="prizeBox__label">關鍵字</label>
            <input
              class="prizeBox__input"
              type="text"
              placeholder="搜尋賞品名稱、商品名稱或店家"
              v-model.trim="keyword"
            />
          </div>

          <div class="prizeBox__field prizeBox__field--check">
            <label class="prizeBox__check">
              <input type="checkbox" v-model="onlyUnshipped" />
              <span>只看可申請配送的賞品</span>
            </label>
          </div>
        </div>

        <div class="prizeBox__actions">
          <button
            class="prizeBox__btn prizeBox__btn--ghost"
            type="button"
            @click="onReset"
            :disabled="loading"
          >
            重設
          </button>
          <button class="prizeBox__btn" type="submit" :disabled="loading">
            {{ loading ? '查詢中...' : '查詢' }}
          </button>
        </div>
      </form>
    </div>

    <div class="prizeBox__card">
      <div class="prizeBox__resultHeader">
        <p class="prizeBox__count">
          共 <b>{{ displayCount }}</b> 筆
        </p>

        <div class="prizeBox__batch">
          <button
            class="prizeBox__btn prizeBox__btn--ghost"
            type="button"
            :disabled="loading || checkedIds.size === 0"
            @click="batchShip"
          >
            批次申請配送
          </button>

          <button
            class="prizeBox__btn prizeBox__btn--ghost"
            type="button"
            :disabled="loading || checkedIds.size === 0"
            @click="batchRecycle"
          >
            批次回收
          </button>
        </div>
      </div>

      <div class="prizeBox__tableWrap">
        <table class="prizeBox__table">
          <thead>
            <tr>
              <th style="width: 42px">
                <input
                  type="checkbox"
                  :checked="allChecked"
                  @change="
                    toggleAll(($event.target as HTMLInputElement).checked)
                  "
                />
              </th>
              <th>賞品</th>
              <th>商品</th>
              <th>店家</th>
              <th>入盒時間</th>
              <th>狀態</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in pageRows" :key="row.id">
              <td>
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
                <span class="prizeBox__badge" :class="badgeClass(row.status)">
                  {{ row.statusName || statusLabel(row.status) }}
                </span>
              </td>

              <td class="prizeBox__right">
                <button
                  class="prizeBox__link"
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
        <div v-for="row in pageRows" :key="row.id" class="prizeBox__item">
          <div class="prizeBox__itemTop">
            <label class="prizeBox__check">
              <input
                type="checkbox"
                :checked="checkedIds.has(row.id)"
                :disabled="row.status !== 'IN_BOX'"
                @change="
                  toggleOne(row.id, ($event.target as HTMLInputElement).checked)
                "
              />
              <span>選取</span>
            </label>

            <span class="prizeBox__badge" :class="badgeClass(row.status)">
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
            class="prizeBox__link prizeBox__link--full"
            type="button"
            @click="openDetail(row)"
          >
            查看詳情
          </button>
        </div>

        <div
          v-if="!loading && pageRows.length === 0"
          class="prizeBox__emptyCard"
        >
          目前沒有符合條件的賞品
        </div>
        <div v-if="loading" class="prizeBox__emptyCard">載入中...</div>
      </div>

      <div class="prizeBox__pagination">
        <BasePagination
          v-model:page="page"
          :total-pages="totalPages"
          :max-visible="5"
        />
      </div>
    </div>

    <div
      v-if="detailOpen"
      class="prizeBox__overlay"
      @click.self="detailOpen = false"
    >
      <div class="prizeBox__dialog">
        <div class="prizeBox__dialogHeader">
          <p class="prizeBox__dialogTitle">賞品詳情</p>
          <button
            class="prizeBox__dialogClose"
            type="button"
            @click="detailOpen = false"
          >
            關閉
          </button>
        </div>

        <div v-if="selected" class="prizeBox__dialogBody">
          <div class="prizeBox__detailTop">
            <img
              class="prizeBox__detailImg"
              :src="selected.prizeImageUrl"
              alt="img"
            />
            <div class="prizeBox__detailMeta">
              <p class="prizeBox__detailName">
                {{ selected.prizeName }}
                <span v-if="selected.prizeLevel" class="prizeBox__mini">
                  （{{ formatPrizeLevel(selected.prizeLevel) }}）
                </span>
              </p>

              <p class="prizeBox__detailId">{{ selected.id }}</p>
              <p class="prizeBox__mini">
                商品：{{ selected.lotteryTitle || '-' }}
              </p>
              <p class="prizeBox__mini">
                店家：{{ selected.storeName || '-' }}
              </p>
              <p class="prizeBox__mini">
                入盒時間：{{ formatDate(selected.createdAt) }}
              </p>

              <p class="prizeBox__mini">
                狀態：
                <span
                  class="prizeBox__badge"
                  :class="badgeClass(selected.status)"
                >
                  {{ selected.statusName || statusLabel(selected.status) }}
                </span>
              </p>

              <p v-if="selected.isRecyclable" class="prizeBox__mini">
                可回收，回饋 +{{ selected.recycleBonus }} 蝦幣
              </p>
            </div>
          </div>

          <div class="prizeBox__divider"></div>

          <div class="prizeBox__detailActions">
            <button
              class="prizeBox__btn"
              type="button"
              :disabled="loading || selected.status !== 'IN_BOX'"
              @click="shipOne(selected)"
            >
              申請配送
            </button>

            <button
              class="prizeBox__btn prizeBox__btn--ghost"
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
              class="prizeBox__btn prizeBox__btn--ghost"
              type="button"
              @click="detailOpen = false"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

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

// 蝭拚璇辣嚗I嚗?
const status = ref<PrizeStatus | ''>('');
const lotteryTitle = ref('');
const keyword = ref('');
const onlyUnshipped = ref(false);

const rows = ref<any[]>([]);
const loading = ref(false);
const serverTotal = ref(0);
const serverTotalPages = ref(1);

/** ?? options嚗? API ?嚗?*/
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

/** 雿?API ??撠望摰 list嚗?蝡臬??祟??*/
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

/** ========== API ========== */
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

/** ========== ?箄疏 Dialog ========== */
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
  // 敺垢?桀?瘝? query/filter endpoint嚗?隞仿ㄐ撠勗?唬?甈⊥??啗???
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

/** ========== helpers ========== */
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

/** ?暸 */
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

/** Detail */
const detailOpen = ref(false);
const selected = ref(null);

const openDetail = (row) => {
  selected.value = row;
  detailOpen.value = true;
};

const shipOne = async (row) => {
  if (row.status !== 'IN_BOX') return;
  openShipDialog([row.id]);
};

const recycleOne = async (row) => {
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
/* 雿??祉? SCSS 摰靽? */
.prizeBox {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 16px;

  &__header {
    margin-bottom: 16px;
  }
  &__title {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 6px;
  }
  &__subtitle {
    margin: 0;
    opacity: 0.7;
  }

  &__card {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 16px;
    background: #fff;
    margin-top: 12px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 880px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 520px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__field--check {
    display: flex;
    align-items: end;
  }

  &__label {
    display: block;
    font-size: 13px;
    opacity: 0.75;
    margin-bottom: 6px;
  }

  &__input {
    width: 100%;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    padding: 11px 12px;
    outline: none;
    background: #fff;
  }

  &__check {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    user-select: none;
    font-weight: 900;
    opacity: 0.85;
    padding-bottom: 6px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  &__batch {
    display: flex;
    gap: 10px;
  }
  &__btn {
    border: 0;
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 900;
    cursor: pointer;
    background: #111;
    color: #fff;

    &--ghost {
      background: transparent;
      color: #111;
      border: 1px solid rgba(0, 0, 0, 0.15);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__resultHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;

    @media (max-width: 520px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__count {
    margin: 0;
    opacity: 0.85;
  }

  &__tableWrap {
    overflow-x: auto;
    @media (max-width: 760px) {
      display: none;
    }
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th,
    td {
      text-align: left;
      padding: 12px 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      white-space: nowrap;
      vertical-align: middle;
    }

    th {
      opacity: 0.75;
      font-weight: 900;
    }
  }

  &__prizeCell {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 280px;
  }
  &__thumb {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    object-fit: cover;
    background: #f6f6f6;
  }
  &__prizeMeta {
    display: grid;
    gap: 2px;
  }
  &__prizeName {
    margin: 0;
    font-weight: 900;
  }
  &__prizeId {
    margin: 0;
    font-size: 12px;
    opacity: 0.75;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
  }

  &__right {
    text-align: right;
  }

  &__link {
    border: 0;
    background: transparent;
    cursor: pointer;
    font-weight: 900;
    padding: 6px 8px;

    &--full {
      width: 100%;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 12px;
      padding: 10px 12px;
      margin-top: 10px;
    }
  }

  &__badge {
    display: inline-flex;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    font-size: 12px;
    font-weight: 900;

    &.is-inbox {
    }
    &.is-shipping {
    }
    &.is-delivered {
    }
    &.is-redeemed {
    }
  }

  &__empty {
    text-align: center;
    padding: 22px 10px;
    opacity: 0.65;
  }

  &__cards {
    display: none;
    gap: 10px;
    @media (max-width: 760px) {
      display: grid;
    }
  }

  &__item {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 12px;
  }

  &__itemTop {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  &__itemBody {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 10px;
    align-items: center;
  }

  &__mini {
    margin: 0;
    font-size: 12px;
    opacity: 0.75;
  }

  &__emptyCard {
    border: 1px dashed rgba(0, 0, 0, 0.15);
    border-radius: 14px;
    padding: 18px;
    text-align: center;
    opacity: 0.65;
  }

  &__pagination {
    margin-top: 14px;
  }

  /* dialog */
  &__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    z-index: 50;
  }

  &__dialog {
    width: min(620px, 100%);
    background: #fff;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  &__dialogHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__dialogTitle {
    margin: 0;
    font-weight: 900;
  }

  &__dialogClose {
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    padding: 6px 8px;
  }

  &__dialogBody {
    padding: 14px;
  }

  &__detailTop {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 12px;
    align-items: center;

    @media (max-width: 520px) {
      grid-template-columns: 96px 1fr;
    }
  }

  &__detailImg {
    width: 110px;
    height: 110px;
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    object-fit: cover;
    background: #f6f6f6;
  }

  &__detailMeta {
    display: grid;
    gap: 4px;
  }

  &__detailName {
    margin: 0;
    font-weight: 900;
    font-size: 18px;
  }
  &__detailId {
    margin: 0;
    font-size: 12px;
    opacity: 0.75;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
  }

  &__divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.06);
    margin: 14px 0;
  }

  &__detailActions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__tip {
    margin: 10px 0 0;
    font-size: 12px;
    opacity: 0.7;
    text-align: center;
  }
}
</style>
