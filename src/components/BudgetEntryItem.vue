<!-- eslint-disable max-len -->
<template>
  <budget-row-item v-bind="{ balance, budget, collapsed, isGroup, name, notes, outflow }" v-on="$listeners" draggable>
    <template v-slot:budget>
      <div class="flex items-center justify-between group">
        <div v-if="entryNotes" class="ml-2" v-tooltip="entryNotes">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="document-text w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <div class="flex-grow min-h-4">
          <button
            class="border-none focus:outline-none active:outline-none"
            :class="{
                'md:hidden md:group-hover:inline-block text-gray-600':!budget.ne(0)
              }"
            @click.self="$emit('budget-click')"
          >
            {{ budget.ne(0) ? formatCurrency(budget) : formatCurrency(defaultBudget || 0, budget.currency) }}
          </button>
        </div>
      </div>
    </template>
    <template v-slot:outflow>
      <span v-tooltip="numTransactions ? `${numTransactions} Transactions` : ''">
        {{ !numTransactions ? '' : formatCurrency(outflow.negate()) }}
      </span>
    </template>
    <template v-slot:balance>
      <button
        v-if="balance.lt(0)"
        class="inline-flex items-center border-none bg-red-200 text-red-700 rounded-full px-2 focus:outline-none active:outline-none"
        v-tooltip="rollover
          ? 'This will be subtracted from this category balance next month. Click for more options.'
          : 'This will be subtracted from your Available to Budget next month. Click for more options.'
        "
        @click.self="$emit('rollover-click')">
        {{ formatCurrency(balance) }}
        <svg v-if="rollover" viewBox="0 0 20 20" fill="currentColor" class="inline ml-1 arrow-circle-right w-4 h-4"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd"></path></svg>
      </button>
      <span v-else>{{ formatCurrency(balance) }}</span>
    </template>
  </budget-row-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Money } from '@jadetree/currency';

import BudgetRowItem from './BudgetRowItem.vue';

@Component({
  components: { BudgetRowItem },
  computed: {
    ...mapGetters('l10n', ['formatCurrency']),
  },
})
export default class BudgetEntryItem extends Vue {
  /** Category Balance */
  @Prop({ required: true })
  balance!: Money;

  /** Category Budgeted Amount */
  @Prop({ required: true })
  budget!: Money;

  /** Category Carryover Amount */
  @Prop({ required: true })
  carryover!: Money;

  /** Group is Collapsed */
  @Prop({ default: false })
  collapsed!: boolean;

  /** Category Default Budget */
  @Prop({ required: true })
  defaultBudget!: Money;

  /** Budget Entry Notes */
  @Prop()
  entryNotes!: string | undefined;

  /** Is a Group */
  @Prop({ default: false })
  isGroup!: boolean;

  /** Category Name */
  @Prop({ required: true })
  name!: string;

  /** Category Notes */
  @Prop()
  notes!: string | undefined;

  /** Number of Transactions */
  @Prop()
  numTransactions!: number | undefined;

  /** Category Outflows */
  @Prop({ required: true })
  outflow!: Money;

  /** Category Overspend Amount */
  @Prop({ required: true })
  overspend!: Money;

  /** Budget Rollover Amount */
  @Prop({ required: true })
  rollover!: Money;
}
</script>
