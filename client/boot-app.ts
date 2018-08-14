import Vue from 'vue';
const Vuetify = require('vuetify');
import 'vuetify/dist/vuetify.min.css';
import VueRouter from 'vue-router';
import App from './App';
import Home from './pages/Home';

Vue.use(VueRouter)
Vue.use(Vuetify);

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
  ]
});

new Vue({
  router,
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