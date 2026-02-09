<!-- src/views/Privacy.vue -->
<template>
  <div class="privacy">
    <!-- Hero -->
    <section class="privacy__hero">
      <div class="privacy__heroInner">
        <div class="privacy__heroLeft">
          <p class="privacy__badge">PRIVACY</p>
          <h1 class="privacy__title">STARDO 隱私權政策</h1>
          <p class="privacy__subtitle">
            STARDO 重視你的個人資料與隱私。本政策說明我們在你使用 STARDO
            服務時，會蒐集哪些資料、
            為何蒐集、如何使用與保存，以及你可以如何行使個資權利。
            若你不同意本政策全部或部分內容，請停止使用本服務。
          </p>

          <div class="privacy__heroActions">
            <button
              class="privacy__btn privacy__btn--primary"
              type="button"
              @click="scrollTo('content')"
            >
              查看政策
            </button>
          </div>

          <div class="privacy__hint" role="note">
            <span class="privacy__hintIcon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'shield-halved']" />
            </span>
            <span class="privacy__hintText">
              本政策可能更新。更新後你持續使用服務，視為同意更新內容。
            </span>
          </div>
        </div>

        <aside class="privacy__heroRight">
          <div class="privacy__panel">
            <div class="privacy__panelHeader">
              <p class="privacy__panelTitle">快速導覽</p>
              <p class="privacy__panelDesc">點選可跳到對應段落。</p>
            </div>

            <div class="privacy__nav">
              <button
                class="privacy__chip"
                type="button"
                @click="scrollTo('p1')"
              >
                <span class="privacy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'list']" />
                </span>
                蒐集哪些資料
              </button>
              <button
                class="privacy__chip"
                type="button"
                @click="scrollTo('p2')"
              >
                <span class="privacy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'bullseye']" />
                </span>
                使用目的與法律依據
              </button>
              <button
                class="privacy__chip"
                type="button"
                @click="scrollTo('p3')"
              >
                <span class="privacy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'share-nodes']" />
                </span>
                第三方與委外
              </button>
              <button
                class="privacy__chip"
                type="button"
                @click="scrollTo('p4')"
              >
                <span class="privacy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'cookie-bite']" />
                </span>
                Cookie 與追蹤技術
              </button>
              <button
                class="privacy__chip"
                type="button"
                @click="scrollTo('p5')"
              >
                <span class="privacy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'lock']" />
                </span>
                保存期間與安全
              </button>
              <button
                class="privacy__chip"
                type="button"
                @click="scrollTo('p6')"
              >
                <span class="privacy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'user-check']" />
                </span>
                你的權利
              </button>
              <button
                class="privacy__chip"
                type="button"
                @click="scrollTo('p7')"
              >
                <span class="privacy__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'envelope']" />
                </span>
                聯絡方式
              </button>
            </div>

            <div class="privacy__panelFooter">
              <button
                class="privacy__miniBtn privacy__miniBtn--gold"
                type="button"
                @click="scrollTo('p7')"
              >
                聯絡我們
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Content -->
    <section class="privacy__section" id="content">
      <div class="privacy__container">
        <header class="privacy__header">
          <h2 class="privacy__h2">隱私權政策內容</h2>
          <p class="privacy__desc">
            本政策適用於 STARDO
            網站與相關服務。若你透過本平台連結到第三方網站或服務，其資料處理方式依第三方政策為準。
          </p>
        </header>

        <div class="privacy__grid">
          <!-- p1 -->
          <article class="privacy__card" id="p1">
            <div class="privacy__cardTop">
              <span class="privacy__cardBadge">
                <span class="privacy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'list']" />
                </span>
                蒐集哪些資料
              </span>
              <h3 class="privacy__cardTitle">我們可能蒐集的資料類型</h3>
              <p class="privacy__cardDesc">
                我們會依你使用的功能不同，蒐集必要資料以提供服務、完成交易與提升安全性。
              </p>
            </div>

            <ul class="privacy__list">
              <li class="privacy__item">
                會員資料：例如姓名/暱稱、電子郵件、手機、生日（若你有提供）、登入方式與帳號識別資訊。
              </li>
              <li class="privacy__item">
                交易資料：例如訂單編號、購買/儲值紀錄、付款狀態、發票資訊（載具、統編、捐贈設定等）、退款申請資訊。
              </li>
              <li class="privacy__item">
                寄送與收件資料：例如收件人姓名、電話、地址、超商取貨門市資訊（若適用）。
              </li>
              <li class="privacy__item">
                使用紀錄與裝置資料：例如 IP
                位址、瀏覽器類型、裝置識別碼、作業系統、操作時間、頁面點擊與錯誤紀錄（用於資安與除錯）。
              </li>
              <li class="privacy__item">
                客服與申訴資料：你與客服往來內容、附件（例如截圖、影片）、問題處理與回覆紀錄。
              </li>
            </ul>

            <div class="privacy__callout" role="note">
              <span class="privacy__calloutIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'circle-info']" />
              </span>
              <p class="privacy__calloutText">
                本平台不會要求你提供與服務無關的敏感資訊；若你主動在客服中提供，仍可能被用於處理你的案件。
              </p>
            </div>
          </article>

          <!-- p2 -->
          <article class="privacy__card" id="p2">
            <div class="privacy__cardTop">
              <span class="privacy__cardBadge">
                <span class="privacy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'bullseye']" />
                </span>
                使用目的與法律依據
              </span>
              <h3 class="privacy__cardTitle">為何蒐集與如何使用</h3>
              <p class="privacy__cardDesc">
                我們基於提供服務、履行契約、合法義務、資安需求與你的同意等理由，使用你的資料。
              </p>
            </div>

            <ul class="privacy__list">
              <li class="privacy__item">
                提供會員功能：註冊、登入、帳號管理、通知與客服處理。
              </li>
              <li class="privacy__item">
                完成交易：儲值、付款、開立發票、退款處理、寄送與保管。
              </li>
              <li class="privacy__item">
                風險控管與資安：防詐欺、防盜刷、異常偵測、存取控制、稽核追蹤。
              </li>
              <li class="privacy__item">
                服務改善：統計分析、錯誤排除、效能與使用體驗優化（以合理必要為限）。
              </li>
              <li class="privacy__item">
                行銷訊息（若適用）：在你同意或依法律允許範圍內，提供活動通知、優惠訊息與系統公告；你可隨時取消訂閱。
              </li>
            </ul>

            <div class="privacy__reserve">
              <p class="privacy__reserveTitle">最小必要原則</p>
              <p class="privacy__reserveText">
                我們會以達成目的所需的最少資料來提供服務，不會超出合理範圍使用你的個人資料。
              </p>
            </div>
          </article>

          <!-- p3 -->
          <article class="privacy__card" id="p3">
            <div class="privacy__cardTop">
              <span class="privacy__cardBadge">
                <span class="privacy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'share-nodes']" />
                </span>
                第三方與委外
              </span>
              <h3 class="privacy__cardTitle">我們何時會分享資料</h3>
              <p class="privacy__cardDesc">
                我們不會任意出售你的個人資料。僅在提供服務所必須、或依法令要求時，才會與第三方分享必要資訊。
              </p>
            </div>

            <ul class="privacy__list">
              <li class="privacy__item">
                金流服務商：用於付款、退款、對帳與風控（實際資料欄位依付款方式而定）。
              </li>
              <li class="privacy__item">
                物流/超商服務商：用於寄送、取貨、配送狀態通知與退件處理。
              </li>
              <li class="privacy__item">
                系統服務供應商：例如雲端主機、資料庫、錯誤追蹤、通知寄送等（以提供服務必要為限）。
              </li>
              <li class="privacy__item">
                依法令或主管機關要求：例如司法、檢警調或其他有權機關依法定程序要求。
              </li>
              <li class="privacy__item">
                權利保護：為保護平台與使用者權益、處理爭議、主張或防禦法律請求之必要範圍。
              </li>
            </ul>

            <div class="privacy__callout" role="note">
              <span class="privacy__calloutIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'shield-halved']" />
              </span>
              <p class="privacy__calloutText">
                我們會要求委外廠商遵循合理的資訊安全與保密義務，並僅能在受託目的範圍內處理資料。
              </p>
            </div>
          </article>

          <!-- p4 -->
          <article class="privacy__card" id="p4">
            <div class="privacy__cardTop">
              <span class="privacy__cardBadge">
                <span class="privacy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'cookie-bite']" />
                </span>
                Cookie 與追蹤技術
              </span>
              <h3 class="privacy__cardTitle">Cookie 的用途</h3>
              <p class="privacy__cardDesc">
                我們可能使用 Cookie
                或類似技術，以維持登入狀態、提供基本功能與改善使用體驗。
              </p>
            </div>

            <ul class="privacy__list">
              <li class="privacy__item">
                必要性 Cookie：用於登入狀態、安全驗證與基本功能運作。
              </li>
              <li class="privacy__item">
                偏好設定：例如語系、介面偏好或部分使用習慣（若你有啟用）。
              </li>
              <li class="privacy__item">
                統計分析：用於了解使用情況並改善服務（以合理必要為限）。
              </li>
            </ul>

            <div class="privacy__reserve">
              <p class="privacy__reserveTitle">如何管理 Cookie</p>
              <p class="privacy__reserveText">
                你可以透過瀏覽器設定清除或停用
                Cookie；但停用後，可能導致部分功能無法正常使用（例如無法維持登入狀態）。
              </p>
            </div>
          </article>

          <!-- p5 -->
          <article class="privacy__card" id="p5">
            <div class="privacy__cardTop">
              <span class="privacy__cardBadge">
                <span class="privacy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'lock']" />
                </span>
                保存期間與安全
              </span>
              <h3 class="privacy__cardTitle">保存多久與怎麼保護</h3>
              <p class="privacy__cardDesc">
                我們會在達成蒐集目的所需期間內保存資料，或依相關法令/稅務/會計等規範保存必要期間。
              </p>
            </div>

            <ul class="privacy__list">
              <li class="privacy__item">
                保存期間：依服務目的、法令或爭議處理需求合理保存，期滿後將刪除或匿名化（法律另有規定除外）。
              </li>
              <li class="privacy__item">
                安全措施：包含存取控制、權限管理、加密/雜湊（視系統設計）、安全稽核與異常監控等。
              </li>
              <li class="privacy__item">
                內部控管：僅授權必要人員依職務存取資料，並要求保密義務。
              </li>
            </ul>

            <div class="privacy__callout" role="note">
              <span class="privacy__calloutIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
              </span>
              <p class="privacy__calloutText">
                雖我們會採取合理安全措施，但網路環境仍存在風險；建議你妥善保管帳密並避免在公共設備保存登入資訊。
              </p>
            </div>
          </article>

          <!-- p6 -->
          <article class="privacy__card" id="p6">
            <div class="privacy__cardTop">
              <span class="privacy__cardBadge">
                <span class="privacy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'user-check']" />
                </span>
                你的權利
              </span>
              <h3 class="privacy__cardTitle">你可以如何行使個資權利</h3>
              <p class="privacy__cardDesc">
                你可依個人資料保護法等相關法令，向本平台提出下列請求。為保護帳戶安全，我們可能要求你進行身分驗證。
              </p>
            </div>

            <ul class="privacy__list">
              <li class="privacy__item">查詢或請求閱覽。</li>
              <li class="privacy__item">
                請求製給複製本（可能依法律收取必要成本費用）。
              </li>
              <li class="privacy__item">請求補充或更正。</li>
              <li class="privacy__item">
                請求停止蒐集、處理或利用（依法令或契約履行必要者除外）。
              </li>
              <li class="privacy__item">
                請求刪除（依法令保存或爭議處理必要者除外）。
              </li>
              <li class="privacy__item">
                行銷退訂：你可取消接收行銷訊息（系統/交易通知不在此限）。
              </li>
            </ul>

            <div class="privacy__reserve">
              <p class="privacy__reserveTitle">提醒</p>
              <p class="privacy__reserveText">
                若你請求停止處理或刪除必要資料，可能導致你無法使用部分服務（例如交易、寄送或客服查詢）。
              </p>
            </div>
          </article>

          <!-- p7 -->
          <article class="privacy__card" id="p7">
            <div class="privacy__cardTop">
              <span class="privacy__cardBadge">
                <span class="privacy__cardBadgeIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'envelope']" />
                </span>
                聯絡方式
              </span>
              <h3 class="privacy__cardTitle">隱私相關問題與申請</h3>
              <p class="privacy__cardDesc">
                若你要行使個資權利、反映隱私問題或詢問本政策內容，請透過客服管道與我們聯繫。
              </p>
            </div>

            <div class="privacy__contact">
              <div class="privacy__contactRow">
                <span class="privacy__contactKey">
                  <font-awesome-icon :icon="['fas', 'at']" />
                  客服信箱
                </span>
                <span class="privacy__contactVal">privacy@stardo.example</span>
              </div>

              <div class="privacy__contactRow">
                <span class="privacy__contactKey">
                  <font-awesome-icon :icon="['fas', 'clock']" />
                  客服時間
                </span>
                <span class="privacy__contactVal">以平台公告為準</span>
              </div>
            </div>

            <div class="privacy__callout" role="note">
              <span class="privacy__calloutIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'circle-info']" />
              </span>
              <p class="privacy__calloutText">
                上述信箱為範例字串。你可改成實際信箱，或改成從設定檔帶入。
              </p>
            </div>
          </article>
        </div>

        <div class="privacy__cta">
          <div class="privacy__ctaLeft">
            <p class="privacy__ctaTitle">也建議你一起閱讀</p>
            <p class="privacy__ctaDesc">
              「網站服務條款」「交易說明」「FAQ」可協助你更完整了解平台規則與使用方式。
            </p>
          </div>

          <div class="privacy__ctaRight">
            <button
              class="privacy__btn privacy__btn--primary"
              type="button"
              @click="goPolicy"
            >
              服務條款
            </button>
            <button
              class="privacy__btn privacy__btn--ghost"
              type="button"
              @click="goFaq"
            >
              FAQ
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const router = useRouter();
const year = computed(() => new Date().getFullYear());

const goHome = () => router.push({ name: 'Home' });
const goPolicy = () => router.push({ name: 'Policy' });
const goFaq = () => router.push({ name: 'Faq' });

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<style scoped lang="scss">
.privacy {
  background: linear-gradient(180deg, #f4e1cc 0%, #f8efe3 40%, #ffffff 100%);
  min-height: 100vh;
  position: relative;
  z-index: 9;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Hero */
  &__hero {
    background: #000;
    color: #fff;
    padding: 34px 0 28px;
  }

  &__heroInner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;

    display: grid;
    grid-template-columns: 1.12fr 0.88fr;
    gap: 24px;
    align-items: stretch;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    letter-spacing: 2px;
    font-weight: 900;
    color: rgba(229, 166, 87, 0.95);
    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.35);
    margin: 0 0 10px;
  }

  &__title {
    font-size: 34px;
    line-height: 1.15;
    margin: 0 0 10px;
    font-weight: 1000;
    letter-spacing: 0.2px;
  }

  &__subtitle {
    margin: 0 0 18px;
    font-size: 15px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.82);
    max-width: 640px;
  }

  &__heroActions {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  &__btn {
    height: 52px;
    padding: 0 18px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 15px;
    border: 0;
    cursor: pointer;
    letter-spacing: 1px;

    &--primary {
      background: #b2473a;
      color: #fff;
    }

    &--ghost {
      background: transparent;
      color: rgba(229, 166, 87, 0.95);
      border: 1px solid rgba(229, 166, 87, 0.55);
    }
  }

  &__hint {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    color: rgba(255, 255, 255, 0.78);
    font-size: 13px;
    line-height: 1.7;
    max-width: 640px;
  }

  &__hintIcon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;

    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.22);
    color: rgba(229, 166, 87, 0.95);
    flex: 0 0 auto;
  }

  &__heroRight {
    display: flex;
    justify-content: flex-end;
  }

  &__panel {
    width: 100%;
    max-width: 460px;
    border-radius: 18px;
    padding: 16px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.04)
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__panelHeader {
    margin-bottom: 10px;
  }

  &__panelTitle {
    margin: 0 0 6px;
    font-weight: 1000;
    letter-spacing: 1px;
    font-size: 16px;
  }

  &__panelDesc {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.78);
  }

  &__nav {
    margin-top: 12px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  &__chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px;
    border-radius: 14px;
    cursor: pointer;

    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);

    font-weight: 1000;
    letter-spacing: 0.4px;
    font-size: 14px;
    text-align: left;

    &:hover {
      border-color: rgba(229, 166, 87, 0.35);
    }
  }

  &__chipIcon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;

    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.22);
    color: rgba(229, 166, 87, 0.95);
    flex: 0 0 auto;
  }

  &__panelFooter {
    margin-top: 12px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  &__miniBtn {
    height: 40px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(0, 0, 0, 0.25);
    color: rgba(255, 255, 255, 0.9);
    font-weight: 900;
    cursor: pointer;

    &--gold {
      background: rgba(229, 166, 87, 0.9);
      border-color: rgba(229, 166, 87, 0.9);
      color: #000;
    }
  }

  /* Content */
  &__section {
    padding: 34px 0 40px;
  }

  &__header {
    margin-bottom: 14px;
  }

  &__h2 {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 1000;
    letter-spacing: 1px;
    color: #111;
  }

  &__desc {
    margin: 0;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.7;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  &__card {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__cardTop {
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__cardBadge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: rgba(178, 71, 58, 0.08);
    border: 1px solid rgba(178, 71, 58, 0.14);
    color: rgba(178, 71, 58, 0.95);
    font-weight: 1000;
    letter-spacing: 1px;
    font-size: 12px;
  }

  &__cardBadgeIcon {
    width: 22px;
    height: 22px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: rgba(178, 71, 58, 0.12);
  }

  &__cardTitle {
    margin: 10px 0 6px;
    font-weight: 1000;
    letter-spacing: 0.2px;
    font-size: 16px;
    color: #111;
  }

  &__cardDesc {
    margin: 0;
    line-height: 1.7;
    color: rgba(0, 0, 0, 0.7);
    font-size: 14px;
  }

  &__list {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 10px;
    color: rgba(0, 0, 0, 0.72);
    line-height: 1.85;
    font-size: 14px;
  }

  &__item {
    padding-left: 2px;
  }

  &__callout {
    margin-top: 12px;
    border-radius: 16px;
    padding: 12px 12px;
    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.25);
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  &__calloutIcon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;

    color: rgba(0, 0, 0, 0.9);
    background: rgba(229, 166, 87, 0.9);
    border: 1px solid rgba(229, 166, 87, 0.9);
  }

  &__calloutText {
    margin: 0;
    color: rgba(0, 0, 0, 0.72);
    line-height: 1.85;
    font-size: 13px;
  }

  &__reserve {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  &__reserveTitle {
    margin: 0 0 6px;
    font-weight: 1000;
    letter-spacing: 0.2px;
    color: #111;
  }

  &__reserveText {
    margin: 0;
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.75;
    font-size: 14px;
  }

  /* Contact */
  &__contact {
    display: grid;
    gap: 10px;
  }

  &__contactRow {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.65);
  }

  &__contactKey {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    color: rgba(0, 0, 0, 0.72);
    font-weight: 900;
  }

  &__contactVal {
    text-align: right;
    line-height: 1.5;
    color: rgba(0, 0, 0, 0.7);
    font-weight: 800;
  }

  /* CTA */
  &__cta {
    margin-top: 18px;
    border-radius: 18px;
    padding: 18px;
    background: linear-gradient(135deg, #b2473a, #7a1a12);
    color: #fff;

    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  &__ctaTitle {
    margin: 0 0 4px;
    font-weight: 1000;
    letter-spacing: 0.3px;
    font-size: 18px;
  }

  &__ctaDesc {
    margin: 0;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.7;
    font-size: 14px;
  }

  &__ctaRight {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  /* Footer */
  &__footer {
    padding: 18px 0 24px;
  }

  &__footerInner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__footerText {
    margin: 0;
    color: rgba(0, 0, 0, 0.6);
    font-size: 13px;
  }

  &__footerTop {
    height: 40px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.7);
    font-weight: 900;
    cursor: pointer;
  }

  /* RWD */
  @media (max-width: 1024px) {
    &__heroInner {
      grid-template-columns: 1fr;
    }

    &__heroRight {
      justify-content: flex-start;
    }

    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    &__container {
      padding: 0 16px;
    }

    &__heroInner {
      padding: 0 16px;
    }

    &__title {
      font-size: 28px;
    }

    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
