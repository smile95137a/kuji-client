<!-- src/components/ichiban/IchibanStatusGrid.vue -->
<script setup lang="ts">
import { computed } from 'vue';

interface TicketInfo {
  id?: string;            // 票券 UUID（用於抽獎 API）
  ticketNumber: number;   // 票券編號（顯示用）
  status: string;
  isGrandPrize?: boolean;
  isLastPrize?: boolean;
  isDesignatedPrize?: boolean;
  prizeImageUrl?: string;
  prizeLevel?: string;
  prizeName?: string;
}

const props = defineProps<{
  cards: number[] | TicketInfo[]; // 支援舊格式（純數字）和新格式（物件）
  activeCards: number[];           // 已選中的票券編號
  cardImg: string;
  drawnTickets?: Record<number, { prizeLevel?: string; prizeName?: string; prizeImageUrl?: string }>;
}>();

const emit = defineEmits<{
  (e: 'select', ticketNumber: number, ticketId?: string): void;
}>();

// 相容性處理：如果是數字陣列就轉成物件格式
const ticketList = computed(() => {
  if (!props.cards || props.cards.length === 0) return [];
  
  // 檢查第一個元素是否為物件
  if (typeof props.cards[0] === 'object') {
    return props.cards as TicketInfo[];
  }
  
  // 如果是數字陣列，轉換成物件格式
  return (props.cards as number[]).map(num => ({
    ticketNumber: num,
    status: 'AVAILABLE',
    id: undefined,
  }));
});

// 檢查票券是否已被抽走
const isDrawn = (ticket: TicketInfo) => {
  return ticket.status === 'DRAWN' || ticket.status === 'SOLD';
};

// 取得已抽籤位的獎品資訊
const getDrawnInfo = (ticket: TicketInfo) => {
  // 優先使用 ticket 本身的資訊
  if (ticket.prizeLevel || ticket.prizeName || ticket.prizeImageUrl) {
    return {
      prizeLevel: ticket.prizeLevel,
      prizeName: ticket.prizeName,
      prizeImageUrl: ticket.prizeImageUrl,
    };
  }
  // 其次使用 drawnTickets prop
  if (props.drawnTickets && props.drawnTickets[ticket.ticketNumber]) {
    return props.drawnTickets[ticket.ticketNumber];
  }
  return null;
};

// 取得票券標籤文字
const getTicketLabel = (ticket: TicketInfo) => {
  // 已抽走的籤位顯示獎項等級
  if (isDrawn(ticket)) {
    const info = getDrawnInfo(ticket);
    if (info?.prizeLevel) return `${info.prizeLevel}賞`;
    return '已抽';
  }
  if (ticket.isGrandPrize) return '大賞';
  if (ticket.isLastPrize) return 'LAST';
  if (ticket.isDesignatedPrize) return '指定';
  return null;
};

// 取得票券標籤樣式
const getLabelClass = (ticket: TicketInfo) => {
  if (isDrawn(ticket)) return 'ichibanStatusGrid__label--drawn';
  if (ticket.isGrandPrize) return 'ichibanStatusGrid__label--grand';
  if (ticket.isLastPrize) return 'ichibanStatusGrid__label--last';
  if (ticket.isDesignatedPrize) return 'ichibanStatusGrid__label--designated';
  return '';
};

// 取得顯示的圖片
const getDisplayImage = (ticket: TicketInfo) => {
  if (isDrawn(ticket)) {
    const info = getDrawnInfo(ticket);
    if (info?.prizeImageUrl) return info.prizeImageUrl;
  }
  return props.cardImg;
};
</script>

<template>
  <div class="ichibanStatusGrid">
    <div
      v-for="ticket in ticketList"
      :key="ticket.ticketNumber"
      class="ichibanStatusGrid__card"
      :class="{ 
        'ichibanStatusGrid__card--active': activeCards.includes(ticket.ticketNumber),
        'ichibanStatusGrid__card--drawn': isDrawn(ticket)
      }"
      @click="!isDrawn(ticket) && emit('select', ticket.ticketNumber, ticket.id || '')"
      tabindex="0"
      role="button"
      @keyup.enter="!isDrawn(ticket) && emit('select', ticket.ticketNumber, ticket.id || '')"
    >
      <!-- 特殊獎項標籤 -->
      <div 
        v-if="getTicketLabel(ticket)" 
        class="ichibanStatusGrid__label"
        :class="getLabelClass(ticket)"
      >
        {{ getTicketLabel(ticket) }}
      </div>
      
      <!-- 已抽籤位顯示獎品圖片，未抽顯示卡背 -->
      <img :src="getDisplayImage(ticket)" alt="" class="ichibanStatusGrid__img" />
      
      <!-- 已抽籤位顯示獎品名稱 -->
      <div v-if="isDrawn(ticket) && getDrawnInfo(ticket)?.prizeName" class="ichibanStatusGrid__prizeName">
        {{ getDrawnInfo(ticket)?.prizeName }}
      </div>
      
      <!-- 票券編號 -->
      <div class="ichibanStatusGrid__number">{{ ticket.ticketNumber }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ichibanStatusGrid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px 16px;
  justify-items: center;

  &__card {
    position: relative;
    width: 110px;
    aspect-ratio: 3 / 4.3;
    border-radius: 12px;
    overflow: hidden;
    background: #b43325;
    cursor: pointer;
    border: 2px solid transparent;
    transition: 0.18s ease;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 22px rgba(0, 0, 0, 0.6);
    }
    
    // 已售出狀態
    &--sold {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(0.7);
      
      &:hover {
        transform: none;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
      }
    }
    
    // 已抽狀態（顯示獎品）
    &--drawn {
      cursor: default;
      border: 3px solid #4ade80;
      background: #1a1a1a;
      
      &:hover {
        transform: none;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
      }
    }
  }

  /* ⭐ 升級後的 ACTIVE 效果（超明顯） */
  &__card--active {
    border-color: #ffca45;
    transform: translateY(-6px) scale(1.05);
    box-shadow: 0 0 16px rgba(255, 202, 69, 0.8),
      0 12px 28px rgba(0, 0, 0, 0.85);
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  // 票券編號
  &__number {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
  }
  
  // 已抽籤位的獎品名稱
  &__prizeName {
    position: absolute;
    bottom: 28px;
    left: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  // 特殊獎項標籤
  &__label {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.5px;
    
    // 大賞
    &--grand {
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #b8860b;
      border: 2px solid #ffd700;
      animation: pulse-grand 2s ease-in-out infinite;
    }
    
    // 賞尾
    &--last {
      background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
      color: #4a4a4a;
      border: 2px solid #a8a8a8;
      animation: pulse-last 2s ease-in-out infinite;
    }
    
    // 指定賞
    &--designated {
      background: linear-gradient(135deg, #ff6b6b, #ff8787);
      color: #fff;
      border: 2px solid #ff5252;
      animation: pulse-designated 2s ease-in-out infinite;
    }
    
    // 已抽
    &--drawn {
      background: linear-gradient(135deg, #4ade80, #22c55e);
      color: #fff;
      border: 2px solid #16a34a;
    }
  }

  /* RWD */
  @media (max-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

// 動畫效果
@keyframes pulse-grand {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 2px 12px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.8);
  }
}

@keyframes pulse-last {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
  }
  50% {
    box-shadow: 0 2px 12px rgba(192, 192, 192, 0.5);
  }
}

@keyframes pulse-designated {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  }
  50% {
    box-shadow: 0 2px 12px rgba(255, 107, 107, 0.5);
  }
}
</style>
