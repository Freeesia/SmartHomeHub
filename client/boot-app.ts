import Vue from 'vue';
import App from './App';

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const res = await navigator.serviceWorker.register('/service-worker.js');
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  });
}