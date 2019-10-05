import { VuexModule, Mutation, Action, Module, getModule } from "vuex-module-decorators";
import store from "@/store";

@Module({ dynamic: true, store, name: "CountState"})
class CountState extends VuexModule {
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

export const CountModule = getModule(CountState);