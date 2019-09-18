<template>
  <v-layout>
    <v-flex xs12 md6 offset-md3>
      <v-card v-if="status">
        <v-img height="200px" v-if="media" :src="media"></v-img>
        <v-btn
          color="primary"
          style="top:16px; opacity: 0.8"
          :loading="refreshing"
          :disabled="refreshing"
          dark
          depressed
          absolute
          right
          fab
          small
          @click="refresh"
        >
          <v-icon>refresh</v-icon>
        </v-btn>

        <v-card-title>{{ status["host-name"] }}</v-card-title>
        <v-card-text>{{ state }}</v-card-text>

        <v-card-actions>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                color="secondary"
                text
                icon
                v-on="on"
                :loading="powering"
                :disabled="powering"
                @click="power"
              >
                <v-icon>power_settings_new</v-icon>
              </v-btn>
            </template>
            <span>{{ powerTo }}</span>
          </v-tooltip>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Axios from "axios";

@Component({})
export default class PS4 extends Vue {
  status: any = null;
  refreshing = false;
  powering = false;

  get state(): string {
    if (this.status["running-app-name"]) {
      return this.status["running-app-name"];
    } else if (this.status) {
      return this.status.status;
    } else {
      return "Unknown";
    }
  }

  get media(): string | null {
    if (
      this.status &&
      this.status["running-app-meta"] &&
      this.status["running-app-meta"].icons[0].icon
    ) {
      return this.status["running-app-meta"].icons[0].icon;
    } else {
      return null;
    }
  }

  get powerTo(): string {
    if (this.status) {
      return this.status.statusCode == 200 ? "off" : "on";
    } else {
      return "";
    }
  }

  created() {
    this.refresh();
  }

  async refresh() {
    if (this.refreshing) {
      return;
    }
    this.refreshing = true;
    let res = await Axios.get("/api/ps4");
    this.status = res.data;
    this.refreshing = false;
  }

  async power() {
    this.powering = true;
    await Axios.post("/api/ps4/" + this.powerTo);
    await new Promise<any>(res => setTimeout(() => res(), 2000));
    await this.refresh();
    this.powering = false;
  }
}
</script>
