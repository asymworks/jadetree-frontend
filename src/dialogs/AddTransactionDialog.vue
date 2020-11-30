<template>
  <jt-dialog title="Add Transaction">
    <transaction-editor
      :account="account"
      :submitLoading="transactionsLoading"
      submitText="Add Transaction"
      @cancel="close"
      @submit="submit"
    />
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseTransactionDialog from './BaseTransactionDialog';
import TransactionEditor, { TransactionData } from '../components/TransactionEditor.vue';

@Component({
  components: { TransactionEditor },
  computed: {
    ...mapGetters('transactions', ['transactionsLoading']),
  },
})
export default class AddTransactionDialog extends BaseTransactionDialog {
  /** Transaction Account */
  @Prop({ default: null })
  private account!: number | null;

  /** Create Transaction */
  submit(data: TransactionData) {
    const { dispatch } = this.$store;

    this.handlePayee(data)
      .then((txnData) => this.createTransaction(txnData))
      .then((txnSchema) => dispatch('transactions/createTransaction', txnSchema))
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
