import Vue from "vue";
import Component from "vue-class-component";

@Component({ template: require('./TestComponent.html') })
export default class TestComponent extends Vue {
  count = 0;
  inc() {
    this.count++;
  }
}