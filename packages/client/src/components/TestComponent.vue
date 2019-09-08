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
import { State, Getter, Action, Mutation, namespace } from "vuex-class";

const CountModule = namespace("CountState");

@Component({})
export default class TestComponent extends Vue {
  @CountModule.State
  count!: number;
  @CountModule.Action
  incAsync!: () => Promise<any>;
  isBusy = false;

  async inc() {
    this.isBusy = true;
    await this.incAsync();
    this.isBusy = false;
  }
}
</script>