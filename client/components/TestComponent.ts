import Vue from "vue";
import Component from "vue-class-component";

@Component({ template: require('./TestComponent.html') })
export default class TestComponent extends Vue {
  get count() {
    return this.$store.state.count;
  }
  inc() {
    this.$store.commit('increment');
  }
}