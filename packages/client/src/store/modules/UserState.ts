import { VuexModule, Action, Module, getModule } from "vuex-module-decorators";
import Axios from "axios";
import store from "@/store";
import jwt from "jsonwebtoken";

@Module({ dynamic: true, store, name: "UserState"})
class UserState extends VuexModule {
  token: string | null = null;

  @Action
  public async login(username: string, password: string) {
    const res = await Axios.post<string>("/api/user/login", {
      username,
      password
    });
    this.token = res.data;
  }

  get user(): any {
    return this.token ? jwt.decode(this.token) : null;
  }
}

export const UserModule = getModule(UserState);