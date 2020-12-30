/* eslint-disable no-shadow */

import { Module } from 'vuex';
/* eslint-disable import/named */
import { payeeService } from '@/api';
import { ApiError, PayeeSchema, PayeeDetailSchema } from '@/api/types';
/* eslint-enable import/named */

import { RootState } from '../rootState';
import { AsyncStatus } from '../util';

/** API State */
export interface PayeeState {
  payees: PayeeSchema[];
  payeeDetails: PayeeDetailSchema[];
  status: AsyncStatus;
}

const state: PayeeState = {
  payees: [],
  payeeDetails: [],
  status: { },
};

const namespaced = true;

const payeesModule: Module<PayeeState, RootState> = {
  namespaced,
  state,
  getters: {
    findPayee(state: PayeeState): (id: number) => PayeeSchema | undefined {
      return (id: number) => state.payees.find((p) => p.id === id);
    },
    payeesError(state: PayeeState): string | undefined {
      return state.status.error;
    },
    payeesLoading(state: PayeeState): boolean {
      return !!state.status.loading;
    },
  },
  actions: {
    createPayee({ commit }, payee: PayeeSchema): Promise<PayeeSchema> {
      commit('loading');
      return payeeService.createPayee(payee)
        .then((response: PayeeSchema) => {
          commit('updated', response);
          return response;
        })
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    onLogin({ dispatch }) {
      return dispatch('reload');
    },
    reload({ commit }) {
      commit('loading');
      payeeService.getPayees()
        .then((response: PayeeSchema[]) => commit('loaded', response))
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    wsCreatePayee({ commit }, items: PayeeSchema[]) {
      items.forEach((payee) => commit('updated', payee));
    },
    wsDeletePayee({ commit }, items: PayeeSchema[]) {
      items.forEach(({ id }) => commit('deleted', id));
    },
    wsUpdatePayee({ commit }, items: PayeeSchema[]) {
      items.forEach((payee) => commit('updated', payee));
    },
  },
  mutations: {
    clear(state: PayeeState) {
      state.payees = [];
    },
    deleted(state: PayeeState, payeeId: number) {
      const idx = state.payees.findIndex((p) => p.id === payeeId);
      if (idx !== -1) {
        state.payees.splice(idx, 1);
      }
    },
    error(state: PayeeState, error: string) {
      // eslint-disable-next-line no-console
      console.error(error);
      state.status = { error };
    },
    loaded(state: PayeeState, response: PayeeSchema[]) {
      state.status = { loaded: true };
      state.payees = response;
    },
    loading(state: PayeeState) {
      state.status = { loading: true };
    },
    updated(state: PayeeState, payee: PayeeSchema) {
      state.status = { loaded: true };
      if (typeof payee.id !== 'number') {
        // eslint-disable-next-line no-console
        console.warn('payeeModule.updated called with no payee.id set');
      } else {
        const idx = state.payees.findIndex((p) => p.id === payee.id);
        if (idx !== -1) {
          state.payees.splice(idx, 1, payee);
        } else {
          state.payees.push(payee);
        }
      }
    },
  },
};

export default payeesModule;
