import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './presentation/router';

import './assets/styles/reset.css';
import './assets/styles/tokens.css';
import './assets/styles/utilities.css';
import './assets/styles/animations.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
