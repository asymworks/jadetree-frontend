<!-- eslint-disable max-len -->
<template>
  <jt-dialog title="Change Rollover">
    <div class="flex flex-col items-stretch p-4">
      <p>
        {{ entryId ? 'Update' : 'Create' }} budget for
        <span class="font-bold" v-html="categoryName.replace(/ : /mg, '&nbsp;:&nbsp;')" />?
      </p>
      <formulate-form
        class="block w-full"
        error-behavior="submit"
        v-model="entryData"
        @submit="onSubmit"
      >
        <div class="flex flex-col items-stretch mt-2">
          <div class="flex flex-row items-center">
            <formulate-input
              :class="['flex-grow w-full']"
              label="Budget Amount"
              labelPosition="float"
              name="amount"
              type="jtMoney"
              validation="required"
              validation-name="Budget Amount"
            />
            <jt-popup
              mobileMode="modal"
              position="left-top"
              :closeOnClick="true"
              :open="popupQuickBudgetOpen"
              @popup-hide="popupQuickBudgetOpen=false"
            >
              <template v-slot:control>
                <button class="ml-2" @click.prevent="popupQuickBudgetOpen=!popupQuickBudgetOpen">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="lightning-bolt w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </button>
              </template>
              <template v-slot:popup>
                <div class="flex flex-col items-stretch bg-white border rounded w-xs">
                  <h2 class="font-medium px-2 py-1 border-b">Quick Budget Options</h2>
                  <button
                    v-if="categoryDefault && categoryDefault.gt(0)"
                    class="flex items-center justify-between text-left p-1 border-b"
                    type="button"
                    @click="setAmount(categoryDefault)"
                  >
                    <span class="inline-block">Category Default</span>
                    <span class="inline-block">{{ formatCurrency(categoryDefault) }}</span>
                  </button>
                  <button
                    v-if="qbLastBudget && qbLastBudget.ne(0)"
                    class="flex items-center justify-between text-left p-1 border-b"
                    type="button"
                    @click="setAmount(qbLastBudget)"
                  >
                    <span class="inline-block">Last Month's Budget</span>
                    <span class="inline-block">{{ formatCurrency(qbLastBudget) }}</span>
                  </button>
                  <button
                    v-if="qbLastOutflow && qbLastOutflow.ne(0)"
                    class="flex items-center justify-between text-left p-1 border-b"
                    type="button"
                    @click="setAmount(qbLastOutflow)"
                  >
                    <span class="inline-block">Last Month's Outflow</span>
                    <span class="inline-block">{{ formatCurrency(qbLastOutflow) }}</span>
                  </button>
                  <button
                    v-if="qbAvailable && qbAvailable.ne(0)"
                    class="flex items-center justify-between text-left p-1 border-b"
                    type="button"
                    @click="setAmount(qbAvailable)"
                  >
                    <span class="inline-block">Remaining Available</span>
                    <span class="inline-block">{{ formatCurrency(qbAvailable) }}</span>
                  </button>
                  <button
                    v-if="qbBudgetZero && qbBudgetZero.ne(0)"
                    class="flex items-center justify-between text-left p-1"
                    type="button"
                    @click="setAmount(qbBudgetZero)"
                  >
                    <span class="inline-block">Budget to Zero</span>
                    <span class="inline-block">{{ formatCurrency(qbBudgetZero) }}</span>
                  </button>
                </div>
              </template>
            </jt-popup>
          </div>
          <formulate-input
            label="Set as Category Default"
            name="default"
            type="checkbox"
          />
        </div>
        <div class="mt-2">
          <formulate-input
            :class="['w-full']"
            label="Notes"
            labelPosition="float"
            name="notes"
            rows="3"
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
import { mapGetters, mapState } from 'vuex';
import {
  addMonths,
  format,
  getMonth,
  getYear,
  setDate,
} from 'date-fns';
import { Money } from '@jadetree/currency';
import { budgetService } from '@/api';
import {
  ApiError,
  BudgetDataSchema,
  BudgetSchema,
  CategorySchema,
  CategoryDataSchema,
  EntrySchema,
} from '@/api/types';
import BaseDialog from './BaseDialog';

type EntryData = {
  category_id?: number;
  month?: string;
  amount?: string;
  default?: boolean;
  rollover?: boolean;
  notes?: string;
};

@Component({
  computed: {
    ...mapGetters('budget', ['budgetLoading', 'findCategory']),
    ...mapGetters('l10n', ['formatCurrency']),
    ...mapState('budget', ['currentBudget', 'displayMonth', 'displayMonthData']),
  },
})
export default class EditBudgetDialog extends BaseDialog {
  /* eslint-disable lines-between-class-members */
  private currentBudget!: BudgetSchema;
  private displayMonth!: Date;
  private displayMonthData!: BudgetDataSchema;
  private findCategory!: (id: number) => CategorySchema[];
  /* eslint-enable lines-between-class-members */

  /** Category Id */
  @Prop({ required: true })
  private categoryId!: number;

  /** Entry Id */
  @Prop({ required: true })
  private entryId!: number | null;

  /** Entry Form Data */
  private entryData: EntryData = {
    amount: '',
    default: false,
    notes: '',
  };

  /** Quick Budget Popup State */
  private popupQuickBudgetOpen = false;

  /** Quick Budget Available */
  private qbAvailable: Money | null = null;

  /** Quick Budget to Zero */
  private qbBudgetZero: Money | null = null;

  /** Quick Budget Last Month Budget */
  private qbLastBudget: Money | null = null;

  /** Quick Budget Last Month Outflows */
  private qbLastOutflow: Money | null = null;

  /** Rollover Type Setting */
  private rolloverType: 'on' | 'off' = 'off';

  /** Category Default Budget */
  get categoryDefault(): Money {
    const { currency } = this.currentBudget;
    const categories = this.findCategory(this.categoryId);

    if (categories && categories.length) {
      return categories[0].default_budget as Money;
    }

    return new Money(0, currency);
  }

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

    // Load Quick-Budget Options
    const { currency } = this.currentBudget;
    const { categoryId, displayMonth, displayMonthData } = this;
    const displayMonthCat = displayMonthData.categories.find(
      (c: CategoryDataSchema) => c.category_id === categoryId,
    );

    this.qbAvailable = displayMonthData.available as Money;
    this.qbBudgetZero = displayMonthCat ? displayMonthCat.outflow as Money : null;

    const lastMonth = addMonths(displayMonth, -1);
    budgetService
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .getBudgetData(this.currentBudget.id!, getMonth(lastMonth) + 1, getYear(lastMonth))
      .then((data) => {
        const lastCat = data.categories.find((c) => c.category_id === categoryId);
        if (lastCat) {
          this.qbLastBudget = lastCat.budget as Money || null;
          this.qbLastOutflow = lastCat.outflow as Money || null;
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => { });

    // Load Current Entry
    if (this.entryId) {
      const { dispatch } = this.$store;
      dispatch('budget/loadBudgetEntry', this.entryId)
        .then((entry: EntrySchema) => {
          this.entryData.amount = entry.amount as string;
          this.entryData.rollover = entry.rollover;
          this.entryData.notes = entry.notes;

          if (this.qbAvailable) {
            this.qbAvailable = this.qbAvailable.add(entry.amount || new Money(0, currency));
          }
        });
    }

    // Auto-Populate Default
    if (this.categoryDefault && this.categoryDefault.ne(0)) {
      this.entryData.amount = this.categoryDefault.amount.toFixed(4).toString();
    }
  }

  /** Update Category Budget */
  onSubmit() {
    const { entryId, entryData } = this;

    // The BudgetEntry requires a budget amount, so set the amount to zero
    // if this is a new entry
    if (!entryId) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      entryData.category_id = this.categoryId;
      entryData.month = format(setDate(this.displayMonth, 1), 'yyyy-MM-dd');
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

  /** Set the Budget Amount from Quick Budget */
  setAmount(amount: Money) {
    this.entryData.amount = amount.amount.toString();
    this.popupQuickBudgetOpen = false;
  }
}
</script>
