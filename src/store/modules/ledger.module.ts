/* eslint-disable no-shadow */

import { Module } from 'vuex';
/* eslint-disable import/named */
import { ledgerService, transactionService } from '@/api';
import { loadTransactionLineSchema } from '@/api/schema';
import {
  ApiError,
  AccountSchema,
  LedgerEntrySchema,
  ReconcileSchema,
  TransactionClearanceSchema,
  TransactionLineSchema,
  TransactionSchema,
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
export interface LedgerState {
  currentAccount: AccountSchema | null;
  ledger: LedgerEntrySchema[];
  status: AsyncStatus;
}

const state: LedgerState = {
  currentAccount: null,
  ledger: [],
  status: { },
};

const namespaced = true;

const ledgerModule: Module<LedgerState, RootState> = {
  namespaced,
  state,
  getters: {
    ledgerError(state: LedgerState): string | undefined {
      return state.status.error;
    },
    ledgerLoading(state: LedgerState): boolean {
      return !!state.status.loading;
    },
  },
  actions: {
    changeAccount({ commit, dispatch, rootState }, id: number | null) {
      const account = (rootState as FullState).account.accounts.find((a) => a.id === id);
      commit('setCurrentAccount', account || null);
      return dispatch('reload');
    },
    clearTransaction(
      { commit },
      { id, data }: { id: number; data: TransactionClearanceSchema },
    ): Promise<TransactionClearanceSchema[]> {
      commit('loading');
      return transactionService.clearTransaction(id, data)
        .then((response) => {
          commit('done');
          return response;
        })
        .catch((error: ApiError) => { throw error; });
    },
    createTransaction(
      { commit, dispatch },
      data: TransactionSchema,
    ): Promise<TransactionSchema> {
      commit('loading');
      return transactionService.createTransaction(data)
        .then((data: TransactionSchema) => {
          dispatch('reload');
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
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    onAccountChanged({ dispatch }) {
      return dispatch('reload');
    },
    onAccountsLoaded({ dispatch }) {
      let id: number | null = null;

      const curAcctId = localStorage.getItem('currentAccount');
      if (curAcctId) {
        id = Number.parseInt(curAcctId, 10);
      }

      return dispatch('changeAccount', id);
    },
    reconcileAccount(
      { dispatch, commit },
      { accountId, data }: { accountId: number; data: ReconcileSchema },
    ): Promise<TransactionSchema[]> {
      commit('loading');
      return transactionService.reconcileAccount(accountId, data)
        .then((data: TransactionSchema[]) => {
          dispatch('reload');
          return data;
        })
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    reload({ commit, state }) {
      let fn = ledgerService.getAllTransactions;
      if (state.currentAccount !== null) {
        const { id } = state.currentAccount;
        if (id) {
          fn = () => ledgerService.getAccountTransactions(id);
        }
      }

      return fn()
        .then((data: LedgerEntrySchema[]) => {
          commit('loaded', data);
          return data;
        })
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    updateTransaction(
      { commit, dispatch },
      { id, data }: { id: number; data: TransactionSchema },
    ): Promise<TransactionSchema> {
      commit('loading');
      return transactionService.updateTransaction(id, data)
        .then((data: TransactionSchema) => {
          dispatch('reload');
          return data;
        })
        .catch((error: ApiError) => {
          commit('error', error);
          throw error;
        });
    },
    wsClearTransaction({ commit }, data: TransactionSchema[]) {
      if (data && data.length) {
        data.forEach((txn) => {
          if (txn.lines && txn.lines.length) {
            commit(
              'updateClearance',
              txn.lines
                .filter((ln) => ln.role === 'personal')
                .map((ln) => loadTransactionLineSchema(ln)),
            );
          }
        });
      }
    },
    wsCreateTransaction({ dispatch }) {
      return dispatch('reload');
    },
    wsDeleteTransaction({ dispatch }) {
      return dispatch('reload');
    },
    wsUpdateTransaction({ dispatch }) {
      return dispatch('reload');
    },
  },
  mutations: {
    clear(state: LedgerState) {
      state.ledger = [];
    },
    done(state: LedgerState) {
      state.status = { loaded: true };
    },
    error(state: LedgerState, error: string) {
      // eslint-disable-next-line no-console
      console.error(error);
      state.status = { error };
    },
    loaded(state: LedgerState, response: LedgerEntrySchema[]) {
      state.status = { loaded: true };
      state.ledger = response;
    },
    loading(state: LedgerState) {
      state.status = { loading: true };
    },
    setCurrentAccount(state: LedgerState, account: AccountSchema | null) {
      state.currentAccount = account;
      if (!account || account === null) {
        localStorage.removeItem('currentAccount');
      } else {
        localStorage.setItem('currentAccount', `${account.id}`);
      }
    },
    updateClearance(state: LedgerState, lines: TransactionLineSchema[]) {
      state.status = { loaded: true };
      // Update LedgerEntrySchema items in-place for Clearance or Reconciliation
      // status updates since it doesn't affect any other calculated values
      lines.forEach((ln) => {
        /* eslint-disable @typescript-eslint/camelcase */
        /* eslint-disable-next-line object-curly-newline */
        const { id, cleared, cleared_at, reconciled, reconciled_at } = ln;
        const ledgerEntry = state.ledger.find((le) => le.line_id === id);
        if (ledgerEntry) {
          if (typeof cleared !== 'undefined') {
            ledgerEntry.cleared = cleared;
            ledgerEntry.cleared_at = cleared_at;
          }
          if (typeof reconciled !== 'undefined') {
            ledgerEntry.reconciled = reconciled;
            ledgerEntry.reconciled_at = reconciled_at;
          }
        }
        /* eslint-enable @typescript-eslint/camelcase */
      });
    },
  },
};

export default ledgerModule;
