/* eslint-disable no-shadow */

import { Module } from 'vuex';
import { setupService, versionService } from '@/api';
import {
  ApiError,
  ServerMode,
  SetupSchema,
  VersionSchema,
} from '@/api/types';

import { RootState } from '../rootState';
import { AsyncStatus } from '../util';

/** API State */
export interface ApiState {
  appName: string;
  appVersion: string;
  dbVersion: string;
  needsSetup: boolean;
  serverCurrency: string;
  serverLanguage: string;
  serverLocale: string;
  serverMode: ServerMode | '';
  setupDefaults: SetupSchema;
  setupStatus: AsyncStatus;
  status: AsyncStatus;
  title: string;
  version: string;
}

const state: ApiState = {
  appName: '',
  appVersion: '',
  dbVersion: '',
  needsSetup: false,
  serverCurrency: '',
  serverLanguage: '',
  serverLocale: '',
  serverMode: '',
  setupDefaults: { },
  setupStatus: { },
  status: { },
  title: '',
  version: '',
};

const namespaced = true;

const apiModule: Module<ApiState, RootState> = {
  namespaced,
  state,
  getters: {
    error: (state: ApiState) => state.status.error || '',
    loading: (state: ApiState): boolean => !!state.status.loading,
    loaded: (state: ApiState): boolean => !!state.status.loaded,
  },
  actions: {
    startup({ dispatch }): Promise<void> {
      return dispatch('loadInfo');
    },
    loadInfo({ commit, dispatch }): Promise<void> | void {
      commit('loading');
      /* eslint-disable-next-line consistent-return */
      return versionService.getVersionInfo()
        /* eslint-disable-next-line consistent-return */
        .then((data: VersionSchema) => {
          commit('loaded', data);
          if (data.needs_setup) {
            return dispatch('loadSetup');
          }
        })
        .catch((err: ApiError) => {
          let msg = err.message;
          if (msg === 'Database is not initialized') {
            msg = 'The Jade Tree API server database has not yet been '
              + 'initialized. If you are the system administrator, please run '
              + 'the initial database migration and reload the Jade Tree '
              + 'frontend to continue to server setup.';
          } else if (msg === 'Failed to fetch') {
            msg = 'The Jade Tree API server is not available. Please ensure '
              + 'the server is running and accessible from your network.';
          }
          if (err.class) {
            msg = `${err.class}: ${msg}`;
          }
          commit('error', msg);
        });
    },
    loadSetup({ state, commit }): Promise<void> | void {
      commit('loadingSetup');
      if (!state.needsSetup) {
        commit('loadedSetup', {});
        return;
      }

      /* eslint-disable-next-line consistent-return */
      return setupService.getDefaults()
        .then((data: SetupSchema) => commit('loadedSetup', data))
        .catch((error: ApiError) => commit('setupError', error.message));
    },
    setupServer({ state, commit, dispatch }, setup: SetupSchema): Promise<void> | void {
      if (!state.needsSetup) {
        return;
      }

      commit('loadingSetup');
      /* eslint-disable-next-line consistent-return */
      return setupService.setupServer(setup)
        .then(() => commit('loadedSetup', {}))
        .then(() => dispatch('loadInfo'))
        .then(() => dispatch('dispatchAll', { actionName: 'afterSetup' }, { root: true }))
        .catch((error) => commit('setupError', error.message));
    },
  },
  mutations: {
    error(state: ApiState, error: string) {
      // eslint-disable-next-line no-console
      console.error(error);
      state.status = { error };
    },
    loading(state: ApiState) {
      state.status = { loading: true };

      state.appName = '';
      state.appVersion = '';
      state.dbVersion = '';
      state.needsSetup = false;
      state.serverCurrency = '';
      state.serverLanguage = '';
      state.serverLocale = '';
      state.serverMode = '';
      state.title = '';
      state.version = '';
    },
    loadingSetup(state: ApiState) {
      state.setupStatus = { loading: true };
      state.setupDefaults = { };
    },
    loaded(state: ApiState, version: VersionSchema) {
      state.status = { loaded: true };

      state.appName = version.app_name;
      state.appVersion = version.app_version;
      state.dbVersion = version.db_version;
      state.needsSetup = !!version.needs_setup;
      state.serverCurrency = version.server_currency;
      state.serverLanguage = version.server_language;
      state.serverLocale = version.server_locale;
      state.serverMode = version.server_mode;
      state.title = version.api_title;
      state.version = version.api_version;
    },
    loadedSetup(state: ApiState, defaults: SetupSchema) {
      state.setupStatus = { loaded: true };
      state.setupDefaults = defaults;
    },
    setupError(state: ApiState, error: string) {
      // eslint-disable-next-line no-console
      console.error(error);
      state.setupStatus = { error };
    },
  },
};

export default apiModule;
