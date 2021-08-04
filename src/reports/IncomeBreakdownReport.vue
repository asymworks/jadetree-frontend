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
    <div class="font-bold">Income Breakdown</div>
    <div class="relative w-full mt-2">
      <SankeyChart
        :data="chartjsData"
        :options="chartjsOptions"
        @chart:render="updateChartInstance"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex';
import {
  Component,
  Prop,
  Vue,
  Watch,
} from 'vue-property-decorator';
import { budgetService, reportsService } from '@/api';
import { BudgetSchema, CategorySchema, IncomeAllocationReportSchema } from '@/api/types';
import { JtButton, JtSpinner } from '@jadetree/controls';
import { Money } from '@jadetree/currency';
import {
  Chart,
  ChartData,
  ChartOptions,
  ChartType,
  SankeyControllerDatasetOptions,
  SankeyDataPoint,
  Title,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import { Flow, SankeyController } from 'chartjs-chart-sankey';
import { defineChartComponent } from 'vue-chart-3';
import { tolVibrant } from '../util/colorscheme';

type FlowRecord = {
  from: string;
  to: string;
  flow: number;
};

Chart.register(
  Flow,
  SankeyController,
  Title,
  Tooltip,
);

const Sankey = defineChartComponent('SankeyChart', 'sankey');

@Component({
  components: {
    SankeyChart: Sankey,
    JtButton,
    JtSpinner,
  },
  computed: {
    ...mapGetters(['userCurrency']),
    ...mapGetters('budget', ['findCategory']),
    ...mapGetters('l10n', ['formatCurrency']),
    ...mapState('budget', ['currentBudget']),
  },
})
export default class IncomeBreakdownReport extends Vue {
  /* eslint-disable lines-between-class-members */
  private currentBudget!: BudgetSchema | null;
  private findCategory!: (id: number) => CategorySchema[];
  private formatCurrency!: (money: Money) => string;
  private userCurrency!: string | undefined;
  /* eslint-enable lines-between-class-members */

  /** Chart Aspect Ratio */
  @Prop({ default: 0.667 })
  private aspectRatio!: number;

  /** Budget Id */
  @Prop({ default: null })
  private budget_id!: number | null;

  /** API Error */
  private error = '';

  /** Loading Flag */
  private loading = false;

  /** Loaded Flag */
  private loaded = false;

  /** Category List */
  private categories: CategorySchema[] = [];

  /** Chart Instance */
  private chartInstance: Chart | null = null;

  /** Chart Data */
  private chartjsData: ChartData | null = null;

  /** Chart Colors */
  private colors: { [key: string]: string } = {};

  /** Report Data */
  private reportData: IncomeAllocationReportSchema | null = null;

  /** Reload Chart on Budget Change */
  @Watch('budget_id', { immediate: true })
  budgetChanged() {
    this.loadData();
  }

  /** Chart Options */
  get chartjsOptions(): ChartOptions {
    return {
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<ChartType>): string => {
              const item = context.dataset.data[context.dataIndex] as SankeyDataPoint;
              const { labels } = (context.dataset as SankeyControllerDatasetOptions);
              if (item) {
                const label = `${(labels && labels[item.from]) || item.from} -> ${(labels && labels[item.to]) || item.to}: `;
                return label + this.formatCurrency(
                  new Money(item.flow, this.userCurrency),
                );
              }
              return '';
            },
          },
        },
      },
      aspectRatio: 0.75,
      maintainAspectRatio: true,
      responsive: true,
    };
  }

  /** Get the Full Category Name */
  categoryName(categoryId: number): string {
    const categories = this.findCategory(categoryId);

    if (!categories || categories.length === 0) return '';
    if (categories.length === 1) {
      return budgetService.translateName(categories[0].name || '');
    }

    return categories.map(
      (c) => budgetService.translateName(c.name || ''),
    ).reverse().join(' : ');
  }

  /** Load the Chart Data */
  loadChart() {
    if (!this.reportData || !this.currentBudget || !this.currentBudget.categories) {
      this.chartjsData = {
        labels: [],
        datasets: [],
      };
    } else {
      const unspent: Money = this.reportData.unspent as Money;
      const spent: Money = this.reportData.spent as Money;
      const hidden: Money = new Money(0, this.userCurrency);
      const system: Money = new Money(0, this.userCurrency);
      const labels: { [key: string]: string | undefined } = {
        Income: `Income\n${this.formatCurrency(this.reportData.income as Money)}`,
        Unspent: `Unspent\n${this.formatCurrency(this.reportData.unspent as Money)}`,
        Spent: `Spent\n${this.formatCurrency(this.reportData.spent as Money)}`,
      };

      const groups: FlowRecord[] = this.currentBudget.categories
        .filter((c) => !c.system && !c.hidden)
        .map((c) => ({ from: 'Spent', to: `__${c.id}`, flow: 0 }));

      this.colors = {
        Income: 'slategray',
        Spent: 'slategray',
        Unspent: 'darkblue',
      };

      const colors = tolVibrant(groups.length);
      groups.forEach((g, idx) => {
        this.colors[g.to] = colors[idx];
      });

      console.log(this.colors);

      const cats: FlowRecord[] = [];
      this.reportData.categories.forEach((cd) => {
        const amount = cd.amount as Money;
        const catData: CategorySchema[] = this.findCategory(cd.category_id || -1);

        if (catData.length === 2) {
          if (catData[0].hidden || catData[1].hidden) {
            hidden.add(amount);
          } else if (catData[0].system || catData[1].system) {
            system.add(amount);
          } else {
            const parentRec: FlowRecord | undefined = groups.find(
              (e) => (e.to === `__${catData[1].id}`),
            );
            if (parentRec) {
              labels[`__${catData[0].id}`] = catData[0].name;
              labels[`__${catData[1].id}`] = catData[1].name;

              parentRec.flow += amount.amount.toNumber();
              cats.push({
                from: parentRec.to,
                to: `__${catData[0].id}`,
                flow: amount.amount.toNumber(),
              });

              this.colors[`__${catData[0].id}`] = this.colors[`__${catData[1].id}`];
            }
          }
        }

        if (hidden.gt(0)) {
          groups.push({
            from: 'Spent',
            to: 'Hidden Categories',
            flow: hidden.amount.toNumber(),
          });
        }

        if (system.gt(0)) {
          groups.push({
            from: 'Spent',
            to: 'System Categories',
            flow: system.amount.toNumber(),
          });
        }
      });

      this.chartjsData = {
        labels: [],
        datasets: [{
          data: [
            { from: 'Income', to: 'Spent', flow: spent.amount.toNumber() },
            { from: 'Income', to: 'Unspent', flow: unspent.amount.toNumber() },
            ...groups,
            ...cats,
          ],
          labels,
          borderWidth: 0,
          colorFrom: (c) => this.colors[c.dataset.data[c.dataIndex].from] || 'gray',
          colorTo: (c) => this.colors[c.dataset.data[c.dataIndex].to] || 'gray',
          colorMode: 'gradient',
        }],
      };
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

    reportsService.incomeAllocation(this.budget_id).then((report) => {
      this.loading = false;
      this.loaded = true;
      this.reportData = report;

      this.loadChart();
    }).catch((error) => {
      this.loading = false;
      this.error = error;
    });
  }

  updateChartInstance(chart: Chart) {
    this.chartInstance = chart;
  }
}
</script>
