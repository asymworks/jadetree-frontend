/* eslint-disable no-shadow */

import Vue from 'vue';
import { Module } from 'vuex';
/* eslint-disable import/named */
import { transactionService } from '@/api';
import {
  ApiError,
  PayeeSchema,
  PayeeDetailSchema,
  ReconcileSchema,
  TransactionSchema,
  TransactionLineSchema,
} from '@/api/types';
/* eslint-enable import/named */

import { RootState } from '../rootState';
import { AccountState } from './account.module';
import { AsyncStatus } from '../util';

/** Full State */
interface FullState extends RootState {
  account: AccountState;
}

/** API State */
export interface TransactionsState {
  payees: PayeeSchema[];
  payeeDetails: PayeeDetailSchema[];
  status: AsyncStatus;
  transactions: TransactionSchema[];
}

const state: TransactionsState = {
  payees: [],
  payeeDetails: [],
  status: { },
  transactions: [],
};

const namespaced = true;

const transactionsModule: Module<TransactionsState, RootState> = {
  namespaced,
  state,
  getters: {
    findPayee(state: TransactionsState): (id: number) => PayeeSchema | undefined {
      return (id: number) => state.payees.find((p) => p.id === id);
    },
    transactionsError(state: TransactionsState): string | undefined {
      return state.status.error;
    },
    transactionsLoading(state: TransactionsState): boolean {
      return !!state.status.loading;
    },
  },
  actions: {
    clearTransaction(
      { commit, dispatch },
      { id, data }: { id: number; data: TransactionLineSchema },
    ): Promise<TransactionLineSchema[]> {
      commit('loading');
      return transactionService.clearTransaction(id, data)
        .then((data: TransactionLineSchema[]) => {
          dispatch('reload');
          return data;
        })
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    createPayee({ commit, state }, payee: PayeeSchema): Promise<PayeeSchema> {
      commit('loading');
      return transactionService.createPayee(payee)
        .then((response: PayeeSchema) => {
          commit('loadedPayees', [...state.payees, response]);
          return response;
        })
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    createTransaction(
      { commit, dispatch },
      data: TransactionSchema,
    ): Promise<TransactionSchema> {
      commit('loading');
      return transactionService.createTransaction(data)
        .then((data: TransactionSchema) => {
          dispatch('reload').then(() => dispatch(
            'dispatchAll',
            { actionName: 'onTransactionChanged' },
            { root: true },
          ));
          return data;
        })
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    deleteTransaction({ commit, dispatch }, id: number): Promise<void> {
      commit('loading');
      return transactionService.deleteTransaction(id)
        .then(() => dispatch('reload'))
        .then(() => dispatch(
          'dispatchAll',
          { actionName: 'onTransactionChanged' },
          { root: true },
        ))
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    loadAccount({ commit }, accountId: number) {
      commit('loading');
      transactionService.getAccountTransactions(accountId)
        .then((response: TransactionSchema[]) => commit('loadedList', response))
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    loadAll({ commit }) {
      commit('loading');
      transactionService.getAllTransactions()
        .then((response: TransactionSchema[]) => commit('loadedList', response))
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    loadPayees({ commit }) {
      commit('loading');
      transactionService.getPayees()
        .then((response: PayeeSchema[]) => commit('loadedPayees', response))
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    onAccountCreated({ dispatch }) {
      return dispatch('loadPayees')
        .then(() => dispatch('reload'));
    },
    onAccountDeleted({ dispatch }) {
      return dispatch('loadPayees');
    },
    onAccountChanged({ dispatch }) {
      return dispatch('reload');
    },
    onLogin({ dispatch }) {
      return dispatch('loadPayees');
    },
    reconcileAccount(
      { dispatch, commit, rootState },
      { accountId, data }: { accountId: number; data: ReconcileSchema },
    ): Promise<TransactionSchema[]> {
      commit('loading');
      return transactionService.reconcileAccount(accountId, data)
        .then((data: TransactionSchema[]) => {
          const { account } = (rootState as FullState);
          if (account.currentAccount && account.currentAccount.id === accountId) {
            dispatch('reload')
              .then(() => dispatch(
                'dispatchAll',
                { actionName: 'onTransactionChanged' },
                { root: true },
              ));
          } else {
            dispatch('loaded');
          }

          return data;
        })
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    reload({ dispatch, rootState }) {
      const { account } = rootState as FullState;
      if (account.currentAccount && account.currentAccount.id) {
        return dispatch('loadAccount', account.currentAccount.id);
      }

      return dispatch('loadAll');
    },
    updateTransaction(
      { commit, dispatch },
      { id, data }: { id: number; data: TransactionSchema },
    ): Promise<TransactionSchema> {
      commit('loading');
      return transactionService.updateTransaction(id, data)
        .then((data: TransactionSchema) => {
          dispatch('reload')
            .then(() => dispatch(
              'dispatchAll',
              { actionName: 'onTransactionChanged' },
              { root: true },
            ));
          return data;
        })
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
  },
  mutations: {
    clear(state: TransactionsState) {
      state.transactions = [];
    },
    error(state: TransactionsState, error: string) {
      // eslint-disable-next-line no-console
      console.error(error);
      state.status = { error };
    },
    loaded(state: TransactionsState) {
      state.status = { loaded: true };
    },
    loading(state: TransactionsState) {
      state.status = { loading: true };
    },
    loadedList(state: TransactionsState, response: TransactionSchema[]) {
      state.status = { loaded: true };
      state.transactions = response;
    },
    loadedPayees(state: TransactionsState, response: PayeeSchema[]) {
      state.status = { loaded: true };
      state.payees = response;
    },
    loadedTransaction(
      state: TransactionsState,
      { data, add }: { data: TransactionSchema; add: boolean },
    ) {
      state.status = { loaded: true };
      const txnIdx = state.transactions
        .map((t) => t.transaction_id)
        .indexOf(data.transaction_id);

      if (txnIdx >= 0) {
        Vue.set(state.transactions, txnIdx, data);
      } else if (add) {
        state.transactions.push(data);
      }
    },
  },
};

export default transactionsModule;
