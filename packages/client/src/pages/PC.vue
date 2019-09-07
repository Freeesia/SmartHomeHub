<template>
  <div>
    <v-data-table :headers="headers" :items="items" hide-default-footer class="elevation-1">
      <template v-slot:item.name="{ item }">
        <v-chip dark>{{ item }}</v-chip>
      </template>
      <template v-slot:item.action="{ item }">
        <v-btn color="secondary" text icon @click="powerOn(item)">
          <v-icon>power_settings_new</v-icon>
        </v-btn>
      </template>
      <template slot="no-data">
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>
    <v-snackbar v-model="snackbar" :color="snackColor">
      {{ snackText }}
      <v-btn dark text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Axios from "axios";

@Component({})
export default class PC extends Vue {
  headers = [
    { text: "PC名", value: "name" },
    { text: "操作", value: "action", sortable: false }
  ];
  items: string[] = [];
  snackbar = false;
  snackText = "";
  snackColor = "";

  created() {
    this.initialize();
  }

  async initialize() {
    const res = await Axios.get("/api/pc");
    this.items = res.data;
  }

  async powerOn(item: string) {
    try {
      await Axios.post(`/api/pc/${item}/on`);
      this.snackColor = "success";
      this.snackText = "OK";
    } catch (error) {
      this.snackColor = "error";
      this.snackText = error;
    }
    this.snackbar = true;
  }
}
</script>
