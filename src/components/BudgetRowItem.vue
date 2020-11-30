<!-- eslint-disable max-len -->
<template>
  <div class="py-1 flex flex-row items-center justify-end">
    <div class="flex-grow flex items-center justify-between">
      <div class="flex items-center text-sm sm:text-base group">
        <slot>
          <div v-if="false" class="text-transparent group-hover:text-black cursor-move -ml-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
          </div>
          <div v-if="isGroup" class="cursor-pointer" @click="$emit('collapse-click')">
            <svg v-if="collapsed" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </div>
          <div class="cursor-pointer" @click="$emit('name-click')">{{ name }}</div>
          <div v-if="notes" class="ml-2 border-none" v-tooltip="notes">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="document-text w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
        </slot>
      </div>
      <slot name="actions"></slot>
    </div>
    <div class="w-30% lg:w-20% flex-none px-2 text-right text-sm sm:text-base">
      <slot name="budget">{{ formatCurrency(budget) }}</slot>
    </div>
    <div class="hidden lg:block w-30% lg:w-20% flex-none px-2 text-right text-sm sm:text-base">
      <slot name="outflow">{{ formatCurrency(outflow.negate()) }}</slot>
    </div>
    <div class="w-30% lg:w-20% flex-none px-2 text-right text-sm sm:text-base">
      <slot name="balance">{{ formatCurrency(balance) }}</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Money } from '@jadetree/currency';

@Component({
  computed: {
    ...mapGetters('l10n', ['formatCurrency']),
  },
})
export default class BudgetRowItem extends Vue {
  /** Category Balance */
  @Prop({ required: true })
  balance!: Money;

  /** Category Budgeted Amount */
  @Prop({ required: true })
  budget!: Money;

  /** Category Carryover Amount */
  @Prop()
  carryover!: Money | undefined;

  /** Group is Collapsed */
  @Prop({ default: false })
  collapsed!: boolean;

  /** Is a Group */
  @Prop({ default: false })
  isGroup!: boolean;

  /** Category Name */
  @Prop({ required: true })
  name!: string;

  /** Category Notes */
  @Prop()
  notes!: string | undefined;

  /** Category Outflows */
  @Prop({ required: true })
  outflow!: Money;

  /** Category Overspend Amount */
  @Prop()
  overspend!: Money | undefined;

  /** Category Rollover Amount */
  @Prop()
  rollover!: Money | undefined;
}
</script>
