<template>
  <div>
    <h1 class="display-2">
      Wellcome to
      <p>Smart Home Hub</p>
    </h1>
    <test-component></test-component>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TestComponent from "../components/TestComponent.vue";

@Component({ components: { TestComponent } })
export default class Home extends Vue {}
</script>
