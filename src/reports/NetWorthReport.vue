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
    <div class="font-bold">Net Worth over Time</div>
    <div class="relative w-full mt-2">
      <BarChart :data="chartjsData" :options="chartjsOptions" />
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { reportsService } from '@/api';
import { JtSpinner } from '@jadetree/controls';
import { Money } from '@jadetree/currency';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartData,
  ChartDataset,
  ChartOptions,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { format } from 'date-fns';
import { Bar } from 'vue-chart-3';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
);

@Component({
  components: {
    BarChart: Bar,
    JtSpinner,
  },
  computed: {
    ...mapGetters(['userCurrency']),
    ...mapGetters('l10n', ['formatCurrency']),
  },
})
export default class NetWorthReport extends Vue {
  /* eslint-disable lines-between-class-members */
  private formatCurrency!: (money: Money) => string;
  private userCurrency!: string | undefined;
  /* eslint-enable lines-between-class-members */

  /** Chart Aspect Ratio */
  @Prop({ default: 1.667 })
  private aspectRatio!: number;

  /** Asset Bar Background Color */
  @Prop({ default: 'rgba(54, 162, 235, 0.2)' })
  private assetBackground!: string;

  /** Asset Bar Border Color */
  @Prop({ default: 'rgb(54, 162, 235)' })
  private assetBorder!: string;

  /** Liability Bar Background Color */
  @Prop({ default: 'rgba(255, 99, 132, 0.2)' })
  private liabilityBackground!: string;

  /** Liability Bar Border Color */
  @Prop({ default: 'rgb(255, 99, 132)' })
  private liabilityBorder!: string;

  /** Net Worth Line Border Color */
  @Prop({ default: 'rgb(75, 192, 192)' })
  private netWorthBorder!: string;

  /** Stack Bar Chart */
  @Prop({ default: false })
  private stacked!: boolean;

  /** API Error */
  private error = '';

  /** Loading Flag */
  private loading = false;

  /** Loaded Flag */
  private loaded = false;

  /** Chart Data */
  private chartjsData: ChartData | null = null;

  mounted() {
    this.loadData();
  }

  /** Chart Options */
  get chartjsOptions(): ChartOptions {
    return {
      plugins: {
        tooltip: {
          callbacks: {
            label: (context): string => {
              const label = `${context.dataset.label}: ` || '';
              return label + this.formatCurrency(
                new Money(context.parsed.y, this.userCurrency),
              );
            },
          },
        },
      },
      aspectRatio: this.aspectRatio,
      maintainAspectRatio: true,
      responsive: true,
      scales: {
        x: {
          stacked: this.stacked,
        },
        y: {
          stacked: this.stacked,
          ticks: {
            callback: (tickValue: string | number): string => this.formatCurrency(
              new Money(tickValue, this.userCurrency),
            ),
          },
        },
      },
    };
  }

  /** Load the Report Data */
  loadData() {
    this.error = '';
    this.loading = true;
    this.loaded = false;

    reportsService.netWorth().then((report) => {
      const labels = report.map((p) => format(new Date(p.month), 'yyyy-MM'));

      /* eslint-disable object-curly-newline */
      const dsA: ChartDataset<'bar'> = { label: 'Assets', type: 'bar', data: [], borderWidth: 1 };
      const dsL: ChartDataset<'bar'> = { label: 'Liabilities', type: 'bar', data: [], borderWidth: 1 };
      const dsN: ChartDataset<'line'> = { label: 'Net Worth', type: 'line', data: [] };
      /* eslint-enable object-curly-newline */

      dsA.data = report.map((p) => new Money(p.assets).amount.toNumber());
      dsA.backgroundColor = Array(labels.length).fill(this.assetBackground);
      dsA.borderColor = Array(labels.length).fill(this.assetBorder);

      dsL.data = report.map((p) => new Money(p.liabilities).amount.neg().toNumber());
      dsL.backgroundColor = Array(labels.length).fill(this.liabilityBackground);
      dsL.borderColor = Array(labels.length).fill(this.liabilityBorder);

      dsN.data = report.map((p) => new Money(p.assets).subtract(new Money(p.liabilities))
        .amount.toNumber());
      dsN.borderColor = this.netWorthBorder;

      this.chartjsData = {
        labels,
        datasets: [dsA, dsL, dsN],
      };

      this.loading = false;
      this.loaded = true;
    }).catch((error) => {
      this.loading = false;
      this.error = error;
    });
  }
}
</script>
