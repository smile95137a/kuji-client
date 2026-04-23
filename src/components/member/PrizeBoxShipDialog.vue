<!-- src/components/member/PrizeBoxShipDialog.vue -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="ship-dialog__backdrop" @click.self="tryClose">
      <dialog class="ship-dialog" open>
        <header class="ship-dialog__header">
          <h2 class="ship-dialog__title">確認出貨</h2>
          <button class="ship-dialog__close" type="button" @click="tryClose" aria-label="關閉">✕</button>
        </header>

        <div class="ship-dialog__body">
          <!-- ① 出貨清單 -->
          <section class="ship-dialog__section">
            <h3 class="ship-dialog__section-title">出貨清單</h3>

            <div v-if="storeGroups.length > 1" class="ship-dialog__multi-hint">
              ⚠ 選取的獎品來自 {{ storeGroups.length }} 家不同門市，將自動分成 {{ storeGroups.length }} 筆訂單各別出貨。
            </div>

            <div
              v-for="group in storeGroups"
              :key="group.storeId"
              class="ship-dialog__store-group"
            >
              <div class="ship-dialog__store-name">🏪 {{ group.storeName }}</div>
              <ul class="ship-dialog__item-list">
                <li
                  v-for="item in group.items"
                  :key="item.id"
                  class="ship-dialog__item"
                >
                  <img
                    v-if="item.prizeImageUrl"
                    :src="item.prizeImageUrl"
                    :alt="item.prizeName"
                    class="ship-dialog__item-img"
                  />
                  <div class="ship-dialog__item-info">
                    <span class="ship-dialog__item-name">{{ item.prizeName }}</span>
                    <span class="ship-dialog__item-meta">{{ item.lotteryTitle }}</span>
                  </div>
                  <span class="ship-dialog__item-level">{{ item.prizeLevel }}</span>
                </li>
              </ul>
            </div>
          </section>

          <!-- ② 配送方式 -->
          <section class="ship-dialog__section">
            <h3 class="ship-dialog__section-title">配送方式 <span class="req">*</span></h3>

            <div v-if="shippingMethodsLoading" class="ship-dialog__hint">載入配送方式中…</div>
            <div v-else-if="shippingMethods.length === 0" class="ship-dialog__hint ship-dialog__hint--warn">無可用配送方式，請稍後再試</div>
            <div v-else class="ship-dialog__shipping-list">
              <label
                v-for="method in shippingMethods"
                :key="method.id"
                class="ship-dialog__shipping-item"
                :class="{ 'is-selected': selectedShippingId === method.id }"
              >
                <input
                  type="radio"
                  name="ship-method"
                  :value="method.id"
                  v-model="selectedShippingId"
                  class="ship-dialog__shipping-radio"
                />
                <div class="ship-dialog__shipping-info">
                  <span class="ship-dialog__shipping-name">{{ method.name }}</span>
                  <span class="ship-dialog__shipping-desc">{{ method.description }}</span>
                </div>
                <span class="ship-dialog__shipping-fee">NT$ {{ method.fee }}</span>
              </label>
            </div>
          </section>

          <!-- ③ 配送資訊 -->
          <section class="ship-dialog__section">
            <h3 class="ship-dialog__section-title">配送資訊</h3>

            <!-- 地址本選擇 -->
            <div v-if="addresses.length > 0" class="ship-dialog__field">
              <label class="ship-dialog__label" for="ship-addr-select">從地址本選取</label>
              <select
                id="ship-addr-select"
                class="ship-dialog__input"
                :value="selectedAddressId"
                @change="onAddressSelect($event)"
              >
                <option value="">— 手動填寫 —</option>
                <option
                  v-for="addr in addresses"
                  :key="addr.id"
                  :value="addr.id"
                >
                  {{ addr.addressName || addr.recipientName }}
                  （{{ addr.city }}{{ addr.district }}{{ addr.address }}）
                  <template v-if="addr.isDefault">⭐</template>
                </option>
              </select>
            </div>

            <!-- 收件人 -->
            <div class="ship-dialog__row">
              <div class="ship-dialog__field">
                <label class="ship-dialog__label" for="ship-name">收件人姓名 <span class="req">*</span></label>
                <input
                  id="ship-name"
                  class="ship-dialog__input"
                  type="text"
                  v-model.trim="form.recipientName"
                  placeholder="請輸入收件人姓名"
                />
              </div>
              <div class="ship-dialog__field">
                <label class="ship-dialog__label" for="ship-phone">手機號碼 <span class="req">*</span></label>
                <input
                  id="ship-phone"
                  class="ship-dialog__input"
                  type="tel"
                  v-model.trim="form.recipientPhone"
                  placeholder="請輸入手機號碼"
                />
              </div>
            </div>

            <!-- 地址 -->
            <div class="ship-dialog__row">
              <div class="ship-dialog__field ship-dialog__field--sm">
                <label class="ship-dialog__label" for="ship-city">縣市 <span class="req">*</span></label>
                <input
                  id="ship-city"
                  class="ship-dialog__input"
                  type="text"
                  v-model.trim="form.city"
                  placeholder="縣市"
                />
              </div>
              <div class="ship-dialog__field ship-dialog__field--sm">
                <label class="ship-dialog__label" for="ship-district">鄉鎮區 <span class="req">*</span></label>
                <input
                  id="ship-district"
                  class="ship-dialog__input"
                  type="text"
                  v-model.trim="form.district"
                  placeholder="鄉鎮區"
                />
              </div>
              <div class="ship-dialog__field ship-dialog__field--sm">
                <label class="ship-dialog__label" for="ship-zip">郵遞區號</label>
                <input
                  id="ship-zip"
                  class="ship-dialog__input"
                  type="text"
                  v-model.trim="form.zipCode"
                  placeholder="郵遞區號"
                />
              </div>
            </div>
            <div class="ship-dialog__field">
              <label class="ship-dialog__label" for="ship-address">詳細地址 <span class="req">*</span></label>
              <input
                id="ship-address"
                class="ship-dialog__input"
                type="text"
                v-model.trim="form.address"
                placeholder="路/街/巷/弄/號"
              />
            </div>
          </section>

          <!-- ④ 費用摘要 -->
          <section class="ship-dialog__section ship-dialog__section--summary">
            <h3 class="ship-dialog__section-title">費用摘要</h3>
            <div class="ship-dialog__summary-row">
              <span>出貨件數</span>
              <span>{{ totalCount }} 件</span>
            </div>
            <div v-if="storeGroups.length > 1" class="ship-dialog__summary-row">
              <span>訂單筆數</span>
              <span>{{ storeGroups.length }} 筆（每家門市各一筆）</span>
            </div>
            <div class="ship-dialog__summary-row ship-dialog__summary-row--total">
              <span>運費</span>
              <span v-if="selectedShipping" :class="selectedShipping.fee === 0 ? 'ship-dialog__free' : ''">
                {{ selectedShipping.fee === 0 ? '免費' : `NT$ ${selectedShipping.fee}` }}
              </span>
              <span v-else class="ship-dialog__hint">請先選擇配送方式</span>
            </div>
          </section>

          <!-- 錯誤訊息 -->
          <div v-if="error" class="ship-dialog__error">
            <pre>{{ error }}</pre>
          </div>
        </div>

        <footer class="ship-dialog__footer">
          <button
            class="ship-dialog__btn ship-dialog__btn--ghost"
            type="button"
            :disabled="isSubmitting"
            @click="tryClose"
          >
            取消
          </button>
          <button
            class="ship-dialog__btn ship-dialog__btn--primary"
            type="button"
            :disabled="isSubmitting || !isFormValid"
            @click="onSubmit"
          >
            {{ isSubmitting ? '出貨中…' : `確認出貨（${totalCount} 件）` }}
          </button>
        </footer>
      </dialog>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { usePrizeBoxShip, type PrizeBoxItem } from '@/composables/usePrizeBoxShip';

const props = defineProps<{
  visible: boolean;
  items: PrizeBoxItem[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

// composable
const itemsRef = computed(() => props.items);
const {
  addresses,
  selectedAddressId,
  applyAddress,
  init,
  storeGroups,
  form,
  isFormValid,
  isSubmitting,
  error,
  submit,
  shippingMethods,
  shippingMethodsLoading,
  selectedShippingId,
  selectedShipping,
} = usePrizeBoxShip(itemsRef);

// 初始化：每次 dialog 打開時重載地址本
watch(
  () => props.visible,
  async (v) => {
    if (v) {
      error.value = '';
      await init();
    }
  },
);

const totalCount = computed(() => props.items.length);

function onAddressSelect(event: Event) {
  const id = (event.target as HTMLSelectElement).value;
  if (!id) {
    selectedAddressId.value = '';
    return;
  }
  const addr = addresses.value.find((a) => a.id === id);
  if (addr) applyAddress(addr);
}

function tryClose() {
  if (isSubmitting.value) return;
  emit('close');
}

async function onSubmit() {
  const ok = await submit();
  if (ok) {
    emit('success');
  }
}
</script>

<style scoped>
.ship-dialog__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.ship-dialog {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.ship-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.ship-dialog__title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.ship-dialog__close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}
.ship-dialog__close:hover { background: #f0f0f0; }

.ship-dialog__body {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
}

.ship-dialog__section {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}
.ship-dialog__section:last-child { border-bottom: none; }

.ship-dialog__section-title {
  font-size: 14px;
  font-weight: 600;
  color: #444;
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ship-dialog__multi-hint {
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 13px;
  color: #7a5800;
  margin-bottom: 12px;
}

.ship-dialog__store-group + .ship-dialog__store-group {
  margin-top: 14px;
}

.ship-dialog__store-name {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}

.ship-dialog__item-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ship-dialog__item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 8px 10px;
}

.ship-dialog__item-img {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  background: #eee;
}

.ship-dialog__item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ship-dialog__item-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.ship-dialog__item-meta {
  font-size: 11px;
  color: #888;
}

.ship-dialog__item-level {
  font-size: 12px;
  font-weight: 600;
  color: #c0392b;
  flex-shrink: 0;
}

/* 表單 */
.ship-dialog__row {
  display: flex;
  gap: 12px;
}

.ship-dialog__field {
  flex: 1;
  margin-bottom: 12px;
}
.ship-dialog__field--sm { flex: 0 0 auto; width: calc(33% - 8px); }

.ship-dialog__label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}

.req { color: #e74c3c; }

.ship-dialog__input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.15s;
  outline: none;
}
.ship-dialog__input:focus { border-color: #2c71e0; }

.ship-dialog__textarea {
  resize: vertical;
}

/* 配送方式 */
.ship-dialog__shipping-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ship-dialog__shipping-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.ship-dialog__shipping-item:hover { border-color: #aac4f0; background: #f5f9ff; }
.ship-dialog__shipping-item.is-selected { border-color: #2c71e0; background: #f0f5ff; }

.ship-dialog__shipping-radio { flex-shrink: 0; width: 16px; height: 16px; accent-color: #2c71e0; cursor: pointer; }

.ship-dialog__shipping-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ship-dialog__shipping-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
.ship-dialog__shipping-desc { font-size: 12px; color: #888; }

.ship-dialog__shipping-fee { font-size: 14px; font-weight: 700; color: #2c71e0; flex-shrink: 0; }

.ship-dialog__hint { font-size: 13px; color: #888; padding: 8px 0; }
.ship-dialog__hint--warn { color: #c0392b; }

/* 摘要 */
.ship-dialog__section--summary { background: #fafafa; border-radius: 8px; padding: 16px; }

.ship-dialog__summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 4px 0;
  color: #555;
}
.ship-dialog__summary-row--total {
  font-weight: 700;
  font-size: 15px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
  color: #1a1a1a;
}
.ship-dialog__free { color: #27ae60; }

/* 錯誤 */
.ship-dialog__error {
  background: #ffeaea;
  border: 1px solid #f9c0c0;
  border-radius: 6px;
  padding: 12px 14px;
  margin: 12px 0;
}
.ship-dialog__error pre {
  margin: 0;
  font-size: 13px;
  color: #c0392b;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Footer */
.ship-dialog__footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.ship-dialog__btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s, background 0.15s;
}
.ship-dialog__btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ship-dialog__btn--ghost {
  background: #f0f0f0;
  color: #444;
}
.ship-dialog__btn--ghost:hover:not(:disabled) { background: #e4e4e4; }

.ship-dialog__btn--primary {
  background: #2c71e0;
  color: #fff;
  min-width: 150px;
}
.ship-dialog__btn--primary:hover:not(:disabled) { background: #1a5bc8; }

@media (max-width: 480px) {
  .ship-dialog__row { flex-direction: column; }
  .ship-dialog__field--sm { width: 100%; }
}
</style>
