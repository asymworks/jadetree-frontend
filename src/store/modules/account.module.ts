/* eslint-disable no-shadow */

import { Module } from 'vuex';
import { accountService } from '@/api';
import { AccountSchema, AccountCreateSchema } from '@/api/types';

import { RootState } from '../rootState';
import { AsyncStatus } from '../util';

/** API State */
export interface AccountState {
  accounts: AccountSchema[];
  status: AsyncStatus;
}

const state: AccountState = {
  accounts: [],
  status: { },
};

const namespaced = true;

const accountModule: Module<AccountState, RootState> = {
  namespaced,
  state,
  getters: {
    accountError(state: AccountState): string | undefined {
      return state.status.error;
    },
    accountLoading(state: AccountState): boolean {
      return !!state.status.loading;
    },
    budgetAccounts(state: AccountState): (budgetId?: number) => AccountSchema[] {
      return (budgetId?: number) => state.accounts.filter((a) => a.budget_id === budgetId);
    },
    findAccount(state: AccountState): (id: number) => AccountSchema | undefined {
      return (id: number) => state.accounts.find((a) => a.id === id);
    },
    offBudgetAccounts(state: AccountState): AccountSchema[] {
      return state.accounts.filter((a) => !a.budget_id);
    },
  },
  actions: {
    createAccount(
      { commit, dispatch, state },
      data: AccountCreateSchema,
    ): Promise<AccountSchema | void> {
      commit('loading');
      return accountService.createAccount(data)
        .then((account: AccountSchema) => {
          commit('loadedAccountList', [...state.accounts, account]);
          dispatch(
            'dispatchAll',
            { actionName: 'onAccountCreated', actionPayload: account },
            { root: true },
          );
          return account;
        })
        .catch((error: string) => commit('error', error));
    },
    deleteAccount({ commit, dispatch, state }, accountId: number): Promise<void> | void {
      if (!state.accounts.find((a) => a.id === accountId)) return;

      commit('loading');
      // eslint-disable-next-line consistent-return
      return accountService.deleteAccount(accountId)
        .then(() => commit(
          'loadedAccountList',
          state.accounts.filter((a) => a.id !== accountId),
        ))
        .then(() => dispatch(
          'dispatchAll',
          { actionName: 'onAccountDeleted', actionPayload: accountId },
          { root: true },
        ))
        .catch((error: string) => commit('error', error));
    },
    loadAccount({ commit }, accountId: number): Promise<void> {
      commit('loading');
      return accountService.getAccount(accountId)
        .then((account: AccountSchema) => commit('loadedAccountItem', account))
        .catch((error: string) => commit('error', error));
    },
    loadAccounts({ commit }): Promise<void> {
      commit('loading');
      return accountService.getAccounts()
        .then((accounts: AccountSchema[]) => commit('loadedAccountList', accounts))
        .catch((error: string) => commit('error', error));
    },
    onLogin({ dispatch }) {
      return dispatch('loadAccounts');
    },
    onLogout({ commit }) {
      commit('clear');
    },
  },
  mutations: {
    clear(state: AccountState) {
      state.accounts = [];
    },
    error(state: AccountState, error: string) {
      // eslint-disable-next-line no-console
      console.error(error);
      state.status = { error };
    },
    loading(state: AccountState) {
      state.status = { loading: true };
    },
    loadedAccountItem(state: AccountState, response: AccountSchema) {
      state.status = { loaded: true };
      state.accounts = [
        ...state.accounts.filter((a) => a.id !== response.id),
        response,
      ];
    },
    loadedAccountList(state: AccountState, response: AccountSchema[]) {
      state.status = { loaded: true };
      state.accounts = response;
    },
  },
};

export default accountModule;
