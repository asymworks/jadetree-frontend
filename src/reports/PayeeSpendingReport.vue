<template>
  <div v-if="loading" class="flex flex-col items-center w-full">
    <div class="text-lg font-medium">Loading Report Data</div>
    <jt-spinner class="w-12 h-12 mt-4" />
  </div>
  <div v-else-if="error" class="flex flex-col items-center w-full">
    <div class="text-lg text-red-600 font-bold">Error Loading Report</div>
    <hr class="w-full my-3" />
    <div class="w-full text-justify" v-text="error" />
  </div>
  <div v-else class="flex flex-col items-center w-full">
    <div class="font-bold">Spending by Payee</div>
    <div>All Payees: {{ formatCurrency(total || new Money(0, userCurrency)) }}</div>
    <div class="relative w-full mt-2">
      <DoughnutChart :data="chartjsData" :options="chartjsOptions" />
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import {
  Component,
  Prop,
  Vue,
  Watch,
} from 'vue-property-decorator';
import { reportsService } from '@/api';
import { PayeeSchema, SpendingReportSchema } from '@/api/types';
import { JtSpinner } from '@jadetree/controls';
import { Money } from '@jadetree/currency';
import {
  ArcElement,
  Chart,
  ChartData,
  ChartOptions,
  DoughnutController,
  Title,
  Tooltip,
} from 'chart.js';
import { Doughnut } from 'vue-chart-3';
import { tolVibrant } from '../util/colorscheme';

Chart.register(
  ArcElement,
  DoughnutController,
  Title,
  Tooltip,
);

@Component({
  components: {
    DoughnutChart: Doughnut,
    JtSpinner,
  },
  computed: {
    ...mapGetters(['userCurrency']),
    ...mapGetters('l10n', ['formatCurrency']),
    ...mapGetters('payee', ['findPayee']),
  },
})
export default class PayeeSpendingReport extends Vue {
  /* eslint-disable lines-between-class-members */
  private findPayee!: (id: number) => PayeeSchema;
  private formatCurrency!: (money: Money) => string;
  private userCurrency!: string | undefined;
  /* eslint-enable lines-between-class-members */

  /** Chart Aspect Ratio */
  @Prop({ default: 1.667 })
  private aspectRatio!: number;

  /** Budget Id */
  @Prop({ default: null })
  private budget_id!: number | null;

  /** Maximum Number of Pie Slices */
  @Prop({ default: 25 })
  private maxSlices!: number;

  /** API Error */
  private error = '';

  /** Loading Flag */
  private loading = false;

  /** Loaded Flag */
  private loaded = false;

  /** Chart Data */
  private chartjsData: ChartData | null = null;

  /** Report Data */
  private reportData: SpendingReportSchema[] | null = null;

  /** Total Spending Amount */
  private total: Money | null = null;

  /** Reload Chart on Budget Change */
  @Watch('budget_id', { immediate: true })
  budgetChanged() {
    this.loadData();
  }

  /** Reload Chart on Max Slices Change */
  @Watch('maxSlices', { immediate: true })
  maxSlicesChanged() {
    this.loadChart();
  }

  /** Chart Options */
  get chartjsOptions(): ChartOptions {
    return {
      plugins: {
        tooltip: {
          callbacks: {
            label: (context): string => {
              const label = `${context.label}: ` || '';
              return label + this.formatCurrency(
                new Money(context.parsed, this.userCurrency),
              );
            },
          },
        },
      },
      aspectRatio: this.aspectRatio,
      maintainAspectRatio: true,
      responsive: true,
    };
  }

  /** Load the Chart Data */
  loadChart() {
    if (!this.reportData) {
      this.chartjsData = {
        labels: [],
        datasets: [],
      };
      this.total = new Money(0, this.userCurrency);
    } else {
      const labels = this.reportData.map((e) => this.payeeName(e.payee_id || 0));
      const amounts = this.reportData.map((e) => (e.amount instanceof Money
        ? e.amount
        : new Money(e.amount, e.currency)
      ));

      if (labels.length > this.maxSlices) {
        this.chartjsData = {
          labels: [...labels.slice(0, this.maxSlices - 2), 'Others'],
          datasets: [{
            data: [
              ...amounts.slice(0, this.maxSlices - 2),
              amounts
                .slice(this.maxSlices - 1)
                .reduce((el, acc) => acc.add(el), new Money(0, this.userCurrency)),
            ].map((m) => m.amount.toNumber()),
            backgroundColor: tolVibrant(this.maxSlices),
          }],
        };
      } else {
        this.chartjsData = {
          labels,
          datasets: [{
            data: amounts.map((m) => m.amount.toNumber()),
            backgroundColor: tolVibrant(labels.length),
          }],
        };
      }

      this.total = amounts.reduce((acc, cur) => acc.add(cur), new Money(0, this.userCurrency));
    }
  }

  /** Load the Report Data */
  loadData() {
    this.error = '';
    this.loading = true;
    this.loaded = false;

    if (!this.budget_id) {
      this.loading = false;
      this.error = 'No budget is currently loaded';
      return;
    }

    reportsService.spendingByPayee(this.budget_id).then((report) => {
      report.sort((a, b) => {
        const m1 = a.amount instanceof Money ? a.amount : new Money(a.amount, a.currency);
        const m2 = b.amount instanceof Money ? b.amount : new Money(b.amount, b.currency);
        return m2.cmp(m1);
      });

      this.loading = false;
      this.loaded = true;
      this.reportData = report;

      this.loadChart();
    }).catch((error) => {
      this.loading = false;
      this.error = error;
    });
  }

  /** Look Up Payee Name */
  payeeName(payeeId: number): string {
    const payee = this.findPayee(payeeId);
    if (!payee || !payee.name) return `<Payee ${payeeId}>`;
    return payee.name;
  }
}
</script>
