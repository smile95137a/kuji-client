import { createApp } from 'vue';
import App from './App.vue';

// Styles
import './assets/styles/main.scss';

// Router / Store
import router from '@/router';
import { createPinia } from 'pinia';

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

// GSAP
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

// Register GSAP plugins
gsap.registerPlugin(Draggable);

// Load all solid icons
Object.values(solidIcons).forEach((icon: any) => {
  if (icon?.iconName) library.add(icon);
});

const app = createApp(App);

// Global component
app.component('font-awesome-icon', FontAwesomeIcon);

app.use(createPinia()).use(router).mount('#app');
