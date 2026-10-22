<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="items"
      hide-default-footer
      class="elevation-1"
    >
      <template #[`item.action`]="{ item }">
        <v-btn
          color="secondary"
          variant="text"
          icon="mdi-power"
          @click="powerOn(item.name)"
        />
      </template>
      <template #no-data>
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>
    <v-snackbar v-model="snackbar" :color="snackColor">
      {{ snackText }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import axios from "axios";

const headers = [
  { title: "PC名", key: "name", sortable: false },
  { title: "操作", key: "action", sortable: false },
];
const pcs = ref<string[]>([]);
const items = computed(() => pcs.value.map((name) => ({ name })));
const snackbar = ref(false);
const snackText = ref("");
const snackColor = ref("");

async function initialize() {
  const res = await axios.get<string[]>("/api/pc");
  pcs.value = res.data;
}

async function powerOn(name: string) {
  try {
    await axios.post(`/api/pc/${encodeURIComponent(name)}/on`);
    snackColor.value = "success";
    snackText.value = "OK";
  } catch (error) {
    snackColor.value = "error";
    snackText.value = String(error);
  }
  snackbar.value = true;
}

onMounted(initialize);
</script>
