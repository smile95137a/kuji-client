<template>
  <section class="books-trending">
    <h2>Trending this week</h2>
    <p>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Repudiandae quam
      magnam obcaecati error consequatur repellat fugiat, deleniti nisi eum
      voluptates.
    </p>
    <div class="swiper-container">
      <div class="swiper">
        <div class="swiper-wrapper">
          <div class="swiper-slide swiper-slide--one">
            <div class="slide-content">
              <h3>Jane Eyre</h3>
              <p>
                Jane Eyre is divided into 38 chapters. It was originally
                published in three volumes in the 19th century...
              </p>
            </div>
            <div class="author">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=870&q=80"
                alt="Jane Eyre"
              />
              <span>Charlotte Brontë</span>
              <ul>
                <li v-for="n in 3" :key="`one-${n}`">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </li>
              </ul>
            </div>
          </div>

          <div class="swiper-slide swiper-slide--two">
            <div class="slide-content">
              <h3>The Lord of the Rings</h3>
              <p>
                Epic high-fantasy novel by the English author and scholar J. R.
                R. Tolkien
              </p>
            </div>
            <div class="author">
              <img
                src="https://images.pexels.com/photos/874158/pexels-photo-874158.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="J. R. R. Tolkien"
              />
              <span>J. R. R. Tolkien</span>
              <ul>
                <li v-for="n in 4" :key="`two-${n}`">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </li>
              </ul>
            </div>
          </div>

          <div class="swiper-slide swiper-slide--three">
            <div class="slide-content">
              <h3>All Quiet on the Western Front</h3>
              <p>
                The book describes the German soldiers' extreme physical and
                mental trauma during the war
              </p>
            </div>
            <div class="author">
              <img
                src="https://images.pexels.com/photos/262391/pexels-photo-262391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Erich Maria Remarque"
              />
              <span>Erich Maria Remarque</span>
              <ul>
                <li v-for="n in 4" :key="`three-${n}`">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </li>
              </ul>
            </div>
          </div>

          <div class="swiper-slide swiper-slide--four">
            <div class="slide-content">
              <h3>Romeo and Juliet</h3>
              <p>a tragedy between two youths from feuding families</p>
            </div>
            <div class="author">
              <img
                src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="William Shakespeare"
              />
              <span>William Shakespeare</span>
              <ul>
                <li v-for="n in 4" :key="`four-${n}`">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </li>
              </ul>
            </div>
          </div>

          <div class="swiper-slide swiper-slide--five">
            <div class="slide-content">
              <h3>Of Mice and Men</h3>
              <p>a novell</p>
            </div>
            <div class="author">
              <img
                src="https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="John Steinbeck"
              />
              <span>John Steinbeck</span>
              <ul>
                <li v-for="n in 4" :key="`five-${n}`">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </li>
              </ul>
            </div>
          </div>

          <div class="swiper-slide swiper-slide--six">
            <div class="slide-content">
              <h3>Harry Potter</h3>
              <p>
                The novels chronicle the lives of a young wizard, Harry Potter,
                and his friends Hermione Granger and Ron Weasley
              </p>
            </div>
            <div class="author">
              <img
                src="https://images.unsplash.com/photo-1553514029-1318c9127859?auto=format&fit=crop&w=464&q=80"
                alt="J. K. Rowling"
              />
              <span>J. K. Rowling</span>
              <ul>
                <li v-for="n in 4" :key="`six-${n}`">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="swiper-button-prev">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
          />
        </svg>
      </div>
      <div class="swiper-button-next">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
          />
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import Swiper from 'swiper';
import {
  Navigation,
  Keyboard,
  Mousewheel,
  EffectCoverflow,
} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

let swiperInstance: Swiper | null = null;

onMounted(() => {
  swiperInstance = new Swiper('.swiper', {
    modules: [Navigation, Keyboard, Mousewheel, EffectCoverflow],

    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 4,
      slideShadows: true,
    },
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    keyboard: {
      enabled: true,
    },
    mousewheel: {
      thresholdDelta: 70,
    },
    breakpoints: {
      560: {
        slidesPerView: 2.5,
      },
      768: {
        slidesPerView: 3,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });
});

onBeforeUnmount(() => {
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
    swiperInstance = null;
  }
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Courgette&family=Noto+Serif+Vithkuqi:wght@500&family=Quicksand:wght@300&family=Satisfy&family=Shadows+Into+Light&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Chonburi&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.books-trending {
  position: relative;
  width: calc(min(47rem, 90%));
  margin: 0 auto;
  min-height: 100vh;
  column-gap: 3rem;
  padding-block: min(20vh, 3rem);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;

  h2 {
    letter-spacing: 0.8px;
    font-weight: 700;
    font-size: 2.6rem;
    line-height: 1.2;
  }

  p {
    font-size: 0.9rem;
    max-width: 680px;
    line-height: 1.6;
    margin-inline: auto;
    margin-top: 10px;
  }
}

.swiper-container {
  position: relative;
}

.swiper {
  width: 100%;
  padding: 60px 0 95px 0;
}

.swiper-slide {
  width: 10rem;
  height: 22rem;
  display: flex;
  flex-direction: column;
  align-items: self-start;
  position: relative;
  border-radius: 12px;
  box-shadow: -1px 5px 15px #0000001f;

  h3 {
    color: #fff;
    font-size: 2.5rem;
    line-height: 1.4;
    margin-bottom: 0.625rem;
    letter-spacing: 0.8px;
    position: relative;
  }

  p {
    color: #fff;
    line-height: 1.6;
    font-size: 0.8rem;
  }

  .slide-content {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -45%);
    width: 90%;
  }

  .author {
    grid-template-columns: 1fr;
    justify-items: center;
    position: absolute;
    bottom: -90px;
    width: 100%;
    display: none;
    opacity: 0;

    span {
      color: #111;
      display: block;
      margin: 5px 0 10px 0;
      font-weight: 600;
      font-size: 0.9rem;
    }

    img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 50%;
      border: 3.5px solid white;
    }

    ul {
      display: flex;
      align-items: center;

      li {
        svg {
          width: 20px;
          color: orange;
        }
      }
    }
  }
}

.swiper-slide-active .author {
  display: grid;
  opacity: 1;
}

.swiper-slide--one {
  background: #0575e6;
  background: -webkit-linear-gradient(to bottom, #021b79, #0575e6);
  background: linear-gradient(to bottom, #021b79, #0575e6);

  h3 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
  }
}

.swiper-slide--two {
  background: #23074d;
  background: -webkit-linear-gradient(to bottom, #cc5333, #23074d);
  background: linear-gradient(to bottom, #cc5333, #23074d);

  h3 {
    font-family: 'Quicksand', sans-serif;
  }
}

.swiper-slide--three {
  background: #159957;

  h3 {
    font-family: 'Satisfy', cursive;
    font-weight: 300;
  }
}

.swiper-slide--four {
  background: #b06ab3;

  h3 {
    font-family: 'Courgette', cursive;
    font-weight: 300;
  }
}

.swiper-slide--five {
  background: #093028;
  background: -webkit-linear-gradient(to bottom, #237a57, #093028);
  background: linear-gradient(to bottom, #237a57, #093028);

  h3 {
    font-family: 'Noto Serif Vithkuqi', serif;
    font-weight: 300;
  }
}

.swiper-slide--six {
  background: #b9f;
  background: -webkit-linear-gradient(to bottom, #b9f, #3b2421);
  background: linear-gradient(to bottom, #b9f, #3b2421);

  h3 {
    font-family: 'Chonburi', cursive;
    font-weight: 400;
  }
}

.swiper-button-prev {
  background: white;
  border-radius: 50%;
  top: 47%;
  left: -30px;
  width: 50px;
  height: 50px;
  box-shadow: 0px 2px 11px rgb(0 0 0 / 17%);

  &::after {
    font-size: 1.4rem;
    content: '';
  }

  svg {
    width: 25px;
  }
}

.swiper-button-next {
  background: white;
  border-radius: 50%;
  top: 47%;
  right: -30px;
  width: 50px;
  height: 50px;
  box-shadow: 0px 2px 11px rgb(0 0 0 / 17%);

  &::after {
    font-size: 1.4rem;
    content: '';
  }

  svg {
    width: 25px;
  }
}

.swiper-button-prev,
.swiper-button-next {
  display: none;

  @media (min-width: 760px) {
    display: flex;
  }
}
</style>
