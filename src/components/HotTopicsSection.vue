<template>
  <section class="hot-topics">
    <div class="hot-topics__inner">
      <h2 class="hot-topics__title">熱門主題</h2>

      <div class="hot-topics__content">
        <!-- 左側主視覺 -->
        <div class="hot-topics__visual">
          <img class="hot-topics__visual-img" :src="visualSrc" alt="" />
        </div>

        <!-- 右側主題 -->
        <div class="hot-topics__tags">
          <button
            v-for="t in topics"
            :key="t"
            class="hot-topics__tag"
            :class="{ 'hot-topics__tag--hot': hotSet.has(t) }"
            type="button"
            @click="onClick(t)"
          >
            {{ t }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import visualSrc from '@/assets/image/hot-topics-visual.png'; // 換成你的 ICHIBAN KUJI 圖

// 依照你圖上的排列/內容寫死（你要增刪就改這裡）
const topics = [
  '鋼彈系列',
  '新世紀福音戰士',
  '七龍珠',
  '航海王',
  '獵人',
  '精',
  '靈寶可夢',
  '數碼寶貝',
  '魔物獵人',
  '進擊的巨人',
  'JOJO的奇妙',
  '冒險',
  '吉伊卡哇',
  '膽大黨',
  '咒術迴戰',
  '鏈鋸人',
  '火影忍者',
  '假面騎士',
  '鬼滅之刃',
  '遊戲王',
  '我的英雄學院',
  '勇者鬥惡龍',
  '哥吉拉',
  '葬送的芙莉蓮',
  '超人力霸王',
  '碧藍航線',
  '蠟筆小新',
  '初音未來',
  '烙印勇士',
  '魔神英雄傳',
  '天天突破紅蓮螺巖',
  '閃',
  '電鋸麗車',
  '藍色監獄',
  '間諜家家酒',
  '星際大戰',
  '變形金剛',
  '鋼鐵人',
  '蜘蛛人',
  '蝙蝠俠',
  '神力女超人',
  '哈利波特',
  '異形',
  '終極戰士',
  '金剛戰士',
  '回到未來',
  '玩具總動員',
  '魔鬼剋星',
  '太空超人',
  '忍者龜',
  '音速小子',
  '侏羅紀公園',
];

// 需要紅色的（照圖挑幾個，你想改就改這裡）
const hotSet = new Set<string>([
  '鋼彈系列',
  '精',
  '靈寶可夢',
  '進擊的巨人',
  '吉伊卡哇',
  '膽大黨',
  '星際大戰',
  '忍者龜',
]);

const onClick = (t: string) => {
  console.log('topic click:', t);
};
</script>

<style scoped lang="scss">
.hot-topics {
  width: 100%;
  background: #fff;

  &__inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 84px 24px 110px 24px;
  }

  &__title {
    font-size: 26px;
    font-weight: 800;
    color: #515151;
    letter-spacing: 1px;
    margin: 0 0 36px 0;
  }

  &__content {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 56px;
    align-items: center;
  }

  &__visual {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__visual-img {
    width: 100%;
    max-width: 420px;
    height: auto;
    display: block;
    object-fit: contain;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 18px 26px;
    align-content: center;
  }

  &__tag {
    appearance: none;
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;

    font-size: 18px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.5px;
    color: rgba(0, 0, 0, 0.82);

    transition: transform 120ms ease, opacity 120ms ease;

    &:hover {
      transform: translateY(-1px);
      opacity: 0.92;
    }

    &:active {
      transform: translateY(0);
      opacity: 0.85;
    }

    &:focus-visible {
      outline: 3px solid rgba(0, 0, 0, 0.18);
      outline-offset: 4px;
      border-radius: 6px;
    }

    &--hot {
      color: #b43325;
    }
  }
}

@media (max-width: 1024px) {
  .hot-topics {
    &__inner {
      padding: 64px 20px 84px 20px;
    }

    &__content {
      grid-template-columns: 360px 1fr;
      gap: 36px;
    }

    &__tag {
      font-size: 16px;
    }
  }
}

@media (max-width: 768px) {
  .hot-topics {
    &__content {
      grid-template-columns: 1fr;
      gap: 28px;
    }

    &__visual-img {
      max-width: 360px;
    }

    &__tags {
      justify-content: center;
      gap: 14px 18px;
    }

    &__title {
      text-align: center;
    }
  }
}
</style>
