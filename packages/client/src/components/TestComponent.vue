<template>
  <div>
    <v-btn color="primary" dark @click="inc" role="button">up</v-btn>
    <v-progress-circular v-if="isBusy" indeterminate color="primary"></v-progress-circular>
    <p>カウント {{ count }}</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { CountModule } from "../store/modules/CountState";

@Component({})
export default class TestComponent extends Vue {
  isBusy = false;

  public get count() {
    return CountModule.count;
  }

  async inc() {
    this.isBusy = true;
    await CountModule.incAsync();
    this.isBusy = false;
  }
}
</script>