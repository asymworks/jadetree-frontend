/* eslint-disable no-shadow */

import { Module } from 'vuex';
import apiWrapper, { authService } from '@/api';
import {
  ApiError,
  AuthRequestSchema,
  AuthResponseSchema,
  UserSchema,
} from '@/api/types';

import { RootState } from '../rootState';
import { AsyncStatus } from '../util';

/** API State */
export interface AuthState {
  status: AsyncStatus;
  token: string;
  user: UserSchema | null;
}

const state: AuthState = {
  status: { },
  token: '',
  user: null,
};

const namespaced = true;

const authModule: Module<AuthState, RootState> = {
  namespaced,
  state,
  getters: {
    error: (state: AuthState) => state.status.error || '',
    loading: (state: AuthState): boolean => !!state.status.loading,
    loaded: (state: AuthState): boolean => !!state.status.loaded,
  },
  actions: {
    login({ commit, dispatch }, payload: AuthRequestSchema): Promise<void> | void {
      const { email, password } = payload;

      commit('loginRequest');
      /* eslint-disable-next-line consistent-return */
      return authService.login(email, password)
        .then((response: AuthResponseSchema) => commit('loginResponse', response))
        .then(() => dispatch('dispatchAll', { actionName: 'onLogin' }, { root: true }))
        .catch((err: ApiError) => {
          let msg = err.message;
          if (err.class) {
            msg = `${err.class}: ${msg}`;
          }

          commit('error', msg);
        });
    },
    logout({ commit }): void {
      commit('logoutRequest');
    },
    updateUser({ commit, dispatch }, user): Promise<void> {
      commit('updatedUser', user);
      return dispatch('dispatchAll', { actionName: 'onUserUpdate' }, { root: true });
    },
  },
  mutations: {
    error(state: AuthState, error: string) {
      // eslint-disable-next-line no-console
      console.error(error);
      state.status = { error };
    },
    loginRequest(state: AuthState) {
      state.status = { loading: true };
    },
    loginResponse(state: AuthState, response: AuthResponseSchema) {
      state.status = { loaded: true };
      state.token = response.token;
      state.user = response.user;

      // Set API Token
      apiWrapper.token = response.token;
    },
    logoutRequest(state: AuthState) {
      state.token = '';
      state.user = null;

      // Clear API Token
      apiWrapper.token = undefined;
    },
    updatedUser(state: AuthState, user) {
      state.user = user;
    },
  },
};

export default authModule;
