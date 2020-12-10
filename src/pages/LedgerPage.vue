<!-- eslint-disable max-len -->
<template>
  <jt-sidebar-layout>
    <template v-slot:default>
      <div class="flex flex-col items-stretch justify-start h-full">
        <div class="hidden md:block sticky top-0 w-full h-2 bg-gray-100 z-10"><!-- mask space above totals header --></div>
        <div class="sticky top-0 md:top-2 flex z-10 w-full md:rounded-t text-white bg-blue-700">
          <div class="flex items-center w-full text-sm font-medium pt-1 md:pt-2 px-2">
            <div class="w-20">Date</div>
            <div class="flex-1 truncate">Payee / Category</div>
            <div class="hidden lg:block w-24 text-right">Inflow</div>
            <div class="hidden lg:block w-24 text-right">Outflow</div>
            <div class="w-20 lg:hidden text-right">Amount</div>
            <div class="hidden md:block w-12 lg:w-16"></div>
          </div>
        </div>
        <div class="relative flex-grow text-sm">
          <virtual-list class="absolute inset-0 overflow-auto px-2"
            :data-key="'uid'"
            :data-sources="ledgerItems"
            :data-component="ledgerComponent"
            :estimate-size="60"
          />
        </div>
      </div>
    </template>
    <template v-slot:sidebar>
      <div class="flex flex-row items-center justify-end w-full">
        <div class="flex items-center font-medium md:text-lg flex-grow">
          <jt-select
            id="accountSelect"
            :class="['w-full']"
            :clearButton="false"
            :options="accountOptions"
            :value="currentAccountValue"
            @input="setCurrentAccount"
          />
          <div v-if="currentAccount && currentAccount.notes" class="ml-2" v-tooltip="currentAccount.notes">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="document-text w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
        </div>
        <button v-if="currentAccount" class="ml-2 md:ml-1 hover:text-blue-500 border-none active:outline-none focus:outline-none" v-tooltip="'Edit Account Information'" @click="openEditAccountDialog">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="pencil w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        </button>
      </div>
      <div class="flex flex-col items-stretch w-full md:my-2 text-sm md:text-normal">
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
        <div class="flex items-center justify-between my-1 w-full">
          <div class="text-gray-800 sm:text-sm font-medium">Working Balance</div>
          <div class="text-right font-medium">{{ formatCurrency(workingBalance) }}</div>
        </div>
      </div>
      <div class="w-full flex flex-row justify-between mt-1">
        <jt-button
          :class="['flex', 'items-center', 'justify-center']"
          color="blue"
          size="small"
          type="button"
          @click="addTransaction"
        >
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path></svg>
          Add Transaction
        </jt-button>
        <jt-button
          v-if="currentAccount"
          :class="['flex', 'items-center', 'justify-center']"
          color="light-blue"
          size="small"
          type="button"
          @click="startReconciliation"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Reconcile
        </jt-button>
      </div>
    </template>
  </jt-sidebar-layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import VirtualList from 'vue-virtual-scroll-list';
import { mapGetters, mapState } from 'vuex';
import { addMonths } from 'date-fns';
import { Money } from '@jadetree/currency';
import { budgetService, transactionService } from '@/api';
import {
  AccountSchema,
  BudgetSchema,
  CategorySchema,
  LedgerEntrySchema,
  PayeeSchema,
} from '@/api/types';
import { compareKeys } from '@/util/sort';

import JtSidebarLayout from '../layouts/JtSidebarLayout.vue';

import LedgerItem from '../components/LedgerItem.vue';

import AddTransactionDialog from '../dialogs/AddTransactionDialog.vue';
import EditTransactionDialog from '../dialogs/EditTransactionDialog.vue';
import ReconcileDialog from '../dialogs/ReconcileDialog.vue';

type AccountListOption = {
  value: string | number;
  label: string;
  group?: AccountListOption[];
}

type LedgerEntryItem = {
  uid: string;
  expanded: boolean;
  entry: LedgerEntrySchema;
  dateFmt: string;
  isInflow: boolean;
  isOutflow: boolean;
  inflowFmt: string;
  outflowFmt: string;
  amountFmt: string;
  payeeName: string;
}

@Component({
  components: {
    JtSidebarLayout,
    LedgerItem,
    VirtualList,
  },
  computed: {
    ...mapState('account', ['accounts']),
    ...mapState('budget', ['currentBudget']),
    ...mapState('ledger', ['ledger', 'currentAccount']),
    ...mapState('payee', ['payees']),
    ...mapGetters(['userCurrency']),
    ...mapGetters('account', ['budgetAccounts', 'findAccount', 'offBudgetAccounts']),
    ...mapGetters('budget', ['findCategory']),
    ...mapGetters('l10n', ['formatCurrency', 'formatMonth', 'formatShortDate']),
    ...mapGetters('payee', ['findPayee']),
  },
  name: 'LedgerPage',
})
export default class LedgerPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private budgetAccounts!: (id: number) => AccountSchema[];
  private budgets!: BudgetSchema[];
  private currentAccount!: AccountSchema | null;
  private currentBudget!: BudgetSchema | undefined;
  private ledger!: LedgerEntrySchema[];
  private findAccount!: (id: number) => AccountSchema | undefined;
  private findCategory!: (id: number) => CategorySchema[];
  private findPayee!: (id: number) => PayeeSchema | undefined;
  private formatCurrency!: (money: Money) => string;
  private formatMonth!: (date: Date) => string;
  private formatShortDate!: (date: Date) => string;
  private offBudgetAccounts!: AccountSchema[];
  private payees!: PayeeSchema[];
  private userCurrency!: string | undefined;
  /* eslint-enable lines-between-class-members */

  /** Cached Ledger Items */
  ledgerItems: LedgerEntryItem[] = [];

  /** Ledger List Item Component */
  ledgerComponent = LedgerItem;

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
    const { currentAccount, userCurrency } = this;
    const ccy = currentAccount ? currentAccount.currency : userCurrency;
    return this.ledger.filter((e) => e.cleared).reduce(
      (acc, cur) => {
        const account = this.findAccount(cur.line_account_id || -1);
        if (!cur.amount || !account) return acc;
        if (account.type !== 'L') {
          return acc.add(cur.amount);
        /* eslint-disable-next-line no-else-return */
        } else {
          return acc.subtract(cur.amount);
        }
      },
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
    const { currentAccount, userCurrency } = this;
    const ccy = currentAccount ? currentAccount.currency : userCurrency;
    return this.ledger.filter((e) => !e.cleared).reduce(
      (acc, cur) => {
        const account = this.findAccount(cur.line_account_id || -1);
        if (!cur.amount || !account) return acc;
        if (account.type !== 'L') {
          return acc.add(cur.amount);
        /* eslint-disable-next-line no-else-return */
        } else {
          return acc.subtract(cur.amount);
        }
      },
      new Money(0, ccy),
    );
  }

  /** Working Balance */
  get workingBalance(): Money {
    const { currentAccount, userCurrency } = this;
    const ccy = currentAccount ? currentAccount.currency : userCurrency;
    return this.ledger.reduce(
      (acc, cur) => {
        const account = this.findAccount(cur.line_account_id || -1);
        if (!cur.amount || !account) return acc;
        if (account.type !== 'L') {
          return acc.add(cur.amount);
        /* eslint-disable-next-line no-else-return */
        } else {
          return acc.subtract(cur.amount);
        }
      },
      new Money(0, ccy),
    );
  }

  /** Update Item List when Category List Changes */
  @Watch('currentBudget', { deep: true })
  onBudgetChanged() {
    this.reloadLedgerItems();
  }

  /** Update Item List when Ledger Changes */
  @Watch('ledger', { deep: true, immediate: true })
  onLedgerChanged() {
    this.reloadLedgerItems();
  }

  /** Update Item List when Payee List Changes */
  @Watch('payees', { deep: true })
  onPayeesChanged() {
    this.reloadLedgerItems();
  }

  /** Setup Event Handlers for the Virtual List */
  created() {
    this.$on('toggle-expand', (uid: string) => {
      const item = this.ledgerItems.find((itm) => itm.uid === uid);
      if (item) {
        item.expanded = !item.expanded;
      }
    });

    this.$on('clear-line', (uid: string) => {
      const item = this.ledgerItems.find((itm) => itm.uid === uid);
      if (item) {
        this.clearTransaction(item.entry);
      }
    });

    this.$on('edit-line', (uid: string) => {
      const item = this.ledgerItems.find((itm) => itm.uid === uid);
      if (item) {
        this.editTransaction(item.entry);
      }
    });

    this.$on('click-line', (uid: string) => {
      // Edit Line on Click if the window is small enough to hide the Edit
      // and Clear buttons
      if (!window.matchMedia('(min-width:768px)').matches) {
        const item = this.ledgerItems.find((itm) => itm.uid === uid);
        if (item) {
          this.editTransaction(item.entry);
        }
      }
    });
  }

  /** Set the Active Account from URI Path */
  mounted() {
    const { params } = this.$route;
    if (params && params.accountId) {
      const id = Number.parseInt(params.accountId, 10);
      const { dispatch } = this.$store;
      dispatch('account/setCurrentAccount', id);
    }
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
  clearTransaction(txn: LedgerEntrySchema) {
    const { dispatch } = this.$store;
    /* eslint-disable @typescript-eslint/camelcase */
    const { transaction_id, line_id, cleared } = txn;
    const data = { line_id, cleared: !cleared };
    dispatch('ledger/clearTransaction', {
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
  editTransaction(txn: LedgerEntrySchema) {
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
  inflowAmount(transaction: LedgerEntrySchema, amount?: Money): Money {
    if (!transaction || !transaction.line_account_id) return new Money(0, this.userCurrency);
    const account = this.findAccount(transaction.line_account_id);
    const sign = account && account.type === 'L' ? -1 : 1;
    return new Money(amount || transaction.amount || 0).multiply(sign);
  }

  /** Open the Edit Account Dialog */
  openEditAccountDialog(): void {
    this.$notify({
      group: 'top',
      title: 'Not Implemented',
      text: 'Account Editing is not yet implemented',
      type: 'warning',
    }, 5000);
  }

  /** Get Outflow Amount */
  outflowAmount(transaction: LedgerEntrySchema, amount?: Money): Money {
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

  /** Reload Ledger Item List */
  reloadLedgerItems() {
    this.ledgerItems = this.ledger.map((entry) => ({
      uid: `${entry.transaction_id}-${entry.line_id}`,
      expanded: false,
      entry,
      /* Pre-Calculate Formatted Fields to speed up List Rendering */
      dateFmt: entry.date instanceof Date
        ? this.formatShortDate(entry.date)
        : '',
      isInflow: entry.amount instanceof Money
        ? this.inflowAmount(entry, entry.amount).gt(0)
        : false,
      isOutflow: entry.amount instanceof Money
        ? this.outflowAmount(entry, entry.amount).gt(0)
        : false,
      inflowFmt: entry.amount instanceof Money
        ? this.formatCurrency(this.inflowAmount(entry, entry.amount))
        : '',
      outflowFmt: entry.amount instanceof Money
        ? this.formatCurrency(this.outflowAmount(entry, entry.amount))
        : '',
      amountFmt: entry.amount instanceof Money
        ? this.formatCurrency(entry.amount)
        : '',
      payeeName: typeof entry.payee_id === 'number'
        ? this.payeeName(entry.payee_id)
        : '',
    }));
  }

  /** Set Current Account */
  setCurrentAccount(value: string | number) {
    const { dispatch } = this.$store;
    if (value === 'all') {
      dispatch('ledger/changeAccount', null);
    } else {
      const id = typeof value === 'string' ? Number.parseInt(value, 10) : value;
      dispatch('ledger/changeAccount', id);
    }
  }

  /** Start Reconciliation Process */
  startReconciliation() {
    const account = (this.currentAccount && this.currentAccount.id)
      ? this.currentAccount.id
      : null;

    if (account === null) {
      this.$notify({
        group: 'top',
        title: 'Account Required',
        text: 'Select an account before reconciling.',
        type: 'error',
      }, 5000);
    } else {
      this.$modalEventBus.$emit('open', {
        component: ReconcileDialog,
        options: { lockFocus: true },
        props: { account },
      });
    }
  }
}
</script>

<style>
#accountSelect {
  @apply .font-medium;
}
</style>
