import Vue from 'vue';
const Vuetify = require('vuetify');
import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import VueRouter from 'vue-router';
import App from './App';
import Home from './pages/Home';
import store from './store';

Vue.use(VueRouter)
Vue.use(Vuetify, {
  theme: {
    primary: '#604F8E',
    secondary: '#618573',
  }
});

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
  ]
});

new Vue({
  router,
  store,
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