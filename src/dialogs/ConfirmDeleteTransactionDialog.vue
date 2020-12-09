<!-- eslint-disable max-len -->
<template>
  <jt-dialog title="Confirm Deletion">
    <div class="flex flex-col items-stretch p-2">
      <div>
        Are you sure you want to delete this transaction? This action cannot
        be undone.
      </div>
      <div class="mt-2 flex flex-col-reverse sm:flex-row items-center justify-between">
        <jt-button
          :class="['flex items-center justify-center w-full sm:w-auto']"
          color="gray"
          type="button"
          @click.stop="close"
        >Cancel</jt-button>
        <jt-button
          :class="['flex items-center justify-center w-full sm:w-auto']"
          :loading="ledgerLoading"
          color="red"
          type="button"
          @click.stop="onDelete"
        >Delete</jt-button>
      </div>
    </div>
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseDialog from './BaseDialog';

@Component({
  computed: {
    ...mapGetters('ledger', ['ledgerLoading']),
  },
})
export default class ConfirmDeleteTransactionDialog extends BaseDialog {
  /** Transaction Id */
  @Prop({ required: true })
  private transactionId!: number;

  /** Delete Category Click Handler */
  onDelete() {
    const { transactionId } = this;
    const { dispatch } = this.$store;

    dispatch('ledger/deleteTransaction', transactionId)
      .then(() => {
        this.$notify({
          group: 'top',
          title: 'Deleted Transaction',
          text: 'Successfully deleted transaction',
          type: 'success',
        }, 5000);
        this.close();
      })
      .catch((error) => {
        this.$notify({
          group: 'top',
          title: 'Error',
          text: error,
          type: 'error',
        }, 5000);
      });
  }
}
</script>
