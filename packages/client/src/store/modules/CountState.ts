import { VuexModule, Mutation, Action, Module } from "vuex-module-decorators";

// TODO : 動的モジュールにしたいけど、localStorageに保存できなくなる
// https://github.com/championswimmer/vuex-module-decorators/pull/102
@Module({ namespaced: true, name: "CountState" })
export default class CountState extends VuexModule {
  count: number = 0;

  @Mutation
  public inc() {
    this.count++;
  }

  @Action
  public incAsync() {
    return new Promise<any>(res => {
      setTimeout(() => {
        this.inc();
        res();
      }, 1000);
    })
  }
}
