<!-- eslint-disable max-len -->
<template>
  <jt-sidebar-layout>
    <template v-slot:default>
      <div class="hidden md:block sticky top-0 w-full h-2 bg-gray-100 z-10"><!-- mask space above totals header --></div>
      <table class="w-full">
        <thead class="px-2 text-sm">
          <tr class="sticky top-0 md:top-2">
            <th class="text-left">Date</th>
            <th class="text-left">Payee</th>
            <th class="text-left">Category</th>
            <th class="text-right">Inflow</th>
            <th class="text-right">Outflow</th>
            <th class="text-left"></th>
          </tr>
        </thead>
        <tbody class="relative pb-32 md:pb-0 text-sm">
          <template v-for="t in transactions">
            <template v-if="t.splits.length === 1">
              <tr :key="`${t.transaction_id}-${t.line_id}`">
                <td class="text-left">{{ formatShortDate(t.date) }}</td>
                <td class="text-left overflow-ellipsis">
                  <div v-if="t.splits[0].type === 'transfer'" class="flex items-center justify-between">
                    <span class="inline-block">Transfer: {{ accountName(t.splits[0].transfer_id) }}</span>
                    <span class="inline-block text-gray-700 mr-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                      </svg>
                    </span>
                  </div>
                  <div v-else>
                    {{ payeeName(t.payee_id) }}
                  </div>
                </td>
                <td class="text-left overflow-ellipsis">
                  {{
                    t.splits[0].type !== 'transfer'
                      ? categoryName(t.splits[0].category_id, t.date)
                      : ''
                  }}
                </td>
                <td class="text-right">
                  {{ inflowAmount(t, t.amount).gt(0) ? formatCurrency(inflowAmount(t, t.amount)) : '' }}
                </td>
                <td class="text-right">
                  {{ outflowAmount(t, t.amount).gt(0) ? formatCurrency(outflowAmount(t, t.amount)) : '' }}
                </td>
                <td class="flex items-center justify-end space-x-2">
                  <button
                    class="appearance-none focus:outline-none active:outline-none"
                    :class="{
                      'text-gray-400 hover:text-black': !t.cleared && !t.reconciled,
                      'text-green-500': t.cleared || t.reconciled,
                    }"
                    type="button"
                    v-tooltip="!t.cleared ? 'Mark as Cleared' : 'Mark as Uncleared'"
                    @click="clearTransaction(t)"
                  >
                    <svg v-if="!t.reconciled" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                  <button
                    class="appearance-none focus:outline-none active:outline-none text-gray-600 hover:text-black"
                    type="button"
                    v-tooltip="'Edit Transaction'"
                    @click="editTransaction(t)"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr :key="`${t.transaction_id}-${t.line_id}`">
                <td class="text-left">{{ formatShortDate(t.date) }}</td>
                <td class="text-left overflow-ellipsis">
                  {{ payeeName(t.payee_id) }}
                </td>
                <td
                  class="text-left cursor-pointer"
                  @click="toggleSplitRow(`${t.transaction_id}-${t.line_id}`)"
                >
                  <svg v-if="!isExpanded(`${t.transaction_id}-${t.line_id}`)" class="inline-block -ml-1 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else class="inline-block -ml-1 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                  Split (Multiple Categories)
                </td>
                <td class="text-right">
                  {{ inflowAmount(t, t.amount).gt(0) ? formatCurrency(inflowAmount(t, t.amount)) : '' }}
                </td>
                <td class="text-right">
                  {{ outflowAmount(t, t.amount).gt(0) ? formatCurrency(outflowAmount(t, t.amount)) : '' }}
                </td>
                <td class="flex items-center justify-end space-x-2">
                  <button
                    class="appearance-none focus:outline-none active:outline-none"
                    :class="{
                      'text-gray-400 hover:text-black': !t.cleared && !t.reconciled,
                      'text-green-500': t.cleared || t.reconciled,
                    }"
                    type="button"
                    v-tooltip="!t.cleared ? 'Mark as Cleared' : 'Mark as Uncleared'"
                    @click="clearTransaction(t)"
                  >
                    <svg v-if="!t.reconciled" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                  <button
                    class="appearance-none focus:outline-none active:outline-none text-gray-600 hover:text-black"
                    type="button"
                    v-tooltip="'Edit Transaction'"
                    @click="editTransaction(t)"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </template>
            <template v-if="t.splits.length > 1 && isExpanded(`${t.transaction_id}-${t.line_id}`)">
              <template v-for="split in t.splits">
                <tr :key="`${t.transaction_id}-${t.line_id}-${split.split_id}`">
                  <td class="text-left"></td>
                  <td class="text-left overflow-ellipsis">
                    {{ split.type === 'transfer' ? payeeName(t.transfer_id) : '' }}
                  </td>
                  <td class="text-left">
                    {{
                      split.type !== 'transfer'
                        ? categoryName(split.category_id, t.date)
                        : ''
                    }}
                  </td>
                  <td class="text-right">
                    {{ inflowAmount(t, split.amount).gt(0) ? formatCurrency(inflowAmount(t, split.amount)) : '' }}
                  </td>
                  <td class="text-right">
                    {{ outflowAmount(t, split.amount).gt(0) ? formatCurrency(outflowAmount(t, split.amount)) : '' }}
                  </td>
                  <td class="flex items-center justify-end space-x-2"></td>
                </tr>
              </template>
            </template>
          </template>
        </tbody>
      </table>
    </template>
    <template v-slot:sidebar>
      <div class="w-full text-lg font-medium">
        <jt-select
          id="accountSelect"
          :clearButton="false"
          :options="accountOptions"
          :value="currentAccountValue"
          @input="setCurrentAccount"
        />
      </div>
      <div v-if="currentAccount" class="flex flex-col items-stretch w-full my-2">
        <div class="hidden sm:flex items-center justify-between w-full">
          <div class="text-gray-800 sm:text-sm font-medium">Cleared Balance</div>
          <div class="text-right font-medium">{{ formatCurrency(clearedBalance) }}</div>
        </div>
        <div class="hidden sm:flex items-center justify-between w-full">
          <div class="text-gray-800 sm:text-sm font-medium">Uncleared Balance</div>
          <div class="text-right font-medium" :class="{'text-red-600':unclearedBalance.ne(0)}">
            {{ formatCurrency(unclearedBalance) }}
          </div>
        </div>
        <div class="flex items-center justify-between mt-2 sm:m-0 w-full">
          <div class="text-gray-800 sm:text-sm font-medium">Working Balance</div>
          <div class="text-right font-medium">{{ formatCurrency(workingBalance) }}</div>
        </div>
      </div>
      <div class="w-full mt-2">
        <jt-button
          :class="['flex', 'items-center', 'justify-center', 'w-full']"
          color="blue"
          type="button"
          @click="addTransaction"
        >
          Add Transaction
        </jt-button>
      </div>
    </template>
  </jt-sidebar-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { addMonths } from 'date-fns';
import { Money } from '@jadetree/currency';
import { budgetService, transactionService } from '@/api';
import {
  AccountSchema,
  BudgetSchema,
  CategorySchema,
  PayeeSchema,
  TransactionSchema,
} from '@/api/types';
import { compareKeys } from '@/util/sort';

import JtSidebarLayout from '../layouts/JtSidebarLayout.vue';

import AddTransactionDialog from '../dialogs/AddTransactionDialog.vue';
import EditTransactionDialog from '../dialogs/EditTransactionDialog.vue';

type AccountListOption = {
  value: string | number;
  label: string;
  group?: AccountListOption[];
}

@Component({
  components: {
    JtSidebarLayout,
  },
  computed: {
    ...mapState('account', ['accounts', 'currentAccount']),
    ...mapState('budget', ['currentBudget']),
    ...mapState('transactions', ['transactions']),
    ...mapGetters(['userCurrency']),
    ...mapGetters('account', ['budgetAccounts', 'findAccount', 'offBudgetAccounts']),
    ...mapGetters('budget', ['findCategory']),
    ...mapGetters('l10n', ['formatCurrency', 'formatMonth', 'formatShortDate']),
    ...mapGetters('transactions', ['findPayee']),
  },
})
export default class TransactionPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private budgetAccounts!: (id: number) => AccountSchema[];
  private currentAccount!: AccountSchema | null;
  private currentBudget!: BudgetSchema | undefined;
  private findAccount!: (id: number) => AccountSchema | undefined;
  private findCategory!: (id: number) => CategorySchema[];
  private findPayee!: (id: number) => PayeeSchema | undefined;
  private formatCurrency!: (money: Money) => string;
  private formatMonth!: (date: Date) => string;
  private offBudgetAccounts!: AccountSchema[];
  private transactions!: TransactionSchema[];
  private userCurrency!: string | undefined;
  /* eslint-enable lines-between-class-members */

  /** Expanded Split Rows */
  expandedRows: string[] = [];

  /** Account Selection Options */
  get accountOptions(): AccountListOption[] {
    const budgetAcctList = this.currentBudget
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? this.budgetAccounts(this.currentBudget.id!)
      : [];

    return [
      {
        value: 'all',
        label: 'All Accounts',
      },
      ...(budgetAcctList.length > 0
        ? [{
          value: 'on-budget',
          label: 'Budget Accounts',
          group: budgetAcctList.map((a) => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            value: a.id!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            label: a.name!,
          })).sort(compareKeys('label')),
        }]
        : []
      ),
      ...(this.offBudgetAccounts.length > 0
        ? [{
          value: 'off-budget',
          label: 'Off-Budget Accounts',
          group: this.offBudgetAccounts.map((a) => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            value: a.id!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            label: a.name!,
          })).sort(compareKeys('label')),
        }]
        : []
      ),
    ];
  }

  /** Cleared Transaction Balance */
  get clearedBalance(): Money {
    const ccy = this.currentAccount ? this.currentAccount.currency : 'XXX';
    return this.transactions.reduce(
      (acc, cur) => (cur.cleared && cur.amount ? acc.add(cur.amount) : acc),
      new Money(0, ccy),
    );
  }

  /** Current Account Value */
  get currentAccountValue(): string {
    return this.currentAccount
      ? `${this.currentAccount.id}`
      : 'all';
  }

  /** Show Account Balances */
  get showBalances(): boolean {
    // TODO: Add check for filters, etc
    return !!this.currentAccount;
  }

  /** Uncleared Transaction Balance */
  get unclearedBalance(): Money {
    const ccy = this.currentAccount ? this.currentAccount.currency : 'XXX';
    return this.transactions.reduce(
      (acc, cur) => (!cur.cleared && cur.amount ? acc.add(cur.amount) : acc),
      new Money(0, ccy),
    );
  }

  /** Working Balance */
  get workingBalance(): Money {
    const ccy = this.currentAccount ? this.currentAccount.currency : 'XXX';
    return this.transactions.reduce(
      (acc, cur) => (cur.amount ? acc.add(cur.amount) : acc),
      new Money(0, ccy),
    );
  }

  /** Get the name of an Account */
  accountName(accountId: number): string {
    const account = this.findAccount(accountId);

    if (!account || !account.name) return '';
    return account.name;
  }

  /** Show the Add Transaction dialog */
  addTransaction() {
    const account = (this.currentAccount && this.currentAccount.id)
      ? this.currentAccount.id
      : null;

    this.$modalEventBus.$emit('open', {
      component: AddTransactionDialog,
      options: { lockFocus: true },
      props: { account },
    });
  }

  /** Get the Full Category Name */
  categoryName(categoryId: number, date: Date): string {
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

  /** Clear or Un-Clear a Transaction */
  clearTransaction(txn: TransactionSchema) {
    const { dispatch } = this.$store;
    /* eslint-disable @typescript-eslint/camelcase */
    const { transaction_id, line_id, cleared } = txn;
    const data = { line_id, cleared: !cleared };
    dispatch('transactions/clearTransaction', {
      id: transaction_id,
      data,
    }).catch((error) => {
      this.$notify({
        group: 'top',
        title: 'Error',
        text: error,
        type: 'error',
      }, 5000);
    });
    /* eslint-enable @typescript-eslint/camelcase */
  }

  /** Show the Transaction Editor */
  editTransaction(txn: TransactionSchema) {
    if (!txn || !txn.transaction_id) return;
    transactionService.getTransaction(txn.transaction_id)
      .then((transaction) => {
        this.$modalEventBus.$emit('open', {
          component: EditTransactionDialog,
          options: { lockFocus: true },
          props: { transaction },
        });
      });
  }

  /** Get Inflow Amount */
  inflowAmount(transaction: TransactionSchema, amount?: Money): Money {
    if (!transaction || !transaction.line_account_id) return new Money(0, this.userCurrency);
    const account = this.findAccount(transaction.line_account_id);
    const sign = account && account.type === 'L' ? -1 : 1;
    return new Money(amount || transaction.amount || 0).multiply(sign);
  }

  /** Check if a Split Row is Expanded */
  isExpanded(key: string): boolean {
    return this.expandedRows.some((rowKey) => rowKey === key);
  }

  /** Get Outflow Amount */
  outflowAmount(transaction: TransactionSchema, amount?: Money): Money {
    if (!transaction || !transaction.line_account_id) return new Money(0, this.userCurrency);
    const account = this.findAccount(transaction.line_account_id);
    const sign = account && account.type === 'L' ? 1 : -1;
    return new Money(amount || transaction.amount || 0).multiply(sign);
  }

  /** Look Up Payee Name */
  payeeName(payeeId: number): string {
    const payee = this.findPayee(payeeId);
    if (!payee || !payee.name) return `<Payee ${payeeId}>`;
    return payee.name;
  }

  /** Set Current Account */
  setCurrentAccount(value: string | number) {
    const { dispatch } = this.$store;
    if (value === 'all') {
      dispatch('account/setCurrentAccount', null);
    } else {
      const id = typeof value === 'string' ? Number.parseInt(value, 10) : value;
      dispatch('account/setCurrentAccount', id);
    }
  }

  /** Expand or Collapse a Split Row */
  toggleSplitRow(key: string) {
    const idx = this.expandedRows.indexOf(key);
    if (idx < 0) {
      this.expandedRows.push(key);
    } else {
      this.expandedRows.splice(idx, 1);
    }
  }
}
</script>

<style>
#accountSelect {
  @apply .font-medium;
}
</style>
