<template>
  <section class="ichibanNotice">
    <div class="ichibanNotice__inner">
      <div class="ichibanNotice__content">
        <article class="ichibanNotice__rulesCard">
          <div class="ichibanNotice__sectionHead">
            <span class="ichibanNotice__sectionBadge">RULES</span>

            <div>
              <h3 class="ichibanNotice__sectionTitle">遊戲說明</h3>
              <p class="ichibanNotice__sectionDesc">
                抽選前請先確認玩法與帶抽規則，系統會依目前開局狀態、保護期與票券可用性進行判定。
              </p>
            </div>
          </div>

          <div class="ichibanNotice__rules">
            <div class="ichibanNotice__rule">
              <span class="ichibanNotice__ruleNo">01</span>
              <p>每次抽選都會即時扣除對應金額，若抽中獎項，結果會同步寫入你的紀錄與獎箱。</p>
            </div>

            <div class="ichibanNotice__rule">
              <span class="ichibanNotice__ruleNo">02</span>
              <p>若該玩法有開局者保護期，其他玩家需待保護期結束後，才可接續參與同一場遊戲。</p>
            </div>

            <div class="ichibanNotice__rule">
              <span class="ichibanNotice__ruleNo">03</span>
              <p>若為帶抽或指定位置玩法，請依頁面提示完成操作；未完成指定時，系統會暫時限制後續抽選。</p>
            </div>
          </div>
        </article>

        <article class="ichibanNotice__bonusCard">
          <div class="ichibanNotice__sectionHead ichibanNotice__sectionHead--row">
            <div>
              <span class="ichibanNotice__sectionBadge">BONUS</span>
              <h3 class="ichibanNotice__sectionTitle">{{ resolvedNotice.bonusTitle }}</h3>
              <p class="ichibanNotice__sectionDesc">
                {{ resolvedNotice.bonusDescription }}
              </p>
            </div>

            <div class="ichibanNotice__protect">
              <p class="ichibanNotice__protectTitle">{{ resolvedNotice.protectionTitle }}</p>
              <p>{{ resolvedNotice.protectionDescription }}</p>
            </div>
          </div>

          <div class="ichibanNotice__bonusGrid">
            <div
              v-for="item in resolvedNotice.bonusTiers"
              :key="`${item.drawCount}-${item.bonus}`"
              class="ichibanNotice__bonusItem"
            >
              <span>一次 {{ item.drawCount }} 抽</span>
              <strong>紅利 {{ item.bonus }}</strong>
            </div>
          </div>
        </article>
      </div>

      <aside class="ichibanNotice__brand">
        <div class="ichibanNotice__brandGlow"></div>

        <div class="ichibanNotice__brandContent">
          <p class="ichibanNotice__eyebrow">STARO NOTICE</p>

          <div class="ichibanNotice__logo">
            <img :src="ichibanNoticeLogo" alt="STARO" />
          </div>

          <div class="ichibanNotice__brandText">
            <h2>客服提醒</h2>
            <p>若你對抽選結果、訂單處理或帶抽流程有疑問，請透過官方 LINE 聯繫客服，我們會協助你確認。</p>
          </div>

          <button class="ichibanNotice__lineBtn" type="button">
            <span class="ichibanNotice__lineIcon">
              <img :src="lineLogo" alt="" />
            </span>
            <span>加入 LINE 官方客服</span>
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ichibanNoticeLogo from '@/assets/image/login_logo.png';
import lineLogo from '@/assets/image/line.svg';
import type { LotteryNoticeConfig } from '@/services/lotteryBrowseService';

const props = defineProps<{
  noticeConfig?: LotteryNoticeConfig | null;
}>();

const resolvedNotice = computed<LotteryNoticeConfig>(() => ({
  bonusTitle: props.noticeConfig?.bonusTitle || '多抽優惠',
  bonusDescription:
    props.noticeConfig?.bonusDescription || '現貨在倉，限定帶抽才會贈送。',
  protectionTitle: props.noticeConfig?.protectionTitle || '保護期說明',
  protectionDescription:
    props.noticeConfig?.protectionDescription ||
    '單抽保護 300 秒，多抽為 300 秒＋（30 秒 × 抽數），上限 600 秒。',
  bonusTiers:
    props.noticeConfig?.bonusTiers?.length
      ? props.noticeConfig.bonusTiers
      : [
          { drawCount: 3, bonus: 60 },
          { drawCount: 5, bonus: 120 },
          { drawCount: 8, bonus: 180 },
          { drawCount: 10, bonus: 240 },
        ],
}));
</script>

<style scoped lang="scss">
.ichibanNotice {
  margin-top: 28px;
  color: #241610;

  --primary: #b43325;
  --primary-dark: #3f2412;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --gold: #e4aa43;
  --gold-soft: rgba(228, 170, 67, 0.18);
  --cream: #fff8ef;
  --text: #241610;
  --text-soft: rgba(36, 22, 16, 0.58);
  --line: rgba(63, 36, 18, 0.1);
  --line-strong: rgba(63, 36, 18, 0.16);
}

.ichibanNotice__inner {
  overflow: hidden;
  padding: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 18px;
  border-radius: 34px;
  background:
    radial-gradient(circle at 92% 8%, rgba(180, 51, 37, 0.08), transparent 34%),
    linear-gradient(180deg, #fff8ef 0%, #ffffff 68%);
  border: 1px solid var(--line);
  box-shadow: 0 26px 70px rgba(63, 36, 18, 0.12);
}

.ichibanNotice__content {
  display: grid;
  grid-template-rows: auto auto;
  gap: 18px;
}

.ichibanNotice__rulesCard,
.ichibanNotice__bonusCard {
  position: relative;
  overflow: hidden;
  padding: 26px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--line);
  box-shadow: 0 14px 32px rgba(63, 36, 18, 0.055);
}

.ichibanNotice__rulesCard {
  background:
    radial-gradient(circle at 100% 0%, rgba(180, 51, 37, 0.07), transparent 34%),
    rgba(255, 255, 255, 0.92);
}

.ichibanNotice__bonusCard {
  background:
    radial-gradient(circle at 100% 0%, rgba(228, 170, 67, 0.18), transparent 34%),
    rgba(255, 255, 255, 0.92);
}

.ichibanNotice__sectionHead {
  margin-bottom: 20px;
  display: grid;
  gap: 12px;

  &--row {
    grid-template-columns: minmax(0, 0.82fr) minmax(280px, 0.58fr);
    align-items: start;
    gap: 18px;
  }
}

.ichibanNotice__sectionBadge {
  width: fit-content;
  min-height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 1.4px;
}

.ichibanNotice__sectionTitle {
  margin: 0;
  color: var(--text);
  font-size: 25px;
  line-height: 1.25;
  font-weight: 950;
  letter-spacing: 1px;
}

.ichibanNotice__sectionDesc {
  margin: 7px 0 0;
  color: var(--text-soft);
  font-size: 14px;
  line-height: 1.65;
  font-weight: 800;
}

.ichibanNotice__rules {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.ichibanNotice__rule {
  padding: 15px;
  border-radius: 20px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 13px;
  align-items: flex-start;
  background: var(--cream);
  border: 1px solid var(--line);

  p {
    margin: 0;
  }
}

.ichibanNotice__ruleNo {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(180, 51, 37, 0.12);
  color: var(--primary);
  font-size: 13px;
  font-weight: 950;
}

.ichibanNotice__protect {
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(36, 22, 16, 0.05);
  border: 1px solid var(--line);
  color: var(--text);
  font-size: 13px;
  line-height: 1.7;
}

.ichibanNotice__protectTitle {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 950;
}

.ichibanNotice__bonusGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.ichibanNotice__bonusItem {
  padding: 16px 14px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(228, 170, 67, 0.18), rgba(255, 255, 255, 0.9));
  border: 1px solid rgba(228, 170, 67, 0.34);
  display: grid;
  gap: 8px;

  span {
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 800;
  }

  strong {
    color: var(--primary-dark);
    font-size: 22px;
    font-weight: 950;
  }
}

.ichibanNotice__brand {
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.18), transparent 34%),
    linear-gradient(160deg, #5f2819 0%, #8f3022 52%, #cb5b2d 100%);
  min-height: 100%;
}

.ichibanNotice__brandGlow {
  position: absolute;
  inset: auto -56px -86px auto;
  width: 230px;
  height: 230px;
  border-radius: 999px;
  background: rgba(255, 204, 120, 0.18);
  filter: blur(10px);
}

.ichibanNotice__brandContent {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  color: #fff9f1;
}

.ichibanNotice__eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1.8px;
  opacity: 0.82;
}

.ichibanNotice__logo img {
  width: 122px;
  display: block;
}

.ichibanNotice__brandText h2 {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 950;
  letter-spacing: 1px;
}

.ichibanNotice__brandText p {
  margin: 0;
  color: rgba(255, 249, 241, 0.8);
  font-size: 14px;
  line-height: 1.72;
  font-weight: 700;
}

.ichibanNotice__lineBtn {
  min-height: 52px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  align-self: flex-start;
  background: #fff7ee;
  color: #4b2a19;
  font-size: 14px;
  font-weight: 950;
  cursor: pointer;
}

.ichibanNotice__lineIcon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  img {
    width: 22px;
    height: 22px;
  }
}

@media (max-width: 1100px) {
  .ichibanNotice__inner {
    grid-template-columns: 1fr;
  }

  .ichibanNotice__bonusGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .ichibanNotice__inner,
  .ichibanNotice__rulesCard,
  .ichibanNotice__bonusCard,
  .ichibanNotice__brand {
    border-radius: 24px;
  }

  .ichibanNotice__rulesCard,
  .ichibanNotice__bonusCard,
  .ichibanNotice__brandContent {
    padding: 20px;
  }

  .ichibanNotice__sectionHead--row {
    grid-template-columns: 1fr;
  }

  .ichibanNotice__bonusGrid {
    grid-template-columns: 1fr;
  }
}
</style>
