/* eslint-disable no-shadow */

import Vue from 'vue';
import { Module } from 'vuex';
import {
  getMonth,
  getYear,
  formatISO,
  isValid,
  parseISO,
  setDate,
} from 'date-fns';
import { budgetService } from '@/api';
import {
  BudgetSchema,
  BudgetDataSchema,
  CategorySchema,
  EntrySchema,
} from '@/api/types';

import { RootState } from '../rootState';
import { AsyncStatus } from '../util';

/** API State */
export interface BudgetState {
  budgets: BudgetSchema[];
  collapseGroups: number[];
  currentBudget: BudgetSchema | null;
  currentMonthData: BudgetDataSchema | null;
  displayMonthData: BudgetDataSchema | null;
  displayMonth: Date | null;
  status: AsyncStatus;
}

const state: BudgetState = {
  budgets: [],
  collapseGroups: [],
  currentBudget: null,
  currentMonthData: null,
  displayMonthData: null,
  displayMonth: null,
  status: { },
};

/** Find a Category */
function findCategory(
  id: number,
  categories: CategorySchema[],
): CategorySchema[] {
  // eslint-disable-next-line no-restricted-syntax
  for (let i = 0; i < categories.length; i += 1) {
    const category = categories[i];
    if (category.id === id) return [category];
    if (category.children && category.children.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const child = findCategory(id, category.children!);
      if (child.length > 0) return [...child, category];
    }
  }
  return [];
}

const namespaced = true;

const budgetModule: Module<BudgetState, RootState> = {
  namespaced,
  state,
  getters: {
    budgetError(state: BudgetState): string | undefined {
      return state.status.error;
    },
    budgetLoading(state: BudgetState): boolean {
      return !!state.status.loading;
    },
    findBudget(state: BudgetState): (id: number) => BudgetSchema | undefined {
      return (id: number) => state.budgets.find((b) => b.id === id);
    },
    findCategory(state: BudgetState): (id: number) => CategorySchema[] {
      return (id: number): CategorySchema[] => {
        if (!state.currentBudget || !state.currentBudget.categories) return [];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return findCategory(id, state.currentBudget.categories!);
      };
    },
  },
  actions: {
    collapseGroup({ commit }, groupId: number) {
      commit('collapsedGroup', groupId);
    },
    createBudget(
      { commit, dispatch, state },
      data: BudgetSchema,
    ): Promise<BudgetSchema | void> | void {
      const isFirst = !state.budgets.length;

      commit('loading');
      return budgetService.createBudget(data)
        .then((budget) => {
          commit('loadedBudgetList', [...state.budgets, budget]);
          if (isFirst) commit('setCurrent', budget);
          return budget;
        })
        .then((budget) => new Promise<BudgetSchema>((resolve) => {
          dispatch('loadBudgetData').then(() => resolve(budget));
        }))
        .catch((error) => {
          commit('error', error);
          throw error;
        });
    },
    createCategory(
      { commit, dispatch, state },
      data: CategorySchema,
    ): Promise<CategorySchema> | void {
      const { currentBudget } = state;
      if (!currentBudget || !currentBudget.id) {
        throw Error('No current budget loaded');
      }

      commit('loading');
      return budgetService.createCategory(currentBudget.id, data)
        .then((category) => new Promise<CategorySchema>((resolve) => {
          // Budget Categories were Updated
          dispatch('loadBudgets')
            .then(() => dispatch('loadBudgetData'))
            .then(() => resolve(category));
        }))
        .catch((error) => {
          commit('error', error);
          throw error;
        });
    },
    deleteBudget({ commit, state }, budgetId: number): Promise<void> | void {
      const { currentBudget } = state;
      const isCurrent = currentBudget && currentBudget.id === budgetId;

      commit('loading');
      // eslint-disable-next-line consistent-return
      return budgetService.deleteBudget(budgetId)
        .then(() => commit(
          'loadedBudgetList',
          state.budgets.filter((b) => b.id !== budgetId),
        ))
        .then(() => {
          commit(
            'loadedBudgetList',
            state.budgets.filter((b) => b.id !== budgetId),
          );
          if (isCurrent) commit('setCurrent', null);
        })
        .catch((error) => {
          commit('error', error);
          throw error;
        });
    },
    deleteCategory(
      { commit, dispatch, state },
      categoryId: number,
    ): Promise<void> | void {
      const { currentBudget } = state;
      if (!currentBudget || !currentBudget.id) {
        throw Error('No current budget loaded');
      }

      commit('loading');
      return budgetService.deleteCategory(currentBudget.id, categoryId)
        .then(() => dispatch('loadBudgets'))
        .then(() => dispatch('loadBudgetData'))
        .catch((error) => {
          commit('error', error);
          throw error;
        });
    },
    expandGroup({ commit }, groupId: number) {
      commit('expandedGroup', groupId);
    },
    hideCategory(
      { commit, dispatch, state },
      categoryId: number,
    ): Promise<void> | void {
      const { currentBudget } = state;
      if (!currentBudget || !currentBudget.id) {
        throw Error('No current budget loaded');
      }

      commit('loading');
      return budgetService.updateCategory(currentBudget.id, categoryId, { hidden: true })
        .then(() => dispatch('loadBudgets'))
        .then(() => dispatch('loadBudgetData'))
        .catch((error) => {
          commit('error', error);
          throw error;
        });
    },
    loadBudgetData({ commit, dispatch, state }): Promise<void> | void {
      const { budgets, currentBudget } = state;
      if (!currentBudget || !budgets.length) return;

      commit('loading');
      // eslint-disable-next-line consistent-return, @typescript-eslint/no-non-null-assertion
      return budgetService.getBudgetData(currentBudget.id!)
        .then((data: BudgetDataSchema) => commit('loadedBudgetData', data))
        .then(() => new Promise<void>((resolve) => {
          dispatch('loadBudgetMonth').then(() => resolve());
        }))
        .catch((error) => commit('error', error));
    },
    loadBudgetEntry({ commit, state }, entryId: number): Promise<EntrySchema> | void {
      const { currentBudget, displayMonthData } = state;
      if (!currentBudget) return;

      if (displayMonthData && displayMonthData.entries) {
        const entry = displayMonthData.entries.find((e) => e.id === entryId);
        // eslint-disable-next-line consistent-return
        if (entry) return new Promise<EntrySchema>((resolve) => resolve(entry));
      }

      commit('loading');
      // eslint-disable-next-line consistent-return, @typescript-eslint/no-non-null-assertion
      return budgetService.getEntry(currentBudget.id!, entryId)
        .then((entry: EntrySchema) => {
          commit('loaded');
          return entry;
        });
    },
    loadBudgetMonth({ commit, state }): Promise<void> | void {
      const { currentBudget, displayMonth } = state;
      if (!currentBudget || !displayMonth) return;

      commit('loading');
      // eslint-disable-next-line consistent-return
      return budgetService.getBudgetData(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        currentBudget.id!,
        getMonth(displayMonth) + 1,
        getYear(displayMonth),
      )
        .then((data: BudgetDataSchema) => commit('loadedBudgetMonth', data))
        .catch((error) => commit('error', error));
    },
    loadBudgets({ commit, dispatch }): Promise<void> {
      commit('loading');
      return budgetService.getBudgets()
        .then((budgets) => commit('loadedBudgetList', budgets))
        .then(() => new Promise<void>((resolve) => {
          dispatch('loadBudgetData').then(() => resolve());
        }))
        .catch((error) => commit('error', error));
    },
    onLogin({ dispatch }) {
      return dispatch('loadBudgets');
    },
    setCurrentBudget({ commit, dispatch, state }, budgetId: number): Promise<void> {
      const budget = state.budgets.find((b) => b.id === budgetId);
      if (!budget) {
        throw Error(`Budget with id ${budgetId} is not loaded`);
      }

      commit('setCurrent', budget);

      return dispatch('loadBudgetData');
    },
    startup({ commit }) {
      let displayMonth = new Date();
      const displayMonthStr = localStorage.getItem('currentBudgetMonth');

      if (displayMonthStr) {
        const parsed = parseISO(displayMonthStr);
        if (isValid(parsed)) {
          displayMonth = parsed;
        }
      }

      commit('setDisplayMonth', displayMonth);
    },
    unhideCategory(
      { commit, dispatch, state },
      categoryId: number,
    ): Promise<void> | void {
      const { currentBudget } = state;
      if (!currentBudget || !currentBudget.id) {
        throw Error('No current budget loaded');
      }

      commit('loading');
      return budgetService.updateCategory(currentBudget.id, categoryId, { hidden: false })
        .then(() => dispatch('loadBudgets'))
        .catch((error) => {
          commit('error', error);
          throw error;
        });
    },
    updateBudget(
      { commit },
      { budgetId, budgetData },
    ): Promise<BudgetSchema | void> {
      commit('loading');
      return budgetService.updateBudget(budgetId, budgetData)
        .then((data) => {
          commit('loadedBudget', data);
          return data;
        })
        .catch((error) => {
          commit('error', error);
          throw error;
        });
    },
    updateCategory(
      { commit, dispatch, state },
      { categoryId, data },
    ): Promise<CategorySchema> | void {
      const { currentBudget } = state;
      if (!currentBudget || !currentBudget.id) {
        throw Error('No current budget loaded');
      }

      commit('loading');
      return budgetService.updateCategory(currentBudget.id, categoryId, data)
        .then((category) => new Promise<CategorySchema>((resolve) => {
          // Budget Categories were Updated
          dispatch('loadBudgets')
            .then(() => dispatch('loadBudgetData'))
            .then(() => resolve(category));
        }))
        .catch((error) => {
          commit('error', error);
          throw error;
        });
    },
    updateDisplayMonth({ commit, dispatch }, month: Date): Promise<void> | void {
      commit('setDisplayMonth', month);
      return dispatch('loadBudgetMonth');
    },
    updateEntry(
      { commit, dispatch, state },
      { entryId, entryData },
    ): Promise<EntrySchema> {
      const { currentBudget } = state;
      if (!currentBudget) throw new Error('No current budget set');

      commit('loading');
      let p: Promise<EntrySchema>;
      if (!entryId) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        p = budgetService.createEntry(currentBudget.id!, entryData);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        p = budgetService.updateEntry(currentBudget.id!, entryId, entryData);
      }

      return p
        .then((data: EntrySchema) => {
          commit('loaded');
          if (entryData.default) {
            // Budget Categories were Updated
            dispatch('loadBudgets');
          } else {
            dispatch('loadBudgetData');
          }

          return data;
        })
        .catch((error) => {
          commit('error', error);
          throw error;
        });
    },
    wsCreateTransaction({ dispatch }) {
      return dispatch('loadBudgetData');
    },
    wsDeleteTransaction({ dispatch }) {
      return dispatch('loadBudgetData');
    },
    wsUpdateTransaction({ dispatch }) {
      return dispatch('loadBudgetData');
    },
  },
  mutations: {
    clear(state: BudgetState) {
      state.budgets = [];
      state.currentBudget = null;
      state.currentMonthData = null;
      state.displayMonthData = null;
    },
    collapsedGroup(state, groupId: number) {
      if (!state.collapseGroups.includes(groupId)) {
        state.collapseGroups.push(groupId);
        localStorage.setItem('collapsedGroups', JSON.stringify(state.collapseGroups));
      }
    },
    error(state: BudgetState, error: string) {
      // eslint-disable-next-line no-console
      console.error(error);
      state.status = { error };
    },
    expandedGroup(state, groupId: number) {
      const index = state.collapseGroups.indexOf(groupId);
      if (index > -1) {
        state.collapseGroups.splice(index, 1);
        localStorage.setItem('collapsedGroups', JSON.stringify(state.collapseGroups));
      }
    },
    loading(state: BudgetState) {
      state.status = { loading: true };
    },
    loaded(state: BudgetState) {
      state.status = { loaded: true };
    },
    loadedBudget(state: BudgetState, budget: BudgetSchema) {
      state.status = { loaded: true };

      if (state.currentBudget && budget.id === state.currentBudget.id) {
        state.currentBudget = budget;
      }

      const index = state.budgets.map((b) => b.id).indexOf(budget.id);
      if (index >= 0) {
        Vue.set(state.budgets, index, budget);
      }
    },
    loadedBudgetList(state: BudgetState, response: BudgetSchema[]) {
      state.status = { loaded: true };
      state.budgets = response;

      const { currentBudget } = state;
      if (currentBudget) {
        const budget = response.find((b) => b.id === currentBudget.id);
        if (budget) {
          state.currentBudget = budget;
        }
      } else if (localStorage.getItem('currentBudgetId')) {
        const id = Number.parseInt(localStorage.currentBudgetId, 10);
        const budget = response.find((b) => b.id === id);
        if (budget) {
          state.currentBudget = budget;
        }

        if (localStorage.getItem('collapsedGroups')) {
          state.collapseGroups = JSON.parse(localStorage.collapsedGroups);
        }
      } else if (response && response.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        state.currentBudget = response[0];
        localStorage.setItem('currentBudgetId', `${response[0].id}`);
      }
    },
    loadedBudgetData(state: BudgetState, response: BudgetDataSchema) {
      state.status = { loaded: true };
      state.currentMonthData = response;
    },
    loadedBudgetMonth(state: BudgetState, response: BudgetDataSchema) {
      state.status = { loaded: true };
      state.displayMonthData = response;
    },
    setCurrent(state: BudgetState, budget: BudgetSchema) {
      state.collapseGroups = [];
      state.currentBudget = budget;
      localStorage.setItem('currentBudgetId', budget ? `${budget.id}` : '-1');
    },
    setDisplayMonth(state: BudgetState, month: Date) {
      state.displayMonth = setDate(month, 14);
      localStorage.setItem('currentBudgetMonth', formatISO(state.displayMonth));
    },
  },
};

export default budgetModule;
