import Vue from "vue";
import vuetify from "./plugins/vuetify";
import VueRouter from "vue-router";
import App from "./App";
import Home from "./pages/Home";
import PC from "./pages/PC";
import PS4 from "./pages/PS4";
import store from "./store";

Vue.use(VueRouter);

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
