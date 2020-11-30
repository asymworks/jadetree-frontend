<template>
  <jt-dialog title="Edit Transaction">
    <transaction-editor
      :deleteButton="true"
      :transaction="transaction"
      @cancel="close"
      @delete="deleteTransaction"
      @submit="updateTransaction"
    />
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
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

@Component({ components: { TransactionEditor } })
export default class EditTransactionDialog extends BaseTransactionDialog {
  /** Transaction to Edit */
  @Prop({ required: true })
  private transaction!: TransactionSchema;

  /** Delete the Transaction Data */
  deleteTransaction() {
    const { transaction_id: id } = this.transaction;
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

  /** Update the Transaction Data */
  updateTransaction(txnSchema: TransactionData) {
    const { dispatch } = this.$store;
    const { transaction_id: id } = this.transaction;

    this.handlePayee(txnSchema)
      .then((txnData) => this.createTransaction(txnData))
      .then((txnData) => this.diffTransaction(txnData, this.transaction))
      .then((data) => {
        if (Object.keys(data).length) {
          return dispatch('transactions/updateTransaction', { id, data });
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
