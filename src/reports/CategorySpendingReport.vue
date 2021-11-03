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
    <div class="font-bold">Spending by Category</div>
    <div v-if="parentCategory" class="flex flex-row items-center">
      <jt-button size="small" color="gray" @click="parentCategory=null">All Groups</jt-button>
      <div class="ml-4">
        {{ categoryName(parentCategory) }}
        {{ formatCurrency(total) }}
      </div>
    </div>
    <div v-else>
      All Category Groups: {{ formatCurrency(total || new Money(0, userCurrency)) }}
    </div>
    <div class="relative w-full mt-2">
      <DoughnutChart
        :data="chartjsData"
        :options="chartjsOptions"
        @chart:render="updateChartInstance"
      />
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
import { JtButton, JtSpinner } from '@jadetree/controls';
import { Money } from '@jadetree/currency';
import {
  ActiveElement,
  ArcElement,
  Chart,
  ChartData,
  ChartEvent,
  ChartOptions,
  ChartType,
  DoughnutController,
  Title,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import { Doughnut } from 'vue-chart-3';
import { budgetService, reportsService } from '@/api';
import { CategorySchema, SpendingReportSchema } from '@/api/types';
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
    JtButton,
    JtSpinner,
  },
  computed: {
    ...mapGetters(['userCurrency']),
    ...mapGetters('budget', ['findCategory']),
    ...mapGetters('l10n', ['formatCurrency']),
  },
})
export default class CategorySpendingReport extends Vue {
  /* eslint-disable lines-between-class-members */
  private findCategory!: (id: number) => CategorySchema[];
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

  /** Category List */
  private categories: CategorySchema[] = [];

  /** Chart Instance */
  private chartInstance: Chart | null = null;

  /** Chart Data */
  private chartjsData: ChartData | null = null;

  /** Parent Category */
  private parentCategory: number | null = null;

  /** Report Data */
  private reportData: SpendingReportSchema[] | null = null;

  /** Total Amount */
  private total: Money = new Money(0, 'XXX');

  /** Reload Chart on Budget Change */
  @Watch('budget_id', { immediate: true })
  budgetChanged() {
    this.loadData();
  }

  /** Reload Chart on Parent Id Change */
  @Watch('parentCategory')
  parentCategoryChanged() {
    this.loadChart();
  }

  /** Chart Options */
  get chartjsOptions(): ChartOptions {
    return {
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<ChartType>): string => {
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
      onClick: (evt: ChartEvent, elements: ActiveElement[]) => this.chartClicked(evt, elements),
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

  /** Chart Click Handler */
  chartClicked(evt: ChartEvent, elements: ActiveElement[]): void {
    if (this.parentCategory === null) {
      const groupIndex = elements.find((e) => (e.index !== undefined));
      if (groupIndex !== undefined) {
        this.parentCategory = this.categories[groupIndex.index].id || null;
      }
    }
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
      const categories = this.reportData.map((e) => this.findCategory(e.category_id || 0));
      let labels: string[] = [];
      let amounts: Money[] = [];

      if (this.parentCategory === null) {
        const parents = [
          ...new Set(categories.map((e) => e[e.length - 1].id)),
        ].map((id) => this.findCategory(id || 0)[0]);

        labels = parents.map((e) => budgetService.translateName(e.name || ''));

        // This was checked in the first part of the outer if statement
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        amounts = parents.map((parent) => this.reportData!
          .filter((e) => {
            const cat = this.findCategory(e.category_id || 0);
            return cat[cat.length - 1].id === parent.id;
          })
          .map((e) => (e.amount instanceof Money
            ? e.amount
            : new Money(e.amount, e.currency)
          ))
          .reduce((cur, acc) => acc.add(cur), new Money(0, this.userCurrency)));

        this.categories = parents;
      } else {
        const children = categories.filter(
          (e) => e[0].parent_id === this.parentCategory,
        );
        labels = children.map((e) => budgetService.translateName(e[0].name || ''));
        amounts = this.reportData
          .filter((e) => {
            const cat = this.findCategory(e.category_id || 0);
            return cat[0].parent_id === this.parentCategory;
          })
          .map((e) => (e.amount instanceof Money
            ? e.amount
            : new Money(e.amount, e.currency)
          ));

        this.categories = children.map((e) => e[0]);
      }

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

    reportsService.spendingByCategory(this.budget_id).then((report) => {
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

  updateChartInstance(chart: Chart) {
    this.chartInstance = chart;
  }
}
</script>
