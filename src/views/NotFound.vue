<!-- src/views/NotFound.vue -->
<template>
  <main class="notfound">
    <div class="notfound__container">
      <section class="notfound__panel">
        <div class="notfound__iconWrap">
          <img
            class="notfound__icon"
            :src="weblogo"
            alt="一番賞 Ichiban Kuji"
          />
        </div>

        <div class="notfound__content">
          <h1 class="notfound__title">找不到這個頁面</h1>
          <p class="notfound__message">
            您要找的頁面不存在、已被移除，或連結已失效。<br />
            建議您回到首頁，重新選擇想抽的一番賞活動。
          </p>

          <div class="notfound__actions">
            <RouterLink to="/" class="notfound__btn notfound__btn--primary">
              回到首頁
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import weblogo from '@/assets/image/weblogo.png';
</script>

<style scoped lang="scss">
.notfound {
  min-height: 100vh;
  padding: 64px 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  color: #111;

  &__container {
    width: 100%;
    max-width: 640px;
    padding: 0 8px;
  }

  &__panel {
    background: #ffffff;
    border-radius: 24px;
    padding: 32px 24px 32px;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  &__iconWrap {
    margin-bottom: 16px;
  }

  &__icon {
    display: block;
    width: 120px;
    height: auto;
  }

  &__content {
    max-width: 420px;
  }

  &__title {
    margin: 4px 0 12px;
    font-size: 22px;
    font-weight: 800;
    color: #3f2412;
  }

  &__message {
    font-size: 15px;
    margin-bottom: 24px;
    line-height: 1.7;
    color: #555;
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 28px;
    border-radius: 999px;
    text-decoration: none;
    font-size: 14px;
    letter-spacing: 0.08em;
    font-weight: 700;
    transition: background-color 0.2s ease, color 0.2s ease,
      box-shadow 0.2s ease, transform 0.1s ease;
    cursor: pointer;

    &--primary {
      border: none;
      background-color: #a23b2f;
      color: #fff;
      box-shadow: 0 8px 20px rgba(162, 59, 47, 0.35);
    }

    &--primary:hover {
      background-color: #8b2f25;
      box-shadow: 0 10px 26px rgba(162, 59, 47, 0.5);
      transform: translateY(-1px);
    }

    &--primary:active {
      transform: translateY(0);
      box-shadow: 0 4px 12px rgba(162, 59, 47, 0.35);
    }
  }
}

@media (max-width: 600px) {
  .notfound {
    padding: 40px 16px;

    &__panel {
      padding: 24px 18px 26px;
      border-radius: 18px;
    }

    &__icon {
      width: 96px;
    }

    &__code {
      font-size: 40px;
    }

    &__title {
      font-size: 18px;
    }

    &__message {
      font-size: 14px;
    }
  }
}
</style>
