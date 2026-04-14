<template>
  <div class="myReferralCard">
    <!-- Header -->
    <div class="myReferralCard__header">
      <h3 class="myReferralCard__title">我的推薦碼</h3>
      <p class="myReferralCard__subtitle">分享給朋友，雙方各獲得紅利獎勵</p>
    </div>

    <!-- Code display -->
    <div class="myReferralCard__codeBox" v-if="myCode">
      <span class="myReferralCard__code">{{ myCode.code }}</span>
      <button
        class="myReferralCard__copyBtn"
        type="button"
        :class="{ 'myReferralCard__copyBtn--copied': copied }"
        @click="copyCode"
      >
        <span v-if="!copied">複製</span>
        <span v-else>已複製 ✓</span>
      </button>
    </div>

    <button
      v-if="!myCode"
      class="myReferralCard__generateBtn"
      type="button"
      :disabled="isLoading"
      @click="generateCode"
    >
      <span v-if="isLoading" class="myReferralCard__spinner"></span>
      <span v-else>產生我的推薦碼</span>
    </button>

    <!-- Status badges -->
    <div class="myReferralCard__badges" v-if="myCode">
      <span
        class="myReferralCard__badge"
        :class="myCode.isActive ? 'myReferralCard__badge--active' : 'myReferralCard__badge--inactive'"
      >
        {{ myCode.isActive ? '啟用中' : '已停用' }}
      </span>
      <span class="myReferralCard__badge myReferralCard__badge--info">
        已使用 {{ myCode.usedCount }} 次
        <template v-if="myCode.maxUsage !== null"> / {{ myCode.maxUsage }}</template>
      </span>
      <span v-if="myCode.expiresAt" class="myReferralCard__badge myReferralCard__badge--warn">
        到期：{{ formatExpiry(myCode.expiresAt) }}
      </span>
    </div>

    <!-- Stats -->
    <div class="myReferralCard__stats" v-if="stats">
      <div class="myReferralCard__statItem">
        <span class="myReferralCard__statValue">{{ stats.totalReferrals }}</span>
        <span class="myReferralCard__statLabel">邀請人數</span>
      </div>
      <div class="myReferralCard__statItem">
        <span class="myReferralCard__statValue">{{ stats.totalBonusEarned }}</span>
        <span class="myReferralCard__statLabel">累積紅利</span>
      </div>
    </div>

    <!-- Recent referrals -->
    <ul class="myReferralCard__recent" v-if="stats?.recentReferrals?.length">
      <li
        v-for="(r, i) in stats.recentReferrals"
        :key="i"
        class="myReferralCard__recentItem"
      >
        <span class="myReferralCard__recentNick">{{ r.nickname }}</span>
        <span class="myReferralCard__recentDate">{{ formatDate(r.joinedAt) }}</span>
      </li>
    </ul>

    <p v-if="error" class="myReferralCard__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useReferral } from '@/composables/useReferral';

const { myCode, stats, isLoading, error, generateCode, loadStats } = useReferral();
const copied = ref(false);

onMounted(async () => {
  await loadStats();
});

async function copyCode() {
  if (!myCode.value?.code) return;
  try {
    await navigator.clipboard.writeText(myCode.value.code);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // fallback
    const el = document.createElement('textarea');
    el.value = myCode.value.code;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('zh-TW');
  } catch {
    return iso;
  }
}

function formatExpiry(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('zh-TW');
  } catch {
    return iso;
  }
}
</script>

<style scoped>
.myReferralCard {
  background: var(--card-bg, #1a1a2e);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.myReferralCard__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.myReferralCard__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.myReferralCard__subtitle {
  font-size: 0.813rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.myReferralCard__codeBox {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 14px 16px;
}

.myReferralCard__code {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #ffd700;
}

.myReferralCard__copyBtn {
  flex-shrink: 0;
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.5);
  background: transparent;
  color: #ffd700;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.myReferralCard__copyBtn:hover {
  background: rgba(255, 215, 0, 0.1);
}

.myReferralCard__copyBtn--copied {
  border-color: #4caf50;
  color: #4caf50;
}

.myReferralCard__generateBtn {
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #6c63ff, #9b59b6);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.myReferralCard__generateBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.myReferralCard__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.myReferralCard__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.myReferralCard__badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.myReferralCard__badge--active {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.myReferralCard__badge--inactive {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.myReferralCard__badge--info {
  background: rgba(33, 150, 243, 0.15);
  color: #64b5f6;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.myReferralCard__badge--warn {
  background: rgba(255, 152, 0, 0.15);
  color: #ffb74d;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.myReferralCard__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.myReferralCard__statItem {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.myReferralCard__statValue {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffd700;
}

.myReferralCard__statLabel {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.myReferralCard__recent {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.myReferralCard__recentItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  font-size: 0.875rem;
}

.myReferralCard__recentNick {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.myReferralCard__recentDate {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
}

.myReferralCard__error {
  color: #f44336;
  font-size: 0.875rem;
  margin: 0;
}
</style>
