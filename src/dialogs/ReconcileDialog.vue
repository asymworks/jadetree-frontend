<!-- eslint-disable max-len -->
<template>
  <jt-dialog title="Reconcile Account">
    <div class="flex flex-col items-stretch p-4">
      <p>
        Enter the balance and date listed on the bank statement for this
        account and click Start Reconciliation.
      </p>
      <formulate-form class="block w-full" v-model="statementData" @submit="onSubmit">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 mb-4 sm:mb-0">
          <formulate-input
            :class="['w-full']"
            label="Statement Date"
            labelPosition="float"
            name="balanceDate"
            type="jtDate"
            validation="required"
            validation-name="Statement Date"
          />
          <formulate-input
            :class="['w-full']"
            label="Statement Balance"
            labelPosition="float"
            name="balanceAmount"
            type="jtMoney"
            validation="required"
            validation-name="Balance Amount"
          />
        </div>
        <div v-if="statementData.balanceDate" class="mb-4 sm:mb-0">
          The cleared balance on {{ formatLongDate(statementDate) }} is
          {{ formatCurrency(clearedAmount) }}.
        </div>
        <div class="mt-2 flex items-center justify-between">
          <jt-button
            :class="['flex items-center justify-center w-full sm:w-auto']"
            color="gray"
            type="button"
            @click="close"
          >Cancel</jt-button>
          <jt-button
            :class="['flex items-center justify-center w-full sm:w-auto']"
            :loading="accountLoading"
            color="green"
            type="submit"
          >Reconcile Account</jt-button>
        </div>
      </formulate-form>
    </div>
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { differenceInDays, parseISO } from 'date-fns';
import { Money } from '@jadetree/currency';
import {
  ApiError,
  AccountSchema,
  LedgerEntrySchema,
  ReconcileSchema,
} from '@/api/types';
import BaseDialog from './BaseDialog';

/** Statement Form Data */
interface StatementFormData {
  balanceAmount?: string;
  balanceDate?: string;
}

@Component({
  computed: {
    ...mapState('ledger', ['ledger']),
    ...mapGetters(['userCurrency']),
    ...mapGetters('account', ['accountLoading', 'findAccount']),
    ...mapGetters('l10n', ['formatCurrency', 'formatLongDate']),
  },
})
export default class StartReconDialog extends BaseDialog {
  /* eslint-disable lines-between-class-members */
  private findAccount!: (id: number) => AccountSchema;
  private formatLongDate!: (date: Date) => string;
  private ledger!: LedgerEntrySchema[];
  private userCurrency!: string;
  /* eslint-enable lines-between-class-members */

  /** Account to Reconcile */
  @Prop({ required: true })
  private account!: number;

  /** Account Id */
  private accountId = '';

  /** Form Data */
  private statementData: StatementFormData = {};

  /** Account Currency */
  get accountCurrency(): string {
    const account = this.accountId !== ''
      ? this.findAccount(Number.parseInt(this.accountId, 10))
      : null;

    if (!account || !account.currency) return this.userCurrency;
    return account.currency;
  }

  /** Cleared Amount */
  get clearedAmount(): Money {
    const { accountCurrency, statementDate } = this;
    return this.ledger
      .filter((txn) => txn.cleared && (differenceInDays(txn.date as Date, statementDate) <= 0))
      .reduce(
        (acc, cur) => (cur.cleared && cur.amount ? acc.add(cur.amount) : acc),
        new Money(0, accountCurrency),
      );
  }

  /** Statement Date */
  get statementDate(): Date {
    const { balanceDate } = this.statementData;
    if (!balanceDate) return new Date('');
    return parseISO(balanceDate);
  }

  /** Update Editor State when Account Changes */
  @Watch('account', { immediate: true })
  accountChanged(value: number | null) {
    this.accountId = `${value || ''}`;
  }

  /** Submit the Form */
  onSubmit() {
    const { account: accountId } = this;
    const { balanceAmount, balanceDate } = this.statementData;
    /* eslint-disable @typescript-eslint/camelcase */
    const data: ReconcileSchema = {
      statement_date: balanceDate || '',
      statement_balance: balanceAmount || '',
    };
    /* eslint-enable @typescript-eslint/camelcase */

    const { dispatch } = this.$store;
    dispatch('ledger/reconcileAccount', { accountId, data })
      .then((txns) => {
        this.close();
        this.$notify({
          group: 'top',
          title: 'Success',
          text: `Account reconciled successfully (reconciled ${txns.length} transactions)`,
          type: 'success',
        }, 5000);
      })
      .catch((error: ApiError) => {
        this.$notify({
          group: 'top',
          title: 'Error',
          text: error.message,
          type: 'error',
        });
      });
  }
}
</script>
