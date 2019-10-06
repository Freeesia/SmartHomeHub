import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from "vuex-persistedstate";
import CountState from './modules/CountState';
import UserState from './modules/UserState';
import { getModule } from 'vuex-module-decorators';

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [
    createPersistedState(),
  ],
  modules: {
    CountState,
    UserState,
  }
});

export default store;
export const CountModule = getModule(CountState, store);
export const UserModule = getModule(UserState, store);