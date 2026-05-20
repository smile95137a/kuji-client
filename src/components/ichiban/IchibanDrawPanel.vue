<!-- src/components/ichiban/IchibanDrawPanel.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  remaining: number;

  /** UUID list：送後端用 */
  activeCards: string[];

  /** 票號 list：顯示用（由父層換好 UUID -> ticketNumber） */
  activeCardNumbers: number[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'randomSelect', value: number): void;
  (
    e: 'exchange',
    payload: { type: 'gold' | 'silver'; tickets: string[] },
  ): void;
}>();

const showRandom = ref(false);

const toggleRandom = () => {
  showRandom.value = !showRandom.value;
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

const selectedNumbersText = computed(() => {
  const arr = Array.isArray(props.activeCardNumbers)
    ? props.activeCardNumbers
    : [];

  return arr.length ? arr.join('、') : '尚未選擇';
});
</script>

<template>
  <transition name="ichibanDrawPanel">
    <div v-if="isOpen" class="ichibanDrawPanel">
      <section class="ichibanDrawPanel__sheet">
        <button
          type="button"
          class="ichibanDrawPanel__close"
          aria-label="關閉"
          @click="emit('close')"
        >
          <font-awesome-icon icon="fa-xmark" />
        </button>

        <div class="ichibanDrawPanel__inner">
          <header class="ichibanDrawPanel__header">
            <div>
              <p class="ichibanDrawPanel__eyebrow">DRAW PANEL</p>
              <h2 class="ichibanDrawPanel__title">選擇抽獎方式</h2>
            </div>

            <div class="ichibanDrawPanel__remain">
              <span>剩餘</span>
              <strong>{{ remaining }}</strong>
              <span>抽</span>
            </div>
          </header>

          <div v-if="showRandom" class="ichibanDrawPanel__random">
            <div class="ichibanDrawPanel__randomHead">
              <span class="ichibanDrawPanel__randomTitle">
                <font-awesome-icon icon="fa-shuffle" />
                隨機選擇
              </span>

              <span class="ichibanDrawPanel__randomHint"> 快速選擇抽數 </span>
            </div>

            <div class="ichibanDrawPanel__randomList">
              <button
                v-for="n in [1, 3, 5, 10]"
                :key="n"
                type="button"
                class="ichibanDrawPanel__randomItem"
                @click="submitQuickRandom(n)"
              >
                {{ n }} 抽
              </button>
            </div>
          </div>

          <div class="ichibanDrawPanel__actions">
            <button
              type="button"
              class="ichibanDrawPanel__btn ichibanDrawPanel__btn--random"
              @click="toggleRandom"
            >
              <font-awesome-icon icon="fa-shuffle" />
              <span>隨機選擇</span>
            </button>

            <button
              type="button"
              class="ichibanDrawPanel__btn ichibanDrawPanel__btn--gold"
              @click="submitExchange('gold')"
            >
              <font-awesome-icon icon="fa-coins" />
              <span>金幣兌換</span>
            </button>

            <button
              type="button"
              class="ichibanDrawPanel__btn ichibanDrawPanel__btn--silver"
              @click="submitExchange('silver')"
            >
              <font-awesome-icon icon="fa-ticket" />
              <span>銀幣兌換</span>
            </button>
          </div>

          <div class="ichibanDrawPanel__summary">
            <div class="ichibanDrawPanel__summaryItem">
              <span>目前剩餘</span>
              <strong>{{ remaining }}</strong>
              <span>抽</span>
            </div>

            <div class="ichibanDrawPanel__summaryItem">
              <span>已選擇</span>
              <strong>{{ selectedCount }}</strong>
              <span>抽</span>
            </div>

            <div class="ichibanDrawPanel__summaryItem">
              <span>金幣花費</span>
              <strong>0</strong>
            </div>

            <div class="ichibanDrawPanel__summaryItem">
              <span>銀幣花費</span>
              <strong>0</strong>
            </div>
          </div>

          <div class="ichibanDrawPanel__selected">
            <div class="ichibanDrawPanel__selectedBox">
              <font-awesome-icon icon="fa-check" />

              <span>
                選中 {{ selectedCount }} 個獎籤：
                {{ selectedNumbersText }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </transition>
</template>
