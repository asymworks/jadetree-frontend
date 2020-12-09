<!-- eslint-disable max-len -->
<template>
  <div class="relative ledger-entry w-full py-1 border-b">
    <div class="ledger-entry--top flex items-center max-w-full">
      <div class="ledger-entry--date w-20">{{ source.dateFmt }}</div>
      <div v-if="source.entry.splits[0].type === 'transfer'" class="ledger-entry--payee flex-1 min-w-0 flex items-center justify-between truncate">
        <span class="inline-block">Transfer: {{ accountName(source.entry.splits[0].transfer_id) }}</span>
        <span class="inline-block text-gray-700 mr-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
        </span>
      </div>
      <div v-else class="ledger-entry--payee flex-1 min-w-0 truncate">
        {{ source.payeeName }}
      </div>
      <div class="ledger-entry--inflow hidden lg:block w-24 text-right">
        {{ source.isInflow ? source.inflowFmt : '' }}
      </div>
      <div class="ledger-entry--outflow hidden lg:block w-24 text-right">
        {{ source.isOutflow ? source.outflowFmt : '' }}
      </div>
      <div
        class="ledger-entry--amount lg:hidden w-24 text-right"
        :class="{'text-red-600':!source.isInflow}"
      >
        {{ source.amountFmt }}
      </div>
      <div class="ledger-entry--actions hidden md:flex items-center justify-end w-12 lg:w-16">
        <button v-if="!source.entry.reconciled"
          class="appearance-none focus:outline-none active:outline-none"
          :class="{
            'text-gray-400 hover:text-black': !source.entry.cleared && !source.entry.reconciled,
            'text-green-500': source.entry.cleared || source.entry.reconciled,
          }"
          type="button"
          v-tooltip="!source.entry.cleared ? 'Mark as Cleared' : 'Mark as Uncleared'"
          @click="dispatch('LedgerPage', 'clear-line', source.uid)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>
        <div v-else class="text-green-700" v-tooltip="`Reconciled on ${ formatShortDate(source.entry.reconciled_at) }`">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
          </svg>
        </div>

        <button
          class="appearance-none focus:outline-none active:outline-none text-gray-600 hover:text-black ml-1"
          type="button"
          v-tooltip="'Edit Transaction'"
          @click="dispatch('LedgerPage', 'edit-line', source.uid)"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
    <div v-if="source.entry.splits.length === 1" class="ledger-entry--categories flex items-start">
      <div class="w-20"></div>
      <div class="ledger-entry--category flex-1 min-w-0 truncate">
        {{
          source.entry.splits[0].type !== 'transfer'
            ? categoryName(source.entry.splits[0].category_id, source.entry.date)
            : ''
        }}
      </div>
    </div>
    <template v-else>
      <div class="ledger-entry--categories flex min-w-0 items-start">
        <div class="w-20"></div>
        <div class="ledger-entry--category flex-1 min-w-0 truncate cursor-pointer" @click="dispatch('LedgerPage', 'toggle-expand', source.uid)">
          <svg v-if="!source.expanded" class="inline-block -ml-1 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
          </svg>
          <svg v-else class="inline-block -ml-1 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
          Split (Multiple Categories)
        </div>
      </div>
      <template v-if="source.expanded">
        <div
          v-for="(split, idx) in source.entry.splits"
          class="ledger-entry--categories flex min-w-0 items-start"
          :key="`${source.uid}-${idx}`"
        >
          <div class="w-20"></div>
          <div class="ledger-entry--category flex-1 min-w-0 truncate pl-4">
            {{
              split.type !== 'transfer'
                ? categoryName(split.category_id, source.entry.date)
                : payeeName(split.transfer_id)
            }}
          </div>
          <div class="ledger-entry--inflow hidden lg:block w-24 text-right">
            {{ inflowAmount(source.entry, split.amount).gt(0) ? formatCurrency(inflowAmount(source.entry, split.amount)) : '' }}
          </div>
          <div class="ledger-entry--outflow hidden lg:block w-24 text-right">
            {{ outflowAmount(source.entry, split.amount).gt(0) ? formatCurrency(outflowAmount(source.entry, split.amount)) : '' }}
          </div>
          <div
            class="ledger-entry--amount lg:hidden w-20 text-right"
            :class="{'text-red-600':inflowAmount(source.entry, split.amount).lt(0)}"
          >
            {{ formatCurrency(inflowAmount(source.entry, split.amount)) }}
          </div>
          <div class="hidden md:block w-12 lg:w-16"></div>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { addMonths } from 'date-fns';
import { Money } from '@jadetree/currency';
import { budgetService } from '@/api';
import {
  AccountSchema,
  CategorySchema,
  LedgerEntrySchema,
  PayeeSchema,
} from '@/api/types';

type SourceSchema = {
  uid: string;
  expanded: boolean;
  entry: LedgerEntrySchema;
}

@Component({
  computed: {
    ...mapGetters(['userCurrency']),
    ...mapGetters('account', ['findAccount']),
    ...mapGetters('budget', ['findCategory']),
    ...mapGetters('l10n', ['formatCurrency', 'formatMonth', 'formatShortDate']),
    ...mapGetters('payee', ['findPayee']),
  },
})
export default class LedgerPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private findAccount!: (id: number) => AccountSchema | undefined;
  private findCategory!: (id: number) => CategorySchema[];
  private findPayee!: (id: number) => PayeeSchema | undefined;
  private formatCurrency!: (money: Money) => string;
  private formatMonth!: (date: Date) => string;
  private userCurrency!: string | undefined;
  /* eslint-enable lines-between-class-members */

  /** Transaction Line to Display */
  @Prop({ required: true })
  private source!: SourceSchema;

  /** Get the name of an Account */
  accountName(accountId: number): string {
    const account = this.findAccount(accountId);

    if (!account || !account.name) return '';
    return account.name;
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

  /** Dispatch an Event to the Vue Virtual Scroll List Parent */
  dispatch(componentName: string, eventName: string, ...rest: unknown[]) {
    let parent = this.$parent || this.$root;
    let { name } = parent.$options;

    while (parent && (!name || name !== componentName)) {
      parent = parent.$parent;
      if (parent) {
        name = parent.$options.name;
      }
    }

    if (parent) {
      parent.$emit(eventName, ...rest);
    }
  }

  /** Get Inflow Amount */
  inflowAmount(transaction: LedgerEntrySchema, amount?: Money): Money {
    if (!transaction || !transaction.line_account_id) return new Money(0, this.userCurrency);
    const account = this.findAccount(transaction.line_account_id);
    const sign = account && account.type === 'L' ? -1 : 1;
    return new Money(amount || transaction.amount || 0).multiply(sign);
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
}
</script>
