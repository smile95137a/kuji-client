<!-- src/components/ichiban/IchibanDrawPanel.vue -->
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  remaining: number;
  activeCards: number[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'randomSelect', value: number): void;
  (e: 'exchange', type: 'gold' | 'silver'): void;
}>();

const showRandom = ref(false);
const customQuantity = ref(1);

const toggleRandom = () => {
  showRandom.value = !showRandom.value;
};

const submitCustomRandom = () => {
  emit('randomSelect', customQuantity.value || 1);
};

const submitQuickRandom = (n: number) => {
  emit('randomSelect', n);
};
</script>

<template>
  <div class="ichibanDrawPanel" v-if="isOpen">
    <!-- 關閉 -->
    <button class="ichibanDrawPanel__close" @click="emit('close')">✕</button>

    <div class="ichibanDrawPanel__inner">
      <!-- 浮起來的隨機選擇卡片 -->
      <div class="ichibanDrawPanel__random" v-if="showRandom">
        <div class="ichibanDrawPanel__random-card">
          <div class="ichibanDrawPanel__random-inputRow">
            <input
              type="number"
              min="1"
              v-model.number="customQuantity"
              class="ichibanDrawPanel__random-input"
            />
            <button
              class="ichibanDrawPanel__random-label"
              @click="submitCustomRandom"
            >
              自選隨機
            </button>
          </div>

          <div class="ichibanDrawPanel__random-list">
            <button
              v-for="n in [1, 3, 5, 10]"
              :key="n"
              class="ichibanDrawPanel__random-item"
              @click="submitQuickRandom(n)"
            >
              {{ n }}
            </button>
          </div>
        </div>
      </div>

      <!-- 三顆大按鈕 -->
      <div class="ichibanDrawPanel__btns">
        <button
          class="ichibanDrawPanel__btn ichibanDrawPanel__btn--yellow"
          @click="toggleRandom"
        >
          隨機選擇
        </button>

        <button
          class="ichibanDrawPanel__btn ichibanDrawPanel__btn--gold"
          @click="emit('exchange', 'gold')"
        >
          金幣兌換
        </button>

        <button
          class="ichibanDrawPanel__btn ichibanDrawPanel__btn--silver"
          @click="emit('exchange', 'silver')"
        >
          銀幣兌換
        </button>
      </div>

      <!-- 下方資訊 -->
      <div class="ichibanDrawPanel__info">
        <span>
          目前剩餘
          <span class="number">{{ remaining }}</span>
          抽
        </span>
        <span>
          連續次數
          <span class="number">{{ activeCards.length }}</span>
          抽
        </span>
        <span>
          共花費
          <span class="number">0</span>
          金幣
        </span>
        <span>
          共花費
          <span class="number">0</span>
          銀幣
        </span>
      </div>

      <!-- 選中獎籤 capsule -->
      <div class="ichibanDrawPanel__selected">
        <div class="ichibanDrawPanel__selected-box">
          <i class="fa-solid fa-check"></i>
          <span>
            選中 {{ activeCards.length }} 個獎籤：
            {{ activeCards.join(', ') || '尚未選擇' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ichibanDrawPanel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;

  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 0 24px 30px;
  border-radius: 26px 26px 0 0;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);

  &__close {
    position: absolute;
    top: 18px;
    right: 24px;
    background: transparent;
    border: none;
    font-size: 20px;
    color: #ffffff;
    cursor: pointer;
  }

  &__inner {
    position: relative;
    max-width: 960px;
    margin: 0 auto;
    padding-top: 90px; // 給上方浮起來卡片的空間
  }

  /* ---------------- 隨機選擇卡片 ---------------- */
  &__random {
    position: absolute;
    top: -70px; // 讓卡片「吃上去」到上方膚色區域
    left: 50%;
    transform: translateX(-50%);
  }

  &__random-card {
    background: #2b241c;
    padding: 18px 26px 18px;
    border-radius: 18px;
    border: 3px solid #e5a657;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.45);
    display: inline-block;
  }

  &__random-inputRow {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__random-input {
    width: 90px;
    height: 44px;
    border-radius: 12px;
    border: none;
    background: #ffffff;
    color: #000;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    outline: none;
  }

  &__random-label {
    padding: 10px 16px;
    border-radius: 10px;
    background: #e5a657;
    color: #2b241c;
    font-size: 15px;
    font-weight: 700;
    flex: 1;
  }

  &__random-list {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  &__random-item {
    width: 52px;
    height: 40px;
    border-radius: 10px;
    border: 2px solid #e5a657;
    background: #2b241c;
    color: #e5a657;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }

  /* ---------------- 三顆大按鈕 ---------------- */
  &__btns {
    display: flex;
    justify-content: center;
    gap: 18px;
    margin-bottom: 18px;
  }

  &__btn {
    min-width: 150px;
    padding: 11px 0;
    border-radius: 999px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    border: 2px solid #000000;
  }

  &__btn--yellow {
    background: #e5a657;
    color: #000;
  }

  &__btn--gold {
    background: #ff7b2f;
    color: #000;
  }

  &__btn--silver {
    background: #ff4a1f;
    color: #000;
  }

  /* ---------------- 下方資訊列 ---------------- */
  &__info {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 15px;
    margin-bottom: 18px;

    .number {
      color: #ff5b4d;
      font-weight: 900;
      margin: 0 4px;
    }
  }

  /* ---------------- 選中獎籤 Capsule ---------------- */
  &__selected {
    display: flex;
    justify-content: center;
  }

  &__selected-box {
    background: #f8e3c7;
    color: #000;
    padding: 12px 22px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    min-width: 320px;
    justify-content: center;

    i {
      font-size: 18px;
    }
  }

  /* ---------------- RWD ---------------- */
  @media (max-width: 768px) {
    padding: 0 16px 24px;

    &__inner {
      padding-top: 80px;
    }

    &__random-card {
      padding: 16px 20px;
    }

    &__btns {
      flex-direction: column;
      align-items: center;

      .ichibanDrawPanel__btn {
        width: 100%;
        max-width: 260px;
      }
    }

    &__info {
      flex-direction: column;
      align-items: center;
    }

    &__selected-box {
      width: 100%;
    }
  }
}
</style>
