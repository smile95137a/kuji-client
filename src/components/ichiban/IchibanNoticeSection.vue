<!-- src/components/ichiban/IchibanNoticeSection.vue -->
<template>
  <section class="ichibanNotice">
    <div class="ichibanNotice__inner">
      <!-- 左側內容 -->
      <div class="ichibanNotice__content">
        <article class="ichibanNotice__rulesCard">
          <div class="ichibanNotice__sectionHead">
            <span class="ichibanNotice__sectionBadge">RULES</span>

            <div>
              <h3 class="ichibanNotice__sectionTitle">下單前須知</h3>
              <p class="ichibanNotice__sectionDesc">
                請確認以下內容後再進行購買。
              </p>
            </div>
          </div>

          <div class="ichibanNotice__rules">
            <div class="ichibanNotice__rule">
              <span class="ichibanNotice__ruleNo">01</span>
              <p>
                一番賞、盲盒商品為「線上機率型」商品，一旦完成抽獎程序，恕無法接受退貨及退款。
              </p>
            </div>

            <div class="ichibanNotice__rule">
              <span class="ichibanNotice__ruleNo">02</span>
              <p>
                除非商品有品質瑕疵，收到商品未拆封前請全程錄影，以保障雙方權益。
              </p>
            </div>

            <div class="ichibanNotice__rule">
              <span class="ichibanNotice__ruleNo">03</span>
              <p>
                商品運送及海關檢驗時，可能有盒損、原廠二次膠拆檢等狀況。若您對盒況有較高要求，建議購買前再次確認。
              </p>
            </div>
          </div>
        </article>

        <article class="ichibanNotice__bonusCard">
          <div
            class="ichibanNotice__sectionHead ichibanNotice__sectionHead--row"
          >
            <div>
              <span class="ichibanNotice__sectionBadge">BONUS</span>
              <h3 class="ichibanNotice__sectionTitle">多抽優惠</h3>
              <p class="ichibanNotice__sectionDesc">
                現貨在倉，限定帶抽才會贈送。
              </p>
            </div>

            <div class="ichibanNotice__protect">
              <p class="ichibanNotice__protectTitle">保護期說明</p>
              <p>
                單抽保護 300 秒，多抽為 300 秒＋（30 秒 × 抽數），上限 600 秒。
              </p>
            </div>
          </div>

          <div class="ichibanNotice__bonusGrid">
            <div
              v-for="item in bonusList"
              :key="item.count"
              class="ichibanNotice__bonusItem"
            >
              <span>{{ item.count }}</span>
              <strong>{{ item.point }}</strong>
            </div>
          </div>
        </article>
      </div>

      <!-- 右側購買前提醒 -->
      <aside class="ichibanNotice__brand">
        <div class="ichibanNotice__brandGlow"></div>

        <div class="ichibanNotice__brandContent">
          <p class="ichibanNotice__eyebrow">STARO NOTICE</p>

          <div class="ichibanNotice__logo">
            <img :src="ichibanNoticeLogo" alt="STARO" />
          </div>

          <div class="ichibanNotice__brandText">
            <h2>購買前提醒</h2>
            <p>抽賞商品屬於線上機率型商品，購買與抽獎前請先確認規範。</p>
          </div>

          <button class="ichibanNotice__lineBtn" type="button">
            <span class="ichibanNotice__lineIcon">
              <img :src="lineLogo" alt="" />
            </span>
            <span>加入 LINE 查看最新資訊</span>
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import ichibanNoticeLogo from '@/assets/image/login_logo.png';
import lineLogo from '@/assets/image/line.svg';

const bonusList = [
  { count: '一次 3 抽', point: '紅利 60' },
  { count: '一次 5 抽', point: '紅利 120' },
  { count: '一次 8 抽', point: '紅利 180' },
  { count: '一次 10 抽', point: '紅利 240' },
];
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

/* 左側內容 */
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
    radial-gradient(
      circle at 100% 0%,
      rgba(180, 51, 37, 0.07),
      transparent 34%
    ),
    rgba(255, 255, 255, 0.92);
}

.ichibanNotice__bonusCard {
  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(228, 170, 67, 0.18),
      transparent 34%
    ),
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

/* rules */
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
    color: var(--text-soft);
    font-size: 14px;
    line-height: 1.78;
    font-weight: 800;
  }
}

.ichibanNotice__ruleNo {
  width: 38px;
  height: 38px;
  border-radius: 15px;

  display: grid;
  place-items: center;

  background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
  color: #fff;

  font-size: 13px;
  font-weight: 950;
  box-shadow: 0 10px 22px rgba(180, 51, 37, 0.18);
}

/* bonus */
.ichibanNotice__bonusGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.ichibanNotice__bonusItem {
  min-height: 74px;
  padding: 12px;
  border-radius: 18px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;

  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 10px 22px rgba(63, 36, 18, 0.04);

  span {
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 850;
  }

  strong {
    color: var(--primary);
    font-size: 18px;
    line-height: 1.2;
    font-weight: 950;
  }
}

.ichibanNotice__protect {
  padding: 15px;
  border-radius: 18px;

  background: rgba(180, 51, 37, 0.055);
  border: 1px solid rgba(180, 51, 37, 0.1);

  p {
    margin: 0;
    color: var(--text-soft);
    font-size: 14px;
    line-height: 1.75;
    font-weight: 800;
  }
}

.ichibanNotice__protectTitle {
  margin: 0 0 6px;
  color: var(--primary);
  font-size: 14px;
  font-weight: 950;
}

/* 右側購買前提醒 */
.ichibanNotice__brand {
  position: relative;
  overflow: hidden;

  min-height: 100%;
  padding: 34px 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 28px;
  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(255, 255, 255, 0.34),
      transparent 34%
    ),
    linear-gradient(145deg, #4a2617 0%, #b43325 58%, #d66b42 100%);

  color: #fff;
  box-shadow: 0 18px 42px rgba(63, 36, 18, 0.16);

  &::after {
    content: '';
    position: absolute;
    right: -86px;
    top: -90px;
    width: 240px;
    height: 240px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    pointer-events: none;
  }
}

.ichibanNotice__brandGlow {
  position: absolute;
  left: -80px;
  bottom: -90px;
  width: 240px;
  height: 240px;
  border-radius: 999px;
  background: rgba(228, 170, 67, 0.2);
  pointer-events: none;
}

.ichibanNotice__brandContent {
  position: relative;
  z-index: 1;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
}

.ichibanNotice__eyebrow {
  width: fit-content;
  min-height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  margin: 0 0 20px;

  display: inline-flex;
  align-items: center;

  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.92);

  font-size: 12px;
  font-weight: 950;
  letter-spacing: 1.7px;
}

.ichibanNotice__logo {
  width: min(260px, 100%);
  margin-bottom: 26px;

  img {
    width: 100%;
    height: auto;
    display: block;
    filter: drop-shadow(0 18px 28px rgba(63, 36, 18, 0.22));
  }
}

.ichibanNotice__brandText {
  h2 {
    margin: 0;
    color: #fff;
    font-size: 32px;
    line-height: 1.25;
    font-weight: 950;
    letter-spacing: 2px;
  }

  p {
    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: 15px;
    line-height: 1.85;
    font-weight: 800;
  }
}

.ichibanNotice__lineBtn {
  width: 100%;
  min-height: 56px;
  margin-top: 28px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  background: #06c755;
  color: #fff;

  font-size: 15px;
  font-weight: 950;
  cursor: pointer;

  box-shadow: 0 16px 30px rgba(6, 199, 85, 0.24);

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    filter 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(0.98);
    box-shadow: 0 20px 38px rgba(6, 199, 85, 0.3);
  }
}

.ichibanNotice__lineIcon {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: #fff;

  img {
    width: 22px;
    height: 22px;
    display: block;
    object-fit: contain;
  }
}

/* RWD */
@media (max-width: 1180px) {
  .ichibanNotice__inner {
    grid-template-columns: 1fr;
  }

  .ichibanNotice__brand {
    order: -1;
    min-height: auto;
    padding: 28px;
  }

  .ichibanNotice__brandContent {
    display: grid;
    grid-template-columns: 230px minmax(0, 1fr) 280px;
    align-items: center;
    gap: 22px;
    text-align: left;
  }

  .ichibanNotice__eyebrow {
    position: absolute;
    left: 28px;
    top: 24px;
    margin: 0;
  }

  .ichibanNotice__logo {
    margin: 28px 0 0;
  }

  .ichibanNotice__lineBtn {
    margin-top: 28px;
  }
}

@media (max-width: 980px) {
  .ichibanNotice__brandContent {
    grid-template-columns: 210px minmax(0, 1fr);
  }

  .ichibanNotice__lineBtn {
    grid-column: 1 / -1;
    margin-top: 0;
  }

  .ichibanNotice__sectionHead--row {
    grid-template-columns: 1fr;
  }

  .ichibanNotice__bonusGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .ichibanNotice {
    margin-top: 22px;
  }

  .ichibanNotice__inner {
    padding: 14px;
    border-radius: 28px;
  }

  .ichibanNotice__brand {
    padding: 24px 18px;
    border-radius: 24px;
  }

  .ichibanNotice__brandContent {
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .ichibanNotice__eyebrow {
    position: static;
    margin-bottom: 18px;
  }

  .ichibanNotice__logo {
    width: min(210px, 100%);
    margin: 0 0 18px;
  }

  .ichibanNotice__brandText {
    h2 {
      font-size: 26px;
      letter-spacing: 1.5px;
    }

    p {
      font-size: 13px;
    }
  }

  .ichibanNotice__lineBtn {
    min-height: 52px;
    margin-top: 22px;
    font-size: 14px;
  }

  .ichibanNotice__content {
    gap: 14px;
  }

  .ichibanNotice__rulesCard,
  .ichibanNotice__bonusCard {
    padding: 18px;
    border-radius: 24px;
  }

  .ichibanNotice__sectionTitle {
    font-size: 22px;
  }

  .ichibanNotice__sectionDesc {
    font-size: 13px;
  }

  .ichibanNotice__rule {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .ichibanNotice__bonusGrid {
    grid-template-columns: 1fr;
  }

  .ichibanNotice__bonusItem {
    min-height: 62px;
  }
}

@media (max-width: 380px) {
  .ichibanNotice__inner {
    padding: 12px;
  }

  .ichibanNotice__brandText h2 {
    font-size: 24px;
  }
}
</style>
