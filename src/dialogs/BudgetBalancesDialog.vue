<template>
  <jt-dialog title="Budget Balances">
    <div class="flex flex-col items-stretch p-4">
      <div class="w-full flex flex-col items-start leading-loose">
        <div class="flex items-center justify-end w-full">
          <span class="flex-grow">Remaining Last Month</span>
          <div class="font-medium text-right">
            {{ displayMonthData ? formatCurrency(displayMonthData.last_available) : '' }}
          </div>
        </div>
        <div class="flex items-center justify-end w-full">
          <span class="flex-grow">Overspent Last Month</span>
          <div class="font-medium text-right">
            {{ displayMonthData ? formatCurrency(displayMonthData.last_overspent) : '' }}
          </div>
        </div>
        <div class="flex items-center justify-end w-full">
          <span class="flex-grow">Income</span>
          <div class="font-medium text-right">
            {{ displayMonthData ? formatCurrency(displayMonthData.income) : '' }}
          </div>
        </div>
        <div class="flex items-center justify-end w-full">
          <span class="flex-grow">Budgeted</span>
          <div class="font-medium text-right">
            {{ displayMonthData ? formatCurrency(displayMonthData.budgeted.negate()) : '' }}
          </div>
        </div>
        <div class="flex items-center justify-end w-full mt-2" :class="{
            'text-red-700': displayMonthData && displayMonthData.available.lt(0),
            'text-blue-700': displayMonthData && displayMonthData.available.gt(0),
          }"
        >
          <span class="text-lg font-medium flex-grow">Available</span>
          <div class="text-lg font-medium text-right">
            {{ displayMonthData ? formatCurrency(displayMonthData.available) : '' }}
          </div>
        </div>
      </div>
    </div>
  </jt-dialog>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import BaseDialog from './BaseDialog';

@Component({
  computed: {
    ...mapState('budget', ['displayMonthData']),
    ...mapGetters('l10n', ['formatCurrency']),
  },
})
export default class EditBudgetDialog extends BaseDialog {
}
</script>
