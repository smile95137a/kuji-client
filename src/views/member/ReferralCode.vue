<template>
  <section class="referralPage">
    <div class="referralPage__hero">
      <div class="referralPage__heroBg"></div>

      <div class="referralPage__heroTop">
        <div>
          <p class="referralPage__badge">REFERRAL CODE</p>
          <h1 class="referralPage__title">推薦碼</h1>
          <p class="referralPage__subtitle">
            邀請好友一起玩，雙方都可以獲得紅利獎勵。
          </p>
        </div>

        <div class="referralPage__heroIcon">
          <font-awesome-icon :icon="['fas', 'gift']" />
        </div>
      </div>
    </div>

    <div class="referralPage__section">
      <div class="referralPage__sectionHead">
        <div>
          <p class="referralPage__sectionKicker">MY REFERRAL</p>
          <h2 class="referralPage__sectionTitle">我的推薦碼</h2>
        </div>
      </div>

      <div v-if="myCode" class="referralPage__codeBox">
        <div>
          <p class="referralPage__codeLabel">推薦碼</p>
          <p class="referralPage__code referralPage__mono">
            {{ myCode.code }}
          </p>
        </div>

        <button
          class="referralPage__copyBtn"
          type="button"
          :class="{ 'referralPage__copyBtn--copied': copied }"
          @click="copyCode"
        >
          <font-awesome-icon :icon="['fas', copied ? 'check' : 'copy']" />
          {{ copied ? '已複製' : '複製' }}
        </button>
      </div>

      <button
        v-else
        class="referralPage__mainBtn"
        type="button"
        :disabled="isLoading"
        @click="generateCode"
      >
        <span v-if="isLoading" class="referralPage__spinner"></span>

        <template v-else>
          <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" />
          產生我的推薦碼
        </template>
      </button>

      <div v-if="myCode" class="referralPage__badges">
        <span
          class="referralPage__statusBadge"
          :class="myCode.isActive ? 'is-active' : 'is-inactive'"
        >
          {{ myCode.isActive ? '啟用中' : '已停用' }}
        </span>

        <span class="referralPage__statusBadge is-info">
          已使用 {{ myCode.usedCount }} 次
          <template v-if="myCode.maxUsage !== null">
            / {{ myCode.maxUsage }}
          </template>
        </span>

        <span v-if="myCode.expiresAt" class="referralPage__statusBadge is-warn">
          到期：{{ formatExpiry(myCode.expiresAt) }}
        </span>
      </div>

      <div v-if="stats" class="referralPage__statsGrid">
        <div class="referralPage__statCard">
          <span class="referralPage__statIcon">
            <font-awesome-icon :icon="['fas', 'user-group']" />
          </span>

          <div>
            <p class="referralPage__statValue">
              {{ stats.totalReferrals }}
            </p>
            <p class="referralPage__statLabel">邀請人數</p>
          </div>
        </div>

        <div class="referralPage__statCard">
          <span class="referralPage__statIcon referralPage__statIcon--bonus">
            <font-awesome-icon :icon="['fas', 'gem']" />
          </span>

          <div>
            <p class="referralPage__statValue">
              {{ stats.totalBonusEarned }}
            </p>
            <p class="referralPage__statLabel">累積紅利</p>
          </div>
        </div>
      </div>

      <div
        v-if="stats?.recentReferrals?.length"
        class="referralPage__recentBox"
      >
        <div class="referralPage__recentHead">
          <p class="referralPage__recentTitle">近期邀請</p>
        </div>

        <div class="referralPage__recentList">
          <div
            v-for="(r, i) in stats.recentReferrals"
            :key="i"
            class="referralPage__recentItem"
          >
            <div>
              <p class="referralPage__recentNick">
                {{ r.nickname }}
              </p>
              <p class="referralPage__recentDate">
                {{ formatDate(r.joinedAt) }}
              </p>
            </div>

            <span class="referralPage__recentIcon">
              <font-awesome-icon :icon="['fas', 'user-plus']" />
            </span>
          </div>
        </div>
      </div>

      <p v-if="error" class="referralPage__error">
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
        <span>{{ error }}</span>
      </p>
    </div>

    <div v-if="canApplyReferral" class="referralPage__section">
      <div class="referralPage__sectionHead">
        <div>
          <p class="referralPage__sectionKicker">APPLY CODE</p>
          <h2 class="referralPage__sectionTitle">套用推薦碼</h2>
          <p class="referralPage__sectionDesc">
            輸入朋友的推薦碼，雙方各獲得紅利獎勵，每人限一次。
          </p>
        </div>
      </div>

      <div v-if="applied" class="referralPage__successBox">
        <span class="referralPage__successIcon">
          <font-awesome-icon :icon="['fas', 'check']" />
        </span>

        <div>
          <p class="referralPage__successTitle">推薦碼已套用成功</p>
          <p class="referralPage__successDesc">紅利獎勵會依活動規則發送。</p>
        </div>
      </div>

      <template v-else>
        <div class="referralPage__inputWrap">
          <input
            v-model="codeInput"
            class="referralPage__input"
            :class="{
              'referralPage__input--valid': validator.isValid.value === true,
              'referralPage__input--invalid': validator.isValid.value === false,
            }"
            type="text"
            placeholder="輸入推薦碼，例：KUJI-ABCD"
            maxlength="20"
            :disabled="isSubmitting"
            @input="onInput"
          />

          <span
            v-if="validator.isValidating.value"
            class="referralPage__inputSpinner"
          ></span>
        </div>

        <p
          v-if="validator.isValid.value === true"
          class="referralPage__hint referralPage__hint--ok"
        >
          <font-awesome-icon :icon="['fas', 'circle-check']" />
          推薦人：{{ validator.ownerName.value }}，套用後雙方各得紅利
        </p>

        <p
          v-if="validator.validationError.value"
          class="referralPage__hint referralPage__hint--err"
        >
          <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
          {{ validator.validationError.value }}
        </p>

        <p v-if="applyError" class="referralPage__hint referralPage__hint--err">
          <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
          {{ applyError }}
        </p>

        <button
          class="referralPage__mainBtn"
          type="button"
          :disabled="validator.isValid.value !== true || isSubmitting"
          @click="onApply"
        >
          <span v-if="isSubmitting" class="referralPage__spinner"></span>

          <template v-else>
            <font-awesome-icon :icon="['fas', 'ticket']" />
            套用推薦碼
          </template>
        </button>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useReferral } from '@/composables/useReferral';
import { useReferralCodeValidator } from '@/composables/useReferralCodeValidator';

const {
  myCode,
  stats,
  isLoading,
  error,
  generateCode,
  loadStats,
  applyCode,
  canApplyReferral,
} = useReferral();

const validator = useReferralCodeValidator();

const copied = ref(false);
const codeInput = ref('');
const isSubmitting = ref(false);
const applyError = ref<string | null>(null);
const applied = ref(false);

onMounted(async () => {
  await loadStats();
});

async function copyCode() {
  if (!myCode.value?.code) return;

  try {
    await navigator.clipboard.writeText(myCode.value.code);
  } catch {
    const el = document.createElement('textarea');
    el.value = myCode.value.code;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

function onInput() {
  applyError.value = null;
  validator.validate(codeInput.value);
}

async function onApply() {
  if (validator.isValid.value !== true) return;

  isSubmitting.value = true;
  applyError.value = null;

  try {
    const ok = await applyCode(codeInput.value.trim());

    if (ok) {
      applied.value = true;
    } else {
      applyError.value = '套用失敗，請稍後再試';
    }
  } catch (e: any) {
    applyError.value = e?.message ?? '套用失敗，請稍後再試';
  } finally {
    isSubmitting.value = false;
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

<style scoped lang="scss">
.referralPage {
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

  &__heroIcon {
    width: 54px;
    height: 54px;
    border-radius: 18px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.24);
    backdrop-filter: blur(12px);

    color: #fff6d9;
    font-size: 22px;
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

  &__sectionDesc {
    margin: 6px 0 0;
    color: var(--text-soft);
    font-size: 13px;
    line-height: 1.6;
    font-weight: 700;
  }

  &__codeBox {
    padding: 14px;
    border-radius: 20px;

    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
  }

  &__codeLabel {
    margin: 0 0 6px;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 900;
  }

  &__code {
    margin: 0;
    color: var(--primary);
    font-size: 26px;
    line-height: 1.15;
    font-weight: 950;
    letter-spacing: 2px;
    word-break: break-word;
  }

  &__mono {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
  }

  &__copyBtn,
  &__mainBtn {
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
      box-shadow 0.16s ease,
      opacity 0.16s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 12px 20px rgba(180, 51, 37, 0.18);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__copyBtn {
    min-height: 40px;
    padding: 0 15px;

    &--copied {
      background: #2e7d32;
      border-color: #2e7d32;
    }
  }

  &__mainBtn {
    width: 100%;
    min-height: 48px;
    padding: 0 18px;
    margin-top: 14px;
  }

  &__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
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

    &.is-active {
      background: rgba(46, 125, 50, 0.1);
      color: #2e7d32;
      border-color: rgba(46, 125, 50, 0.16);
    }

    &.is-inactive {
      background: rgba(180, 35, 24, 0.1);
      color: #b42318;
      border-color: rgba(180, 35, 24, 0.16);
    }

    &.is-info {
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      border-color: rgba(37, 99, 235, 0.16);
    }

    &.is-warn {
      background: rgba(245, 158, 11, 0.12);
      color: #a16207;
      border-color: rgba(245, 158, 11, 0.2);
    }
  }

  &__statsGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }

  &__statCard {
    min-height: 82px;
    padding: 14px;
    border-radius: 18px;

    display: flex;
    align-items: center;
    gap: 12px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
  }

  &__statIcon {
    width: 46px;
    height: 46px;
    border-radius: 16px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: var(--primary-soft);
    color: var(--primary);

    font-size: 18px;

    &--bonus {
      background: rgba(245, 158, 11, 0.12);
      color: #b76b04;
    }
  }

  &__statValue {
    margin: 0;
    color: var(--text);
    font-size: 24px;
    line-height: 1.1;
    font-weight: 950;
  }

  &__statLabel {
    margin: 5px 0 0;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 900;
  }

  &__recentBox {
    margin-top: 14px;
    padding: 14px;
    border-radius: 20px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
  }

  &__recentHead {
    margin-bottom: 10px;
  }

  &__recentTitle {
    margin: 0;
    color: var(--text);
    font-size: 15px;
    font-weight: 950;
  }

  &__recentList {
    display: grid;
    gap: 10px;
  }

  &__recentItem {
    padding: 12px;
    border-radius: 16px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    background: #fff;
    border: 1px solid var(--line);
  }

  &__recentNick {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    font-weight: 950;
  }

  &__recentDate {
    margin: 4px 0 0;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 800;
  }

  &__recentIcon {
    width: 34px;
    height: 34px;
    border-radius: 13px;

    display: grid;
    place-items: center;

    background: var(--primary-soft);
    color: var(--primary);
    flex: 0 0 auto;
  }

  &__inputWrap {
    position: relative;
  }

  &__input {
    width: 100%;
    min-height: 48px;
    padding: 0 44px 0 14px;
    border-radius: 16px;

    background: #fff;
    border: 1px solid var(--line);
    color: var(--text);
    outline: none;

    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.8px;
    box-sizing: border-box;

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

    &--valid {
      border-color: rgba(46, 125, 50, 0.5);
      box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.08);
    }

    &--invalid {
      border-color: rgba(180, 35, 24, 0.62);
      box-shadow: 0 0 0 4px rgba(180, 35, 24, 0.08);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__inputSpinner {
    position: absolute;
    right: 15px;
    top: 50%;

    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(180, 51, 37, 0.2);
    border-top-color: var(--primary);

    transform: translateY(-50%);
    animation: referralSpin 0.7s linear infinite;
  }

  &__hint,
  &__error {
    display: flex;
    align-items: flex-start;
    gap: 7px;

    margin: 10px 0 0;
    padding: 11px 12px;
    border-radius: 16px;

    font-size: 13px;
    line-height: 1.5;
    font-weight: 900;
  }

  &__hint--ok {
    background: rgba(46, 125, 50, 0.08);
    color: #2e7d32;
    border: 1px solid rgba(46, 125, 50, 0.12);
  }

  &__hint--err,
  &__error {
    background: rgba(180, 35, 24, 0.08);
    color: #b42318;
    border: 1px solid rgba(180, 35, 24, 0.12);
  }

  &__successBox {
    padding: 14px;
    border-radius: 20px;

    display: grid;
    grid-template-columns: 46px minmax(0, 1fr);
    gap: 12px;
    align-items: center;

    background: linear-gradient(180deg, rgba(46, 125, 50, 0.08), #ffffff);
    border: 1px solid rgba(46, 125, 50, 0.16);
  }

  &__successIcon {
    width: 46px;
    height: 46px;
    border-radius: 16px;

    display: grid;
    place-items: center;

    background: #fff;
    color: #2e7d32;
    box-shadow: 0 8px 16px rgba(63, 36, 18, 0.06);
  }

  &__successTitle {
    margin: 0;
    color: var(--text);
    font-size: 15px;
    font-weight: 950;
  }

  &__successDesc {
    margin: 5px 0 0;
    color: var(--text-soft);
    font-size: 13px;
    line-height: 1.5;
    font-weight: 700;
  }

  &__spinner {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.42);
    border-top-color: #fff;
    animation: referralSpin 0.7s linear infinite;
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

    &__heroIcon {
      width: 44px;
      height: 44px;
      border-radius: 16px;
      font-size: 18px;
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

    &__codeBox {
      grid-template-columns: 1fr;
      border-radius: 18px;
    }

    &__copyBtn,
    &__mainBtn {
      width: 100%;
      min-height: 48px;
    }

    &__code {
      font-size: 22px;
    }

    &__statsGrid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    &__statCard {
      min-height: 76px;
      padding: 13px;
      border-radius: 18px;
    }

    &__recentItem {
      align-items: flex-start;
    }

    &__successBox {
      grid-template-columns: 42px minmax(0, 1fr);
      padding: 13px;
      border-radius: 18px;
    }

    &__successIcon {
      width: 42px;
      height: 42px;
      border-radius: 15px;
    }
  }
}

@keyframes referralSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
