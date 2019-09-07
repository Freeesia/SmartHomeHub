import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      dark: {
        primary: "#604F8E",
        secondary: "#618573"
      },
      light: {
        primary: "#604F8E",
        secondary: "#618573"
      }
    }
  }
});
