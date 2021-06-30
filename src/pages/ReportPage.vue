<!-- eslint-disable max-len -->
<template>
  <jt-sidebar-layout>
    <template v-slot:default>
      <div class="flex flex-col items-stretch justify-start h-full">
        <div class="hidden md:block sticky top-0 w-full h-2 bg-gray-100 z-10"><!-- mask space above totals header --></div>
        <div class="flex flex-col items-start p-2 bg-white border-t border-gray-800 md:border-gray-400 md:border md:rounded">
          <net-worth-report v-if="reportType === 'networth'" :stacked="true" />
          <category-spending-report v-if="reportType === 'categories'" :budget_id="currentBudget ? currentBudget.id : null" />
          <payee-spending-report v-if="reportType === 'payees'" :budget_id="currentBudget ? currentBudget.id : null" />
        </div>
      </div>
    </template>
    <template v-slot:sidebar>
      <div class="flex flex-col items-start justify-start w-full">
        <div class="font-bold">Report Type</div>
        <jt-select
          id="reportSelect"
          :class="['w-full']"
          :clearButton="false"
          :options="reportTypes"
          v-model="reportType"
        />
      </div>
    </template>
  </jt-sidebar-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { BudgetSchema } from '@/api/types';
import NetWorthReport from '../reports/NetWorthReport.vue';
import CategorySpendingReport from '../reports/CategorySpendingReport.vue';
import PayeeSpendingReport from '../reports/PayeeSpendingReport.vue';
import JtSidebarLayout from '../layouts/JtSidebarLayout.vue';

type ReportListOption = {
  value: string;
  label: string;
}

@Component({
  components: {
    JtSidebarLayout,
    CategorySpendingReport,
    NetWorthReport,
    PayeeSpendingReport,
  },
  computed: {
    ...mapState('budget', ['currentBudget']),
    ...mapGetters(['userCurrency']),
  },
})
export default class ReportPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private currentBudget!: BudgetSchema | undefined;
  private userCurrency!: string | undefined;
  /* eslint-enable lines-between-class-members */

  /** Current Report Type */
  private reportType: string | null = 'networth';

  /** List of Report Types */
  get reportTypes(): ReportListOption[] {
    return [
      {
        value: 'networth',
        label: 'Net Worth',
      },
      {
        value: 'categories',
        label: 'Spending by Category',
      },
      {
        value: 'payees',
        label: 'Spending by Payee',
      },
    ];
  }
}
</script>

<style>
#reportSelect {
  @apply .font-medium;
}
</style>
