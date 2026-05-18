<!-- src/views/member/Notifications.vue -->
<template>
  <section class="notifications">
    <!-- Hero：主要一個就好 -->
    <div class="notifications__hero">
      <div class="notifications__heroBg"></div>

      <div class="notifications__heroTop">
        <div>
          <p class="notifications__badge">NOTIFICATIONS</p>
          <h1 class="notifications__title">通知訊息</h1>
          <p class="notifications__subtitle">
            查看系統通知、訂單狀態與活動訊息。
          </p>
        </div>

        <div class="notifications__heroCount">
          <span>未讀</span>
          <strong>{{ unreadCount }}</strong>
          <span>則</span>
        </div>
      </div>
    </div>

    <!-- 篩選列 -->
    <div class="notifications__section">
      <div class="notifications__sectionHead">
        <div>
          <p class="notifications__sectionKicker">SEARCH FILTER</p>
          <h2 class="notifications__sectionTitle">篩選條件</h2>
        </div>
      </div>

      <div class="notifications__toolbar">
        <label
          class="notifications__checkCard"
          :class="{ 'notifications__checkCard--active': onlyUnread }"
        >
          <input type="checkbox" v-model="onlyUnread" />
          <span class="notifications__checkIcon">
            <font-awesome-icon :icon="['fas', 'check']" />
          </span>
          <span class="notifications__checkText">只看未讀</span>
        </label>

        <div class="notifications__field">
          <label class="notifications__label">通知類型</label>
          <select class="notifications__input" v-model="category">
            <option value="">全部類型</option>
            <option value="SYSTEM">系統</option>
            <option value="ORDER">訂單</option>
            <option value="PROMO">活動</option>
            <option value="PRIZE">獎品</option>
          </select>
        </div>

        <div class="notifications__field notifications__field--keyword">
          <label class="notifications__label">關鍵字</label>
          <input
            class="notifications__input"
            type="text"
            placeholder="搜尋標題或內容"
            v-model.trim="keyword"
          />
        </div>
      </div>

      <div class="notifications__actions">
        <button
          class="notifications__actionBtn notifications__actionBtn--ghost"
          type="button"
          @click="onReset"
        >
          重設
        </button>

        <button
          class="notifications__actionBtn"
          type="button"
          @click="markAllRead"
        >
          <font-awesome-icon :icon="['fas', 'check-double']" />
          全部設為已讀
        </button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="notifications__section">
      <div class="notifications__sectionHead">
        <div>
          <p class="notifications__sectionKicker">MESSAGE LIST</p>
          <h2 class="notifications__sectionTitle">通知列表</h2>
        </div>

        <p class="notifications__count">
          共 <b>{{ filteredRows.length }}</b> 則
          <span>未讀 {{ unreadCount }}</span>
        </p>
      </div>

      <!-- Desktop Table -->
      <div class="notifications__tableWrap">
        <table class="notifications__table">
          <thead>
            <tr>
              <th>狀態</th>
              <th>類型</th>
              <th>標題</th>
              <th>時間</th>
              <th class="notifications__thAction">操作</th>
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
                <span class="notifications__state">
                  {{ row.read ? '已讀' : '未讀' }}
                </span>
              </td>

              <td>
                <span
                  class="notifications__typeBadge"
                  :class="`is-${row.category.toLowerCase()}`"
                >
                  {{ categoryLabel(row.category) }}
                </span>
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

              <td class="notifications__tdAction">
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
        <article
          v-for="row in pageRows"
          :key="row.id"
          class="notifications__item"
          :class="{ 'notifications__item--unread': !row.read }"
        >
          <div class="notifications__itemTop">
            <div class="notifications__itemMeta">
              <span
                class="notifications__dot"
                :class="{ 'is-unread': !row.read }"
              ></span>

              <span
                class="notifications__typeBadge"
                :class="`is-${row.category.toLowerCase()}`"
              >
                {{ categoryLabel(row.category) }}
              </span>
            </div>

            <span class="notifications__time">{{ row.createdAt }}</span>
          </div>

          <button
            class="notifications__itemTitle"
            type="button"
            @click="openDetail(row)"
          >
            {{ row.title }}
          </button>

          <p class="notifications__itemPreview">{{ row.content }}</p>

          <div class="notifications__itemFooter">
            <span class="notifications__readState">
              {{ row.read ? '已讀' : '未讀' }}
            </span>

            <button
              class="notifications__miniBtn"
              type="button"
              @click="toggleRead(row)"
            >
              {{ row.read ? '設未讀' : '設已讀' }}
            </button>
          </div>
        </article>

        <div v-if="pageRows.length === 0" class="notifications__emptyCard">
          <font-awesome-icon :icon="['fas', 'bell-slash']" />
          <p>查無資料</p>
          <span>可以調整篩選條件再試一次。</span>
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
    <Teleport to="body">
      <div
        v-if="detailOpen"
        class="notifications__overlay"
        @click.self="detailOpen = false"
      >
        <div class="notifications__dialog">
          <div class="notifications__dialogHeader">
            <div>
              <p class="notifications__sectionKicker">MESSAGE DETAIL</p>
              <h3 class="notifications__dialogTitle">通知內容</h3>
            </div>

            <button
              class="notifications__dialogClose"
              type="button"
              @click="detailOpen = false"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </button>
          </div>

          <div v-if="selected" class="notifications__dialogBody">
            <div class="notifications__dialogMeta">
              <span
                class="notifications__typeBadge"
                :class="`is-${selected.category.toLowerCase()}`"
              >
                {{ categoryLabel(selected.category) }}
              </span>

              <span class="notifications__dialogTime">
                {{ selected.createdAt }}
              </span>
            </div>

            <div class="notifications__messageCard">
              <p class="notifications__messageLabel">標題</p>
              <h4 class="notifications__messageTitle">
                {{ selected.title }}
              </h4>

              <p class="notifications__messageLabel">內容</p>
              <p class="notifications__messageContent">
                {{ selected.content }}
              </p>
            </div>
          </div>

          <div class="notifications__dialogFooter">
            <button
              class="notifications__dialogBtn notifications__dialogBtn--ghost"
              type="button"
              @click="detailOpen = false"
            >
              關閉
            </button>

            <button
              class="notifications__dialogBtn"
              type="button"
              @click="markSelectedRead"
              :disabled="!selected || selected.read"
            >
              設為已讀
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BasePagination from '@/components/common/BasePagination.vue';

type Category = 'SYSTEM' | 'ORDER' | 'PROMO' | 'PRIZE';

type NotificationRow = {
  id: string;
  createdAt: string;
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
    d.setHours(base.getHours() - i * 3);

    const createdAt = toYMDHM(d);
    const c = cats[Math.floor(Math.random() * cats.length)];
    const read = Math.random() > 0.35;

    const title =
      c === 'SYSTEM'
        ? `系統通知：安全提醒 #${i + 1}`
        : c === 'ORDER'
          ? `訂單狀態更新：ORD${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
              d.getDate(),
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
  () => filteredRows.value.filter((x) => !x.read).length,
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize)),
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
  row.read = true;
};

const markSelectedRead = () => {
  if (!selected.value) return;
  selected.value.read = true;
};
</script>

<style scoped lang="scss">
.notifications {
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

  &__toolbar {
    display: grid;
    grid-template-columns: auto 180px minmax(0, 1fr);
    gap: 12px;
    align-items: end;
  }

  &__checkCard {
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

      .notifications__checkIcon {
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
  }

  &__checkText {
    white-space: nowrap;
  }

  &__field {
    min-width: 0;

    &--keyword {
      min-width: 220px;
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

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 14px;
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

    span {
      margin-left: 6px;
    }
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

      &:first-child {
        border-left: 1px solid rgba(180, 51, 37, 0.08);
        border-radius: 18px 0 0 18px;
      }

      &:last-child {
        border-right: 1px solid rgba(180, 51, 37, 0.08);
        border-radius: 0 18px 18px 0;
      }
    }

    tr.is-unread td {
      font-weight: 950;
      background: #fff4e7;
    }
  }

  &__thAction,
  &__tdAction {
    text-align: right;
  }

  &__titleCell {
    white-space: normal !important;
    min-width: 240px;
  }

  &__link {
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 0;

    color: var(--text);
    text-align: left;
    font-weight: inherit;

    &:hover {
      color: var(--primary);
    }
  }

  &__dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    margin-right: 8px;

    background: rgba(32, 23, 19, 0.18);

    &.is-unread {
      background: var(--primary);
      box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.1);
    }
  }

  &__state {
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 900;
  }

  &__typeBadge {
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

    &.is-system {
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      border-color: rgba(37, 99, 235, 0.16);
    }

    &.is-order {
      background: rgba(46, 125, 50, 0.1);
      color: #2e7d32;
      border-color: rgba(46, 125, 50, 0.16);
    }

    &.is-promo {
      background: rgba(245, 158, 11, 0.12);
      color: #a16207;
      border-color: rgba(245, 158, 11, 0.2);
    }

    &.is-prize {
      background: rgba(180, 51, 37, 0.1);
      color: var(--primary);
      border-color: rgba(180, 51, 37, 0.16);
    }
  }

  &__miniBtn {
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

    &--unread {
      border-color: rgba(180, 51, 37, 0.28);
      box-shadow:
        0 0 0 4px rgba(180, 51, 37, 0.08),
        0 10px 20px rgba(63, 36, 18, 0.045);
    }
  }

  &__itemTop {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__itemMeta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .notifications__dot {
      margin-right: 0;
    }
  }

  &__time {
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
  }

  &__itemTitle {
    width: 100%;
    border: 0;
    background: transparent;
    padding: 0;
    margin: 0;

    color: var(--text);
    text-align: left;
    font-size: 15px;
    line-height: 1.45;
    font-weight: 950;
    cursor: pointer;
  }

  &__itemPreview {
    margin: 8px 0 0;
    color: var(--text-soft);
    font-size: 13px;
    line-height: 1.55;
    font-weight: 700;
  }

  &__itemFooter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }

  &__readState {
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 900;
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

  /* dialog */
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
    width: min(520px, 100%);
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

  &__dialogMeta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__dialogTime {
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 800;
  }

  &__messageCard {
    padding: 14px;
    border-radius: 20px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
  }

  &__messageLabel {
    margin: 0 0 6px;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 900;
  }

  &__messageTitle {
    margin: 0 0 14px;
    color: var(--text);
    font-size: 17px;
    line-height: 1.5;
    font-weight: 950;
  }

  &__messageContent {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    line-height: 1.7;
    font-weight: 800;
  }

  &__dialogFooter {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    padding: 14px 18px 18px;
    border-top: 1px solid var(--line);
  }

  @media (max-width: 900px) {
    &__toolbar {
      grid-template-columns: 1fr 1fr;
    }

    &__checkCard,
    &__field--keyword {
      grid-column: 1 / -1;
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

    &__toolbar {
      grid-template-columns: 1fr;
      gap: 13px;
    }

    &__checkCard,
    &__input {
      min-height: 48px;
    }

    &__actions {
      flex-direction: column-reverse;
    }

    &__actionBtn {
      width: 100%;
      min-height: 48px;
    }

    &__itemTop {
      flex-direction: column;
      gap: 8px;
    }

    &__time {
      white-space: normal;
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

    &__dialogMeta {
      flex-direction: column;
      align-items: flex-start;
    }

    &__dialogFooter {
      grid-template-columns: 1fr;
      padding: 14px 16px 16px;
    }

    &__dialogBtn {
      min-height: 48px;

      &--ghost {
        order: 2;
      }
    }
  }
}
</style>
