import Vuex, { Module } from 'vuex';
import { DefineGetters, DefineMutations, DefineActions, Dispatcher, Committer } from 'vuex-type-helper';

export class CountState {
  count: number = 0;
}

export interface CountMutations {
  inc: any;
}

export interface CountActions {
  incAsync: any;
}

const mutations: DefineMutations<CountMutations, CountState> = {
  inc(state) {
    state.count++;
  }
}

const actions: DefineActions<CountActions, CountState, CountMutations> = {
  incAsync({ commit }) {
    return new Promise<any>(res => {
      setTimeout(() => {
        commit('inc');
        res();
      }, 1000);
    });
  }
}

const store: Module<CountState, any> = {
  namespaced: true,
  state: new CountState(),
  mutations,
  actions,
}

export default store;