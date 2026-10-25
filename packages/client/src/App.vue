<template>
  <v-app>
    <v-navigation-drawer v-if="user" :rail="!drawer" permanent>
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menus"
          :key="item.key"
          :to="item.key"
          :prepend-icon="item.icon"
          :title="item.label"
        />
      </v-list>
    </v-navigation-drawer>
    <v-app-bar density="compact" color="primary">
      <template v-if="user" #prepend>
        <v-app-bar-nav-icon
          role="switch"
          aria-label="menu"
          :aria-checked="drawer"
          @click.stop="drawer = !drawer"
        />
      </template>
      <v-app-bar-title>Smart Home Hub</v-app-bar-title>
      <template #append>
        <v-menu v-if="user">
          <template #activator="{ props }">
            <v-btn variant="text" v-bind="props">{{ user.sn }}</v-btn>
          </template>
          <v-list>
            <v-list-item title="Logout" @click="logout" />
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    <v-footer app />
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { useUserStore } from "@/stores/user";

const menus = [
  { key: "/", label: "Home", icon: "mdi-home" },
  { key: "/pc", label: "PC", icon: "mdi-monitor" },
  { key: "/ps4", label: "PS4", icon: "mdi-sony-playstation" },
  { key: "/remo", label: "Nature Remo", icon: "mdi-remote" },
];

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const { mdAndUp } = useDisplay();

const drawer = ref(mdAndUp.value);
const user = computed(() => userStore.user);

async function logout() {
  await userStore.logout();
  await router.push("/login");
}

onMounted(async () => {
  await userStore.loginToken();
  await router.isReady();
  if (!user.value && route.path !== "/login") {
    await router.push("/login");
  }
});
</script>
