<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { StoreDetail, StoreBusinessHours } from '@/services/storeService';

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

const businessHoursText = computed(() => {
  const hours = props.store.businessHours as StoreBusinessHours;

  if (!hours) {
    return '';
  }

  if (typeof hours === 'string') {
    return hours;
  }

  const openDays = Object.values(hours).filter((day) => !day.isClosed);
  if (openDays.length === 0) {
    return '目前無固定營業時間';
  }

  const sameHours = openDays.every(
    (day) => day.open === openDays[0].open && day.close === openDays[0].close,
  );

  if (openDays.length === 7 && sameHours) {
    return `每日 ${openDays[0].open} - ${openDays[0].close}`;
  }

  return '請見下方營業時間表';
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
        {{ store.isActive ? '營運中' : '暫停服務' }}
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
      <div v-if="store.address" class="storeProfileCard__metaItem">
        <span class="storeProfileCard__metaLabel">地址</span>
        <p class="storeProfileCard__metaValue">{{ store.address }}</p>
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
        <span class="storeProfileCard__metaLabel">營業時間</span>
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

.storeProfileCard__logo {
  opacity: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.25rem;
  border: 1px solid rgba(180, 68, 43, 0.15);
  box-shadow: 0 12px 28px rgba(80, 42, 20, 0.16);
  background: #fff;
  transition: opacity 0.2s ease;
}

.storeProfileCard__logo--ready {
  opacity: 1;
}

.storeProfileCard__logoSkeleton {
  position: absolute;
  inset: 0;
  border-radius: 1.25rem;
  background: linear-gradient(90deg, #f2ebe6 25%, #faf6f2 50%, #f2ebe6 75%);
  background-size: 200% 100%;
  animation: storeProfileShimmer 1.2s linear infinite;
}

.storeProfileCard__logoFallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(180, 68, 43, 0.15);
  background: linear-gradient(135deg, #b4442b, #e2a162);
  color: #fff9f5;
  font-size: 1.8rem;
  font-weight: 800;
}

.storeProfileCard__intro {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.storeProfileCard__name {
  margin: 0;
  color: var(--store-ink);
  font-size: clamp(1.9rem, 3vw, 2.8rem);
  font-weight: 900;
  line-height: 1.05;
}

.storeProfileCard__short {
  margin: 0;
  color: var(--store-accent);
  font-size: 1rem;
  font-weight: 700;
}

.storeProfileCard__long {
  margin: 0;
  color: var(--store-muted);
  line-height: 1.8;
  font-size: 0.96rem;
}

.storeProfileCard__metaGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.storeProfileCard__metaItem {
  min-height: 6.25rem;
  padding: 1rem;
  border-radius: 1.1rem;
  border: 1px solid var(--store-line);
  background: rgba(255, 255, 255, 0.82);
}

.storeProfileCard__metaLabel {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--store-muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.storeProfileCard__metaValue,
.storeProfileCard__metaLink {
  margin: 0;
  color: var(--store-ink);
  font-size: 0.95rem;
  line-height: 1.7;
  text-decoration: none;
  word-break: break-word;
}

.storeProfileCard__metaLink:hover {
  color: var(--store-accent);
}

.storeProfileCard__socials {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
}

.storeProfileCard__social {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  border: 1px dashed rgba(180, 68, 43, 0.28);
  background: rgba(255, 248, 243, 0.85);
  text-decoration: none;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.storeProfileCard__social:hover {
  transform: translateY(-2px);
  border-color: rgba(180, 68, 43, 0.46);
  background: rgba(255, 243, 235, 0.96);
}

.storeProfileCard__socialLabel {
  color: var(--store-accent);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.storeProfileCard__socialValue {
  color: var(--store-ink);
  font-size: 0.9rem;
  word-break: break-word;
}

@keyframes storeProfileShimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 767px) {
  .storeProfileCard {
    padding: 1.25rem;
  }

  .storeProfileCard__hero {
    grid-template-columns: 1fr;
  }

  .storeProfileCard__logoWrap,
  .storeProfileCard__logoFallback {
    width: 4.5rem;
    height: 4.5rem;
  }

  .storeProfileCard__metaGrid {
    grid-template-columns: 1fr;
  }
}
</style>
