import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Smart Home Hub",
        short_name: "SmartHomeHub",
        description: "このアプリはスマートホーム機器の仲介となるハブアプリです",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#604F8E",
        icons: [
          {
            src: "/img/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/img/icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "../../dist/public",
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 8080,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
