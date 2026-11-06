<template>
  <div>
    <v-alert v-if="ssoError" type="error" variant="tonal" class="mb-4">
      Sign-in failed. Please try again.
    </v-alert>

    <v-btn
      v-if="methods.oidc"
      class="ma-1 mb-4"
      color="primary"
      prepend-icon="mdi-key"
      href="/api/user/oidc/login"
      :loading="redirecting"
      @click="redirecting = true"
    >
      Sign in with StudioFreesia ID
    </v-btn>

    <v-form
      v-if="methods.password"
      ref="form"
      v-model="valid"
      validate-on="lazy"
      @submit.prevent="submit"
    >
      <v-text-field
        v-model="name"
        label="Name"
        :rules="nameRules"
        prepend-icon="mdi-account"
        type="text"
        autocomplete="username"
        required
      />
      <v-text-field
        v-model="password"
        label="Password"
        :rules="passwordRules"
        prepend-icon="mdi-lock"
        type="password"
        autocomplete="current-password"
        required
      />

      <v-btn
        type="submit"
        class="ma-1"
        color="primary"
        :loading="submitting"
        :disabled="valid === false"
      >
        submit
      </v-btn>
      <v-btn class="ma-1" @click="clear">clear</v-btn>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import type { VForm } from "vuetify/components";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const form = useTemplateRef<VForm>("form");

const methods = ref({ password: false, oidc: false });
const ssoError = ref(false);
const redirecting = ref(false);

const valid = ref<boolean | null>(null);
const name = ref("");
const nameRules = [(v?: string) => !!v || "Name is required"];
const password = ref("");
const passwordRules = [(v?: string) => !!v || "Password is required"];
const submitting = ref(false);

onMounted(async () => {
  if (route.query.sso) {
    // Returned from the identity provider: the server session is set, fetch the JWT.
    try {
      await userStore.loginSession();
      await router.replace("/");
      return;
    } catch (error) {
      console.log(error);
      ssoError.value = true;
    }
  }
  if (route.query.error) {
    ssoError.value = true;
  }
  try {
    const res = await axios.get<{ password: boolean; oidc: boolean }>(
      "/api/user/methods",
    );
    methods.value = res.data;
  } catch {
    // Older servers do not report their methods; keep the password form.
    methods.value = { password: true, oidc: false };
  }
});

async function submit() {
  const result = await form.value?.validate();
  if (!result?.valid) {
    return;
  }
  submitting.value = true;
  try {
    await userStore.login({
      username: name.value,
      password: password.value,
    });
    await router.push("/");
  } catch (error) {
    console.log(error);
  }
  submitting.value = false;
}

function clear() {
  form.value?.reset();
}
</script>
