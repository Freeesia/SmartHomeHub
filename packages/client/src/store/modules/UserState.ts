import { VuexModule, Action, Module, Mutation } from "vuex-module-decorators";
import Axios from "axios";
import jwt from "jsonwebtoken";

// TODO : 動的モジュールにしたいけど、localStorageに保存できなくなる
// https://github.com/championswimmer/vuex-module-decorators/pull/102
@Module({ namespaced: true, name: "UserState" })
export default class UserState extends VuexModule {
  token: string | null = null;

  @Action
  public async login(payload: { username: string; password: string }) {
    const res = await Axios.post<string>("/api/user/login", payload);
    this.context.commit("setToken", res.data);
  }

  @Action
  public async logout() {
    await Axios.post("/api/user/logout");
    this.context.commit("setToken", null);
  }

  @Mutation
  private setToken(token: string | null) {
    this.token = token;
  }

  get user(): any {
    return this.token ? jwt.decode(this.token) : null;
  }
}
