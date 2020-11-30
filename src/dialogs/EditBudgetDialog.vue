<template>
  <jt-dialog title="Edit Budget">
    <div class="flex flex-col items-stretch p-4">
      <formulate-form class="block w-full" v-model="budgetData" @submit="onSubmit">
        <div class="flex flex-col mb-4">
          <formulate-input
            :class="['w-full']"
            label="Budget Name"
            labelPosition="float"
            name="name"
            type="text"
            validation="required"
            validation-name="Budget Name"
          />
          <formulate-input
            :class="['w-full']"
            label="Budget Notes"
            labelPosition="float"
            name="notes"
            type="textarea"
          />
        </div>
        <div class="mt-2 flex items-center justify-end">
          <jt-button
            :class="['flex items-center justify-center w-full sm:w-auto']"
            :loading="budgetLoading"
            color="blue"
            type="submit"
          >Update Budget</jt-button>
        </div>
      </formulate-form>
    </div>
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ApiError, BudgetSchema, BudgetUpdateSchema } from '@/api/types';
import BaseDialog from './BaseDialog';

@Component({
  computed: {
    ...mapGetters('budget', ['budgetLoading', 'findBudget']),
  },
})
export default class EditBudgetDialog extends BaseDialog {
  /** eslint-disable lines-between-class-members */
  private findBudget!: (id: number) => BudgetSchema | undefined;
  /** eslint-enable lines-between-class-members */

  /** Budget Id to Edit */
  @Prop({ required: true })
  private budgetId!: number;

  /** Account Form Data */
  private budgetData: BudgetUpdateSchema = {
    name: '',
    notes: '',
  };

  /** Load Budget Form Data */
  mounted() {
    const budget = this.findBudget(this.budgetId);
    if (!budget) {
      this.close();
      this.$notify({
        group: 'top',
        title: 'Budget Error',
        text: `Could not find budget with id ${this.budgetId}`,
        type: 'warning',
      }, 5000);
    } else {
      const { name, notes } = budget;
      this.budgetData = { name, notes };
    }
  }

  /** Submit the Account Form */
  onSubmit(data: BudgetUpdateSchema) {
    const { budgetId } = this;
    const { dispatch } = this.$store;
    dispatch('budget/updateBudget', { budgetId, budgetData: data })
      .then(() => {
        this.close();
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
