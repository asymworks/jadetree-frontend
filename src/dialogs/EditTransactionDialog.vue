<!-- eslint-disable max-len -->
<template>
  <jt-dialog title="Edit Transaction">
    <template v-slot:header>
      <div class="jtc-dialog-header">
        <div class="flex items-center justify-start text-lg ml-2">
          <div
            v-for="tab in ['edit', 'clear']"
            v-text="tab === 'edit'
                ? 'Edit Transaction'
                : 'Clear Transaction'
              "
            class="px-2 -mb-3 pb-2 pt-1 font-medium"
            :key="tab"
            :class="{
                'bg-white rounded-t-lg': activeTab === tab,
                'cursor-pointer text-gray-700': activeTab !== tab,
              }"
            @click="activeTab = tab"
          />
        </div>
        <button
          class="jtc-dialog-close-btn"
          type="button"
          @click="close"
        >
          <svg
            class="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </template>
    <template v-slot:default>
      <transaction-editor
        v-if="activeTab === 'edit'"
        :deleteButton="true"
        :transaction="transaction"
        @cancel="close"
        @delete="deleteTransaction"
        @submit="updateTransaction"
      />
      <div v-if="activeTab === 'clear'" class="flex flex-col items-stretch p-4">
        <p>
          Select whether the transaction has been cleared by your bank. For
          transactions which transfer money between two bank accounts, you can
          select the status for each account separately.
        </p>
        <p class="mt-2">
          Note that transactions which have been reconciled against a bank
          statement cannot be uncleared.
        </p>
        <formulate-input
          :class="['w-full mt-4 mb-2 ml-4']"
          :options="clearLineOptions"
          name="clearAccounts"
          type="checkbox"
          v-model="clearedLines"
        />
        <div class="w-full flex items-center justify-between mt-2">
          <jt-button
            :class="['flex items-center justify-center w-full sm:w-auto']"
            color="gray"
            type="button"
            @click.stop="close"
          >Cancel</jt-button>
          <jt-button
            :class="['flex items-center justify-center w-full sm:w-auto']"
            :loading="ledgerLoading"
            color="blue"
            @click="updateClearance"
          >Update</jt-button>
        </div>
      </div>
    </template>
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format, isDate } from 'date-fns';
import { TransactionSchema, TransactionSplitSchema } from '@/api/types';
import { diff } from '@/util/diff';
import BaseTransactionDialog from './BaseTransactionDialog';
import TransactionEditor, { TransactionData } from '../components/TransactionEditor.vue';

import ConfirmDeleteTransactionDialog from './ConfirmDeleteTransactionDialog.vue';

function restrictKeys(value: { [key: string]: unknown }, keys: string[]): object {
  const ret = value;
  Object.keys(value).forEach((key) => {
    if (!keys.includes(key)) delete ret[key];
  });

  return ret;
}

@Component({
  components: { TransactionEditor },
  computed: {
    ...mapGetters('ledger', ['ledgerLoading']),
  },
})
export default class EditTransactionDialog extends BaseTransactionDialog {
  /** Transaction to Edit */
  @Prop({ required: true })
  private transaction!: TransactionSchema;

  /** Active Dialog Tab */
  private activeTab: 'edit' | 'clear' = 'edit';

  /** Cleared Transaction Lines */
  private clearedLines: string[] = [];

  /** Clearance Options */
  get clearLineOptions() {
    if (!this.transaction.lines) return [];
    return this.transaction.lines
      .filter((line) => line.role === 'personal')
      .map((line) => {
        // eslint-disable-next-line object-curly-newline
        const { id, account_id: accountId, reconciled } = line;
        const account = typeof accountId !== 'undefined'
          ? this.findAccount(accountId)
          : null;

        if (account) {
          return {
            value: `${id}`,
            label: reconciled
              ? `${account.name} (already reconciled)`
              : account.name,
            disabled: reconciled,
          };
        }

        return {
          value: `${id}`,
          label: `Unknown Account ${id}`,
          disabled: true,
        };
      });
  }

  /** Load the Clearance Status */
  mounted() {
    if (this.transaction.lines) {
      this.clearedLines = this.transaction.lines
        .filter((l) => !!l.cleared)
        .map((l) => `${l.id}`);
    }
  }

  /** Delete the Transaction Data */
  deleteTransaction() {
    const { id } = this.transaction;
    this.$modalEventBus.$emit('open', {
      component: ConfirmDeleteTransactionDialog,
      options: { lockFocus: true },
      props: { transactionId: id },
    });
  }

  /** Find Differences between Transactions */
  diffTransaction(data: TransactionSchema, ref: TransactionSchema): TransactionSchema {
    const updateKeys = [
      'date',
      'payee_id',
      'check',
      'memo',
      'amount',
      'currency',
      'splits',
    ];

    const splitKeys = [
      'category_id',
      'transfer_id',
      'amount',
      'currency',
      'type',
    ];

    const cleanValue: TransactionSchema = restrictKeys(data, updateKeys) as TransactionSchema;
    const cleanRef: TransactionSchema = restrictKeys(ref, updateKeys) as TransactionSchema;

    if (cleanRef.date && isDate(cleanRef.date)) {
      cleanRef.date = format((cleanRef.date as Date), 'yyyy-MM-dd');
    }

    if (cleanValue.splits && Array.isArray(cleanValue.splits)) {
      cleanValue.splits = cleanValue.splits
        .map((split) => restrictKeys(split, splitKeys) as TransactionSplitSchema);
    }

    if (cleanRef.splits && Array.isArray(cleanRef.splits)) {
      cleanRef.splits = cleanRef.splits
        .map((split) => restrictKeys(split, splitKeys) as TransactionSplitSchema);
    }

    return diff(cleanValue, cleanRef);
  }

  /** Update the Transaction Clearance */
  async updateClearance() {
    const { dispatch } = this.$store;
    const { id } = this.transaction;
    if (!this.transaction.lines) {
      this.close();
      return;
    }

    await this.transaction.lines
      .filter((line) => line.role === 'personal')
      .forEach(async (line) => {
        /* eslint-disable @typescript-eslint/camelcase */
        const { id: line_id, cleared: wasCleared } = line;
        const cleared = this.clearedLines.includes(`${line_id}`);
        if (cleared !== wasCleared) {
          const data = { line_id, cleared };
          await dispatch('ledger/clearTransaction', { id, data })
            .catch((error) => {
              this.$notify({
                group: 'top',
                title: 'Error',
                text: error,
                type: 'error',
              }, 5000);
            });
        }
        /* eslint-enable @typescript-eslint/camelcase */
      });

    this.close();
  }

  /** Update the Transaction Data */
  updateTransaction(txnSchema: TransactionData) {
    const { dispatch } = this.$store;
    const { id } = this.transaction;

    this.handlePayee(txnSchema)
      .then((txnData) => this.createTransaction(txnData))
      .then((txnData) => this.diffTransaction(txnData, this.transaction))
      .then((data) => {
        if (Object.keys(data).length) {
          return dispatch('ledger/updateTransaction', { id, data });
        }
        return new Promise((resolve) => resolve());
      })
      .then(() => {
        this.close();
      })
      .catch((error) => {
        this.$notify({
          group: 'top',
          title: 'Error Adding Transaction',
          text: error,
          type: 'error',
        }, 5000);
      });
  }
}
</script>
