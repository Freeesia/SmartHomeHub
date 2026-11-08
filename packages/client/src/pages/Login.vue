<template>
  <v-alert v-if="route.query.error" type="error" variant="tonal" class="mb-4">
    Sign-in failed. Please try again.
  </v-alert>
  <v-btn color="primary" prepend-icon="mdi-key" href="/api/user/oidc/login">
    Sign in with StudioFreesia ID
  </v-btn>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

onMounted(async () => {
  if (route.query.sso) {
    await userStore.login();
    await router.replace("/");
  }
});
</script>
