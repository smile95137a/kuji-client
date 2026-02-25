<!-- src/components/ThemeNavigation.vue -->
<template>
  <div class="theme-navigation">
    <!-- 主題列表 -->
    <section class="theme-section">
      <h2 class="section-title">
        <span class="icon">🎨</span>
        選擇主題
      </h2>
      
      <div v-if="loadingThemes" class="loading">
        載入主題中...
      </div>
      
      <div v-else class="theme-list">
        <div
          v-for="theme in themes"
          :key="theme.name"
          class="theme-card"
          :class="{ active: selectedTheme === theme.name }"
          @click="selectTheme(theme.name)"
        >
          <div v-if="theme.imageUrl" class="theme-image">
            <img :src="theme.imageUrl" :alt="theme.name" />
          </div>
          <div class="theme-info">
            <h3 class="theme-name">{{ theme.name }}</h3>
            <p class="theme-count">
              <span class="count-badge">{{ theme.productCount }}</span> 個商品
            </p>
            <p v-if="theme.hotCount" class="theme-hot">
              🔥 熱度 {{ theme.hotCount }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 商品列表 -->
    <section v-if="selectedTheme" class="product-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="icon">🎁</span>
          {{ selectedTheme }} 的商品
        </h2>
        <button class="btn-clear" @click="clearSelection">
          返回主題列表
        </button>
      </div>

      <div v-if="loadingProducts" class="loading">
        載入商品中...
      </div>

      <div v-else-if="products.length === 0" class="empty">
        <p>此主題目前沒有商品</p>
      </div>

      <div v-else class="product-list">
        <div
          v-for="item in products"
          :key="item.lottery.id"
          class="product-card"
          @click="goToProduct(item.lottery.id)"
        >
          <div class="product-image">
            <img :src="item.lottery.imageUrl" :alt="item.lottery.title" />
            <div class="product-badge" v-if="item.lottery.status === 'ON_SHELF'">
              上架中
            </div>
          </div>
          
          <div class="product-info">
            <h4 class="product-title">{{ item.lottery.title }}</h4>
            <p class="product-category">{{ item.lottery.categoryName }}</p>
            
            <div class="product-price">
              <span class="price-label">價格</span>
              <span class="price-value">NT$ {{ item.lottery.pricePerDraw }}</span>
              <span class="price-unit">/ 抽</span>
            </div>
            
            <div class="product-stock">
              <div class="stock-bar">
                <div 
                  class="stock-progress" 
                  :style="{ width: calculateStockPercent(item.lottery) + '%' }"
                ></div>
              </div>
              <p class="stock-text">
                剩餘 <strong>{{ item.lottery.remainingPrizes }}</strong> / {{ item.lottery.totalPrizes }}
              </p>
            </div>

            <!-- 獎品預覽 -->
            <div v-if="item.prizes && item.prizes.length > 0" class="prize-preview">
              <div v-for="prize in item.prizes.slice(0, 3)" :key="prize.id" class="prize-item">
                <span class="prize-level">{{ prize.prizeLevel }}賞</span>
                <span class="prize-name">{{ prize.prizeName }}</span>
              </div>
              <span v-if="item.prizes.length > 3" class="prize-more">
                ... 更多
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { queryThemes, type CategoryRes } from '@/services/categoryService';
import { queryBrowseLotteries } from '@/services/lotteryBrowseService';
import { executeApi } from '@/utils/executeApiUtils';

const router = useRouter();

const themes = ref<CategoryRes[]>([]);
const selectedTheme = ref<string | null>(null);
const products = ref<any[]>([]);
const loadingThemes = ref(false);
const loadingProducts = ref(false);

/**
 * 載入主題列表
 */
const loadThemes = async () => {
  loadingThemes.value = true;

  await executeApi({
    fn: () => queryThemes({
      condition: { status: 'ON_SHELF' }
    }),
    showCatchDialog: false,
    showFailDialog: false,
    onSuccess: (res: any) => {
      const list: CategoryRes[] = Array.isArray(res) ? res : (res?.data ?? []);
      themes.value = list;
    },
    onFail: async () => {
      console.error('載入主題失敗');
    },
  });

  loadingThemes.value = false;
};

/**
 * 選擇主題並載入商品
 */
const selectTheme = async (themeName: string) => {
  selectedTheme.value = themeName;
  loadingProducts.value = true;

  await executeApi({
    fn: () => queryBrowseLotteries({
      condition: {
        theme: themeName,
        status: 'ON_SHELF'
      }
    }),
    showCatchDialog: false,
    showFailDialog: false,
    onSuccess: (res: any) => {
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      products.value = list;
    },
    onFail: async () => {
      console.error('載入商品失敗');
      products.value = [];
    },
  });

  loadingProducts.value = false;
};

/**
 * 清除選擇
 */
const clearSelection = () => {
  selectedTheme.value = null;
  products.value = [];
};

/**
 * 前往商品詳情頁
 */
const goToProduct = (lotteryId: string) => {
  router.push({ name: 'IchibanDetail', params: { id: lotteryId } });
};

/**
 * 計算庫存百分比
 */
const calculateStockPercent = (lottery: any) => {
  const total = lottery.totalPrizes || 1;
  const remaining = lottery.remainingPrizes || 0;
  return Math.round((remaining / total) * 100);
};

onMounted(() => {
  loadThemes();
});
</script>

<style scoped lang="scss">
.theme-navigation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  .icon {
    font-size: 32px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.btn-clear {
  padding: 10px 20px;
  background: #e0e0e0;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #d0d0d0;
  }
}

/* 主題列表 */
.theme-section {
  margin-bottom: 60px;
}

.theme-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.theme-card {
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    border-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  }

  &.active {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  }
}

.theme-image {
  width: 100%;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.theme-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-name {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.theme-count {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
}

.theme-hot {
  font-size: 13px;
  color: #ff6b6b;
  font-weight: 600;
}

/* 商品列表 */
.product-section {
  margin-top: 40px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.product-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: #4caf50;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
}

.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-category {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: #fff;
}

.price-label {
  font-size: 12px;
  opacity: 0.9;
}

.price-value {
  font-size: 24px;
  font-weight: 700;
}

.price-unit {
  font-size: 14px;
  opacity: 0.9;
}

.product-stock {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stock-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.stock-progress {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
  transition: width 0.3s ease;
}

.stock-text {
  font-size: 13px;
  color: #666;
  margin: 0;

  strong {
    color: #4caf50;
    font-weight: 700;
  }
}

.prize-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.prize-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.prize-level {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 20px;
  padding: 0 6px;
  background: #ffd54f;
  color: #333;
  font-weight: 700;
  font-size: 11px;
  border-radius: 4px;
}

.prize-name {
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prize-more {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 載入和空狀態 */
.loading,
.empty {
  padding: 60px 20px;
  text-align: center;
  color: #999;
  font-size: 16px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .theme-list {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .product-list {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
