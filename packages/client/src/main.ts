import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import VueRouter from "vue-router";
import "./registerServiceWorker";
import vuetify from './plugins/vuetify';
import Home from './pages/Home.vue';
import PC from './pages/PC.vue';
import PS4 from './pages/PS4.vue';
import Login from './pages/Login.vue';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  routes: [
    { path: "/", component: Home },
    { path: "/pc", component: PC },
    { path: "/ps4", component: PS4 },
    { path: "/login", component: Login }
  ]
});

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
