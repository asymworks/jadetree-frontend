<!-- eslint-disable max-len -->
<template>
  <jt-narrow-layout>
    <div>
      <h2 class="font-medium text-2xl text-center w-full mb-3">Welcome to Jade Tree</h2>
      <p class="block pb-2 text-justify text-sm">
        Please complete the following steps to set up your profile and
        start budgeting!
      </p>
      <div class="my-4">
        <div class="flex items-center pb-2">
          <div class="flex-1">
            <div
              class="w-10 h-10 mx-auto rounded-full text-lg flex items-center justify-center"
              :class="{
                  'bg-transparent border-2 border-green-500': step === 0,
                  'bg-green-500 text-white': step > 0,
                }"
            >
              <svg v-if="step === 0" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
            </div>
          </div>
          <div class="w-1/6 sm:w-1/4 align-center items-center align-middle content-center flex">
            <div class="w-full bg-gray-300 rounded items-center align-middle align-center flex-1">
              <div
                class="bg-green-500 text-xs leading-none py-1 text-center text-grey-800 rounded"
                :style="step1LineStyle"
              ></div>
            </div>
          </div>
          <div class="flex-1">
            <div
              class="w-10 h-10 mx-auto rounded-full text-lg flex items-center justify-center"
              :class="{
                  'bg-transparent border-2 border-gray-700': step < 1,
                  'bg-transparent border-2 border-green-500': step === 1,
                  'bg-green-500 text-white': step > 1,
                }"
            >
              <svg v-if="step <= 1" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
            </div>
          </div>
          <div class="w-1/6 sm:w-1/4 align-center items-center align-middle content-center flex">
            <div class="w-full bg-gray-300 rounded items-center align-middle align-center flex-1">
              <div
                class="bg-green-500 text-xs leading-none py-1 text-center text-grey-800 rounded"
                :style="step2LineStyle"
              ></div>
            </div>
          </div>
          <div class="flex-1">
            <div
              class="w-10 h-10 mx-auto rounded-full text-lg flex items-center justify-center"
              :class="{
                  'bg-transparent border-2 border-gray-700': step < 2,
                  'bg-transparent border-2 border-green-500': step === 2,
                  'bg-green-500 text-white': step > 2,
                }"
            >
              <svg v-if="step <= 2" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
              <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
            </div>
          </div>
        </div>
        <div class="flex items-start content-center text-xs text-center font-medium">
          <div class="flex-1">
            Profile Setup
          </div>
          <div class="w-1/6 sm:w-1/4 "></div>
          <div class="flex-1">
            Add a Budget
          </div>
          <div class="w-1/6 sm:w-1/4 "></div>
          <div class="flex-1">
            Add Accounts
          </div>
        </div>
      </div>
      <formulate-form class="mb-4" @submit="doOnboardProfile">
        <div v-show="step === 0">
          <locale-editor-controller
            :language="language"
            :country="country"
            :currency.sync="currency"
            :locale.sync="locale"
            :previewNegative="previewNegative"
            :restrictLocales.sync="restrictLocales"
          >
            <template v-slot:default="context">
              <div class="flex flex-col items-stretch">
                <formulate-input
                  :clearButton="false"
                  :disabled="true"
                  :help="'This field has been set by your system administrator and cannot be changed'"
                  :options="context.languageOptions"
                  label="Language"
                  labelPosition="float"
                  name="language"
                  type="jtSelect"
                  v-model="language"
                  validation="required"
                  validation-name="Language"
                />
                <formulate-input
                  :options="context.countryOptions"
                  :disabled="onboardProfileLoading || onboardProfileComplete"
                  label="Country"
                  labelPosition="float"
                  name="country"
                  type="jtSelect"
                  v-model="country"
                  validation="required"
                  validation-name="Country"
                />
                <div class="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4">
                  <div class="w-full">
                    <formulate-input
                      :class="['w-full']"
                      :disabled="onboardProfileLoading || onboardProfileComplete"
                      :options="context.localeOptions"
                      label="Formatting Locale"
                      labelPosition="float"
                      name="locale"
                      type="jtSelect"
                      v-model="locale"
                      validation="required"
                      validation-name="Formatting Locale"
                    />
                    <formulate-input
                      label="Only Suggested Locales"
                      labelClass="ml-2 font-medium text-xs"
                      type="checkbox"
                      v-model="restrictLocales"
                    />
                  </div>
                  <div class="w-full mb-4 sm:mb-0">
                    <formulate-input
                      :class="['w-full']"
                      :disabled="onboardProfileLoading || onboardProfileComplete"
                      :options="context.currencyOptions"
                      label="Default Currency"
                      labelPosition="float"
                      name="currency"
                      type="jtSelect"
                      v-model="currency"
                      validation="required"
                      validation-name="Default Currency"
                    />
                  </div>
                </div>
                <div class="sm:border-b h-px my-1 sm:my-4"></div>
                <div class="w-full flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between">
                  <div class="flex-grow flex flex-col items-stretch mt-4 sm:mt-0">
                    <div class="flex items-center cursor-pointer" @click="previewOpen=!previewOpen">
                      <div class="w-4">
                        <div v-if="previewOpen" class="arrow-down"></div>
                        <div v-else class="arrow-right"></div>
                      </div>
                      <span class="block font-medium text-sm">Preview Number and Date Formats</span>
                    </div>
                    <div v-if="previewOpen">
                      <table class="w-full sm:w-64 my-2 text-xs leading-relaxed">
                        <tr>
                          <th class="text-left">Decimal Number</th>
                          <td class="text-right">{{ context.previewDecimal }}</td>
                        </tr>
                        <tr>
                          <th class="text-left">Currency</th>
                          <td class="text-right">{{ context.previewCurrency }}</td>
                        </tr>
                        <tr>
                          <th class="text-left">Accounting</th>
                          <td class="text-right">{{ context.previewAccounting }}</td>
                        </tr>
                        <tr><td class="py-1" colspan="2"><hr /></td></tr>
                        <tr>
                          <th class="text-left">Short Date</th>
                          <td class="text-right">{{ context.previewShortDate }}</td>
                        </tr>
                        <tr>
                          <th class="text-left">Long Date</th>
                          <td class="text-right">{{ context.previewLongDate }}</td>
                        </tr>
                      </table>
                      <formulate-input
                        :class="['mt-3']"
                        label="Show Negative Numbers"
                        labelClass="ml-1 font-medium text-xs"
                        type="checkbox"
                        v-model="previewNegative"
                      />
                    </div>
                  </div>
                  <div class="mt-2 flex items-center justify-end">
                    <jt-button
                      :class="['flex items-center justify-center w-full sm:w-auto']"
                      color="blue"
                      type="submit"
                      :loading="onboardProfileLoading"
                    >
                      Next Step
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                    </jt-button>
                  </div>
                </div>
              </div>
            </template>
          </locale-editor-controller>
        </div>
      </formulate-form>
      <formulate-form class="mb-4" @submit="doOnboardBudget">
        <div v-show="step === 1">
          <div class="flex flex-col items-stretch">
            <formulate-input
              :class="['w-full']"
              :disabled="onboardBudgetLoading || onboardBudgetComplete"
              label="Budget Name"
              labelPosition="float"
              name="name"
              type="text"
              v-model="budgetName"
              validation="required"
              validation-name="Budget Name"
            />
            <currency-options>
              <template v-slot="currencyChoices">
                <formulate-input
                  :class="['w-full']"
                  :disabled="true"
                  :help="'This field has been set by your system administrator and cannot be changed'"
                  :options="currencyChoices"
                  label="Budget Currency"
                  labelPosition="float"
                  name="currency"
                  type="jtSelect"
                  v-model="budgetCurrency"
                  validation="required"
                  validation-name="Budget Currency"
                />
              </template>
            </currency-options>
            <div class="flex justify-end w-full">
              <div class="mt-2 flex items-center justify-end">
                <jt-button
                  :class="['flex items-center justify-center w-full sm:w-auto']"
                  color="blue"
                  type="submit"
                  :loading="onboardBudgetLoading"
                >
                  Next Step
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                </jt-button>
              </div>
            </div>
          </div>
        </div>
      </formulate-form>
      <div v-show="step === 2">
        <div class="flex flex-col items-stretch">
          <div v-if="!!currentBudget">
            <p class="mb-2 text-sm">
              Jade Tree setup is complete and you are ready to go! You can add
              accounts now using the Add Account button below, and you can also
              add them later. Click Complete Setup when you are done.
            </p>
            <table v-if="budgetAccounts(currentBudget.id).length + offBudgetAccounts.length > 0" class="w-full mb-2">
              <thead>
                <tr class="text-left">
                  <th>Account Name</th>
                  <th>Type</th>
                  <th class="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="account in budgetAccounts(currentBudget.id)" :key="account.id">
                  <td>{{ account.name }}</td>
                  <td>{{ subtypeName(account.type, account.subtype) }}</td>
                  <td class="text-right">{{ formatCurrency(account.balance) }}</td>
                </tr>
                <tr v-if="offBudgetAccounts.length > 0">
                  <td class="font-medium text-sm pt-3" colspan="3">Off Budget</td>
                </tr>
                <tr v-if="offBudgetAccounts.length > 0">
                  <td colspan="3"><hr /></td>
                </tr>
                <tr v-for="account in offBudgetAccounts" :key="account.id">
                  <td>{{ account.name }}</td>
                  <td>{{ subtypeName(account.type, account.subtype) }}</td>
                  <td class="text-right">{{ formatCurrency(account.balance) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-end w-full">
            <div class="w-full mt-2 flex flex-col sm:flex-row items-center justify-between">
              <jt-button
                :class="['flex items-center justify-center w-full sm:w-auto mb-4 sm:mb-0']"
                color="light-blue"
                type="button"
                @click="addAccount"
              >
                Add Account
              </jt-button>
              <jt-button
                :class="['flex items-center justify-center w-full sm:w-auto']"
                color="blue"
                type="button"
                @click="doComplete"
              >
                Complete Setup
              </jt-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </jt-narrow-layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { mapGetters, mapState } from 'vuex';
import { Money, negotiateLocale, parseLocale } from '@jadetree/currency';

import { budgetService, userService, AccountSubtypeOptions } from '@/api';
import { ApiError, BudgetSchema, UserSchema } from '@/api/types';

import { Available } from '@/l10n';

import CurrencyOptions from '../components/inputs/CurrencyOptions';
import { LocaleEditorController } from '../components/profile';
import AddAccountDialog from '../dialogs/AddAccountDialog.vue';
import JtNarrowLayout from '../layouts/JtNarrowLayout.vue';

function getDefaultCountry(): string {
  if (navigator && navigator.languages) {
    const locale = negotiateLocale(navigator.languages, Available, '-');
    if (locale) {
      const { territory } = parseLocale(locale, '-');
      if (territory) return territory;
    }
  }

  // Fallback to US
  return 'US';
}

@Component({
  components: {
    CurrencyOptions,
    JtNarrowLayout,
    LocaleEditorController,
  },
  computed: {
    ...mapGetters(['user']),
    ...mapGetters('account', ['budgetAccounts', 'offBudgetAccounts']),
    ...mapState('budget', ['currentBudget']),
  },
})
export default class OnboardPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private user!: UserSchema;
  /* eslint-enable lines-between-class-members */

  /* eslint-disable lines-between-class-members */
  private country = '';
  private currency = '';
  private language = 'en';
  private locale = '';
  /* eslint-enable lines-between-class-members */

  /* eslint-disable lines-between-class-members */
  private budgetName = '';
  private budgetCurrency = '';
  private budgetPreset = '';
  /* eslint-enable lines-between-class-members */

  /** Onboard Account Create Request is Loading */
  private onboardAccountLoading = false;

  /** Onboard Account Create Request is Complete */
  private onboardAccountComplete = false;

  /** Onboard Budget Create Request is Loading */
  private onboardBudgetLoading = false;

  /** Onboard Budget Create Request is Complete */
  private onboardBudgetComplete = false;

  /** Onboard Profile Set Request is Loading */
  private onboardProfileLoading = false;

  /** Onboard Profile Set Request is Complete */
  private onboardProfileComplete = false;

  /** Preview Negative Numbers */
  private previewNegative = false;

  /** Preview Pane Open */
  private previewOpen = false;

  /** Current Step Index */
  private step = 0;

  /** Restrict Locales to Suggested */
  private restrictLocales = true;

  /** Get Style for Step 1 Line */
  get step1LineStyle() {
    return {
      width: this.step > 0 ? '100%' : '0%',
    };
  }

  /** Get Style for Step 2 Line */
  get step2LineStyle() {
    return {
      width: this.step > 1 ? '100%' : '0%',
    };
  }

  /** Back Button should go back in wizard */
  @Watch('$route')
  routeChanged(value: Route) {
    this.handleRouteChanged(value);
  }

  /** Load Setup Defaults */
  mounted() {
    this.country = getDefaultCountry();
    this.step = 0;
    if (this.user && this.user.profile_setup) {
      this.step = 1;
      this.budgetCurrency = this.user.currency || 'XXX';
      this.updateRoute();

      budgetService.getBudgets().then((budgets) => {
        if (budgets.length > 0) {
          this.step = 2;
          this.updateRoute();
        }
      });
    }
  }

  /** Add an Account */
  addAccount() {
    this.$modalEventBus.$emit('open', {
      component: AddAccountDialog,
      options: {
        lockFocus: true,
      },
    });
  }

  /** Complete Setup */
  doComplete() {
    let { next } = this.$router.currentRoute.query;
    if (!next) {
      next = '/home';
    }

    this.$router.push(next as string).catch((err) => {
      // Ignore NavigationFailureType.redirected
      if (err.type && err.type !== 2) {
        throw err;
      }
    });
  }

  /** Submit the budget creation request */
  doOnboardBudget(data: BudgetSchema) {
    const { name, currency } = data;
    const { dispatch } = this.$store;

    this.onboardBudgetLoading = true;
    dispatch('budget/createBudget', { name, currency })
      .then(() => {
        this.onboardBudgetComplete = true;
        this.onboardBudgetLoading = false;

        this.step += 1;
        this.updateRoute();
      })
      .catch((error: ApiError) => {
        this.onboardBudgetLoading = false;
        this.$notify({
          group: 'top',
          title: 'Error',
          text: error.message,
          type: 'error',
        });
      });
  }

  /** Submit the user profile data */
  doOnboardProfile(data: UserSchema) {
    const { language, locale, currency } = data;

    this.onboardProfileLoading = true;
    userService.updateUserProfile({ language, locale, currency })
      .then((user) => {
        const { dispatch } = this.$store;
        dispatch('auth/updateUser', user);
      })
      .then(() => {
        this.onboardProfileComplete = true;
        this.onboardProfileLoading = false;
        this.budgetCurrency = this.currency;

        this.step += 1;
        this.updateRoute();
      })
      .catch((error: ApiError) => {
        this.onboardProfileLoading = false;
        this.$notify({
          group: 'top',
          title: 'Error',
          text: error.message,
          type: 'error',
        });
      });
  }

  /** Format Money */
  formatCurrency(amount?: Money): string {
    if (!amount) return '';

    const { l10n } = this.$store.state;
    if (!l10n.jadetreeLocale) return amount.toString();
    return amount.format(l10n.jadetreeLocale);
  }

  /** Handle the Route Changing */
  handleRouteChanged(value: Route) {
    const { path, hash } = value;
    if (path !== '/onboard') {
      // Navigating away from onboarding page
      return;
    }

    const hashMatch = hash ? hash.match(/step(\d+)$/) : '';
    const hashStep = hashMatch && hashMatch.length > 1
      ? Number.parseInt(hashMatch[1], 10) - 1
      : 0;

    if (hashStep === this.step - 1) {
      // Go back one step
      this.step = hashStep;
    }

    this.updateRoute();
  }

  /** Lookup the Subtype Name */
  subtypeName(typeValue: string, subtypeValue: string): string {
    if (subtypeValue === 'other') {
      if (typeValue === 'A') return 'Other Asset';
      if (typeValue === 'L') return 'Other Loan or Liability';
      return 'Other (Unknown)';
    }

    const option = AccountSubtypeOptions.find((o) => o.subtype === subtypeValue);
    return option ? option.label : 'Unknown';
  }

  /** Update the route with the step number in the hash */
  updateRoute() {
    const { path, query, hash: curHash } = this.$route;
    const hash = this.step > 0 ? `#step${this.step + 1}` : '';
    if (hash !== curHash) {
      this.$router.push({ path, query, hash });
    }
  }
}
</script>
