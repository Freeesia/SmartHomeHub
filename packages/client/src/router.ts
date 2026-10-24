import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: Home },
    { path: "/pc", component: () => import("./pages/PC.vue") },
    { path: "/ps4", component: () => import("./pages/PS4.vue") },
    { path: "/login", component: () => import("./pages/Login.vue") },
  ],
});
