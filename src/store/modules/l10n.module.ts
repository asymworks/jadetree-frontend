/* eslint-disable no-shadow */

import { Module } from 'vuex';
import Decimal from 'decimal.js-light';
import { Locale as DateLocale, format as dfFormat } from 'date-fns';
import {
  Locale as JadeTreeLocale,
  Money,
  NumberPattern,
  format as jtFormat,
  negotiateLocale,
  parseLocale,
  parsePattern,
} from '@jadetree/currency';

import {
  DateFnsAvailable,
  JadeTreeAvailable,
} from '../../l10n';

import { RootState } from '../rootState';
import { AuthState } from './auth.module';

type JadeTreeModule = { [key: string]: JadeTreeLocale };

type L10nModuleStatus = {
  error?: string;
  loaded?: boolean;
  loading?: boolean;
}

type L10nUserPatterns = {
  accountingPattern?: NumberPattern | null;
  currencyPattern?: NumberPattern | null;
  decimalPattern?: NumberPattern | null;
  longDateFmt?: string | null;
  shortDateFmt?: string | null;
}

export interface L10nState {
  dateFnsLocale: DateLocale | null;
  dateFnsStatus: L10nModuleStatus;
  dateFnsTag: string;
  jadetreeLanguage: string;
  jadetreeLocale: JadeTreeLocale | null;
  jadetreeModule: JadeTreeModule | null;
  jadetreeStatus: L10nModuleStatus;
  jadetreeTag: string;
  patterns: L10nUserPatterns;
  tag: string;
}

const state: L10nState = {
  dateFnsLocale: null,
  dateFnsStatus: { },
  dateFnsTag: '',
  jadetreeLanguage: '',
  jadetreeLocale: null,
  jadetreeModule: null,
  jadetreeStatus: { },
  jadetreeTag: '',
  patterns: { },
  tag: '',
};

/* Annotate RootState with Auth Module */
export interface FullState extends RootState {
  auth: AuthState;
}

const namespaced = true;

const hasOwnProperty = (o: object, p: string) => Object.prototype.hasOwnProperty.call(o, p);

const l10nModule: Module<L10nState, RootState> = {
  namespaced,
  state,
  getters: {
    formatAccounting(state: L10nState): (
      value: Money | Decimal | number, ccy?: string
    ) => string {
      return (value: Money | Decimal | number, ccy?: string) => {
        const { jadetreeLocale, patterns } = state;
        if (!jadetreeLocale || !jadetreeLocale.accountingPattern) return value.toString();
        const amount: Decimal = value instanceof Money
          ? value.amount
          : new Decimal(value);
        const currency: string | undefined = value instanceof Money
          ? value.currency.currencyCode
          : ccy;
        return jtFormat(
          amount,
          patterns.accountingPattern || jadetreeLocale.accountingPattern,
          { locale: jadetreeLocale, currency },
        );
      };
    },
    formatCurrency(state: L10nState): (
      value: Money | Decimal | number, ccy?: string
    ) => string {
      return (value: Money | Decimal | number, ccy?: string) => {
        const { jadetreeLocale, patterns } = state;
        if (!jadetreeLocale || !jadetreeLocale.currencyPattern) return value.toString();
        const amount: Decimal = value instanceof Money
          ? value.amount
          : new Decimal(value);
        const currency: string | undefined = value instanceof Money
          ? value.currency.currencyCode
          : ccy;
        return jtFormat(
          amount,
          patterns.currencyPattern || jadetreeLocale.currencyPattern,
          { locale: jadetreeLocale, currency },
        );
      };
    },
    formatDecimal(state: L10nState): (
      value: Decimal | number
    ) => string {
      return (value: Decimal | number) => {
        const { jadetreeLocale, patterns } = state;
        if (!jadetreeLocale || !jadetreeLocale.decimalPattern) return value.toString();
        return jtFormat(
          value,
          patterns.decimalPattern || jadetreeLocale.decimalPattern,
          { locale: jadetreeLocale },
        );
      };
    },
    formatLongDate(state: L10nState): (value: Date) => string {
      return (value: Date) => {
        const { dateFnsLocale, patterns } = state;
        if (!dateFnsLocale) return value.toISOString();
        return dfFormat(
          value,
          patterns.longDateFmt || 'PP',
          { locale: dateFnsLocale },
        );
      };
    },
    formatMonth(state: L10nState): (value: Date) => string {
      return (value: Date) => {
        const { dateFnsLocale } = state;
        if (!dateFnsLocale) return value.toISOString();
        return dfFormat(value, 'LLLL', { locale: dateFnsLocale });
      };
    },
    formatShortDate(state: L10nState): (value: Date) => string {
      return (value: Date) => {
        const { dateFnsLocale, patterns } = state;
        if (!dateFnsLocale) return value.toISOString();
        return dfFormat(
          value,
          patterns.shortDateFmt || 'P',
          { locale: dateFnsLocale },
        );
      };
    },
  },
  actions: {
    loadDateFnsLocale({ commit, state }, tag): Promise<void> | void {
      if (!tag) {
        commit('dateFnsLocaleReset');
        return;
      }
      if (!state.dateFnsLocale || state.dateFnsLocale.code !== tag) {
        const localeModule = tag.replace(/_/mg, '-');
        commit('dateFnsLocaleLoading');
        // eslint-disable-next-line consistent-return
        return import(
          /* webpackChunkName: "l10n.date-fns." */
          /* eslint-disable-next-line comma-dangle */
          `date-fns/locale/${localeModule}/index.js`
        )
          .then((mod) => commit('dateFnsLocaleLoaded', mod))
          .catch((err) => commit('dateFnsError', err));
      }
    },
    loadJadetreeLocale({ commit, state }, tag): Promise<void> | void {
      if (!tag) {
        commit('jadetreeLocaleReset');
        return;
      }
      const { language } = parseLocale(tag);
      if (state.jadetreeModule && state.jadetreeLanguage === language) {
        if (!hasOwnProperty(state.jadetreeModule, tag)) {
          // Not found within language module
          commit('jadetreeLocaleNotFound', { tag, language });
        } else {
          // Update from already loaded module
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          commit('jadetreeLocaleUpdate', state.jadetreeModule![tag]);
        }
      } else {
        // Load new language module
        commit('jadetreeModuleLoading');
        // eslint-disable-next-line consistent-return
        return import(
          /* webpackChunkName: "l10n.jadetree." */
          /* eslint-disable-next-line comma-dangle */
          `@jadetree/currency/locales/${language}.js`
        )
          .then((mod) => {
            commit('jadetreeModuleLoaded', { mod, language });
            if (!hasOwnProperty(mod, tag)) {
              // Not found within language module
              commit('jadetreeLocaleNotFound', { tag, language });
            } else {
              // Update from already loaded module
              commit('jadetreeLocaleUpdate', mod[tag]);
            }
          })
          .catch((err) => { commit('jadetreeModuleError', err); });
      }
    },
    // eslint-disable-next-line consistent-return
    loadLocale({ dispatch, commit }, tag): Promise<void> | void {
      if (!tag) {
        commit('dateFnsLocaleReset');
        commit('jadetreeLocaleReset');
        commit('setLocale', '');
      } else {
        const dfTag = negotiateLocale([tag], DateFnsAvailable);
        const jtTag = negotiateLocale([tag], JadeTreeAvailable);

        if (!dfTag) {
          commit('dateFnsError', `Could not find date-fns locale for ${tag}`);
        }
        if (!jtTag) {
          commit('jadetreeError', `Could not find Jade Tree locale for ${tag}`);
        }

        // Load Jade Tree Locale, then date-fns Locale, then update the locale
        // tag and notify other Vuex modules
        return dispatch('loadDateFnsLocale', dfTag)
          .then(() => dispatch('loadJadetreeLocale', jtTag))
          .then(() => commit('setLocale', tag))
          .then(() => dispatch('dispatchAll', { actionName: 'onLocaleChange' }, { root: true }))
          // eslint-disable-next-line no-console
          .catch((err) => { console.log(err); });
      }
    },
    // eslint-disable-next-line consistent-return
    onLogin({ commit, dispatch, rootState }): Promise<void> | void {
      const { user } = (rootState as FullState).auth;
      if (user && user.profile_setup) {
        commit('setUserPatterns', (rootState as FullState).auth.user);
        return dispatch('loadLocale', user.locale);
      }
    },
    // eslint-disable-next-line consistent-return
    onUserUpdate({ commit, dispatch, rootState }) {
      const { user } = (rootState as FullState).auth;
      if (user && user.profile_setup) {
        commit('setUserPatterns', (rootState as FullState).auth.user);
        return dispatch('loadLocale', user.locale);
      }
    },
  },
  mutations: {
    /* date-fns Locale Mutators */
    dateFnsError(state, err) {
      state.dateFnsStatus = { error: err };
    },
    dateFnsLocaleLoading(state) {
      state.dateFnsStatus = { loading: true };
      state.dateFnsLocale = null;
      state.dateFnsTag = '';
    },
    dateFnsLocaleLoaded(state, mod) {
      state.dateFnsStatus = { loaded: true };
      state.dateFnsLocale = mod;
      state.dateFnsTag = mod.code.replace(/-/mg, '_');
    },
    dateFnsLocaleReset(state) {
      state.dateFnsStatus = { };
      state.dateFnsLocale = null;
      state.dateFnsTag = '';
    },
    /* Jade Tree Locale Mutators */
    jadetreeError(state, err) {
      state.jadetreeStatus = { error: err };
    },
    jadetreeModuleLoading(state) {
      state.jadetreeStatus = { loading: true };
      state.jadetreeLanguage = '';
      state.jadetreeModule = null;
      state.jadetreeLocale = null;
      state.jadetreeTag = '';
    },
    jadetreeModuleLoaded(state, { mod, language }) {
      state.jadetreeStatus = { loaded: true };
      state.jadetreeLanguage = language;
      state.jadetreeModule = mod;
    },
    jadetreeLocaleNotFound(state, { tag, language }) {
      const error = `Jade Tree Locale ${tag} not found `
        + `in language module ${language}`;

      state.jadetreeStatus = { error };
    },
    jadetreeLocaleReset(state) {
      state.jadetreeStatus = { };
      state.jadetreeLocale = null;
      state.jadetreeTag = '';
    },
    jadetreeLocaleUpdate(state, locale) {
      state.jadetreeStatus = { loaded: true };
      state.jadetreeLocale = locale;
      state.jadetreeTag = locale.tag;
    },
    /* Main Locale Tag Mutators */
    setLocale(state, tag) {
      state.tag = tag;
    },
    /* User Pattern Mutator */
    setUserPatterns(state, user) {
      /* eslint-disable @typescript-eslint/camelcase */
      const {
        fmt_date_short,
        fmt_date_long,
        fmt_decimal,
        fmt_currency,
        fmt_accounting,
      } = user;

      let accountingPattern: NumberPattern | null = null;
      if (fmt_accounting) {
        accountingPattern = parsePattern(fmt_accounting);
      }

      let currencyPattern: NumberPattern | null = null;
      if (fmt_currency) {
        currencyPattern = parsePattern(fmt_currency);
      }

      let decimalPattern: NumberPattern | null = null;
      if (fmt_decimal) {
        decimalPattern = parsePattern(fmt_decimal);
      }

      state.patterns = {
        accountingPattern,
        currencyPattern,
        decimalPattern,
        longDateFmt: fmt_date_long,
        shortDateFmt: fmt_date_short,
      };
      /* eslint-enable @typescript-eslint/camelcase */
    },
  },
};

export default l10nModule;
