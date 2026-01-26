<!-- src/components/layout/AppFooter.vue -->
<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <!-- Left: Logo + Copyright -->
      <div class="app-footer__left">
        <RouterLink class="app-footer__logoLink" to="/" aria-label="回到首頁">
          <!-- 你也可以改成用 <img>；這裡先用 assets 路徑示意 -->
          <img class="app-footer__logo" :src="footerLogo" alt="一番賞 Logo" />
        </RouterLink>

        <p class="app-footer__copyright">
          @{{ copyrightYear }} 一番賞 版權所有
        </p>
      </div>

      <!-- Right: Nav + Company Info -->
      <div class="app-footer__right">
        <nav class="app-footer__nav" aria-label="頁尾導覽">
          <ul class="app-footer__navList">
            <li
              v-for="item in nav"
              :key="item.label"
              class="app-footer__navItem"
            >
              <RouterLink class="app-footer__navLink" :to="item.to">
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="app-footer__info">
          <p class="app-footer__infoRow">
            <span class="app-footer__infoLabel">公司信箱：</span>
            <a
              class="app-footer__infoValue app-footer__infoValue--link"
              :href="`mailto:${company.email}`"
            >
              {{ company.email }}
            </a>
          </p>

          <p class="app-footer__infoRow">
            <span class="app-footer__infoLabel">公司電話：</span>
            <a
              class="app-footer__infoValue app-footer__infoValue--link"
              :href="`tel:${company.phone}`"
            >
              {{ company.phone }}
            </a>
          </p>

          <p class="app-footer__infoRow">
            <span class="app-footer__infoLabel">公司名稱：</span>
            <span class="app-footer__infoValue">{{ company.name }}</span>
          </p>

          <p class="app-footer__infoRow">
            <span class="app-footer__infoLabel">客服服務時間：</span>
            <span class="app-footer__infoValue">{{ company.serviceTime }}</span>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import footerLogo from '@/assets/image/footer_logo.png';
type FooterNavItem = {
  label: string;
  to: string;
};

const nav: FooterNavItem[] = [
  { label: '關於我們', to: '/about' },
  { label: '常見問題', to: '/faq' },
  { label: '優惠說明', to: '/promotion' },
  { label: '交易說明', to: '/transaction' },
  { label: '合作諮詢', to: '/cooperation' },
  { label: '服務條款', to: '/terms' },
  { label: '隱私權政策', to: '/privacy' },
];

const company = {
  email: 'abc@gmail.com',
  phone: '091234567',
  name: '一番賞有限公司',
  serviceTime: '週一至週五 8:00-17:00',
};

// 設計圖是 @2026；如果你想固定就直接寫 2026
const copyrightYear = 2026;
</script>

<style scoped lang="scss">
.app-footer {
  width: 100%;
  background: #fff;
}

.app-footer__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 44px 20px;
  display: flex;
  align-items: flex-start;
  gap: 48px;
}

.app-footer__left {
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.app-footer__logoLink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.app-footer__logo {
  width: 180px;
  height: auto;
  display: block;
}

.app-footer__copyright {
  font-size: 13px;
  color: #111;
  margin: 0;
}

.app-footer__right {
  flex: 1;
  min-width: 0;
}

.app-footer__navList {
  list-style: none;
  padding: 0;
  margin: 0 0 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
}

.app-footer__navLink {
  font-size: 14px;
  color: #111;
  text-decoration: none;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.75;
  }
}

.app-footer__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.app-footer__infoRow {
  margin: 0;
  font-size: 14px;
  color: #7a7a7a;
  line-height: 1.6;
}

.app-footer__infoLabel {
  color: #7a7a7a;
}

.app-footer__infoValue {
  color: #7a7a7a;
}

.app-footer__infoValue--link {
  text-decoration: none;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.8;
  }
}

/* RWD */
@media (max-width: 900px) {
  .app-footer__container {
    flex-direction: column;
    align-items: center;
    gap: 28px;
    padding: 34px 16px;
  }

  .app-footer__left {
    width: 100%;
  }

  .app-footer__right {
    width: 100%;
  }

  .app-footer__navList {
    justify-content: center;
    gap: 14px 18px;
    margin-bottom: 14px;
  }

  .app-footer__info {
    align-items: center;
    text-align: center;
  }
}
</style>
