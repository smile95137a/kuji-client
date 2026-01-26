<!-- src/views/member/Notifications.vue -->
<template>
  <section class="notifications">
    <header class="notifications__header">
      <h1 class="notifications__title">通知訊息</h1>
      <p class="notifications__subtitle">查看系統通知、訂單狀態與活動訊息</p>
    </header>

    <!-- 篩選列 -->
    <div class="notifications__card">
      <div class="notifications__toolbar">
        <div class="notifications__left">
          <label class="notifications__check">
            <input type="checkbox" v-model="onlyUnread" />
            <span>只看未讀</span>
          </label>

          <select class="notifications__select" v-model="category">
            <option value="">全部類型</option>
            <option value="SYSTEM">系統</option>
            <option value="ORDER">訂單</option>
            <option value="PROMO">活動</option>
            <option value="PRIZE">獎品</option>
          </select>

          <input
            class="notifications__input"
            type="text"
            placeholder="搜尋標題/內容"
            v-model.trim="keyword"
          />
        </div>

        <div class="notifications__right">
          <button
            class="notifications__btn notifications__btn--ghost"
            type="button"
            @click="markAllRead"
          >
            全部設為已讀
          </button>
          <button class="notifications__btn" type="button" @click="onReset">
            重設
          </button>
        </div>
      </div>
    </div>

    <!-- 列表 -->
    <div class="notifications__card">
      <div class="notifications__resultHeader">
        <p class="notifications__count">
          共 <b>{{ filteredRows.length }}</b> 則
          <span class="notifications__countHint"
            >（未讀 {{ unreadCount }}）</span
          >
        </p>
      </div>

      <!-- Desktop -->
      <div class="notifications__tableWrap">
        <table class="notifications__table">
          <thead>
            <tr>
              <th>狀態</th>
              <th>類型</th>
              <th>標題</th>
              <th>時間</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in pageRows"
              :key="row.id"
              :class="{ 'is-unread': !row.read }"
            >
              <td>
                <span
                  class="notifications__dot"
                  :class="{ 'is-unread': !row.read }"
                ></span>
                <span class="notifications__state">{{
                  row.read ? '已讀' : '未讀'
                }}</span>
              </td>
              <td>
                <span class="notifications__badge">{{
                  categoryLabel(row.category)
                }}</span>
              </td>
              <td class="notifications__titleCell">
                <button
                  class="notifications__link"
                  type="button"
                  @click="openDetail(row)"
                >
                  {{ row.title }}
                </button>
              </td>
              <td>{{ row.createdAt }}</td>
              <td class="notifications__right">
                <button
                  class="notifications__miniBtn"
                  type="button"
                  @click="toggleRead(row)"
                >
                  {{ row.read ? '設未讀' : '設已讀' }}
                </button>
              </td>
            </tr>

            <tr v-if="pageRows.length === 0">
              <td class="notifications__empty" colspan="5">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="notifications__cards">
        <div
          v-for="row in pageRows"
          :key="row.id"
          class="notifications__item"
          :class="{ 'is-unread': !row.read }"
        >
          <div class="notifications__itemTop">
            <div class="notifications__itemLeft">
              <span
                class="notifications__dot"
                :class="{ 'is-unread': !row.read }"
              ></span>
              <span class="notifications__badge">{{
                categoryLabel(row.category)
              }}</span>
              <span class="notifications__time">{{ row.createdAt }}</span>
            </div>

            <button
              class="notifications__miniBtn"
              type="button"
              @click="toggleRead(row)"
            >
              {{ row.read ? '設未讀' : '設已讀' }}
            </button>
          </div>

          <button
            class="notifications__itemTitle"
            type="button"
            @click="openDetail(row)"
          >
            {{ row.title }}
          </button>

          <p class="notifications__itemPreview">{{ row.content }}</p>
        </div>

        <div v-if="pageRows.length === 0" class="notifications__emptyCard">
          查無資料
        </div>
      </div>

      <!-- 分頁 -->
      <div class="notifications__pagination">
        <BasePagination
          v-model:page="page"
          :total-pages="totalPages"
          :max-visible="5"
        />
      </div>
    </div>

    <!-- Detail Dialog -->
    <div
      v-if="detailOpen"
      class="notifications__overlay"
      @click.self="detailOpen = false"
    >
      <div class="notifications__dialog">
        <div class="notifications__dialogHeader">
          <p class="notifications__dialogTitle">通知內容</p>
          <button
            class="notifications__dialogClose"
            type="button"
            @click="detailOpen = false"
          >
            ✕
          </button>
        </div>

        <div v-if="selected" class="notifications__dialogBody">
          <div class="notifications__kv">
            <span class="notifications__k">類型</span>
            <span class="notifications__v">{{
              categoryLabel(selected.category)
            }}</span>
          </div>
          <div class="notifications__kv">
            <span class="notifications__k">時間</span>
            <span class="notifications__v">{{ selected.createdAt }}</span>
          </div>
          <div class="notifications__kv notifications__kv--full">
            <span class="notifications__k">標題</span>
            <span class="notifications__v"
              ><b>{{ selected.title }}</b></span
            >
          </div>
          <div class="notifications__kv notifications__kv--full">
            <span class="notifications__k">內容</span>
            <span class="notifications__v">{{ selected.content }}</span>
          </div>
        </div>

        <div class="notifications__dialogFooter">
          <button
            class="notifications__btn notifications__btn--ghost"
            type="button"
            @click="detailOpen = false"
          >
            關閉
          </button>
          <button
            class="notifications__btn"
            type="button"
            @click="markSelectedRead"
            :disabled="!selected || selected.read"
          >
            設為已讀
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BasePagination from '@/components/common/BasePagination.vue';

type Category = 'SYSTEM' | 'ORDER' | 'PROMO' | 'PRIZE';

type NotificationRow = {
  id: string;
  createdAt: string; // YYYY-MM-DD HH:mm
  category: Category;
  title: string;
  content: string;
  read: boolean;
};

const pageSize = 10;
const page = ref(1);

const onlyUnread = ref(false);
const category = ref<Category | ''>('');
const keyword = ref('');

const COUNT = 76;

const pad = (n: number, len = 2) => String(n).padStart(len, '0');
const toYMDHM = (d: Date) => {
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const buildMockRows = (count: number): NotificationRow[] => {
  const base = new Date();
  const cats: Category[] = ['SYSTEM', 'ORDER', 'PROMO', 'PRIZE'];
  const list: NotificationRow[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setHours(base.getHours() - i * 3); // 每 3 小時一則
    const createdAt = toYMDHM(d);

    const c = cats[Math.floor(Math.random() * cats.length)];
    const read = Math.random() > 0.35; // 約 65% 已讀

    const title =
      c === 'SYSTEM'
        ? `系統通知：安全提醒 #${i + 1}`
        : c === 'ORDER'
        ? `訂單狀態更新：ORD${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
            d.getDate()
          )}${pad(i + 1, 3)}`
        : c === 'PROMO'
        ? `活動快報：限時加碼 ${i % 2 === 0 ? '抽抽券' : '折扣'}`
        : `獎品提醒：你的獎品已${i % 3 === 0 ? '出貨' : '入盒'}！`;

    const content =
      c === 'SYSTEM'
        ? '我們偵測到你的帳號有新的登入行為，若非本人操作請立即修改密碼。'
        : c === 'ORDER'
        ? '你的訂單狀態已更新，請前往訂單頁查看最新進度。'
        : c === 'PROMO'
        ? '活動期間完成指定任務即可獲得額外獎勵，快去看看！'
        : '獎品狀態已更新，你可以到賞品盒查看詳細內容與操作。';

    list.push({
      id: String(i + 1),
      createdAt,
      category: c,
      title,
      content,
      read,
    });
  }

  return list;
};

const rows = ref<NotificationRow[]>(buildMockRows(COUNT));

const filteredRows = computed(() => {
  const kw = keyword.value.toLowerCase();

  return rows.value
    .filter((r) => {
      const okUnread = onlyUnread.value ? !r.read : true;
      const okCat = category.value ? r.category === category.value : true;
      const okKw = kw
        ? r.title.toLowerCase().includes(kw) ||
          r.content.toLowerCase().includes(kw)
        : true;
      return okUnread && okCat && okKw;
    })
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
});

const unreadCount = computed(
  () => filteredRows.value.filter((x) => !x.read).length
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize))
);

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRows.value.slice(start, start + pageSize);
});

watch([onlyUnread, category, keyword], () => {
  page.value = 1;
});

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
  if (page.value < 1) page.value = 1;
});

const categoryLabel = (c: Category) => {
  if (c === 'SYSTEM') return '系統';
  if (c === 'ORDER') return '訂單';
  if (c === 'PROMO') return '活動';
  return '獎品';
};

const onReset = () => {
  onlyUnread.value = false;
  category.value = '';
  keyword.value = '';
  page.value = 1;
};

const toggleRead = (row: NotificationRow) => {
  row.read = !row.read;
};

const markAllRead = () => {
  rows.value.forEach((r) => (r.read = true));
};

const detailOpen = ref(false);
const selected = ref<NotificationRow | null>(null);

const openDetail = (row: NotificationRow) => {
  selected.value = row;
  detailOpen.value = true;

  // 常見 UX：打開就設已讀（你若不要可刪）
  row.read = true;
};

const markSelectedRead = () => {
  if (!selected.value) return;
  selected.value.read = true;
};
</script>

<style scoped lang="scss">
.notifications {
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

  &__toolbar {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__left {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    flex: 1;
    min-width: 280px;
  }

  &__right {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__check {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    user-select: none;
    font-weight: 800;
    opacity: 0.85;
  }

  &__select,
  &__input {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    padding: 10px 12px;
    outline: none;
    background: #fff;
  }

  &__input {
    min-width: 220px;
    flex: 1;
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
    margin-bottom: 10px;
  }
  &__count {
    margin: 0;
    opacity: 0.85;
  }
  &__countHint {
    margin-left: 6px;
    opacity: 0.75;
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
    }

    th {
      opacity: 0.75;
      font-weight: 900;
    }
    tr.is-unread td {
      font-weight: 900;
    }
  }

  &__titleCell {
    white-space: normal;
  }

  &__link {
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 0;
    text-align: left;
    font-weight: inherit;
  }

  &__right {
    text-align: right;
  }

  &__miniBtn {
    border: 1px solid rgba(0, 0, 0, 0.15);
    background: #fff;
    border-radius: 10px;
    padding: 6px 10px;
    cursor: pointer;
    font-weight: 900;
    font-size: 12px;
  }

  &__dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.18);
    margin-right: 8px;

    &.is-unread {
      background: #111;
    }
  }

  &__state {
    opacity: 0.8;
  }

  &__badge {
    display: inline-flex;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    font-size: 12px;
    font-weight: 900;
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

    &.is-unread {
      border-color: rgba(0, 0, 0, 0.22);
    }
  }

  &__itemTop {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    margin-bottom: 8px;
  }

  &__itemLeft {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  &__time {
    font-size: 12px;
    opacity: 0.75;
  }

  &__itemTitle {
    border: 0;
    background: transparent;
    padding: 0;
    text-align: left;
    font-weight: 900;
    font-size: 15px;
    cursor: pointer;
    margin-bottom: 6px;
  }

  &__itemPreview {
    margin: 0;
    opacity: 0.75;
    font-size: 13px;
    line-height: 1.4;
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
    width: min(560px, 100%);
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
    display: grid;
    gap: 10px;
  }

  &__kv {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 10px;
    align-items: baseline;
  }

  &__kv--full {
    grid-template-columns: 90px 1fr;
  }

  &__k {
    opacity: 0.7;
    font-size: 13px;
  }
  &__v {
    font-weight: 800;
  }

  &__dialogFooter {
    padding: 12px 14px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
