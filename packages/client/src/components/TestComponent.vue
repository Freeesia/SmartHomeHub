<template>
  <div>
    <v-btn color="primary" role="button" @click="inc">up</v-btn>
    <v-progress-circular v-if="isBusy" indeterminate color="primary" />
    <p>カウント {{ countStore.count }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCountStore } from "@/stores/count";

const countStore = useCountStore();
const isBusy = ref(false);

async function inc() {
  isBusy.value = true;
  await countStore.incAsync();
  isBusy.value = false;
}
</script>
