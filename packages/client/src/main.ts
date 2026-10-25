import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App).use(pinia).use(router).use(vuetify).mount("#app");
