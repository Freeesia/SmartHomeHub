import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "@mdi/font/css/materialdesignicons.min.css";
import VueRouter from "vue-router";
import App from "./App";
import Home from "./pages/Home";
import PC from "./pages/PC";
import PS4 from "./pages/PS4";
import store from "./store";

Vue.use(VueRouter);
Vue.use(Vuetify);

const vuetify = new Vuetify({
  theme: {
    themes: {
      dark: {
        primary: "#604F8E",
        secondary: "#618573"
      }
    }
  }
});

const router = new VueRouter({
  mode: "history",
  routes: [
    { path: "/", component: Home },
    { path: "/pc", component: PC },
    { path: "/ps4", component: PS4 }
  ]
});

new Vue({
  router,
  store,
  vuetify,
  el: "#app",
  components: { App },
  template: "<App/>"
});

if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/service-worker.js");
    } catch (error) {
      console.log("SW registration failed: ", error);
    }
  });
}
