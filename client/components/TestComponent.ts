import Vue from "vue";
import Component from "vue-class-component";
import { State, Getter, Action, Mutation, namespace } from 'vuex-class';

const CountModule = namespace('CountState');

@Component({ template: require('./TestComponent.html') })
export default class TestComponent extends Vue {
  @CountModule.State
  count: number;
  @CountModule.Action
  incAsync: () => Promise<any>;
  isBusy = false;

  async inc() {
    this.isBusy = true;
    await this.incAsync();
    this.isBusy = false;
  }
}