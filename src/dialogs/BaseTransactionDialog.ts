import { Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import {
  AccountSchema,
  PayeeSchema,
  TransactionSchema,
  TransactionSplitSchema,
  TransactionType,
} from '@/api/types';
import BaseDialog from './BaseDialog';
import { TransactionData } from '../components/TransactionEditor.vue';

@Component({
  computed: {
    ...mapGetters('account', ['findAccount']),
    ...mapGetters('transactions', ['findPayee']),
  },
})
export default class BaseTransactionDialog extends BaseDialog {
  /* eslint-disable lines-between-class-members */
  private findAccount!: (id: number) => AccountSchema;
  private findPayee!: (id: number) => PayeeSchema;
  /* eslint-enable lines-between-class-members */

  /** Create a new Payee */
  createPayee(payee: PayeeSchema): Promise<PayeeSchema> {
    const { dispatch } = this.$store;
    return dispatch('transactions/createPayee', payee);
  }

  /** Create Transaction Schema from Editor Data */
  createTransaction(data: TransactionData): TransactionSchema {
    /* eslint-disable @typescript-eslint/camelcase */

    // Transaction Data
    const {
      date,
      check,
      memo,
      amount,
    } = data;

    const account_id = Number.parseInt(data.account, 10);
    const payee_id = Number.parseInt(data.payeeId, 10);

    // Inflow Sign
    const account = this.findAccount(account_id);
    const inflowSign = (account && (account.type === 'L' || account.type === 'E'))
      ? -1
      : 1;

    // Split Data
    let splits: TransactionSplitSchema[];
    if (!data.splits.length) {
      let type: TransactionType = amount.lt(0)
        ? 'outflow'
        : 'inflow';

      let category_id = null;
      let transfer_id = null;
      if (data.categoryId !== '') {
        category_id = Number.parseInt(data.categoryId, 10);
      } else if (data.payeeId !== '') {
        const payee = this.findPayee(Number.parseInt(data.payeeId, 10));
        if (payee && payee.account_id) {
          transfer_id = payee.account_id;
          type = 'transfer';
        }
      }

      splits = [{
        category_id,
        transfer_id,
        amount: amount.multiply(inflowSign),
        currency: amount.currency.currencyCode,
        type,
      }];
    } else {
      splits = data.splits.map((s) => {
        const {
          categoryId: category_id,
          payeeId,
          inflow,
          outflow,
        } = s;

        const splitAmount = inflow.subtract(outflow);
        let type: TransactionType = splitAmount.lt(0)
          ? 'outflow'
          : 'inflow';

        let transfer_id: number | null = null;
        if (payeeId) {
          const payee = this.findPayee(payeeId);
          if (payee && payee.account_id) {
            transfer_id = payee.account_id;
            type = 'transfer';
          }
        }

        return {
          category_id,
          transfer_id,
          amount: splitAmount.multiply(inflowSign),
          currency: inflow.currency.currencyCode,
          type,
        };
      });
    }

    return {
      account_id,
      date,
      payee_id,
      check,
      memo,
      amount: amount.multiply(inflowSign),
      currency: amount.currency.currencyCode,
      splits,
    };
    /* eslint-enable @typescript-eslint/camelcase */
  }

  /** Handle new Payee Creation or return existing Payee Id */
  handlePayee(data: TransactionData): Promise<TransactionData> {
    const {
      payeeCreate,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      payeeId,
      payeeName,
      ...rest
    } = data;

    // Handle Creating Payee
    if (payeeCreate) {
      return this.createPayee({ name: payeeName }).then((newPayee) => ({
        payeeId: `${newPayee.id}`,
        payeeName: '',
        payeeCreate: false,
        ...rest,
      }));
    }

    // Return No-Op
    return new Promise((resolve) => resolve(data));
  }
}
