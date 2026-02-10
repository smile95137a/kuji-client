<!-- src/views/member/PrizeBox.vue -->
<template>
  <section class="prizeBox">
    <header class="prizeBox__header">
      <h1 class="prizeBox__title">賞品盒</h1>
      <p class="prizeBox__subtitle">管理你抽到的獎品：查看、出貨、兌換或轉贈</p>
    </header>

    <!-- 篩選 -->
    <div class="prizeBox__card">
      <form class="prizeBox__form" @submit.prevent="onSearch">
        <div class="prizeBox__grid">
          <div class="prizeBox__field">
            <label class="prizeBox__label">狀態</label>
            <select class="prizeBox__input" v-model="status">
              <option value="">全部</option>
              <option value="IN_BOX">在賞品盒中</option>
              <option value="SHIPPING">出貨中</option>
              <option value="DELIVERED">已送達</option>
              <option value="REDEEMED">已兌換</option>
            </select>
          </div>

          <div class="prizeBox__field">
            <label class="prizeBox__label">系列 / 抽獎</label>
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
              placeholder="搜尋獎品名稱/門市/活動名稱"
              v-model.trim="keyword"
            />
          </div>

          <div class="prizeBox__field prizeBox__field--check">
            <label class="prizeBox__check">
              <input type="checkbox" v-model="onlyUnshipped" />
              <span>只看未出貨（在盒中）</span>
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
            {{ loading ? '查詢中…' : '查詢' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 列表 -->
    <div class="prizeBox__card">
      <div class="prizeBox__resultHeader">
        <p class="prizeBox__count">
          共 <b>{{ filteredRows.length }}</b> 件
        </p>

        <div class="prizeBox__batch">
          <button
            class="prizeBox__btn prizeBox__btn--ghost"
            type="button"
            :disabled="loading || checkedIds.size === 0"
            @click="batchShip"
          >
            批次出貨
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

      <!-- Desktop -->
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
              <th>獎品</th>
              <th>商品</th>
              <th>門市</th>
              <th>取得時間</th>
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

              <!-- prize -->
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
                        （{{ row.prizeLevel }}賞）
                      </span>
                    </p>

                    <p v-if="row.isRecyclable" class="prizeBox__mini">
                      可回收：+{{ row.recycleBonus }} 紅利
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
              <td class="prizeBox__empty" colspan="7">查無資料</td>
            </tr>
            <tr v-if="loading">
              <td class="prizeBox__empty" colspan="7">載入中…</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
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
                  （{{ row.prizeLevel }}賞）
                </span>
              </p>

              <p class="prizeBox__prizeId">{{ row.id }}</p>

              <p class="prizeBox__mini">活動：{{ row.lotteryTitle || '-' }}</p>
              <p class="prizeBox__mini">門市：{{ row.storeName || '-' }}</p>
              <p class="prizeBox__mini">
                取得：{{ formatDate(row.createdAt) }}
              </p>

              <p v-if="row.isRecyclable" class="prizeBox__mini">
                可回收：+{{ row.recycleBonus }} 紅利
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
          查無資料
        </div>
        <div v-if="loading" class="prizeBox__emptyCard">載入中…</div>
      </div>

      <!-- 分頁 -->
      <div class="prizeBox__pagination">
        <BasePagination
          v-model:page="page"
          :total-pages="totalPages"
          :max-visible="5"
        />
      </div>
    </div>

    <!-- Detail dialog -->
    <div
      v-if="detailOpen"
      class="prizeBox__overlay"
      @click.self="detailOpen = false"
    >
      <div class="prizeBox__dialog">
        <div class="prizeBox__dialogHeader">
          <p class="prizeBox__dialogTitle">獎品詳情</p>
          <button
            class="prizeBox__dialogClose"
            type="button"
            @click="detailOpen = false"
          >
            ✕
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
                  （{{ selected.prizeLevel }}賞）
                </span>
              </p>

              <p class="prizeBox__detailId">{{ selected.id }}</p>

              <p class="prizeBox__mini">
                活動：{{ selected.lotteryTitle || '-' }}
              </p>
              <p class="prizeBox__mini">
                門市：{{ selected.storeName || '-' }}
              </p>
              <p class="prizeBox__mini">
                取得時間：{{ formatDate(selected.createdAt) }}
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
                可回收：+{{ selected.recycleBonus }} 紅利
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
              申請出貨
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
              回收換紅利
            </button>

            <button
              class="prizeBox__btn prizeBox__btn--ghost"
              type="button"
              @click="detailOpen = false"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BasePagination from '@/components/common/BasePagination.vue';

import {
  getMyPrizeBox,
  shipPrizeBoxItems,
  recyclePrizeBoxItems,
} from '@/services/prizeBoxService';

import { executeApi } from '@/utils/executeApiUtils';
import { useMemberWalletStore } from '@/stores/memberWallet';

const walletStore = useMemberWalletStore();

type PrizeStatus = 'IN_BOX' | 'SHIPPING' | 'DELIVERED' | 'REDEEMED';

const pageSize = 10;
const page = ref(1);

// 篩選條件（UI）
const status = ref<PrizeStatus | ''>('');
const lotteryTitle = ref('');
const keyword = ref('');
const onlyUnshipped = ref(false);

const rows = ref<any[]>([]);
const loading = ref(false);

/** 動態 options（從 API 反推） */
const lotteryTitleOptions = computed(() => {
  const set = new Set<string>();
  rows.value.forEach((r) => {
    if (r.lotteryTitle) set.add(r.lotteryTitle);
  });
  return Array.from(set);
});

/** 你 API 回來就是完整 list，前端再做篩選 */
const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase();

  return rows.value
    .filter((r) => {
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
    })
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize)),
);

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRows.value.slice(start, start + pageSize);
});

watch([status, lotteryTitle, keyword, onlyUnshipped], () => {
  page.value = 1;
  checkedIds.value = new Set();
});

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
  if (page.value < 1) page.value = 1;
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

const loadPrizeBox = async () => {
  loading.value = true;

  await executeApi<any>({
    fn: () => getMyPrizeBox(),
    onSuccess: (raw) => {
      const data = raw?.data?.data ?? raw?.data ?? raw;
      const list = Array.isArray(data) ? data : [];

      rows.value = list.map(mapRow);
    },
    onFinal: () => {
      loading.value = false;
    },
  });
};

const shipByIds = async (ids: string[]) => {
  if (!ids.length) return;

  loading.value = true;

  await executeApi<any>({
    fn: () => shipPrizeBoxItems({ prizeBoxIds: ids }),
    onSuccess: () => {
      // 最穩：直接 reload，確保狀態與後端一致
      checkedIds.value = new Set();
      detailOpen.value = false;
      loadPrizeBox();
    },
    onFinal: () => {
      loading.value = false;
    },
  });
};

const recycleByIds = async (ids: string[]) => {
  if (!ids.length) return;

  loading.value = true;

  await executeApi<any>({
    fn: () => recyclePrizeBoxItems({ prizeBoxIds: ids }),
    showSuccessDialog: true,
    showFailDialog: true,
    successTitle: '回收成功',
    successMessage: '已將獎品回收並轉換為紅利，錢包已更新。',
    errorTitle: '回收失敗',
    errorMessage: '回收未完成，請稍後再試。',
    onSuccess: async () => {
      await walletStore.loadMe();

      checkedIds.value = new Set();
      detailOpen.value = false;
      await loadPrizeBox();
    },
    onFinal: () => {
      loading.value = false;
    },
  });
};

const onSearch = async () => {
  page.value = 1;
  // 後端目前沒有 query/filter endpoint，所以這裡就刷新一次最新資料
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
  if (s === 'IN_BOX') return '在賞品盒中';
  if (s === 'SHIPPING') return '出貨中';
  if (s === 'DELIVERED') return '已送達';
  return '已兌換';
};

const badgeClass = (s: PrizeStatus) => ({
  'is-inbox': s === 'IN_BOX',
  'is-shipping': s === 'SHIPPING',
  'is-delivered': s === 'DELIVERED',
  'is-redeemed': s === 'REDEEMED',
});

/** 勾選 */
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
  await shipByIds([row.id]);
};

const recycleOne = async (row) => {
  if (row.status !== 'IN_BOX') return;
  if (!row.isRecyclable) return;
  await recycleByIds([row.id]);
};

const batchShip = async () => {
  const ids = Array.from(checkedIds.value);
  await shipByIds(ids);
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
/* 你原本的 SCSS 完全保留 */
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
