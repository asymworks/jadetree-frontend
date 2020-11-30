<template>
  <jt-dialog title="Change Rollover">
    <div class="flex flex-col items-stretch p-4">
      <p>
        How would you like to handle overspending for
        <span class="font-bold" v-html="categoryName.replace(/ : /mg, '&nbsp;:&nbsp;')" />?
      </p>
      <div class="flex flex-col items-stretch mt-2">
        <formulate-input
          :class="['w-full']"
          :options="{
              on: 'Subtract from next month\'s category balance',
              off: 'Subtract from next month\'s Available to Budget',
            }"
          name="rolloverType"
          type="radio"
          validation="required"
          validation-name="Rollover Type"
          v-model="rolloverType"
        />
      </div>
      <div class="mt-2 flex items-center justify-end">
        <jt-button
          :class="['flex items-center justify-center w-full sm:w-auto']"
          :loading="budgetLoading"
          color="blue"
          type="button"
          @click="updateRollover"
        >Update Rollover</jt-button>
      </div>
    </div>
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { format } from 'date-fns';
import { Money } from '@jadetree/currency';
import { budgetService } from '@/api';
import {
  ApiError,
  BudgetSchema,
  CategorySchema,
  EntrySchema,
} from '@/api/types';
import BaseDialog from './BaseDialog';

@Component({
  computed: {
    ...mapGetters('budget', ['budgetLoading', 'findCategory']),
    ...mapState('budget', ['currentBudget', 'displayMonth']),
  },
})
export default class EditBudgetDialog extends BaseDialog {
  /* eslint-disable lines-between-class-members */
  private currentBudget!: BudgetSchema;
  private displayMonth!: Date;
  private findCategory!: (id: number) => CategorySchema[];
  /* eslint-enable lines-between-class-members */

  /** Category Id */
  @Prop({ required: true })
  private categoryId!: number;

  /** Entry Id */
  @Prop({ required: true })
  private entryId!: number | null;

  /** Rollover Type Setting */
  private rolloverType: 'on' | 'off' = 'off';

  /** Category Name */
  get categoryName(): string {
    const categories = this.findCategory(this.categoryId);

    if (!categories || categories.length === 0) return '';
    if (categories.length === 1) {
      return budgetService.translateName(categories[0].name || '');
    }

    return categories.map(
      (c) => budgetService.translateName(c.name || ''),
    ).reverse().join(' : ');
  }

  /** Load Budget Form Data */
  mounted() {
    if (!this.findCategory(this.categoryId).length) {
      this.close();
      this.$notify({
        group: 'top',
        title: 'Budget Error',
        text: `Could not find category with id ${this.categoryId}`,
        type: 'warning',
      }, 5000);
    }

    if (this.entryId) {
      const { dispatch } = this.$store;
      dispatch('budget/loadBudgetEntry', this.entryId)
        .then((entry: EntrySchema) => {
          if (entry.rollover) {
            this.rolloverType = 'on';
          }
        });
    }
  }

  /** Update Category Rollover */
  updateRollover() {
    const { entryId } = this;
    const entryData: EntrySchema = {
      rollover: this.rolloverType === 'on',
    };

    // The BudgetEntry requires a budget amount, so set the amount to zero
    // if this is a new entry
    if (!entryId) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      entryData.category_id = this.categoryId;
      entryData.month = format(this.displayMonth, 'yyyy-MM-dd');
      entryData.amount = new Money(0, this.currentBudget.currency);
    }

    const { dispatch } = this.$store;
    dispatch('budget/updateEntry', { entryId, entryData })
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
