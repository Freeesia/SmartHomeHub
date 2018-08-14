import Vue from 'vue';
const Vuetify = require('vuetify');
import 'vuetify/dist/vuetify.min.css';
import App from './App';

Vue.use(Vuetify);

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
});

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  });
}