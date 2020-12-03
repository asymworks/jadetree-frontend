/* eslint-disable no-shadow */

import Vue from 'vue';
import Vuex, {
  ActionTree,
  Dispatch,
  Module,
  MutationTree,
} from 'vuex';

import { ServerMode, UserSchema } from '@/api/types';

import { RootState } from './rootState';
import { ApiState } from './modules/api.module';
import { AuthState } from './modules/auth.module';
import { BudgetState } from './modules/budget.module';
import { L10nState } from './modules/l10n.module';
import { TransactionsState } from './modules/transactions.module';
import modules from './modules';

Vue.use(Vuex);

type DispatchAllModuleMap = { [key: string]: Module<unknown, RootState> };
type DispatchAllPayload = {
  actionName: string;
  actionPayload: unknown;
  moduleList: DispatchAllModuleMap;
  options: {
    modulePrefix?: string;
    flags?: {
      dispatchGlobal?: boolean;
    };
  };
};

async function doDispatchAll(dispatch: Dispatch, payload: DispatchAllPayload) {
  const {
    actionName,
    actionPayload = null,
    moduleList = modules as DispatchAllModuleMap,
    options = {},
  } = payload;
  const { modulePrefix = '', flags = {} } = options;

  // Dispatch action for all modules registered in the Store
  Object.keys(moduleList).forEach(async (moduleName) => {
    const moduleDef = moduleList[moduleName];

    // Dispatch to Store Module
    if (moduleDef.actions && moduleDef.actions[actionName]) {
      if (moduleDef.namespaced) {
        await dispatch(`${modulePrefix}${moduleName}/${actionName}`, actionPayload);
      } else {
        flags.dispatchGlobal = true;
      }
    }

    // Dispatch to sub-modules
    if (moduleDef.modules) {
      await doDispatchAll(
        dispatch,
        {
          actionName,
          actionPayload,
          moduleList: moduleDef.modules as DispatchAllModuleMap,
          options: {
            modulePrefix: `${modulePrefix}/${moduleName}`,
            flags,
          },
        },
      );
    }
  });

  // Dispatch global action
  if (!modulePrefix && flags.dispatchGlobal) {
    await dispatch(actionName, actionPayload);
  }
}

/* Annotate RootState with Modules */
export interface FullState extends RootState {
  api: ApiState;
  auth: AuthState;
  budget: BudgetState;
  l10n: L10nState;
  transactions: TransactionsState;
}

/** Root Actions */
const actions: ActionTree<RootState, RootState> = {
  dispatchAll({ dispatch }, payload: DispatchAllPayload) {
    doDispatchAll(dispatch, payload);
  },
};

/** Root Mutations */
const mutations: MutationTree<RootState> = {
};

/* Initialize data here so reactivity works */
const state: RootState = {
  version: process.env.PACKAGE_VERSION || 'unversioned',
};

/** Getters */
const getters = {
  apiError: (state: RootState): string | undefined => (state as FullState).api.status.error,
  apiLoading: (state: RootState): boolean => !!(state as FullState).api.status.loading,
  apiLoaded: (state: RootState): boolean => !!(state as FullState).api.status.loaded,
  apiVersion: (state: RootState): string => (state as FullState).api.version,
  appVersion: (state: RootState): string => state.version,
  backendName: (state: RootState): string => (state as FullState).api.appName,
  backendVersion: (state: RootState): string => (state as FullState).api.appVersion,
  loggedIn: (state: RootState): boolean => !!(state as FullState).auth.user,
  needsSetup: (state: RootState): boolean => !!(state as FullState).api.needsSetup,
  serverMode: (state: RootState): ServerMode | '' => (state as FullState).api.serverMode,
  user: (state: RootState): UserSchema | null => (state as FullState).auth.user,
  userCurrency(state: RootState): string | undefined {
    const { user } = (state as FullState).auth;
    return user ? user.currency : undefined;
  },
};

/* Strict Mode */
const strict = process.env.NODE_ENV !== 'production';

/** Root Store */
const store = new Vuex.Store<RootState>({
  strict,
  modules,
  state,
  getters,
  actions,
  mutations,
});

export default store;
