import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";

const colors = {
  primary: "#604F8E",
  secondary: "#618573",
};

export default createVuetify({
  theme: {
    defaultTheme: "system",
    themes: {
      light: { colors },
      dark: { colors },
    },
  },
});
