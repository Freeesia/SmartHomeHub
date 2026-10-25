<template>
  <v-form
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
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import type { VForm } from "vuetify/components";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const router = useRouter();
const form = useTemplateRef<VForm>("form");

const valid = ref<boolean | null>(null);
const name = ref("");
const nameRules = [(v?: string) => !!v || "Name is required"];
const password = ref("");
const passwordRules = [(v?: string) => !!v || "Password is required"];
const submitting = ref(false);

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
