<template>
  <jt-dialog title="Add New Account">
    <div class="flex flex-col items-stretch p-4">
      <formulate-form class="block w-full" v-model="accountData" @submit="onSubmit">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 mb-4 sm:mb-0">
          <formulate-input
            :class="['w-full']"
            label="Account Name"
            labelPosition="float"
            name="name"
            type="text"
            validation="required"
            validation-name="Account Name"
          />
          <currency-options>
            <template v-slot="options">
              <formulate-input
                :class="['w-full']"
                :disabled="true"
                :options="options"
                :value="userCurrency"
                label="Account Currency"
                labelPosition="float"
                name="currency"
                type="jtSelect"
                validation="required"
                validation-name="Account Currency"
              />
            </template>
          </currency-options>
        </div>
        <div class="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 mb-4 sm:mb-0">
          <formulate-input
            :class="['w-full']"
            label="Balance Amount"
            labelPosition="float"
            name="balanceAmount"
            type="jtMoney"
            validation="required"
            validation-name="Balance Amount"
          />
          <formulate-input
            :class="['w-full']"
            label="Balance Date"
            labelPosition="float"
            name="balanceDate"
            type="jtDate"
            validation="required"
            validation-name="Balance Date"
          />
        </div>
        <div>
          <formulate-input
            :class="['w-full']"
            :options="accountTypeOptions"
            label="Account Type"
            labelPosition="float"
            name="accountType"
            type="jtSelect"
            validation="required"
            validation-name="Account Type"
            @input="onAccountTypeInput"
          />
          <formulate-input
            :class="['w-full']"
            :options="{
                on: 'Budget Account',
                off: 'Off-Budget Account',
              }"
            help="Determine whether the account should affect my budget"
            helpPosition="after"
            name="budgetType"
            type="radio"
            validation="required"
            validation-name="Budget Type"
            @input="onBudgetTypeInput"
          />
        </div>
        <div class="mt-2 flex items-center justify-end">
          <jt-button
            :class="['flex items-center justify-center w-full sm:w-auto']"
            :loading="accountLoading"
            color="blue"
            type="submit"
          >Add Account</jt-button>
        </div>
      </formulate-form>
    </div>
  </jt-dialog>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { AccountSubtypeOptions } from '@/api';
import { ApiError, AccountCreateSchema, BudgetSchema } from '@/api/types';
import BaseDialog from './BaseDialog';
import CurrencyOptions from '../components/inputs/CurrencyOptions';

/** Account Form Data */
interface AccountFormData {
  name?: string;
  currency?: string;
  balanceAmount?: string;
  balanceDate?: string;
  accountType?: string;
  budgetType?: string;
}

@Component({
  components: { CurrencyOptions },
  computed: {
    ...mapGetters(['userCurrency']),
    ...mapGetters('account', ['accountLoading']),
    ...mapState('budget', ['currentBudget']),
  },
})
export default class AddAccountDialog extends BaseDialog {
  private currentBudget!: BudgetSchema;

  /** Account Type Options */
  get accountTypeOptions() {
    return AccountSubtypeOptions;
  }

  /** Account Form Data */
  private accountData: AccountFormData = {};

  /** Budget Type Updating Flag */
  private budgetTypeUpdating = false;

  /** Budget Type Dirty Flag */
  private budgetTypeDirty = false;

  /** Update Account Type */
  onAccountTypeInput(value: string) {
    this.accountData.accountType = value;
    if (!this.budgetTypeDirty) {
      const option = AccountSubtypeOptions.find((i) => i.value === value);
      if (option) {
        this.budgetTypeUpdating = true;
        this.accountData.budgetType = option.budget
          ? 'on'
          : 'off';
        this.$nextTick(() => { this.budgetTypeUpdating = false; });
      }
    }
  }

  /** Update Budget Type */
  onBudgetTypeInput(value: string) {
    this.accountData.budgetType = value;
    this.budgetTypeDirty = !this.budgetTypeUpdating;
  }

  /** Submit the Account Form */
  onSubmit(data: AccountFormData) {
    const option = AccountSubtypeOptions.find((i) => i.value === data.accountType);
    const budgetId: number | undefined = this.currentBudget
      ? this.currentBudget.id
      : undefined;

    if (data.budgetType === 'on' && !budgetId) {
      this.$notify({
        group: 'top',
        title: 'Error',
        text: 'Cannot add on-budget account because no budget is active.',
        type: 'error',
      });
    }

    /* eslint-disable @typescript-eslint/camelcase */
    const schema: AccountCreateSchema = {
      name: data.name,
      type: option && option.type,
      subtype: option && option.subtype,
      currency: data.currency,
      balance: data.balanceAmount,
      balance_date: data.balanceDate,
      budget_id: data.budgetType === 'on' ? budgetId : undefined,
    };
    /* eslint-enable @typescript-eslint/camelcase */

    const { dispatch } = this.$store;
    dispatch('account/createAccount', schema)
      .then(() => {
        this.close();
        this.$notify({
          group: 'top',
          title: 'Success',
          text: 'Account was created successfully',
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
