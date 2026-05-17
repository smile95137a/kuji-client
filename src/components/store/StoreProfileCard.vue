<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { StoreDetail } from '@/services/storeService';
import {
  formatBusinessHoursSummary,
  getTodayBusinessHoursRow,
} from '@/utils/businessHours';

const props = defineProps<{
  store: StoreDetail;
}>();

type SocialLink = {
  key: string;
  label: string;
  value: string;
  href: string;
};

const shortDescription = computed(
  () => props.store.shortDescription || props.store.description || '',
);

const storeDescription = computed(() => {
  if (props.store.longDescription) {
    return props.store.longDescription;
  }

  const fallback = props.store.description || '';
  return fallback !== shortDescription.value ? fallback : '';
});

const storeInitial = computed(() => {
  const first = String(props.store.name ?? '').trim().charAt(0);
  return first || '店';
});

const logoLoaded = ref(false);
const logoBroken = ref(false);

watch(
  () => props.store.logoUrl,
  () => {
    logoLoaded.value = false;
    logoBroken.value = false;
  },
  { immediate: true },
);

const onLogoLoad = () => {
  logoLoaded.value = true;
};

const onLogoError = () => {
  logoBroken.value = true;
  logoLoaded.value = false;
};

const businessHoursText = computed(() =>
  formatBusinessHoursSummary(props.store.businessHours ?? null),
);

const todayHoursText = computed(() => {
  const row = getTodayBusinessHoursRow(props.store.businessHours ?? null);
  if (!row) return '';
  return row.isClosed ? '今日公休' : `今日 ${row.open} - ${row.close}`;
});

const mapHref = computed(() => {
  const address = String(props.store.address ?? '').trim();
  if (!address) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
});

const socialLinks = computed<SocialLink[]>(() => {
  const links: SocialLink[] = [];

  if (props.store.facebookUrl) {
    links.push({
      key: 'facebook',
      label: 'Facebook',
      value: props.store.facebookUrl,
      href: props.store.facebookUrl,
    });
  }

  if (props.store.instagramUrl) {
    links.push({
      key: 'instagram',
      label: 'Instagram',
      value: props.store.instagramUrl,
      href: props.store.instagramUrl,
    });
  }

  if (props.store.lineId) {
    const lineId = props.store.lineId.startsWith('@')
      ? props.store.lineId.slice(1)
      : props.store.lineId;

    links.push({
      key: 'line',
      label: 'LINE',
      value: props.store.lineId,
      href: `https://line.me/R/ti/p/@${lineId}`,
    });
  }

  return links;
});
</script>

<template>
  <section class="storeProfileCard">
    <div class="storeProfileCard__badgeRow">
      <span class="storeProfileCard__eyebrow">KUJI STORE</span>
      <span
        class="storeProfileCard__status"
        :class="{ 'storeProfileCard__status--inactive': !store.isActive }"
      >
        {{ store.isActive ? '營業中' : '未營業' }}
      </span>
    </div>

    <div class="storeProfileCard__hero">
      <div v-if="store.logoUrl && !logoBroken" class="storeProfileCard__logoWrap">
        <img
          :src="store.logoUrl"
          :alt="store.name"
          class="storeProfileCard__logo"
          :class="{ 'storeProfileCard__logo--ready': logoLoaded }"
          @load="onLogoLoad"
          @error="onLogoError"
        />
        <div v-if="!logoLoaded" class="storeProfileCard__logoSkeleton"></div>
      </div>
      <div v-else class="storeProfileCard__logoFallback">{{ storeInitial }}</div>

      <div class="storeProfileCard__intro">
        <h1 class="storeProfileCard__name">{{ store.name }}</h1>
        <p v-if="shortDescription" class="storeProfileCard__short">
          {{ shortDescription }}
        </p>
        <p v-if="storeDescription" class="storeProfileCard__long">
          {{ storeDescription }}
        </p>
      </div>
    </div>

    <div class="storeProfileCard__metaGrid">
      <div v-if="todayHoursText" class="storeProfileCard__metaItem">
        <span class="storeProfileCard__metaLabel">今日營業</span>
        <p class="storeProfileCard__metaValue">{{ todayHoursText }}</p>
      </div>

      <div v-if="store.address" class="storeProfileCard__metaItem">
        <span class="storeProfileCard__metaLabel">地址</span>
        <div class="storeProfileCard__metaStack">
          <p class="storeProfileCard__metaValue">{{ store.address }}</p>
          <a
            v-if="mapHref"
            class="storeProfileCard__metaLink storeProfileCard__metaLink--inline"
            :href="mapHref"
            target="_blank"
            rel="noreferrer noopener"
          >
            在地圖開啟
          </a>
        </div>
      </div>

      <div v-if="store.phone" class="storeProfileCard__metaItem">
        <span class="storeProfileCard__metaLabel">電話</span>
        <a class="storeProfileCard__metaLink" :href="`tel:${store.phone}`">{{ store.phone }}</a>
      </div>

      <div v-if="store.email" class="storeProfileCard__metaItem">
        <span class="storeProfileCard__metaLabel">Email</span>
        <a class="storeProfileCard__metaLink" :href="`mailto:${store.email}`">{{ store.email }}</a>
      </div>

      <div v-if="businessHoursText" class="storeProfileCard__metaItem">
        <span class="storeProfileCard__metaLabel">營業摘要</span>
        <p class="storeProfileCard__metaValue">{{ businessHoursText }}</p>
      </div>
    </div>

    <div v-if="socialLinks.length > 0" class="storeProfileCard__socials">
      <a
        v-for="item in socialLinks"
        :key="item.key"
        :href="item.href"
        target="_blank"
        rel="noreferrer noopener"
        class="storeProfileCard__social"
      >
        <span class="storeProfileCard__socialLabel">{{ item.label }}</span>
        <span class="storeProfileCard__socialValue">{{ item.value }}</span>
      </a>
    </div>
  </section>
</template>

<style scoped lang="scss">
.storeProfileCard {
  --store-accent: #b4442b;
  --store-ink: #201714;
  --store-muted: #6c5b55;
  --store-line: rgba(93, 58, 40, 0.14);
  --store-panel: rgba(255, 250, 245, 0.9);

  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  border: 1px solid var(--store-line);
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top right, rgba(214, 130, 72, 0.18), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), var(--store-panel));
  box-shadow: 0 20px 50px rgba(80, 42, 20, 0.08);
}

.storeProfileCard__badgeRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.storeProfileCard__eyebrow,
.storeProfileCard__status {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.42rem 0.85rem;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.storeProfileCard__eyebrow {
  color: var(--store-accent);
  background: rgba(180, 68, 43, 0.08);
}

.storeProfileCard__status {
  color: #1f6c47;
  background: rgba(46, 149, 96, 0.12);
}

.storeProfileCard__status--inactive {
  color: #8b2d2d;
  background: rgba(186, 64, 64, 0.12);
}

.storeProfileCard__hero {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: start;
}

.storeProfileCard__logoWrap {
  position: relative;
  width: 5.5rem;
  height: 5.5rem;
}

.storeProfileCard__logo,
.storeProfileCard__logoFallback,
.storeProfileCard__logoSkeleton {
  width: 100%;
  height: 100%;
  border-radius: 1.25rem;
}

.storeProfileCard__logo {
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.18s ease;
}

.storeProfileCard__logo--ready {
  opacity: 1;
}

.storeProfileCard__logoSkeleton,
.storeProfileCard__logoFallback {
  display: grid;
  place-items: center;
  background: rgba(180, 68, 43, 0.12);
  color: var(--store-accent);
  font-size: 1.9rem;
  font-weight: 800;
}

.storeProfileCard__logoSkeleton {
  position: absolute;
  inset: 0;
  animation: pulse 1.4s ease infinite;
}

.storeProfileCard__intro {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.storeProfileCard__name {
  margin: 0;
  font-size: clamp(1.8rem, 2.6vw, 2.4rem);
  line-height: 1.1;
  color: var(--store-ink);
}

.storeProfileCard__short,
.storeProfileCard__long,
.storeProfileCard__metaValue,
.storeProfileCard__metaLink,
.storeProfileCard__socialValue {
  margin: 0;
  color: var(--store-muted);
  line-height: 1.7;
}

.storeProfileCard__metaGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.storeProfileCard__metaItem,
.storeProfileCard__social {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem;
  border: 1px solid rgba(93, 58, 40, 0.1);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.72);
}

.storeProfileCard__metaLabel,
.storeProfileCard__socialLabel {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--store-accent);
}

.storeProfileCard__metaStack {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.storeProfileCard__metaLink,
.storeProfileCard__social {
  text-decoration: none;
}

.storeProfileCard__metaLink--inline {
  font-size: 0.88rem;
  font-weight: 700;
}

.storeProfileCard__socials {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

@media (max-width: 767px) {
  .storeProfileCard {
    padding: 1.1rem;
  }

  .storeProfileCard__hero {
    grid-template-columns: 1fr;
  }
}
</style>
