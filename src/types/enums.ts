// src/types/enums.ts
// Central enum / union-type definitions

/** 錢包交易類型 */
export type WalletTransactionType =
  | 'RECHARGE'       // 儲值
  | 'DRAW_GOLD'      // 金幣抽獎扣款
  | 'DRAW_BONUS'     // 紅利幣抽獎扣款
  | 'RECYCLE_BONUS'  // 回收紅利
  | 'REFERRAL_BONUS' // 推薦獎勵
  | 'ADMIN_ADJUST'   // 後台調整
  | 'EXPIRE';        // 點數到期

/** 訂單狀態
 *  注意：'SHIPPING'（非 SHIPPED）；'CANCELED'（非 CANCELLED）
 */
export type OrderStatus =
  | 'PENDING'      // 待處理
  | 'PAID'         // 已付款
  | 'PROCESSING'   // 處理中
  | 'SHIPPING'     // 出貨中
  | 'DELIVERED'    // 已送達
  | 'CANCELED'     // 已取消
  | 'REFUNDED';    // 已退款

/** 一番賞 / 扭蛋 遊玩模式 */
export type PlayMode =
  | 'LOTTERY_MODE'      // 籤位制（一番賞）
  | 'SCRATCH_MODE'      // 刮刮樂
  | 'SCRATCH_CARD_MODE' // 刮刮卡
  | 'GACHA';            // 扭蛋（加權隨機）

/** 商品大分類 */
export type LotteryCategory =
  | 'ICHIBAN'       // 一番賞
  | 'TRADING_CARD'  // 卡牌
  | 'GACHA'         // 扭蛋
  | 'SCRATCH'       // 刮刮樂系列
  | 'PRIZE_BOX';    // 賞品盒

/** 幣別 */
export type CoinType = 'GOLD' | 'BONUS';
