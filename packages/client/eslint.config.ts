import pluginVue from "eslint-plugin-vue";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },
  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dev-dist/**", "**/coverage/**"],
  },
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  {
    name: "app/pages",
    files: ["src/pages/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  skipFormatting,
);
