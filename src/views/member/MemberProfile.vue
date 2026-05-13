<!-- src/views/member/MemberProfile.vue -->
<template>
  <section class="memberProfile">
    <!-- 加載狀態 -->
    <div v-if="loading" class="memberProfile__loading">
      <p>加載中...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="memberProfile__error">
      <p>❌ {{ error }}</p>
    </div>

    <!-- 成功顯示 -->
    <div v-else-if="user">
      <!-- 頂部卡片：頭像 + 基本資訊 -->
      <div class="memberProfile__topCard">
        <div class="memberProfile__avatarSection">
          <img
            :src="user.avatar || fallbackAvatar"
            :alt="user.nickname"
            class="memberProfile__avatar"
          />
        </div>

        <div class="memberProfile__infoSection">
          <h2 class="memberProfile__nickname">{{ user.nickname }}</h2>
          <p class="memberProfile__email">{{ user.email }}</p>
          <p class="memberProfile__status" :class="statusClass">
            {{ statusLabel }}
          </p>

          <router-link
            :to="{ name: 'ProfileEdit' }"
            class="memberProfile__editBtn"
          >
            編輯資料
          </router-link>
        </div>
      </div>

      <!-- 詳細資訊卡片 -->
      <div class="memberProfile__detailCard">
        <h3 class="memberProfile__sectionTitle">基本資訊</h3>

        <div class="memberProfile__grid">
          <!-- Email -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">電子信箱</label>
            <span class="memberProfile__value">{{ user.email }}</span>
          </div>

          <!-- 暱稱 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">暱稱</label>
            <span class="memberProfile__value">{{ user.nickname }}</span>
          </div>

          <!-- 手機號碼 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">手機號碼</label>
            <span class="memberProfile__value">{{
              user.phoneNumber || '未設定'
            }}</span>
          </div>

          <!-- LINE ID -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">LINE ID</label>
            <span class="memberProfile__value">{{ user.lineId || '未設定' }}</span>
          </div>
        </div>

        <div class="memberProfile__divider"></div>

        <!-- 收件資訊 -->
        <h3 class="memberProfile__sectionTitle">收件資訊</h3>

        <div class="memberProfile__grid">
          <!-- 收件人姓名 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">收件人姓名</label>
            <span class="memberProfile__value">{{
              user.recipientName || '未設定'
            }}</span>
          </div>

          <!-- 收件人電話 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">收件人電話</label>
            <span class="memberProfile__value">{{
              user.recipientPhone || '未設定'
            }}</span>
          </div>

          <!-- 城市 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">城市</label>
            <span class="memberProfile__value">{{ user.city || '未設定' }}</span>
          </div>

          <!-- 行政區 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">行政區</label>
            <span class="memberProfile__value">{{
              user.district || '未設定'
            }}</span>
          </div>

          <!-- 詳細地址 -->
          <div class="memberProfile__row memberProfile__row--fullwidth">
            <label class="memberProfile__label">詳細地址</label>
            <span class="memberProfile__value">{{
              user.addressDetail || '未設定'
            }}</span>
          </div>
        </div>

        <div class="memberProfile__divider"></div>

        <!-- 發票資訊 -->
        <h3 class="memberProfile__sectionTitle">發票資訊</h3>

        <div class="memberProfile__grid">
          <!-- 發票類型 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">發票類型</label>
            <span class="memberProfile__value">{{ invoiceTypeLabel }}</span>
          </div>

          <!-- Email（如果是 EMAIL） -->
          <div v-if="user.invoiceType === 'EMAIL'" class="memberProfile__row">
            <label class="memberProfile__label">發票 Email</label>
            <span class="memberProfile__value">{{
              user.invoiceEmail || '未設定'
            }}</span>
          </div>

          <!-- 載具號碼（如果是 CARRIER） -->
          <div
            v-if="user.invoiceType === 'CARRIER'"
            class="memberProfile__row"
          >
            <label class="memberProfile__label">載具號碼</label>
            <span class="memberProfile__value">{{
              user.carrierCode || '未設定'
            }}</span>
          </div>
        </div>

        <div class="memberProfile__divider"></div>

        <!-- 賬戶資訊 -->
        <h3 class="memberProfile__sectionTitle">賬戶資訊</h3>

        <div class="memberProfile__grid">
          <!-- 帳號來源 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">帳號來源</label>
            <span class="memberProfile__value">{{ providerLabel }}</span>
          </div>

          <!-- Email 驗證狀態 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">Email 驗證</label>
            <span class="memberProfile__value" :class="emailVerifiedClass">
              {{ emailVerifiedLabel }}
            </span>
          </div>

          <!-- 加入日期 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">加入日期</label>
            <span class="memberProfile__value">{{ formatDate(user.createdAt) }}</span>
          </div>

          <!-- 最後登入時間 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">最後登入</label>
            <span class="memberProfile__value">{{
              formatDate(user.lastLoginAt)
            }}</span>
          </div>

          <!-- 總儲值 -->
          <div class="memberProfile__row">
            <label class="memberProfile__label">總儲值金額</label>
            <span class="memberProfile__value">
              NT${{ formatNumber(user.totalRecharged) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="memberProfile__empty">
      <p>無法加載使用者資訊</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { useMemberWalletStore } from '@/stores/memberWallet';

interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  provider: string;
  phoneNumber?: string;
  lineId?: string;
  recipientName?: string;
  recipientPhone?: string;
  city?: string;
  district?: string;
  addressDetail?: string;
  invoiceType: string;
  invoiceEmail?: string;
  carrierCode?: string;
  status: string;
  emailVerified: number;
  lastLoginAt?: string;
  createdAt?: string;
  totalRecharged: number;
  goldCoins: number;
  bonusCoins: number;
}

const loading = ref(true);
const error = ref('');
const user = ref<User | null>(null);

const fallbackAvatar =
  'https://via.placeholder.com/150?text=Avatar';

const store = useMemberWalletStore();

const statusClass = computed(() => {
  return user.value?.status === 'ACTIVE'
    ? 'memberProfile__status--active'
    : 'memberProfile__status--inactive';
});

const statusLabel = computed(() => {
  return user.value?.status === 'ACTIVE' ? '✓ 啟用中' : '⊘ 已停用';
});

const invoiceTypeLabel = computed(() => {
  const type = user.value?.invoiceType;
  return type === 'CARRIER'
    ? '行動載具'
    : type === 'EMAIL'
      ? '電子發票'
      : type || '未設定';
});

const providerLabel = computed(() => {
  const provider = user.value?.provider;
  return provider === 'GOOGLE'
    ? 'Google'
    : provider === 'LINE'
      ? 'LINE'
      : provider === 'EMAIL'
        ? '信箱註冊'
        : provider || '未知';
});

const emailVerifiedClass = computed(() => {
  return user.value?.emailVerified
    ? 'memberProfile__value--verified'
    : 'memberProfile__value--unverified';
});

const emailVerifiedLabel = computed(() => {
  return user.value?.emailVerified ? '✓ 已驗證' : '⊘ 未驗證';
});

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '未設定';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-TW').format(num);
};

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';

    // 嘗試從 inject 取得 me 資訊（MemberCenter 提供）
    const injectedMe = inject<User>('memberMe', null);
    if (injectedMe) {
      user.value = injectedMe;
    } else {
      // 如果沒有 inject，從 store 取得
      await store.loadMe();
      user.value = store.me;
    }

    if (!user.value) {
      error.value = '無法載入使用者資訊，請稍後重試';
    }
  } catch (err) {
    error.value = `載入失敗: ${err instanceof Error ? err.message : '未知錯誤'}`;
    console.error('❌ 載入會員資訊失敗:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.memberProfile {
  width: 100%;

  &__loading,
  &__error,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    font-size: 18px;
    color: #888;
  }

  &__error {
    color: #d32f2f;
    background: #ffebee;
    border-radius: 8px;
    padding: 32px;
  }

  /* 頂部卡片 */
  &__topCard {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 24px;
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: white;
    margin-bottom: 24px;
  }

  &__avatarSection {
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  &__avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &__infoSection {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8px 0;
  }

  &__nickname {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  &__email {
    font-size: 14px;
    margin: 0 0 8px 0;
    opacity: 0.9;
  }

  &__status {
    font-size: 14px;
    margin: 0 0 16px 0;
    display: inline-block;
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    width: fit-content;

    &--active {
      background: rgba(76, 175, 80, 0.3);
    }

    &--inactive {
      background: rgba(244, 67, 54, 0.3);
    }
  }

  &__editBtn {
    display: inline-block;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.25);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    width: fit-content;

    &:hover {
      background: rgba(255, 255, 255, 0.35);
      transform: translateY(-2px);
    }
  }

  /* 詳細資訊卡片 */
  &__detailCard {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &__sectionTitle {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 16px 0;
    color: #333;
    padding-bottom: 8px;
    border-bottom: 2px solid #667eea;
    display: inline-block;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__row {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &--fullwidth {
      grid-column: 1 / -1;
    }
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__value {
    font-size: 16px;
    color: #333;
    line-height: 1.5;
    word-break: break-word;

    &--verified {
      color: #4caf50;
      font-weight: 600;
    }

    &--unverified {
      color: #f44336;
      font-weight: 600;
    }
  }

  &__divider {
    height: 1px;
    background: #e0e0e0;
    margin: 24px 0;
  }
}
</style>
