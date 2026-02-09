<!-- src/components/ichiban/IchibanDrawPanel.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  remaining: number;

  /**  UUID list：送後端用 */
  activeCards: string[];

  /**  票號 list：顯示用（由父層換好 UUID -> ticketNumber） */
  activeCardNumbers: number[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'randomSelect', value: number): void;
  /**
   *  兌換：只丟 tickets(UUID)，count 由父層 = tickets.length
   */
  (
    e: 'exchange',
    payload: { type: 'gold' | 'silver'; tickets: string[] },
  ): void;
}>();

const showRandom = ref(false);
const customQuantity = ref(1);

const toggleRandom = () => {
  showRandom.value = !showRandom.value;
};

const submitCustomRandom = () => {
  emit('randomSelect', Math.max(1, Number(customQuantity.value || 1)));
};

const submitQuickRandom = (n: number) => {
  emit('randomSelect', n);
};

const submitExchange = (type: 'gold' | 'silver') => {
  const tickets = Array.isArray(props.activeCards)
    ? [...props.activeCards]
    : [];
  emit('exchange', { type, tickets });
};

const selectedCount = computed(() =>
  Array.isArray(props.activeCards) ? props.activeCards.length : 0,
);

/**  顯示用文字（票號） */
const selectedNumbersText = computed(() => {
  const arr = Array.isArray(props.activeCardNumbers)
    ? props.activeCardNumbers
    : [];
  return arr.length ? arr.join(', ') : '尚未選擇';
});
</script>

<template>
  <div class="ichibanDrawPanel" v-if="isOpen">
    <button class="ichibanDrawPanel__close" @click="emit('close')">✕</button>

    <div class="ichibanDrawPanel__inner">
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

      <div class="ichibanDrawPanel__btns">
        <button
          class="ichibanDrawPanel__btn ichibanDrawPanel__btn--yellow"
          @click="toggleRandom"
        >
          隨機選擇
        </button>

        <button
          class="ichibanDrawPanel__btn ichibanDrawPanel__btn--gold"
          @click="submitExchange('gold')"
        >
          金幣兌換
        </button>

        <button
          class="ichibanDrawPanel__btn ichibanDrawPanel__btn--silver"
          @click="submitExchange('silver')"
        >
          銀幣兌換
        </button>
      </div>

      <div class="ichibanDrawPanel__info">
        <span>
          目前剩餘 <span class="number">{{ remaining }}</span> 抽
        </span>
        <span>
          連續次數 <span class="number">{{ selectedCount }}</span> 抽
        </span>
        <span> 共花費 <span class="number">0</span> 金幣 </span>
        <span> 共花費 <span class="number">0</span> 銀幣 </span>
      </div>

      <div class="ichibanDrawPanel__selected">
        <div class="ichibanDrawPanel__selected-box">
          <i class="fa-solid fa-check"></i>
          <span>
            選中 {{ selectedCount }} 個獎籤：
            {{ selectedNumbersText }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
