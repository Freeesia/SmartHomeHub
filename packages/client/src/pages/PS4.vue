<template>
  <v-row justify="center">
    <v-col cols="12" md="6">
      <v-card v-if="status">
        <v-img v-if="media" height="200px" :src="media" cover />
        <v-btn
          color="primary"
          style="position: absolute; top: 16px; right: 16px; opacity: 0.8"
          :loading="refreshing"
          :disabled="refreshing"
          icon="mdi-refresh"
          size="small"
          variant="flat"
          @click="refresh"
        />

        <v-card-title>{{ status["host-name"] }}</v-card-title>
        <v-card-text>{{ state }}</v-card-text>

        <v-card-actions>
          <v-tooltip :text="powerTo" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="secondary"
                variant="text"
                icon="mdi-power"
                :loading="powering"
                :disabled="powering"
                @click="power"
              />
            </template>
          </v-tooltip>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import axios from "axios";

interface Ps4Status {
  statusCode?: number;
  status?: string;
  "host-name"?: string;
  "running-app-name"?: string;
  "running-app-meta"?: { icons?: { icon?: string }[] };
  [key: string]: unknown;
}

const status = ref<Ps4Status | null>(null);
const refreshing = ref(false);
const powering = ref(false);

const state = computed(() => {
  if (!status.value) {
    return "Unknown";
  }
  return status.value["running-app-name"] ?? status.value.status ?? "Unknown";
});

const media = computed(
  () => status.value?.["running-app-meta"]?.icons?.[0]?.icon ?? null,
);

const powerTo = computed(() => {
  if (!status.value) {
    return "";
  }
  return status.value.statusCode == 200 ? "off" : "on";
});

async function refresh() {
  if (refreshing.value) {
    return;
  }
  refreshing.value = true;
  try {
    const res = await axios.get<Ps4Status>("/api/ps4");
    status.value = res.data;
  } finally {
    refreshing.value = false;
  }
}

async function power() {
  powering.value = true;
  try {
    await axios.post("/api/ps4/" + powerTo.value);
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    await refresh();
  } finally {
    powering.value = false;
  }
}

onMounted(refresh);
</script>
