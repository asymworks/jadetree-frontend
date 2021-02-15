<!-- eslint-disable max-len -->
<template>
  <formulate-form
    class="flex flex-col items-stretch p-4"
    error-behavior="submit"
    @submit="submit"
  >
    <div v-if="account === null" class="mb-4">
      <formulate-input
        :class="['w-full']"
        :itemComponent="accountItemComponent"
        :options="accountOptions"
        label="Account"
        labelPosition="float"
        name="account"
        type="jtSelect"
        validation="required"
        validation-name="Transaction Account"
        v-model="accountId"
        @after-select="afterSelectAccount"
      />
    </div>
    <div class="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 mb-4 sm:mb-0">
      <formulate-input
        :class="['w-full', 'sm:w-2/5']"
        label="Date"
        labelPosition="float"
        name="date"
        type="jtDate"
        validation="required"
        validation-name="Transaction Date"
        v-model="date"
      />
      <formulate-input
        :canCreate="true"
        :class="['w-full', 'sm:w-3/5']"
        :getDisplayText="payeeDisplayText"
        :options="payeeOptions"
        label="Payee"
        labelPosition="float"
        name="payee"
        type="jtSelect"
        validation="required"
        validation-name="Payee"
        v-model="payeeId"
        @after-select="afterSelectPayee"
        @before-deselect="beforeDeselectPayee"
        @before-select="beforeSelectPayee"
      />
    </div>
    <div class="mb-4">
      <formulate-input
        :class="['w-full']"
        :disabled="isTransfer"
        :getDisplayText="categoryDisplayText"
        :itemComponent="categoryItemComponent"
        :options="categoryOptions"
        :validation-rules="{
            ifNotTransfer: ({ value }) => isTransfer || (value && value !== ''),
          }"
        :validation-messages="{
            ifNotTransfer: 'Category is required',
          }"
        label="Category"
        labelPosition="float"
        name="category"
        type="jtSelect"
        validation="ifNotTransfer"
        v-model="categoryId"
        @input="setCategoryId"
      />
    </div>
    <div class="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 mb-4 sm:mb-0">
      <formulate-input
        :class="['w-full', 'sm:w-3/5']"
        label="Memo"
        labelPosition="float"
        name="memo"
        type="text"
        v-model="memo"
      />
      <formulate-input
        :class="['w-full', 'sm:w-2/5']"
        label="Check"
        labelPosition="float"
        name="check"
        type="text"
        v-model="check"
      />
    </div>
    <div class="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 mb-4 sm:mb-0">
      <currency-options>
        <template v-slot="currencyChoices">
          <formulate-input
            :class="['w-full', 'md:w-1/2']"
            :clearButton="false"
            :disabled="true"
            :options="currencyChoices"
            :value="accountCurrency"
            label="Transaction Currency"
            labelPosition="float"
            name="currency"
            type="jtSelect"
            validation="required"
            validation-name="Transaction Currency"
          />
        </template>
      </currency-options>
      <formulate-input
        :class="['w-full', 'md:w-1/4']"
        :currency="accountCurrency"
        :validation-rules="{
            hasAmount: ({ value }) => (inflow && inflow !== '') || (outflow && outflow !== ''),
          }"
        :validation-messages="{
            hasAmount: 'Transaction Amount is required',
          }"
        error-behavior="submit"
        label="Inflow"
        labelPosition="float"
        name="inflow"
        type="jtMoney"
        validation="hasAmount"
        v-model="inflow"
        @input="setInflow"
      />
      <formulate-input
        :class="['w-full', 'md:w-1/4']"
        :currency="accountCurrency"
        :validation-rules="{
            hasAmount: ({ value }) => (inflow && inflow !== '') || (outflow && outflow !== ''),
          }"
        :validation-messages="{
            hasAmount: 'Transaction Amount is required',
          }"
        error-behavior="submit"
        label="Outflow"
        labelPosition="float"
        name="outflow"
        type="jtMoney"
        validation="hasAmount"
        v-model="outflow"
        @input="setOutflow"
      />
    </div>
    <div v-if="isSplit" class="flex flex-col items-stretch mb-4">
      <div class="grid grid-cols-9 text-sm font-medium">
        <div class="col-span-4">Transaction Splits</div>
        <div class="col-span-2 text-right">Inflow</div>
        <div class="col-span-2 text-right">Outflow</div>
        <div></div>
      </div>
      <div v-for="(split, idx) in splits" :key="idx" class="grid grid-cols-9 text-sm">
        <div class="col-span-4">{{ split.displayText }}</div>
        <div class="col-span-2 text-right">{{ split.inflow.gt(0) ? formatCurrency(split.inflow) : ''}}</div>
        <div class="col-span-2 text-right">{{ split.outflow.gt(0) ? formatCurrency(split.outflow) : ''}}</div>
        <div class="self-start justify-self-end">
          <button
            class="text-gray-700 hover:text-red-500 appearance-none focus:outline-none"
            type="button"
            v-tooltip="'Remove Split'"
            @click.stop="splits.splice(idx, 1)"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="grid grid-cols-9 text-sm font-medium mt-1 pt-1 border-t">
        <div class="col-span-4">Remaining to Assign</div>
        <div class="col-span-2 text-right" :class="{'text-red-500':splitRemainingInflow.ne(0)}">
          {{ this.formatCurrency(splitRemainingInflow) }}
        </div>
        <div class="col-span-2 text-right" :class="{'text-red-500':splitRemainingOutflow.ne(0)}">
          {{ this.formatCurrency(splitRemainingOutflow) }}
        </div>
        <div class="self-center justify-self-end">
          <button
            class="text-gray-700 hover:text-green-500 appearance-none focus:outline-none"
            type="button"
            v-tooltip="'Add Split'"
            @click.stop="showAddSplitPanel"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-if="splitAddPanelOpen">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 mb-4 sm:mb-0">
          <formulate-input
            :class="['w-full', 'md:w-1/2']"
            :getDisplayText="categoryDisplayText"
            :itemComponent="categoryItemComponent"
            :options="splitCategoryOptions"
            label="Split Category"
            labelPosition="float"
            name="splitCategory"
            type="jtSelect"
            v-model="splitCategoryId"
          />
          <formulate-input
            :class="['w-full', 'md:w-1/4']"
            :currency="accountCurrency"
            label="Inflow"
            labelPosition="float"
            name="splitInflow"
            type="jtMoney"
            v-model="splitInflow"
            @input="setSplitInflow"
          />
          <formulate-input
            :class="['w-full', 'md:w-1/4']"
            :currency="accountCurrency"
            label="Outflow"
            labelPosition="float"
            name="splitOutflow"
            type="jtMoney"
            v-model="splitOutflow"
            @input="setSplitOutflow"
          />
        </div>
        <div class="flex flex-row-reverse justify-between">
          <button
            class="px-2 py-1 border-1 rounded font-medium text-sm bg-blue-500 text-white appearance-none focus:outline-none"
            type="button"
            @click.stop="addSplit"
          >
            Add Split
          </button>
          <button
            class="px-2 py-1 border-1 rounded font-medium text-sm bg-gray-700 text-white appearance-none focus:outline-none"
            type="button"
            @click.stop="cancelSplit"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    <div class="w-full flex items-center justify-between mt-2">
      <div class="flex items-center justify-start space-x-4">
        <jt-button
          :class="['flex items-center justify-center w-full sm:w-auto']"
          color="gray"
          type="button"
          @click.stop="$emit('cancel')"
        >Cancel</jt-button>
        <jt-button
          v-if="deleteButton"
          :class="['flex items-center justify-center w-full sm:w-auto']"
          color="red"
          type="button"
          @click.stop="$emit('delete')"
        >Delete Transaction</jt-button>
      </div>
      <jt-button
        :class="['flex items-center justify-center w-full sm:w-auto']"
        :loading="submitLoading || payeesLoading"
        color="blue"
        type="submit"
      >{{ submitText }}</jt-button>
    </div>
  </formulate-form>
</template>

<script lang="ts">
// eslint-disable-next-line object-curly-newline
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { addMonths, format, parseISO } from 'date-fns';
import { SelectOption } from '@jadetree/controls';
import { Money } from '@jadetree/currency';
import { budgetService, payeeService } from '@/api';
import {
  AccountSchema,
  BudgetSchema,
  BudgetDataSchema,
  CategorySchema,
  PayeeSchema,
  PayeeDetailSchema,
  TransactionSchema,
} from '@/api/types';
import { compare } from '@/util/sort';

import CurrencyOptions from './inputs/CurrencyOptions';
import AccountSelectItem from './AccountSelectItem.vue';
import CategorySelectItem from './CategorySelectItem.vue';

/** Account List Option Type */
type AccountListOption = {
  value: string | number;
  label: string;
  balance?: string | Money;
  group?: AccountListOption[];
};

/** Category List Option Type */
type CategoryListOption = {
  value: string | number;
  label: string;
  displayText?: string;
  balance?: string | Money;
  group?: PayeeListOption[];
};

/** Payee List Option Type */
type PayeeListOption = {
  value: string | number;
  label: string;
  displayText?: string;
  group?: PayeeListOption[];
};

/** Split Entry */
export type SplitEntry = {
  categoryId: number | null;
  payeeId: number | null;
  displayText: string;
  inflow: Money;
  outflow: Money;
};

/** Transaction Data */
export type TransactionData = {
  account: string;
  check: string;
  date: string;
  memo: string;
  payeeId: string;
  payeeName: string;
  payeeCreate: boolean;
  categoryId: string;
  amount: Money;
  splits: SplitEntry[];
}

@Component({
  components: { CurrencyOptions },
  computed: {
    ...mapState('budget', ['currentBudget', 'currentMonthData']),
    ...mapState('payee', ['payees']),
    ...mapGetters(['userCurrency']),
    ...mapGetters('account', ['budgetAccounts', 'findAccount', 'offBudgetAccounts']),
    ...mapGetters('budget', ['findCategory']),
    ...mapGetters('l10n', ['formatCurrency', 'formatMonth']),
    ...mapGetters('payee', ['findPayee', 'payeesLoading']),
  },
})
export default class TransactionEditor extends Vue {
  /* eslint-disable lines-between-class-members */
  private budgetAccounts!: (id: number) => AccountSchema[];
  private currentBudget!: BudgetSchema | undefined;
  private currentMonthData!: BudgetDataSchema | undefined;
  private findAccount!: (id: number) => AccountSchema;
  private findCategory!: (id: number) => CategorySchema[];
  private findPayee!: (id: number) => PayeeSchema;
  private formatCurrency!: (money: Money) => string;
  private formatMonth!: (date: Date) => string;
  private offBudgetAccounts!: AccountSchema[];
  private payees!: PayeeSchema[];
  private userCurrency!: string;
  /* eslint-enable lines-between-class-members */

  /** Transaction Account */
  @Prop({ default: null })
  private account!: number | null;

  /** Show Delete Button */
  @Prop({ default: false })
  private deleteButton!: boolean;

  /** Submit Button Loading */
  @Prop({ default: false })
  private submitLoading!: boolean;

  /** Submit Button Text */
  @Prop({ default: 'Update' })
  private submitText!: string;

  /** Transaction to Edit */
  @Prop({ default: null })
  private transaction!: TransactionSchema | null;

  /** Transaction Account */
  private accountId = '';

  /** Transaction Category Dirty */
  private categoryDirty = false;

  /** Transaction Category */
  private categoryId = '';

  /** Check Number */
  private check = '';

  /** Transaction Date */
  private date = '';

  /** Inflow Amount */
  private inflow = '';

  /** Memo */
  private memo = '';

  /** Outflow Amount */
  private outflow = '';

  /** Create Payee */
  private payeeCreate = false;

  /** Cached Payee Details */
  private payeeDetails: PayeeDetailSchema[] = [];

  /** New Payee Name */
  private payeeName = '';

  /** Transaction Payee */
  private payeeId = '';

  /** Transaction Splits */
  private splits: SplitEntry[] = [];

  /** New Split Cateogry Id */
  private splitCategoryId = '';

  /** New Split Inflow */
  private splitInflow = '';

  /** New Split Outflow */
  private splitOutflow = '';

  /** Split Panel Open */
  private splitAddPanelOpen = false;

  /** Account Currency */
  get accountCurrency(): string {
    const account = this.accountId !== ''
      ? this.findAccount(Number.parseInt(this.accountId, 10))
      : null;

    if (!account || !account.currency) return this.userCurrency;
    return account.currency;
  }

  /** Account List Item Component */
  get accountItemComponent(): unknown {
    return AccountSelectItem;
  }

  /** Account Selection Options */
  get accountOptions(): AccountListOption[] {
    const budgetAcctList = this.currentBudget
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? this.budgetAccounts(this.currentBudget.id!)
      : [];

    return [
      ...(budgetAcctList.length > 0
        ? [{
          value: 'on-budget',
          label: 'Budget Accounts',
          group: budgetAcctList.sort((a, b) => compare(a.name, b.name)).map((a) => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            balance: a.balance!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            value: a.id!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            label: a.name!,
          })),
        }]
        : []
      ),
      ...(this.offBudgetAccounts.length > 0
        ? [{
          value: 'off-budget',
          label: 'Off-Budget Accounts',
          group: this.offBudgetAccounts.sort((a, b) => compare(a.name, b.name)).map((a) => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            balance: a.balance!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            value: a.id!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            label: a.name!,
          })),
        }]
        : []
      ),
    ];
  }

  /** Account Inflow Sign */
  get accountSign(): number {
    const account = this.accountId !== ''
      ? this.findAccount(Number.parseInt(this.accountId, 10))
      : null;

    if (!account || (account.type !== 'L' && account.type !== 'E')) return 1;
    return -1;
  }

  /** Budget Category Option Group */
  get categoryBudgetOptions(): CategoryListOption[] {
    if (!this.currentBudget || !this.currentBudget.categories) return [];
    return this.categoryOptionList(this.currentBudget.categories);
  }

  /** Income Category Option Group */
  get categoryIncomeOptions(): CategoryListOption[] {
    if (!this.currentBudget || !this.currentBudget.categories) return [];
    const incomeGroup = this.currentBudget.categories
      .find((c) => c.name === '_income');
    const txnDate = this.date === ''
      ? new Date()
      : parseISO(this.date);

    if (!incomeGroup) return [];
    return [
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        value: incomeGroup.id!,
        label: 'Income',
        group: (incomeGroup.children || []).map((c) => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          value: c.id!,
          label: c.name === '_cur_month'
            ? `Income for ${this.formatMonth(txnDate)}`
            : `Income for ${this.formatMonth(addMonths(txnDate, 1))}`,
        })),
      },
    ];
  }

  /** Category List Item Component */
  get categoryItemComponent(): unknown {
    return CategorySelectItem;
  }

  /** Category Options */
  get categoryOptions(): CategoryListOption[] {
    return [
      {
        value: '_split',
        label: 'Split (Multiple Categories)',
      },
      ...this.categoryIncomeOptions,
      ...this.categoryBudgetOptions,
    ];
  }

  /** If a Split Transaction is Selected */
  get isSplit(): boolean {
    return this.categoryId === '_split';
  }

  /** If a Transfer is Selected */
  get isTransfer(): boolean {
    const payee = this.findPayee(Number.parseInt(this.payeeId, 10));
    return payee && payee.role === 'transfer';
  }

  /** Payee Options */
  get payeeOptions(): PayeeListOption[] {
    const expensePayees = this.payees
      .filter((p) => !p.hidden && (p.role === 'expense' || p.role === 'initial'))
      .sort((a, b) => compare(a.name, b.name));

    return [
      ...(this.payeeCreate
        ? [{
          value: '_new',
          label: 'New Payee',
          group: [{
            value: this.payeeName,
            label: this.payeeName,
            displayText: this.payeeName,
          }],
        }]
        : []
      ),
      ...expensePayees.map((p: PayeeSchema) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        value: p.id!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        label: p.name!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        displayText: p.name!,
      })),
      ...this.payeeTransferOptions,
    ];
  }

  /** Payee Options (Transfers) */
  get payeeTransferOptions(): PayeeListOption[] {
    const transferPayees = this.payees
      .filter((p) => !p.hidden && p.role === 'transfer')
      .filter((p) => `${p.account_id}` !== this.accountId)
      .sort((a, b) => compare(a.name, b.name));

    return transferPayees.length > 0
      ? [{
        value: '_transfer',
        label: 'Transfer To/From',
        group: transferPayees.map((p: PayeeSchema) => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          value: p.id!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          label: p.name!,
          displayText: `Transfer : ${p.name}`,
        })),
      }]
      : [];
  }

  /** Split Category Options */
  get splitCategoryOptions(): CategoryListOption[] {
    return [
      ...this.categoryIncomeOptions,
      ...this.categoryBudgetOptions,
      ...this.payeeTransferOptions.map((payeeGroup) => ({
        value: payeeGroup.value,
        label: payeeGroup.label,
        group: (payeeGroup.group || []).map((payee) => ({
          value: `transfer:${payee.value}`,
          label: payee.label,
          displayText: payee.displayText,
        })),
      })),
    ];
  }

  /** Remining Uncategorized Split Inflow */
  get splitRemainingInflow(): Money {
    const netSplit = this.splitTotalInflow.subtract(this.splitTotalOutflow);
    if (!this.transactionAmount.lt(0)) {
      return this.transactionAmount.subtract(netSplit);
    }

    return new Money(0, this.accountCurrency);
  }

  /** Remining Uncategorized Split Outflow */
  get splitRemainingOutflow(): Money {
    const netSplit = this.splitTotalInflow.subtract(this.splitTotalOutflow);
    if (this.transactionAmount.lt(0)) {
      return this.transactionAmount.subtract(netSplit).negate();
    }

    return new Money(0, this.accountCurrency);
  }

  /** Total Split Inflow */
  get splitTotalInflow(): Money {
    return this.splits.reduce(
      (acc, cur) => acc.add(cur.inflow),
      new Money(0, this.accountCurrency),
    );
  }

  /** Total Split Outflow */
  get splitTotalOutflow(): Money {
    return this.splits.reduce(
      (acc, cur) => acc.add(cur.outflow),
      new Money(0, this.accountCurrency),
    );
  }

  /** Transaction Amount (inflow: Positive, outflow: Negative) */
  get transactionAmount(): Money {
    if (this.inflow === '') {
      return this.outflow === ''
        ? new Money(0, this.accountCurrency)
        : new Money(this.outflow, this.accountCurrency).negate();
    }

    return new Money(this.inflow, this.accountCurrency);
  }

  /** Update Editor State when Account Changes */
  @Watch('account', { immediate: true })
  accountChanged(value: number | null) {
    this.accountId = `${value || ''}`;
  }

  /** Update Editor State when Transaction Changes */
  @Watch('transaction', { immediate: true })
  transactionChanged(value: TransactionSchema | null) {
    if (value) {
      if (value.account_id) {
        this.accountId = `${value.account_id}`;
      }
      if (typeof value.date === 'string') {
        this.date = value.date;
      }
      if (value.date instanceof Date) {
        this.date = format(value.date, 'yyyy-MM-dd');
      }
      if (value.payee_id) {
        this.payeeId = `${value.payee_id}`;
        this.payeeCreate = false;
        this.payeeName = '';
      }
      if (value.check) {
        this.check = value.check;
      }
      if (value.memo) {
        this.memo = value.memo;
      }
      if (typeof value.amount === 'string') {
        const acctSign = this.accountSign;
        const txnAmount = new Money(value.amount, value.currency || 'XXX');
        if (txnAmount.multiply(acctSign).lt(0)) {
          this.inflow = '';
          this.outflow = txnAmount.multiply(-1 * acctSign).amount.toFixed(4).toString();
        } else {
          this.inflow = txnAmount.multiply(acctSign).amount.toFixed(4).toString();
          this.outflow = '';
        }
      }
      if (value.amount instanceof Money) {
        const acctSign = this.accountSign;
        if (value.amount.multiply(acctSign).lt(0)) {
          this.inflow = '';
          this.outflow = value.amount.multiply(-1 * acctSign).amount.toFixed(4).toString();
        } else {
          this.inflow = value.amount.multiply(acctSign).amount.toFixed(4).toString();
          this.outflow = '';
        }
      }
      if (value.splits && value.splits.length > 1) {
        this.categoryId = '_split';
        this.splits = value.splits.map((s) => {
          /* eslint-disable  @typescript-eslint/camelcase */
          const { category_id, transfer_id, amount } = s;
          const categoryId = category_id || null;
          const payee = this.payees.find((p) => p.account_id === transfer_id);
          /* eslint-enable  @typescript-eslint/camelcase */

          const payeeId = (payee && payee.id) ? payee.id : null;
          let displayText = '';
          if (categoryId) {
            displayText = this.categoryName(categoryId);
          } else {
            displayText = (payee && payee.name) || '<Unknown Payee>';
          }

          let inflow = new Money(0, this.accountCurrency);
          let outflow = new Money(0, this.accountCurrency);
          const acctSign = this.accountSign;
          if ((amount as Money).multiply(acctSign).lt(0)) {
            outflow = (amount as Money).multiply(-1 * acctSign);
          } else {
            inflow = (amount as Money).multiply(acctSign);
          }

          return {
            categoryId,
            payeeId,
            displayText,
            inflow,
            outflow,
          };
        });
      } else {
        this.splits = [];
        if (value.splits && value.splits.length) {
          this.categoryId = `${value.splits[0].category_id}`;
        }
      }
    }
  }

  /** Add a Split */
  addSplit() {
    const inflow = this.splitInflow === ''
      ? new Money(0, this.accountCurrency)
      : new Money(this.splitInflow, this.accountCurrency);
    const outflow = this.splitOutflow === ''
      ? new Money(0, this.accountCurrency)
      : new Money(this.splitOutflow, this.accountCurrency);

    let sCategoryId = this.splitCategoryId;
    let sPayeeId = '';

    if (sCategoryId.includes(':')) {
      // eslint-disable-next-line prefer-destructuring
      sPayeeId = this.splitCategoryId.split(':')[1];
      sCategoryId = '';
    }

    const categoryId = sCategoryId === '' ? null : Number.parseInt(sCategoryId, 10);
    const payeeId = sPayeeId === '' ? null : Number.parseInt(sPayeeId, 10);

    let displayText = '';
    if (categoryId) {
      displayText = this.categoryName(categoryId);
    } else {
      const payee = this.findPayee(payeeId || -1);
      displayText = (payee && payee.name) || '<Unknown Payee>';
    }

    this.splits.push({
      categoryId,
      payeeId,
      displayText,
      inflow,
      outflow,
    });

    this.splitCategoryId = '';
    this.splitInflow = '';
    this.splitOutflow = '';
    this.splitAddPanelOpen = false;
  }

  /** Handle Account Selection */
  afterSelectAccount({ option }: { option: AccountListOption }) {
    const payee = this.findPayee(Number.parseInt(this.payeeId, 10));
    const accountId = option && option.value
      ? Number.parseInt(`${option.value}`, 10)
      : -1;

    if (payee && payee.account_id === accountId) {
      this.payeeId = '';
    }
  }

  /** Handle Payee Selection */
  afterSelectPayee() {
    if (!this.payeeCreate) {
      const payee = this.findPayee(Number.parseInt(this.payeeId, 10));
      if (payee && payee.role === 'transfer') {
        this.categoryId = '';
      } else if (!this.categoryDirty) {
        // Load Last Category for Payee
        if (payee && payee.id) {
          const details = this.payeeDetails.find((p) => p.id === payee.id);
          if (details && details.last_category_id) {
            this.categoryId = `${details.last_category_id}`;
          } else {
            payeeService.getPayeeDetails(payee.id)
              .then((payeeDetails) => {
                if (payeeDetails.last_category_id) {
                  this.categoryId = `${payeeDetails.last_category_id}`;
                }
              })
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              .catch(() => {});
          }
        }
      }
    }
  }

  /** Handle Payee Deselection */
  beforeDeselectPayee({ option }: { option: PayeeListOption }) {
    if (option.value === this.payeeName) {
      this.payeeCreate = false;
      this.payeeName = '';
    }
  }

  /** Handle Payee Creation */
  beforeSelectPayee({ option, willCreate }: { option: string; willCreate: boolean}) {
    this.payeeCreate = willCreate;
    this.payeeName = willCreate ? option : '';
  }

  /** Cancel Adding a Split */
  cancelSplit() {
    this.splitCategoryId = '';
    this.splitInflow = '';
    this.splitOutflow = '';
    this.splitAddPanelOpen = false;
  }

  /** Get Category Balance */
  categoryBalance(categoryId: number): Money {
    const currency = this.currentBudget && this.currentBudget.currency
      ? this.currentBudget.currency
      : this.userCurrency;

    if (!this.currentMonthData || !this.currentMonthData.categories) {
      return new Money(0, currency);
    }

    const { categories } = this.currentMonthData;
    const data = categories.find((c) => c.category_id === categoryId);
    if (!data || !data.balance) return new Money(0, currency);
    if (typeof data.balance === 'string') return new Money(data.balance, currency);
    return data.balance;
  }

  /** Get Category Display Text */
  categoryDisplayText(options: SelectOption[]): string {
    return options.sort()
      .map((o) => (
        (o as CategoryListOption).displayText
          ? (o as CategoryListOption).displayText
          : (o as CategoryListOption).label
      ))
      .join(', ');
  }

  /** Get the Full Category Name */
  categoryName(categoryId: number): string {
    const date = new Date();
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
      (c: CategorySchema) => budgetService.translateName(c.name || ''),
    ).reverse().join(' : ');
  }

  /** Get Category Option List */
  categoryOptionList(categories: CategorySchema[]): CategoryListOption[] {
    return categories
      .filter((c) => !c.hidden)
      .sort((a, b) => compare(a.display_order, b.display_order))
      .map((c) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        value: c.id!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        label: budgetService.translateName(c.name!),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        displayText: this.categoryName(c.id!),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        balance: this.categoryBalance(c.id!),
        group: c.children && c.children.length > 0
          ? this.categoryOptionList(c.children)
          : undefined,
      }));
  }

  /** Get Payee Display Text */
  payeeDisplayText(options: SelectOption[]): string {
    return options.sort().map((o) => (o as PayeeListOption).displayText).join(', ');
  }

  /** Show the Add Split Panel */
  showAddSplitPanel() {
    this.splitAddPanelOpen = true;
  }

  /** Manage the Category Dirty Flag */
  setCategoryId() {
    this.categoryDirty = !!this.categoryId && this.categoryId !== '';
    if (this.categoryId !== '_split') {
      this.splitCategoryId = this.categoryId;
      this.splits = [];
    }
  }

  /** Clear the Outflow Amount */
  setInflow() {
    if (this.inflow !== '') {
      this.outflow = '';
    }
  }

  /** Clear the Inflow Amount */
  setOutflow() {
    if (this.outflow !== '') {
      this.inflow = '';
    }
  }

  /** Clear the Outflow Amount */
  setSplitInflow() {
    if (this.splitInflow !== '') {
      this.splitOutflow = '';
    }
  }

  /** Clear the Inflow Amount */
  setSplitOutflow() {
    if (this.splitOutflow !== '') {
      this.splitInflow = '';
    }
  }

  /** Submit the Transaction Data */
  submit() {
    const {
      accountId: account,
      check,
      date,
      memo,
      payeeId,
      payeeName,
      payeeCreate,
      categoryId,
      transactionAmount: amount,
      splits,
    } = this;

    this.$emit('submit', {
      account,
      check,
      date,
      memo,
      payeeId,
      payeeName,
      payeeCreate,
      categoryId,
      amount,
      splits,
    });
  }
}
</script>
