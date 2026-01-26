<!-- src/views/member/PrizeBox.vue -->
<template>
  <section class="prizeBox">
    <header class="prizeBox__header">
      <h1 class="prizeBox__title">賞品盒</h1>
      <p class="prizeBox__subtitle">
        管理你抽到的獎品：查看、出貨、兌換或轉贈（示範版）
      </p>
    </header>

    <!-- 篩選 -->
    <div class="prizeBox__card">
      <form class="prizeBox__form" @submit.prevent="onSearch">
        <div class="prizeBox__grid">
          <div class="prizeBox__field">
            <label class="prizeBox__label">狀態</label>
            <select class="prizeBox__input" v-model="status">
              <option value="">全部</option>
              <option value="IN_BOX">在盒中</option>
              <option value="SHIPPING">出貨中</option>
              <option value="DELIVERED">已送達</option>
              <option value="REDEEMED">已兌換</option>
            </select>
          </div>

          <div class="prizeBox__field">
            <label class="prizeBox__label">系列</label>
            <select class="prizeBox__input" v-model="series">
              <option value="">全部</option>
              <option v-for="s in seriesOptions" :key="s" :value="s">
                {{ s }}
              </option>
            </select>
          </div>

          <div class="prizeBox__field">
            <label class="prizeBox__label">關鍵字</label>
            <input
              class="prizeBox__input"
              type="text"
              placeholder="搜尋獎品名稱/編號"
              v-model.trim="keyword"
            />
          </div>

          <div class="prizeBox__field prizeBox__field--check">
            <label class="prizeBox__check">
              <input type="checkbox" v-model="onlyUnshipped" />
              <span>只看未出貨</span>
            </label>
          </div>
        </div>

        <div class="prizeBox__actions">
          <button
            class="prizeBox__btn prizeBox__btn--ghost"
            type="button"
            @click="onReset"
          >
            重設
          </button>
          <button class="prizeBox__btn" type="submit">查詢</button>
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
            :disabled="checkedIds.size === 0"
            @click="batchShip"
          >
            批次出貨（示範）
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
              <th>系列</th>
              <th>取得時間</th>
              <th>狀態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pageRows" :key="row.id">
              <td>
                <input
                  type="checkbox"
                  :checked="checkedIds.has(row.id)"
                  @change="
                    toggleOne(
                      row.id,
                      ($event.target as HTMLInputElement).checked
                    )
                  "
                />
              </td>
              <td>
                <div class="prizeBox__prizeCell">
                  <img class="prizeBox__thumb" :src="row.image" alt="thumb" />
                  <div class="prizeBox__prizeMeta">
                    <p class="prizeBox__prizeName">{{ row.name }}</p>
                    <p class="prizeBox__prizeId">{{ row.prizeNo }}</p>
                  </div>
                </div>
              </td>
              <td>{{ row.series }}</td>
              <td>{{ row.createdAt }}</td>
              <td>
                <span class="prizeBox__badge" :class="badgeClass(row.status)">{{
                  statusLabel(row.status)
                }}</span>
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

            <tr v-if="pageRows.length === 0">
              <td class="prizeBox__empty" colspan="6">查無資料</td>
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
                @change="
                  toggleOne(row.id, ($event.target as HTMLInputElement).checked)
                "
              />
              <span>選取</span>
            </label>

            <span class="prizeBox__badge" :class="badgeClass(row.status)">{{
              statusLabel(row.status)
            }}</span>
          </div>

          <div class="prizeBox__itemBody">
            <img class="prizeBox__thumb" :src="row.image" alt="thumb" />
            <div class="prizeBox__prizeMeta">
              <p class="prizeBox__prizeName">{{ row.name }}</p>
              <p class="prizeBox__prizeId">{{ row.prizeNo }}</p>
              <p class="prizeBox__mini">系列：{{ row.series }}</p>
              <p class="prizeBox__mini">取得：{{ row.createdAt }}</p>
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

        <div v-if="pageRows.length === 0" class="prizeBox__emptyCard">
          查無資料
        </div>
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
            <img class="prizeBox__detailImg" :src="selected.image" alt="img" />
            <div class="prizeBox__detailMeta">
              <p class="prizeBox__detailName">{{ selected.name }}</p>
              <p class="prizeBox__detailId">{{ selected.prizeNo }}</p>
              <p class="prizeBox__mini">系列：{{ selected.series }}</p>
              <p class="prizeBox__mini">取得時間：{{ selected.createdAt }}</p>
              <p class="prizeBox__mini">
                狀態：
                <span
                  class="prizeBox__badge"
                  :class="badgeClass(selected.status)"
                >
                  {{ statusLabel(selected.status) }}
                </span>
              </p>
            </div>
          </div>

          <div class="prizeBox__divider"></div>

          <div class="prizeBox__detailActions">
            <button
              class="prizeBox__btn"
              type="button"
              :disabled="selected.status !== 'IN_BOX'"
              @click="shipOne(selected)"
            >
              申請出貨（示範）
            </button>
            <button
              class="prizeBox__btn prizeBox__btn--ghost"
              type="button"
              @click="detailOpen = false"
            >
              關閉
            </button>
          </div>

          <p class="prizeBox__tip">
            ※ 這是示範畫面：出貨會把狀態改成「出貨中」，你接 API
            後把邏輯替換即可。
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BasePagination from '@/components/common/BasePagination.vue';

type PrizeStatus = 'IN_BOX' | 'SHIPPING' | 'DELIVERED' | 'REDEEMED';

type PrizeRow = {
  id: string;
  createdAt: string; // YYYY-MM-DD
  prizeNo: string;
  name: string;
  series: string;
  status: PrizeStatus;
  image: string;
};

const pageSize = 10;
const page = ref(1);

const status = ref<PrizeStatus | ''>('');
const series = ref('');
const keyword = ref('');
const onlyUnshipped = ref(false);

const COUNT = 78;

const pad = (n: number, len = 4) => String(n).padStart(len, '0');
const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const placeholderImg =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
    <rect width="100%" height="100%" fill="#f2f2f2"/>
    <rect x="36" y="36" width="168" height="168" rx="18" fill="#e2e2e2"/>
    <text x="50%" y="54%" text-anchor="middle" font-family="Arial" font-size="18" fill="#8a8a8a">Prize</text>
  </svg>
`);

const seriesOptions = ref<string[]>([
  '航海王',
  '咒術迴戰',
  '鬼滅之刃',
  '寶可夢',
  '三麗鷗',
  '鋼彈',
]);

const buildMockRows = (count: number): PrizeRow[] => {
  const base = new Date();
  const list: PrizeRow[] = [];

  const statusPool: PrizeStatus[] = [
    'IN_BOX',
    'IN_BOX',
    'IN_BOX',
    'SHIPPING',
    'DELIVERED',
    'REDEEMED',
  ];

  const namePool = [
    'A賞 大型公仔',
    'B賞 立體模型',
    'C賞 毛巾',
    'D賞 徽章套組',
    'E賞 壓克力立牌',
    'F賞 文件夾組',
    '最後賞 特別版公仔',
  ];

  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);

    const createdAt = toYMD(d);
    const prizeNo = `PZ${createdAt}${pad(i + 1, 4)}`;
    const s = seriesOptions.value[i % seriesOptions.value.length];
    const st = statusPool[Math.floor(Math.random() * statusPool.length)];
    const nm = namePool[i % namePool.length];

    list.push({
      id: String(i + 1),
      createdAt,
      prizeNo,
      name: `${nm} #${(i % 30) + 1}`,
      series: s,
      status: st,
      image: placeholderImg,
    });
  }

  return list;
};

const rows = ref<PrizeRow[]>(buildMockRows(COUNT));

const filteredRows = computed(() => {
  const kw = keyword.value.toLowerCase();

  return rows.value
    .filter((r) => {
      const okStatus = status.value ? r.status === status.value : true;
      const okSeries = series.value ? r.series === series.value : true;
      const okKw = kw
        ? r.name.toLowerCase().includes(kw) ||
          r.prizeNo.toLowerCase().includes(kw)
        : true;

      const okUnshipped = onlyUnshipped.value ? r.status === 'IN_BOX' : true;

      return okStatus && okSeries && okKw && okUnshipped;
    })
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize))
);

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRows.value.slice(start, start + pageSize);
});

watch([status, series, keyword, onlyUnshipped], () => {
  page.value = 1;
  checkedIds.value = new Set(); // 清掉勾選
});

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
  if (page.value < 1) page.value = 1;
});

const onSearch = () => {
  // 前端 computed 篩選，按鈕可留著之後接 API
};

const onReset = () => {
  status.value = '';
  series.value = '';
  keyword.value = '';
  onlyUnshipped.value = false;
  page.value = 1;
  checkedIds.value = new Set();
};

const statusLabel = (s: PrizeStatus) => {
  if (s === 'IN_BOX') return '在盒中';
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
  return pageRows.value.every((r) => checkedIds.value.has(r.id));
});

const toggleAll = (checked: boolean) => {
  const next = new Set(checkedIds.value);
  pageRows.value.forEach((r) => {
    if (checked) next.add(r.id);
    else next.delete(r.id);
  });
  checkedIds.value = next;
};

/** Detail */
const detailOpen = ref(false);
const selected = ref<PrizeRow | null>(null);

const openDetail = (row: PrizeRow) => {
  selected.value = row;
  detailOpen.value = true;
};

/** 示範：出貨 */
const shipOne = (row: PrizeRow) => {
  if (row.status !== 'IN_BOX') return;
  row.status = 'SHIPPING';
};

const batchShip = () => {
  const ids = checkedIds.value;
  rows.value.forEach((r) => {
    if (ids.has(r.id) && r.status === 'IN_BOX') {
      r.status = 'SHIPPING';
    }
  });
  checkedIds.value = new Set();
};
</script>

<style scoped lang="scss">
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
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
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
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
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
