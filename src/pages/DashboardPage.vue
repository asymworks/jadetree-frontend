<!-- eslint-disable max-len -->
<template>
  <jt-standard-layout
    :error="accountError || budgetError"
    :loading="accountLoading || budgetLoading"
  >
    <div class="flex flex-col-reverse items-stretch space-x-0 space-y-2 space-y-reverse p-2 md:flex-row md:items-start md:space-x-2 md:space-y-0">
      <div class="flex-1 flex-grow border rounded bg-white p-4 md:max-w-sm">
        <div class="flex items-start justify-between">
          <div class="text-lg font-medium">
            <router-link to="/transactions">All Accounts</router-link>
          </div>
          <div
            class="text-right text-lg font-medium"
            :class="{
                'text-red-700': sumBalances(accounts).lt(0),
              }"
          >
            {{ formatCurrency(sumBalances(accounts)) }}
          </div>
        </div>

        <div v-if="accounts.some((a) => a.budget_id)" class="mt-2">
          <div class="flex items-start justify-between border-b">
            <div class="font-medium">Budget Accounts</div>
            <div
              class="text-right font-medium"
              :class="{
                  'text-red-700': sumBalances(accounts.filter((a) => a.budget_id)).lt(0),
                }"
            >
              {{ formatCurrency(sumBalances(accounts.filter((a) => a.budget_id))) }}
            </div>
          </div>
          <template v-for="budget in budgets">
            <template
              v-for="
                account in budgetAccounts(budget.id)
                  .sort((a, b) => a.display_order - b.display_order)
              "
            >
              <div
                :key="`acct-${budget.id}-${account.id}`"
                class="flex items-start justify-between"
              >
                <div>
                  <router-link :to="`/transactions/${account.id}`">
                    {{ account.name }}
                  </router-link>
                </div>
                <div
                  class="text-right"
                  :class="{
                      'text-red-700': account.balance.lt(0),
                    }"
                >
                  {{ formatCurrency(account.balance || new Money(0, account.currency)) }}
                </div>
              </div>
            </template>
          </template>
        </div>

        <div v-if="offBudgetAccounts.length" class="mt-2">
          <div class="flex items-start justify-between border-b">
            <div class="font-medium">Off Budget Accounts</div>
            <div
              class="text-right font-medium"
              :class="{
                  'text-red-700': sumBalances(offBudgetAccounts).lt(0),
                }"
            >
              {{ formatCurrency(sumBalances(offBudgetAccounts)) }}
            </div>
          </div>
          <template
            v-for="
              account in offBudgetAccounts
                .sort((a, b) => a.display_order - b.display_order)
            "
          >
            <div
              :key="`acct-ob-${account.id}`"
              class="flex items-start justify-between"
            >
              <div>{{ account.name }}</div>
              <div
                class="text-right"
                :class="{
                    'text-red-700': account.balance.lt(0),
                  }"
              >
                {{ formatCurrency(account.balance || new Money(0, account.currency)) }}
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="flex-1 flex-grow border rounded bg-white p-4">
        <div class="flex flex-col items-stretch">
          <div class="flex flex-row flex-wrap items-center justify-between">
            <h1 class="text-lg font-medium">
              <router-link to="/budget">{{ currentBudget ? currentBudget.name : '' }}</router-link>
            </h1>
            <div>
              <jt-button
                :class="['flex', 'items-center', 'justify-center']"
                color="blue"
                size="small"
                type="button"
                @click="openTransactionDialog"
              >
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path></svg>
                Add Transaction
              </jt-button>
            </div>
          </div>
          <div class="text-sm text-gray-800 flex items-end justify-start mt-2">
            <div>
              <div class="font-light">Income</div>
              <div class="font-bold">
                {{ formatCurrency(currentMonthData ? currentMonthData.income : 0) }}
              </div>
            </div>
            <div class="font-bold px-2">&ndash;</div>
            <div>
              <div class="font-light">Budgeted</div>
              <div class="font-bold">
                {{ formatCurrency(currentMonthData ? currentMonthData.budgeted : 0) }}
              </div>
            </div>
            <div class="font-bold px-2">=</div>
            <div>
              <div class="font-light">Remaining</div>
              <div class="font-bold" :class="{
                  'text-red-700': currentMonthData && currentMonthData.available.lt(0),
                }"
              >
                {{ formatCurrency(currentMonthData ? currentMonthData.available : 0) }}
              </div>
            </div>
          </div>
          <div class="relative flex items-center justify-start h-min w-full border rounded-full p-px">
            <div
              class="rounded-full bg-green-400 m-px h-2"
              :style="{
                  width: `${percentBudgeted.toString()}%`
                }"
              :class="{
                  'bg-red-500': currentMonthData && currentMonthData.available.lt(0),
                  'bg-gray-500': currentMonthData && currentMonthData.available.eq(0),
                  'bg-blue-500': currentMonthData && currentMonthData.available.gt(0),
                }"
            ></div>
            <div
              class="absolute left-0 inset-y-0 border-r border-gray-700"
              :style="{width:`${percentElapsed.toString()}%`}"
            ></div>
          </div>
        </div>
        <div class="text-sm text-gray-800 flex items-end justify-start mt-4">
          <div>
            <div class="font-light">Spent this Month</div>
            <div class="font-bold">{{ formatCurrency(currentMonthOutflows) }}</div>
          </div>
          <div class="font-bold px-2">of</div>
          <div>
            <div class="font-light">Budgeted</div>
            <div class="font-bold">{{ formatCurrency(currentMonthData ? currentMonthData.budgeted : 0) }}</div>
          </div>
        </div>
        <div class="relative flex items-center justify-start h-min w-full border rounded-full p-px">
          <div
            class="rounded-full bg-green-400 m-px h-2"
            :style="{
                width: `${percentSpent.toString()}%`
              }"
          ></div>
          <div
            class="absolute left-0 inset-y-0 border-r border-gray-700"
            :style="{width:`${percentElapsed.toString()}%`}"
          ></div>
        </div>
        <div
          v-if="overspentCategories.length"
          class="mt-4"
        >
          <h3 class="font-medium">Overspent Categories</h3>
          <table class="text-sm w-full">
            <thead>
              <tr>
                <th class="text-left">Category</th>
                <th class="text-right hidden lg:table-cell">Outflows</th>
                <th class="text-right">Overspent</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in overspentCategories" :key="c.category_id">
                <td class="text-left">{{ categoryName(c.category_id) }}</td>
                <td class="text-right hidden lg:table-cell">{{ formatCurrency(c.outflow) }}</td>
                <td class="text-right text-red-600">{{ formatCurrency(c.overspend) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </jt-standard-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import {
  addMonths,
  getDaysInMonth,
  getDate,
  isSameMonth,
} from 'date-fns';
import Decimal from 'decimal.js-light';
import { Money } from '@jadetree/currency';
import { budgetService } from '@/api';
// eslint-disable-next-line import/named
import {
  AccountSchema,
  BudgetDataSchema,
  CategorySchema,
  CategoryDataSchema,
} from '@/api/types';

import AddAccountDialog from '../dialogs/AddAccountDialog.vue';
import AddTransactionDialog from '../dialogs/AddTransactionDialog.vue';
import JtStandardLayout from '../layouts/JtStandardLayout.vue';

@Component({
  components: { JtStandardLayout },
  computed: {
    ...mapState('account', ['accounts']),
    ...mapState('budget', ['budgets', 'currentBudget', 'currentMonthData']),
    ...mapGetters(['userCurrency']),
    ...mapGetters('account', [
      'accountError',
      'accountLoading',
      'budgetAccounts',
      'offBudgetAccounts',
    ]),
    ...mapGetters('budget', [
      'budgetError',
      'budgetLoading',
      'findCategory',
    ]),
    ...mapGetters('l10n', ['formatCurrency', 'formatMonth']),
  },
})
export default class DashboardPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private accounts!: AccountSchema[];
  private currentMonthData!: BudgetDataSchema;
  private findCategory!: (id: number) => CategorySchema[];
  private formatMonth!: (date: Date) => string;
  private userCurrency!: string;
  /* eslint-disable lines-between-class-members */

  /** Current Display Date */
  private displayDate: Date = new Date();

  /** Display Update Timer */
  private displayTimer: number | null = null;

  /** Current Outflows */
  get currentMonthOutflows(): Money {
    if (!this.currentMonthData) return new Money(0);
    return this.currentMonthData.categories.reduce(
      (acc, cur) => acc.add((cur.outflow as Money).amount),
      new Money(0, this.userCurrency),
    );
  }

  /** Overspent Categories */
  get overspentCategories(): CategoryDataSchema[] {
    if (!this.currentMonthData) return [];
    return this.currentMonthData.categories.filter(
      (c: CategoryDataSchema) => (c.overspend as Money).ne(0),
    );
  }

  /** Percent Time Elapsed */
  get percentElapsed(): Decimal {
    return new Decimal(getDate(this.displayDate))
      .div(getDaysInMonth(this.displayDate))
      .mul(100)
      .toDecimalPlaces(1);
  }

  /** Percent Budgeted */
  get percentBudgeted(): Decimal {
    if (!this.currentMonthData) return new Decimal(0);

    const { budgeted, income } = this.currentMonthData;
    if (!budgeted || !income || (income as Money).eq(0)) return new Decimal(0);

    return (budgeted as Money).amount
      .div((income as Money).amount)
      .mul(100)
      .toDecimalPlaces(1);
  }

  /** Percent Spent */
  get percentSpent(): Decimal {
    if (!this.currentMonthData) return new Decimal(0);

    const { budgeted } = this.currentMonthData;
    if (!budgeted || (budgeted as Money).eq(0)) return new Decimal(0);

    return (this.currentMonthOutflows as Money).amount
      .div((budgeted as Money).amount)
      .mul(100)
      .toDecimalPlaces(1);
  }

  /** Start a 1min timer to update dashboard */
  mounted() {
    this.displayTimer = setInterval(() => { this.updateDisplay(); }, 60000);
  }

  /** Clear Update Timer */
  beforeDestroy() {
    if (this.displayTimer !== null) {
      clearInterval(this.displayTimer);
      this.displayTimer = null;
    }
  }

  /** Get the Full Category Name */
  categoryName(categoryId: number): string {
    const date = this.displayDate;
    const categories = this.findCategory(categoryId);

    if (!categories || categories.length === 0) return '';
    if (categories.length === 1) {
      return budgetService.translateName(categories[0].name || '');
    }

    if (categories[1].name === '_income') {
      if (categories[0].name === '_next_month') {
        return `Income for ${this.formatMonth(addMonths(date, 1))}`;
      }
      return `Income for ${this.formatMonth(date)}`;
    }

    return categories.map(
      (c) => budgetService.translateName(c.name || ''),
    ).reverse().join(' : ');
  }

  /** Open the Add Account Dialog */
  openAccountDialog() {
    this.$modalEventBus.$emit('open', {
      component: AddAccountDialog,
      options: {
        lockFocus: true,
      },
    });
  }

  /** Show the Add Transaction dialog */
  openTransactionDialog() {
    this.$modalEventBus.$emit('open', {
      component: AddTransactionDialog,
      options: { lockFocus: true },
    });
  }

  /** Sum Balances of Accounts */
  sumBalances(accounts: AccountSchema[]): Money {
    return accounts.reduce(
      (acc, cur) => acc.add(cur.balance || new Money(0, this.userCurrency)),
      new Money(0, this.userCurrency),
    );
  }

  /** Update the Dashboard Display */
  updateDisplay() {
    const nextDate = new Date();
    if (!isSameMonth(this.displayDate, nextDate)) {
      console.log('changedMonth');
      // Reload budget data for the new current month
      const { dispatch } = this.$store;
      dispatch('budget/loadBudgetData');
    }

    this.displayDate = nextDate;
  }
}
</script>

<style>
.jtc-button.jtc-button--small {
  @apply .px-2 .py-1 .text-sm;
}
</style>
